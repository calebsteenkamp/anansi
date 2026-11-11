import {test,expect,type Page} from "@playwright/test";
import {fixtures} from "../support/supabase";
import {wave} from "../support/audio";
async function login(page:Page,email:string,password:string){await page.goto("/sign-in");await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();}
test("mobile warm UI uploads above4.5MB directly, keeps inputs stable and finalizes once",async({browser})=>{
 test.setTimeout(180000);const f=await fixtures(),context=await browser.newContext({viewport:{width:390,height:844}});let id:string|undefined;const errors:string[]=[];
 try{
  const page=await context.newPage();page.on("console",m=>{if(m.type()==="error"&&/hydrat|didn.t match|server rendered/i.test(m.text()))errors.push(m.text());});await login(page,f.emails[0],f.password);await page.goto("/stories/new");
  const bytes=wave(179,16000);await page.getByLabel("Upload audio").setInputFiles({name:"synthetic-transport.wav",mimeType:"audio/wav",buffer:Buffer.from(bytes)});await page.getByRole("checkbox",{name:/I own this audio/}).check();
  const finished=page.waitForResponse(r=>/\/api\/stories\/drafts\/[^/]+\/finalize$/.test(r.url())&&r.request().method()==="POST");
  let smallRequests=true;page.on("request",r=>{if(r.method()==="POST"&&r.url().includes("localhost:3000/api/stories/drafts")&&(r.postDataBuffer()?.byteLength??0)>256000)smallRequests=false;});
  await page.getByRole("button",{name:"Save private draft",exact:true}).click();const response=await finished;expect(response.status()).toBe(201);id=(await response.json()).id;await expect(page).toHaveURL(new RegExp("/stories/"+id+"$"));await expect(page.getByLabel("Saved draft audio")).toBeVisible();
  expect(smallRequests).toBe(true);expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const repeat=await page.request.post("/api/stories/drafts/"+id+"/finalize",{headers:{origin:"http://localhost:3000"},data:{}});expect(repeat.status()).toBe(201);expect((await repeat.json()).id).toBe(id);
 }finally{
  await context.close();const rows=await f.admin.from("stories").select("audio_path").in("author_id",f.ids).not("audio_path","is",null);if(rows.data?.length)await f.admin.storage.from("story-audio").remove(rows.data.map(r=>r.audio_path));if(id)await f.admin.storage.from("story-audio-staging").remove([f.ids[0]+"/"+id+"/upload"]);await f.cleanup();
 }
});
