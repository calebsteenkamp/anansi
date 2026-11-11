"use client";
import {useEffect,useRef,useState,type RefObject} from "react";
import {claimPlayback,releasePlayback} from "../../../lib/playback";
export function DraftAudio({id,initialUrl,audioRef,onTimeChange}:{id:string;initialUrl:string;audioRef?:RefObject<HTMLAudioElement|null>;onTimeChange?:(ms:number)=>void}){
 const internal=useRef<HTMLAudioElement|null>(null),element=audioRef??internal;
 const owner=useRef<symbol>(Symbol("original audio"));
 const [url,setUrl]=useState(initialUrl),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{
  const audio=element.current,key=owner.current;
  const stop=()=>{audio?.pause();releasePlayback(key);};window.addEventListener("pagehide",stop);
  return()=>{stop();window.removeEventListener("pagehide",stop);};
 },[element,url]);
 async function refresh(){
  setBusy(true);setMessage("");element.current?.pause();
  try{const response=await fetch("/api/stories/"+id+"/audio",{cache:"no-store"});const result=await response.json();if(!response.ok||!result.url)throw new Error(result.error?.message||"Playback could not be renewed.");setUrl(result.url);onTimeChange?.(0);setMessage("Playback renewed. Press play.");}
  catch(error){setMessage(error instanceof Error?error.message:"Playback failed. Refresh and try again.");}finally{setBusy(false);}
 }
 return <section className="mt-6 flex flex-col gap-3" aria-label="Saved audio">
  <audio className="w-full max-w-full" key={url} ref={element} aria-label="Saved draft audio" src={url} controls preload="metadata"
   onPlay={event=>{const audio=event.currentTarget;claimPlayback(owner.current,()=>audio.pause());}}
   onPause={()=>releasePlayback(owner.current)} onEnded={()=>{releasePlayback(owner.current);onTimeChange?.(-1);}}
   onTimeUpdate={event=>onTimeChange?.(event.currentTarget.currentTime*1000)} onSeeked={event=>onTimeChange?.(event.currentTarget.currentTime*1000)}
   onError={()=>{releasePlayback(owner.current);setMessage("Audio did not load. Renew playback or refresh the page.");}}/>
  <p>Playback links expire after 5 minutes. Keep these private links to yourself.</p><button className="w-fit underline" disabled={busy} onClick={refresh}>{busy?"Renewing…":"Renew playback"}</button><p role="status">{message}</p>
 </section>;
}
