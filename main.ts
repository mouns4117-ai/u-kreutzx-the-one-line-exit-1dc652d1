import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "I hereby resign: the office plant has been promoted twice in three years and I have not, so I am going to become a plant.";

const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // Gate: exactly one line, 1-140 chars, not only whitespace.
  if (ENTRY.length < 1 || ENTRY.length > 140) {
    throw new Error(`entry length ${ENTRY.length} outside gate 1-140`);
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    throw new Error("entry must be exactly one line");
  }
  // Fail-fast: no leading/trailing whitespace, and byte length must fit the
  // gate too (the scorer counts UTF-8 characters; ASCII here, so they agree).
  if (ENTRY !== ENTRY.trim()) {
    throw new Error("entry has leading or trailing whitespace");
  }
  const byteLen = Buffer.byteLength(ENTRY, "utf8");
  if (byteLen > 140) {
    throw new Error(`entry is ${byteLen} UTF-8 bytes, over the 140 gate`);
  }

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  // Empty /output's CONTENTS only; never remove the mounted dir itself.
  for (const name of readdirSync(OUT_DIR)) {
    rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
  }
  writeFileSync(OUT_FILE, ENTRY, "utf8");

  // Read-back verification: bytes on disk must equal the entry.
  const back = readFileSync(OUT_FILE, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: /output/entry.txt differs from entry");
  }
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`entry (${ENTRY.length} chars) written to ${OUT_FILE}`);
  console.log(`sha256: ${sha}`);
}

main();
