import {loadEnvConfig} from "@next/env";
import {readFile,mkdir,writeFile,open,rename,unlink} from "node:fs/promises";
import {createAdapters,configFromEnv} from "../lib/providers/core";
import {BENCHMARK_MODEL,benchmarkPermission,reserve,validateLedger,measure,benchmarkExitCode,type Ledger,type Outcome} from "../lib/benchmark";
async function main(){
 const limits=benchmarkPermission(process.argv.slice(2));
 loadEnvConfig(process.cwd());
 const base=configFromEnv(process.env);
 if(!base.openaiKey?.trim()||!base.vulavulaKey?.trim())throw new Error("Both API credentials required before comparison");
 const samples=await Promise.all([1,2].map(async sample=>{
  const dir=`data/Phrase ${sample}`;
  const [reference,english,intent]=await Promise.all(["isiXhosa.txt","English.txt","Intent.txt"].map(f=>readFile(dir+"/"+f,"utf8")));
  if(!reference.trim()||Buffer.byteLength(reference,"utf8")>10000)throw new Error("Invalid reference transcript");
  return {sample,reference,english,intent};
 }));
 const folder="data/benchmark-results";await mkdir(folder,{recursive:true});
 const lock=await open(folder+"/budget.lock","wx"); // Fail closed if concurrent run/stale lock.
 const ledgerPath=folder+"/budget-ledger.json";
 try{
  let ledger:Ledger;
  try{ledger=JSON.parse(await readFile(ledgerPath,"utf8"));}catch(e){if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e;
   // Known initial M1 run: 2 ASR calls, conservatively reserve $2; 4 Vulavula calls.
   // This is historical reservation, NOT measured account usage.
   ledger={openaiReservedCents:200,vulavulaCalls:4};
  }
  validateLedger(ledger);
  let run:Ledger={openaiReservedCents:0,vulavulaCalls:0};
  const outcomes:Outcome[]=[];const output=[];
  for(const sample of samples){
   const translations=[];
   for(const provider of ["openai","vulavula"] as const){
    const outcome=await measure(async()=>{
     const next=reserve(ledger,provider,run,limits);
     // Persist reservation before remote work. Never refund failures/unknown usage.
     await writeFile(ledgerPath+".tmp",JSON.stringify(next,null,2),{flag:"w"});
     await rename(ledgerPath+".tmp",ledgerPath);ledger=next;
     run=provider==="openai"?{...run,openaiReservedCents:run.openaiReservedCents+100}:{...run,vulavulaCalls:run.vulavulaCalls+1};
     return createAdapters({...base,translation:provider,openaiTranslationModel:BENCHMARK_MODEL,openaiMaxOutputTokens:4096}).translate(sample.reference,"xh","en");
    });
    outcomes.push(outcome);translations.push({provider,...outcome});
   }
   output.push({...sample,translations,humanEvaluation:"Pending bilingual review"});
  }
  const exitCode=benchmarkExitCode(outcomes);
  const path=folder+"/corrected-"+new Date().toISOString().replaceAll(":","-")+".json";
  await writeFile(path,JSON.stringify({date:new Date().toISOString(),mode:"corrected-transcript-comparison",model:BENCHMARK_MODEL,limits,runReservations:run,cumulativeReservations:ledger,status:exitCode===0?"success":"failed_or_partial",budgetScope:"Local runner only; conservative reservations are NOT bills; external usage not tracked",output},null,2),{flag:"wx"});
  console.log("Report:",path);console.log("Outcome:",exitCode===0?"4/4 translations succeeded":"FAILED/PARTIAL; inspect report");
  console.log("Reservations:",JSON.stringify(run));process.exitCode=exitCode;
 }finally{await lock.close();await unlink(folder+"/budget.lock");}
}
main().catch(()=>{console.error("Benchmark failed (permission/configuration/input/ledger/lock/report error); no secrets logged. Inspect configuration and local ledger; do not delete ledger to bypass limits.");process.exitCode=1;});
