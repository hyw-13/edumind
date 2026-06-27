import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, AlertCircle, Target, ArrowRight, Sparkles, RotateCcw, Check } from 'lucide-react';
import { pathNodes, pathEdges, type PathNode } from '@/data/mockData';
import { cn } from '@/lib/utils';

// 薄弱节点 → 对应学习资源映射
const weakNodeResources: Record<string, string> = {
  n10: 'res5', // 决策树与 SVM → 决策树 ID3/C4.5/CART 实战
  n7: 'res3',  // 搜索技术 → A* 搜索算法专项练习
};

// 分层布局坐标（7 阶段从左到右，覆盖知识库 8 大章节 16 节点）
const positions: Record<string, { x: number; y: number }> = {
  // 阶段 1：基础准备
  n1:  { x: 80,   y: 165 },
  n2:  { x: 80,   y: 335 },
  // 阶段 2：AI 概念层（第二/三/四章）
  n3:  { x: 270,  y: 80  },
  n4:  { x: 270,  y: 250 },
  n5:  { x: 270,  y: 420 },
  // 阶段 3：符号主义分支（第五章前半）
  n6:  { x: 460,  y: 80  },
  n7:  { x: 460,  y: 250 },
  n8:  { x: 460,  y: 420 },
  // 阶段 4：机器学习主线
  n9:  { x: 650,  y: 165 },
  n10: { x: 650,  y: 335 },
  // 阶段 5：深度学习
  n11: { x: 840,  y: 250 },
  // 阶段 6：高阶分支（CV / NLP / LLM）
  n12: { x: 1030, y: 80  },
  n13: { x: 1030, y: 250 },
  n14: { x: 1030, y: 420 },
  // 阶段 7：智能体与应用伦理
  n15: { x: 1220, y: 165 },
  n16: { x: 1220, y: 335 },
};

const statusMeta = {
  done: { color: '#0f766e', bg: '#ccfbf1', ring: '#0f766e', label: '已掌握', icon: 'done' },
  current: { color: '#ea580c', bg: '#fed7aa', ring: '#ea580c', label: '进行中', icon: 'current' },
  review: { color: '#e11d48', bg: '#ffe4e6', ring: '#e11d48', label: '需复习', icon: 'review' },
  todo: { color: '#a8a29e', bg: '#f5f0e8', ring: '#d6d3d1', label: '未开始', icon: 'todo' },
} as const;

export default function LearningPath() {
  const [selected, setSelected] = useState<PathNode | null>(pathNodes.find((n) => n.status === 'review') ?? null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 从推荐页跳转时自动选中并高亮指定节点
  useEffect(() => {
    const focus = searchParams.get('focus');
    if (focus) {
      const target = pathNodes.find((n) => n.id === focus);
      if (target) {
        setSelected(target);
        setFocusId(focus);
        // 3 秒后取消高亮闪烁
        setTimeout(() => setFocusId(null), 3000);
      }
      searchParams.delete('focus');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* Adjustment banner */}
      <div className={cn(
        'mb-5 flex items-start gap-3 rounded-xl border p-4 animate-fade-up transition-all duration-300',
        accepted
          ? 'border-teal/30 bg-teal-pale/30'
          : 'border-amber/30 bg-amber-pale/30'
      )}>
        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          accepted ? 'bg-teal/15' : 'bg-amber/15'
        )}>
          {accepted
            ? <CheckCircle2 size={18} className="text-teal" />
            : <AlertCircle size={18} className="text-amber" />
          }
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-ink">
            {accepted ? '已接受路径调整 · 复习节点已锁定' : '路径规划智能体检测到 2 个薄弱环节'}
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            {accepted
              ? '已将「决策树与 SVM」与「搜索技术」标记为优先复习节点。掌握度达到 70% 后可继续推进「深度学习基础」。'
              : '「决策树与 SVM」掌握度 42%、「搜索技术」58%，已在路径中插入复习节点。建议优先重做专项练习，掌握度达到 70% 后再推进「深度学习基础」。'
            }
          </p>
        </div>
        {!accepted ? (
          <button
            onClick={() => {
              setAccepted(true);
              // 找到掌握度最低的薄弱节点，跳转到对应学习资源
              const weakest = pathNodes
                .filter((n) => n.status === 'review')
                .sort((a, b) => a.mastery - b.mastery)[0];
              if (weakest) {
                setSelected(weakest);
                setFocusId(weakest.id);
                setTimeout(() => setFocusId(null), 3000);
                // 延迟跳转，让用户先看到横幅状态变化和高亮闪烁
                const resourceId = weakNodeResources[weakest.id];
                if (resourceId) {
                  setTimeout(() => {
                    navigate(`/resources?open=${resourceId}`);
                  }, 1200);
                }
              }
            }}
            className="flex items-center gap-1.5 rounded-lg bg-amber px-3 py-2 text-xs font-medium text-white transition-all hover:bg-amber-light hover:shadow-soft"
          >
            <RotateCcw size={13} /> 接受调整
          </button>
        ) : (
          <span className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-xs font-medium text-white">
            <Check size={13} /> 已接受
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Path graph */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">知识图谱学习路径</h2>
              <p className="text-xs text-ink-muted">人工智能导论 · 知识点 DAG</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              {Object.entries(statusMeta).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: v.color }} />
                  {v.label}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto bg-paper-soft/30 p-4">
            <PathGraph selected={selected} onSelect={setSelected} focusId={focusId} />
          </div>
        </div>

        {/* Node detail */}
        <div className="space-y-5">
          {selected ? <NodeDetail node={selected} /> : (
            <div className="card flex h-full items-center justify-center p-8 text-sm text-ink-muted">
              点击左侧节点查看详情
            </div>
          )}

          {/* Legend / progress summary */}
          <div className="card p-5">
            <h3 className="font-display text-sm font-semibold text-ink">学习进度概览</h3>
            <div className="mt-3 space-y-2.5">
              {Object.entries(statusMeta).map(([k, v]) => {
                const count = pathNodes.filter((n) => n.status === k).length;
                return (
                  <div key={k} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: v.color }} />
                    <span className="flex-1 text-xs text-ink-soft">{v.label}</span>
                    <span className="text-xs font-semibold text-ink">{count} / {pathNodes.length}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-deep">
              <div className="flex h-full">
                {Object.entries(statusMeta).map(([k, v]) => {
                  const count = pathNodes.filter((n) => n.status === k).length;
                  const pct = (count / pathNodes.length) * 100;
                  return <div key={k} style={{ width: `${pct}%`, background: v.color }} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PathGraph({ selected, onSelect, focusId }: { selected: PathNode | null; onSelect: (n: PathNode) => void; focusId: string | null }) {
  const w = 1320;
  const h = 500;

  return (
    <svg width={w} height={h} className="min-w-[1100px]">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill="#d6d3d1" />
        </marker>
        <marker id="arrowActive" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill="#0f766e" />
        </marker>
      </defs>

      {/* edges */}
      {pathEdges.map((e, i) => {
        const from = positions[e.from];
        const to = positions[e.to];
        const isActive = selected?.id === e.from || selected?.id === e.to;
        const fromNode = pathNodes.find((n) => n.id === e.from)!;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const fromR = 42;
        const toR = 42;
        const x1 = from.x + (dx / len) * fromR;
        const y1 = from.y + (dy / len) * fromR;
        const x2 = to.x - (dx / len) * (toR + 6);
        const y2 = to.y - (dy / len) * (toR + 6);
        const mx = (x1 + x2) / 2;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} Q ${mx} ${(y1 + y2) / 2 - 8} ${x2} ${y2}`}
            fill="none"
            stroke={isActive ? '#0f766e' : fromNode.status === 'done' ? '#5eead4' : '#e7e5e4'}
            strokeWidth={isActive ? 2.5 : 1.8}
            markerEnd={isActive ? 'url(#arrowActive)' : 'url(#arrow)'}
            strokeDasharray={fromNode.status === 'done' ? '0' : '5 4'}
          />
        );
      })}

      {/* nodes */}
      {pathNodes.map((node) => {
        const pos = positions[node.id];
        const meta = statusMeta[node.status];
        const isSelected = selected?.id === node.id;
        const isFocused = focusId === node.id;
        const r = 42;
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x}, ${pos.y})`}
            className="cursor-pointer"
            onClick={() => onSelect(node)}
          >
            {/* focus highlight ring (from recommend page) */}
            {isFocused && (
              <circle r={r + 12} fill="none" stroke="#0f766e" strokeWidth={3} opacity={0.6} className="animate-pulse-dot" />
            )}
            {/* glow for current */}
            {node.status === 'current' && (
              <circle r={r + 8} fill={meta.color} opacity={0.12} className="animate-pulse-dot" />
            )}
            <circle
              r={r}
              fill={meta.bg}
              stroke={isSelected ? meta.ring : meta.color}
              strokeWidth={isSelected ? 3 : 2}
              style={{ transition: 'all 0.2s' }}
            />
            {/* status icon */}
            {node.status === 'done' && (
              <CheckCircle2 size={18} color={meta.color} x={-9} y={-32} />
            )}
            {node.status === 'current' && (
              <Clock size={18} color={meta.color} x={-9} y={-32} />
            )}
            {node.status === 'review' && (
              <AlertCircle size={18} color={meta.color} x={-9} y={-32} />
            )}
            {node.status === 'todo' && (
              <Circle size={18} color={meta.color} x={-9} y={-32} />
            )}
            {/* label */}
            <text
              textAnchor="middle"
              y={4}
              className="fill-ink"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              {node.label}
            </text>
            <text
              textAnchor="middle"
              y={20}
              style={{ fontSize: 10, fill: meta.color, fontWeight: 600 }}
            >
              {node.mastery > 0 ? `${node.mastery}%` : '—'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function NodeDetail({ node }: { node: PathNode }) {
  const meta = statusMeta[node.status];
  const prerequisites = pathEdges.filter((e) => e.to === node.id).map((e) => pathNodes.find((n) => n.id === e.from)!);
  const next = pathEdges.filter((e) => e.from === node.id).map((e) => pathNodes.find((n) => n.id === e.to)!);

  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-center gap-2">
        <span className="rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </div>
      <h3 className="mt-2 font-display text-xl font-semibold text-ink">{node.label}</h3>
      <p className="text-xs text-ink-muted">{node.chapter}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted">掌握度</span>
          <span className="font-semibold" style={{ color: meta.color }}>{node.mastery}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-deep">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${node.mastery}%`, background: meta.color }} />
        </div>
      </div>

      {prerequisites.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <Target size={13} className="text-teal" /> 前置知识
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {prerequisites.map((p) => (
              <span key={p.id} className="rounded-md bg-paper-soft px-2 py-1 text-[11px] text-ink-soft">
                {p.label} <span className="text-ink-faint">({p.mastery}%)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {next.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <ArrowRight size={13} className="text-amber" /> 后续节点
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {next.map((p) => (
              <span key={p.id} className="rounded-md bg-amber-pale/40 px-2 py-1 text-[11px] text-amber">
                {p.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-line bg-paper-soft/40 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-teal">
          <Sparkles size={12} /> 智能体建议
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          {node.status === 'review' && '该节点掌握度偏低，建议重做练习题并观看视频讲解巩固。'}
          {node.status === 'current' && '正在学习中，建议按推荐顺序完成文档阅读与练习。'}
          {node.status === 'todo' && '尚未开始，建议先完成所有前置知识再进入。'}
          {node.status === 'done' && '已掌握，可继续推进后续节点。'}
        </p>
      </div>
    </div>
  );
}
