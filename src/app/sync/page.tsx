import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import type { SyncFile } from "@/types";
import { SyncApp } from "./SyncApp";

export const metadata: Metadata = {
  title: "Sync — Agent Configurations",
};

function extractTitle(content: string, slug: string): string {
  const match = /^#\s+(.+)$/m.exec(content);
  return match ? match[1].trim() : slug.replace(/-/g, " ");
}

async function getSyncFiles(): Promise<SyncFile[]> {
  const dir = path.join(process.cwd(), "data", "sync");
  try {
    const entries = await readdir(dir);
    const files = await Promise.all(
      entries
        .filter((f) => f.endsWith(".md"))
        .sort()
        .map(async (filename) => {
          const filepath = path.join(dir, filename);
          const [content, info] = await Promise.all([
            readFile(filepath, "utf-8"),
            stat(filepath),
          ]);
          const slug = filename.replace(/\.md$/, "");
          return {
            slug,
            title: extractTitle(content, slug),
            content,
            modifiedAt: info.mtime.toISOString(),
          };
        })
    );
    return files;
  } catch {
    return [];
  }
}

export default async function SyncPage() {
  const files = await getSyncFiles();
  return <SyncApp files={files} />;
}
