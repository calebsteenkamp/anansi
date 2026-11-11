import {beforeEach,it,expect,vi} from "vitest";
const m=vi.hoisted(()=>({session:vi.fn(),reserve:vi.fn(),finish:vi.fn()}));
vi.mock("../lib/supabase/story-workflow",()=>({workflowSession:m.session}));
vi.mock("../lib/supabase/uploads",()=>({reserveUpload:m.reserve,finalizeUpload:m.finish}));
import {POST} from "../app/api/stories/drafts/route";
import {POST as finalize} from "../app/api/stories/drafts/[id]/finalize/route";
import {AudioError} from "../lib/audio";
function request(body:object={},origin="http://localhost:3000"){return new Request("http://localhost:3000/api",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({consent:true,size:1000,filename:"a.mp3",...body})});}
beforeEach(()=>{vi.resetAllMocks();m.session.mockResolvedValue({userId:"trusted"});m.reserve.mockResolvedValue({id:"reserved",token:"scoped"});m.finish.mockResolvedValue({id:"saved"});});
it("denies foreign origin and missing identity before privileged storage",async()=>{expect((await POST(request({},"https://evil.example"))).status).toBe(403);expect(m.session).not.toHaveBeenCalled();m.session.mockRejectedValue(new AudioError("unauthenticated","Sign in",401));expect((await POST(request())).status).toBe(401);expect(m.reserve).not.toHaveBeenCalled();});
it("rejects missing consent, over-limit size and unsupported format",async()=>{for(const body of [{consent:false},{size:25000001},{size:0},{filename:"a.html",mediaType:"text/html"}])expect((await POST(request(body))).status).toBeGreaterThanOrEqual(400);expect(m.reserve).not.toHaveBeenCalled();});
it("ignores forged ownership/path/state and passes only validated reservation hints",async()=>{const r=await POST(request({author_id:"evil",path:"../evil",duration:1,status:"published"}));expect(r.status).toBe(201);expect(r.headers.get("cache-control")).toContain("no-store");expect(m.reserve).toHaveBeenCalledExactlyOnceWith("trusted",{size:1000,media:"audio/mpeg"});});
it("finalization uses verified actor and route ID, never browser timing/MIME",async()=>{expect((await finalize(request({duration:1,path:"evil"}),{params:Promise.resolve({id:"route-id"})})).status).toBe(201);expect(m.finish).toHaveBeenCalledExactlyOnceWith("trusted","route-id");});
it("sanitizes unavailable infrastructure",async()=>{m.reserve.mockRejectedValue(new Error("private key"));const r=await POST(request());expect(r.status).toBe(503);expect(await r.text()).not.toContain("private key");});
