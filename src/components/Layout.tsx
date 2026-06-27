import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Sparkles, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Icon from './Icon';
import StudentInfoEditor from './StudentInfoEditor';
import { useStudentStore } from '@/store/useStudentStore';

const navItems = [
  { to: '/', label: '智能推荐', icon: 'Compass', end: true },
  { to: '/dashboard', label: '仪表盘', icon: 'LayoutDashboard' },
  { to: '/agents', label: '多智能体', icon: 'Network' },
  { to: '/knowledge', label: '知识库', icon: 'BookOpen' },
  { to: '/resources', label: '资源中心', icon: 'Library' },
  { to: '/path', label: '学习路径', icon: 'Route' },
  { to: '/tutor', label: '智能答疑', icon: 'MessageCircleQuestion' },
  { to: '/report', label: '学习报告', icon: 'BarChart3' },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '智学伴', subtitle: '对话式学习推荐 · 自动构建画像 · 画像随学随新' },
  '/dashboard': { title: '学习仪表盘', subtitle: '你的个性化学习总览' },
  '/agents': { title: '多智能体协作', subtitle: '8 智能体协同 · LangGraph 编排 · 讯飞星火驱动' },
  '/knowledge': { title: '知识库', subtitle: '人工智能导论 · 8 大章节结构化知识体系' },
  '/resources': { title: '资源中心', subtitle: '多智能体协同生成的个性化学习资源' },
  '/path': { title: '学习路径', subtitle: '基于知识图谱的动态学习规划' },
  '/tutor': { title: '智能答疑', subtitle: '即时多模态答疑辅导' },
  '/report': { title: '学习报告', subtitle: '多维度学习效果评估与建议' },
};

export default function Layout() {
  const location = useLocation();
  const meta = pageTitles[location.pathname] ?? { title: '智学伴', subtitle: '' };
  const isEditingProfile = useStudentStore((s) => s.isEditingProfile);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Sidebar */}
      <aside
        className={cn(
          'hidden md:flex w-64 shrink-0 flex-col border-r border-line bg-white/70 backdrop-blur-md transition-all duration-300',
          isEditingProfile && 'filter blur-sm brightness-50 pointer-events-none'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-20 border-b border-line">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal via-teal to-teal-deep shadow-glow">
            <GraduationCap className="text-white" size={23} strokeWidth={1.75} />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-60" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber ring-2 ring-white" />
            </span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-semibold text-ink">智学伴</div>
            <div className="text-[10px] font-medium tracking-wider text-teal/70">EDUMIND · AI LEARNING</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">导航</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-teal to-teal-dark text-white shadow-soft'
                    : 'text-ink-soft hover:bg-paper-soft/80 hover:text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name={item.icon}
                    size={18}
                    className={cn('transition-colors', isActive ? 'text-white' : 'text-ink-muted group-hover:text-teal')}
                  />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Agent CTA */}
        <div className="m-3 overflow-hidden rounded-xl bg-gradient-to-br from-teal-deep via-teal to-teal-dark p-4 text-white shadow-glow">
          <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-amber/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-teal-pale">
              <Sparkles size={13} /> 智能体协同
            </div>
            <div className="mt-1.5 font-display text-base font-semibold leading-snug">
              8 个智能体<br />实时为你服务
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-teal-pale/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse-dot" />
              全部在线 · 讯飞星火驱动
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header
          className={cn(
            'flex h-20 shrink-0 items-center justify-between border-b border-line bg-white/60 px-6 backdrop-blur-md md:px-10 transition-all duration-300',
            isEditingProfile && 'filter blur-sm brightness-50 pointer-events-none'
          )}
        >
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{meta.title}</h1>
            <p className="text-sm text-ink-muted">{meta.subtitle}</p>
          </div>
          <StudentInfoEditor />
        </header>

        <main
          className={cn(
            'flex-1 overflow-y-auto transition-all duration-300',
            isEditingProfile && 'filter blur-sm brightness-50 pointer-events-none'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
