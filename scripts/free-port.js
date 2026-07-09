const { execSync } = require("child_process");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const port = process.env.PORT || 3000;

function freePortOnWindows() {
  try {
    const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });

    const pids = [
      ...new Set(
        output
          .split("\n")
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && pid !== "0")
      ),
    ];

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Freed port ${port} (stopped PID ${pid})`);
      } catch {
        // Process may already be gone.
      }
    }
  } catch {
    // Port is already free.
  }
}

function freePortOnUnix() {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore", shell: true });
    console.log(`Freed port ${port}`);
  } catch {
    // Port is already free.
  }
}

if (process.platform === "win32") {
  freePortOnWindows();
} else {
  freePortOnUnix();
}
