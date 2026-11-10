import "server-only";
import {createClient} from "@supabase/supabase-js";
import type {DraftStore} from "../drafts";
// This capability is used only after verified identity, same-origin, consent and actual-byte validation.
// Browser modules must never import it. It does not accept caller-supplied paths or ownership.
export function draftStore(): DraftStore {
 const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
 if (!secret) throw new Error("Server storage configuration missing.");
 const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secret, {auth:{persistSession:false,autoRefreshToken:false}});
 return {
  async upload(path, bytes, mediaType) {
   const {error} = await db.storage.from("story-audio").upload(path, bytes, {contentType:mediaType,upsert:false,cacheControl:"0"});
   if (error) throw new Error("Audio upload failed.");
  },
  async insert(row) {
   const {error} = await db.from("stories").insert(row);
   if (error) throw new Error("Draft finalization failed.");
  },
  async isFinalized(id, userId, path) {
   const {data,error} = await db.from("stories").select("id").eq("id",id).eq("author_id",userId).eq("audio_path",path).maybeSingle();
   if (error) throw new Error("Finalization could not be checked.");
   return !!data;
  },
  async remove(path) {
   const {error} = await db.storage.from("story-audio").remove([path]);
   if (error) throw new Error("Audio cleanup failed.");
  }
 };
}
