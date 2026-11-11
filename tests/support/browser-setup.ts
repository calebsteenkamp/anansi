import {discoveryPreflight} from "./discovery-project";
export default async function setup(){const c=await discoveryPreflight(true);const r=await c.admin.rpc("m10_demo_mode");if(r.error||typeof r.data!=="boolean")throw new Error("BLOCKED: owner must apply all M10 migrations before browser tests.");}
