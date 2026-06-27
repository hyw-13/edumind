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

interface AppState {
  profile: Profile;
  updateHistory: ProfileUpdateRecord[];
  learnedResources: LearnedRecord[];   // 已标记学习的资源列表
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
  // 标记资源已学：更新画像 + 记录到已学列表
  markResourceLearned: (resource: { id: string; title: string; type: ResourceType; chapter: string }) => boolean;
  isResourceLearned: (resourceId: string) => boolean;
  resetProfile: () => void;
}

// 限制分数范围
const clamp = (v: number) => Math.max(5, Math.min(95, v));

// 当前时间字符串
const now = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

export const useStore = create<AppState>((set, get) => ({
  profile: initialProfile,
  updateHistory: [],
  learnedResources: [],

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

  resetProfile: () => set({ profile: initialProfile, updateHistory: [], learnedResources: [] }),
}));
