import { ProviderError, type Translation } from "./providers/types";
export function words(text: string): string[] { return text.normalize("NFC").toLocaleLowerCase("xh").match(/[\p{L}\p{N}]+/gu) ?? []; }
export function wordError(reference: string, actual: string) {
 const a=words(reference),b=words(actual);let row=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;}
 return {errors:row[b.length],referenceWords:a.length,wer:a.length?row[b.length]/a.length:null};
}
export const BENCHMARK_MODEL="gpt-5.4-mini-2026-03-17";
export const RESERVATION_CENTS=100;
// $1 exceeds full 400k context ($0.75/M) + capped 4096 output ($4.50/M).
// Standard text endpoint only, no tools. Reverify pricing before changing model.
export interface Ledger { openaiReservedCents:number; vulavulaCalls:number }
export function validateLedger(ledger: Ledger) {
 if(!Number.isSafeInteger(ledger.openaiReservedCents)||ledger.openaiReservedCents<0||ledger.openaiReservedCents>50000||!Number.isSafeInteger(ledger.vulavulaCalls)||ledger.vulavulaCalls<0||ledger.vulavulaCalls>100)throw new Error("Invalid budget ledger; manual reconciliation required");
}
export function reserve(ledger:Ledger,provider:"openai"|"vulavula",run:Ledger,limits:Ledger):Ledger {
 for(const item of [ledger,run,limits])validateLedger(item);
 if(provider==="openai"){
  if(run.openaiReservedCents+RESERVATION_CENTS>limits.openaiReservedCents||ledger.openaiReservedCents+RESERVATION_CENTS>50000)throw new Error("OpenAI budget exhausted");
  return {...ledger,openaiReservedCents:ledger.openaiReservedCents+RESERVATION_CENTS};
 }
 if(run.vulavulaCalls+1>limits.vulavulaCalls||ledger.vulavulaCalls+1>100)throw new Error("Vulavula call allowance exhausted");
 return {...ledger,vulavulaCalls:ledger.vulavulaCalls+1};
}
export function benchmarkPermission(args:string[]){
 if(!args.includes("--live")||!args.includes("--permission-confirmed")||!args.some(x=>x.startsWith("--budget-note=")&&x.slice(14).trim()))throw new Error("Requires --live --permission-confirmed --budget-note=<approved allowance>");
 function limit(name:string,max:number) {
  const values=args.filter(x=>x.startsWith(name+"=")); if(values.length!==1)throw new Error("One explicit "+name+" required");
  const raw=values[0].split("=")[1];if(!/^\d+$/.test(raw))throw new Error("Invalid "+name);
  const n=Number(raw);if(!Number.isSafeInteger(n)||n<0||n>max)throw new Error("Invalid "+name);return n;
 }
 return {openaiReservedCents:limit("--max-openai-cents",50000),vulavulaCalls:limit("--max-vulavula-calls",100)};
}
export type Outcome={result?:Translation;error?:string;latencyMs:number};
export async function measure(action:()=>Promise<Translation>):Promise<Outcome>{
 const start=Date.now();try{return {result:await action(),latencyMs:Date.now()-start};}
 catch(error){return {error:error instanceof ProviderError?error.code:"benchmark_failure",latencyMs:Date.now()-start};}
}
export function benchmarkExitCode(outcomes:Outcome[]){return outcomes.length===4&&outcomes.every(x=>x.result&&!x.error)?0:1;}
