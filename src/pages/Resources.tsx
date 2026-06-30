import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Sparkles, Clock, ChevronRight, Terminal, CheckCircle2, Loader2, RotateCcw, Award, ChevronLeft, Network, Send, Cpu, FileText } from 'lucide-react';
import Icon from '@/components/Icon';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AgentCollaborationPanel from '@/components/AgentCollaborationPanel';
import MermaidMindmap from '@/components/MermaidMindmap';
import { resources, resourceTypeMeta, type ResourceType, type Resource } from '@/data/mockData';
import { findQuizByResource, type Quiz, type QuizQuestion } from '@/data/quizData';
import { workflows, getWorkflow, type AgentWorkflow } from '@/data/agentWorkflows';
import { generateMockContent } from '@/lib/generateMockContent';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const types: { key: ResourceType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'doc', label: '讲解文档' },
  { key: 'mindmap', label: '思维导图' },
  { key: 'quiz', label: '练习题库' },
  { key: 'reading', label: '拓展阅读' },
  { key: 'code', label: '代码案例' },
];

const difficultyStyle = {
  入门: 'bg-emerald-50 text-emerald-700',
  进阶: 'bg-amber-pale text-amber',
  高阶: 'bg-rose-pale text-rose',
} as const;

export default function Resources() {
  const [filter, setFilter] = useState<ResourceType | 'all'>('all');
  const [selected, setSelected] = useState<Resource | null>(null);
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  const [genTopic, setGenTopic] = useState('');
  const [activeWorkflow, setActiveWorkflow] = useState<AgentWorkflow | null>(null);
  const [genFinished, setGenFinished] = useState(false);
  const [showGenResult, setShowGenResult] = useState(false);
  const [genQuiz, setGenQuiz] = useState<Quiz | null>(null);
  const [showQuizPlayer, setShowQuizPlayer] = useState(false);
  const profile = useStore((s) => s.profile);
  const [searchParams, setSearchParams] = useSearchParams();

  const filtered = filter === 'all' ? resources : resources.filter((r) => r.type === filter);
  const isGenerating = activeWorkflow !== null && !genFinished;

  // 生成完成后计算实际内容（仅一次，避免重渲染时重复生成）
  const generatedContent = useMemo(() => {
    if (!activeWorkflow || !genFinished) return '';
    return generateMockContent(activeWorkflow.type, genTopic, profile);
  }, [activeWorkflow, genFinished, genTopic, profile]);

  // 从推荐页跳转时自动打开指定资源
  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId) {
      const target = resources.find((r) => r.id === openId);
      if (target) {
        setSelected(target);
        setFilter(target.type);
      }
      searchParams.delete('open');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // 开始生成
  const startGenerate = () => {
    if (!selectedType || !genTopic.trim()) return;
    const wf = getWorkflow(selectedType);
    if (!wf) return;
    setActiveWorkflow(wf);
    setGenFinished(false);
    setShowGenPanel(false);
  };

  // 生成完成
  const handleGenComplete = () => {
    setTimeout(() => {
      setGenFinished(true);
      setShowGenResult(true);
    }, 500);
  };

  // 重置生成
  const resetGen = () => {
    setActiveWorkflow(null);
    setGenFinished(false);
    setShowGenResult(false);
    setSelectedType(null);
    setGenTopic('');
    setGenQuiz(null);
    setShowQuizPlayer(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* Header with generate button */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">个性化学习资源</h2>
          <p className="text-sm text-ink-muted">多智能体协同生成 · 5 类资源全方位覆盖 · 基于 LangGraph 编排</p>
        </div>
        {!activeWorkflow && (
          <button
            onClick={() => setShowGenPanel(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-teal-dark px-4 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:shadow-lift"
          >
            <Network size={16} /> 多智能体协作生成
          </button>
        )}
      </div>

      {/* 生成类型选择面板 */}
      {showGenPanel && !activeWorkflow && (
        <div className="card mb-6 p-5 animate-fade-up">
          <div className="mb-3 flex items-center gap-2">
            <Network size={16} className="text-teal" />
            <h3 className="font-display text-sm font-semibold text-ink">选择资源类型 · 智能体协作生成</h3>
            <span className="text-[10px] text-ink-muted">每种类型由不同角色智能体协作完成</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((wf) => {
              const meta = resourceTypeMeta[wf.type];
              const isSelected = selectedType === wf.type;
              return (
                <button
                  key={wf.type}
                  onClick={() => setSelectedType(wf.type)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    isSelected ? 'border-teal/40 bg-teal-pale/30 shadow-soft' : 'border-line bg-white hover:border-teal/20'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', meta.bg)}>
                      <Icon name={wf.icon} size={15} className={meta.color} />
                    </div>
                    <span className="text-sm font-semibold text-ink">{wf.title}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">{wf.desc}</p>
                </button>
              );
            })}
          </div>
          {/* 主题输入 + 开始 */}
          {selectedType && (
            <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 animate-fade-up">
              <Cpu size={15} className="shrink-0 text-teal" />
              <span className="text-xs font-medium text-ink-soft">生成主题：</span>
              <input
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startGenerate()}
                placeholder="输入知识点或章节，如：决策树、Transformer、A* 算法…"
                className="flex-1 rounded-lg border border-line bg-paper-soft/40 px-3 py-2 text-sm text-ink outline-none focus:border-teal/40"
              />
              <button
                onClick={startGenerate}
                disabled={!genTopic.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-dark disabled:opacity-40"
              >
                <Send size={14} /> 开始协作生成
              </button>
            </div>
          )}
        </div>
      )}

      {/* 智能体协作生成面板 */}
      {activeWorkflow && (
        <div className="card mb-6 p-5 animate-fade-up">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', resourceTypeMeta[activeWorkflow.type].bg)}>
                <Icon name={activeWorkflow.icon} size={17} className={resourceTypeMeta[activeWorkflow.type].color} />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">{activeWorkflow.title}</div>
                <div className="text-[11px] text-ink-muted">主题：{genTopic} · 协调智能体已接收任务</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {genFinished && (
                <button
                  onClick={() => setShowGenResult((v) => !v)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                    showGenResult
                      ? 'border-teal bg-teal-pale/40 text-teal'
                      : 'border-line bg-white text-ink-soft hover:border-teal/30 hover:text-teal'
                  )}
                >
                  <FileText size={12} /> {showGenResult ? '收起结果' : '查看生成结果'}
                </button>
              )}
              {genFinished && (
                <button onClick={resetGen} className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-all hover:border-teal/30 hover:text-teal">
                  <RotateCcw size={12} /> 重新生成
                </button>
              )}
            </div>
          </div>
          <AgentCollaborationPanel
            key={genTopic + activeWorkflow.type}
            workflow={activeWorkflow}
            topic={genTopic}
            profile={profile}
            onComplete={handleGenComplete}
          />

          {/* ===== 生成结果展示 ===== */}
          {genFinished && showGenResult && generatedContent && (
            <div className="mt-4 animate-fade-up">
              <div className="mb-3 flex items-center gap-2 border-t border-line pt-3">
                <Sparkles size={14} className="text-teal" />
                <h4 className="text-sm font-semibold text-ink">生成结果</h4>
                <span className="rounded-md bg-teal-pale px-2 py-0.5 text-[10px] font-medium text-teal">
                  {resourceTypeMeta[activeWorkflow.type].label}
                </span>
                <span className="text-[10px] text-ink-faint">· 基于画像个性化生成 · 主题「{genTopic}」</span>
              </div>
              <div className="rounded-xl border border-teal/20 bg-white p-5">
                {activeWorkflow.type === 'mindmap' ? (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs text-ink-muted">
                      <Network size={12} className="text-teal" />
                      可视化思维导图
                    </div>
                    <div className="rounded-lg border border-line bg-paper-soft/40 p-4">
                      <MermaidMindmap content={generatedContent} />
                    </div>
                  </div>
                ) : activeWorkflow.type === 'quiz' ? (
                  <div>
                    <MarkdownRenderer content={generatedContent} />
                    <div className="mt-5 border-t-2 border-dashed border-line pt-4">
                      {!showQuizPlayer || !genQuiz ? (
                        <button
                          onClick={() => {
                            setGenQuiz(parseGeneratedQuiz(generatedContent, genTopic));
                            setShowQuizPlayer(true);
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose px-4 py-3 text-sm font-medium text-white shadow-soft transition-all hover:opacity-90"
                        >
                          <Icon name="ListChecks" size={16} /> 开始答题
                        </button>
                      ) : (
                        <QuizPlayer quiz={genQuiz} />
                      )}
                    </div>
                  </div>
                ) : (
                  <MarkdownRenderer content={generatedContent} />
                )}
              </div>
              <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-ink-muted">
                <Sparkles size={11} className="text-teal" />
                内容由 8 智能体协作生成（模拟） · 已根据画像适配难度与风格
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
              filter === t.key
                ? 'border-teal bg-teal text-white shadow-soft'
                : 'border-line bg-white text-ink-soft hover:border-teal/30 hover:text-teal'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Resource grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r, idx) => {
          const meta = resourceTypeMeta[r.type];
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="card group flex flex-col p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lift animate-fade-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', meta.bg)}>
                  <Icon name={meta.icon} size={20} className={meta.color} />
                </div>
                <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium', difficultyStyle[r.difficulty])}>
                  {r.difficulty}
                </span>
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-ink group-hover:text-teal transition-colors">{r.title}</h3>
              <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-ink-muted">{r.summary}</p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-ink-faint">
                <span>{r.chapter}</span>
                <span className="flex items-center gap-1">
                  {r.duration && <Clock size={11} />}
                  {r.duration ?? r.createdAt}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selected && (
        <ResourceDrawer resource={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ResourceDrawer({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const meta = resourceTypeMeta[resource.type];
  const markResourceLearned = useStore((s) => s.markResourceLearned);
  const isLearned = useStore((s) => s.learnedResources.some((r) => r.resourceId === resource.id));
  const [marked, setMarked] = useState(false);
  const alreadyLearned = isLearned || marked;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleMarkLearned = () => {
    if (alreadyLearned) return;
    const ok = markResourceLearned({
      id: resource.id,
      title: resource.title,
      type: resource.type,
      chapter: resource.chapter,
    });
    if (ok) setMarked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative flex h-full w-full flex-col bg-paper shadow-lift animate-fade-up">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line bg-white px-8 py-5">
          <div className="flex items-start gap-3">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', meta.bg)}>
              <Icon name={meta.icon} size={20} className={meta.color} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', meta.bg, meta.color)}>{meta.label}</span>
                <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', difficultyStyle[resource.difficulty])}>{resource.difficulty}</span>
              </div>
              <h2 className="mt-1.5 font-display text-xl font-semibold text-ink">{resource.title}</h2>
              <p className="text-xs text-ink-muted">{resource.chapter} · {resource.duration ?? resource.createdAt}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-all hover:bg-paper-soft hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {/* Content - 全屏展示，内容居中保持可读性 */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto max-w-5xl px-8 py-6">
            {resource.type === 'mindmap' ? (
              <div className="rounded-xl border border-line bg-paper-soft/40 p-4">
                <MermaidMindmap content={resource.content} />
              </div>
            ) : resource.type === 'quiz' && resource.quizId ? (
              <div>
                <MarkdownRenderer content={resource.content} />
                <div className="mt-6 border-t-2 border-dashed border-line pt-5">
                  <QuizPlayer quiz={findQuizByResource(resource.id)!} />
                </div>
              </div>
            ) : (
              <MarkdownRenderer content={resource.content} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-white px-8 py-4">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Sparkles size={13} className="text-teal" /> 由 {meta.label}智能体 生成
          </span>
          <button
            onClick={handleMarkLearned}
            disabled={alreadyLearned}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              alreadyLearned
                ? 'cursor-default bg-emerald-50 text-emerald-600'
                : 'bg-teal text-white hover:bg-teal-dark hover:shadow-soft'
            )}
          >
            {alreadyLearned ? (
              <>
                <CheckCircle2 size={15} /> 已标记学习
              </>
            ) : (
              <>
                标记已学 <ChevronRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ 交互式答题系统 ============
const typeLabel: Record<QuizQuestion['type'], { label: string; cls: string }> = {
  single:   { label: '单选题', cls: 'bg-teal-pale text-teal' },
  multi:    { label: '多选题', cls: 'bg-amber-pale text-amber' },
  truefalse:{ label: '判断题', cls: 'bg-rose-pale text-rose' },
};

const diffLabel: Record<QuizQuestion['difficulty'], { label: string; cls: string }> = {
  easy:   { label: '基础', cls: 'bg-emerald-50 text-emerald-700' },
  medium: { label: '中等', cls: 'bg-amber-pale text-amber' },
  hard:   { label: '挑战', cls: 'bg-rose-pale text-rose' },
};

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

// 解析多智能体生成的 Markdown 题目为可交互的 Quiz 对象
// 格式：## 第 X 题（单选/多选/判断 · 难度）+ **题干** + - A. 选项 + **答案** + **解析** + **知识点**
function parseGeneratedQuiz(content: string, topic: string): Quiz {
  const questions: QuizQuestion[] = [];
  const blocks = content.split(/^---$/m);

  const typeMap: Record<string, QuizQuestion['type']> = {
    '单选': 'single',
    '多选': 'multi',
    '判断': 'truefalse',
  };
  const diffMap: Record<string, QuizQuestion['difficulty']> = {
    '入门': 'easy',
    '进阶': 'medium',
    '高阶': 'hard',
  };

  for (const block of blocks) {
    const headerMatch = block.match(/## 第\s*(\d+)\s*题[（(](单选|多选|判断)\s*[·•]\s*(入门|进阶|高阶)[）)]/);
    if (!headerMatch) continue;

    const qNum = parseInt(headerMatch[1], 10);
    const type = typeMap[headerMatch[2]];
    const difficulty = diffMap[headerMatch[3]];
    const afterHeader = block.substring(block.indexOf(headerMatch[0]) + headerMatch[0].length);

    // 题干：首个 ** 加粗段
    const questionMatch = afterHeader.match(/\*\*(.+?)\*\*/);
    const question = questionMatch ? questionMatch[1].trim() : `${topic} 相关问题 ${qNum}`;

    // 选项：- A. xxx / - A、xxx / - A) xxx
    const options: string[] = [];
    const optionRe = /^-\s+([A-Z])[.、)]\s*(.+)$/gm;
    let m: RegExpExecArray | null;
    while ((m = optionRe.exec(afterHeader)) !== null) {
      options.push(m[2].replace(/\s*[✓✗]\s*$/, '').trim());
    }
    // 判断题无显式选项，使用默认
    if (type === 'truefalse' && options.length === 0) {
      options.push('正确', '错误');
    }

    // 答案：**答案**：C / A、B、D / 正确 / 错误
    const answerMatch = afterHeader.match(/\*\*答案\*\*[：:]\s*(.+?)(?:\n|$)/);
    let answer: number[] = [];
    if (answerMatch) {
      const ans = answerMatch[1].trim();
      if (type === 'truefalse') {
        answer = ans.includes('正确') ? [0] : [1];
      } else {
        const letters = ans.match(/[A-Z]/g) || [];
        answer = letters.map((l) => l.charCodeAt(0) - 65);
      }
    }

    // 解析
    const explanationMatch = afterHeader.match(/\*\*解析\*\*[：:]\s*(.+)/);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';

    // 知识点
    const kpMatch = afterHeader.match(/\*\*知识点\*\*[：:]\s*(.+?)(?:\n|$)/);
    const knowledgePoint = kpMatch ? kpMatch[1].trim() : undefined;

    questions.push({
      id: `gen-${qNum}`,
      type,
      question,
      options,
      answer,
      explanation,
      difficulty,
      knowledgePoint,
    });
  }

  return {
    id: `gen-quiz-${Date.now()}`,
    resourceId: '',
    title: `${topic} · AI 生成练习`,
    chapter: topic,
    questions,
  };
}

function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const recordQuizResult = useStore((s) => s.recordQuizResult);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const question = quiz.questions[currentIdx];
  const total = quiz.questions.length;
  const isLast = currentIdx === total - 1;
  const selected = answers[question.id] || [];
  const submitted = !!submittedMap[question.id];
  const correct = submitted && arraysEqual(selected, question.answer);

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      if (question.type === 'multi') {
        const cur = prev[question.id] || [];
        const next = cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx];
        return { ...prev, [question.id]: next.sort((a, b) => a - b) };
      }
      return { ...prev, [question.id]: [idx] };
    });
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    setSubmittedMap((prev) => ({ ...prev, [question.id]: true }));
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      // 随学随新：答题完成后记录结果（写入 quizResults + 学习活动 + 更新画像）
      const finalScore = quiz.questions.filter((q) => submittedMap[q.id] && arraysEqual(answers[q.id] || [], q.answer)).length;
      recordQuizResult(finalScore, quiz.questions.length, quiz.title);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswers({});
    setSubmittedMap({});
    setFinished(false);
  };

  const score = quiz.questions.filter((q) => submittedMap[q.id] && arraysEqual(answers[q.id] || [], q.answer)).length;
  const answeredCount = Object.keys(submittedMap).filter((k) => submittedMap[k]).length;

  // ---- 结果页 ----
  if (finished) {
    const pct = Math.round((score / total) * 100);
    const pass = pct >= 60;
    return (
      <div className="animate-fade-up">
        <div className="rounded-2xl border border-line bg-paper-soft/40 p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal-dark shadow-glow">
            <Award size={36} className="text-white" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold text-ink">答题完成</h3>
          <p className="mt-1 text-sm text-ink-muted">{quiz.title}</p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div>
              <div className="font-display text-4xl font-bold text-teal">{score}<span className="text-lg text-ink-faint">/{total}</span></div>
              <div className="text-xs text-ink-muted">答对题数</div>
            </div>
            <div className="h-10 w-px bg-line" />
            <div>
              <div className={cn('font-display text-4xl font-bold', pass ? 'text-teal' : 'text-rose')}>{pct}<span className="text-lg text-ink-faint">%</span></div>
              <div className="text-xs text-ink-muted">{pass ? '通过' : '未通过'}</div>
            </div>
          </div>
        </div>

        {/* 逐题回顾 */}
        <div className="mt-5 space-y-3">
          <h4 className="text-sm font-semibold text-ink">逐题回顾</h4>
          {quiz.questions.map((q, i) => {
            const ok = arraysEqual(answers[q.id] || [], q.answer);
            return (
              <button
                key={q.id}
                onClick={() => { setFinished(false); setCurrentIdx(i); }}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left transition-all hover:border-teal/30 hover:shadow-soft"
              >
                <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold', ok ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-pale text-rose')}>
                  {ok ? <CheckCircle2 size={15} /> : <X size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">第 {i + 1} 题 · {typeLabel[q.type].label}</div>
                  <div className="truncate text-xs text-ink-muted">{q.question}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal py-3 text-sm font-medium text-white transition-all hover:bg-teal-dark"
        >
          <RotateCcw size={16} /> 重新答题
        </button>
      </div>
    );
  }

  // ---- 答题页 ----
  return (
    <div className="animate-fade-up">
      {/* 标题 + 进度 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="ListChecks" size={18} className="text-rose" />
          <h3 className="font-display text-lg font-semibold text-ink">答题系统</h3>
          <span className="rounded-md bg-rose-pale px-2 py-0.5 text-[11px] font-medium text-rose">{total} 题</span>
        </div>
        <span className="text-sm font-medium text-ink-muted">
          已答 {answeredCount}/{total}
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-paper-deep">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal to-amber transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
        />
      </div>

      {/* 题目卡片 */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        {/* 题头 */}
        <div className="mb-3 flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-ink-faint">第 {currentIdx + 1} 题</span>
          <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium', typeLabel[question.type].cls)}>
            {typeLabel[question.type].label}
          </span>
          <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium', diffLabel[question.difficulty].cls)}>
            {diffLabel[question.difficulty].label}
          </span>
          {question.type === 'multi' && (
            <span className="text-[10px] text-ink-faint">（可多选）</span>
          )}
        </div>

        {/* 题干 */}
        <p className="mb-4 text-[15px] font-medium leading-relaxed text-ink">{question.question}</p>

        {/* 选项 */}
        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const isSelected = selected.includes(idx);
            const isCorrectOpt = question.answer.includes(idx);
            let optCls = 'border-line bg-white hover:border-teal/40 hover:bg-teal-pale/30';
            let badgeCls = 'border-line text-ink-muted bg-paper-soft';
            let badgeText = String.fromCharCode(65 + idx);

            if (submitted) {
              if (isCorrectOpt) {
                optCls = 'border-emerald-400 bg-emerald-50';
                badgeCls = 'border-emerald-400 bg-emerald-500 text-white';
              } else if (isSelected && !isCorrectOpt) {
                optCls = 'border-rose-400 bg-rose-50';
                badgeCls = 'border-rose-400 bg-rose-500 text-white';
              } else {
                optCls = 'border-line bg-white opacity-60';
              }
            } else if (isSelected) {
              optCls = 'border-teal bg-teal-pale/40';
              badgeCls = 'border-teal bg-teal text-white';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={submitted}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                  optCls,
                  !submitted && 'cursor-pointer'
                )}
              >
                <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold', badgeCls)}>
                  {badgeText}
                </span>
                <span className="flex-1 text-sm text-ink">{opt}</span>
                {submitted && isCorrectOpt && <CheckCircle2 size={16} className="text-emerald-500" />}
                {submitted && isSelected && !isCorrectOpt && <X size={16} className="text-rose" />}
              </button>
            );
          })}
        </div>

        {/* 提交后：对错提示 + 解析 */}
        {submitted && (
          <div className={cn('mt-4 rounded-xl border p-4 animate-fade-up', correct ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60')}>
            <div className="flex items-center gap-2">
              {correct ? (
                <><CheckCircle2 size={16} className="text-emerald-600" /><span className="text-sm font-semibold text-emerald-700">回答正确</span></>
              ) : (
                <><X size={16} className="text-rose" /><span className="text-sm font-semibold text-rose">回答错误</span></>
              )}
              {!correct && (
                <span className="text-xs text-ink-muted">
                  正确答案：{question.answer.map((i) => String.fromCharCode(65 + i)).join('、')}
                </span>
              )}
            </div>
            <div className="mt-2 border-t border-current/10 pt-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">解析</div>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{question.explanation}</p>
              {question.knowledgePoint && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5 text-[11px] text-ink-muted">
                  <Icon name="Tag" size={11} /> {question.knowledgePoint}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 操作区 */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition-all hover:bg-paper-soft disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={15} /> 上一题
        </button>

        <div className="flex items-center gap-1.5">
          {quiz.questions.map((q, i) => {
            const ans = answers[q.id];
            const sub = submittedMap[q.id];
            let dotCls = 'bg-paper-deep';
            if (sub) {
              dotCls = arraysEqual(ans || [], q.answer) ? 'bg-emerald-500' : 'bg-rose';
            } else if (ans && ans.length > 0) {
              dotCls = 'bg-teal';
            }
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all',
                  dotCls,
                  i === currentIdx && 'ring-2 ring-teal/30 ring-offset-1'
                )}
                title={`第 ${i + 1} 题`}
              />
            );
          })}
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-dark disabled:opacity-40 disabled:hover:bg-teal"
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-dark"
          >
            {isLast ? '查看结果' : '下一题'} <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
