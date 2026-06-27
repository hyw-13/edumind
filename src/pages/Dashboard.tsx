import { Link } from 'react-router-dom';
import { Clock, Flame, Trophy, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import ProgressRing from '@/components/ProgressRing';
import Icon from '@/components/Icon';
import {
  learningOverview, recommendations, recentLearning,
  resourceTypeMeta, type ResourceType,
} from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  // 已学资源数动态反映到仪表盘
  const learnedCount = useStore((s) => s.learnedResources.length);

  const masteredTopics = learningOverview.masteredTopics + learnedCount;
  const totalProgress = Math.min(100, learningOverview.totalProgress + learnedCount * 4);
  const weeklyHours = +(learningOverview.weeklyHours + learnedCount * 0.3).toFixed(1);

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
              <ProgressRing value={totalProgress} size={128} label="完成度" sublabel={`${masteredTopics}/${learningOverview.totalTopics} 知识点`} />
              <div className="space-y-3">
                <Stat icon={<Clock size={16} />} label="本周学习" value={`${weeklyHours}h`} goal={`/ ${learningOverview.weeklyGoal}h`} />
                <Stat icon={<Flame size={16} />} label="连续学习" value={`${learningOverview.streakDays} 天`} accent />
                <Stat icon={<Trophy size={16} />} label="已掌握" value={`${masteredTopics} 个`} goal={`/ ${learningOverview.totalTopics}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">今日推荐</h2>
              <p className="text-sm text-ink-muted">基于你的画像智能推送</p>
            </div>
            <Link to="/resources" className="flex items-center gap-1 text-sm font-medium text-teal hover:gap-2 transition-all">
              全部资源 <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recommendations.map((r, idx) => {
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
          {recentLearning.map((item, idx) => {
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
