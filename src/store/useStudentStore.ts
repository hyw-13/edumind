import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 学生基本信息（右上角展示，可自主编辑，localStorage 持久化）
export interface StudentInfo {
  name: string;
  major: string;
  grade: string;
  goal: string;
}

const defaultInfo: StudentInfo = {
  name: '王同学',
  major: '计算机',
  grade: '大三',
  goal: '考研方向',
};

interface StudentState {
  info: StudentInfo;
  setInfo: (patch: Partial<StudentInfo>) => void;
  isEditingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      info: defaultInfo,
      setInfo: (patch) => set((state) => ({ info: { ...state.info, ...patch } })),
      isEditingProfile: false,
      setEditingProfile: (v) => set({ isEditingProfile: v }),
    }),
    {
      name: 'edumind-student',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ info: s.info }),
    }
  )
);
