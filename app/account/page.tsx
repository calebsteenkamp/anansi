import {Suspense} from "react";
import {connection} from "next/server";
import {requireUser} from "../../lib/supabase/server";
import {signOut} from "../auth-actions";
import {ProfileForm} from "./profile-form";
import type {ProfileInput} from "../../lib/profile";
async function Account(){
 await connection(); // Session validation reads time; never execute it during prerender.
 const {db,userId}=await requireUser();
 const {data,error}=await db.from("profiles").select("display_name,bio,preferred_language,spoken_languages").eq("id",userId).single();
 if(error||!data)return <section><h1 className="text-3xl">Account setup required</h1><p>The owner must apply the M2 migration before profiles are available.</p><form action={signOut}><button>Sign out</button></form></section>;
 return <section><h1 className="text-3xl">Your profile</h1><ProfileForm key={userId} profile={data as ProfileInput}/><form className="mt-8" action={signOut}><button className="underline">Sign out</button></form></section>;
}
export default function Page(){return <main className="mx-auto w-full max-w-xl p-8"><Suspense fallback={<p>Loading account…</p>}><Account/></Suspense></main>;}
