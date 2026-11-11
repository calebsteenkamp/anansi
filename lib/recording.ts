import {MAX_AUDIO_BYTES} from "./audio";

/** Stop queues the final data event. Keep tracks alive until that event has flushed. */
export function recordingSession(recorder: MediaRecorder, stream: MediaStream, mimeType: string,
 onReady: (file: File) => void, onError: (message: string) => void) {
 const chunks: BlobPart[] = [];
 let cancelled = false, released = false, stopping = false;
 const release = () => {if (!released) {released = true; stream.getTracks().forEach(track => track.stop());}};
 const stop = () => {if (!stopping && recorder.state !== "inactive") {stopping = true; recorder.stop();}};
 recorder.ondataavailable = event => {if (!cancelled && event.data.size) chunks.push(event.data);};
 recorder.onstop = () => {
  release();
  if (cancelled) return;
  const type = recorder.mimeType || mimeType;
  const file = new File(chunks, "recording." + (type.startsWith("audio/mp4") ? "m4a" : "webm"), {type});
  if (!file.size || file.size > MAX_AUDIO_BYTES) {
   onError("No usable recording was captured, or it exceeded 25 MB. Try again or upload an audio file.");
   return;
  }
  onReady(file);
 };
 recorder.onerror = () => {
  cancelled = true;
  stop(); release();
  onError("Recording failed. Try again or use Upload audio.");
 };
 return {stop, dispose() {cancelled = true; stop(); release();}};
}
