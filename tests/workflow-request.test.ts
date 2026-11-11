import {it,expect} from "vitest";
import {rpcError,workflowBody} from "../lib/workflow-request";
it("reads bounded JSON and denies foreign/malformed requests",async()=>{
 const make=(body:string,origin="http://localhost:3000")=>new Request("http://localhost:3000",{method:"POST",headers:{origin,"content-type":"application/json"},body});
 expect(await workflowBody(make('{"revision":0}'))).toEqual({revision:0});
 await expect(workflowBody(make("{}","https://foreign.example"))).rejects.toMatchObject({status:403});
 await expect(workflowBody(make("["))).rejects.toMatchObject({status:400});
 await expect(workflowBody(make("x".repeat(256001)))).rejects.toMatchObject({status:413});
});
it("maps state conflicts and hides raw database errors",()=>{expect(()=>rpcError({message:"revision_conflict"})).toThrow(/changed elsewhere/);expect(()=>rpcError({message:"private database password"})).toThrow("Story operation unavailable. Check the active milestone setup or try again.");});
