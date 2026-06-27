import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronRight, ChevronDown, Search, Tag, ArrowRight, Layers, FileText } from 'lucide-react';
import Icon from '@/components/Icon';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { knowledgeBase, type KnowledgePoint, type KnowledgeChapter } from '@/data/knowledgeBase';
import { cn } from '@/lib/utils';

// 章节配色
const chapterColors = [
  'text-teal',    'text-amber',    'text-rose',     'text-teal-dark',
  'text-amber',   'text-rose',     'text-teal',     'text-amber',
];
const chapterBgs = [
  'bg-teal-pale', 'bg-amber-pale', 'bg-rose-pale', 'bg-teal-pale/60',
  'bg-amber-pale/60', 'bg-rose-pale/60', 'bg-teal-pale/40', 'bg-amber-pale/40',
];

export default function Knowledge() {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['ch1']));
  const [selectedPoint, setSelectedPoint] = useState<{ point: KnowledgePoint; chapter: KnowledgeChapter; sectionTitle: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // 统计
  const stats = useMemo(() => {
    let sections = 0, points = 0;
    knowledgeBase.forEach((ch) => {
      sections += ch.sections.length;
      points += ch.sections.reduce((s, sec) => s + sec.points.length, 0);
    });
    return { chapters: knowledgeBase.length, sections, points };
  }, []);

  // 默认选中第一个知识点
  useEffect(() => {
    if (!selectedPoint && knowledgeBase[0]?.sections[0]?.points[0]) {
      const ch = knowledgeBase[0];
      const sec = ch.sections[0];
      setSelectedPoint({ point: sec.points[0], chapter: ch, sectionTitle: sec.title });
    }
  }, [selectedPoint]);

  // 从 URL 参数定位知识点
  useEffect(() => {
    const pointId = searchParams.get('point');
    if (pointId) {
      for (const ch of knowledgeBase) {
        for (const sec of ch.sections) {
          for (const pt of sec.points) {
            if (pt.id === pointId) {
              setSelectedPoint({ point: pt, chapter: ch, sectionTitle: sec.title });
              setExpandedChapters((prev) => new Set(prev).add(ch.id));
              break;
            }
          }
        }
      }
      searchParams.delete('point');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectPoint = (point: KnowledgePoint, chapter: KnowledgeChapter, sectionTitle: string) => {
    setSelectedPoint({ point, chapter, sectionTitle });
  };

  // 搜索过滤
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { point: KnowledgePoint; chapter: KnowledgeChapter; sectionTitle: string }[] = [];
    for (const ch of knowledgeBase) {
      for (const sec of ch.sections) {
        for (const pt of sec.points) {
          if (
            pt.title.toLowerCase().includes(q) ||
            pt.summary.toLowerCase().includes(q) ||
            (pt.keyTerms || []).some((t) => t.toLowerCase().includes(q))
          ) {
            results.push({ point: pt, chapter: ch, sectionTitle: sec.title });
          }
        }
      }
    }
    return results;
  }, [searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* 顶部统计 */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-teal/20 bg-gradient-to-r from-teal-pale/40 to-amber-pale/30 p-4 animate-fade-up">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal text-white shadow-glow">
          <BookOpen size={20} />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-ink">人工智能导论 · 知识库</h2>
          <p className="text-xs text-ink-muted">结构化知识体系 · 多智能体协同生成的学习内容权威数据源</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-center">
            <div className="font-display text-lg font-bold text-teal">{stats.chapters}</div>
            <div className="text-ink-muted">章节</div>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <div className="font-display text-lg font-bold text-amber">{stats.sections}</div>
            <div className="text-ink-muted">小节</div>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <div className="font-display text-lg font-bold text-rose">{stats.points}</div>
            <div className="text-ink-muted">知识点</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* ===== 左侧：章节树 + 搜索 ===== */}
        <div className="space-y-4">
          {/* 搜索框 */}
          <div className="card p-3">
            <div className="flex items-center gap-2 rounded-lg bg-paper-soft px-3 py-2">
              <Search size={16} className="shrink-0 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索知识点、术语…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>

          {/* 搜索结果 / 章节树 */}
          <div className="card max-h-[calc(100vh-280px)] overflow-y-auto p-2">
            {searchResults ? (
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-ink-muted">
                  搜索结果（{searchResults.length}）
                </div>
                {searchResults.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-ink-faint">未找到匹配知识点</div>
                ) : (
                  searchResults.map(({ point, chapter, sectionTitle }) => (
                    <button
                      key={point.id}
                      onClick={() => selectPoint(point, chapter, sectionTitle)}
                      className={cn(
                        'flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors',
                        selectedPoint?.point.id === point.id ? 'bg-teal-pale' : 'hover:bg-paper-soft'
                      )}
                    >
                      <span className="text-sm font-medium text-ink line-clamp-1">{point.title}</span>
                      <span className="text-[11px] text-ink-muted">{chapter.title} · {sectionTitle}</span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {knowledgeBase.map((ch, ci) => {
                  const isExpanded = expandedChapters.has(ch.id);
                  return (
                    <div key={ch.id}>
                      {/* 章节标题 */}
                      <button
                        onClick={() => toggleChapter(ch.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-paper-soft"
                      >
                        {isExpanded ? <ChevronDown size={15} className="shrink-0 text-ink-muted" /> : <ChevronRight size={15} className="shrink-0 text-ink-muted" />}
                        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold', chapterBgs[ci % 8], chapterColors[ci % 8])}>
                          {ch.index}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-ink">{ch.title}</span>
                        <span className="text-[10px] text-ink-faint">
                          {ch.sections.reduce((s, sec) => s + sec.points.length, 0)}
                        </span>
                      </button>
                      {/* 小节与知识点 */}
                      {isExpanded && (
                        <div className="ml-4 border-l border-line pl-2">
                          {ch.sections.map((sec) => (
                            <div key={sec.id} className="py-0.5">
                              <div className="px-3 py-1 text-[11px] font-medium text-ink-muted">{sec.title}</div>
                              {sec.points.map((pt) => (
                                <button
                                  key={pt.id}
                                  onClick={() => selectPoint(pt, ch, sec.title)}
                                  className={cn(
                                    'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-colors',
                                    selectedPoint?.point.id === pt.id
                                      ? 'bg-teal-pale text-teal'
                                      : 'text-ink-soft hover:bg-paper-soft'
                                  )}
                                >
                                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', selectedPoint?.point.id === pt.id ? 'bg-teal' : 'bg-line')} />
                                  <span className="flex-1 text-xs line-clamp-1">{pt.title}</span>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ===== 右侧：知识点详情 ===== */}
        <div className="card min-h-[calc(100vh-280px)] overflow-hidden">
          {selectedPoint ? (
            <div className="flex h-full flex-col">
              {/* 面包屑 + 标题 */}
              <div className="border-b border-line bg-paper-soft/40 px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Layers size={13} className="text-teal" />
                  <span>第 {selectedPoint.chapter.index} 章</span>
                  <ChevronRight size={12} />
                  <span>{selectedPoint.chapter.title}</span>
                  <ChevronRight size={12} />
                  <span>{selectedPoint.sectionTitle}</span>
                </div>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink">{selectedPoint.point.title}</h1>
                <p className="mt-1 text-sm text-ink-muted">{selectedPoint.point.summary}</p>
              </div>

              {/* 内容 */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-medium text-teal">
                  <FileText size={14} />
                  知识详解
                </div>
                <MarkdownRenderer content={selectedPoint.point.detail} />

                {/* 关键术语 */}
                {selectedPoint.point.keyTerms && selectedPoint.point.keyTerms.length > 0 && (
                  <div className="mt-6 rounded-xl border border-line bg-paper-soft/30 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                      <Tag size={14} className="text-amber" />
                      关键术语
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedPoint.point.keyTerms.map((term) => (
                        <span key={term} className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-ink-soft shadow-soft">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 底部：上一题/下一题导航 */}
              <KnowledgeNav
                currentId={selectedPoint.point.id}
                onSelect={selectPoint}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-sm text-ink-muted">
              <div className="text-center">
                <BookOpen size={32} className="mx-auto text-ink-faint" />
                <p className="mt-3">从左侧选择知识点开始学习</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 知识点上下导航
function KnowledgeNav({
  currentId,
  onSelect,
}: {
  currentId: string;
  onSelect: (point: KnowledgePoint, chapter: KnowledgeChapter, sectionTitle: string) => void;
}) {
  // 扁平化所有知识点
  const flat = useMemo(() => {
    const list: { point: KnowledgePoint; chapter: KnowledgeChapter; sectionTitle: string }[] = [];
    for (const ch of knowledgeBase) {
      for (const sec of ch.sections) {
        for (const pt of sec.points) {
          list.push({ point: pt, chapter: ch, sectionTitle: sec.title });
        }
      }
    }
    return list;
  }, []);

  const idx = flat.findIndex((f) => f.point.id === currentId);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="flex items-center justify-between border-t border-line bg-paper-soft/40 px-6 py-3">
      {prev ? (
        <button
          onClick={() => onSelect(prev.point, prev.chapter, prev.sectionTitle)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-white hover:text-teal"
        >
          <ChevronRight size={13} className="rotate-180" />
          <div className="text-left">
            <div className="text-[10px] text-ink-faint">上一节</div>
            <div className="line-clamp-1">{prev.point.title}</div>
          </div>
        </button>
      ) : <div />}

      <span className="text-[11px] text-ink-faint">{idx + 1} / {flat.length}</span>

      {next ? (
        <button
          onClick={() => onSelect(next.point, next.chapter, next.sectionTitle)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-white hover:text-teal"
        >
          <div className="text-right">
            <div className="text-[10px] text-ink-faint">下一节</div>
            <div className="line-clamp-1">{next.point.title}</div>
          </div>
          <ChevronRight size={13} />
        </button>
      ) : <div />}
    </div>
  );
}
