import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SEED_DELAY_MS = Number(process.env.SEED_DELAY_MS ?? 2000);

export function runWithSeed(
  serverScriptRelative,
  delayMs = DEFAULT_SEED_DELAY_MS
) {
  const serverScriptPath = path.resolve(__dirname, "..", serverScriptRelative);

  const server = spawn(process.execPath, [serverScriptPath], {
    stdio: "inherit",
    env: process.env,
  });

  server.on("exit", (code) => {
    console.log(`[server] exited with code ${code}`);
    process.exit(code ?? 0);
  });

  setTimeout(() => {
    const seedPath = path.resolve(__dirname, "seed.js");
    console.log(`\n[seed] Running ${seedPath}...\n`);

    const seed = spawn(process.execPath, [seedPath], {
      stdio: "inherit",
      env: process.env,
    });

    seed.on("exit", (code) => {
      if (code !== 0) {
        console.error(`[seed] exited with code ${code}`);
      } else {
        console.log("[seed] completed");
      }
    });
  }, delayMs);
}
