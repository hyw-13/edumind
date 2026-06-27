import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Wrench, Cpu, GitBranch, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Sparkles, Zap, ExternalLink } from 'lucide-react';
import Icon from '@/components/Icon';
import { agentCapabilities, workflows } from '@/data/agentWorkflows';
import { resourceTypeMeta, agents, type ResourceType } from '@/data/mockData';
import { cn } from '@/lib/utils';

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  teal: { text: 'text-teal', bg: 'bg-teal-pale', border: 'border-teal/30' },
  amber: { text: 'text-amber', bg: 'bg-amber-pale', border: 'border-amber/30' },
  rose: { text: 'text-rose', bg: 'bg-rose-pale', border: 'border-rose/30' },
};

const statusMap = {
  online: { dot: 'bg-emerald-500', text: '在线', label: 'text-emerald-600' },
  busy: { dot: 'bg-amber-500', text: '忙碌', label: 'text-amber-600' },
  idle: { dot: 'bg-stone-300', text: '空闲', label: 'text-ink-muted' },
} as const;

export default function Agents() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const navigate = useNavigate();

  // 计算智能体参与的资源类型工作流
  const getAgentWorkflows = (agentId: string) =>
    workflows.filter((wf) => wf.steps.some((s) => s.agentId === agentId));

  const toggleAgent = (id: string) =>
    setExpandedAgent((prev) => (prev === id ? null : id));

  const toggleWorkflow = (type: string) =>
    setExpandedWorkflow((prev) => (prev === type ? null : type));

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* ===== 架构总览 ===== */}
      <div className="mb-6 rounded-2xl border border-teal/20 bg-gradient-to-r from-teal-pale/30 via-amber-pale/20 to-rose-pale/20 p-5 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-deep shadow-glow">
            <Network className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold text-ink">多智能体协作架构</h2>
            <p className="text-xs text-ink-muted">
              8 个专业智能体 · 基于 LangGraph 状态图编排 · 讯飞星火大模型驱动
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-center">
              <div className="font-display text-xl font-bold text-teal">8</div>
              <div className="text-ink-muted">智能体</div>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="text-center">
              <div className="font-display text-xl font-bold text-amber">5</div>
              <div className="text-ink-muted">资源类型</div>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="text-center">
              <div className="font-display text-xl font-bold text-rose">3+</div>
              <div className="text-ink-muted">协作流程</div>
            </div>
          </div>
        </div>
        {/* 提示信息 */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-teal/10 pt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-ink-muted">
            <Sparkles size={10} className="text-amber" />
            点击下方智能体卡片可查看参与的工作流；点击协作流程行可展开完整步骤时间线
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            全部在线 · 实时协同
          </div>
        </div>
      </div>

      {/* ===== 8 智能体卡片（可点击展开） ===== */}
      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Cpu size={16} className="text-teal" /> 智能体角色
          <span className="text-[10px] font-normal text-ink-muted">（点击卡片展开详情）</span>
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agentCapabilities.map((agent, i) => {
            const c = colorMap[agent.color] || colorMap.teal;
            const isExpanded = expandedAgent === agent.id;
            const agentWfs = getAgentWorkflows(agent.id);
            const agentStatus = agents.find((a) => a.id === agent.id);
            const st = agentStatus ? statusMap[agentStatus.status] : null;
            return (
              <div
                key={agent.id}
                className={cn(
                  'card group animate-fade-up border-l-4 transition-all',
                  c.border,
                  isExpanded && 'shadow-lift'
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* 卡片头部（可点击） */}
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', c.bg)}>
                      <Icon name={agent.icon} size={20} className={c.text} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-semibold text-ink">{agent.name}</span>
                        {st && (
                          <span className={cn('flex items-center gap-1 text-[10px]', st.label)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                            {st.text}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-muted">{agent.role}</div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={14} className="shrink-0 text-ink-faint" />
                    ) : (
                      <ChevronDown size={14} className="shrink-0 text-ink-faint" />
                    )}
                  </div>

                  {/* 能力标签（始终显示） */}
                  <div className="mt-3">
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">核心能力</div>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.capabilities.map((cap) => (
                        <span key={cap} className="rounded-md bg-paper-soft px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 最近任务（始终显示） */}
                  {agentStatus && (
                    <div className="mt-2 flex items-center gap-1.5 border-t border-line/60 pt-2 text-[10px] text-ink-faint">
                      <Zap size={9} className="shrink-0 text-amber" />
                      <span className="truncate">{agentStatus.lastTask}</span>
                    </div>
                  )}
                </button>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="border-t border-line bg-paper-soft/30 px-5 pb-5 pt-3 animate-fade-up">
                    {/* 工具与模型 */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-1.5">
                        <Wrench size={11} className="mt-0.5 shrink-0 text-amber" />
                        <span className="text-[10px] font-medium text-ink-muted">工具：</span>
                        <div className="flex flex-wrap gap-1">
                          {agent.tools.map((t) => (
                            <span key={t} className="rounded bg-amber-pale/50 px-1.5 py-0.5 text-[9px] font-medium text-amber">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Cpu size={11} className="mt-0.5 shrink-0 text-teal" />
                        <span className="text-[10px] font-medium text-ink-muted">模型：</span>
                        <div className="flex flex-wrap gap-1">
                          {agent.models.map((m) => (
                            <span key={m} className="rounded bg-teal-pale/50 px-1.5 py-0.5 text-[9px] font-medium text-teal">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 参与的工作流 */}
                    {agentWfs.length > 0 && (
                      <div className="mt-3 border-t border-line pt-3">
                        <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                          <GitBranch size={10} className="text-rose" /> 参与的协作流程
                          <span className="font-normal text-ink-muted">（{agentWfs.length} 个）</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {agentWfs.map((wf) => {
                            const meta = resourceTypeMeta[wf.type as ResourceType];
                            return (
                              <button
                                key={wf.type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedWorkflow(wf.type);
                                  document.getElementById(`workflow-${wf.type}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className={cn(
                                  'flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition-all hover:shadow-soft',
                                  c.border, 'bg-white'
                                )}
                              >
                                <Icon name={wf.icon} size={10} className={c.text} />
                                {wf.title}
                                <ArrowRight size={9} className="text-ink-faint" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 协作流程矩阵（可点击展开步骤时间线） ===== */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink">
          <GitBranch size={16} className="text-amber" /> 资源生成协作流程
          <span className="text-[10px] font-normal text-ink-muted">（点击行展开完整步骤时间线）</span>
        </h3>
        <div className="space-y-3">
          {workflows.map((wf, i) => {
            const meta = resourceTypeMeta[wf.type as ResourceType];
            const participants = [...new Set(wf.steps.map((s) => s.agentId))];
            const isExpanded = expandedWorkflow === wf.type;
            return (
              <div
                key={wf.type}
                id={`workflow-${wf.type}`}
                className={cn(
                  'card animate-fade-up overflow-hidden transition-all',
                  isExpanded && 'shadow-lift'
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* 行头部（可点击） */}
                <button
                  onClick={() => toggleWorkflow(wf.type)}
                  className="flex w-full flex-wrap items-center gap-3 p-4 text-left transition-colors hover:bg-paper-soft/40"
                >
                  {/* 资源类型 */}
                  <div className="flex w-40 shrink-0 items-center gap-2">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', meta.bg)}>
                      <Icon name={wf.icon} size={17} className={meta.color} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">{wf.title}</div>
                      <div className="text-[10px] text-ink-muted">{wf.steps.length} 步协作</div>
                    </div>
                  </div>

                  {/* 协作流程链 */}
                  <div className="flex flex-1 flex-wrap items-center gap-1.5">
                    {participants.map((agentId, idx) => {
                      const agent = agentCapabilities.find((a) => a.id === agentId);
                      if (!agent) return null;
                      const c = colorMap[agent.color] || colorMap.teal;
                      return (
                        <div key={agentId} className="flex items-center gap-1.5">
                          <div className={cn('flex items-center gap-1 rounded-lg border px-2 py-1', c.border, c.bg)}>
                            <Icon name={agent.icon} size={11} className={c.text} />
                            <span className="text-[10px] font-medium text-ink-soft">{agent.name}</span>
                          </div>
                          {idx < participants.length - 1 && <ArrowRight size={11} className="text-ink-faint" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* 步骤数 + 展开指示 */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-teal">
                      <CheckCircle2 size={11} /> {wf.steps.length} 步
                    </div>
                    <div className="h-4 w-px bg-line" />
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-ink-faint" />
                    ) : (
                      <ChevronDown size={14} className="text-ink-faint" />
                    )}
                  </div>
                </button>

                {/* 展开的步骤时间线 */}
                {isExpanded && (
                  <div className="border-t border-line bg-paper-soft/20 p-4 animate-fade-up">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink">完整协作步骤</span>
                      <button
                        onClick={() => navigate('/resources')}
                        className="flex items-center gap-1 rounded-lg border border-teal/30 bg-teal-pale/30 px-2.5 py-1 text-[11px] font-medium text-teal transition-all hover:bg-teal-pale/60"
                      >
                        <ExternalLink size={11} /> 前往体验协作生成
                      </button>
                    </div>
                    <div className="space-y-2">
                      {wf.steps.map((step, idx) => {
                        const agent = agentCapabilities.find((a) => a.id === step.agentId);
                        const c = colorMap[agent?.color || 'teal'] || colorMap.teal;
                        return (
                          <div
                            key={idx}
                            className="flex gap-3 rounded-lg border border-line bg-white p-3 transition-colors hover:border-teal/20"
                          >
                            {/* 步骤序号 */}
                            <div className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                              c.bg, c.text
                            )}>
                              {idx + 1}
                            </div>
                            {/* 步骤内容 */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Icon name={agent?.icon || 'Bot'} size={12} className={c.text} />
                                <span className="text-xs font-semibold text-ink">{step.agentName}</span>
                                <span className="text-[10px] text-ink-muted">·</span>
                                <span className="text-xs font-medium text-ink-soft">{step.action}</span>
                              </div>
                              <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">{step.detail}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1 rounded-md bg-teal-pale/50 px-2 py-0.5 text-[10px] font-medium text-teal">
                                  <Zap size={9} /> 产出：{step.output}
                                </span>
                                {step.tools?.map((tool) => (
                                  <span key={tool} className="flex items-center gap-0.5 rounded-md bg-amber-pale/50 px-1.5 py-0.5 text-[9px] font-medium text-amber">
                                    <Wrench size={8} /> {tool}
                                  </span>
                                ))}
                                <span className="text-[9px] text-ink-faint">耗时 {(step.duration / 1000).toFixed(1)}s</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 技术栈说明 ===== */}
      <div className="mt-6 rounded-2xl border border-line bg-paper-soft/30 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <Cpu size={14} className="text-teal" /> 技术架构
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs font-semibold text-teal">编排框架</div>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
              基于 <strong>LangGraph</strong> 状态图引擎，实现智能体的串行/并行编排、状态管理与消息传递。总协调智能体负责任务拆解与调度。
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-amber">大模型驱动</div>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
              核心推理由 <strong>讯飞星火 4.0 Ultra</strong> 完成，代码生成辅助使用 CodeGeeX。所有智能体共享模型但职责隔离。
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-rose">RAG 检索</div>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
              <strong>知识库向量索引</strong> 实现个性化内容生成，思维导图智能体基于知识图谱引擎构建概念 DAG 与层级结构。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
