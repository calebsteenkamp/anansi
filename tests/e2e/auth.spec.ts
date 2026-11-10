import {test,expect} from "@playwright/test";
import {randomUUID} from "node:crypto";
import {preflight} from "../support/supabase";
test("public entrypoints render and anonymous account access redirects",async({page})=>{
 await page.goto("/");await expect(page.getByRole("heading",{name:"Anansi",exact:true})).toBeVisible();
 await page.getByRole("link",{name:"Sign in",exact:true}).click();await expect(page.getByLabel("Email",{exact:true})).toBeVisible();
 await page.goto("/account");await expect(page).toHaveURL(/sign-in/);
});
test("two real browser accounts register, retain separate profiles, and sign out",async({browser})=>{
 const c=await preflight(true);const ids:string[]=[];const emails:string[]=[];const sessions:ReturnType<typeof c.anonymous>[]=[];const contexts=[];const credentials:{email:string;password:string}[]=[];const hydrationErrors:string[]=[];
 try{
  for(let n=0;n<2;n++){
   const context=await browser.newContext();contexts.push(context);const page=await context.newPage();page.on("console",message=>{if(message.type()==="error"&&/hydrat|didn.t match|server rendered/i.test(message.text()))hydrationErrors.push(message.text().slice(0,100));});
   await page.goto("/account");await expect(page).toHaveURL(/sign-in/);
   const email="anansi-e2e-"+randomUUID()+"@example.com",password=randomUUID()+"!aA1";emails.push(email);credentials.push({email,password});
   await page.goto("/sign-up");await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Create account",exact:true}).click();
   await expect(page.getByRole("heading",{name:"Your profile"})).toBeVisible();
   const client=c.anonymous();sessions.push(client);const {data,error}=await client.auth.signInWithPassword({email,password});if(error||!data.user)throw new Error("Test account lookup failed");ids.push(data.user.id);
   await page.getByLabel("Display name").fill("Browser storyteller "+n);await page.getByLabel("Bio").fill("Fixture bio "+n);
   await page.getByLabel("Preferred language").selectOption(n?"en":"xh");
   await page.getByLabel("isiXhosa",{exact:true}).setChecked(n===0);await page.getByLabel("English",{exact:true}).setChecked(n===1);
   await expect(page.getByLabel("Preferred language")).toHaveValue(n?"en":"xh");
   await page.getByRole("button",{name:"Save profile"}).click();await expect(page.getByRole("status")).toContainText("Profile saved.");
   const stored=await client.from("profiles").select("display_name,preferred_language,spoken_languages").eq("id",data.user.id).single();
   expect(stored.error).toBeNull();expect(stored.data?.preferred_language).toBe(n?"en":"xh");
   await expect(page.getByLabel("Display name")).toHaveValue("Browser storyteller "+n);
   await expect(page.getByLabel("Preferred language")).toHaveValue(n?"en":"xh");
   await page.reload();await expect(page.getByLabel("Display name")).toHaveValue("Browser storyteller "+n);
  }
  const deny=await sessions[1].from("profiles").update({display_name:"forged"}).eq("id",ids[0]).select("id");expect(deny.error||deny.data?.length===0).toBeTruthy();
  for(const [n,context] of contexts.entries()){const page=context.pages()[0];await page.reload();await expect(page.getByLabel("Display name")).toHaveValue("Browser storyteller "+n);await page.getByRole("button",{name:"Sign out"}).click();await expect(page).toHaveURL(/sign-in/);await page.goto("/account");await expect(page).toHaveURL(/sign-in/);}
  const page=contexts[0].pages()[0];
  for(const n of [1,0,1]){
   await page.getByLabel("Email",{exact:true}).fill(credentials[n].email);await page.getByLabel("Password",{exact:true}).fill(credentials[n].password);await page.getByRole("button",{name:"Sign in",exact:true}).click();
   await expect(page.getByRole("heading",{name:"Your profile"})).toBeVisible();
   await expect(page.getByLabel("Display name")).toHaveValue("Browser storyteller "+n);
   await expect(page.getByLabel("Bio")).toHaveValue("Fixture bio "+n);
   await expect(page.getByLabel("Preferred language")).toHaveValue(n?"en":"xh");
   await expect(page.getByLabel(n?"English":"isiXhosa",{exact:true})).toBeChecked();
   await expect(page.getByLabel(n?"isiXhosa":"English",{exact:true})).not.toBeChecked();
   await page.getByRole("button",{name:"Sign out"}).click();await expect(page).toHaveURL(/sign-in/);
  }
  expect(hydrationErrors).toEqual([]);
 }finally{
  for(const context of contexts)await context.close();
  for(const client of sessions)await client.auth.signOut();
  // Include accounts whose UI signup succeeded before a later assertion failed.
  const cleanupIds:string[]=[];
  for(let page=1;;page++){
   const listed=await c.admin.auth.admin.listUsers({page,perPage:1000});if(listed.error)throw new Error("Browser fixture cleanup lookup failed.");
   cleanupIds.push(...listed.data.users.filter(u=>u.email&&emails.includes(u.email)).map(u=>u.id));
   if(listed.data.users.length<1000)break;
  }
  for(const id of cleanupIds){const {error}=await c.admin.auth.admin.deleteUser(id);if(error)throw new Error("Browser fixture cleanup failed.");}
 }
});
