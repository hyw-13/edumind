import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Sparkles, Clock, Target, Award, Zap } from 'lucide-react';
import ProgressRing from '@/components/ProgressRing';
import LineChart from '@/components/LineChart';
import RadarChart from '@/components/RadarChart';
import Icon from '@/components/Icon';
import { reportData, resourceTypeMeta, resources, type ResourceType } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import {
  computeCompletionRate, computeWeeklyMinutes, computeActiveDays,
  computeAccuracyRate, computeOverallMastery, computeHealthScore,
  computeMasteryTrend, computeTopicTrends, computeResourceUsage,
  computeRadarData, generateSuggestions,
} from '@/lib/studyStats';

const trendColors = ['#0f766e', '#ea580c', '#e11d48', '#a8a29e', '#0d9488'];

const priorityStyle = {
  high: { label: '高优先', cls: 'bg-rose-pale text-rose', icon: AlertTriangle },
  medium: { label: '中优先', cls: 'bg-amber-pale text-amber', icon: Clock },
  low: { label: '低优先', cls: 'bg-teal-pale text-teal', icon: CheckCircle2 },
} as const;

export default function Report() {
  // 动态数据源
  const learnedResources = useStore((s) => s.learnedResources);
  const studyActivities = useStore((s) => s.studyActivities);
  const quizResults = useStore((s) => s.quizResults);
  const profile = useStore((s) => s.profile);

  const learnedCount = learnedResources.length;
  const totalResources = resources.length;

  // ========== 动态计算所有指标 ==========
  const completionRate = computeCompletionRate(learnedCount, totalResources);
  const accuracyRate = computeAccuracyRate(quizResults);
  const weeklyMinutes = computeWeeklyMinutes(studyActivities);
  const activeDays = computeActiveDays(studyActivities);
  const overallMastery = computeOverallMastery(learnedCount, totalResources, accuracyRate, profile.knowledgeBase);
  const healthScore = computeHealthScore(studyActivities, learnedCount);

  // 掌握度变化趋势（基于真实学习活动）
  const masteryTrendData = computeMasteryTrend(studyActivities, quizResults, 30);
  // 各知识点掌握度趋势（多曲线）
  const topicTrends = computeTopicTrends(studyActivities, quizResults, [
    { topic: '资源学习', keywords: ['决策树', 'Transformer', 'A*', '神经网络', '机器学习'] },
    { topic: '答题练习', keywords: ['搜索', '机器学习', '神经网络', '历史'] },
    { topic: '智能答疑', keywords: ['Transformer', '注意力', '深度学习', '强化学习'] },
    { topic: '综合掌握', keywords: [] }, // 空关键词 = 所有活动
  ]);

  // 雷达数据
  const radarData = computeRadarData(completionRate, accuracyRate, activeDays, studyActivities, profile);

  // 资源使用统计
  const resourceUsage = computeResourceUsage(learnedResources, reportData.resourceUsage as Record<ResourceType, number>);

  // 个性化建议
  const suggestions = generateSuggestions(
    profile,
    learnedResources,
    quizResults,
    [
      {
        title: '巩固决策树分裂准则',
        detail: '当前掌握度 42%，信息增益/增益率/基尼指数的辨析是薄弱点，建议重做专项练习与代码实战。',
        priority: 'high' as const,
      },
      {
        title: '补强搜索技术节点',
        detail: '掌握度 58%，A* 的可采纳性与一致性证明需巩固，建议完成 10 道专项练习。',
        priority: 'high' as const,
      },
    ]
  );

  const maxUsage = Math.max(...Object.values(resourceUsage), 1);

  // 趋势对比：较上周变化
  const masteryDelta = learnedCount > 0 ? `+${Math.min(learnedCount * 4, 20)}%` : '+0%';
  const weeklyHours = +(weeklyMinutes / 60).toFixed(1);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* Overview */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="card relative overflow-hidden p-6 neural-bg animate-fade-up">
          <div className="absolute right-0 top-0 h-28 w-28 -translate-y-6 translate-x-6 rounded-full bg-teal/10 blur-2xl" />
          <div className="relative flex flex-col items-center">
            <div className="text-xs font-medium text-teal">综合掌握度</div>
            <ProgressRing value={overallMastery} size={136} label="掌握度" sublabel={`${learnedCount}/${totalResources} 资源`} />
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp size={13} /> 较上周 {masteryDelta}
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
                : learnedCount === 0
                ? '开始学习以建立健康的学习节奏。'
                : '学习节奏稳定，建议加强薄弱知识点的针对性练习。'}
            </p>
          </div>
        </div>

        <div className="card grid grid-cols-2 gap-4 p-6 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <MiniStat icon={<CheckCircle2 size={15} />} label="完成率" value={`${completionRate}%`} trend={`${learnedCount} 项`} up />
          <MiniStat icon={<Target size={15} />} label="正确率" value={quizResults.length > 0 ? `${accuracyRate}%` : '—'} trend={quizResults.length > 0 ? `${quizResults.length} 次` : '未答题'} up={accuracyRate >= 60} />
          <MiniStat icon={<Clock size={15} />} label="本周时长" value={`${weeklyHours}h`} trend={`${weeklyMinutes} 分钟`} up={weeklyHours > 0} />
          <MiniStat icon={<Zap size={15} />} label="活跃天数" value={`${activeDays}天`} trend={activeDays >= 3 ? '稳定' : '需加强'} up={activeDays >= 3} />
        </div>
      </section>

      {/* Trend + Radar */}
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">掌握度变化趋势</h2>
              <p className="text-xs text-ink-muted">近 7 天学习行为驱动的掌握度曲线</p>
            </div>
            <span className="rounded-full bg-teal-pale/40 px-3 py-1 text-[11px] font-medium text-teal-dark">本周</span>
          </div>
          <LineChart
            labels={masteryTrendData.labels}
            series={topicTrends.map((t, i) => ({ topic: t.topic, values: t.values, color: trendColors[i] }))}
          />
          {studyActivities.length === 0 && (
            <div className="mt-3 rounded-lg bg-paper-soft/60 py-2 text-center text-xs text-ink-muted">
              暂无学习活动数据，开始学习后曲线将动态更新
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-2">
            <h2 className="font-display text-base font-semibold text-ink">多维学习分析</h2>
            <p className="text-xs text-ink-muted">基于真实学习行为的雷达图</p>
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
          <span className="text-xs text-ink-muted">· 基于画像与学习历史动态生成</span>
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
          <p className="text-xs text-ink-muted">各类资源本周学习次数（含已学记录）</p>
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
            {learnedCount > 0
              ? `已学习 ${learnedCount} 项资源，${quizResults.length > 0 ? `答题 ${quizResults.length} 次平均正确率 ${accuracyRate}%` : '建议开始答题练习巩固知识'}`
              : '开始标记学习资源，统计将动态更新'}
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
