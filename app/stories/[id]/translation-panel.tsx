"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {TranslationView} from "../../../lib/translation";
export function TranslationPanel({storyId,initial,owner,provider,autoStart=false,renderSegments=true,onTranslationChange}:{storyId:string;initial:TranslationView|null;owner:boolean;provider:string;autoStart?:boolean;renderSegments?:boolean;onTranslationChange?:(view:TranslationView|null)=>void}){
 const [view,setView]=useState(initial),[consent,setConsent]=useState(autoStart),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const displayedProvider=view?.provider??provider;
 const active=useRef(false),started=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const run=useCallback(async(action:"continue"|"retry"|"refresh",permission:boolean)=>{
  if(active.current)return;active.current=true;setBusy(true);setMessage(action==="refresh"?"Refreshing saved progress…":"Translating… saved progress is retained.");
  try{
   // One durable segment per request. No automatic retry of failures or expired claims.
   for(let step=0;step<501;step++){
    const response=await fetch("/api/stories/"+storyId+"/translation",action==="refresh"?{cache:"no-store"}:{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:step===0?action:"continue",consent:permission,expectedProvider:displayedProvider})});
    if(!response.headers.get("content-type")?.includes("application/json"))throw new Error("Unexpected response. Refresh saved progress before continuing.");
    const result=await response.json();
    if(!response.ok)throw new Error(result.error?.message??"Translation request failed.");
    if(!mounted.current)return;
    const next=result.translation as TranslationView|null;setView(next);onTranslationChange?.(next);
    if(action==="refresh"){setMessage("Saved progress refreshed; no provider request.");break;}
    if(!next||next.total<1||next.total>500)throw new Error("Invalid translation progress. Refresh before continuing.");
    if(result.reused||(next&&next.complete===next.total)){setMessage("English translation complete. Community reviews appear below.");break;}
    if(!next||next.retryRequired)break;
    if(step===500)throw new Error("Processing limit reached. Refresh saved progress.");
   }
  }catch(error){
   if(mounted.current){setMessage(error instanceof Error?error.message:"Translation unavailable.");
    try{const response=await fetch("/api/stories/"+storyId+"/translation",{cache:"no-store"});if(response.ok&&mounted.current){const saved=(await response.json()).translation;setView(saved);onTranslationChange?.(saved);}}catch{/* Retain the operation error and previously saved view. */}
   }
  }finally{active.current=false;if(mounted.current)setBusy(false);}
 },[storyId,displayedProvider,onTranslationChange]);
 useEffect(()=>{if(!started.current&&(autoStart||!initial)){started.current=true;void run(autoStart?"continue":"refresh",autoStart);}},[autoStart,initial,run]);
 const done=!!view&&view.total>0&&view.complete===view.total;
 return <section className="mt-8 border-t pt-6" aria-label="English translation"><h2 className="text-2xl">English translation</h2>
  <p>Linked to the <a className="underline" href={"/stories/"+storyId}>original isiXhosa story</a> and credited to its storyteller.</p>
  <p data-testid="translation-provenance">{(view?.provider??provider)==="mock"?"Synthetic mock translation — not a linguistic evaluation":"AI translation"} · Provider: {view?.provider??provider}{view?.model?" / "+view.model:""}</p>
  {view?<><p data-testid="translation-progress">{view.complete} / {view.total} segments saved. State: {view.status}.</p>{renderSegments&&<ol className="my-4 space-y-3">{view.segments.map(row=><li key={row.id}>{row.text}</li>)}</ol>}{done&&<p>Translation processing complete.</p>}</>:<p>{owner?"Translation progress will appear here.":"The English translation is not available yet."}</p>}
  {owner&&<><p>Leaving this page stops further requests; an in-flight result may still be saved. Reloading never starts processing. Claims expire after five minutes. A provider response lost before saving can require another paid call after explicit retry.</p>
   {!done&&<><label className="my-4 flex gap-2"><input type="checkbox" checked={consent} disabled={busy||!view} onChange={event=>setConsent(event.target.checked)}/>I have permission to send this transcript text to the displayed translation provider.</label><button className="rounded border p-2 disabled:opacity-50" disabled={busy||!consent||!view} onClick={()=>void run(view?.retryRequired?"retry":"continue",consent)}>{view?.retryRequired?"Retry translation":"Continue translation"}</button></>}
   <button className="ml-4 underline disabled:opacity-50" disabled={busy} onClick={()=>void run("refresh",false)}>Refresh translation progress</button>
  </>}
  <p role="status" aria-live="polite" data-testid="translation-message">{message}</p>
 </section>;
}
