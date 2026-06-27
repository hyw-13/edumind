import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageCircleQuestion, Sparkles, ImageIcon, Play, Lightbulb } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  initialTutorMessages, tutorSuggestions, tutorReplyMap,
  type ChatMessage,
} from '@/data/mockData';
import { cn } from '@/lib/utils';

interface Msg extends ChatMessage {
  streaming?: boolean;
}

// AI 课程相关关键词（用于判断问题是否在答疑范围内）
const aiKeywords = [
  'ai', '人工智能', '机器学习', '深度学习', '神经网络', '搜索', '算法', '知识',
  '决策树', 'transformer', '注意力', 'attention', '反向传播', '梯度', '损失', '过拟合',
  '正则', '强化学习', 'nlp', '自然语言', 'cv', '计算机视觉', '预训练', '微调', '大模型',
  'llm', 'a*', 'bfs', 'dfs', '启发式', '知识图谱', '感知机', 'svm', '随机森林', '聚类',
  '分类', '回归', '熵', '信息增益', '基尼', '剪枝', '编码', '解码', '卷积', 'cnn', 'rnn',
  'lstm', 'gan', '生成', '识别', '推理', '训练', '模型', '数据', '特征', '概率', '统计',
  '线性代数', '矩阵', '向量', '优化', '收敛', '偏差', '方差', '采样', '嵌入', '表示',
  'softmax', 'relu', '激活', '池化', '归一化', 'dropout', 'embedding', 'learning',
  'model', 'train', 'loss', 'gradient', 'epoch', 'batch', 'optimizer', 'token',
  '符号主义', '连接主义', '行为主义', '智能体', 'agent', 'langgraph', '提示', 'prompt',
  '链式法则', '导数', '偏导', '雅可比', '海森', '梯度下降', '牛顿法', '共轭梯度',
];

// 判断输入是否可以有效回答
function canEffectivelyAnswer(text: string): boolean {
  const trimmed = text.trim();
  // 移除空白和标点符号后的有效内容
  const meaningful = trimmed.replace(/[\s\p{P}\p{S}]/gu, '');
  // 太短（少于 3 个有效字符）
  if (meaningful.length < 3) return false;
  // 纯数字或纯符号
  if (/^[\d\s\p{P}\p{S}]+$/u.test(trimmed)) return false;

  const lower = trimmed.toLowerCase();
  const hasKeyword = aiKeywords.some((k) => lower.includes(k));
  // 包含疑问词或问号，视为有效提问
  const isQuestion =
    /[?？]/.test(trimmed) ||
    /什么是|是什么|为什么|如何|怎么|区别|原理|作用|含义|定义|解释|分析|比较|能否|可以吗|对吗/.test(trimmed);

  return hasKeyword || isQuestion;
}

// 无法回答时的致歉回复
const apologyReply = `抱歉，我目前无法就这个问题给出有效回答。\n\n作为「智学伴」的答疑智能体，我主要基于**《人工智能导论》课程知识库**进行检索与解答，覆盖以下范围：\n\n- 人工智能基础概念（三大流派、发展历史）\n- 搜索算法（BFS、DFS、UCS、A*）\n- 机器学习（决策树、SVM、集成方法）\n- 深度学习（神经网络、CNN、RNN、Transformer）\n- 自然语言处理与大模型（注意力、预训练、微调）\n- 知识表示与推理（知识图谱、逻辑）\n\n你可以尝试：\n1. 重新组织问题，使用更明确的 AI 相关术语\n2. 点击下方推荐问题快速体验\n3. 前往「资源中心」查看结构化学习材料\n\n> 提示：我的知识来源于课程知识库，超出课程范围的问题可能无法准确回答。`;

export default function Tutor() {
  const [messages, setMessages] = useState<Msg[]>(initialTutorMessages);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamText]);

  const send = (text: string) => {
    if (streaming || !text.trim()) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setStreaming(true);
    setStreamText('');

    const reply = tutorReplyMap[text] ?? (canEffectivelyAnswer(text)
      ? `针对你的问题「${text}」，基于课程知识库检索，我整理了以下要点：\n\n## 解析\n\n该问题涉及核心概念的辨析与应用。建议从基本定义出发，理解其数学本质，再结合代码实例验证。\n\n### 关键点\n1. 概念定义与适用场景\n2. 数学推导与公式\n3. 代码实现示例\n\n> 提示：你可以结合资源中心的「讲解文档」与「代码案例」进一步巩固。`
      : apologyReply);

    let pos = 0;
    const chunkSize = 3;
    const timer = setInterval(() => {
      pos += chunkSize;
      setStreamText(reply.slice(0, pos));
      if (pos >= reply.length) {
        clearInterval(timer);
        setMessages((m) => [...m, {
          id: `a-${Date.now()}`, role: 'assistant', content: reply, timestamp: now(),
          modalities: ['text', 'diagram'],
        }]);
        setStreamText('');
        setStreaming(false);
      }
    }, 22);
  };

  // 从推荐页跳转时自动填入并发送问题
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !pendingRef.current) {
      pendingRef.current = q;
      // 等待组件挂载完成后发送
      const decoded = decodeURIComponent(q);
      searchParams.delete('q');
      setSearchParams(searchParams, { replace: true });
      setTimeout(() => send(decoded), 300);
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-6 py-6 md:px-10">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-deep shadow-glow">
            <MessageCircleQuestion className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">智能答疑</h2>
            <p className="text-xs text-ink-muted">多模态即时辅导 · 防幻觉 RAG 检索</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="card flex-1 space-y-6 overflow-y-auto p-6">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : '')}>
            <div className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              m.role === 'user' ? 'bg-gradient-to-br from-amber to-amber-light text-white' : 'bg-gradient-to-br from-teal to-teal-deep text-white'
            )}>
              {m.role === 'user' ? '我' : <Sparkles size={16} />}
            </div>
            <div className={cn('max-w-[80%]', m.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn(
                'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                m.role === 'user' ? 'rounded-tr-sm bg-amber/10 text-ink' : 'rounded-tl-sm bg-paper-soft text-ink-soft'
              )}>
                <MarkdownRenderer content={m.content} />
              </div>
              {/* multimodal chips */}
              {m.role === 'assistant' && m.modalities && (
                <div className="mt-2 flex gap-2">
                  <span className="flex items-center gap-1 rounded-md bg-teal-pale/50 px-2 py-1 text-[10px] font-medium text-teal-dark">
                    <Lightbulb size={11} /> 文字解析
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-amber-pale/50 px-2 py-1 text-[10px] font-medium text-amber">
                    <ImageIcon size={11} /> 图解说明
                  </span>
                  <button className="flex items-center gap-1 rounded-md bg-rose-pale/50 px-2 py-1 text-[10px] font-medium text-rose transition-all hover:bg-rose hover:text-white">
                    <Play size={11} /> 生成短视频
                  </button>
                </div>
              )}
              <div className={cn('mt-1 text-[10px] text-ink-faint', m.role === 'user' ? 'text-right' : '')}>{m.timestamp}</div>
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal-deep text-white">
              <Sparkles size={16} />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-paper-soft px-4 py-3 text-sm leading-relaxed text-ink-soft">
              <span className="stream-caret">{streamText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {!streaming && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tutorSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink-soft transition-all hover:border-teal/40 hover:bg-teal hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-line bg-white p-2 pl-4 shadow-soft focus-within:border-teal/40">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          disabled={streaming}
          placeholder={streaming ? '答疑智能体正在检索知识库…' : '输入你的问题，支持概念、公式、代码…'}
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          onClick={() => send(input)}
          disabled={streaming || !input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal text-white transition-all hover:bg-teal-dark disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
