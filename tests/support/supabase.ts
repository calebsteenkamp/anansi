import {processEnv} from "@next/env";
import {readFileSync} from "node:fs";
import {createClient} from "@supabase/supabase-js";
import {randomUUID} from "node:crypto";
// Next intentionally skips .env.local under NODE_ENV=test; this opt-in network suite loads it explicitly.
processEnv([{path:".env.local",contents:readFileSync(".env.local","utf8"),env:{}}],process.cwd(),console,true);
export function clients(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL!,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,secret=process.env.SUPABASE_SERVICE_ROLE_KEY!;
 if(!url||new URL(url).hostname!=="lizbeiqyrwzkybpentrk.supabase.co"||!key||!secret)throw new Error("BLOCKED: confirm Anansi demo project and local credentials.");
 const options={auth:{persistSession:false,autoRefreshToken:false}};
 return {admin:createClient(url,secret,options),anonymous:()=>createClient(url,key,options),url,key};
}
export async function preflight(browser=false){
 const c=clients();const {error}=await c.admin.from("profiles").select("id").limit(1);
 if(error)throw new Error("BLOCKED: owner must apply the M2 migration before real database/browser tests.");
 if(browser){const response=await fetch(c.url+"/auth/v1/settings",{headers:{apikey:c.key}});if(!response.ok||(await response.json()).mailer_autoconfirm!==true)throw new Error("BLOCKED: disable Confirm email on the Anansi demo project before browser signup tests.");}
 return c;
}
export async function fixtures(){
 const c=await preflight();const ids:string[]=[];const sessions:ReturnType<typeof c.anonymous>[]=[];
 const password=randomUUID()+"!aA1";
 async function cleanup(){
  const results=await Promise.allSettled(sessions.map(s=>s.auth.signOut()));
  void results;
  for(const id of ids){const {error}=await c.admin.auth.admin.deleteUser(id);if(error)throw new Error("Fixture user cleanup failed; inspect test-run users.");}
 }
 try{
  for(let i=0;i<2;i++){const email="anansi-t2-"+randomUUID()+"@example.com";const {data,error}=await c.admin.auth.admin.createUser({email,password,email_confirm:true});if(error||!data.user)throw new Error("Disposable account setup failed.");ids.push(data.user.id);
   const session=c.anonymous();sessions.push(session);if((await session.auth.signInWithPassword({email,password})).error)throw new Error("Fixture sign-in failed.");
  }
  return {...c,ids,sessions,cleanup};
 }catch(e){await cleanup();throw e;}
}
