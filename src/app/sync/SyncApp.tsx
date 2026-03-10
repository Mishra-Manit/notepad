"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { common, createLowlight } from "lowlight";
import type { RootContent } from "hast";
import type { Components } from "react-markdown";
import type { SyncFile } from "@/types";

const lowlight = createLowlight(common);

interface SyncAppProps {
  files: SyncFile[];
}

// Splits at the first `---` on its own line.
// Strips the leading h1 from frontmatter (it's already shown in the file header).
function splitAtFirstHr(content: string): { frontmatter: string; body: string } {
  const match = /^---[ \t]*$/m.exec(content);
  if (!match) return { frontmatter: "", body: content };
  let frontmatter = content.slice(0, match.index).trim();
  frontmatter = frontmatter.replace(/^#[^\n]*\n?/, "").trim();
  const body = content.slice(match.index + match[0].length).trim();
  return { frontmatter, body };
}

function renderHastNodes(nodes: RootContent[]): React.ReactNode {
  return nodes.map((node, i) => {
    if (node.type === "text") return node.value;
    if (node.type === "element") {
      const cls = Array.isArray(node.properties?.className)
        ? (node.properties.className as string[]).join(" ")
        : undefined;
      return (
        <span key={i} className={cls}>
          {renderHastNodes(node.children as RootContent[])}
        </span>
      );
    }
    return null;
  });
}

// Returns <code> only — PreBlock owns the <pre> wrapper
const codeComponent: Components["code"] = ({ className, children }) => {
  const match = /language-(\w+)/.exec(className ?? "");
  if (match) {
    const lang = match[1];
    const code = String(children).replace(/\n$/, "");
    try {
      const result = lowlight.highlight(lang, code);
      return <code>{renderHastNodes(result.children as RootContent[])}</code>;
    } catch {
      return <code>{children}</code>;
    }
  }
  return <code className={className}>{children}</code>;
};

function PreBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const preRef = useRef<HTMLPreElement>(null);

  function handleCopy() {
    const text = preRef.current?.textContent ?? "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setAnimKey((k) => k + 1);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="relative group">
      <button
        key={animKey}
        onClick={handleCopy}
        className={[
          "absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2 py-1 rounded",
          "font-mono text-[10px] transition-colors duration-200",
          "opacity-0 group-hover:opacity-100",
          copied ? "copy-btn-success opacity-100 bg-accent/20 text-accent border border-accent/40"
                 : "bg-surface border border-border text-foreground/40 hover:text-foreground/80",
        ].join(" ")}
      >
        {copied ? <Check size={10} strokeWidth={2.5} /> : <Copy size={10} />}
        {copied ? "copied" : "copy"}
      </button>
      <pre ref={preRef}>{children}</pre>
    </div>
  );
}

function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="sync-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: codeComponent,
          pre: ({ children }) => <PreBlock>{children}</PreBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CopyMarkdownButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setAnimKey((k) => k + 1);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <button
      key={animKey}
      onClick={handleCopy}
      className={[
        "flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] transition-colors duration-200",
        copied
          ? "copy-btn-success bg-accent/20 text-accent border border-accent/40"
          : "bg-surface border border-border text-foreground/40 hover:text-foreground/80 hover:border-border-hover",
      ].join(" ")}
    >
      {copied ? <Check size={10} strokeWidth={2.5} /> : <Copy size={10} />}
      {copied ? "copied" : "copy markdown"}
    </button>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SyncApp({ files }: SyncAppProps) {
  const [activeSlug, setActiveSlug] = useState<string>(files[0]?.slug ?? "");
  const [fading, setFading] = useState(false);

  function handleSelect(slug: string) {
    if (slug === activeSlug) return;
    setFading(true);
    setTimeout(() => {
      setActiveSlug(slug);
      setFading(false);
    }, 120);
  }

  const activeFile = files.find((f) => f.slug === activeSlug) ?? files[0] ?? null;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="sync-grid absolute inset-0 pointer-events-none" />
      <div className="sync-scanlines absolute inset-0 pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.3em] text-foreground/90 uppercase">
            SYNC
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="font-mono text-[11px] text-foreground/70">
            agent configurations
          </span>
        </div>
        <span className="font-mono text-[11px] text-foreground/70">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </header>

      <main className="relative z-10 flex h-[calc(100vh-57px)]">
        <aside className="w-72 flex-shrink-0 border-r border-border overflow-y-auto p-3 flex flex-col gap-2">
          {files.length === 0 && (
            <p className="font-mono text-[11px] text-foreground/70 px-2 py-4">
              no files found in data/sync/
            </p>
          )}
          {files.map((file) => {
            const isActive = file.slug === activeSlug;
            return (
              <button
                key={file.slug}
                onClick={() => handleSelect(file.slug)}
                className={[
                  "w-full text-left rounded-lg border p-3 transition-all duration-150",
                  "backdrop-blur-sm",
                  isActive
                    ? "border-accent/40 bg-surface shadow-[0_0_16px_rgba(110,110,255,0.12)]"
                    : "border-border bg-surface/40 hover:border-border-hover hover:bg-surface/70",
                ].join(" ")}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-mono text-[10px] text-accent/50 select-none">
                    //
                  </span>
                  <span
                    className={`font-mono text-[11px] truncate ${
                      isActive ? "text-accent" : "text-foreground/70"
                    }`}
                  >
                    {file.slug}.md
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug text-foreground/90 truncate">
                  {file.title}
                </p>
                <p className="mt-1.5 font-mono text-[10px] text-foreground/70">
                  {formatDate(file.modifiedAt)}
                </p>
                {isActive && (
                  <div className="mt-2.5 h-px w-full bg-gradient-to-r from-accent/30 to-transparent" />
                )}
              </button>
            );
          })}
        </aside>

        <section className="flex-1 overflow-y-auto p-8 lg:p-12">
          {activeFile ? (() => {
            const { frontmatter, body } = splitAtFirstHr(activeFile.content);
            return (
              <div
                className={`max-w-3xl transition-opacity duration-[120ms] ${
                  fading ? "opacity-0" : "opacity-100"
                }`}
              >
                {/* File header */}
                <div className="mb-8 pb-6 border-b border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[10px] text-accent tracking-widest uppercase">
                      config
                    </span>
                    <span className="font-mono text-[10px] text-foreground/70">/</span>
                    <span className="font-mono text-[10px] text-foreground/70">
                      {activeFile.slug}.md
                    </span>
                  </div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {activeFile.title}
                  </h1>
                  <p className="mt-2 font-mono text-[11px] text-foreground/70">
                    modified {formatDateTime(activeFile.modifiedAt)}
                  </p>
                </div>

                {/* Frontmatter */}
                {frontmatter && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-[9px] tracking-[0.18em] text-foreground/30 uppercase">
                        Frontmatter
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="opacity-60">
                      <MarkdownViewer content={frontmatter} />
                    </div>
                  </div>
                )}

                {/* Content section header */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-[9px] tracking-[0.18em] text-foreground/30 uppercase">
                    Content
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  <CopyMarkdownButton content={body} />
                </div>

                {/* Content */}
                <MarkdownViewer content={body} />
              </div>
            );
          })() : (
            <div className="flex items-center justify-center h-full">
              <p className="font-mono text-xs text-foreground/70">
                no files found
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
