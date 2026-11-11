import {beforeEach,it,expect,vi} from "vitest";
const {server,signin,signup,rpc,signout}=vi.hoisted(()=>({server:vi.fn(),signin:vi.fn(),signup:vi.fn(),rpc:vi.fn(),signout:vi.fn()}));
vi.mock("../lib/supabase/server",()=>({serverClient:server}));
import {POST} from "../app/api/auth/[mode]/route";
function request(origin="http://localhost:3000"){const f=new FormData();f.set("email","fixture@example.com");f.set("password","fixture-password");return new Request("http://localhost:3000/api/auth/sign-in",{method:"POST",headers:{origin},body:f});}
const params={params:Promise.resolve({mode:"sign-in"})};
beforeEach(()=>{vi.clearAllMocks();server.mockResolvedValue({rpc,auth:{signInWithPassword:signin,signUp:signup,signOut:signout}});signin.mockResolvedValue({data:{user:{id:"u"}},error:null});rpc.mockImplementation(async(name:string)=>({data:name==="m10_demo_access",error:null}));});
it("denies cross-origin auth before accessing Supabase",async()=>{expect((await POST(request("https://foreign.example"),params)).status).toBe(403);expect(server).not.toHaveBeenCalled();});
it("returns a private JSON success without action protocol or credentials",async()=>{const response=await POST(request(),params);expect(response.status).toBe(200);expect(await response.json()).toEqual({redirect:"/account"});expect(response.headers.get("cache-control")).toContain("no-store");});
it("normalizes rejected and unavailable authentication without leaking errors",async()=>{signin.mockResolvedValue({error:{message:"private"}});expect((await POST(request(),params)).status).toBe(401);server.mockRejectedValue(new Error("secret"));const response=await POST(request(),params);expect(response.status).toBe(503);expect(await response.text()).not.toContain("secret");});
it("retains the confirmation-required registration path",async()=>{signup.mockResolvedValue({data:{session:null},error:null});const response=await POST(request(),{params:Promise.resolve({mode:"sign-up"})});expect(await response.json()).toMatchObject({message:expect.stringContaining("confirm")});});

it("bounds actual request bytes before credential or service access",async()=>{const response=await POST(new Request("http://localhost:3000/api/auth/sign-in",{method:"POST",headers:{origin:"http://localhost:3000","content-type":"application/x-www-form-urlencoded"},body:"email="+"x".repeat(17000)}),params);expect(response.status).toBe(413);expect(server).not.toHaveBeenCalled();});

it("blocks nonmembers and clears the newly created session",async()=>{rpc.mockResolvedValue({data:false,error:null});expect((await POST(request(),params)).status).toBe(403);expect(signout).toHaveBeenCalledOnce();});
it("closed registration never calls signUp",async()=>{rpc.mockResolvedValue({data:true,error:null});expect((await POST(request(),{params:Promise.resolve({mode:"sign-up"})})).status).toBe(403);expect(signup).not.toHaveBeenCalled();});
