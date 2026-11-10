import {AudioError} from "./audio";
export type InspectedAudio = {durationMs: number; mediaType: "audio/mpeg" | "audio/mp4" | "audio/webm" | "audio/wav"; extension: string};
export type DraftRecord = {
 id: string; author_id: string; kind: "original"; language: "xh"; title: string; status: "draft";
 audio_path: string; audio_duration_ms: number; audio_consent_at: string; audio_media_type: string; audio_size_bytes: number;
};
export interface DraftStore {
 upload(path: string, bytes: Uint8Array, mediaType: string): Promise<void>;
 insert(row: DraftRecord): Promise<void>;
 remove(path: string): Promise<void>;
 isFinalized(id: string, userId: string, path: string): Promise<boolean>;
}
export async function persistDraft(store: DraftStore, input: {id: string; userId: string; bytes: Uint8Array; audio: InspectedAudio; consentAt: string}) {
 const path = input.userId + "/" + input.id + "/original." + input.audio.extension;
 let attemptedInsert = false;
 try {
  await store.upload(path, input.bytes, input.audio.mediaType);
  attemptedInsert = true;
  await store.insert({
   id: input.id, author_id: input.userId, kind: "original", language: "xh", title: "Untitled story", status: "draft",
   audio_path: path, audio_duration_ms: input.audio.durationMs, audio_consent_at: input.consentAt,
   audio_media_type: input.audio.mediaType, audio_size_bytes: input.bytes.byteLength
  });
  return {id: input.id};
 } catch {
  if (attemptedInsert) {
   try { if (await store.isFinalized(input.id, input.userId, path)) return {id: input.id}; }
   catch { throw new AudioError("cleanup_required", "Saving could not be confirmed. Do not retry yet; contact the owner with draft ID " + input.id + ".", 503); }
  }
  // Remove even when the upload response was lost: the server may have stored the object.
  {
   try { await store.remove(path); }
   catch { throw new AudioError("cleanup_required", "Saving failed and cleanup needs attention. Do not retry yet; contact the owner with draft ID " + input.id + ".", 503); }
  }
  throw new AudioError("save_failed", "The draft could not be saved. The attempted upload was removed. Your preview is still available; try again.", 503);
 }
}
