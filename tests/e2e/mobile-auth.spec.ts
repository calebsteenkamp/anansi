import {test,expect,devices} from "@playwright/test";
import {wave} from "../support/audio";
import {fixtures} from "../support/supabase";
test("mobile LAN sign-in keeps typing and recovers from transport failures",async({browser})=>{
 const host=process.env.ANANSI_DEV_HOSTS?.split(",")[0]?.trim();
 if(!host)throw new Error("BLOCKED: configure the exact ANANSI_DEV_HOSTS LAN hostname for phone regression.");
 const base="http://"+host+":3000";
 const f=await fixtures();const context=await browser.newContext({...devices["Pixel 7"],baseURL:base});
 const errors:string[]=[];
 try{
  const page=await context.newPage();page.on("pageerror",error=>errors.push(error.message));
  page.on("console",message=>{if(message.type()==="error"&&/hydrat|blocked cross-origin|didn.t match/i.test(message.text()))errors.push(message.text().slice(0,150));});
  await page.goto("/sign-in");
  await expect(page.getByLabel("Email",{exact:true})).toBeEnabled();
  await page.getByLabel("Email",{exact:true}).pressSequentially(f.emails[0],{delay:20});
  await page.getByLabel("Password",{exact:true}).pressSequentially(f.password,{delay:30});
  await expect(page.getByLabel("Email",{exact:true})).toHaveValue(f.emails[0]);
  await expect(page.getByLabel("Password",{exact:true})).toHaveValue(f.password);
  await page.route("**/api/auth/sign-in",route=>route.fulfill({status:502,contentType:"text/html",body:"Gateway unavailable"}),{times:1});
  await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("Your entries have been kept");
  await expect(page.getByLabel("Email",{exact:true})).toHaveValue(f.emails[0]);
  await expect(page.getByLabel("Password",{exact:true})).toHaveValue(f.password);
  await page.route("**/api/auth/sign-in",route=>route.abort(),{times:1});
  await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("Your entries have been kept");
  await expect(page.getByLabel("Password",{exact:true})).toHaveValue(f.password);
  await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole("heading",{name:"Your profile",exact:true})).toBeVisible();
  await page.goto("/stories/new");await expect(page.getByLabel("Upload audio")).toBeEnabled();
  await page.getByLabel("Upload audio").setInputFiles({name:"lan.wav",mimeType:"audio/wav",buffer:Buffer.from(wave())});
  await page.getByRole("checkbox",{name:/I own this audio/}).check();
  const saved=page.waitForResponse(response=>response.url().endsWith("/api/stories/drafts")&&response.request().method()==="POST");
  await page.getByRole("button",{name:"Save private draft"}).click();expect((await saved).status()).toBe(201);
  await expect(page.getByLabel("Saved draft audio")).toBeVisible();await page.reload();await expect(page.getByLabel("Saved draft audio")).toBeVisible();
  await page.goto("/account");
  await page.getByRole("button",{name:"Sign out",exact:true}).click();await expect(page).toHaveURL(/sign-in/);
  expect(errors).toEqual([]);
 }finally{await context.close();
  const rows=await f.admin.from("stories").select("audio_path").in("author_id",f.ids).not("audio_path","is",null);
  if(rows.error)throw new Error("LAN fixture cleanup lookup failed.");
  const paths=(rows.data??[]).map(row=>row.audio_path);if(paths.length){const removed=await f.admin.storage.from("story-audio").remove(paths);if(removed.error)throw new Error("LAN object cleanup failed.");}
  await f.cleanup();}
});
