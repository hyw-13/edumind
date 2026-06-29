import { Link } from 'react-router-dom';
import { Clock, Flame, Trophy, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import ProgressRing from '@/components/ProgressRing';
import Icon from '@/components/Icon';
import {
  learningOverview, recommendations,
  resourceTypeMeta, resources, type ResourceType,
} from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { recommendResources } from '@/lib/personalRecommender';
import {
  computeCompletionRate, computeWeeklyMinutes, computeStreakDays,
} from '@/lib/studyStats';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  // 动态数据
  const learnedResources = useStore((s) => s.learnedResources);
  const studyActivities = useStore((s) => s.studyActivities);
  const tutorQuestions = useStore((s) => s.tutorQuestions);
  const profile = useStore((s) => s.profile);

  const learnedCount = learnedResources.length;
  const totalResources = resources.length;

  // 完成度：基于已学资源数 / 总资源数
  const totalProgress = computeCompletionRate(learnedCount, totalResources);
  // 已掌握知识点数 = 已学资源数（更真实）
  const masteredTopics = learnedCount;
  // 本周学习时长（分钟 → 小时）
  const weeklyMinutes = computeWeeklyMinutes(studyActivities);
  const weeklyHours = +(weeklyMinutes / 60).toFixed(1);
  // 连续学习天数
  const streakDays = computeStreakDays(studyActivities);

  // 个性化推荐：基于画像 + 学习历史 + 答疑历史
  const personalRecs = recommendResources(profile, learnedResources, tutorQuestions, 3);
  // 如果没有个性化推荐（如已学完所有资源），回退到静态推荐
  const displayRecs = personalRecs.length > 0 ? personalRecs : recommendations;

  // 最近学习：基于已学资源 + 默认数据混合
  const recentLearned = learnedResources.slice(0, 4).map((r, idx) => ({
    id: `recent-${r.resourceId}`,
    type: r.type,
    title: r.title,
    chapter: r.chapter,
    progress: 100,
    updatedAt: idx === 0 ? '刚刚' : '今天',
  }));
  // 不足 4 个时补充默认数据
  const displayRecent = recentLearned.length >= 4
    ? recentLearned
    : [
        ...recentLearned,
        ...learningOverviewFallback.slice(0, 4 - recentLearned.length),
      ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* Hero overview */}
      <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="card relative overflow-hidden p-7 neural-bg">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-teal/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-24 w-24 translate-y-6 -translate-x-6 rounded-full bg-amber/8 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-teal">
              <Sparkles size={14} /> 总体学习进度
            </div>
            <div className="mt-4 flex items-center gap-6">
              <ProgressRing value={totalProgress} size={128} label="完成度" sublabel={`${masteredTopics}/${totalResources} 资源`} />
              <div className="space-y-3">
                <Stat icon={<Clock size={16} />} label="本周学习" value={`${weeklyHours}h`} goal={`/ ${learningOverview.weeklyGoal}h`} />
                <Stat icon={<Flame size={16} />} label="连续学习" value={`${streakDays} 天`} accent />
                <Stat icon={<Trophy size={16} />} label="已掌握" value={`${masteredTopics} 个`} goal={`/ ${totalResources}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">今日推荐</h2>
              <p className="text-sm text-ink-muted">基于你的画像与答疑历史智能推送</p>
            </div>
            <Link to="/resources" className="flex items-center gap-1 text-sm font-medium text-teal hover:gap-2 transition-all">
              全部资源 <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {displayRecs.map((r, idx) => {
              const meta = resourceTypeMeta[r.type as ResourceType];
              return (
                <Link
                  key={r.id}
                  to={`/resources?open=${r.resourceId}`}
                  className="group flex items-center gap-4 rounded-xl border border-line bg-paper-soft/40 p-4 transition-all hover:border-teal/30 hover:bg-white hover:shadow-soft animate-fade-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', meta.bg)}>
                    <Icon name={meta.icon} size={20} className={meta.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', meta.bg, meta.color)}>{meta.label}</span>
                      <span className="text-[11px] text-ink-faint">{r.duration}</span>
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium text-ink">{r.title}</div>
                    <div className="truncate text-xs text-ink-muted">{r.reason}</div>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-teal" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent learning */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">最近学习</h2>
          <span className="text-xs text-ink-muted">继续上次的学习</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayRecent.map((item, idx) => {
            const meta = resourceTypeMeta[item.type as ResourceType];
            return (
              <Link
                to="/resources"
                key={item.id}
                className="card group p-5 transition-all hover:-translate-y-1 hover:shadow-lift animate-fade-up"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', meta.bg)}>
                    <Icon name={meta.icon} size={17} className={meta.color} />
                  </div>
                  <span className="text-[11px] text-ink-faint">{item.updatedAt}</span>
                </div>
                <div className="mt-3 truncate text-sm font-medium text-ink">{item.title}</div>
                <div className="truncate text-xs text-ink-muted">{item.chapter}</div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-muted">进度</span>
                    <span className="font-medium text-teal">{item.progress}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-deep">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal to-teal-light transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer note */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-ink-faint">
        <TrendingUp size={14} />
        画像随学随新 · 资源持续生成 · 路径动态调整
      </div>
    </div>
  );
}

// 静态回退数据（最近学习不足时补充）
const learningOverviewFallback = [
  { id: 'fb1', type: 'doc' as const, title: '人工智能三大流派解析', chapter: '基础概念 · 三大流派', progress: 0, updatedAt: '未开始' },
  { id: 'fb2', type: 'mindmap' as const, title: 'AI 70 年发展史时间线', chapter: '发展历史 · 全景', progress: 0, updatedAt: '未开始' },
  { id: 'fb3', type: 'quiz' as const, title: 'A* 搜索算法专项练习', chapter: '核心技术 · 搜索技术', progress: 0, updatedAt: '未开始' },
  { id: 'fb4', type: 'code' as const, title: '决策树 ID3/C4.5/CART 实战', chapter: '核心技术 · 机器学习', progress: 0, updatedAt: '未开始' },
];

function Stat({ icon, label, value, goal, accent }: { icon: React.ReactNode; label: string; value: string; goal?: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accent ? 'bg-amber-pale text-amber' : 'bg-teal-pale text-teal')}>
        {icon}
      </div>
      <div>
        <div className="text-[11px] text-ink-muted">{label}</div>
        <div className="text-sm font-semibold text-ink">
          {value} {goal && <span className="text-xs font-normal text-ink-faint">{goal}</span>}
        </div>
      </div>
    </div>
  );
}
