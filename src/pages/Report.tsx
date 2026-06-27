import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Sparkles, Clock, Target, Award, Zap } from 'lucide-react';
import ProgressRing from '@/components/ProgressRing';
import LineChart from '@/components/LineChart';
import RadarChart from '@/components/RadarChart';
import Icon from '@/components/Icon';
import { reportData, resourceTypeMeta, type ResourceType } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const trendColors = ['#0f766e', '#ea580c', '#e11d48', '#a8a29e'];

const priorityStyle = {
  high: { label: '高优先', cls: 'bg-rose-pale text-rose', icon: AlertTriangle },
  medium: { label: '中优先', cls: 'bg-amber-pale text-amber', icon: Clock },
  low: { label: '低优先', cls: 'bg-teal-pale text-teal', icon: CheckCircle2 },
} as const;

export default function Report() {
  // 已学资源动态反映到学习报告
  const learnedResources = useStore((s) => s.learnedResources);
  const learnedCount = learnedResources.length;

  // 基础值 + 已学资源带来的增量
  const overallMastery = Math.min(100, reportData.overallMastery + learnedCount * 4);
  // 学习健康度：前 5 个资源每个 +2，超过 5 个的部分每个 -3（短期过度学习导致健康度下降）
  const healthScore = Math.max(
    40,
    Math.min(
      99,
      reportData.healthScore + Math.min(5, learnedCount) * 2 - Math.max(0, learnedCount - 5) * 3
    )
  );
  const weeklyStats = {
    ...reportData.weeklyStats,
    completionRate: Math.min(99, reportData.weeklyStats.completionRate + learnedCount * 4),
    studyMinutes: reportData.weeklyStats.studyMinutes + learnedCount * 20,
  };
  // 各类型资源使用次数 + 已学资源中对应类型的计数
  const usageDelta: Record<ResourceType, number> = { doc: 0, mindmap: 0, quiz: 0, code: 0, reading: 0 };
  learnedResources.forEach((r) => {
    if (r.type in usageDelta) usageDelta[r.type as ResourceType] += 1;
  });
  const resourceUsage = { ...reportData.resourceUsage } as Record<ResourceType, number>;
  (Object.keys(usageDelta) as ResourceType[]).forEach((k) => {
    resourceUsage[k] = (resourceUsage[k] || 0) + usageDelta[k];
  });

  const { masteryTrend, trendLabels, suggestions } = reportData;

  const radarData = [
    { label: '完成率', value: weeklyStats.completionRate },
    { label: '正确率', value: weeklyStats.accuracyRate },
    { label: '活跃度', value: weeklyStats.activeDays * 14 },
    { label: '专注度', value: 80 },
    { label: '进步度', value: 72 },
    { label: '坚持度', value: 90 },
  ];

  const maxUsage = Math.max(...Object.values(resourceUsage));

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* Overview */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="card relative overflow-hidden p-6 neural-bg animate-fade-up">
          <div className="absolute right-0 top-0 h-28 w-28 -translate-y-6 translate-x-6 rounded-full bg-teal/10 blur-2xl" />
          <div className="relative flex flex-col items-center">
            <div className="text-xs font-medium text-teal">综合掌握度</div>
            <ProgressRing value={overallMastery} size={136} label="掌握度" sublabel="全部章节" />
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp size={13} /> 较上周 +8%
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden p-6 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <div className="absolute right-0 top-0 h-28 w-28 -translate-y-6 translate-x-6 rounded-full bg-amber/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber" />
              <span className="text-xs font-medium text-amber">学习健康度</span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-5xl font-semibold text-ink">{healthScore}</span>
              <span className="mb-1.5 text-sm text-ink-muted">/ 100</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-deep">
              <div className="h-full rounded-full bg-gradient-to-r from-teal via-teal-light to-amber transition-all duration-700" style={{ width: `${healthScore}%` }} />
            </div>
            <p className={cn('mt-3 text-xs', learnedCount > 5 ? 'text-rose font-medium' : 'text-ink-muted')}>
              {learnedCount > 5
                ? `短期学习 ${learnedCount} 项资源强度过高，建议适当休息、避免疲劳学习。`
                : '学习节奏稳定，建议加强薄弱知识点的针对性练习。'}
            </p>
          </div>
        </div>

        <div className="card grid grid-cols-2 gap-4 p-6 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <MiniStat icon={<CheckCircle2 size={15} />} label="完成率" value={`${weeklyStats.completionRate}%`} trend="+6%" up />
          <MiniStat icon={<Target size={15} />} label="正确率" value={`${weeklyStats.accuracyRate}%`} trend="-3%" up={false} />
          <MiniStat icon={<Clock size={15} />} label="本周时长" value={`${Math.floor(weeklyStats.studyMinutes / 60)}h`} trend="+2.5h" up />
          <MiniStat icon={<Zap size={15} />} label="活跃天数" value={`${weeklyStats.activeDays}天`} trend="稳定" up />
        </div>
      </section>

      {/* Trend + Radar */}
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">掌握度变化趋势</h2>
              <p className="text-xs text-ink-muted">近 7 天各知识点掌握度曲线</p>
            </div>
            <span className="rounded-full bg-teal-pale/40 px-3 py-1 text-[11px] font-medium text-teal-dark">本周</span>
          </div>
          <LineChart
            labels={trendLabels}
            series={masteryTrend.map((t, i) => ({ topic: t.topic, values: t.values, color: trendColors[i] }))}
          />
        </div>

        <div className="card p-6">
          <div className="mb-2">
            <h2 className="font-display text-base font-semibold text-ink">多维学习分析</h2>
            <p className="text-xs text-ink-muted">本周学习行为雷达</p>
          </div>
          <div className="flex justify-center">
            <RadarChart data={radarData} size={300} />
          </div>
        </div>
      </section>

      {/* Suggestions */}
      <section className="mt-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-teal" />
          <h2 className="font-display text-base font-semibold text-ink">个性化学习建议</h2>
          <span className="text-xs text-ink-muted">· 由评估智能体生成</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {suggestions.map((s, idx) => {
            const st = priorityStyle[s.priority as keyof typeof priorityStyle];
            const IconCmp = st.icon;
            return (
              <div key={s.id} className="card p-5 animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex items-center justify-between">
                  <span className={cn('flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium', st.cls)}>
                    <IconCmp size={11} /> {st.label}
                  </span>
                </div>
                <h3 className="mt-2.5 font-display text-base font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{s.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resource usage */}
      <section className="mt-5">
        <div className="mb-3">
          <h2 className="font-display text-base font-semibold text-ink">资源使用统计</h2>
          <p className="text-xs text-ink-muted">各类资源本周使用次数</p>
        </div>
        <div className="card p-6">
          <div className="space-y-3">
            {(Object.entries(resourceUsage) as [ResourceType, number][]).map(([type, count]) => {
              const meta = resourceTypeMeta[type];
              const pct = (count / maxUsage) * 100;
              const barColor = type === 'doc' ? '#0f766e'
                : type === 'code' ? '#115e59'
                : type === 'mindmap' ? '#ea580c'
                : type === 'quiz' ? '#e11d48'
                : '#0d9488';
              return (
                <div key={type} className="flex items-center gap-4">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.bg)}>
                    <Icon name={meta.icon} size={16} className={meta.color} />
                  </div>
                  <div className="w-20 text-sm font-medium text-ink-soft">{meta.label}</div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-semibold text-ink">{count}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-paper-soft/60 py-3 text-xs text-ink-muted">
            <TrendingUp size={14} className="text-teal" />
            题库使用最频繁，建议保持练习节奏；思维导图使用偏少，可结合复习增加
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ icon, label, value, trend, up }: { icon: React.ReactNode; label: string; value: string; trend: string; up: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
        <span className="text-teal">{icon}</span> {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-ink">{value}</div>
      <div className={cn('flex items-center gap-0.5 text-[10px]', up ? 'text-emerald-600' : 'text-rose')}>
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {trend}
      </div>
    </div>
  );
}
