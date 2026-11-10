import {preflight} from "./supabase";
export async function audioPreflight(browser = false) {
 const c = await preflight(browser);
 const schema = await c.admin.from("stories").select("audio_consent_at,audio_media_type,audio_size_bytes").limit(1);
 const bucket = await c.admin.storage.getBucket("story-audio");
 if (schema.error || bucket.error || bucket.data?.public !== false || Number(bucket.data?.file_size_limit) !== 25000000)
  throw new Error("BLOCKED: owner must review/apply the M3 audio-drafts migration before T3 network tests.");
 return c;
}
