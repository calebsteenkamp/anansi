import {execFileSync,spawnSync} from "node:child_process";
import {copyFile,mkdir,lstat} from "node:fs/promises";
import {resolve,relative,isAbsolute,dirname,sep} from "node:path";
async function main(){
 const root=process.cwd(),target=resolve(root,"data/verification/fresh-"+new Date().toISOString().replace(/[:.]/g,"-"));
 const inside=(base:string,path:string)=>{const rel=relative(base,path);if(!rel||rel.startsWith(".."+sep)||isAbsolute(rel))throw new Error("Snapshot path escaped its intended directory.");};inside(resolve(root,"data/verification"),target);
 const files=execFileSync("git",["ls-files","--cached","--others","--exclude-standard","-z"],{encoding:"utf8"}).split("\0").filter(Boolean);
 await mkdir(target,{recursive:true});
 for(const name of files){if(name.startsWith("data/")||name.startsWith(".git/")||(name.startsWith(".env")&&name!==".env.example"))throw new Error("Unsafe snapshot input.");const source=resolve(root,name),dest=resolve(target,name);inside(root,source);inside(target,dest);if(!(await lstat(source)).isFile())throw new Error("Snapshot accepts regular source files only.");await mkdir(dirname(dest),{recursive:true});await copyFile(source,dest);}
 // No .env.local or parent credentials are copied or loaded by this verifier.
 const env={...process.env};for(const name of Object.keys(env))if(/SUPABASE|OPENAI|VULAVULA|GOOGLE_CLOUD_TRANSLATION|ANANSI_DEV_HOSTS|TRANSCRIPTION_PROVIDER|TRANSLATION_PROVIDER/.test(name))delete env[name];
 console.log("Fresh source snapshot: "+relative(root,target));
 for(const args of [["ci"],["run","test:unit"],["run","lint"],["run","build"]]){
  console.log(new Date().toISOString()+" npm "+args.join(" "));
  const result=process.platform==="win32"?spawnSync("cmd.exe",["/d","/s","/c","npm "+args.join(" ")],{cwd:target,env,stdio:"inherit"}):spawnSync("npm",args,{cwd:target,env,stdio:"inherit"});
  console.log("Exit status: "+result.status);if(result.error||result.status!==0)throw new Error("Fresh setup failed; retained snapshot for inspection.");
 }
 console.log("Fresh install/unit/lint/build passed. Cloud setup, supplied audio and human rehearsal remain separate gates.");
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Fresh setup failed.");process.exitCode=1;});
