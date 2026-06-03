import { exec } from "child_process";
const server = exec("node dist/server.cjs");
setTimeout(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/generate-rpph", {method: "POST"});
    console.log("PROD STATUS:", res.status);
    console.log("PROD TYPE:", res.headers.get("content-type"));
  } catch(e) { console.error(e); }
  server.kill();
}, 2000);
