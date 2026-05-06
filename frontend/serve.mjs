import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const sendFile = async (filePath, response) => {
  const fileExt = extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": mimeTypes[fileExt] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  createReadStream(filePath).pipe(response);
};

createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent((request.url || "/").split("?")[0]);
    const relativePath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
    const safePath = normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(root, safePath);

    if (!existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) {
      filePath = join(filePath, "index.html");
    }

    if (!existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    await sendFile(filePath, response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Server error");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Frontend running at http://127.0.0.1:${port}`);
});
