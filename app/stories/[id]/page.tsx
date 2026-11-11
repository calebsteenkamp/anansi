import {Suspense} from "react";
import {SessionLink as Link} from "../../session-link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {requireUser} from "../../../lib/supabase/server";
import {storySnapshot} from "../../../lib/supabase/story-workflow";
import {configFromEnv} from "../../../lib/providers/core";
import {StoryReader} from "./story-reader";
import {translationView} from "../../../lib/supabase/translation-workflow";
import {TranscriptEditor} from "./transcript-editor";
import {AudioError} from "../../../lib/audio";
type Query=Promise<{[key:string]:string|string[]|undefined}>;
async function Story({params,searchParams}:{params:Promise<{id:string}>;searchParams:Query}){
 await connection();
 const {db,userId,email}=await requireUser();
 let story;
 try{story=await storySnapshot(db,(await params).id);}
 catch(error){if(error instanceof AudioError&&error.status===404)notFound();return <p role="alert">Story setup unavailable. The owner must verify the M4 migration before this page can load.</p>;}
 const [playback,profiles]=await Promise.all([db.storage.from("story-audio").createSignedUrl(story.audio_path,300),db.from("profiles").select("id,display_name,preferred_language").in("id",[...new Set([story.author_id,userId])])]);
 const author=profiles.data?.find(row=>row.id===story.author_id);
 const requested=(await searchParams).language;
 const preferredLanguage=requested==="en"?"en":requested==="xh"?"xh":profiles.data?.find(row=>row.id===userId)?.preferred_language==="en"?"en":"xh";
 const preferenceWarning=profiles.error?<p role="alert">Profile preference could not be loaded. Refresh to retry, or choose a reading language.</p>:null;
 const owner=story.author_id===userId;
 if(owner&&story.status!=="published")return <>{preferenceWarning}<p className="mb-4 text-sm" data-testid="session-identity">Signed in as {email}</p><p className="mb-4">Storyteller: {author?.display_name||"Unnamed storyteller"}</p><TranscriptEditor key={story.id+":"+story.transcript_revision+":"+story.status} initial={story} provider={configFromEnv(process.env).transcription} translationProvider={configFromEnv(process.env).translation} preferredLanguage={preferredLanguage} audioUrl={playback.data?.signedUrl}/></>;
 let translation=null;let translationError=false;
 try{translation=await translationView(db,story,userId);}catch{translationError=true;}
 return <section>{preferenceWarning}<p className="mb-4 text-sm" data-testid="session-identity">Signed in as {email}</p><p className="mb-4">Storyteller: {author?.display_name||"Unnamed storyteller"}</p>
 <StoryReader story={story} audioUrl={playback.data?.signedUrl} initialTranslation={translation} owner={owner} provider={translation?.provider??configFromEnv(process.env).translation} preferredLanguage={preferredLanguage}/>
 {translationError&&<p role="alert">Translation setup unavailable. Ask the owner to verify M5 SQL.</p>}
 </section>;
}
export default function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Query}){return <main className="mx-auto max-w-2xl p-8"><nav className="mb-6 flex flex-wrap gap-5"><Link className="underline" href="/discover">Discover stories</Link><Link href="/account" className="underline">Your profile and stories</Link><Link href="/stories/new" className="underline">Record another story</Link></nav><Suspense fallback={<p>Loading story…</p>}><Story params={params} searchParams={searchParams}/></Suspense></main>;}
