import {serverClient} from "../../../../../lib/supabase/server";
import {AudioError} from "../../../../../lib/audio";
import {apiError, privateJson} from "../../../../../lib/api";
export async function GET(_request: Request, {params}:{params:Promise<{id:string}>}) {
 try {
  const db = await serverClient();
  const {data,error} = await db.auth.getClaims();
  if (error || !data?.claims.sub) throw new AudioError("unauthenticated","Sign in to listen.",401);
  const {id} = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new AudioError("not_found","Audio not found.",404);
  // RLS handles draft ownership and, later, published visibility.
  const story = await db.from("stories").select("audio_path").eq("id",id).eq("kind","original").single();
  if (story.error || !story.data?.audio_path) throw new AudioError("not_found","Audio not found.",404);
  const signed = await db.storage.from("story-audio").createSignedUrl(story.data.audio_path,300);
  if (signed.error || !signed.data?.signedUrl) throw new AudioError("playback_unavailable","Playback unavailable. Try again.",503);
  return privateJson({url:signed.data.signedUrl,expiresIn:300});
 } catch (error) {return apiError(error);}
}
