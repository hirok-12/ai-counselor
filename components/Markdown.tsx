import { Fragment, type ReactNode } from "react";

/**
 * AIフィードバック用の軽量マークダウン描画。
 * 対応: 見出し(#〜###)、箇条書き(-,*)、番号付き(1.)、太字(**)、段落。
 * ストリーミング中の途中テキストでも壊れないことを優先している。
 */

function renderInline(text: string): ReactNode[] {
  // **太字** をトグルで処理。閉じていない ** は普通のテキスト扱い。
  const parts = text.split("**");
  const closed = parts.length % 2 === 1; // 奇数個の区切り = すべての ** が閉じている
  return parts.map((part, i) => {
    const isBold = i % 2 === 1 && (closed || i < parts.length - 1);
    return isBold ? (
      <strong key={i}>{part}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    );
  });
}

type Block =
  | { type: "h"; level: number; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "p"; lines: string[] };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", lines: para });
      para = [];
    }
  };

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const quote = /^\s*>\s?(.*)$/.exec(line);

    if (heading) {
      flushPara();
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
    } else if (quote) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "quote") last.lines.push(quote[1]);
      else blocks.push({ type: "quote", lines: [quote[1]] });
    } else if (ul) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(ul[1]);
      else blocks.push({ type: "ul", items: [ul[1]] });
    } else if (ol) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ol") last.items.push(ol[1]);
      else blocks.push({ type: "ol", items: [ol[1]] });
    } else if (line.trim() === "") {
      flushPara();
    } else {
      para.push(line);
    }
  }
  flushPara();
  return blocks;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <div className="md">
      {blocks.map((b, i) => {
        if (b.type === "h") {
          const level = Math.min(Math.max(b.level, 2), 4);
          const Tag = `h${level}` as "h2" | "h3" | "h4";
          return <Tag key={i}>{renderInline(b.text)}</Tag>;
        }
        if (b.type === "ul") {
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ol>
          );
        }
        if (b.type === "quote") {
          return (
            <blockquote key={i}>
              {b.lines.map((ln, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {renderInline(ln)}
                </Fragment>
              ))}
            </blockquote>
          );
        }
        return (
          <p key={i}>
            {b.lines.map((ln, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {renderInline(ln)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
