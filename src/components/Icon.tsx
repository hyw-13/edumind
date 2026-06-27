import {
  Network, UserSearch, FileText, GitBranch, ListChecks, Code2,
  Clapperboard, Route, MessageCircleQuestion, BookOpen,
  LayoutDashboard, Library, BarChart3, Tag, Compass, type LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Network, UserSearch, FileText, GitBranch, ListChecks, Code2,
  Clapperboard, Route, MessageCircleQuestion, BookOpen,
  LayoutDashboard, Library, BarChart3, Tag, Compass,
};

export default function Icon({ name, className, size = 18, strokeWidth = 1.75 }: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Cmp = iconMap[name] ?? FileText;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} />;
}
