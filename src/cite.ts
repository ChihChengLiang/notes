import { appendFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import prompts from "prompts";

const ZOTERO_RPC_URL = "http://127.0.0.1:23119/better-bibtex/json-rpc";
const BIB_PATH = join(import.meta.dir, "..", "notes", "citations.bib");

interface ZoteroCreator {
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface ZoteroItem {
  citekey: string;
  title?: string;
  date?: string;
  creators?: ZoteroCreator[];
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(ZOTERO_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params }),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  }
  const body = await res.json();
  if (body.error) {
    throw new Error(body.error.message ?? JSON.stringify(body.error));
  }
  return body.result as T;
}

function formatCreators(creators: ZoteroCreator[] = []): string {
  if (creators.length === 0) return "Unknown author";
  const names = creators.map((c) => c.lastName ?? c.name ?? "?");
  return names.length <= 2 ? names.join(" & ") : `${names[0]} et al.`;
}

function formatYear(date?: string): string {
  return date?.match(/\d{4}/)?.[0] ?? "n.d.";
}

function existingCitekeys(): Set<string> {
  if (!existsSync(BIB_PATH)) return new Set();
  const text = readFileSync(BIB_PATH, "utf8");
  return new Set([...text.matchAll(/@\w+\{([^,]+),/g)].map((m) => m[1]));
}

async function main() {
  const query = process.argv.slice(2).join(" ");

  let items: ZoteroItem[];
  try {
    items = await rpc<ZoteroItem[]>("item.search", [query]);
  } catch (err) {
    console.error(
      `Could not reach Zotero at ${ZOTERO_RPC_URL}.\n` +
        `Make sure Zotero is running with the Better BibTeX plugin installed.\n${(err as Error).message}`,
    );
    process.exit(1);
  }

  if (!items || items.length === 0) {
    console.error(query ? `No Zotero items match "${query}".` : "No items found in Zotero library.");
    process.exit(1);
  }

  const known = existingCitekeys();

  const { citekey } = await prompts({
    type: "autocomplete",
    name: "citekey",
    message: "Select a paper to cite",
    choices: items.map((item) => ({
      title: `${formatCreators(item.creators)} (${formatYear(item.date)}) — ${item.title ?? "Untitled"}${
        known.has(item.citekey) ? "  [already cited]" : ""
      }`,
      value: item.citekey,
    })),
  });

  if (!citekey) {
    console.log("Cancelled.");
    return;
  }

  if (known.has(citekey)) {
    console.log(`@${citekey} is already in notes/citations.bib — nothing to do.`);
    return;
  }

  const entry = await rpc<string>("item.export", [[citekey], "biblatex"]);
  appendFileSync(BIB_PATH, `\n${entry.trim()}\n`);
  console.log(`Added [@${citekey}] to notes/citations.bib`);
}

main();
