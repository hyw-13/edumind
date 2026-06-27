import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, Circle, Network, Wrench, Cpu, Zap, Pause, Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import Icon from '@/components/Icon';
import type { AgentWorkflow, WorkflowStep } from '@/data/agentWorkflows';
import { agentCapabilities } from '@/data/agentWorkflows';
import type { Profile } from '@/data/mockData';
import { cn } from '@/lib/utils';

type AgentStatus = 'idle' | 'working' | 'done';

function fillTemplate(text: string, topic: string, profile: Profile): string {
  const styleMap: Record<number, string> = {
    0: '未确定', 1: '视频型', 2: '阅读型', 3: '动手型', 4: '推导型',
  };
  return text
    .replace(/\{topic\}/g, topic)
    .replace(/\{kb\}/g, String(profile.knowledgeBase))
    .replace(/\{style\}/g, styleMap[Math.round(profile.cognitiveStyle / 25)] || '混合型')
    .replace(/\{err\}/g, String(profile.errorPattern))
    .replace(/\{interest\}/g, 'CV/NLP');
}

interface Props {
  workflow: AgentWorkflow;
  topic: string;
  profile: Profile;
  onComplete?: () => void;
  autoStart?: boolean;
}

export default function AgentCollaborationPanel({ workflow, topic, profile, onComplete, autoStart = true }: Props) {
  const [currentStep, setCurrentStep] = useState(autoStart ? 0 : -1);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [collapsedSteps, setCollapsedSteps] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const participatingAgents = [...new Set(workflow.steps.map((s) => s.agentId))];
  const isFinished = currentStep >= workflow.steps.length;

  // 执行工作流
  useEffect(() => {
    if (currentStep < 0 || currentStep >= workflow.steps.length || isPaused) return;

    const step = workflow.steps[currentStep];
    setAgentStatuses((prev) => ({ ...prev, [step.agentId]: 'working' }));

    timerRef.current = setTimeout(() => {
      setAgentStatuses((prev) => ({ ...prev, [step.agentId]: 'done' }));
      setCompletedSteps((prev) => [...prev, step]);
      setCurrentStep((s) => s + 1);
    }, step.duration / speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep, workflow.steps, isPaused, speed]);

  // 全部完成
  useEffect(() => {
    if (currentStep === workflow.steps.length && onComplete) {
      onComplete();
    }
  }, [currentStep, workflow.steps.length, onComplete]);

  // 控制函数
  const togglePause = () => setIsPaused((p) => !p);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentStep(0);
    setAgentStatuses({});
    setCompletedSteps([]);
    setIsPaused(false);
    setCollapsedSteps(new Set());
  };

  const toggleStepCollapse = (idx: number) => {
    setCollapsedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAgentExpand = (id: string) => {
    setExpandedAgent((prev) => (prev === id ? null : id));
  };

  const progress = Math.round((completedSteps.length / workflow.steps.length) * 100);

  return (
    <div className="space-y-4">
      {/* ===== 控制栏 ===== */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper-soft/40 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Network size={14} className="text-teal" />
          <span className="text-xs font-semibold text-ink">协作进度</span>
        </div>
        {/* 进度条 */}
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal to-amber transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-teal">{progress}%</span>
        <div className="h-4 w-px bg-line" />
        {/* 暂停/继续 */}
        {!isFinished && (
          <button
            onClick={togglePause}
            className="flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-all hover:border-teal/30 hover:text-teal"
          >
            {isPaused ? <Play size={11} /> : <Pause size={11} />}
            {isPaused ? '继续' : '暂停'}
          </button>
        )}
        {/* 速度 */}
        {!isFinished && (
          <div className="flex items-center gap-0.5 rounded-lg border border-line bg-white p-0.5">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-medium transition-all',
                  speed === s ? 'bg-teal text-white' : 'text-ink-muted hover:text-teal'
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
        {/* 重置 */}
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-all hover:border-rose/30 hover:text-rose"
        >
          <RotateCcw size={11} /> 重置
        </button>
      </div>

      {/* ===== 智能体状态网格（可点击展开） ===== */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
          <Cpu size={14} className="text-teal" />
          多智能体协作
          <span className="text-[10px] font-normal text-ink-muted">
            （{participatingAgents.length} 个智能体 · 点击查看详情 · LangGraph 编排）
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {agentCapabilities
            .filter((a) => participatingAgents.includes(a.id))
            .map((agent) => {
              const status = agentStatuses[agent.id] || 'idle';
              const isExpanded = expandedAgent === agent.id;
              return (
                <div key={agent.id} className="space-y-0">
                  <button
                    onClick={() => toggleAgentExpand(agent.id)}
                    className={cn(
                      'relative w-full rounded-xl border p-2.5 text-left transition-all duration-300',
                      status === 'working' && 'border-teal/40 bg-teal-pale/50 shadow-glow',
                      status === 'done' && 'border-teal/20 bg-teal-pale/20',
                      status === 'idle' && 'border-line bg-white hover:border-teal/20',
                      isExpanded && 'ring-1 ring-teal/30'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all',
                        status === 'working' ? 'bg-teal text-white' : status === 'done' ? 'bg-teal-pale text-teal' : 'bg-paper-soft text-ink-muted'
                      )}>
                        <Icon name={agent.icon} size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[11px] font-semibold text-ink">{agent.name}</div>
                        <div className="truncate text-[9px] text-ink-muted">{agent.role}</div>
                      </div>
                      {isExpanded ? <ChevronUp size={11} className="shrink-0 text-ink-faint" /> : <ChevronDown size={11} className="shrink-0 text-ink-faint" />}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      {status === 'working' && (
                        <span className="flex items-center gap-1 text-[9px] font-medium text-teal">
                          <Loader2 size={10} className="animate-spin" /> 执行中
                        </span>
                      )}
                      {status === 'done' && (
                        <span className="flex items-center gap-1 text-[9px] font-medium text-teal">
                          <CheckCircle2 size={10} /> 完成
                        </span>
                      )}
                      {status === 'idle' && (
                        <span className="flex items-center gap-1 text-[9px] text-ink-faint">
                          <Circle size={9} /> 待命
                        </span>
                      )}
                    </div>
                    {status === 'working' && (
                      <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
                      </div>
                    )}
                  </button>
                  {/* 展开详情 */}
                  {isExpanded && (
                    <div className="mt-1 rounded-lg border border-teal/15 bg-white p-2.5 animate-fade-up">
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-ink-faint">核心能力</div>
                      <div className="mt-1 space-y-0.5">
                        {agent.capabilities.map((cap) => (
                          <div key={cap} className="flex items-center gap-1 text-[10px] text-ink-soft">
                            <CheckCircle2 size={8} className="shrink-0 text-teal" /> {cap}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 border-t border-line pt-1.5">
                        <div className="flex items-center gap-1 text-[9px] text-ink-muted">
                          <Wrench size={9} className="text-amber" />
                          {agent.tools.join(' · ')}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[9px] text-ink-muted">
                          <Cpu size={9} className="text-teal" />
                          {agent.models.join(' · ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* ===== 协作时间线（可点击折叠） ===== */}
      <div className="rounded-xl border border-line bg-paper-soft/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">协作流程</span>
          <span className="text-[10px] text-ink-muted">
            {completedSteps.length} / {workflow.steps.length} 步
            {isFinished && ' · 全部完成 ✓'}
            {isPaused && ' · 已暂停'}
          </span>
        </div>

        <div className="space-y-2">
          {workflow.steps.map((step, idx) => {
            const isDone = idx < completedSteps.length;
            const isCurrent = idx === currentStep && !isFinished;
            const isPending = idx > currentStep || (isFinished && idx >= completedSteps.length);
            const isCollapsed = collapsedSteps.has(idx);
            const filledDetail = fillTemplate(step.detail, topic, profile);
            const showContent = (isCurrent || isDone) && !isCollapsed;

            return (
              <div
                key={idx}
                className={cn(
                  'overflow-hidden rounded-lg border transition-all',
                  isCurrent && 'border-teal/40 bg-white shadow-soft',
                  isDone && 'border-teal/15 bg-teal-pale/10',
                  isPending && 'border-line bg-white/40 opacity-50'
                )}
              >
                <button
                  onClick={() => (isDone || isCurrent) && toggleStepCollapse(idx)}
                  disabled={isPending}
                  className={cn(
                    'flex w-full items-center gap-3 p-2.5 text-left transition-colors',
                    !isPending && 'hover:bg-paper-soft/40',
                    isPending && 'cursor-default'
                  )}
                >
                  {/* 步骤序号 */}
                  <div className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                    isDone ? 'bg-teal text-white' : isCurrent ? 'bg-teal text-white' : 'bg-paper-deep text-ink-muted'
                  )}>
                    {isDone ? <CheckCircle2 size={13} /> : isCurrent ? <Loader2 size={12} className="animate-spin" /> : idx + 1}
                  </div>
                  {/* 步骤标题 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon name={agentCapabilities.find((a) => a.id === step.agentId)?.icon || 'Bot'} size={12} className={cn('shrink-0', isCurrent ? 'text-teal' : 'text-ink-muted')} />
                      <span className="text-[11px] font-semibold text-ink-soft">{step.agentName}</span>
                      <span className="text-[10px] text-ink-muted">·</span>
                      <span className="text-[11px] font-medium text-ink">{step.action}</span>
                    </div>
                  </div>
                  {/* 折叠指示 */}
                  {(isDone || isCurrent) && (
                    <div className="shrink-0">
                      {isCollapsed ? <ChevronDown size={12} className="text-ink-faint" /> : <ChevronUp size={12} className="text-ink-faint" />}
                    </div>
                  )}
                </button>

                {/* 展开内容 */}
                {showContent && (
                  <div className="px-2.5 pb-2.5 pl-[2.6rem] animate-fade-up">
                    <p className="text-[11px] leading-relaxed text-ink-muted">{filledDetail}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 rounded-md bg-teal-pale/50 px-2 py-0.5 text-[10px] font-medium text-teal">
                        <Zap size={9} /> {step.output}
                      </span>
                      {step.tools?.map((tool) => (
                        <span key={tool} className="flex items-center gap-0.5 rounded-md bg-amber-pale/50 px-1.5 py-0.5 text-[9px] font-medium text-amber">
                          <Wrench size={8} /> {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 完成总结 */}
        {isFinished && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-teal-pale/40 px-3 py-2 animate-fade-up">
            <CheckCircle2 size={15} className="text-teal" />
            <span className="text-xs font-medium text-teal-dark">
              {participatingAgents.length} 个智能体协作完成「{workflow.title}」生成
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
