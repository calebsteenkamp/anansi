"use client";
import {useState} from "react";
export function DraftAudio({id, initialUrl}:{id:string; initialUrl:string}) {
 const [url, setUrl] = useState(initialUrl);
 const [message, setMessage] = useState("");
 const [busy, setBusy] = useState(false);
 async function refresh() {
  setBusy(true); setMessage("");
  try {
   const response = await fetch("/api/stories/" + id + "/audio", {cache:"no-store"});
   const result = await response.json();
   if (!response.ok || !result.url) throw new Error(result.error?.message || "Playback could not be renewed.");
   setUrl(result.url); setMessage("Playback renewed. Press play.");
  } catch (error) {setMessage(error instanceof Error ? error.message : "Playback failed. Refresh and try again.");}
  finally {setBusy(false);}
 }
 return <section className="mt-6 flex flex-col gap-3" aria-label="Saved audio">
  <audio key={url} aria-label="Saved draft audio" src={url} controls preload="metadata" onError={() => setMessage("Audio did not load. Renew playback or refresh the page.")}/>
  <p>Playback links expire after 5 minutes. Keep these private links to yourself.</p>
  <button className="w-fit underline" disabled={busy} onClick={refresh}>{busy ? "Renewing…" : "Renew playback"}</button>
  <p role="status">{message}</p>
 </section>;
}
