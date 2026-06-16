import { createServer } from "node:http";
import { appendFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] || 8084);
const host = process.argv[3] || "0.0.0.0";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    await appendFile(
      path.join(root, "access.log"),
      `${new Date().toISOString()} ${req.socket.remoteAddress} ${req.method} ${url.pathname}\n`
    );

    if (url.pathname === "/ping") {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end("CV PRO BAT SOLUTION OK");
      return;
    }

    let requestPath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname);
    while (requestPath.startsWith("/")) requestPath = requestPath.slice(1);

    const filePath = path.resolve(root, requestPath);
    if (!(filePath === root || filePath.startsWith(root + path.sep))) {
      throw new Error("Invalid path");
    }

    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`CV PRO BAT SOLUTION site: http://${host}:${port}/`);
});
