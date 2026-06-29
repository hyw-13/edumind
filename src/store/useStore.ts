import { create } from 'zustand';
import { initialProfile, type Profile, type ResourceType } from '@/data/mockData';
import { dimLabels } from '@/lib/profileExtractor';

// 画像更新记录（随学随新）
export interface ProfileUpdateRecord {
  id: string;
  time: string;           // 时间戳
  source: 'dialogue' | 'quiz' | 'path' | 'resource' | 'manual';
  sourceLabel: string;    // 来源中文名
  dimension: keyof Profile;
  dimensionLabel: string;
  oldValue: number;
  newValue: number;
  delta: number;
  reason: string;         // 更新原因
}

// 已学资源记录
export interface LearnedRecord {
  resourceId: string;
  title: string;
  type: ResourceType;
  chapter: string;
  learnedAt: string;      // 标记时间
}

// 学习活动记录（用于活跃天数、本周时长、趋势图等聚合统计）
export interface StudyActivity {
  id: string;
  type: 'resource' | 'quiz' | 'tutor' | 'path' | 'knowledge';
  typeLabel: string;      // 资源学习 / 答题练习 / 智能答疑 / 路径学习 / 知识库学习
  title: string;          // 活动标题
  timestamp: number;      // 毫秒时间戳
  date: string;           // YYYY-MM-DD，便于按天聚合
  durationMin: number;    // 活动时长（分钟）
}

// 答题结果记录（用于正确率、掌握度趋势）
export interface QuizResult {
  id: string;
  score: number;
  total: number;
  chapter: string;
  rate: number;           // 正确率 0-1
  timestamp: number;
  date: string;
}

// 答疑提问记录（用于推荐个性化）
export interface TutorQuestion {
  id: string;
  question: string;
  effective: boolean;     // 是否为有效 AI 问题
  timestamp: number;
  date: string;
}

interface AppState {
  profile: Profile;
  updateHistory: ProfileUpdateRecord[];
  learnedResources: LearnedRecord[];   // 已标记学习的资源列表
  studyActivities: StudyActivity[];    // 学习活动流水
  quizResults: QuizResult[];           // 答题结果
  tutorQuestions: TutorQuestion[];     // 答疑提问
  setProfile: (p: Partial<Profile>) => void;
  // 随学随新：基于学习事件更新画像
  applyProfileDelta: (
    delta: Partial<Profile>,
    source: ProfileUpdateRecord['source'],
    sourceLabel: string,
    reason: string
  ) => void;
  // 答题后更新
  updateFromQuiz: (score: number, total: number, chapter: string) => void;
  // 路径进度更新
  updateFromPathProgress: (completedCount: number, totalCount: number) => void;
  // 学习资源访问
  updateFromResourceAccess: (resourceType: string, duration: number) => void;
  // 标记资源已学：更新画像 + 记录到已学列表 + 写入学习活动
  markResourceLearned: (resource: { id: string; title: string; type: ResourceType; chapter: string }) => boolean;
  isResourceLearned: (resourceId: string) => boolean;
  // 记录答题结果（含画像更新与活动流水）
  recordQuizResult: (score: number, total: number, chapter: string) => void;
  // 记录答疑提问（用于推荐与画像）
  recordTutorQuestion: (question: string, effective: boolean) => void;
  // 记录知识库学习（浏览知识点 → 写入学习活动 + 更新画像，同一天同一知识点只记一次）
  recordKnowledgeStudy: (point: { id: string; title: string; chapter: string; section: string }) => void;
  resetProfile: () => void;
}

// 限制分数范围
const clamp = (v: number) => Math.max(5, Math.min(95, v));

// 当前时间字符串
const now = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
// 当前日期字符串 YYYY-MM-DD
const today = () => new Date().toISOString().slice(0, 10);

export const useStore = create<AppState>((set, get) => ({
  profile: initialProfile,
  updateHistory: [],
  learnedResources: [],
  studyActivities: [],
  quizResults: [],
  tutorQuestions: [],

  setProfile: (delta) =>
    set((state) => ({
      profile: { ...state.profile, ...delta },
    })),

  // 通用增量更新（带历史记录）
  applyProfileDelta: (delta, source, sourceLabel, reason) =>
    set((state) => {
      const newProfile = { ...state.profile };
      const records: ProfileUpdateRecord[] = [];
      for (const key of Object.keys(delta) as (keyof Profile)[]) {
        const oldValue = state.profile[key];
        const newValue = clamp(delta[key]!);
        if (newValue !== oldValue) {
          newProfile[key] = newValue;
          records.push({
            id: `rec-${Date.now()}-${key}`,
            time: now(),
            source,
            sourceLabel,
            dimension: key,
            dimensionLabel: dimLabels[key],
            oldValue,
            newValue,
            delta: newValue - oldValue,
            reason,
          });
        }
      }
      return {
        profile: newProfile,
        updateHistory: [...records, ...state.updateHistory].slice(0, 50), // 保留最近 50 条
      };
    }),

  // 答题后更新：正确率高 → 知识基础+，低 → 易错点+
  updateFromQuiz: (score, total, chapter) => {
    const rate = score / total;
    const delta: Partial<Profile> = {};
    let reason = `完成《${chapter}》答题：${score}/${total}（${Math.round(rate * 100)}%）`;
    if (rate >= 0.8) {
      delta.knowledgeBase = get().profile.knowledgeBase + 6;
      reason += '，掌握良好';
    } else if (rate >= 0.6) {
      delta.knowledgeBase = get().profile.knowledgeBase + 2;
      delta.errorPattern = get().profile.errorPattern + 3;
      reason += '，基本掌握但有错题';
    } else {
      delta.errorPattern = get().profile.errorPattern + 8;
      delta.knowledgeBase = get().profile.knowledgeBase - 3;
      reason += '，需重点复习';
    }
    get().applyProfileDelta(delta, 'quiz', '答题练习', reason);
  },

  // 路径进度更新：完成节点数 → 学习历史+
  updateFromPathProgress: (completedCount, totalCount) => {
    const progress = completedCount / totalCount;
    const delta: Partial<Profile> = {
      history: get().profile.history + Math.round(progress * 15),
      knowledgeBase: get().profile.knowledgeBase + Math.round(progress * 8),
    };
    get().applyProfileDelta(
      delta,
      'path',
      '学习路径',
      `路径进度：${completedCount}/${totalCount} 节点已完成`
    );
  },

  // 学习资源访问
  updateFromResourceAccess: (resourceType, duration) => {
    const delta: Partial<Profile> = {};
    const mins = Math.round(duration / 60);
    let reason = `学习${resourceType}资源 ${mins} 分钟`;
    if (resourceType.includes('代码') || resourceType.includes('code')) {
      delta.cognitiveStyle = get().profile.cognitiveStyle + 3;
      delta.knowledgeBase = get().profile.knowledgeBase + 2;
      reason += '，动手实践';
    } else if (resourceType.includes('思维导图') || resourceType.includes('mindmap')) {
      delta.cognitiveStyle = get().profile.cognitiveStyle + 2;
      reason += '，偏好可视化学习';
    } else if (resourceType.includes('文档') || resourceType.includes('阅读')) {
      delta.cognitiveStyle = get().profile.cognitiveStyle + 1;
      reason += '，偏好阅读学习';
    }
    delta.learningPace = get().profile.learningPace + (mins > 30 ? 3 : 1);
    get().applyProfileDelta(delta, 'resource', '资源学习', reason);
  },

  // 标记资源已学：避免重复标记，更新画像维度并记录
  markResourceLearned: (resource) => {
    const state = get();
    if (state.learnedResources.some((r) => r.resourceId === resource.id)) {
      return false; // 已标记过
    }
    // 记录到已学列表
    set((s) => ({
      learnedResources: [
        {
          resourceId: resource.id,
          title: resource.title,
          type: resource.type,
          chapter: resource.chapter,
          learnedAt: now(),
        },
        ...s.learnedResources,
      ],
      // 同步写入学习活动流水
      studyActivities: [
        {
          id: `act-${Date.now()}`,
          type: 'resource',
          typeLabel: '资源学习',
          title: resource.title,
          timestamp: Date.now(),
          date: today(),
          durationMin: 25, // 假设单资源平均学习 25 分钟
        },
        ...s.studyActivities,
      ],
    }));
    // 根据资源类型更新画像维度
    const delta: Partial<Profile> = { knowledgeBase: state.profile.knowledgeBase + 4 };
    let reason = `标记学习《${resource.title}》`;
    if (resource.type === 'code') {
      delta.cognitiveStyle = state.profile.cognitiveStyle + 4;
      delta.history = state.profile.history + 3;
      reason += '，代码实战';
    } else if (resource.type === 'quiz') {
      delta.errorPattern = state.profile.errorPattern - 2;
      delta.knowledgeBase = state.profile.knowledgeBase + 5;
      reason += '，巩固错题';
    } else if (resource.type === 'mindmap') {
      delta.cognitiveStyle = state.profile.cognitiveStyle + 3;
      reason += '，可视化梳理';
    } else if (resource.type === 'reading') {
      delta.learningPace = state.profile.learningPace + 2;
      reason += '，拓展阅读';
    } else {
      delta.learningPace = state.profile.learningPace + 2;
      reason += '，文档学习';
    }
    get().applyProfileDelta(delta, 'resource', '资源学习', reason);
    return true;
  },

  isResourceLearned: (resourceId) =>
    get().learnedResources.some((r) => r.resourceId === resourceId),

  // 记录答题结果：写入 quizResults + 学习活动 + 触发画像更新
  recordQuizResult: (score, total, chapter) => {
    const rate = total > 0 ? score / total : 0;
    const ts = Date.now();
    set((s) => ({
      quizResults: [
        {
          id: `quiz-${ts}`,
          score,
          total,
          chapter,
          rate,
          timestamp: ts,
          date: today(),
        },
        ...s.quizResults,
      ],
      studyActivities: [
        {
          id: `act-${ts}`,
          type: 'quiz',
          typeLabel: '答题练习',
          title: `《${chapter}》答题 ${score}/${total}`,
          timestamp: ts,
          date: today(),
          durationMin: 15, // 答题平均 15 分钟
        },
        ...s.studyActivities,
      ],
    }));
    // 触发画像更新（复用既有逻辑）
    get().updateFromQuiz(score, total, chapter);
  },

  // 记录答疑提问：写入 tutorQuestions + 学习活动 + 更新画像
  recordTutorQuestion: (question, effective) => {
    const ts = Date.now();
    set((s) => ({
      tutorQuestions: [
        {
          id: `tutor-${ts}`,
          question,
          effective,
          timestamp: ts,
          date: today(),
        },
        ...s.tutorQuestions,
      ],
      studyActivities: [
        {
          id: `act-${ts}`,
          type: 'tutor',
          typeLabel: '智能答疑',
          title: question.slice(0, 30),
          timestamp: ts,
          date: today(),
          durationMin: 8, // 答疑平均 8 分钟
        },
        ...s.studyActivities,
      ],
    }));
    // 有效提问 → 兴趣 +1、学习节奏 +1
    if (effective) {
      get().applyProfileDelta(
        { interest: get().profile.interest + 1, learningPace: get().profile.learningPace + 1 },
        'dialogue',
        '智能答疑',
        `答疑提问：${question.slice(0, 20)}`
      );
    }
  },

  // 记录知识库学习：同一天同一知识点只记一次，避免刷新即记录
  recordKnowledgeStudy: (point) => {
    const ts = Date.now();
    const todayStr = today();
    const state = get();
    // 同一天同一知识点已记录则跳过
    const already = state.studyActivities.some(
      (a) => a.type === 'knowledge' && a.title.includes(point.title) && a.date === todayStr
    );
    if (already) return;
    set((s) => ({
      studyActivities: [
        {
          id: `act-${ts}`,
          type: 'knowledge',
          typeLabel: '知识库学习',
          title: `${point.chapter} · ${point.title}`,
          timestamp: ts,
          date: todayStr,
          durationMin: 10, // 知识点阅读平均 10 分钟
        },
        ...s.studyActivities,
      ],
    }));
    // 更新画像：知识基础 +2、兴趣 +1
    get().applyProfileDelta(
      { knowledgeBase: get().profile.knowledgeBase + 2, interest: get().profile.interest + 1 },
      'resource',
      '知识库学习',
      `学习知识点：${point.title}`
    );
  },

  resetProfile: () => set({
    profile: initialProfile,
    updateHistory: [],
    learnedResources: [],
    studyActivities: [],
    quizResults: [],
    tutorQuestions: [],
  }),
}));
