import {Suspense} from "react";
import {SessionLink as Link} from "../../session-link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {requireUser} from "../../../lib/supabase/server";
import {storySnapshot} from "../../../lib/supabase/story-workflow";
import {configFromEnv} from "../../../lib/providers/core";
import {DraftAudio} from "./draft-audio";
import {TranscriptEditor} from "./transcript-editor";
import {AudioError} from "../../../lib/audio";
async function Story({params}:{params:Promise<{id:string}>}){
 await connection();
 const {db,userId,email}=await requireUser();
 let story;
 try{story=await storySnapshot(db,(await params).id);}
 catch(error){if(error instanceof AudioError&&error.status===404)notFound();return <p role="alert">Story setup unavailable. The owner must verify the M4 migration before this page can load.</p>;}
 const playback=await db.storage.from("story-audio").createSignedUrl(story.audio_path,300);
 const owner=story.author_id===userId;
 if(owner&&story.status!=="published")return <><p className="mb-4 text-sm" data-testid="session-identity">Signed in as {email}</p><TranscriptEditor key={story.id+":"+story.transcript_revision+":"+story.status} initial={story} provider={configFromEnv(process.env).transcription} audioUrl={playback.data?.signedUrl}/></>;
 return <section><p className="mb-4 text-sm" data-testid="session-identity">Signed in as {email}</p><h1 className="text-3xl">{story.title}</h1><p className="mt-4">{story.status==="published"?"Published story":"Private draft"} · isiXhosa · {(story.audio_duration_ms/1000).toFixed(1)} seconds</p>
  {playback.data?.signedUrl?<DraftAudio id={story.id} initialUrl={playback.data.signedUrl}/>:<p role="alert">Playback unavailable. Refresh to retry.</p>}
  {<section className="mt-8"><h2 className="text-2xl">Published transcript</h2><ol className="mt-4 space-y-3">{story.segments.map(row=><li key={row.id}><p>{row.text}</p><p className="text-sm">{row.timing_source==="estimated"?"Approximate":"Provider"} timing: {(row.start_ms/1000).toFixed(2)}–{(row.end_ms/1000).toFixed(2)} seconds</p></li>)}</ol><p className="mt-4">English translation processing arrives in M5.</p></section>}
 </section>;
}
export default function Page({params}:{params:Promise<{id:string}>}){return <main className="mx-auto max-w-2xl p-8"><nav className="mb-6 flex gap-5"><Link href="/account" className="underline">Your profile and stories</Link><Link href="/stories/new" className="underline">Record another story</Link></nav><Suspense fallback={<p>Loading story…</p>}><Story params={params}/></Suspense></main>;}
