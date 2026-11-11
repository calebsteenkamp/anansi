"use client";
import {useEffect, useRef, useState, useSyncExternalStore} from "react";
import {createBrowserClient} from "@supabase/ssr";
import {useRouter} from "next/navigation";
import {AUDIO_ACCEPT, MAX_AUDIO_BYTES, selectRecordingType} from "../../../lib/audio";
import {recordingSession} from "../../../lib/recording";

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
export function CaptureForm() {
 const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
 const router = useRouter();
 const reservation=useRef<{file:File;id:string}|null>(null);
 const [file, setFile] = useState<File | null>(null);
 const [preview, setPreview] = useState("");
 const [consent, setConsent] = useState(false);
 const [recording, setRecording] = useState(false);
 const [requesting, setRequesting] = useState(false);
 const [busy, setBusy] = useState(false);
 const [elapsed, setElapsed] = useState(0);
 const [message, setMessage] = useState("");
 const stream = useRef<MediaStream | null>(null);
 const recorder = useRef<ReturnType<typeof recordingSession> | null>(null);
 const timer = useRef<ReturnType<typeof setInterval> | null>(null);
 const previewUrl = useRef("");
 const mounted = useRef(true);
 const saving = useRef(false);
 useEffect(() => {
  mounted.current = true;
  return () => {
   mounted.current = false;
   if (timer.current) clearInterval(timer.current);
   recorder.current?.dispose();
   stream.current?.getTracks().forEach(track => track.stop());
   if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  };
 }, []);
 function chooseFile(next: File | null) {
  if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  previewUrl.current = "";
  reservation.current=null;
  setFile(null); setPreview(""); setConsent(false); setMessage("");
  if (!next) return;
  if (!next.size || next.size > MAX_AUDIO_BYTES) {setMessage("Choose a nonempty audio file of 25 MB or smaller."); return;}
  previewUrl.current = URL.createObjectURL(next);
  setFile(next); setPreview(previewUrl.current);
 }
 function stopRecording() {
  recorder.current?.stop();
  if (timer.current) {clearInterval(timer.current); timer.current = null;}
 }
 async function startRecording() {
  setMessage(""); setRequesting(true);
  let acquired: MediaStream | null = null;
  try {
   if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined")
    throw new Error("Recording is unavailable. Use Upload audio below. Phone microphone access needs HTTPS or localhost.");
   const mimeType = selectRecordingType(type => MediaRecorder.isTypeSupported(type));
   if (!mimeType) throw new Error("No supported recording format was found. Use Upload audio below.");
   acquired = await navigator.mediaDevices.getUserMedia({audio:true});
   if (!mounted.current) {acquired.getTracks().forEach(track => track.stop()); return;}
   chooseFile(null);
   stream.current = acquired;
   const nextRecorder = new MediaRecorder(acquired, {mimeType, audioBitsPerSecond:128000});
   const finished = () => {
    if (!mounted.current) return;
    if (timer.current) {clearInterval(timer.current); timer.current = null;}
    stream.current = null; setRecording(false);
   };
   recorder.current = recordingSession(nextRecorder, acquired, mimeType, recorded => {
    if (!mounted.current) return;
    finished(); chooseFile(recorded);
    setMessage("Recording ready. Preview it and confirm permission before saving.");
   }, error => {if (mounted.current) {finished(); setMessage(error);}});
   nextRecorder.start(250);
   const started = performance.now();
   setElapsed(0); setRecording(true);
   timer.current = setInterval(() => {
    const seconds = (performance.now() - started) / 1000;
    setElapsed(Math.floor(seconds));
    // Leave space for the recorder's final encoded packet; server still enforces <=180 seconds.
    if (seconds >= 179) stopRecording();
   }, 200);
  } catch (error) {
   acquired?.getTracks().forEach(track => track.stop());
   if (mounted.current) setMessage(error instanceof Error && error.name !== "NotAllowedError" ? error.message : "Microphone permission was denied. You can upload an audio file below.");
  } finally {if (mounted.current) setRequesting(false);}
 }
 async function save(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (!file || !consent || saving.current) return;
  saving.current = true; setBusy(true); setMessage("Validating and saving your private draft…");
  try {
   let id=reservation.current?.file===file?reservation.current.id:null;
   if(!id){
    const response=await fetch("/api/stories/drafts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consent,size:file.size,mediaType:file.type,filename:file.name})});
    const upload=await response.json();if(!response.ok||typeof upload.id!=="string")throw new Error(upload.error?.message??"Upload setup failed. Your preview is retained.");
    id=upload.id;reservation.current={file,id:upload.id};
    const db=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    // Even if the response is lost, finalization checks whether the actual object arrived.
    await db.storage.from("story-audio-staging").uploadToSignedUrl(upload.path,upload.token,file,{contentType:upload.mediaType});
   }
   const response=await fetch("/api/stories/drafts/"+id+"/finalize",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
   const result=await response.json();
   if(!response.ok||typeof result.id!=="string"){
    if(["upload_missing","invalid_audio","audio_too_long","audio_too_large","empty_audio"].includes(result.error?.code))reservation.current=null;
    throw new Error(result.error?.message??"Saving failed. Keep your preview and retry finalization.");
   }
   router.push("/stories/" + result.id);
   router.refresh();
  } catch (error) {setMessage(error instanceof Error ? error.message : "Saving failed. Try again.");}
  finally {saving.current = false; if (mounted.current) setBusy(false);}
 }
 return <form onSubmit={save} className="mt-6 flex flex-col gap-5">
  <p>Record or upload one isiXhosa audio clip, at most 180 seconds and 25 MB. Supported containers: MP3, MP4/M4A, WAV and WebM. Audio is saved unchanged and stays private as a draft.</p>
  <div className="flex flex-wrap gap-4">
   <button type="button" disabled={!ready || recording || requesting || busy} onClick={startRecording} className="rounded border px-4 py-2 disabled:opacity-50">{requesting ? "Requesting microphone…" : file ? "Record again" : "Start recording"}</button>
   {recording && <button type="button" onClick={stopRecording} className="rounded border px-4 py-2">Stop recording</button>}
  </div>
  {recording && <p role="status">Recording: {elapsed} seconds. Automatically stops at about 179 seconds to leave room for the final audio packet.</p>}
  <label className="flex flex-col gap-2">Upload audio
   <input type="file" accept={AUDIO_ACCEPT} disabled={!ready || recording || requesting || busy} onChange={event => chooseFile(event.target.files?.[0] ?? null)} className="rounded border p-2"/>
  </label>
  {preview && <section aria-label="Audio preview" className="flex flex-col gap-2"><p>Preview: {file?.name}</p><audio aria-label="Preview audio" src={preview} controls preload="metadata"/></section>}
  <label className="flex items-start gap-3"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} disabled={!file || busy || recording} className="mt-1"/><span>I own this audio or have permission from the storyteller and everyone recorded to record, upload, and use it in Anansi.</span></label>
  <button type="submit" disabled={!file || !consent || busy || recording || requesting} className="rounded border px-4 py-2 disabled:opacity-50">{busy ? "Saving…" : "Save private draft"}</button>
  <p role="status" aria-live="polite">{message}</p>
 </form>;
}
