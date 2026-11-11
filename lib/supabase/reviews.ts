import "server-only";
import type {SupabaseClient} from "@supabase/supabase-js";
import {AudioError} from "../audio";
import type {ReviewState} from "../reviews";
import type {StorySnapshot} from "./story-workflow";
export async function reviewState(db:SupabaseClient,story:StorySnapshot,userId:string):Promise<ReviewState>{
 const linked=await db.from("stories").select("id,author_id").eq("parent_story_id",story.id).eq("status","awaiting_verification").maybeSingle();
 if(linked.error||!linked.data)throw new AudioError("not_found","Completed translation not found.",404);
 const target=linked.data;
 const [profile,reviews]=await Promise.all([db.from("profiles").select("spoken_languages").eq("id",userId).single(),db.from("reviews").select("id,reviewer_id,decision,rating,intent_comment,updated_at,reuse_for_translation").eq("translation_story_id",target.id)]);
 if(profile.error||reviews.error)throw new AudioError("unavailable","Reviews unavailable. Refresh to retry.",503);
 const rows=reviews.data,ids=rows.map(r=>r.id),people=[...new Set(rows.map(r=>r.reviewer_id))];
 const [edits,names]=await Promise.all([ids.length?db.from("review_edits").select("review_id,segment_id,corrected_text").in("review_id",ids):Promise.resolve({data:[],error:null}),people.length?db.from("profiles").select("id,display_name").in("id",people):Promise.resolve({data:[],error:null})]);
 if(edits.error||names.error)throw new AudioError("unavailable","Review corrections unavailable.",503);
 return {userId,translationId:target.id,eligible:profile.data.spoken_languages.includes("xh")&&profile.data.spoken_languages.includes("en"),reviews:rows.map(r=>({reuse:r.reuse_for_translation,id:r.id,reviewer_id:r.reviewer_id,decision:r.decision,rating:r.rating,intent:r.intent_comment,updated_at:r.updated_at,name:names.data?.find(n=>n.id===r.reviewer_id)?.display_name||"Unnamed reviewer",storyteller:r.reviewer_id===target.author_id,edits:(edits.data??[]).filter(e=>e.review_id===r.id).map(e=>({segment_id:e.segment_id,text:e.corrected_text}))}))};
}
