const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const processes = [
  {
    name: "web",
    script: path.join(projectRoot, "frontend", "server.js")
  }
];

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  children.forEach((child) => {
    if (!child.killed) {
      child.kill();
    }
  });

  process.exit(code);
}

processes.forEach(({ name, script }) => {
  const child = spawn(process.execPath, [script], {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "test",
      WEB_PORT: "4000",
      API_BASE_URL: "http://localhost:3000/api"
    }
  });

  child.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`[${name}] finalizou com codigo ${code}`);
      shutdown(code || 1);
    }
  });

  children.push(child);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("exit", () => {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill();
    }
  });
});
