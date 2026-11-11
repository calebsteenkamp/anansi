import {beforeEach,it,expect,vi} from "vitest";
const m=vi.hoisted(()=>({getUser:vi.fn(),getClaims:vi.fn(),redirect:vi.fn(),rpc:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("next/headers",()=>({cookies:async()=>({getAll:()=>[],set:()=>{}})}));
vi.mock("next/navigation",()=>({redirect:(url:string)=>{m.redirect(url);throw new Error("redirect:"+url);}}));
vi.mock("@supabase/ssr",()=>({createServerClient:()=>({rpc:m.rpc,auth:{getUser:m.getUser,getClaims:m.getClaims}})}));
import {requireUser} from "../lib/supabase/server";
beforeEach(()=>{vi.resetAllMocks();m.rpc.mockResolvedValue({data:true,error:null});});
it("uses the verified user on every protected render and does not reuse another identity",async()=>{
 m.getUser.mockResolvedValueOnce({data:{user:{id:"A",email:"a@example.com"}},error:null}).mockResolvedValueOnce({data:{user:{id:"B",email:"b@example.com"}},error:null});
 expect(await requireUser()).toMatchObject({userId:"A",email:"a@example.com"});
 expect(await requireUser()).toMatchObject({userId:"B",email:"b@example.com"});
 expect(m.getUser).toHaveBeenCalledTimes(2);expect(m.getClaims).not.toHaveBeenCalled();
});
it("rejects an invalid session even if local claims might exist",async()=>{
 m.getClaims.mockResolvedValue({data:{claims:{sub:"old-A"}}});
 m.getUser.mockResolvedValue({data:{user:null},error:{message:"revoked"}});
 await expect(requireUser()).rejects.toThrow("redirect:/sign-in");expect(m.getClaims).not.toHaveBeenCalled();
});

it("redirects a verified nonmember without sharing protected content",async()=>{m.getUser.mockResolvedValue({data:{user:{id:"outside"}},error:null});m.rpc.mockResolvedValue({data:false,error:null});await expect(requireUser()).rejects.toThrow("redirect:/sign-in?error=demo-access");});
