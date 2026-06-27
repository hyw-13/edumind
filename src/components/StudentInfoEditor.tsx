import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, X, Check, Pencil } from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';

// 右上角学生个人信息：点击可自主编辑
export default function StudentInfoEditor() {
  const info = useStudentStore((s) => s.info);
  const setInfo = useStudentStore((s) => s.setInfo);
  // 通过 store 共享编辑状态，便于 Layout 控制其他区域模糊/降亮
  const editing = useStudentStore((s) => s.isEditingProfile);
  const setEditing = useStudentStore((s) => s.setEditingProfile);
  const [draft, setDraft] = useState(info);

  useEffect(() => {
    if (editing) setDraft(info);
  }, [editing, info]);

  // ESC 关闭
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setEditing(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editing]);

  const save = () => {
    setInfo({
      name: draft.name.trim() || '匿名同学',
      major: draft.major.trim(),
      grade: draft.grade.trim(),
      goal: draft.goal.trim(),
    });
    setEditing(false);
  };

  const desc = [info.major, info.grade, info.goal].filter(Boolean).join(' · ');

  return (
    <>
      <button
        onClick={() => setEditing(true)}
        className="group flex items-center gap-4 rounded-xl px-2 py-1 transition-all hover:bg-paper-soft"
        title="点击编辑个人信息"
      >
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium text-ink">{info.name}</div>
          <div className="text-xs text-ink-muted">{desc || '点击完善信息'}</div>
        </div>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber to-amber-light font-display text-sm font-semibold text-white shadow-soft">
          {info.name.charAt(0) || '?'}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-soft transition-opacity opacity-0 group-hover:opacity-100">
            <Pencil size={9} className="text-teal" />
          </span>
        </div>
      </button>

      {editing && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-md animate-fade-in" onClick={() => setEditing(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-line bg-paper shadow-lift animate-fade-up p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={18} className="text-teal" />
                <h3 className="font-display text-base font-semibold text-ink">编辑个人信息</h3>
              </div>
              <button onClick={() => setEditing(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-all hover:bg-paper-soft hover:text-ink">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">姓名</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  autoFocus
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-all focus:border-teal/40 focus:ring-2 focus:ring-teal/10"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">专业</label>
                <input
                  value={draft.major}
                  onChange={(e) => setDraft({ ...draft, major: e.target.value })}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-all focus:border-teal/40 focus:ring-2 focus:ring-teal/10"
                  placeholder="如：计算机、软件工程、数据科学"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">年级</label>
                <input
                  value={draft.grade}
                  onChange={(e) => setDraft({ ...draft, grade: e.target.value })}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-all focus:border-teal/40 focus:ring-2 focus:ring-teal/10"
                  placeholder="如：大三、研一、工作 2 年"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">学习方向</label>
                <input
                  value={draft.goal}
                  onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-all focus:border-teal/40 focus:ring-2 focus:ring-teal/10"
                  placeholder="如：考研方向、求职就业、兴趣学习"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft transition-all hover:border-teal/30 hover:text-teal">
                取消
              </button>
              <button onClick={save} className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-dark">
                <Check size={14} /> 保存
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
