import {test,expect,type Page,devices} from "@playwright/test";
import {fixtures} from "../support/supabase";
import {workflowPreflight} from "../support/workflow-project";
import {wave} from "../support/audio";
async function login(page:Page,email:string,password:string){
 await page.goto("/sign-in");await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();
}
async function draft(page:Page){
 await page.goto("/stories/new");await expect(page.getByLabel("Upload audio")).toBeEnabled();
 await page.getByLabel("Upload audio").setInputFiles({name:"t4.wav",mimeType:"audio/wav",buffer:Buffer.from(wave(2))});await page.getByRole("checkbox",{name:/I own this audio/}).check();
 const saved=page.waitForResponse(response=>/\/api\/stories\/drafts\/[^/]+\/finalize$/.test(response.url())&&response.request().method()==="POST");
 await page.getByRole("button",{name:"Save private draft"}).click();const result=await saved;expect(result.status()).toBe(201);const {id}=await result.json();await expect(page.getByRole("heading",{name:"Transcript editor"})).toBeVisible();return id as string;
}
async function cleanup(f:Awaited<ReturnType<typeof fixtures>>){
 const rows=await f.admin.from("stories").select("audio_path").in("author_id",f.ids).not("audio_path","is",null);if(rows.error)throw new Error("T4 cleanup lookup failed.");
 const paths=rows.data?.map(row=>row.audio_path)??[];if(paths.length&&(await f.admin.storage.from("story-audio").remove(paths)).error)throw new Error("T4 audio cleanup failed.");
 await f.cleanup();
}
test("mock transcription -> edit/split/merge/save -> immutable publish visible to another account",async({browser})=>{
 await workflowPreflight(true);const f=await fixtures();const contexts=[];
 try{
  const a=await browser.newContext();contexts.push(a);const page=await a.newPage();await login(page,f.emails[0],f.password);const id=await draft(page);
  // Fail closed before the provider mutation if an existing server is configured live.
  await expect(page.getByText(/^Provider: mock\./)).toBeVisible();
  await page.getByRole("checkbox",{name:/I have permission to send this audio/}).check();await page.getByRole("button",{name:"Transcribe audio",exact:true}).click();
  await expect(page.getByTestId("transcript-message")).toContainText("Transcription saved",{timeout:30000});
  await expect(page.getByLabel("Segment 1",{exact:true})).toHaveValue("Synthetic mock transcript.");
  await page.getByLabel("Segment 1",{exact:true}).fill("Molo enkosi.");await page.getByLabel("Segment 1",{exact:true}).evaluate((node:HTMLTextAreaElement)=>node.setSelectionRange(4,4));
  await page.getByRole("button",{name:"Split segment 1 at cursor",exact:true}).click();await expect(page.getByLabel("Segment 2",{exact:true})).toHaveValue("enkosi.");
  await page.getByRole("button",{name:"Merge segment 1 with next",exact:true}).click();await expect(page.getByLabel("Segment 1",{exact:true})).toHaveValue("Molo enkosi.");
  await page.getByLabel("Story title",{exact:true}).fill("M4 browser story");await page.getByRole("button",{name:"Save transcript",exact:true}).click();await expect(page.getByTestId("transcript-message")).toContainText("Transcript saved.",{timeout:30000});
  await page.reload();await expect(page.getByLabel("Story title",{exact:true})).toHaveValue("M4 browser story");await expect(page.getByLabel("Segment 1",{exact:true})).toHaveValue("Molo enkosi.");
  await expect(page.getByText("Translation provider: mock.",{exact:false})).toBeVisible();await page.getByRole("checkbox",{name:/I have permission to send this transcript text for translation/}).check();await page.getByRole("button",{name:"Publish story",exact:true}).click();await expect(page.getByText(/State: published/)).toBeVisible({timeout:30000});await expect(page.getByLabel("Segment 1",{exact:true})).toHaveCount(0);
  await expect(page.getByTestId("translation-message")).toContainText("English translation complete",{timeout:30000});await page.reload();await expect(page.getByText(/Published story · isiXhosa/)).toBeVisible();
  const b=await browser.newContext();contexts.push(b);const second=await b.newPage();await login(second,f.emails[1],f.password);await second.goto("/stories/"+id);
  await expect(second.getByRole("heading",{name:"Published transcript",exact:true})).toBeVisible();await expect(second.getByText("Molo enkosi.",{exact:true})).toBeVisible();await expect(second.getByRole("button",{name:"Save transcript",exact:true})).toHaveCount(0);
  const denied=await second.request.put("/api/stories/"+id+"/transcript",{headers:{origin:"http://localhost:3000"},data:{title:"Forged",revision:2,segments:[]}});expect(denied.status()).toBe(404);
  const forged=await second.request.put("/api/stories/"+id+"/transcript",{headers:{origin:"http://localhost:3000"},data:{title:"B changed A",revision:3,segments:[{id:crypto.randomUUID(),text:"forged"}]}});expect(forged.status()).toBe(404);
  await second.reload();await expect(second.getByText("Molo enkosi.",{exact:true})).toBeVisible();await expect(second.getByRole("textbox")).toHaveCount(0);
  const tasks=await f.admin.from("translation_tasks").select("state").eq("source_story_id",id);expect(tasks.data?.length).toBeGreaterThan(0);expect(tasks.data?.every(row=>row.state==="complete")).toBe(true);
 }finally{for(const context of contexts)await context.close();await cleanup(f);}
});
test("failed transcription keeps manual fallback usable in a mobile LAN browser",async({browser})=>{
 await workflowPreflight(true);const f=await fixtures();const host=process.env.ANANSI_DEV_HOSTS?.split(",")[0]?.trim();if(!host)throw new Error("BLOCKED: configure LAN host for phone workflow regression.");
 const context=await browser.newContext({...devices["Pixel 7"],baseURL:"http://"+host+":3000"});
 try{
  const page=await context.newPage();await login(page,f.emails[0],f.password);const id=await draft(page);
  await expect(page.getByText(/^Provider: mock\./)).toBeVisible();
  await page.route("**/api/stories/"+id+"/transcribe",route=>route.fulfill({status:502,contentType:"application/json",body:JSON.stringify({error:{code:"transcription_failed",message:"Transcription failed. Enter your transcript manually."}})}),{times:1});
  await page.getByRole("checkbox",{name:/I have permission to send this audio/}).check();await page.getByRole("button",{name:"Transcribe audio",exact:true}).click();await expect(page.getByTestId("transcript-message")).toContainText("Transcription failed");
  await page.getByLabel("Paste or type isiXhosa transcript",{exact:true}).fill("Molo. Enkosi.");await page.getByRole("button",{name:"Use pasted transcript",exact:true}).click();await page.getByLabel("Story title",{exact:true}).fill("Manual phone story");
  await page.getByRole("button",{name:"Save transcript",exact:true}).click();await expect(page.getByTestId("transcript-message")).toContainText("Transcript saved.",{timeout:30000});
  await page.reload();await expect(page.getByLabel("Segment 1",{exact:true})).toHaveValue("Molo.");
  await expect(page.getByText("Translation provider: mock.",{exact:false})).toBeVisible();await page.getByRole("checkbox",{name:/I have permission to send this transcript text for translation/}).check();await page.getByRole("button",{name:"Publish story",exact:true}).click();await expect(page.getByText(/State: published/)).toBeVisible({timeout:30000});await expect(page.getByTestId("translation-message")).toContainText("English translation complete",{timeout:30000});await page.reload();await expect(page.getByText(/Published story · isiXhosa/)).toBeVisible();
  await page.getByRole("link",{name:"Your profile and stories",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();
  await page.getByRole("link",{name:/Manual phone story/}).click();await expect(page.getByRole("heading",{name:"Published transcript",exact:true})).toBeVisible();
  await page.getByRole("link",{name:"Record another story",exact:true}).click();await expect(page.getByRole("heading",{name:"Record your story",exact:true})).toBeVisible();
  await page.getByRole("link",{name:"Your profile and drafts",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();
 }finally{await context.close();await cleanup(f);}
});

test("an open draft editor closes when another tab switches the shared browser session",async({browser})=>{
 await workflowPreflight(true);const f=await fixtures();const context=await browser.newContext();
 try{
  const a=await context.newPage();await login(a,f.emails[0],f.password);const id=await draft(a);
  await a.getByLabel("Paste or type isiXhosa transcript",{exact:true}).fill("Molo.");await a.getByRole("button",{name:"Use pasted transcript",exact:true}).click();
  await a.getByRole("button",{name:"Save transcript",exact:true}).click();await expect(a.getByTestId("transcript-message")).toContainText("Transcript saved.");
  const b=await context.newPage();await login(b,f.emails[1],f.password);await expect(b.getByTestId("session-identity")).toContainText(f.emails[1]);
  expect((await b.request.put("/api/stories/"+id+"/transcript",{headers:{origin:"http://localhost:3000"},data:{title:"forged",revision:1,segments:[]}})).status()).toBe(404);
  await a.bringToFront();await a.evaluate(()=>window.dispatchEvent(new Event("focus")));
  await expect(a.getByRole("heading",{name:"Session or story access changed"})).toBeVisible();await expect(a.getByRole("textbox")).toHaveCount(0);
  await a.getByRole("button",{name:"Reload story",exact:true}).click();await expect(a.getByRole("heading",{name:"404"})).toBeVisible();
 }finally{await context.close();await cleanup(f);}
});
