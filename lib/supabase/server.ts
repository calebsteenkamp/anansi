import {assertDemoAccess} from "../demo-access";
import {AudioError} from "../audio";
import "server-only";
import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
export async function serverClient(){
 const store=await cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{
  getAll:()=>store.getAll(),
  setAll(values){try{values.forEach(({name,value,options})=>store.set(name,value,options));}catch{/* Server Components cannot set cookies; Proxy owns refresh. */}}
 }});
}
export async function requireUser(){
 const db=await serverClient();const {data,error}=await db.auth.getUser();
 if(error||!data.user)redirect("/sign-in");
 try{await assertDemoAccess(db);}catch(error){if(error instanceof AudioError&&error.code==="account_not_allowed")redirect("/sign-in?error=demo-access");throw error;}
 return {db,userId:data.user.id,email:data.user.email??""};
}
