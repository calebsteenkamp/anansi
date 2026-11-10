import {it,expect,vi,beforeEach} from "vitest";
import {NextRequest} from "next/server";
const {client}=vi.hoisted(()=>({client:vi.fn()}));
vi.mock("@supabase/ssr",()=>({createServerClient:client}));
import {proxy} from "../proxy";
beforeEach(()=>vi.clearAllMocks());
it("refreshes claims and propagates refreshed cookies without shared caching",async()=>{
 const claims=vi.fn().mockResolvedValue({data:{claims:{sub:"fixture"}}});
 client.mockImplementation((_url,_key,options)=>({auth:{getClaims:async()=>{options.cookies.setAll([{name:"sb-fixture",value:"refreshed",options:{httpOnly:true,path:"/"}}]);return claims();}}}));
 const request=new NextRequest("http://localhost:3000/account");const response=await proxy(request);
 expect(claims).toHaveBeenCalledOnce();expect(request.cookies.get("sb-fixture")?.value).toBe("refreshed");expect(response.cookies.get("sb-fixture")?.value).toBe("refreshed");expect(response.headers.get("Cache-Control")).toContain("no-store");expect(response.headers.get("Pragma")).toBe("no-cache");
});
it("still disables shared caching for an unauthenticated response",async()=>{
 client.mockReturnValue({auth:{getClaims:vi.fn().mockResolvedValue({data:null,error:{message:"invalid"}})}});
 expect((await proxy(new NextRequest("http://localhost:3000/account"))).headers.get("Cache-Control")).toContain("private");
});
