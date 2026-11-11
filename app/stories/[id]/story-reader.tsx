"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {StorySnapshot} from "../../../lib/supabase/story-workflow";
import type {TranslationView} from "../../../lib/translation";
import {activeSegment,alignTranslations,seekTime} from "../../../lib/playback";
import {DeviceNarrator,englishDeviceVoices} from "../../../lib/device-speech";
import {DraftAudio} from "./draft-audio";
import {ReviewPanel} from "./review-panel";
import {TranslationPanel} from "./translation-panel";
export function StoryReader({story,audioUrl,initialTranslation,owner,provider,preferredLanguage,autoStart=false}:{story:StorySnapshot;audioUrl?:string;initialTranslation:TranslationView|null;owner:boolean;provider:string;preferredLanguage:"xh"|"en";autoStart?:boolean}){
 const [language,setLanguage]=useState(preferredLanguage),[translation,setTranslation]=useState(initialTranslation),[time,setTime]=useState(-1),[speechId,setSpeechId]=useState<string|null>(null),[message,setMessage]=useState("");
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[voiceId,setVoiceId]=useState(""),[voiceReady,setVoiceReady]=useState(false);
 const [overlay,setOverlay]=useState<Record<string,string>>({}),[reviewer,setReviewer]=useState<string|null>(null);
 const audio=useRef<HTMLAudioElement|null>(null),narrator=useRef<DeviceNarrator|null>(null),alive=useRef(false);
 useEffect(()=>{
  alive.current=true;
  if(!window.speechSynthesis||typeof window.speechSynthesis.getVoices!=="function"||typeof window.SpeechSynthesisUtterance!=="function"){queueMicrotask(()=>{if(alive.current)setVoiceReady(true);});return()=>{alive.current=false;};}
  const engine=window.speechSynthesis,controller=new DeviceNarrator(engine,text=>new SpeechSynthesisUtterance(text));narrator.current=controller;
  function update(){if(!alive.current)return;let available:SpeechSynthesisVoice[]=[];try{available=englishDeviceVoices(engine.getVoices());}catch{/* Device policy may deny voice enumeration; keep text/audio available. */}setVoices(available);setVoiceId(current=>available.some(v=>v.voiceURI===current)?current:available[0]?.voiceURI??"");setVoiceReady(true);}
  const hide=()=>controller.stop();update();engine.addEventListener("voiceschanged",update);window.addEventListener("pagehide",hide);
  return()=>{alive.current=false;controller.stop();narrator.current=null;engine.removeEventListener("voiceschanged",update);window.removeEventListener("pagehide",hide);};
 },[]);
 const applyOverlay=useCallback((edits:Record<string,string>,name:string|null)=>{narrator.current?.stop();setOverlay(edits);setReviewer(name);},[]);
 const aligned=alignTranslations(story.segments,(translation?.segments??[]).map(row=>({...row,text:overlay[row.id]??row.text})));
 const current=speechId??activeSegment(story.segments,time);
 const complete=!!translation&&translation.total>0&&translation.complete===translation.total&&aligned.every(Boolean);
 function seek(index:number){
  narrator.current?.stop();const next=seekTime(story.segments[index].start_ms,story.audio_duration_ms);
  if(next===null||!audio.current){setMessage("Audio is unavailable. Renew playback or refresh.");return;}
  try{audio.current.currentTime=next;setTime(next*1000);setMessage("Seeked to segment "+(index+1)+". Press play to listen if paused.");}catch{setMessage("Wait for audio to load, then try seeking again.");}
 }
 function speak(){
  const voice=voices.find(v=>v.voiceURI===voiceId);
  if(!voice||!complete||!narrator.current){setMessage("Device English voice is unavailable. Text and original audio remain available.");return;}
  setMessage("Reading English with the device voice.");
  narrator.current.start(story.segments.map((row,index)=>({id:row.id,text:aligned[index]!.text})),voice,{
   active:id=>{if(alive.current){setSpeechId(id);if(id!==null)setTime(-1);}},done:()=>{if(alive.current)setMessage("Device English reading finished.");},error:()=>{if(alive.current)setMessage("Device voice could not read this text. Text and original audio remain available.");}
  });
 }
 return <section aria-label="Story reader">
  <h1 className="text-3xl">{story.title}</h1><p className="mt-4">Published story · isiXhosa · {(story.audio_duration_ms/1000).toFixed(1)} seconds</p><p>State: published. Original transcript is read-only.</p>
  <label className="my-4 block">Reading language<select aria-label="Reading language" className="mt-2 block max-w-full rounded border p-2 sm:ml-3 sm:inline" value={language} onChange={event=>{narrator.current?.stop();setLanguage(event.target.value as "xh"|"en");}}><option value="xh">isiXhosa original</option><option value="en">Original + English</option></select></label>
  <p>Your profile sets the initial reading language; this selector changes only this page.</p>
  {audioUrl?<DraftAudio id={story.id} initialUrl={audioUrl} audioRef={audio} onTimeChange={setTime}/>:<p role="alert">Playback unavailable. Refresh to retry.</p>}
  {language==="en"&&<p>{reviewer?"Reading community corrections by "+reviewer+". AI text is preserved.":"Reading AI English text."}</p>}
  <h2 className="mt-8 text-2xl">Published transcript</h2><p>Activate a segment with mouse, Enter or Space to seek the original audio. Highlight follows the audio playhead or device narration.</p>
  <p>{story.segments.some(row=>row.timing_source==="estimated")?"Timings marked approximate are estimated from text; they may not follow the exact spoken words.":"Timings are provider supplied."}</p>
  <ol className="my-4 space-y-3">{story.segments.map((row,index)=><li key={row.id} data-testid={"reading-segment-"+index} data-active={current===row.id?"true":"false"} className={"rounded border p-3 "+(current===row.id?"border-amber-700 bg-amber-100 text-black":"")}>
   <button className="segment-seek w-full break-words text-left underline-offset-4 focus-visible:outline-2" aria-label={"Seek original audio to segment "+(index+1)} aria-describedby={"source-"+row.id+(language==="en"?" english-"+row.id:"")} aria-current={current===row.id?"true":undefined} disabled={!audioUrl} onClick={()=>seek(index)}>
    <span id={"source-"+row.id} className="block" lang="xh">{row.text}</span>{language==="en"&&<span id={"english-"+row.id} className="mt-2 block" lang="en">{aligned[index]?.text??"English translation is not available for this segment yet."}</span>}
    <span className="mt-2 block text-sm">{(row.start_ms/1000).toFixed(2)}–{(row.end_ms/1000).toFixed(2)} seconds · {row.timing_source==="estimated"?"Approximate timing":"Provider timing"}</span>
   </button>
  </li>)}</ol>
  {language==="en"&&<section aria-label="Device English narration" className="my-5 space-y-3"><h2 className="text-xl">Device English voice</h2><p>Optional on-device narration of the English text, separate from the storyteller’s original recording.</p>
   {!voiceReady?<p>Checking device voices…</p>:!voices.length?<p>No local English voice is available in this browser. Text and original audio remain available.</p>:<><label>Device English voice<select aria-label="Device English voice" className="mt-2 block max-w-full rounded border p-2 sm:ml-3 sm:inline" value={voiceId} onChange={event=>{narrator.current?.stop();setVoiceId(event.target.value);}}>{voices.map((voice,index)=><option key={voice.voiceURI+index} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select></label><div className="flex flex-wrap gap-4"><button className="rounded border p-2 disabled:opacity-50" disabled={!complete} onClick={speak}>Read English with device voice</button><button className="rounded border p-2" onClick={()=>{narrator.current?.stop();setMessage("Device voice stopped.");}}>Stop device voice</button></div>{!complete&&<p>Device narration becomes available when all English segments are saved and aligned.</p>}</>}
  </section>}
  <p role="status" data-testid="reader-message">{message}</p>
  <TranslationPanel storyId={story.id} initial={initialTranslation} owner={owner} provider={provider} autoStart={autoStart} renderSegments={false} onTranslationChange={setTranslation}/>
 {complete&&translation&&<ReviewPanel storyId={story.id} translation={translation} original={story.segments} onOverlay={applyOverlay}/>}
 </section>;
}
