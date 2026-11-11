import {test,expect,type Page,type BrowserContext,devices} from "@playwright/test";
import {readerFixture} from "../support/reader-fixture";
async function login(page:Page,email:string,password:string){await page.goto("/sign-in");await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();}
async function stubSpeech(context:BrowserContext,missing=false){await context.addInitScript(({missing})=>{
 class Utterance {text:string;voice:unknown;lang="";onstart:(()=>void)|null=null;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(text:string){this.text=text;}}
 const local={lang:"en-ZA",localService:true,default:true,voiceURI:"synthetic-local",name:"Synthetic local English"};
 class Engine extends EventTarget {
  current:Utterance|null=null;spoken:string[]=[];cancels=0;voices=missing?[]:[{...local,localService:false,voiceURI:"remote"},{...local,lang:"fr-FR",voiceURI:"french"},local];
  getVoices(){return this.voices;}
  speak(u:Utterance){this.current=u;this.spoken.push(u.text);u.onstart?.();}
  cancel(){this.cancels++;this.current=null;sessionStorage.setItem("m6-cancels",String(this.cancels));}
 }
 const engine=new Engine();Object.defineProperty(window,"speechSynthesis",{configurable:true,value:engine});Object.defineProperty(window,"SpeechSynthesisUtterance",{configurable:true,value:Utterance});
 Object.defineProperty(window,"__m6",{value:{engine,end(){const u=engine.current;engine.current=null;u?.onend?.();},fail(){engine.current?.onerror?.();},loadVoices(){engine.voices=[local];engine.dispatchEvent(new Event("voiceschanged"));}}});
 },{missing});}
interface SpeechTest {engine:{spoken:string[];cancels:number};end:()=>void;fail:()=>void;loadVoices:()=>void}
// Page evaluation uses browser-local test instrumentation, never application bypasses.
test("reader preference, real audio seeking, boundaries and keyboard activation",async({browser})=>{
 const fixture=await readerFixture(),context=await browser.newContext();
 try{
  const page=await context.newPage();let providerPosts=0;page.on("request",r=>{if(r.method()==="POST"&&/\/(translation|transcribe)$/.test(r.url()))providerPosts++;});
  await login(page,fixture.f.emails[0],fixture.f.password);await page.goto("/stories/"+fixture.id);
  await expect(page.getByLabel("Reading language",{exact:true})).toHaveValue("en");await expect(page.getByText("Synthetic English one.",{exact:true})).toBeVisible();await expect(page.getByText("Storyteller: T6 Storyteller")).toBeVisible();
  const audio=page.getByLabel("Saved draft audio");await expect.poll(()=>audio.evaluate((node:HTMLAudioElement)=>node.readyState)).toBeGreaterThan(0);
  const button=page.getByRole("button",{name:"Seek original audio to segment 2",exact:true});await expect(button).toHaveAccessibleDescription(/Enkosi[\s\S]*Synthetic English two/);await button.click();await expect.poll(()=>audio.evaluate((node:HTMLAudioElement)=>node.currentTime)).toBeCloseTo(fixture.segments[1].start_ms/1000,1);await expect(page.getByTestId("reading-segment-1")).toHaveAttribute("data-active","true");
  await page.getByRole("button",{name:"Seek original audio to segment 1",exact:true}).focus();await page.keyboard.press("Enter");await expect(page.getByTestId("reading-segment-0")).toHaveAttribute("data-active","true");await button.focus();await page.keyboard.press("Space");await expect(page.getByTestId("reading-segment-1")).toHaveAttribute("data-active","true");
  await audio.evaluate((node:HTMLAudioElement)=>{node.currentTime=4;node.dispatchEvent(new Event("timeupdate"));node.dispatchEvent(new Event("ended"));});await expect(page.getByTestId("reading-segment-1")).toHaveAttribute("data-active","false");
  await expect(page.getByText(/Timings marked approximate/)).toBeVisible();await page.reload();await expect(page.getByLabel("Reading language",{exact:true})).toHaveValue("en");expect(providerPosts).toBe(0);
 }finally{await context.close();await fixture.cleanup();}
});
test("device narration is sequential, cancels competing playback, errors and navigation",async({browser})=>{
 const fixture=await readerFixture(),context=await browser.newContext();await stubSpeech(context);
 try{
  const page=await context.newPage();await login(page,fixture.f.emails[0],fixture.f.password);await page.goto("/stories/"+fixture.id);
  await expect(page.getByLabel("Device English voice",{exact:true})).toHaveValue("synthetic-local");await expect(page.getByLabel("Device English voice",{exact:true}).locator("option")).toHaveCount(1);
  const read=page.getByRole("button",{name:"Read English with device voice",exact:true}),audio=page.getByLabel("Saved draft audio");
  await page.getByRole("button",{name:"Seek original audio to segment 1",exact:true}).click();await audio.evaluate((node:HTMLAudioElement)=>node.play());await expect.poll(()=>audio.evaluate((node:HTMLAudioElement)=>node.paused)).toBe(false);
  await read.click();await expect.poll(()=>audio.evaluate((node:HTMLAudioElement)=>node.paused)).toBe(true);await expect(page.getByTestId("reading-segment-0")).toHaveAttribute("data-active","true");
  await page.evaluate(()=> (window as unknown as {__m6:SpeechTest}).__m6.end());await expect(page.getByTestId("reading-segment-1")).toHaveAttribute("data-active","true");await page.evaluate(()=> (window as unknown as {__m6:SpeechTest}).__m6.end());await expect(page.getByTestId("reader-message")).toContainText("finished");
  await read.click();await page.evaluate(()=> (window as unknown as {__m6:SpeechTest}).__m6.fail());await expect(page.getByTestId("reader-message")).toContainText("could not read");
  await read.click();await audio.evaluate((node:HTMLAudioElement)=>node.play());await expect.poll(()=>page.evaluate(()=> (window as unknown as {__m6:SpeechTest}).__m6.engine.cancels)).toBeGreaterThan(1);await audio.evaluate((node:HTMLAudioElement)=>node.pause());
  await read.click();await page.getByLabel("Reading language",{exact:true}).selectOption("xh");await expect(page.getByText("Synthetic English one.",{exact:true})).toHaveCount(0);
  await page.getByLabel("Reading language",{exact:true}).selectOption("en");await read.click();const before=await page.evaluate(()=> (window as unknown as {__m6:SpeechTest}).__m6.engine.cancels);
  await page.getByRole("link",{name:"Your profile and stories",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();expect(Number(await page.evaluate(()=>sessionStorage.getItem("m6-cancels")))).toBeGreaterThan(before);
 }finally{await context.close();await fixture.cleanup();}
});
test("mobile isiXhosa preference, absent/late English voice and usable responsive navigation",async({browser})=>{
 const fixture=await readerFixture(),context=await browser.newContext({...devices["Pixel 7"],viewport:{width:360,height:740}});await stubSpeech(context,true);
 try{
  const page=await context.newPage();const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error"&&/hydrat/i.test(m.text()))errors.push(m.text());});
  await login(page,fixture.f.emails[1],fixture.f.password);await page.goto("/stories/"+fixture.id);await expect(page.getByLabel("Reading language",{exact:true})).toHaveValue("xh");await expect(page.getByText("Synthetic English one.",{exact:true})).toHaveCount(0);
  await page.getByLabel("Reading language",{exact:true}).selectOption("en");await expect(page.getByText("Synthetic English one.",{exact:true})).toBeVisible();await expect(page.getByText(/No local English voice/)).toBeVisible();
  await page.getByRole("button",{name:"Seek original audio to segment 2",exact:true}).click();await expect(page.getByTestId("reading-segment-1")).toHaveAttribute("data-active","true");
  await page.evaluate(()=> (window as unknown as {__m6:SpeechTest}).__m6.loadVoices());await expect(page.getByRole("button",{name:"Read English with device voice",exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole("link",{name:"Your profile and stories",exact:true}).click();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();await page.getByRole("link",{name:"Record or upload a story",exact:true}).click();await expect(page.getByRole("heading",{name:"Record your story",exact:true})).toBeVisible();expect(errors).toEqual([]);
 }finally{await context.close();await fixture.cleanup();}
});
