import {it,expect,vi} from "vitest";
import {persistDraft,type DraftStore} from "../lib/drafts";
const input={id:"fixture-id",userId:"fixture-user",bytes:new Uint8Array([1]),audio:{durationMs:250,mediaType:"audio/wav" as const,extension:"wav"},consentAt:"2026-11-10T12:00:00Z"};
function store(){return {upload:vi.fn().mockResolvedValue(undefined),insert:vi.fn().mockResolvedValue(undefined),remove:vi.fn().mockResolvedValue(undefined),isFinalized:vi.fn().mockResolvedValue(false)} satisfies DraftStore;}
it("saves unchanged bytes under a generated owner path with consent and no provider fields",async()=>{
 const db=store();expect(await persistDraft(db,input)).toEqual({id:input.id});
 expect(db.upload).toHaveBeenCalledWith("fixture-user/fixture-id/original.wav",input.bytes,"audio/wav");
 expect(db.insert).toHaveBeenCalledWith(expect.objectContaining({author_id:input.userId,status:"draft",audio_consent_at:input.consentAt,audio_duration_ms:250}));
 expect(db.remove).not.toHaveBeenCalled();
});
it("cleans an upload if finalization fails",async()=>{const db=store();db.insert.mockRejectedValue(new Error());await expect(persistDraft(db,input)).rejects.toMatchObject({code:"save_failed"});expect(db.remove).toHaveBeenCalledOnce();});
it("cleans uncertain failed uploads and does not finalize",async()=>{const db=store();db.upload.mockRejectedValue(new Error());await expect(persistDraft(db,input)).rejects.toMatchObject({code:"save_failed"});expect(db.insert).not.toHaveBeenCalled();expect(db.remove).toHaveBeenCalledOnce();});
it("reports cleanup failure with a safe reconciliation identifier",async()=>{const db=store();db.insert.mockRejectedValue(new Error("secret"));db.remove.mockRejectedValue(new Error("secret"));await expect(persistDraft(db,input)).rejects.toMatchObject({code:"cleanup_required",message:expect.stringContaining("fixture-id")});});
it("keeps audio when the insert succeeded but its response was lost",async()=>{const db=store();db.insert.mockRejectedValue(new Error());db.isFinalized.mockResolvedValue(true);expect(await persistDraft(db,input)).toEqual({id:input.id});expect(db.remove).not.toHaveBeenCalled();});
it("preserves uncertain finalization for reconciliation rather than deleting valid audio",async()=>{const db=store();db.insert.mockRejectedValue(new Error());db.isFinalized.mockRejectedValue(new Error());await expect(persistDraft(db,input)).rejects.toMatchObject({code:"cleanup_required"});expect(db.remove).not.toHaveBeenCalled();});
