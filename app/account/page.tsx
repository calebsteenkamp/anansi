import Link from "next/link";
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
 const drafts = await db.from("stories").select("id,title,audio_duration_ms").eq("author_id",userId).eq("kind","original").eq("status","draft").not("audio_path","is",null).order("created_at",{ascending:false}).limit(50);
 return <section><h1 className="text-3xl">Your profile</h1><ProfileForm key={userId} profile={data as ProfileInput}/><section className="mt-8"><h2 className="text-2xl">Your audio drafts</h2><Link className="underline" href="/stories/new">Record or upload a story</Link>{drafts.error ? <p role="alert">Drafts unavailable. Refresh to try again.</p> : drafts.data?.length ? <ul className="mt-4 flex flex-col gap-3">{drafts.data.map(draft => <li key={draft.id}><Link className="underline" href={"/stories/"+draft.id}>{draft.title} · {(draft.audio_duration_ms/1000).toFixed(1)} seconds</Link></li>)}</ul> : <p>No audio drafts yet.</p>}</section><form className="mt-8" action={signOut}><button className="underline">Sign out</button></form></section>;
}
export default function Page(){return <main className="mx-auto w-full max-w-xl p-8"><Suspense fallback={<p>Loading account…</p>}><Account/></Suspense></main>;}
