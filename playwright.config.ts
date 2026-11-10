import {defineConfig} from "@playwright/test";
import {loadEnvConfig} from "@next/env";
loadEnvConfig(process.cwd());
export default defineConfig({testDir:"tests/e2e",workers:1,timeout:120000,use:{baseURL:"http://localhost:3000",trace:"off",screenshot:"off",video:"off"},webServer:{command:"npm run dev -- --port 3000",url:"http://localhost:3000",reuseExistingServer:process.env.M2_REUSE_SERVER==="1",timeout:120000}});
