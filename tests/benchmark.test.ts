import {describe,it,expect} from "vitest";
import {benchmarkPermission,reserve,validateLedger,measure,benchmarkExitCode,wordError} from "../lib/benchmark";
import {ProviderError} from "../lib/providers/types";
const flags=["--live","--permission-confirmed","--budget-note=approved","--max-openai-cents=200","--max-vulavula-calls=2"];
describe("benchmark safety",()=>{
 it("requires permission and numeric caps",()=>{for(const args of [[],flags.slice(0,3),flags.filter(x=>x!=="--permission-confirmed"),[...flags,"--max-openai-cents=3"]])expect(()=>benchmarkPermission(args)).toThrow();expect(benchmarkPermission(flags)).toEqual({openaiReservedCents:200,vulavulaCalls:2});});
 it.each(["NaN","Infinity","-1","2.5","50001"])("rejects invalid dollar caps %s",value=>expect(()=>benchmarkPermission(flags.map(x=>x.startsWith("--max-openai-cents=")?"--max-openai-cents="+value:x))).toThrow());
 it("refuses insufficient per-run money before network",()=>expect(()=>reserve({openaiReservedCents:200,vulavulaCalls:4},"openai",{openaiReservedCents:100,vulavulaCalls:0},{openaiReservedCents:100,vulavulaCalls:2})).toThrow("budget"));
 it("enforces total owner ceiling and free calls",()=>{expect(()=>reserve({openaiReservedCents:50000,vulavulaCalls:4},"openai",{openaiReservedCents:0,vulavulaCalls:0},{openaiReservedCents:200,vulavulaCalls:2})).toThrow();expect(()=>reserve({openaiReservedCents:0,vulavulaCalls:100},"vulavula",{openaiReservedCents:0,vulavulaCalls:0},{openaiReservedCents:200,vulavulaCalls:2})).toThrow();});
 it("reserves exact boundary without mutating original ledger",()=>{const before={openaiReservedCents:49900,vulavulaCalls:99};expect(reserve(before,"openai",{openaiReservedCents:0,vulavulaCalls:0},{openaiReservedCents:100,vulavulaCalls:1}).openaiReservedCents).toBe(50000);expect(before.openaiReservedCents).toBe(49900);});
 it("rejects corrupted ledgers",()=>{expect(()=>validateLedger({openaiReservedCents:NaN,vulavulaCalls:0})).toThrow();});
 it("records sanitized failures and fails incomplete/all-failed reports",async()=>{const bad=await measure(async()=>{throw new ProviderError("quota");});expect(bad.error).toBe("quota");expect(benchmarkExitCode([bad])).toBe(1);const ok={result:{text:"Hello",provenance:{provider:"mock" as const,model:"test",mock:true}},latencyMs:0};expect(benchmarkExitCode([ok,ok,ok,ok])).toBe(0);expect(benchmarkExitCode([ok,ok,bad,ok])).toBe(1);expect(benchmarkExitCode([])).toBe(1);});
 it("normalizes and handles empty reference",()=>{expect(wordError("Molo!","molo").wer).toBe(0);expect(wordError("a b c","a d c e").errors).toBe(2);expect(wordError("","extra").wer).toBeNull();});
});
