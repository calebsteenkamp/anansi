"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from "react";
import {newSegmentId,estimateTimings,initialText,mergeSegment,splitSegment} from "../../../lib/transcript";
import {StoryReader} from "./story-reader";
import {DraftAudio} from "./draft-audio";
import type {StorySnapshot} from "../../../lib/supabase/story-workflow";
const subscribe=()=>()=>{};
const clientReady=()=>true;
const serverReady=()=>false;
export function TranscriptEditor({initial,provider,translationProvider,preferredLanguage,audioUrl}:{initial:StorySnapshot;provider:string;translationProvider:string;preferredLanguage:"xh"|"en";audioUrl?:string}){
 const ready=useSyncExternalStore(subscribe,clientReady,serverReady);
 const [story,setStory]=useState(initial);
 const [title,setTitle]=useState(initial.title);
 const [segments,setSegments]=useState(initial.segments);
 const [pasted,setPasted]=useState("");
 const [consent,setConsent]=useState(false);
 const [translationConsent,setTranslationConsent]=useState(false);
 const [startTranslation,setStartTranslation]=useState(false);
 const [dirty,setDirty]=useState(false);
 const [pending,setPending]=useState(false);
 const [message,setMessage]=useState("");
 const fields=useRef<Record<string,HTMLTextAreaElement|null>>({});
 const active=useRef(false);
 const [sessionValid,setSessionValid]=useState(false);
 const [sessionChanged,setSessionChanged]=useState(false);
 const published=story.status==="published";
 useEffect(()=>{
  let disposed=false;
  async function verify(){
   try{
    const response=await fetch("/api/stories/"+initial.id+"/transcript",{cache:"no-store"});
    const result=response.ok?await response.json():null;
    if(disposed)return;
    if(!response.ok||result?.canEdit!==true){setSessionValid(false);setSessionChanged(true);setDirty(false);return;}
    setSessionValid(true);
   }catch{if(!disposed){setSessionValid(false);setMessage("Session could not be verified. Reload before editing.");}}
  }
  const focus=()=>{if(document.visibilityState!=="hidden")void verify();};
  void verify();window.addEventListener("focus",focus);window.addEventListener("pageshow",focus);document.addEventListener("visibilitychange",focus);
  return()=>{disposed=true;window.removeEventListener("focus",focus);window.removeEventListener("pageshow",focus);document.removeEventListener("visibilitychange",focus);};
 },[initial.id]);
 useEffect(()=>{
  if(!dirty)return;
  const unload=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue="";};
  window.addEventListener("beforeunload",unload);
  return()=>{window.removeEventListener("beforeunload",unload);};
 },[dirty]);
 function apply(next:StorySnapshot){setStory(next);setTitle(next.title);setSegments(next.segments);setPasted("");setDirty(false);}
 async function operation(kind:"save"|"publish"|"transcribe"|"reload"){
  if(active.current||(!sessionValid&&kind!=="reload"))return;
  if((kind==="reload"||kind==="transcribe")&&dirty&&!window.confirm("Discard unsaved transcript changes?"))return;
  active.current=true;setPending(true);setMessage(kind==="transcribe"?"Transcribing… this may take a few minutes.":"Working…");
  try{
   const route=kind==="save"||kind==="reload"?"transcript":kind;
   const body=kind==="save"?{title,revision:story.transcript_revision,segments}:kind==="publish"?{revision:story.transcript_revision,translationConsent,translationProvider}:{consent,retry:story.status==="transcription_failed"||story.status==="transcribing"};
   const response=await fetch("/api/stories/"+story.id+"/"+route,{method:kind==="reload"?"GET":kind==="save"?"PUT":"POST",...(kind==="reload"?{cache:"no-store" as const}:{headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})});
   if(!response.headers.get("content-type")?.includes("application/json"))throw new Error("Unexpected response. Copy unsaved text and reload before retrying.");
   const result=await response.json();
   if(!response.ok){
    if(kind==="transcribe"){try{const state=await fetch("/api/stories/"+story.id+"/transcript",{cache:"no-store"});if(state.ok)apply((await state.json()).story);}catch{/* Preserve the actionable operation error. */}}
    throw new Error(result.error?.message??"Story operation failed.");
   }
   if(kind==="reload"){if(result.canEdit!==true){setSessionChanged(true);setDirty(false);return;}setSessionValid(true);}
   apply(result.story);
   if(kind==="publish"&&!result.already_published)setStartTranslation(true);
   setMessage(kind==="save"?"Transcript saved.":kind==="publish"?"Published. English translation processing is starting.":kind==="transcribe"?(result.reused?"Saved transcript reused; no provider request.":"Transcription saved. Review and correct it before publishing."):"Saved state reloaded.");
  }catch(error){setMessage(error instanceof Error?error.message:"Request failed. Your unsaved text is still here.");}
  finally{active.current=false;setPending(false);}
 }
 function paste(){
  try{setSegments(estimateTimings(initialText(pasted).map(text=>({id:newSegmentId(),text})),story.audio_duration_ms));setPasted("");setDirty(true);setMessage("Pasted transcript prepared. Save when ready.");}
  catch(error){setMessage((error as Error).message);}
 }
 function split(index:number){
  try{setSegments(splitSegment(segments,index,fields.current[segments[index].id]?.selectionStart??0,newSegmentId(),story.audio_duration_ms));setDirty(true);setMessage("");}
  catch(error){setMessage((error as Error).message);}
 }
 function merge(index:number){
  try{setSegments(mergeSegment(segments,index,story.audio_duration_ms));setDirty(true);setMessage("");}
  catch(error){setMessage((error as Error).message);}
 }
 if(published)return <StoryReader story={story} audioUrl={audioUrl} initialTranslation={null} owner={true} provider={translationProvider} preferredLanguage={preferredLanguage} autoStart={startTranslation}/>;
 if(sessionChanged)return <section role="alert"><h1 className="text-2xl">Session or story access changed</h1><p>This editor has been closed. Reload to verify the current account and story permissions.</p><button className="underline" onClick={()=>window.location.reload()}>Reload story</button></section>;
 return <><h1 className="text-3xl">{story.title}</h1><p className="mt-4">{published?"Published story":"Private draft"} · isiXhosa · {(story.audio_duration_ms/1000).toFixed(1)} seconds</p>
  {audioUrl?<DraftAudio id={story.id} initialUrl={audioUrl}/>:<p role="alert">Playback unavailable. Refresh to retry.</p>}
  <section className="mt-8 border-t pt-6" aria-label="Story transcript">
  <h2 className="text-2xl">{published?"Published transcript":"Transcript editor"}</h2>
  <p className="mt-2">State: {story.status}. Revision: {story.transcript_revision}. {dirty?"Unsaved changes.":""}</p>
  {story.transcript_origin==="manual"?<p>Transcript source: manual entry</p>:story.ai_provider&&segments.length>0&&<p>Transcript source: {story.ai_provider==="mock"?"Synthetic mock — not a real transcription":story.ai_provider+" / "+story.ai_model}</p>}
  {story.transcription_error&&<p role="alert">Previous transcription failed: {story.transcription_error}. Retry explicitly or enter text below.</p>}
  {!published&&<div className="my-5 space-y-3">
   <p>Provider: {provider}. {provider==="mock"?"Synthetic demo, no external speech processing.":"Starting transcription sends this saved audio to the configured provider. Review permission before proceeding."}</p>
   {!segments.length&&<>
    <label className="flex items-start gap-2"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)} disabled={!ready||!sessionValid||pending}/>I have permission to send this audio to the displayed transcription provider.</label>
    <button className="rounded border px-3 py-2 disabled:opacity-50" disabled={!ready||!sessionValid||pending||!consent} onClick={()=>operation("transcribe")}>{story.status==="transcription_failed"||story.status==="transcribing"?"Retry transcription":"Transcribe audio"}</button>
   </>}
   {story.status==="transcribing"&&<p>Processing state is persisted. Refresh does not start another request. An active attempt is protected for five minutes; after interruption, retry explicitly after expiry.</p>}
   <label className="block">Paste or type isiXhosa transcript<textarea className="mt-2 block min-h-24 w-full rounded border p-2" maxLength={50000} value={pasted} onChange={event=>{setPasted(event.target.value);setDirty(true);}} disabled={!ready||!sessionValid||pending}/></label>
   <button className="rounded border px-3 py-2 disabled:opacity-50" disabled={!ready||!sessionValid||pending||!pasted.trim()} onClick={paste}>Use pasted transcript</button>
  </div>}
  <label className="my-4 block">Story title<input className="mt-2 block w-full rounded border p-2" value={title} maxLength={200} disabled={!ready||!sessionValid||pending||published} onChange={event=>{setTitle(event.target.value);setDirty(true);}}/></label>
  <p>Timings are {segments.some(row=>row.timing_source==="provider")?"provider supplied where labelled; edits recalculate approximate timings":"approximate, estimated from text length"}.</p>
  <ol className="mt-4 space-y-5">{segments.map((row,index)=><li key={row.id} className="rounded border p-3">
   <label className="block">Segment {index+1}<textarea aria-label={"Segment "+(index+1)} ref={node=>{fields.current[row.id]=node;}} className="mt-2 block min-h-20 w-full rounded border p-2" value={row.text} disabled={!ready||!sessionValid||pending||published} onChange={event=>{setSegments(current=>{const next=current.map(item=>({...item,text:item.id===row.id?event.target.value:item.text,timing_source:"estimated" as const}));try{return estimateTimings(next,story.audio_duration_ms);}catch{return next;}});setDirty(true);}}/></label>
   <p className="text-sm">{(row.start_ms/1000).toFixed(2)}–{(row.end_ms/1000).toFixed(2)} seconds ({row.timing_source==="estimated"?"approximate":"provider"})</p>
   {!published&&<div className="mt-2 flex flex-wrap gap-4"><button className="underline disabled:opacity-50" disabled={!ready||!sessionValid||pending} onClick={()=>split(index)}>Split segment {index+1} at cursor</button><button className="underline disabled:opacity-50" disabled={!ready||!sessionValid||pending||index===segments.length-1} onClick={()=>merge(index)}>Merge segment {index+1} with next</button></div>}
  </li>)}</ol>
  {!published&&<p className="mt-4">Publishing makes this original visible to signed-in users and prevents further transcript editing.</p>}
  <p className="mt-4">Translation provider: {translationProvider}. Publishing starts English translation from the saved transcript.</p><label className="mt-3 flex gap-2"><input type="checkbox" checked={translationConsent} disabled={!ready||!sessionValid||pending} onChange={event=>setTranslationConsent(event.target.checked)}/>I have permission to send this transcript text for translation after publishing.</label>
  <div className="mt-5 flex flex-wrap gap-4">
   {!published&&<><button className="rounded border px-3 py-2 disabled:opacity-50" disabled={!ready||!sessionValid||pending||!segments.length||!!pasted.trim()} onClick={()=>operation("save")}>Save transcript</button><button className="rounded border px-3 py-2 disabled:opacity-50" disabled={!ready||!sessionValid||pending||dirty||!translationConsent||!segments.length||story.status!=="transcript_ready"} onClick={()=>operation("publish")}>Publish story</button></>}
   <button className="underline disabled:opacity-50" disabled={!ready||pending} onClick={()=>operation("reload")}>Reload saved state</button>
  </div>
  {published&&<p className="mt-4">The original transcript and audio are preserved. English translation is pending; translation processing arrives in M5.</p>}
  <p className="mt-4" aria-live="polite" data-testid="transcript-message">{message}</p>
 </section></>;
}
