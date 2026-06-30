import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, AlertCircle, Target, ArrowRight, Sparkles, RotateCcw, Check } from 'lucide-react';
import { pathNodes, pathEdges, resources, resourceTypeMeta, type PathNode, type ResourceType, type Resource } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import Icon from '@/components/Icon';
import { cn } from '@/lib/utils';

// 学习路径节点 → 关联学习资源映射（用于动态计算掌握度）
const nodeRelatedResources: Record<string, string[]> = {
  n1:  [],                                                    // 数学基础（无直接资源，保留基础值）
  n2:  [],                                                    // Python 编程（无直接资源，保留基础值）
  n3:  ['res1'],                                              // AI 基础概念 → 三大流派解析
  n4:  ['res2', 'res12', 'res15'],                            // 发展历史 → 时间线 + 达特茅斯 + 历史练习
  n5:  ['res30'],                                             // 科学背景 → 神经/认知科学阅读
  n6:  ['res16'],                                             // 知识表示 → 知识表示方法综述
  n7:  ['res3', 'res17'],                                     // 搜索技术 → A*练习 + 搜索算法决策图
  n8:  ['res7'],                                              // 知识图谱 → 构建流程图
  n9:  ['res13', 'res19', 'res22'],                           // 机器学习 → ML基础 + K-Means + ML算法分类
  n10: ['res5'],                                              // 决策树与 SVM → 决策树实战
  n11: ['res14', 'res29'],                                    // 深度学习基础 → 神经网络练习 + NumPy 实现
  n12: ['res21'],                                             // 计算机视觉 → CNN 原理
  n13: ['res6', 'res24', 'res25'],                            // NLP 与 Transformer → 论文精读 + 自注意力实现 + BERT vs GPT
  n14: ['res8'],                                              // 大语言模型 → 预训练范式练习
  n15: ['res9'],                                              // 智能体 → 多智能体与 LangGraph
  n16: ['res11', 'res27'],                                    // 应用与伦理 → 伦理对齐 + 应用全景
};

// 基于已学资源动态计算节点掌握度与状态
function computeDynamicNodes(
  learnedResourceIds: Set<string>,
): PathNode[] {
  return pathNodes.map((node) => {
    const related = nodeRelatedResources[node.id] || [];
    if (related.length === 0) {
      // 无关联资源，保留原始掌握度（基础学科）
      return { ...node };
    }
    const learnedCount = related.filter((rid) => learnedResourceIds.has(rid)).length;
    const learnedRatio = learnedCount / related.length; // 0 ~ 1
    // 动态掌握度 = 基础值 * 0.5 + 学习完成比例 * 50，上限 100
    const baseMastery = node.mastery;
    const dynamicMastery = Math.min(100, Math.round(baseMastery * 0.5 + learnedRatio * 50));

    // 动态状态
    let status: PathNode['status'];
    if (dynamicMastery >= 70) {
      status = 'done';
    } else if (dynamicMastery >= 35) {
      status = 'current';
    } else if (learnedCount > 0) {
      status = 'review';
    } else {
      status = node.status === 'done' ? 'current' : node.status;
    }
    return { ...node, mastery: dynamicMastery, status };
  });
}

// 分层布局坐标（7 阶段从左到右，覆盖知识库 10 大章节 16 节点）
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
  // 从 store 读取已学资源，动态计算节点状态
  const learnedResources = useStore((s) => s.learnedResources);
  const learnedResourceIds = useMemo(
    () => new Set(learnedResources.map((r) => r.resourceId)),
    [learnedResources],
  );
  const dynamicNodes = useMemo(
    () => computeDynamicNodes(learnedResourceIds),
    [learnedResourceIds],
  );

  const [selected, setSelected] = useState<PathNode | null>(
    dynamicNodes.find((n) => n.status === 'review') ?? dynamicNodes.find((n) => n.status === 'current') ?? null,
  );
  const [focusId, setFocusId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 从推荐页跳转时自动选中并高亮指定节点
  useEffect(() => {
    const focus = searchParams.get('focus');
    if (focus) {
      const target = dynamicNodes.find((n) => n.id === focus);
      if (target) {
        setSelected(target);
        setFocusId(focus);
        // 3 秒后取消高亮闪烁
        setTimeout(() => setFocusId(null), 3000);
      }
      searchParams.delete('focus');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, dynamicNodes]);

  // 已学资源变化时，同步更新 selected 到最新节点数据（保持 id 不变，刷新 mastery/status）
  useEffect(() => {
    if (selected) {
      const updated = dynamicNodes.find((n) => n.id === selected.id);
      if (updated && (updated.mastery !== selected.mastery || updated.status !== selected.status)) {
        setSelected(updated);
      }
    }
  }, [dynamicNodes, selected]);

  // 检测薄弱节点（动态计算）
  const weakNodes = dynamicNodes.filter((n) => n.status === 'review' || (n.status === 'current' && n.mastery < 50));
  const hasWeakNodes = weakNodes.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* Adjustment banner */}
      <div className={cn(
        'mb-5 flex items-start gap-3 rounded-xl border p-4 animate-fade-up transition-all duration-300',
        !hasWeakNodes
          ? 'border-teal/30 bg-teal-pale/30'
          : 'border-amber/30 bg-amber-pale/30'
      )}>
        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          !hasWeakNodes ? 'bg-teal/15' : 'bg-amber/15'
        )}>
          {!hasWeakNodes
            ? <CheckCircle2 size={18} className="text-teal" />
            : <AlertCircle size={18} className="text-amber" />
          }
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-ink">
            {!hasWeakNodes
              ? '当前无薄弱环节 · 学习路径健康'
              : `路径规划智能体检测到 ${weakNodes.length} 个薄弱环节`}
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            {!hasWeakNodes
              ? '各节点掌握度良好，建议按路径顺序继续推进后续学习。'
              : weakNodes.map((n) => `「${n.label}」${n.mastery}%`).join('、') + '，建议优先复习对应资源，掌握度达到 70% 后再推进后续节点。'
            }
          </p>
        </div>
        {hasWeakNodes ? (
          <button
            onClick={() => {
              // 每次点击都找到掌握度最低的薄弱节点，选中并跳转到对应资源
              const weakest = [...weakNodes].sort((a, b) => a.mastery - b.mastery)[0];
              if (weakest) {
                setSelected(weakest);
                setFocusId(weakest.id);
                setTimeout(() => setFocusId(null), 3000);
                // 优先跳转第一个未学资源，否则跳转第一个关联资源
                const relatedIds = nodeRelatedResources[weakest.id] || [];
                const targetResourceId = relatedIds.find((rid) => !learnedResourceIds.has(rid)) || relatedIds[0];
                if (targetResourceId) {
                  setTimeout(() => {
                    navigate(`/resources?open=${targetResourceId}`);
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
            <Check size={13} /> 路径健康
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Path graph */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">知识图谱学习路径</h2>
              <p className="text-xs text-ink-muted">人工智能导论 · 知识点 DAG · 随学随新</p>
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
            <PathGraph nodes={dynamicNodes} selected={selected} onSelect={setSelected} focusId={focusId} />
          </div>
        </div>

        {/* Node detail */}
        <div className="space-y-5">
          {selected ? <NodeDetail node={selected} nodes={dynamicNodes} learnedResourceIds={learnedResourceIds} /> : (
            <div className="card flex h-full items-center justify-center p-8 text-sm text-ink-muted">
              点击左侧节点查看详情
            </div>
          )}

          {/* Legend / progress summary */}
          <div className="card p-5">
            <h3 className="font-display text-sm font-semibold text-ink">学习进度概览</h3>
            <div className="mt-3 space-y-2.5">
              {Object.entries(statusMeta).map(([k, v]) => {
                const count = dynamicNodes.filter((n) => n.status === k).length;
                return (
                  <div key={k} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: v.color }} />
                    <span className="flex-1 text-xs text-ink-soft">{v.label}</span>
                    <span className="text-xs font-semibold text-ink">{count} / {dynamicNodes.length}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-deep">
              <div className="flex h-full">
                {Object.entries(statusMeta).map(([k, v]) => {
                  const count = dynamicNodes.filter((n) => n.status === k).length;
                  const pct = (count / dynamicNodes.length) * 100;
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

function PathGraph({ nodes, selected, onSelect, focusId }: { nodes: PathNode[]; selected: PathNode | null; onSelect: (n: PathNode) => void; focusId: string | null }) {
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
        const fromNode = nodes.find((n) => n.id === e.from)!;
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
      {nodes.map((node) => {
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

function NodeDetail({ node, nodes, learnedResourceIds }: { node: PathNode; nodes: PathNode[]; learnedResourceIds: Set<string> }) {
  const navigate = useNavigate();
  // 订阅 store，确保学到新资源时 NodeDetail 自动刷新
  const liveLearned = useStore((s) => s.learnedResources);
  const learnedIds = useMemo(
    () => new Set(liveLearned.map((r) => r.resourceId)),
    [liveLearned],
  );

  const meta = statusMeta[node.status];
  const prerequisites = pathEdges.filter((e) => e.to === node.id).map((e) => nodes.find((n) => n.id === e.from)!).filter(Boolean) as PathNode[];
  const next = pathEdges.filter((e) => e.from === node.id).map((e) => nodes.find((n) => n.id === e.to)!).filter(Boolean) as PathNode[];

  // 当前节点关联的推荐学习资源（按顺序）
  const relatedResourceIds = nodeRelatedResources[node.id] || [];
  const relatedResources = relatedResourceIds
    .map((rid) => resources.find((r) => r.id === rid))
    .filter(Boolean) as Resource[];
  const learnedCount = relatedResourceIds.filter((rid) => learnedIds.has(rid)).length;

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

      {relatedResources.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
              <Sparkles size={13} className="text-teal" /> 推荐学习资源
            </div>
            <span className="text-[11px] text-ink-faint">{learnedCount}/{relatedResources.length} 已学</span>
          </div>
          <div className="mt-2 space-y-2">
            {relatedResources.map((r, idx) => {
              const rMeta = resourceTypeMeta[r.type as ResourceType];
              const isLearned = learnedIds.has(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(`/resources?open=${r.id}`)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-all hover:border-teal/30 hover:bg-white hover:shadow-soft',
                    isLearned ? 'border-teal/20 bg-teal-pale/20' : 'border-line bg-paper-soft/40'
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-pale text-[11px] font-semibold text-teal">
                    {idx + 1}
                  </span>
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', rMeta.bg)}>
                    <Icon name={rMeta.icon} size={15} className={rMeta.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-ink">{r.title}</div>
                    <div className="truncate text-[11px] text-ink-muted">{rMeta.label}{r.duration ? ` · ${r.duration}` : ''}</div>
                  </div>
                  {isLearned && (
                    <CheckCircle2 size={14} className="shrink-0 text-teal" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-line bg-paper-soft/40 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-teal">
          <Sparkles size={12} /> 智能体建议
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          {relatedResources.length > 0
            ? `该节点关联 ${relatedResources.length} 项学习资源，建议按顺序 ${relatedResources.map((_, i) => i + 1).join('→')} 完成学习，预计可提升掌握度至 70%+`
            : node.status === 'review'
              ? '该节点掌握度偏低，建议重做练习题并观看视频讲解巩固。'
              : node.status === 'current'
                ? '正在学习中，建议按推荐顺序完成文档阅读与练习。'
                : node.status === 'todo'
                  ? '尚未开始，建议先完成所有前置知识再进入。'
                  : '已掌握，可继续推进后续节点。'}
        </p>
      </div>
    </div>
  );
}
