import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Sparkles, ArrowRight, BookOpen, Library, Route, MessageCircleQuestion,
  TrendingUp, X, UserSearch, Zap, History, TrendingDown,
  ChevronDown, ChevronUp, CheckCircle2, Compass,
} from 'lucide-react';
import Icon from '@/components/Icon';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import RadarChart from '@/components/RadarChart';
import { recommend, hotTopics, type RecommendResult } from '@/lib/recommender';
import { useStore, type ProfileUpdateRecord } from '@/store/useStore';
import { profileDimensions } from '@/data/mockData';
import { knowledgeBase, type KnowledgePoint } from '@/data/knowledgeBase';
import { cn } from '@/lib/utils';

// 根据知识点 ID 查找
function findKnowledgePoint(id: string): { point: KnowledgePoint; chapter: string; section: string } | null {
  for (const ch of knowledgeBase) {
    for (const sec of ch.sections) {
      for (const pt of sec.points) {
        if (pt.id === id) return { point: pt, chapter: ch.title, section: sec.title };
      }
    }
  }
  return null;
}

const sourceIconMap: Record<ProfileUpdateRecord['source'], typeof Zap> = {
  dialogue: MessageCircleQuestion,
  quiz: Sparkles,
  path: Route,
  resource: Zap,
  manual: Zap,
};

export default function Discover() {
  const navigate = useNavigate();
  const { profile, updateHistory } = useStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [knowledgeModal, setKnowledgeModal] = useState<{ point: KnowledgePoint; chapter: string; section: string } | null>(null);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const radarData = profileDimensions.map((d) => ({ label: d.label, value: profile[d.key] }));

  const handleSearch = (q?: string) => {
    const text = (q ?? query).trim();
    if (!text) return;
    setQuery(text);
    setResult(recommend(text));
    setSearched(true);
  };

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col px-6 py-6 md:px-10">
      {/* ===== Hero 搜索区 ===== */}
      <div className="mb-5 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-deep shadow-glow">
            <Compass className="text-white" size={22} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">智学伴</h1>
            <p className="text-xs text-ink-muted">输入你想学的内容，AI 为你匹配最佳学习资料</p>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-white p-1.5 shadow-soft focus-within:border-teal/40 animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="flex flex-1 items-center gap-2 px-4">
          <Search size={18} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索知识点、资源、路径… 例如：Transformer、决策树、A* 算法"
            className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal to-teal-dark px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-glow"
        >
          <Sparkles size={15} /> 搜索
        </button>
      </div>

      {/* 热门主题 */}
      <div className="mt-3 flex flex-wrap items-center gap-2 animate-fade-up" style={{ animationDelay: '120ms' }}>
        <span className="flex items-center gap-1 text-xs font-medium text-ink-muted">
          <TrendingUp size={13} /> 热门：
        </span>
        {hotTopics.slice(0, 10).map((topic) => (
          <button
            key={topic}
            onClick={() => handleSearch(topic)}
            className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-soft transition-all hover:border-teal/30 hover:bg-teal-pale/40 hover:text-teal"
          >
            {topic}
          </button>
        ))}
      </div>

      {/* ===== 推荐结果区 ===== */}
      <div className="mt-5 flex-1 overflow-y-auto pr-1">
        {!searched ? (
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {[
              { icon: 'BookOpen', title: '8 章知识库', desc: '结构化 AI 知识体系，40+ 知识点', to: '/knowledge' },
              { icon: 'Library', title: '25 项资源', desc: '文档/题库/思维导图/代码/阅读', to: '/resources' },
              { icon: 'Route', title: '16 节点路径', desc: '完整 DAG 学习路径', to: '/path' },
            ].map((card, i) => (
              <button key={i} onClick={() => navigate(card.to)} className="card group p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lift animate-fade-up" style={{ animationDelay: `${180 + i * 80}ms` }}>
                <div className="flex items-center gap-2">
                  <Icon name={card.icon} size={16} className="text-teal" />
                  <span className="text-sm font-semibold text-ink group-hover:text-teal">{card.title}</span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{card.desc}</p>
              </button>
            ))}
          </div>
        ) : result && result.total > 0 ? (
          <div className="space-y-5">
            {/* 引导语 */}
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Sparkles size={15} className="text-teal" />
              <span>为你找到 <strong className="text-teal">{result.knowledge.length}</strong> 个知识点、<strong className="text-amber">{result.resources.length}</strong> 项资源、<strong className="text-rose">{result.paths.length}</strong> 个路径节点</span>
            </div>

            {/* 相关知识点 */}
            {result.knowledge.length > 0 && (
              <Section title="相关知识点" icon="BookOpen" color="text-teal">
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {result.knowledge.map((item) => (
                    <button key={item.id} onClick={() => {
                      const kp = findKnowledgePoint(item.id);
                      if (kp) setKnowledgeModal(kp);
                    }} className="card group p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <div className="text-sm font-medium text-ink group-hover:text-teal line-clamp-1">{item.title}</div>
                      <div className="mt-1 text-xs text-ink-muted line-clamp-2">{item.summary}</div>
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* 推荐学习资源 */}
            {result.resources.length > 0 && (
              <Section title="推荐学习资源" icon="Library" color="text-amber">
                <div className="grid gap-2.5 lg:grid-cols-2">
                  {result.resources.map((item) => (
                    <button key={item.id} onClick={() => navigate(`/resources?open=${item.id}`)} className="card group flex items-center gap-3 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-pale">
                        <Icon name="Library" size={16} className="text-amber" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-ink group-hover:text-amber line-clamp-1">{item.title}</div>
                        <div className="text-[11px] text-ink-muted">{item.meta}</div>
                      </div>
                      <ArrowRight size={14} className="shrink-0 text-ink-faint" />
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* 相关路径节点 */}
            {result.paths.length > 0 && (
              <Section title="相关路径节点" icon="Route" color="text-rose">
                <div className="space-y-2">
                  {result.paths.map((item) => (
                    <button key={item.id} onClick={() => navigate(`/path?focus=${item.id}`)} className="card group flex w-full items-center gap-3 p-3 text-left transition-all hover:border-rose/30 hover:bg-rose-pale/20">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-pale">
                        <Icon name="Route" size={15} className="text-rose" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-ink group-hover:text-rose line-clamp-1">{item.title}</div>
                        <div className="text-[11px] text-ink-muted">{item.meta}</div>
                      </div>
                      <ArrowRight size={14} className="shrink-0 text-ink-faint" />
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* 相关问题 */}
            {result.questions.length > 0 && (
              <Section title="相关问题" icon="MessageCircleQuestion" color="text-teal-dark">
                <div className="space-y-2">
                  {result.questions.map((item) => (
                    <button key={item.id} onClick={() => navigate(`/tutor?q=${encodeURIComponent(item.title)}`)} className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-2.5 text-left text-sm text-ink-soft transition-all hover:border-teal/30 hover:bg-teal-pale/20">
                      <MessageCircleQuestion size={15} className="shrink-0 text-teal-dark" />
                      <span className="flex-1 line-clamp-1">{item.title}</span>
                      <ArrowRight size={13} className="shrink-0 text-ink-faint" />
                    </button>
                  ))}
                </div>
              </Section>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Search size={32} className="mx-auto text-ink-faint" />
            <p className="mt-3 text-sm text-ink-muted">未找到与「{query}」相关的内容</p>
            <p className="mt-1 text-xs text-ink-faint">试试其他关键词，或浏览热门主题</p>
          </div>
        )}
      </div>

      {/* ===== 底部：我的学习画像小模块 ===== */}
      <ProfileWidget
        profile={profile}
        radarData={radarData}
        updateHistory={updateHistory}
        expanded={profileExpanded}
        onToggle={() => setProfileExpanded((v) => !v)}
      />

      {/* ===== 知识点详情弹窗 ===== */}
      {knowledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setKnowledgeModal(null)}>
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-line bg-paper-soft/50 px-6 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <Icon name="BookOpen" size={13} className="text-teal" />
                  {knowledgeModal.chapter} · {knowledgeModal.section}
                </div>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">{knowledgeModal.point.title}</h2>
                <p className="mt-1 text-sm text-ink-muted">{knowledgeModal.point.summary}</p>
              </div>
              <button onClick={() => setKnowledgeModal(null)} className="shrink-0 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-paper-soft hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <MarkdownRenderer content={knowledgeModal.point.detail} />
              {knowledgeModal.point.keyTerms && knowledgeModal.point.keyTerms.length > 0 && (
                <div className="mt-5 border-t border-line pt-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">关键术语</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {knowledgeModal.point.keyTerms.map((term) => (
                      <span key={term} className="rounded-md bg-teal-pale px-2.5 py-1 text-xs font-medium text-teal">{term}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-line bg-paper-soft/50 px-6 py-3">
              <span className="text-xs text-ink-muted">在知识库中查看完整内容</span>
              <button onClick={() => navigate(`/knowledge?point=${knowledgeModal.point.id}`)} className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-dark">
                前往知识库 <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ 区块标题 ============
function Section({ title, icon, color, children }: { title: string; icon: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <Icon name={icon} size={16} className={color} />
        <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ============ 底部画像小模块 ============
function ProfileWidget({
  profile,
  radarData,
  updateHistory,
  expanded,
  onToggle,
}: {
  profile: ReturnType<typeof useStore.getState>['profile'];
  radarData: { label: string; value: number }[];
  updateHistory: ProfileUpdateRecord[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-teal/20 bg-gradient-to-r from-teal-pale/30 to-amber-pale/20 shadow-soft">
      {/* 折叠标题栏 */}
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-5 py-3 text-left">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-white">
          <UserSearch size={16} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold text-ink">我的学习画像</span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-dot" /> 随学随新
            </span>
          </div>
          <div className="text-[11px] text-ink-muted">
            {updateHistory.length > 0 ? `已更新 ${updateHistory.length} 次 · 最近：${updateHistory[0]?.dimensionLabel} ${updateHistory[0]?.delta > 0 ? '+' : ''}${updateHistory[0]?.delta}` : '8 维动态画像 · 随答题/学习路径自动更新'}
          </div>
        </div>
        {/* 精简维度条（折叠时显示） */}
        {!expanded && (
          <div className="hidden items-center gap-3 sm:flex">
            {profileDimensions.slice(0, 4).map((d) => (
              <div key={d.key} className="flex items-center gap-1.5">
                <span className="text-[10px] text-ink-muted">{d.label}</span>
                <div className="h-1 w-10 overflow-hidden rounded-full bg-paper-deep">
                  <div className="h-full rounded-full bg-teal" style={{ width: `${profile[d.key]}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-teal">{profile[d.key]}</span>
              </div>
            ))}
          </div>
        )}
        {expanded ? <ChevronDown size={18} className="text-ink-muted" /> : <ChevronUp size={18} className="text-ink-muted" />}
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="grid gap-5 border-t border-teal/10 px-5 py-4 animate-fade-up md:grid-cols-[260px_1fr]">
          {/* 左：雷达图 */}
          <div>
            <div className="flex justify-center">
              <RadarChart data={radarData} size={220} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {profileDimensions.map((d) => (
                <div key={d.key} className="flex items-center gap-1.5">
                  <span className="w-16 shrink-0 text-[10px] text-ink-muted">{d.label}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-paper-deep">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal to-teal-light transition-all duration-700" style={{ width: `${profile[d.key]}%` }} />
                  </div>
                  <span className="w-6 text-right text-[10px] font-semibold text-teal">{profile[d.key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 右：随学随新记录 */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
              <History size={13} className="text-amber" /> 随学随新
              <span className="text-[10px] font-normal text-ink-muted">（答题/路径学习自动更新）</span>
            </div>
            {updateHistory.length === 0 ? (
              <div className="py-4 text-center text-[11px] text-ink-faint">
                <Sparkles size={18} className="mx-auto mb-1 opacity-40" />
                去答题或学习路径，画像将自动更新
              </div>
            ) : (
              <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
                {updateHistory.slice(0, 10).map((rec) => {
                  const Icon = sourceIconMap[rec.source];
                  const isUp = rec.delta > 0;
                  return (
                    <div key={rec.id} className="flex items-center gap-2 text-[11px]">
                      <Icon size={12} className={cn('shrink-0', isUp ? 'text-teal' : 'text-rose')} />
                      <span className="font-medium text-ink-soft">{rec.dimensionLabel}</span>
                      <span className="text-ink-faint">{rec.oldValue}→<span className={isUp ? 'text-teal' : 'text-rose'}>{rec.newValue}</span></span>
                      <span className={cn('flex items-center gap-0.5', isUp ? 'text-teal' : 'text-rose')}>
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(rec.delta)}
                      </span>
                      <span className="ml-auto truncate text-[10px] text-ink-muted">{rec.reason}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {updateHistory.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-teal">
                <CheckCircle2 size={11} /> 画像随学习行为持续更新
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
