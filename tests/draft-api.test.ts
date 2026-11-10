import {beforeEach,it,expect,vi} from "vitest";
const {server,store,upload,insert,remove}=vi.hoisted(()=>({server:vi.fn(),store:vi.fn(),upload:vi.fn(),insert:vi.fn(),remove:vi.fn()}));
vi.mock("../lib/supabase/server",()=>({serverClient:server}));
vi.mock("../lib/supabase/draft-store",()=>({draftStore:store}));
import {POST} from "../app/api/stories/drafts/route";
import {wave} from "./support/audio";
beforeEach(()=>{
 vi.clearAllMocks();
 server.mockResolvedValue({auth:{getClaims:vi.fn().mockResolvedValue({data:{claims:{sub:"trusted-user"}}})}});
 upload.mockResolvedValue(undefined);insert.mockResolvedValue(undefined);remove.mockResolvedValue(undefined);
 store.mockReturnValue({upload,insert,remove,isFinalized:vi.fn().mockResolvedValue(false)});
});
function request(consent=true,bytes=wave(),origin="http://localhost:3000"){
 const form=new FormData();form.set("audio",new File([bytes as BlobPart],"forged.mp3",{type:"text/html"}));if(consent)form.set("consent","yes");form.set("author_id","attacker");form.set("status","published");form.set("duration","1");
 return new Request("http://localhost:3000/api/stories/drafts",{method:"POST",headers:{origin},body:form});
}
it("denies cross-origin mutations and missing identity before any privileged operation",async()=>{
 expect((await POST(request(true,wave(),"https://foreign.example"))).status).toBe(403);expect(server).not.toHaveBeenCalled();
 server.mockResolvedValue({auth:{getClaims:vi.fn().mockResolvedValue({data:null,error:{message:"bad"}})}});
 expect((await POST(request())).status).toBe(401);expect(store).not.toHaveBeenCalled();
});
it("rejects missing consent and malformed bytes without uploading",async()=>{
 expect((await POST(request(false))).status).toBe(400);
 expect((await POST(request(true,new TextEncoder().encode("not audio")))).status).toBe(400);
 expect(store).not.toHaveBeenCalled();
});
it("ignores forged actor, type, duration and processing fields",async()=>{
 const response=await POST(request());expect(response.status).toBe(201);expect(response.headers.get("cache-control")).toContain("no-store");
 expect(insert).toHaveBeenCalledWith(expect.objectContaining({author_id:"trusted-user",status:"draft",audio_duration_ms:250,audio_media_type:"audio/wav"}));
 expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^trusted-user\/.*\/original.wav$/),expect.any(Uint8Array),"audio/wav");
});
it("rejects overlong audio even when the browser claims one second",async()=>{const response=await POST(request(true,wave(180.1)));expect(response.status).toBe(400);expect((await response.json()).error.code).toBe("audio_too_long");expect(store).not.toHaveBeenCalled();});
it("sanitizes infrastructure errors",async()=>{server.mockRejectedValue(new Error("private token"));const response=await POST(request());expect(response.status).toBe(503);expect(await response.text()).not.toContain("private token");});
