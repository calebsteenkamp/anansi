import {loadEnvConfig} from "@next/env";
import {readFile,writeFile,open,rename,unlink} from "node:fs/promises";
import {createAdapters,configFromEnv} from "../lib/providers/core";
import {ProviderError} from "../lib/providers/types";
import {inspectAudio} from "../lib/audio-probe";
import {reserve,validateLedger,type Ledger} from "../lib/benchmark";
async function main(){
 if(!process.argv.includes("--live")||!process.argv.includes("--permission-confirmed"))throw new Error("Permission flags required.");
 loadEnvConfig(process.cwd());const config=configFromEnv(process.env);
 if(config.transcription!=="openai"||config.openaiTranscriptionModel!=="gpt-transcribe"||!config.openaiKey)throw new Error("Approved model/configuration required.");
 const folder="data/benchmark-results",ledgerPath=folder+"/budget-ledger.json",reportPath=folder+"/m4-asr-live-check.json";
 const samples=[];
 for(const sample of [1,2]){
  const bytes=new Uint8Array(await readFile("data/Phrase "+sample+"/Phrase "+sample+".mp3"));const audio=await inspectAudio(bytes);
  if(audio.durationMs>30000)throw new Error("Cleared short sample bound exceeded.");
  samples.push({sample,bytes,durationMs:audio.durationMs});
 }
 const lock=await open(folder+"/budget.lock","wx");
 try{
  let ledger:Ledger=JSON.parse(await readFile(ledgerPath,"utf8"));validateLedger(ledger);
  const report:{started:string;model:string;attempts:number;results:unknown[];scope:string}={started:new Date().toISOString(),model:"gpt-transcribe",attempts:0,results:[],scope:"Two previously cleared samples only, no retry; USD1 conservative reservation per call, not actual billing."};
  await writeFile(reportPath,JSON.stringify(report,null,2),{flag:"wx"}); // A prior run blocks another run.
  let run:Ledger={openaiReservedCents:0,vulavulaCalls:0};
  for(const sample of samples){
   const next=reserve(ledger,"openai",run,{openaiReservedCents:200,vulavulaCalls:0});
   await writeFile(ledgerPath+".tmp",JSON.stringify(next,null,2));await rename(ledgerPath+".tmp",ledgerPath);ledger=next;run={...run,openaiReservedCents:run.openaiReservedCents+100};
   report.attempts++;await writeFile(reportPath,JSON.stringify(report,null,2));
   const started=Date.now();
   try{
    const result=await createAdapters(config).transcribe({bytes:sample.bytes,filename:"Phrase "+sample.sample+".mp3",mimeType:"audio/mpeg"},"xh");
    report.results.push({sample:sample.sample,durationMs:sample.durationMs,latencyMs:Date.now()-started,result});
    console.log("Phrase",sample.sample,"transcription succeeded; latency",Date.now()-started,"ms.");
   }catch(error){
    const code=error instanceof ProviderError?error.code:"verification_failure";report.results.push({sample:sample.sample,error:code});process.exitCode=1;console.log("Phrase",sample.sample,"failed:",code);
    if(code==="credentials"||code==="configuration"){await writeFile(reportPath,JSON.stringify(report,null,2));break;}
   }
   await writeFile(reportPath,JSON.stringify(report,null,2));
  }
  if(report.results.length!==2)process.exitCode=1;
  console.log("Local report:",reportPath,"; attempts:",report.attempts,"; no automatic retries.");
 }finally{await lock.close();await unlink(folder+"/budget.lock");}
}
main().catch(()=>{console.error("Live M4 check blocked/failed: inspect permission, configuration, existing report, budget ledger or lock. No secrets logged.");process.exitCode=1;});
