// 学习数据聚合统计工具
// 从 store 的原始学习活动数据中计算仪表盘/学习报告所需的聚合指标

import type { StudyActivity, QuizResult, LearnedRecord } from '@/store/useStore';
import type { ResourceType } from '@/data/mockData';

// 本地日期字符串 YYYY-MM-DD（确保与现实对应，不受 UTC 偏差影响）
const localDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 资源总数（从 mockData 的 resources 数组获取，此处通过参数传入避免循环依赖）
export function computeCompletionRate(learnedCount: number, totalResources: number): number {
  if (totalResources <= 0) return 0;
  return Math.min(100, Math.round((learnedCount / totalResources) * 100));
}

// 本周（最近 7 天）学习时长（分钟）
export function computeWeeklyMinutes(activities: StudyActivity[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return activities
    .filter((a) => a.timestamp >= sevenDaysAgo)
    .reduce((sum, a) => sum + a.durationMin, 0);
}

// 活跃天数（最近 7 天内有学习活动的不同日期数）
export function computeActiveDays(activities: StudyActivity[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const dates = new Set<string>();
  activities.forEach((a) => {
    if (a.timestamp >= sevenDaysAgo) dates.add(a.date);
  });
  return dates.size;
}

// 连续学习天数（从今天往前数，连续有活动的天数）
export function computeStreakDays(activities: StudyActivity[]): number {
  if (activities.length === 0) return 0;
  const dates = new Set(activities.map((a) => a.date));
  let streak = 0;
  const cursor = new Date();
  // 今天没活动也可以从昨天开始算
  for (let i = 0; i < 30; i++) {
    const dateStr = localDateStr(cursor);
    if (dates.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      // 今天还没活动，从昨天开始算
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// 正确率：所有答题的平均正确率
export function computeAccuracyRate(quizResults: QuizResult[]): number {
  if (quizResults.length === 0) return 0;
  const totalScore = quizResults.reduce((sum, q) => sum + q.score, 0);
  const totalQ = quizResults.reduce((sum, q) => sum + q.total, 0);
  if (totalQ === 0) return 0;
  return Math.round((totalScore / totalQ) * 100);
}

// 综合掌握度：基于已学资源数 + 答题正确率 + 画像知识基础
export function computeOverallMastery(
  learnedCount: number,
  totalResources: number,
  accuracyRate: number,
  knowledgeBase: number
): number {
  // 三因子加权：完成度 40% + 正确率 30% + 知识基础 30%
  const completionRatio = totalResources > 0 ? learnedCount / totalResources : 0;
  const accuracyRatio = accuracyRate / 100;
  const knowledgeRatio = knowledgeBase / 100;
  return Math.min(100, Math.round(completionRatio * 40 + accuracyRatio * 30 + knowledgeRatio * 30));
}

// 学习健康度：节奏稳定 + 不过度疲劳
export function computeHealthScore(
  activities: StudyActivity[],
  learnedCount: number
): number {
  // 基础分 70
  let score = 70;
  // 活跃天数加成（每天 +3，上限 +15）
  const activeDays = computeActiveDays(activities);
  score += Math.min(15, activeDays * 3);
  // 答题活动加成（每次 +2，上限 +10）
  const quizCount = activities.filter((a) => a.type === 'quiz').length;
  score += Math.min(10, quizCount * 2);
  // 连续学习 10 个以上时学习健康度下降（含资源 + 知识库学习）
  const knowledgeCount = activities.filter((a) => a.type === 'knowledge').length;
  const totalLearned = learnedCount + knowledgeCount;
  if (totalLearned > 10) {
    score -= (totalLearned - 10) * 4;
  }
  return Math.max(40, Math.min(99, score));
}

// 掌握度变化趋势：基于最近 7 天的学习活动生成 7 个数据点
export function computeMasteryTrend(
  activities: StudyActivity[],
  quizResults: QuizResult[],
  baseMastery: number
): { labels: string[]; values: number[] } {
  const labels: string[] = [];
  const values: number[] = [];
  const today = new Date();
  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = localDateStr(date);
    labels.push(dayLabels[date.getDay()]);

    // 当天学习活动加成
    const dayActivities = activities.filter((a) => a.date === dateStr);
    const dayQuiz = quizResults.filter((q) => q.date === dateStr);
    let dailyDelta = 0;
    dayActivities.forEach((a) => {
      if (a.type === 'resource') dailyDelta += 2;
      else if (a.type === 'quiz') dailyDelta += 3;
      else if (a.type === 'tutor') dailyDelta += 1;
      else if (a.type === 'knowledge') dailyDelta += 1; // 知识库学习：一点掌握度
    });
    dayQuiz.forEach((q) => {
      dailyDelta += Math.round(q.rate * 5);
    });
    // 累计：前一天的值 + 当天增量
    const prev = values.length > 0 ? values[values.length - 1] : baseMastery;
    values.push(Math.min(100, prev + dailyDelta));
  }
  return { labels, values };
}

// 多个知识点的掌握度趋势（按章节分组）
// 支持按活动类型过滤（type）和自定义起始值（baseValue）
export function computeTopicTrends(
  activities: StudyActivity[],
  quizResults: QuizResult[],
  topics: { topic: string; keywords: string[]; type?: StudyActivity['type']; baseValue?: number }[]
): { topic: string; values: number[] }[] {
  return topics.map((t) => {
    // 按类型过滤（如知识库学习）或按关键词过滤
    const relevantActivities = t.type
      ? activities.filter((a) => a.type === t.type)
      : t.keywords.length === 0
        ? activities // 空关键词 = 所有活动
        : activities.filter((a) => t.keywords.some((kw) => a.title.includes(kw)));
    const relevantQuiz = quizResults.filter((q) =>
      t.keywords.some((kw) => q.chapter.includes(kw))
    );
    // 使用自定义起始值或默认计算
    const base = t.baseValue ?? (30 + relevantActivities.length * 5 + relevantQuiz.length * 8);
    const values: number[] = [];
    const today = new Date();
    let prev = Math.min(95, base);
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = localDateStr(date);
      const dayCount = relevantActivities.filter((a) => a.date === dateStr).length;
      prev = Math.min(100, prev + dayCount * 3);
      values.push(prev);
    }
    return { topic: t.topic, values };
  });
}

// 资源使用统计：按类型计数（含已学 + 历史活动中的资源学习）
export function computeResourceUsage(
  learnedResources: LearnedRecord[],
  baseline: Record<ResourceType, number>
): Record<ResourceType, number> {
  const result = { ...baseline };
  learnedResources.forEach((r) => {
    if (r.type in result) result[r.type as ResourceType] += 1;
  });
  return result;
}

// 多维学习分析雷达数据
export function computeRadarData(
  completionRate: number,
  accuracyRate: number,
  activeDays: number,
  activities: StudyActivity[],
  profile: { learningPace: number; interest: number; cognitiveStyle: number }
): { label: string; value: number }[] {
  const totalActivities = activities.length;
  // 专注度：单次学习时长方差小 = 专注（这里用活动频率近似）
  const focusScore = Math.min(100, 50 + totalActivities * 3);
  // 进步度：综合答题与资源
  const progressScore = Math.min(100, 40 + totalActivities * 4);
  return [
    { label: '完成率', value: completionRate },
    { label: '正确率', value: accuracyRate },
    { label: '活跃度', value: Math.min(100, activeDays * 14) },
    { label: '专注度', value: focusScore },
    { label: '进步度', value: progressScore },
    { label: '坚持度', value: profile.learningPace },
  ];
}

// 生成个性化学习建议（基于画像 + 学习活动）
export function generateSuggestions(
  profile: { knowledgeBase: number; errorPattern: number; interest: number; learningPace: number },
  learnedResources: LearnedRecord[],
  quizResults: QuizResult[],
  weakTopics: { title: string; detail: string; priority: 'high' | 'medium' | 'low' }[]
): { id: string; title: string; detail: string; priority: 'high' | 'medium' | 'low' }[] {
  const suggestions: { id: string; title: string; detail: string; priority: 'high' | 'medium' | 'low' }[] = [];

  // 1. 加入薄弱点建议（来自参数）
  weakTopics.forEach((w, i) => {
    suggestions.push({
      id: `weak-${i}`,
      title: w.title,
      detail: w.detail,
      priority: w.priority,
    });
  });

  // 2. 基于答题正确率
  if (quizResults.length > 0) {
    const avgRate = quizResults.reduce((s, q) => s + q.rate, 0) / quizResults.length;
    if (avgRate < 0.6) {
      suggestions.push({
        id: 'quiz-low',
        title: '加强专项练习',
        detail: `近期答题平均正确率 ${Math.round(avgRate * 100)}%，建议针对错题重做并复习对应章节。`,
        priority: 'high',
      });
    } else if (avgRate >= 0.8) {
      suggestions.push({
        id: 'quiz-high',
        title: '挑战高阶题目',
        detail: `近期答题正确率 ${Math.round(avgRate * 100)}%，掌握良好，可尝试高阶难度题目拓展。`,
        priority: 'low',
      });
    }
  }

  // 3. 基于学习节奏
  if (profile.learningPace < 50) {
    suggestions.push({
      id: 'pace-low',
      title: '提升学习节奏',
      detail: '当前学习节奏偏慢，建议制定每日固定学习计划，逐步建立学习习惯。',
      priority: 'medium',
    });
  }

  // 4. 基于兴趣方向
  if (profile.interest > 80) {
    suggestions.push({
      id: 'interest-high',
      title: '拓展兴趣领域',
      detail: '学习兴趣浓厚，推荐探索交叉领域（如 AI + 其他学科），深化理解。',
      priority: 'low',
    });
  }

  // 5. 基于资源学习数量
  if (learnedResources.length === 0) {
    suggestions.push({
      id: 'start-learning',
      title: '开始首次学习',
      detail: '前往资源中心标记学习一项资源，开启你的学习之旅。',
      priority: 'high',
    });
  } else if (learnedResources.length > 5) {
    suggestions.push({
      id: 'review-needed',
      title: '定期复习已学',
      detail: `已学习 ${learnedResources.length} 项资源，建议定期回顾已学内容巩固记忆。`,
      priority: 'medium',
    });
  }

  // 按优先级排序：high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions.slice(0, 4);
}
