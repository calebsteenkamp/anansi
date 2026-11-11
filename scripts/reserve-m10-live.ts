import {addLiveReservation,type LiveRun} from "../lib/live-verification";
import {loadEnvConfig} from "@next/env";
import {open,readFile,writeFile,rename} from "node:fs/promises";
import {reserve,validateLedger,type Ledger} from "../lib/benchmark";
async function main(){
 loadEnvConfig(process.cwd());const args=process.argv.slice(2),countArg=args.find(a=>a.startsWith("--calls=")),phaseArg=args.find(a=>a.startsWith("--phase="));
 if(args.length!==2||!countArg||!phaseArg||!/^--calls=[1-6]$/.test(countArg)||!/^--phase=(local|hosted)$/.test(phaseArg))throw new Error();
 const count=Number(countArg.slice(8)),folder="data/benchmark-results",lock=await open(folder+"/budget.lock","wx");
 try{
  const ledger:Ledger=JSON.parse(await readFile(folder+"/budget-ledger.json","utf8"));validateLedger(ledger);
  const path=folder+"/m10-live-reservations.json";let run:LiveRun;
  try{run=JSON.parse(await readFile(path,"utf8"));}catch(error){if((error as NodeJS.ErrnoException).code!=="ENOENT")throw error;run={calls:0,reservations:[]};}
  const updated=addLiveReservation(run,count,phaseArg.slice(8),new Date().toISOString());
  let next=ledger;for(let n=0;n<count;n++)next=reserve(next,"openai",{openaiReservedCents:n*100,vulavulaCalls:0},{openaiReservedCents:count*100,vulavulaCalls:0});
  // Reserve globally first. Failure is conservative, never refunded/reset automatically.
  await writeFile(folder+"/budget-ledger.json.tmp",JSON.stringify(next,null,2));await rename(folder+"/budget-ledger.json.tmp",folder+"/budget-ledger.json");
  run=updated;await writeFile(path,JSON.stringify(run,null,2));
  console.log("Reserved "+count+" M10 request slots; "+(6-run.calls)+" remain. No provider request was made. Reservations are not billed usage.");
 }finally{await lock.close();await import("node:fs/promises").then(fs=>fs.unlink(folder+"/budget.lock"));}
}
main().catch(()=>{console.error("M10 live reservation blocked. Check the existing ledger/lock/run cap and exact flags; do not reset these files to bypass the six-request limit.");process.exitCode=1;});
