// 真实思维导图渲染组件（自定义布局，匹配项目设计语言）
// 将 Markdown 列表树解析为水平树形布局，SVG 绘制曲线连接 + HTML 节点
import { useMemo } from 'react';

interface MindmapNode {
  text: string;
  children: MindmapNode[];
}

interface LaidOutNode {
  id: number;
  text: string;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  branchIndex: number;
  children: LaidOutNode[];
}

interface Edge {
  from: LaidOutNode;
  to: LaidOutNode;
}

const NODE_HEIGHT = 34;
const ROW_GAP = 12;
const ROW_HEIGHT = NODE_HEIGHT + ROW_GAP;
const COL_GAP = 48;
const PADDING = 24;

// 分支配色（teal / amber / rose 三色循环 + 变体）
const palette = [
  { main: '#0f766e', light: '#ccfbf1', lightText: '#0f766e', stroke: '#0f766e' }, // teal
  { main: '#ea580c', light: '#ffedd5', lightText: '#9a3412', stroke: '#ea580c' }, // amber
  { main: '#e11d48', light: '#ffe4e6', lightText: '#9f1239', stroke: '#e11d48' }, // rose
  { main: '#0d9488', light: '#99f6e4', lightText: '#0f766e', stroke: '#0d9488' }, // teal-light
  { main: '#d97706', light: '#fef3c7', lightText: '#92400e', stroke: '#d97706' }, // amber-light
  { main: '#be185d', light: '#fce7f3', lightText: '#9d174d', stroke: '#be185d' }, // rose-light
];

// 估算文本宽度（中文 ~14px，ASCII ~7.5px，13px 字号）
function estimateWidth(text: string, minWidth = 72, maxWidth = 260): number {
  let w = 0;
  for (const ch of text) {
    w += /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch) ? 14 : 7.5;
  }
  return Math.max(minWidth, Math.min(maxWidth, w + 22));
}

// 截断过长文本
function truncate(text: string, maxWidth: number): string {
  if (estimateWidth(text, 0, 9999) <= maxWidth) return text;
  let t = text;
  while (estimateWidth(t + '…', 0, 9999) > maxWidth && t.length > 1) {
    t = t.slice(0, -1);
  }
  return t + '…';
}

// 净化节点文本
function sanitize(text: string): string {
  return text
    .replace(/[()[\]{}]/g, '')
    .replace(/[（）【】｛｝]/g, '')
    .replace(/[\/\\:;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 解析 Markdown 文档树：# 作为 root，## / ### 作为分支，- 列表项作为叶子
function parseMarkdownTree(content: string): MindmapNode | null {
  const lines = content.split('\n');

  // 1. 找到首个 # 一级标题作为 root
  let rootText = '主题';
  let rootIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+)$/);
    if (m) {
      rootText = sanitize(m[1].trim()) || '主题';
      rootIdx = i;
      break;
    }
  }
  if (rootIdx === -1) {
    // 回退：尝试用首个列表项作为 root
    const firstBulletIdx = lines.findIndex((l) => /^(\s*)[-+*]\s+/.test(l));
    if (firstBulletIdx === -1) return null;
    rootText = '主题';
    rootIdx = firstBulletIdx - 1;
  }

  const root: MindmapNode = { text: rootText, children: [] };
  // 当前分支上下文
  let currentBranch: MindmapNode | null = null;   // ## 对应节点
  let currentSubBranch: MindmapNode | null = null; // ### 对应节点
  // 列表项缩进栈（用于处理 - 的嵌套缩进）
  let listStack: { node: MindmapNode; indent: number }[] = [];

  for (let i = rootIdx + 1; i < lines.length; i++) {
    const line = lines[i];

    // 匹配各级标题与列表项
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    const h4 = line.match(/^####\s+(.+)$/);
    const bullet = line.match(/^(\s*)[-+*]\s+(.+)$/);

    if (h2) {
      currentBranch = { text: sanitize(h2[1].trim()) || '分支', children: [] };
      root.children.push(currentBranch);
      currentSubBranch = null;
      listStack = [];
    } else if (h3) {
      if (!currentBranch) {
        // ### 没有父 ## ，创建一个默认分支
        currentBranch = { text: '分支', children: [] };
        root.children.push(currentBranch);
      }
      currentSubBranch = { text: sanitize(h3[1].trim()) || '子分支', children: [] };
      currentBranch.children.push(currentSubBranch);
      listStack = [];
    } else if (h4) {
      // #### 作为更深层节点，挂在当前 subBranch 下
      const parent = currentSubBranch || currentBranch;
      if (parent) {
        const node: MindmapNode = { text: sanitize(h4[1].trim()) || '小节', children: [] };
        parent.children.push(node);
        listStack = [{ node, indent: 0 }];
      }
    } else if (bullet) {
      const indent = bullet[1].length;
      const text = sanitize(bullet[2].trim()) || '节点';
      const node: MindmapNode = { text, children: [] };

      // 确定挂载父节点
      const parent = currentSubBranch || currentBranch;
      if (!parent) {
        // 没有标题父节点，直接挂到 root
        root.children.push(node);
        listStack = [{ node, indent }];
        continue;
      }

      // 根据缩进出栈
      while (listStack.length > 0 && listStack[listStack.length - 1].indent >= indent) {
        listStack.pop();
      }
      if (listStack.length === 0) {
        parent.children.push(node);
      } else {
        listStack[listStack.length - 1].node.children.push(node);
      }
      listStack.push({ node, indent });
    }
    // 其他行（表格、引用块、段落、代码块）忽略
  }

  return root;
}

// 树形布局：叶子节点均匀分布，父节点 y = 子节点 y 均值
function layoutTree(root: MindmapNode): {
  nodes: LaidOutNode[];
  edges: Edge[];
  width: number;
  height: number;
} {
  let idCounter = 0;
  let leafIndex = 0;
  const allNodes: LaidOutNode[] = [];
  const edges: Edge[] = [];

  // 第一遍：计算每层最大宽度
  const colWidths: number[] = [];
  function computeColWidths(node: MindmapNode, depth: number) {
    const w = estimateWidth(node.text);
    if (!colWidths[depth] || w > colWidths[depth]) colWidths[depth] = w;
    for (const c of node.children) computeColWidths(c, depth + 1);
  }
  computeColWidths(root, 0);

  function colX(depth: number): number {
    let x = PADDING;
    for (let i = 0; i < depth; i++) x += colWidths[i] + COL_GAP;
    return x;
  }

  // 第二遍：分配位置
  function layout(node: MindmapNode, depth: number, branchIndex: number): LaidOutNode {
    const id = idCounter++;
    const width = colWidths[depth] ?? 100;
    const x = colX(depth);

    if (node.children.length === 0) {
      const y = PADDING + leafIndex * ROW_HEIGHT;
      leafIndex++;
      const n: LaidOutNode = { id, text: truncate(node.text, width), depth, x, y, width, height: NODE_HEIGHT, branchIndex, children: [] };
      allNodes.push(n);
      return n;
    }
    const children = node.children.map((c, i) => layout(c, depth + 1, depth === 0 ? i : branchIndex));
    const y = children.reduce((s, c) => s + c.y, 0) / children.length;
    const n: LaidOutNode = { id, text: truncate(node.text, width), depth, x, y, width, height: NODE_HEIGHT, branchIndex, children };
    allNodes.push(n);
    for (const c of children) edges.push({ from: n, to: c });
    return n;
  }

  layout(root, 0, 0);

  const totalWidth = PADDING * 2 + colWidths.reduce((s, w) => s + w, 0) + COL_GAP * Math.max(0, colWidths.length - 1);
  const totalHeight = PADDING * 2 + Math.max(1, leafIndex) * ROW_HEIGHT;
  return { nodes: allNodes, edges, width: totalWidth, height: totalHeight };
}

// 贝塞尔曲线连接器路径
function bezierPath(from: LaidOutNode, to: LaidOutNode): string {
  const x1 = from.x + from.width;
  const y1 = from.y + from.height / 2;
  const x2 = to.x;
  const y2 = to.y + to.height / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

export default function MermaidMindmap({ content }: { content: string }) {
  const { root, layout } = useMemo(() => {
    const r = parseMarkdownTree(content);
    return { root: r, layout: r ? layoutTree(r) : null };
  }, [content]);

  if (!root || !layout) {
    return <div className="py-4 text-sm text-rose">⚠ 无法解析思维导图结构</div>;
  }

  const { nodes, edges, width, height } = layout;

  return (
    <div className="overflow-x-auto">
      <div className="relative" style={{ width, height, minWidth: '100%' }}>
        {/* SVG 连接线层 */}
        <svg
          className="absolute left-0 top-0 pointer-events-none"
          width={width}
          height={height}
          style={{ overflow: 'visible' }}
        >
          {edges.map((e, i) => {
            const color = palette[e.to.branchIndex % palette.length];
            return (
              <path
                key={i}
                d={bezierPath(e.from, e.to)}
                fill="none"
                stroke={color.stroke}
                strokeWidth={1.5}
                strokeOpacity={0.5}
              />
            );
          })}
        </svg>

        {/* 节点层 */}
        {nodes.map((n) => {
          const color = palette[n.branchIndex % palette.length];
          const isRoot = n.depth === 0;
          const isBranch = n.depth === 1;

          if (isRoot) {
            return (
              <div
                key={n.id}
                className="absolute flex items-center justify-center rounded-full text-white font-display font-semibold shadow-glow"
                style={{
                  left: n.x,
                  top: n.y,
                  width: n.width,
                  height: n.height + 8,
                  background: `linear-gradient(135deg, ${color.main}, ${color.main}dd)`,
                  fontSize: 14,
                  zIndex: 2,
                }}
              >
                {n.text}
              </div>
            );
          }

          if (isBranch) {
            return (
              <div
                key={n.id}
                className="absolute flex items-center justify-center rounded-lg text-white font-medium shadow-soft"
                style={{
                  left: n.x,
                  top: n.y,
                  width: n.width,
                  height: n.height,
                  background: color.main,
                  fontSize: 13,
                  zIndex: 2,
                }}
              >
                {n.text}
              </div>
            );
          }

          // 叶子 / 深层节点：浅色背景 + 彩色左边框
          return (
            <div
              key={n.id}
              className="absolute flex items-center rounded-md border bg-white shadow-soft"
              style={{
                left: n.x,
                top: n.y,
                width: n.width,
                height: n.height,
                borderColor: `${color.main}40`,
                borderLeft: `3px solid ${color.main}`,
                color: color.lightText,
                fontSize: 12,
                paddingLeft: 8,
                zIndex: 2,
              }}
            >
              <span className="truncate">{n.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
