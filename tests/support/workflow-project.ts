import {preflight} from "./supabase";
export async function workflowPreflight(browser=false){
 const c=await preflight(browser);
 const schema=await c.admin.from("stories").select("transcript_revision,transcript_origin,transcription_claim,transcription_claim_expires_at,transcription_error").limit(1);
 if(schema.error)throw new Error("BLOCKED: owner must apply the M4 transcript/publish migration before T4 integration/browser tests.");
 return c;
}
