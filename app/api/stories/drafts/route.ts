import {randomUUID} from "node:crypto";
import {serverClient} from "../../../../lib/supabase/server";
import {draftStore} from "../../../../lib/supabase/draft-store";
import {AudioError, validateAudioSize, validateConsent} from "../../../../lib/audio";
import {inspectAudio} from "../../../../lib/audio-probe";
import {boundedFormData, checkUploadOrigin} from "../../../../lib/audio-request";
import {persistDraft} from "../../../../lib/drafts";
import {apiError, privateJson} from "../../../../lib/api";
export async function POST(request: Request) {
 try {
  checkUploadOrigin(request);
  const db = await serverClient();
  const {data,error} = await db.auth.getClaims();
  const userId = data?.claims.sub;
  if (error || typeof userId !== "string") throw new AudioError("unauthenticated","Sign in before saving audio.",401);
  const form = await boundedFormData(request);
  validateConsent(form.get("consent"));
  const file = form.get("audio");
  if (!(file instanceof File) || form.getAll("audio").length !== 1) throw new AudioError("invalid_upload","Choose one audio file.");
  validateAudioSize(file.size);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const audio = await inspectAudio(bytes);
  // Only identity from the verified session and metadata from actual-byte inspection reach privileged persistence.
  const result = await persistDraft(draftStore(), {id:randomUUID(),userId,bytes,audio,consentAt:new Date().toISOString()});
  return privateJson(result,201);
 } catch (error) {return apiError(error);}
}
