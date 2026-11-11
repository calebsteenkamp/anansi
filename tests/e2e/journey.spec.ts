import {test,expect,type Page} from "@playwright/test";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {fixtures} from "../support/supabase";
async function login(page:Page,email:string,password:string){await page.goto("/sign-in");await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();}
for(const recovery of [false,true])test("provided Phrase 1 complete two-user journey"+(recovery?" with failure and explicit recovery":""),async({browser})=>{
 test.setTimeout(240000);const f=await fixtures(),a=await browser.newContext(),b=await browser.newContext();
 try{
  expect((await f.sessions[1].from("profiles").update({preferred_language:"en",spoken_languages:["xh","en"]}).eq("id",f.ids[1])).error).toBeNull();
  const reference=await readFile("data/Phrase 1/isiXhosa.txt","utf8"),english=await readFile("data/Phrase 1/English.txt","utf8"),intent=await readFile("data/Phrase 1/Intent.txt","utf8");
  const p=await a.newPage();await login(p,f.emails[0],f.password);await p.goto("/stories/new");
  await p.getByLabel("Upload audio").setInputFiles("data/Phrase 1/Phrase 1.mp3");await p.getByRole("checkbox",{name:/I own this audio/}).check();
  const saved=p.waitForResponse(r=>/\/api\/stories\/drafts\/[^/]+\/finalize$/.test(r.url())&&r.request().method()==="POST");await p.getByRole("button",{name:"Save private draft"}).click();const response=await saved;expect(response.status()).toBe(201);const {id}=await response.json();
  await expect(p.getByRole("heading",{name:"Transcript editor"})).toBeVisible();await expect(p.getByText(/^Provider: mock\./)).toBeVisible();
  if(recovery)await p.route("**/api/stories/"+id+"/transcribe",route=>route.fulfill({status:502,contentType:"application/json",body:JSON.stringify({error:{message:"Simulated transcription failure; paste reference."}})}),{times:1});
  await p.getByRole("checkbox",{name:/I have permission to send this audio/}).check();await p.getByRole("button",{name:"Transcribe audio",exact:true}).click();
  await expect(p.getByTestId("transcript-message")).toContainText(recovery?"Simulated transcription failure":"Transcription saved");
  await p.getByLabel("Paste or type isiXhosa transcript",{exact:true}).fill(reference);await p.getByRole("button",{name:"Use pasted transcript",exact:true}).click();
  const title="M9 Phrase 1 "+randomUUID();await p.getByLabel("Story title",{exact:true}).fill(title);await p.getByRole("button",{name:"Save transcript",exact:true}).click();await expect(p.getByTestId("transcript-message")).toContainText("Transcript saved.");await p.reload();await expect(p.getByLabel("Story title",{exact:true})).toHaveValue(title);
  let posts=0;
  if(recovery)await p.route("**/api/stories/"+id+"/translation",async route=>{if(route.request().method()==="POST"&&++posts===2){await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:{message:"Simulated interrupted translation."}})});return;}await route.continue();});
  await expect(p.getByText("Translation provider: mock.",{exact:false})).toBeVisible();await p.getByRole("checkbox",{name:/I have permission to send this transcript text for translation/}).check();await p.getByRole("button",{name:"Publish story",exact:true}).click();
  if(recovery){await expect(p.getByTestId("translation-message")).toContainText("Simulated interrupted");await expect(p.getByTestId("translation-progress")).toContainText("1 / 2");await p.reload();expect(posts).toBe(2);await p.getByRole("checkbox",{name:/I have permission to send this transcript text to/}).check();await p.getByRole("button",{name:"Continue translation",exact:true}).click();}
  await expect(p.getByTestId("translation-message")).toContainText("English translation complete");
  const q=await b.newPage();await login(q,f.emails[1],f.password);await q.goto("/stories/"+id);await expect(q.getByLabel("Reading language",{exact:true})).toHaveValue("en");
  // Native playback of the supplied audio; human audibility remains a separate gate.
  const audio=q.locator("audio");await expect(audio).toHaveCount(1);await audio.evaluate(async(n:HTMLAudioElement)=>{await n.play();});await expect.poll(()=>audio.evaluate((n:HTMLAudioElement)=>n.currentTime)).toBeGreaterThan(0);await audio.evaluate((n:HTMLAudioElement)=>n.pause());
  await q.getByLabel("Meaning confidence rating",{exact:true}).selectOption("4");await q.getByLabel("Review decision",{exact:true}).selectOption("approve");await q.getByLabel("Intent comment",{exact:true}).fill("Fixture reference: "+intent);await q.getByLabel("Correction 1",{exact:true}).fill(english.trim().split(/(?<=\.)\s+/)[0]);await q.getByRole("button",{name:"Save review",exact:true}).click();await expect(q.getByTestId("review-message")).toHaveText("Review saved.");await expect(q.getByTestId("confidence-badge")).toHaveText("Confident");
  await q.getByRole("checkbox",{name:"Show latest community corrections",exact:true}).check();await expect(q.locator("span[lang=en]").filter({hasText:english.trim().split(/(?<=\.)\s+/)[0]})).toBeVisible();await q.reload();await expect(q.getByRole("checkbox",{name:"Show latest community corrections",exact:true})).not.toBeChecked();
  await q.getByRole("link",{name:"Discover stories",exact:true}).click();await q.getByLabel("Title search",{exact:true}).fill(title);await q.getByLabel("Story language",{exact:true}).selectOption("xh");await q.getByRole("button",{name:"Apply filters",exact:true}).click();const card=q.getByTestId("discovery-card-"+id);await expect(card).toBeVisible();await card.getByRole("button",{name:"Follow author",exact:true}).click();await expect(q.getByTestId("discovery-message")).toContainText("Following updated");await q.getByLabel("Feed",{exact:true}).selectOption("following");await q.getByRole("button",{name:"Apply filters",exact:true}).click();await expect(card).toBeVisible();await card.getByRole("button",{name:"Repost in Anansi",exact:true}).click();await expect(card.getByRole("button",{name:"Remove repost",exact:true})).toBeVisible();await card.getByRole("link",{name:"Story link",exact:true}).click();await expect(q.getByRole("heading",{name:"Published transcript",exact:true})).toBeVisible();
 }finally{
  await a.close();await b.close();const rows=await f.admin.from("stories").select("audio_path").in("author_id",f.ids).not("audio_path","is",null);const paths=rows.data?.map(r=>r.audio_path)??[];const removed=paths.length?await f.admin.storage.from("story-audio").remove(paths):null;await f.cleanup();expect(rows.error).toBeNull();expect(removed?.error??null).toBeNull();
 }
});
