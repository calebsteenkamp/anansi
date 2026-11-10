"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {serverClient,requireUser} from "../lib/supabase/server";
import {validateProfile,type ProfileInput} from "../lib/profile";
export type ActionState={message:string};
export type ProfileState=ActionState & {profile?:ProfileInput};
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
