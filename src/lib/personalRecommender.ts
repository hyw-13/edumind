// 智学伴 EduMind - 个性化推荐引擎
// 基于学生画像 + 学习历史 + 答疑提问动态生成推荐

import { resources, type Resource, type ResourceType, type Profile } from '@/data/mockData';
import type { LearnedRecord, TutorQuestion } from '@/store/useStore';

export interface PersonalRecommendation {
  id: string;
  resourceId: string;
  type: ResourceType;
  title: string;
  chapter: string;
  reason: string;
  duration: string;
  score: number;          // 推荐匹配分
}

// 兴趣方向 → 资源关键词映射
const interestKeywords: Record<string, string[]> = {
  nlp: ['Transformer', 'NLP', '自然语言', 'BERT', 'GPT', '大语言模型', '注意力', '预训练'],
  cv: ['CNN', '卷积', '计算机视觉', '图像', 'YOLO', 'ResNet', 'AlexNet', 'GAN', '扩散'],
  rl: ['强化学习', 'Q-Learning', 'PPO', '马尔可夫', '奖励', '智能体'],
  ml: ['机器学习', '决策树', 'SVM', '集成', 'K-Means', 'PCA', '过拟合', '正则化'],
  search: ['A*', '搜索', 'BFS', 'DFS', '启发式', '博弈'],
  history: ['达特茅斯', '历史', '图灵', '感知机', '专家系统', 'AlphaGo'],
  ethics: ['伦理', '对齐', '偏见', '隐私', '安全', 'RLHF'],
  foundation: ['引言', '基础', '概念', '流派', '定义'],
};

// 从画像兴趣维度推断兴趣方向
function inferInterestAreas(profile: Profile): string[] {
  const areas: string[] = [];
  // 基础薄弱 → 推荐基础内容
  if (profile.knowledgeBase < 50) areas.push('foundation');
  // 兴趣维度高 → 推荐兴趣方向
  if (profile.interest > 70) {
    // 根据 errorPattern 和 cognitiveStyle 推断
    if (profile.cognitiveStyle > 70) areas.push('ml', 'cv', 'nlp');
    else areas.push('history', 'ethics');
  }
  // 易错点高 → 推荐练习
  if (profile.errorPattern > 50) areas.push('ml', 'search');
  return areas;
}

// 从答疑提问中提取兴趣关键词
function extractTutorInterests(tutorQuestions: TutorQuestion[]): string[] {
  const areas: string[] = [];
  const effectiveQuestions = tutorQuestions.filter((q) => q.effective);
  for (const q of effectiveQuestions) {
    const lower = q.question.toLowerCase();
    for (const [area, keywords] of Object.entries(interestKeywords)) {
      if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
        areas.push(area);
      }
    }
  }
  return areas;
}

// 根据画像 + 学习历史 + 答疑历史生成个性化推荐
export function recommendResources(
  profile: Profile,
  learnedResources: LearnedRecord[],
  tutorQuestions: TutorQuestion[],
  limit: number = 3
): PersonalRecommendation[] {
  const learnedIds = new Set(learnedResources.map((r) => r.resourceId));
  const interestAreas = new Set([
    ...inferInterestAreas(profile),
    ...extractTutorInterests(tutorQuestions),
  ]);

  const candidates: PersonalRecommendation[] = resources
    .filter((r) => !learnedIds.has(r.id)) // 排除已学
    .map((r) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. 兴趣匹配
      for (const area of interestAreas) {
        const keywords = interestKeywords[area] || [];
        const matched = keywords.some((kw) =>
          r.title.includes(kw) || r.chapter.includes(kw) || r.summary.includes(kw)
        );
        if (matched) {
          score += 30;
          reasons.push(`匹配你的兴趣方向（${area}）`);
          break;
        }
      }

      // 2. 认知风格匹配
      if (profile.cognitiveStyle > 70) {
        // 实践型 → 优先代码/题库
        if (r.type === 'code' || r.type === 'quiz') {
          score += 20;
          reasons.push('适合你的动手实践偏好');
        }
      } else {
        // 理论型 → 优先文档/阅读
        if (r.type === 'doc' || r.type === 'reading') {
          score += 20;
          reasons.push('适合你的理论学习偏好');
        }
      }

      // 3. 易错点高 → 优先题库
      if (profile.errorPattern > 50 && r.type === 'quiz') {
        score += 15;
        reasons.push('针对易错点巩固练习');
      }

      // 4. 知识基础低 → 优先入门难度
      if (profile.knowledgeBase < 50 && r.difficulty === '入门') {
        score += 15;
        reasons.push('适合当前知识基础');
      } else if (profile.knowledgeBase > 70 && r.difficulty === '高阶') {
        score += 15;
        reasons.push('挑战高阶内容');
      }

      // 5. 学习节奏慢 → 优先短时长
      if (profile.learningPace < 60) {
        if (r.duration && (r.duration.includes('10') || r.duration.includes('15'))) {
          score += 10;
          reasons.push('节奏适中');
        }
      }

      // 6. 答疑历史相关加成
      const tutorKeywords = tutorQuestions
        .filter((q) => q.effective)
        .map((q) => q.question)
        .join(' ');
      if (tutorKeywords) {
        const titleMatch = r.title.split('').some((ch) => tutorKeywords.includes(ch));
        if (titleMatch) {
          score += 25;
          reasons.push('基于你的答疑提问');
        }
      }

      return {
        id: `rec-${r.id}`,
        resourceId: r.id,
        type: r.type,
        title: r.title,
        chapter: r.chapter,
        reason: reasons[0] || '基于你的画像推荐',
        duration: r.duration || '约 20 分钟',
        score,
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // 如果推荐不足，补充未学过的资源
  if (candidates.length < limit) {
    const fallback = resources
      .filter((r) => !learnedIds.has(r.id) && !candidates.some((c) => c.resourceId === r.id))
      .slice(0, limit - candidates.length)
      .map((r) => ({
        id: `rec-${r.id}`,
        resourceId: r.id,
        type: r.type,
        title: r.title,
        chapter: r.chapter,
        reason: '继续探索更多内容',
        duration: r.duration || '约 20 分钟',
        score: 0,
      }));
    return [...candidates, ...fallback].slice(0, limit);
  }

  return candidates.slice(0, limit);
}
