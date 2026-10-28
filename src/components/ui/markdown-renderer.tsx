"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Info,
  Lightbulb,
  AlertTriangle,
  Flame,
  CheckSquare,
  Square,
  ImageOff,
} from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  dark?: boolean;
}

export function MarkdownRenderer({
  content,
  className = "",
  dark = false,
}: MarkdownRendererProps) {
  if (!content || !content.trim()) return null;

  const elements = parseMarkdown(content, dark);

  return (
    <div
      className={`prose-custom space-y-4 text-sm leading-relaxed ${
        dark ? "text-stone-200" : "text-stone-800"
      } ${className}`}
    >
      {elements}
    </div>
  );
}

function parseMarkdown(rawContent: string, dark: boolean): React.ReactNode[] {
  const lines = rawContent.replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 0. Standalone Image (![alt](url))
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      nodes.push(
        <ImageNode
          key={`img-${nodes.length}-${i}`}
          src={imgMatch[2]}
          alt={imgMatch[1]}
          dark={dark}
        />
      );
      i++;
      continue;
    }

    // 1. Code Block (```)
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const codeString = codeLines.join("\n");
      nodes.push(
        <CodeBlockNode
          key={`code-${nodes.length}-${i}`}
          code={codeString}
          language={lang}
          dark={dark}
        />
      );
      continue;
    }

    // 2. Table (| Col 1 | Col 2 |)
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }
      nodes.push(
        <TableNode
          key={`table-${nodes.length}-${i}`}
          lines={tableLines}
          dark={dark}
        />
      );
      continue;
    }

    // 3. Blockquote or Callout (> or > [!NOTE])
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        // Strip leading > and optional single space
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      nodes.push(
        <BlockquoteNode
          key={`quote-${nodes.length}-${i}`}
          lines={quoteLines}
          dark={dark}
        />
      );
      continue;
    }

    // 4. Horizontal Rule (---, ***, ___)
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      nodes.push(
        <hr
          key={`hr-${nodes.length}-${i}`}
          className={`my-6 border-t ${
            dark ? "border-stone-800" : "border-stone-200"
          }`}
        />
      );
      i++;
      continue;
    }

    // 5. Headings (#, ##, ###, ####, #####, ######)
    const headingMatch = line.match(/^(#{1,6})\s*(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      nodes.push(
        <HeadingNode
          key={`h-${nodes.length}-${i}`}
          level={level}
          text={text}
          dark={dark}
        />
      );
      i++;
      continue;
    }

    // 6. Unordered Lists / Checklists (- , * , + )
    if (/^\s*[-*+]\s+/.test(line)) {
      const listItems: { text: string; isTask?: boolean; checked?: boolean }[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        const rawItem = lines[i].replace(/^\s*[-*+]\s+/, "");
        const taskMatch = rawItem.match(/^\[([ xX])\]\s+(.*)$/);
        if (taskMatch) {
          listItems.push({
            isTask: true,
            checked: taskMatch[1].toLowerCase() === "x",
            text: taskMatch[2],
          });
        } else {
          listItems.push({ text: rawItem });
        }
        i++;
      }
      nodes.push(
        <ul
          key={`ul-${nodes.length}-${i}`}
          className="space-y-1.5 my-3 pl-2 list-none"
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              {item.isTask ? (
                <span className="shrink-0 mt-0.5">
                  {item.checked ? (
                    <CheckSquare
                      size={15}
                      className={dark ? "text-emerald-400" : "text-emerald-600"}
                    />
                  ) : (
                    <Square
                      size={15}
                      className={dark ? "text-stone-500" : "text-stone-400"}
                    />
                  )}
                </span>
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                    dark ? "bg-blue-400" : "bg-blue-600"
                  }`}
                />
              )}
              <span className={item.isTask && item.checked ? "line-through opacity-70" : ""}>
                {renderInlineMarkdown(item.text, dark)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Ordered Lists (1. , 2. )
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      nodes.push(
        <ol
          key={`ol-${nodes.length}-${i}`}
          className="list-decimal space-y-1.5 my-3 pl-6"
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="pl-1">
              {renderInlineMarkdown(item, dark)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Empty lines (preserve exact vertical spacing corresponding to number of Enters)
    if (!line.trim()) {
      let blankCount = 0;
      while (i < lines.length && !lines[i].trim()) {
        blankCount++;
        i++;
      }
      nodes.push(
        <div
          key={`blank-${nodes.length}-${i}`}
          style={{ height: `${blankCount * 1.25}rem` }}
          className="w-full shrink-0"
          aria-hidden="true"
        />
      );
      continue;
    }

    // 9. Standard Paragraph (collect consecutive lines until blank line or block element)
    const pLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("|") &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^(\*\*\*|---|___)$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }

    nodes.push(
      <p key={`p-${nodes.length}-${i}`} className="my-2.5 leading-relaxed">
        {pLines.map((pLine, pIdx) => (
          <React.Fragment key={pIdx}>
            {pIdx > 0 && <br />}
            {renderInlineMarkdown(pLine, dark)}
          </React.Fragment>
        ))}
      </p>
    );
  }

  return nodes;
}

// Inline renderer: Bold, Italic, Strikethrough, Code, Links, Highlights with Nested Combination Support
function renderInlineMarkdown(
  text: string,
  dark: boolean,
  depth: number = 0
): React.ReactNode {
  if (!text) return null;
  if (depth > 4) return text;

  // Split tokens by regex in order of specificity:
  // 1. Inline Image: ![alt](url)
  // 2. Link: [text](url)
  // 3. Bold + Italic: ***text***
  // 4. Bold: **text**
  // 5. Strikethrough: ~~text~~
  // 6. Highlight: ==text==
  // 7. Inline Code: `code`
  // 8. Italic: *text* or _text_
  const tokens = text.split(
    /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|~~[^~]+~~|==[^=]+==|`[^`]+`|\*[^*]+\*)/g
  );

  return tokens.map((part, index) => {
    if (!part) return null;

    // 1. Inline Image: ![alt](url)
    const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      return (
        <span key={index} className="inline-block my-2 text-center align-middle">
          <img
            src={normalizeDisplayImageUrl(imgMatch[2])}
            alt={imgMatch[1] || "Gambar materi"}
            loading="eager"
            decoding="async"
            width={800}
            height={450}
            style={{ aspectRatio: "16 / 9", width: "100%", height: "auto" }}
            className="rounded-xl border border-stone-200 dark:border-stone-800 max-h-80 w-full object-contain mx-auto shadow-sm aspect-video"
          />
          {imgMatch[1] && (
            <span className="block text-xs text-stone-500 mt-1 italic">
              {imgMatch[1]}
            </span>
          )}
        </span>
      );
    }

    // 2. Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const rawHref = linkMatch[2].trim();
      let normalizedHref = rawHref;
      if (
        !normalizedHref.startsWith("http://") &&
        !normalizedHref.startsWith("https://") &&
        !normalizedHref.startsWith("/") &&
        !normalizedHref.startsWith("mailto:") &&
        !normalizedHref.startsWith("#")
      ) {
        normalizedHref = `https://${normalizedHref}`;
      }
      const isExternal =
        normalizedHref.startsWith("http://") ||
        normalizedHref.startsWith("https://");

      return (
        <a
          key={index}
          href={normalizedHref}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={`font-semibold inline-flex items-center gap-0.5 underline underline-offset-3 transition-colors ${
            dark
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-600 hover:text-blue-800"
          }`}
        >
          <span>{renderInlineMarkdown(linkText, dark, depth + 1)}</span>
          {isExternal && <ExternalLink size={11} className="inline ml-0.5" />}
        </a>
      );
    }

    // 3. Combined Bold + Italic: ***text***
    if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
      return (
        <strong
          key={index}
          className={`font-black ${dark ? "text-white" : "text-stone-900"}`}
        >
          <em className="italic">
            {renderInlineMarkdown(part.slice(3, -3), dark, depth + 1)}
          </em>
        </strong>
      );
    }

    // 4. Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong
          key={index}
          className={`font-bold ${dark ? "text-white" : "text-stone-900"}`}
        >
          {renderInlineMarkdown(part.slice(2, -2), dark, depth + 1)}
        </strong>
      );
    }

    // 5. Strikethrough: ~~text~~
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <del key={index} className="line-through opacity-70">
          {renderInlineMarkdown(part.slice(2, -2), dark, depth + 1)}
        </del>
      );
    }

    // 6. Highlight: ==text==
    if (part.startsWith("==") && part.endsWith("==") && part.length >= 4) {
      return (
        <mark
          key={index}
          className={`px-1 py-0.5 rounded text-xs font-semibold ${
            dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-900"
          }`}
        >
          {renderInlineMarkdown(part.slice(2, -2), dark, depth + 1)}
        </mark>
      );
    }

    // 7. Inline Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className={`font-mono text-xs px-1.5 py-0.5 rounded-md font-semibold ${
            dark
              ? "bg-stone-800 text-amber-400 border border-stone-700/60"
              : "bg-stone-100 text-amber-700 border border-stone-200"
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // 8. Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={index} className="italic">
          {renderInlineMarkdown(part.slice(1, -1), dark, depth + 1)}
        </em>
      );
    }

    return part;
  });
}

// Heading Node Component
function HeadingNode({
  level,
  text,
  dark,
}: {
  level: number;
  text: string;
  dark: boolean;
}) {
  const content = renderInlineMarkdown(text, dark);
  switch (level) {
    case 1:
      return (
        <h1
          className={`text-2xl sm:text-3xl font-black tracking-tight mt-6 mb-3 pb-2 border-b ${
            dark
              ? "text-stone-100 border-stone-800"
              : "text-stone-900 border-stone-200"
          }`}
        >
          {content}
        </h1>
      );
    case 2:
      return (
        <h2
          className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-5 mb-2.5 ${
            dark ? "text-stone-100" : "text-stone-900"
          }`}
        >
          {content}
        </h2>
      );
    case 3:
      return (
        <h3
          className={`text-lg sm:text-xl font-bold tracking-tight mt-4 mb-2 ${
            dark ? "text-stone-200" : "text-stone-800"
          }`}
        >
          {content}
        </h3>
      );
    default:
      return (
        <h4
          className={`text-base font-bold tracking-tight mt-3 mb-1.5 ${
            dark ? "text-stone-200" : "text-stone-800"
          }`}
        >
          {content}
        </h4>
      );
  }
}

// Code Block with Copy Button
function CodeBlockNode({
  code,
  language,
  dark,
}: {
  code: string;
  language?: string;
  dark: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-stone-900/90 border-b border-stone-800 text-stone-400 text-xs">
        <span className="font-mono font-medium lowercase">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors text-xs font-semibold"
          title="Salin kode"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-stone-200">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

// Table Node
function TableNode({
  lines,
  dark,
}: {
  lines: string[];
  dark: boolean;
}) {
  if (lines.length < 2) return null;

  // Split row into cells
  const parseRow = (line: string) => {
    return line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
  };

  const headers = parseRow(lines[0]);
  // skip lines[1] if it's separator (|---|---|)
  const dataRows = lines
    .slice(1)
    .filter((l) => !/^\|[\s-:]+\|$/.test(l))
    .map(parseRow);

  return (
    <div className="my-4 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead
          className={`${
            dark
              ? "bg-stone-900 text-stone-200 border-b border-stone-800"
              : "bg-stone-100 text-stone-900 border-b border-stone-200"
          }`}
        >
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="p-3 font-bold">
                {renderInlineMarkdown(h, dark)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
          {dataRows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={`${
                rIdx % 2 === 1
                  ? dark
                    ? "bg-stone-900/40"
                    : "bg-stone-50/50"
                  : ""
              } hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-colors`}
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-3 align-top">
                  {renderInlineMarkdown(cell, dark)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Blockquote & GitHub-style Alert Callout Node
function BlockquoteNode({
  lines,
  dark,
}: {
  lines: string[];
  dark: boolean;
}) {
  const firstLine = lines[0] || "";
  const alertMatch = firstLine.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

  if (alertMatch) {
    const alertType = alertMatch[1].toUpperCase();
    const remainingLines = [
      firstLine.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, "").trim(),
      ...lines.slice(1),
    ].filter((l) => l.trim().length > 0);

    let config = {
      title: "Catatan",
      icon: Info,
      bg: dark ? "bg-blue-950/40 border-blue-800 text-blue-200" : "bg-blue-50/80 border-blue-200 text-blue-950",
      iconColor: dark ? "text-blue-400" : "text-blue-600",
    };

    if (alertType === "TIP") {
      config = {
        title: "Tips Praktis",
        icon: Lightbulb,
        bg: dark ? "bg-emerald-950/40 border-emerald-800 text-emerald-200" : "bg-emerald-50/80 border-emerald-200 text-emerald-950",
        iconColor: dark ? "text-emerald-400" : "text-emerald-600",
      };
    } else if (alertType === "WARNING" || alertType === "CAUTION") {
      config = {
        title: "Perhatian Penting",
        icon: AlertTriangle,
        bg: dark ? "bg-amber-950/40 border-amber-800 text-amber-200" : "bg-amber-50/80 border-amber-200 text-amber-950",
        iconColor: dark ? "text-amber-400" : "text-amber-600",
      };
    } else if (alertType === "IMPORTANT") {
      config = {
        title: "Penting",
        icon: Flame,
        bg: dark ? "bg-purple-950/40 border-purple-800 text-purple-200" : "bg-purple-50/80 border-purple-200 text-purple-950",
        iconColor: dark ? "text-purple-400" : "text-purple-600",
      };
    }

    const Icon = config.icon;

    return (
      <div className={`my-4 p-4 rounded-2xl border ${config.bg} shadow-2xs`}>
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1.5">
          <Icon size={16} className={config.iconColor} />
          <span>{config.title}</span>
        </div>
        <div className="text-xs sm:text-sm leading-relaxed space-y-1">
          {remainingLines.map((l, idx) => (
            <p key={idx}>{renderInlineMarkdown(l, dark)}</p>
          ))}
        </div>
      </div>
    );
  }

  // Standard blockquote
  return (
    <blockquote
      className={`my-4 pl-4 border-l-4 py-1 italic rounded-r-xl ${
        dark
          ? "border-blue-500 bg-stone-900/60 text-stone-300"
          : "border-blue-600 bg-blue-50/40 text-stone-700"
      }`}
    >
      {lines.map((l, idx) => (
        <p key={idx} className="leading-relaxed">
          {renderInlineMarkdown(l, dark)}
        </p>
      ))}
    </blockquote>
  );
}

// Helper to convert web URLs (like Unsplash photo pages) into direct image URLs
function normalizeDisplayImageUrl(src: string): string {
  if (!src) return "";
  let clean = src.trim();

  // If user entered an Unsplash photo page link
  // e.g., https://unsplash.com/photos/escalator-with-illuminated-handrails-in-sumida-MZmJf...
  const unsplashMatch = clean.match(/unsplash\.com\/photos\/(?:[^\/]+\/)?(?:[\w%-]+-)?([a-zA-Z0-9_-]{5,})/i);
  if (unsplashMatch && !clean.includes("images.unsplash.com")) {
    const photoId = unsplashMatch[1];
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;
  }

  // Google image proxy redirect
  if (clean.includes("google.") && clean.includes("imgurl=")) {
    try {
      const urlObj = new URL(clean);
      const actual = urlObj.searchParams.get("imgurl");
      if (actual) return decodeURIComponent(actual);
    } catch {}
  }

  return clean;
}

// Standalone Image Node with Lightbox Zoom View & Error Fallback
function ImageNode({
  src,
  alt,
  dark,
}: {
  src: string;
  alt?: string;
  dark: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = normalizeDisplayImageUrl(src);

  if (hasError) {
    return (
      <div
        className={`my-4 p-4 rounded-2xl border text-center transition-all ${
          dark
            ? "bg-stone-900/60 border-stone-800 text-stone-300"
            : "bg-amber-50/70 border-amber-200 text-stone-700"
        }`}
      >
        <ImageOff size={26} className="mx-auto mb-2 text-amber-500 opacity-80" />
        <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
          Gambar Tidak Dapat Dimuat
        </p>
        <p className="text-[11px] font-mono mt-1 opacity-70 break-all max-w-md mx-auto">
          {src}
        </p>
        <p className="text-[11px] mt-2 text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Tautan ini adalah halaman web, bukan file gambar langsung.
          <br />
          <strong>Tips:</strong> Buka gambar &rarr; Klik kanan pada gambar &rarr; Pilih <strong>"Salin Alamat Gambar" (Copy Image Address)</strong>, lalu tempelkan kembali.
        </p>
      </div>
    );
  }

  return (
    <figure className="my-5 text-center group">
      <div className="relative inline-block overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 shadow-md transition-all hover:shadow-lg">
        <img
          src={resolvedSrc}
          alt={alt || "Ilustrasi materi pembelajaran"}
          loading="eager"
          decoding="async"
          width={800}
          height={450}
          style={{ aspectRatio: "16 / 9", width: "100%", height: "auto" }}
          onError={() => setHasError(true)}
          onClick={() => setModalOpen(true)}
          className="mx-auto max-h-[520px] w-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01] aspect-video"
        />
      </div>
      {alt && (
        <figcaption
          className={`text-xs mt-2 italic font-medium ${
            dark ? "text-stone-400" : "text-stone-500"
          }`}
        >
          📷 {alt}
        </figcaption>
      )}

      {/* Lightbox Modal on Image Click */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img src={resolvedSrc} alt={alt || "Perbesar gambar"} width={1200} height={675} style={{ aspectRatio: "auto" }} className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl aspect-auto" />
            {alt && (
              <p className="text-center text-white/90 text-xs sm:text-sm mt-3 font-medium">
                {alt}
              </p>
            )}
          </div>
        </div>
      )}
    </figure>
  );
}

