"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {serverClient,requireUser} from "../lib/supabase/server";
import {credentials,validateProfile,type ProfileInput} from "../lib/profile";
export type ActionState={message:string};
export type ProfileState=ActionState & {profile?:ProfileInput};
export async function signIn(_state:ActionState,form:FormData):Promise<ActionState>{
 let input;try{input=credentials(form);}catch(e){return {message:(e as Error).message};}
 const db=await serverClient();const {error}=await db.auth.signInWithPassword(input);
 if(error)return {message:"Unable to sign in. Check your credentials and email confirmation."};
 revalidatePath("/", "layout");
 redirect("/account");
}
export async function signUp(_state:ActionState,form:FormData):Promise<ActionState>{
 let input;try{input=credentials(form);}catch(e){return {message:(e as Error).message};}
 const db=await serverClient();const {data,error}=await db.auth.signUp(input);
 if(error)return {message:"Unable to create account. Try again later or contact the demo owner."};
 if(!data.session)return {message:"Check your email to confirm registration before signing in."};
 revalidatePath("/", "layout");
 redirect("/account");
}
export async function signOut(){
 const db=await serverClient();const {error}=await db.auth.signOut();
 if(error)redirect("/account?error=signout");
 revalidatePath("/", "layout");
 redirect("/sign-in");
}
export async function saveProfile(_state:ProfileState,form:FormData):Promise<ProfileState>{
 const {db,userId}=await requireUser();
 let input;try{input=validateProfile(form);}catch(e){return {message:(e as Error).message};}
 const {data,error}=await db.from("profiles").update(input).eq("id",userId).select("id").single();
 if(error||!data)return {message:"Profile could not be saved. Check migration setup and try again."};
 revalidatePath("/account");
 return {message:"Profile saved.",profile:input};
}
