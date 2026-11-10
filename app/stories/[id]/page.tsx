import {Suspense} from "react";
import Link from "next/link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {requireUser} from "../../../lib/supabase/server";
import {DraftAudio} from "./draft-audio";
async function Draft({params}:{params:Promise<{id:string}>}) {
 await connection();
 const {id} = await params;
 if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
 const {db, userId} = await requireUser();
 const {data, error} = await db.from("stories").select("id,title,status,audio_path,audio_duration_ms").eq("id",id).eq("author_id",userId).eq("kind","original").single();
 if (error || !data?.audio_path) notFound();
 const playback = await db.storage.from("story-audio").createSignedUrl(data.audio_path,300);
 return <section><h1 className="text-3xl">{data.title}</h1><p className="mt-4">Private draft · isiXhosa · {(data.audio_duration_ms/1000).toFixed(1)} seconds</p>
  {playback.data?.signedUrl ? <DraftAudio id={id} initialUrl={playback.data.signedUrl}/> : <p role="alert">Playback unavailable. Refresh to retry; contact the owner if it persists.</p>}
  <p className="mt-6">Audio saved. Transcription, title editing, and publishing arrive in M4.</p>
 </section>;
}
export default function Page({params}:{params:Promise<{id:string}>}) {
 return <main className="mx-auto max-w-2xl p-8"><nav className="mb-6 flex gap-5"><Link href="/account" className="underline">Your profile and drafts</Link><Link href="/stories/new" className="underline">Record another story</Link></nav><Suspense fallback={<p>Loading draft…</p>}><Draft params={params}/></Suspense></main>;
}
