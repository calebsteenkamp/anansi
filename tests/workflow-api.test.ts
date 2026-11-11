import {beforeEach,it,expect,vi} from "vitest";
const m=vi.hoisted(()=>({session:vi.fn(),snapshot:vi.fn(),admin:vi.fn(),store:vi.fn(),rpc:vi.fn(),claim:vi.fn(),finish:vi.fn(),download:vi.fn(),transcribe:vi.fn()}));
vi.mock("../lib/supabase/story-workflow",()=>({workflowSession:m.session,storySnapshot:m.snapshot,workflowAdmin:m.admin,transcriptionStore:m.store}));
vi.mock("../lib/providers",()=>({providers:()=>({transcribe:m.transcribe})}));
vi.mock("../lib/providers/core",()=>({configFromEnv:()=>({transcription:"mock",translation:"mock"})}));
import {POST as transcribe} from "../app/api/stories/[id]/transcribe/route";
import {POST as publish} from "../app/api/stories/[id]/publish/route";
import {GET,PUT} from "../app/api/stories/[id]/transcript/route";
import {AudioError} from "../lib/audio";
const id="11111111-1111-4111-8111-111111111111",sid="22222222-2222-4222-8222-222222222222";
const context={params:Promise.resolve({id})};
function request(body:unknown,method="POST",origin="http://localhost:3000"){return new Request("http://localhost:3000/api/stories/"+id,{method,headers:{origin,"content-type":"application/json"},body:JSON.stringify(body)});}
beforeEach(()=>{
 vi.clearAllMocks();
 m.session.mockResolvedValue({db:{rpc:m.rpc},userId:"owner"});
 m.snapshot.mockResolvedValue({id,author_id:"owner",status:"draft",audio_duration_ms:1000,transcript_revision:0,segments:[]});
 m.admin.mockReturnValue({rpc:m.rpc});m.rpc.mockResolvedValue({data:{id},error:null});
 m.claim.mockResolvedValue({reused:false,token:"token",audio_path:"owner/file.mp3",audio_duration_ms:1000});m.finish.mockResolvedValue(undefined);m.download.mockResolvedValue(new Uint8Array([1]));
 m.store.mockReturnValue({claim:m.claim,finish:m.finish,download:m.download});m.transcribe.mockResolvedValue({text:"Molo.",provenance:{provider:"mock",model:"synthetic-v1",mock:true}});
});
it("GET only reads and never invokes provider/privileged writes",async()=>{expect((await GET(new Request("http://localhost:3000"),context)).status).toBe(200);expect(m.admin).not.toHaveBeenCalled();expect(m.transcribe).not.toHaveBeenCalled();});
it("rejects unauthenticated and foreign authors before provider/publish work",async()=>{
 m.session.mockRejectedValueOnce(new AudioError("unauthenticated","Sign in",401));expect((await transcribe(request({consent:true}),context)).status).toBe(401);
 m.snapshot.mockResolvedValue({author_id:"other"});expect((await transcribe(request({consent:true}),context)).status).toBe(404);expect((await publish(request({revision:0}),context)).status).toBe(404);expect(m.admin).not.toHaveBeenCalled();expect(m.transcribe).not.toHaveBeenCalled();
});
it("requires same origin/consent and claims before calling the adapter once",async()=>{
 expect((await transcribe(request({consent:true},"POST","https://foreign.example"),context)).status).toBe(403);
 expect((await transcribe(request({}),context)).status).toBe(400);expect(m.transcribe).not.toHaveBeenCalled();
 expect((await transcribe(request({consent:true}),context)).status).toBe(200);expect(m.claim).toHaveBeenCalledOnce();expect(m.transcribe).toHaveBeenCalledOnce();expect(m.finish).toHaveBeenCalledOnce();
});
it("reuses a saved transcript even without a new consent/provider call",async()=>{m.snapshot.mockResolvedValue({author_id:"owner",segments:[{id:sid,text:"Molo."}]});expect((await transcribe(request({}),context)).status).toBe(200);expect(m.transcribe).not.toHaveBeenCalled();expect(m.admin).not.toHaveBeenCalled();});
it("validates save and uses user session rather than the admin capability",async()=>{
 expect((await PUT(request({title:"T",revision:0,segments:[]},"PUT"),context)).status).toBe(400);
 expect((await PUT(request({title:"T",revision:0,segments:[{id:sid,text:"Molo.",start_ms:9999}]},"PUT"),context)).status).toBe(200);
 expect(m.rpc).toHaveBeenCalledWith("m4_save_transcript",expect.objectContaining({p_revision:0,p_segments:[expect.objectContaining({start_ms:0,end_ms:1000,timing_source:"estimated"})]}));expect(m.admin).not.toHaveBeenCalled();
});
it("publishes using verified actor/config and never calls translation/transcription",async()=>{expect((await publish(request({revision:0,translationConsent:true,translationProvider:"mock",author_id:"forged",provider:"forged"}),context)).status).toBe(200);expect(m.rpc).toHaveBeenCalledWith("m4_publish",expect.objectContaining({p_actor:"owner",p_provider:"mock",p_model:"synthetic-v1"}));expect(m.transcribe).not.toHaveBeenCalled();});

it("rejects publication without text consent or after displayed provider changes",async()=>{expect((await publish(request({revision:0}),context)).status).toBe(400);expect((await publish(request({revision:0,translationConsent:true,translationProvider:"openai"}),context)).status).toBe(409);expect(m.admin).not.toHaveBeenCalled();});
