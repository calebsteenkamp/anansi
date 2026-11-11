import {test,expect,type Page} from "@playwright/test";
import {fixtures} from "../support/supabase";
import {audioPreflight} from "../support/audio-project";
import {wave} from "../support/audio";

async function signIn(page:Page,email:string,password:string) {
 await page.goto("/sign-in");await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();
}
test("anonymous capture, draft and audio requests stay protected",async({page})=>{
 await page.goto("/stories/new");await expect(page).toHaveURL(/sign-in/);
 await page.goto("/stories/00000000-0000-4000-8000-000000000000");await expect(page).toHaveURL(/sign-in/);
 const response=await page.request.post("/api/stories/drafts",{headers:{origin:"http://localhost:3000"},data:{consent:true,size:10,filename:"a.mp3"}});
 expect(response.status()).toBe(401);
 const audio=await page.request.get("/api/stories/00000000-0000-4000-8000-000000000000/audio");expect(audio.status()).toBe(401);
});
test("denied microphone falls back to upload; private audio survives reload and denies another account",async({browser})=>{
 await audioPreflight(true);const f=await fixtures();const contexts=[];const paths:string[]=[];const errors:string[]=[];
 try {
  const a=await browser.newContext();contexts.push(a);
  await a.addInitScript(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException("Denied for test","NotAllowedError");};});
  const page=await a.newPage();
  page.on("console",message=>{if(message.type()==="error"&&/hydrat|didn.t match|server rendered/i.test(message.text()))errors.push(message.text().slice(0,100));});
  await signIn(page,f.emails[0],f.password);await page.getByRole("link",{name:"Record or upload a story"}).click();
  await page.getByRole("button",{name:"Start recording",exact:true}).click();await expect(page.getByRole("status")).toContainText("Microphone permission was denied");
  await expect(page.getByLabel("Upload audio")).toBeEnabled();await page.getByLabel("Upload audio").setInputFiles({name:"synthetic.wav",mimeType:"audio/wav",buffer:Buffer.from(wave())});
  await expect(page.getByLabel("Preview audio")).toBeVisible();await expect(page.getByRole("button",{name:"Save private draft"})).toBeDisabled();
  await page.getByRole("checkbox",{name:/I own this audio/}).check();
  const saved=page.waitForResponse(response=>/\/api\/stories\/drafts\/[^/]+\/finalize$/.test(response.url())&&response.request().method()==="POST");
  await page.getByRole("button",{name:"Save private draft"}).click();const response=await saved;expect(response.status()).toBe(201);const result=await response.json();const id=result.id as string;
  const row=await f.sessions[0].from("stories").select("audio_path").eq("id",id).single();expect(row.error).toBeNull();paths.push(row.data!.audio_path);
  await expect(page).toHaveURL(new RegExp("/stories/"+id+"$"));await expect(page.getByText(/Private draft/)).toBeVisible();
  const player=page.getByLabel("Saved draft audio");await expect.poll(()=>player.evaluate((node:HTMLAudioElement)=>node.readyState)).toBeGreaterThan(0);
  await player.evaluate(async(node:HTMLAudioElement)=>{await node.play();});
  await expect.poll(()=>player.evaluate((node:HTMLAudioElement)=>node.currentTime)).toBeGreaterThan(0);
  await page.reload();await expect(page.getByText(/Private draft/)).toBeVisible();
  await page.getByRole("button",{name:"Renew playback"}).click();await expect(page.getByRole("status")).toContainText("Playback renewed");
  const renewal=await page.request.get("/api/stories/"+id+"/audio");expect(renewal.status()).toBe(200);expect(renewal.headers()["cache-control"]).toContain("no-store");
  const playback=await renewal.json();const download=await page.request.get(playback.url);expect(download.status()).toBe(200);expect(new Uint8Array(await download.body())).toEqual(wave());
  await page.goto("/account");await expect(page.getByRole("link",{name:/Untitled story/})).toBeVisible();
  const b=await browser.newContext();contexts.push(b);const second=await b.newPage();await signIn(second,f.emails[1],f.password);
  await second.goto("/stories/"+id);await expect(second.getByRole("heading",{name:"404"})).toBeVisible();
  expect((await second.request.get("/api/stories/"+id+"/audio")).status()).toBe(404);
  await page.goto("/account");await page.getByRole("button",{name:"Sign out",exact:true}).click();await expect(page).toHaveURL(/sign-in/);await page.goto("/stories/"+id);await expect(page).toHaveURL(/sign-in/);
  expect(errors).toEqual([]);
 } finally {
  for(const context of contexts)await context.close();
  // Include saved rows if an assertion failed immediately after the response.
  const rows=await f.admin.from("stories").select("audio_path").in("author_id",f.ids).not("audio_path","is",null);
  if(rows.error)throw new Error("Browser audio cleanup lookup failed.");
  paths.push(...(rows.data??[]).map(row=>row.audio_path));
  if(paths.length){const removed=await f.admin.storage.from("story-audio").remove([...new Set(paths)]);if(removed.error)throw new Error("Browser audio cleanup failed.");}
  await f.cleanup();
 }
});
test("real MediaRecorder produces a server-readable WebM draft; malformed and long files are rejected",async({browser})=>{
 await audioPreflight(true);const f=await fixtures();const context=await browser.newContext();
 try {
  await context.addInitScript(()=>{
   navigator.mediaDevices.getUserMedia=async()=>{
    const audio=new AudioContext();const oscillator=audio.createOscillator();const destination=audio.createMediaStreamDestination();oscillator.connect(destination);oscillator.start();await audio.resume();
    for(const track of destination.stream.getTracks())track.addEventListener("ended",()=>{oscillator.stop();void audio.close();},{once:true});
    return destination.stream;
   };
  });
  const page=await context.newPage();await signIn(page,f.emails[0],f.password);await page.goto("/stories/new");
  await expect(page.getByLabel("Upload audio")).toBeEnabled();await page.getByLabel("Upload audio").setInputFiles({name:"fake.mp3",mimeType:"audio/mpeg",buffer:Buffer.from("not audio")});await page.getByRole("checkbox",{name:/I own this audio/}).check();await page.getByRole("button",{name:"Save private draft"}).click();
  await expect(page.getByRole("status")).toContainText("malformed or unsupported");
  await expect(page.getByLabel("Upload audio")).toBeEnabled();await page.getByLabel("Upload audio").setInputFiles({name:"over-limit.wav",mimeType:"audio/wav",buffer:Buffer.from(wave(180.1))});await page.getByRole("checkbox",{name:/I own this audio/}).check();await page.getByRole("button",{name:"Save private draft"}).click();
  await expect(page.getByRole("status")).toContainText("180 seconds or shorter");
  expect((await f.sessions[0].from("stories").select("id").eq("author_id",f.ids[0])).data).toEqual([]);
  await page.getByRole("button",{name:"Record again",exact:true}).click();await expect(page.getByRole("button",{name:"Stop recording",exact:true})).toBeVisible();
  await expect(page.getByRole("status").filter({hasText:/^Recording:/})).toContainText("Recording: 1 seconds");await page.getByRole("button",{name:"Stop recording",exact:true}).click();await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText("Recording ready");
  await page.getByRole("checkbox",{name:/I own this audio/}).check();await page.getByRole("button",{name:"Save private draft"}).click();await expect(page).toHaveURL(/\/stories\/[0-9a-f-]{36}$/);
  await page.reload();await expect(page.getByLabel("Saved draft audio")).toBeVisible();
  const rows=await f.sessions[0].from("stories").select("audio_media_type,audio_duration_ms").eq("author_id",f.ids[0]);expect(rows.error).toBeNull();expect(rows.data).toHaveLength(1);expect(rows.data![0].audio_media_type).toBe("audio/webm");expect(rows.data![0].audio_duration_ms).toBeGreaterThan(0);
 } finally {
  await context.close();const rows=await f.admin.from("stories").select("audio_path").in("author_id",f.ids).not("audio_path","is",null);
  if(rows.error)throw new Error("Recorder fixture cleanup lookup failed.");
  const paths=(rows.data??[]).map(row=>row.audio_path);if(paths.length){const removed=await f.admin.storage.from("story-audio").remove(paths);if(removed.error)throw new Error("Recorder object cleanup failed.");}
  await f.cleanup();
 }
});
