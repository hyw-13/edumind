import { Fragment } from 'react';

// 轻量 Markdown 渲染器，覆盖标题/粗体/行内代码/代码块/列表/引用/表格/链接
function renderInline(text: string, keyBase: string) {
  const parts: React.ReactNode[] = [];
  // 先按代码块切分
  const codeSplit = text.split(/(`[^`]+`)/g);
  codeSplit.forEach((seg, i) => {
    if (/^`[^`]+`$/.test(seg)) {
      parts.push(<code key={`${keyBase}-c-${i}`}>{seg.slice(1, -1)}</code>);
      return;
    }
    // 粗体切分
    const boldSplit = seg.split(/(\*\*[^*]+\*\*)/g);
    boldSplit.forEach((b, j) => {
      if (/^\*\*[^*]+\*\*$/.test(b)) {
        parts.push(<strong key={`${keyBase}-b-${i}-${j}`}>{b.slice(2, -2)}</strong>);
      } else {
        // 链接
        const linkSplit = b.split(/(\[[^\]]+\]\([^)]+\))/g);
        linkSplit.forEach((l, k) => {
          const m = l.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (m) {
            parts.push(<a key={`${keyBase}-l-${i}-${j}-${k}`} href={m[2]} target="_blank" rel="noreferrer">{m[1]}</a>);
          } else if (l) {
            parts.push(<Fragment key={`${keyBase}-t-${i}-${j}-${k}`}>{l}</Fragment>);
          }
        });
      }
    });
  });
  return parts;
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3);
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(
        <pre key={key++}>
          <code className={lang ? `language-${lang}` : undefined}>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // table
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s:|-]+/.test(lines[i + 1])) {
      const header = line.split('|').map((s) => s.trim()).filter(Boolean);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').map((s) => s.trim()).filter(Boolean));
        i++;
      }
      blocks.push(
        <table key={key++}>
          <thead>
            <tr>{header.map((h, idx) => <th key={idx}>{renderInline(h, `th-${key}-${idx}`)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => <td key={ci}>{renderInline(c, `td-${key}-${ri}-${ci}`)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }

    // headings
    const hm = line.match(/^(#{1,3})\s+(.*)$/);
    if (hm) {
      const level = hm[1].length;
      const id = `h-${key++}`;
      const content = renderInline(hm[2], id);
      if (level === 1) blocks.push(<h1 key={id}>{content}</h1>);
      else if (level === 2) blocks.push(<h2 key={id}>{content}</h2>);
      else blocks.push(<h3 key={id}>{content}</h3>);
      i++;
      continue;
    }

    // blockquote
    if (line.trimStart().startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        quote.push(lines[i].trimStart().slice(1).trim());
        i++;
      }
      blocks.push(<blockquote key={key++}>{renderInline(quote.join(' '), `bq-${key}`)}</blockquote>);
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((it, idx) => <li key={idx}>{renderInline(it, `ol-${key}-${idx}`)}</li>)}
        </ol>
      );
      continue;
    }

    // unordered list (with nesting via indentation)
    if (/^\s*[-*]\s+/.test(line)) {
      const items: { indent: number; text: string }[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const indent = lines[i].length - lines[i].trimStart().length;
        items.push({ indent, text: lines[i].trim().replace(/^[-*]\s+/, '') });
        i++;
      }
      // render nested as nested ul
      const renderList = (items: { indent: number; text: string }[], baseIndent: number): React.ReactNode => {
        const result: React.ReactNode[] = [];
        let idx = 0;
        while (idx < items.length) {
          const item = items[idx];
          if (item.indent > baseIndent) {
            // collect nested
            const nested: { indent: number; text: string }[] = [];
            while (idx < items.length && items[idx].indent > baseIndent) {
              nested.push(items[idx]);
              idx++;
            }
            result.push(
              <ul key={`nested-${idx}`}>{renderList(nested, baseIndent + 2)}</ul>
            );
          } else if (item.indent === baseIndent) {
            const children: React.ReactNode[] = [renderInline(item.text, `li-${baseIndent}-${idx}`)];
            // peek nested
            const nested: { indent: number; text: string }[] = [];
            let j = idx + 1;
            while (j < items.length && items[j].indent > baseIndent) {
              nested.push(items[j]);
              j++;
            }
            if (nested.length) {
              children.push(<ul key={`sub-${idx}`}>{renderList(nested, baseIndent + 2)}</ul>);
              idx = j;
            } else {
              idx++;
            }
            result.push(<li key={`li-${baseIndent}-${idx}`}>{children}</li>);
          } else {
            idx++;
          }
        }
        return result;
      };
      blocks.push(<ul key={key++}>{renderList(items, 0)}</ul>);
      continue;
    }

    // empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // paragraph
    blocks.push(<p key={key++}>{renderInline(line, `p-${key}`)}</p>);
    i++;
  }

  return <div className="md">{blocks}</div>;
}
