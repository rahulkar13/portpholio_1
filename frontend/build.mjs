import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(resolve(root, "index.html"), resolve(dist, "index.html"));
await cp(resolve(root, "script.js"), resolve(dist, "script.js"));
await cp(resolve(root, "assets"), resolve(dist, "assets"), { recursive: true });

console.log("Static frontend copied to dist/");
