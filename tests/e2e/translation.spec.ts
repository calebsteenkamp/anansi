import {test,expect,type Page} from "@playwright/test";
import {randomUUID} from "node:crypto";
import {fixtures} from "../support/supabase";
import {translationPreflight} from "../support/translation-project";
async function login(page:Page,email:string,password:string){await page.goto("/sign-in");await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();}
async function published(f:Awaited<ReturnType<typeof fixtures>>){
 const id=randomUUID();expect((await f.admin.from("stories").insert({id,author_id:f.ids[0],kind:"original",language:"xh",title:"T5 browser fixture",audio_path:f.ids[0]+"/"+id+"/original.wav",audio_duration_ms:1000,status:"draft"})).error).toBeNull();
 expect((await f.sessions[0].rpc("m4_save_transcript",{p_story:id,p_revision:0,p_title:"T5 browser fixture",p_segments:[{id:randomUUID(),text:"Molo."},{id:randomUUID(),text:"Enkosi."}]})).error).toBeNull();
 const p=await f.admin.rpc("m4_publish",{p_story:id,p_actor:f.ids[0],p_revision:1,p_provider:"mock",p_model:"synthetic-v1"});expect(p.error).toBeNull();return {id,linked:p.data.translation_id as string};
}
test("reload never processes; interruption preserves segments and Continue resumes only unfinished work",async({browser})=>{
 await translationPreflight(true);const f=await fixtures(),context=await browser.newContext();
 try{
  const {id,linked}=await published(f),page=await context.newPage();await login(page,f.emails[0],f.password);
  let posts=0;await page.route("**/api/stories/"+id+"/translation",async route=>{if(route.request().method()==="POST"){posts++;if(posts===2){await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:{message:"Simulated interrupted connection."}})});return;}}await route.continue();});
  await page.goto("/stories/"+id);await expect(page.getByTestId("translation-progress")).toContainText("0 / 2");await expect(page.getByTestId("translation-provenance")).toContainText("Synthetic mock");expect(posts).toBe(0);
  await page.getByRole("checkbox",{name:/I have permission to send this transcript text to/}).check();await page.getByRole("button",{name:"Continue translation",exact:true}).click();await expect(page.getByTestId("translation-message")).toContainText("Simulated interrupted");await expect(page.getByTestId("translation-progress")).toContainText("1 / 2");
  await page.reload();await expect(page.getByTestId("translation-progress")).toContainText("1 / 2");expect(posts).toBe(2);
  const before=await f.admin.from("translation_tasks").select("attempts").eq("translation_story_id",linked);expect(before.data?.map(r=>r.attempts).sort()).toEqual([0,1]);
  await page.getByRole("checkbox",{name:/I have permission to send this transcript text to/}).check();await page.getByRole("button",{name:"Continue translation",exact:true}).click();await expect(page.getByTestId("translation-message")).toContainText("English translation complete");await expect(page.getByTestId("translation-progress")).toContainText("2 / 2");expect(posts).toBe(3);
  await page.reload();await expect(page.getByTestId("translation-progress")).toContainText("2 / 2");await page.getByRole("button",{name:"Refresh translation progress"}).click();await expect(page.getByTestId("translation-message")).toContainText("no provider request");expect(posts).toBe(3);
  const after=await f.admin.from("translation_tasks").select("attempts").eq("translation_story_id",linked);expect(after.data).toEqual([{attempts:1},{attempts:1}]);
 }finally{await context.close();await f.cleanup();}
});
test("explicit Retry preserves completed results; another account sees completed English without mutation controls",async({browser})=>{
 await translationPreflight(true);const f=await fixtures(),a=await browser.newContext(),b=await browser.newContext();
 try{
  const {id,linked}=await published(f);
  const claim=()=>f.admin.rpc("m5_claim_translation",{p_story:id,p_actor:f.ids[0],p_consent:true});
  const first=await claim();expect(first.error).toBeNull();expect((await f.admin.rpc("m5_finish_translation",{p_story:id,p_actor:f.ids[0],p_task:first.data.task_id,p_token:first.data.token,p_text:"Saved first English.",p_error:null})).error).toBeNull();
  const second=await claim();expect(second.error).toBeNull();expect((await f.admin.rpc("m5_finish_translation",{p_story:id,p_actor:f.ids[0],p_task:second.data.task_id,p_token:second.data.token,p_text:null,p_error:"quota"})).error).toBeNull();
  const page=await a.newPage();await login(page,f.emails[0],f.password);await page.goto("/stories/"+id);await expect(page.getByTestId("translation-progress")).toContainText("translation_failed");await expect(page.getByTestId("translation-provenance")).toContainText("Synthetic mock");
  const other=await b.newPage();await login(other,f.emails[1],f.password);await other.goto("/stories/"+id);await expect(other.getByText("The English translation is not available yet.")).toBeVisible();
  await page.getByRole("checkbox",{name:/I have permission to send this transcript text to/}).check();await page.getByRole("button",{name:"Retry translation",exact:true}).click();await expect(page.getByTestId("translation-message")).toContainText("English translation complete");await page.getByLabel("Reading language",{exact:true}).selectOption("en");await expect(page.getByText("Saved first English.",{exact:true})).toBeVisible();
  await other.reload();await expect(other.getByTestId("translation-progress")).toContainText("2 / 2");await expect(other.getByRole("button",{name:/Continue translation|Retry translation/})).toHaveCount(0);
  const denied=await other.request.post("/api/stories/"+id+"/translation",{headers:{origin:"http://localhost:3000"},data:{action:"retry",consent:true}});expect(denied.status()).toBe(404);
  const tasks=await f.admin.from("translation_tasks").select("id,attempts").eq("translation_story_id",linked);expect(tasks.data?.find(r=>r.id===first.data.task_id)?.attempts).toBe(1);expect(tasks.data?.find(r=>r.id===second.data.task_id)?.attempts).toBe(2);
 }finally{await a.close();await b.close();await f.cleanup();}
});
