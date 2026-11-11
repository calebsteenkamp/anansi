import {it,expect} from "vitest";
import {demoArguments,demoPlan} from "../lib/demo";
const a="10000000-0000-4000-8000-000000000001",b="10000000-0000-4000-8000-000000000002";
const args=["--storyteller-id",a,"--verifier-id",b];
const source={sample:1 as const,bytes:new Uint8Array([1,2,3]),reference:"Molo."};
it("defaults to dry-run and accepts only explicit apply with distinct valid users",()=>{
 expect(demoArguments(args)).toEqual({storyteller:a,verifier:b,sample:1,apply:false});
 expect(demoArguments([...args,"--sample","2","--apply"]).apply).toBe(true);
});
it.each([[],[...args,"--apply","--apply"],[...args,"--sample"],[...args,"--sample","3"],[...args,"--other"],[...args,"--storyteller-id",a],["--storyteller-id",a,"--verifier-id",a]].map(input=>({input})))("rejects ambiguous/incomplete seed arguments $input",({input})=>expect(()=>demoArguments(input)).toThrow());
it("scopes stable IDs to author, source bytes and fixture purpose",()=>{
 const plan=demoPlan(a,b,source);expect(demoPlan(a,b,source)).toEqual(plan);expect(plan.backup).not.toBe(plan.draft);
 expect(demoPlan(b,a,source).backup).not.toBe(plan.backup);expect(demoPlan(a,b,{...source,bytes:new Uint8Array([4])}).backup).not.toBe(plan.backup);
 expect(plan.backup).toMatch(/^[0-9a-f-]{36}$/);
});
it.each([{...source,bytes:new Uint8Array()},{...source,reference:" "}])("rejects missing supplied input",input=>expect(()=>demoPlan(a,b,input)).toThrow());
