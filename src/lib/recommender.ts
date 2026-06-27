// 智学伴 EduMind - 智能推荐引擎
// 根据用户输入文本，从知识库/资源/路径节点中匹配相关学习资料

import { knowledgeBase, type KnowledgePoint } from '@/data/knowledgeBase';
import { resources, pathNodes, tutorSuggestions, type Resource, type PathNode } from '@/data/mockData';

export type RecommendType = 'knowledge' | 'resource' | 'path' | 'question';

export interface RecommendItem {
  id: string;
  type: RecommendType;
  title: string;
  summary: string;
  score: number;
  link: string;            // 跳转路径
  meta?: string;           // 附加信息
  icon: string;            // 图标名
  tags?: string[];         // 标签
}

export interface RecommendResult {
  knowledge: RecommendItem[];
  resources: RecommendItem[];
  paths: RecommendItem[];
  questions: RecommendItem[];
  total: number;
}

// 同义词/相关词扩展词典 —— 让推荐更智能
const synonymMap: Record<string, string[]> = {
  '神经网络': ['深度学习', '感知机', 'MLP', 'CNN', 'RNN', '反向传播', '激活函数', '梯度'],
  '深度学习': ['神经网络', 'CNN', 'RNN', 'Transformer', '残差', '反向传播', '梯度下降'],
  '搜索': ['A*', 'BFS', 'DFS', 'UCS', '启发式', '路径规划', '博弈', 'Minimax', 'Alpha-Beta', 'MCTS'],
  '机器学习': ['监督学习', '无监督学习', '强化学习', '决策树', 'SVM', '集成', '过拟合', '正则化', 'KNN'],
  '大模型': ['LLM', 'GPT', 'BERT', 'Transformer', '预训练', 'RLHF', 'SFT', 'DPO', '涌现', 'CoT'],
  '大语言模型': ['LLM', 'GPT', 'BERT', 'Transformer', '预训练', 'RLHF', 'SFT', 'DPO'],
  'NLP': ['自然语言', 'Transformer', 'BERT', 'GPT', '词向量', '注意力', 'word2vec'],
  '自然语言': ['NLP', 'Transformer', 'BERT', 'GPT', '词向量', '注意力'],
  'CV': ['计算机视觉', 'CNN', '图像', '检测', '分割', 'YOLO', 'ResNet', 'AlexNet'],
  '计算机视觉': ['CV', 'CNN', '图像', '检测', '分割', 'YOLO', 'ResNet'],
  '决策树': ['ID3', 'C4.5', 'CART', '信息增益', '增益率', '基尼', '剪枝', '随机森林'],
  'Transformer': ['注意力', '自注意力', '多头', '位置编码', 'BERT', 'GPT', 'Encoder', 'Decoder'],
  '注意力': ['Transformer', '自注意力', '多头', '位置编码'],
  '知识图谱': ['三元组', '实体', '关系', '抽取', '推理', 'TransE', 'NER'],
  '智能体': ['Agent', 'PEAS', '多智能体', 'LangGraph', '强化学习', '具身'],
  '强化学习': ['RL', 'Q-Learning', 'PPO', '智能体', '奖励', '马尔可夫'],
  '历史': ['达特茅斯', '图灵', '感知机', '专家系统', '寒冬', 'AlphaGo', 'AlexNet'],
  '伦理': ['对齐', 'RLHF', '偏见', '隐私', '安全', 'Constitutional', '红队'],
  '对齐': ['RLHF', 'DPO', 'Constitutional AI', '安全', '伦理'],
  '入门': ['基础', '概念', '引言', '定义', '流派'],
  '基础': ['概念', '引言', '定义', '流派', '入门'],
};

// 热门快捷主题
export const hotTopics = [
  '深度学习', 'Transformer 自注意力', 'A* 搜索算法', '决策树',
  '大语言模型', '神经网络反向传播', '知识图谱', 'AI 发展历史',
  '强化学习', '计算机视觉 CNN', '智能体', 'AI 伦理与对齐',
];

// 停用词
const stopWords = new Set(['的', '了', '是', '在', '我', '想', '要', '学', '学习', '了解', '关于', '什么', '怎么', '如何', '请', '帮', '推荐']);

// 中文分词（简易：按空格 + 词典最长匹配）
function tokenize(input: string): string[] {
  const cleaned = input.trim().toLowerCase();
  if (!cleaned) return [];
  // 按空格、标点分割
  const parts = cleaned.split(/[\s,，。.?？!！、;；:：/]+/).filter(Boolean);
  // 扩展同义词
  const expanded = new Set<string>();
  for (const p of parts) {
    if (p.length >= 1 && !stopWords.has(p)) {
      expanded.add(p);
      // 查找同义词
      for (const [key, syns] of Object.entries(synonymMap)) {
        if (p.includes(key) || key.includes(p)) {
          syns.forEach((s) => expanded.add(s.toLowerCase()));
        }
      }
    }
  }
  return Array.from(expanded);
}

// 计算文本中包含关键词的得分
function scoreText(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (!kw) continue;
    if (lower === kw) score += 15;           // 完全匹配
    else if (lower.includes(kw)) score += 8; // 包含
    else if (kw.includes(lower)) score += 4; // 被包含
  }
  return score;
}

// 计算单个候选项的综合得分
function calcScore(fields: string[], keywords: string[], weights: number[]): number {
  let total = 0;
  fields.forEach((f, i) => {
    total += scoreText(f, keywords) * weights[i];
  });
  return total;
}

// 主推荐函数
export function recommend(input: string): RecommendResult {
  const keywords = tokenize(input);
  const empty: RecommendResult = { knowledge: [], resources: [], paths: [], questions: [], total: 0 };
  if (keywords.length === 0) return empty;

  // ---- 1. 知识库知识点 ----
  const knowledgeItems: RecommendItem[] = [];
  for (const ch of knowledgeBase) {
    for (const sec of ch.sections) {
      for (const pt of sec.points) {
        const fields = [pt.title, pt.summary, pt.detail, (pt.keyTerms || []).join(' '), `${ch.title} ${sec.title}`];
        const weights = [3, 2, 0.5, 2.5, 1];
        const score = calcScore(fields, keywords, weights);
        if (score > 0) {
          knowledgeItems.push({
            id: pt.id,
            type: 'knowledge',
            title: pt.title,
            summary: pt.summary,
            score,
            link: '/path',
            meta: `${ch.title} · ${sec.title}`,
            icon: 'BookOpen',
            tags: pt.keyTerms,
          });
        }
      }
    }
  }

  // ---- 2. 资源 ----
  const resourceItems: RecommendItem[] = resources.map((r: Resource) => {
    const fields = [r.title, r.summary, r.content, r.chapter];
    const weights = [3, 2.5, 0.3, 1.5];
    const score = calcScore(fields, keywords, weights);
    return {
      id: r.id,
      type: 'resource' as const,
      title: r.title,
      summary: r.summary,
      score,
      link: '/resources',
      meta: `${r.chapter} · ${r.difficulty}`,
      icon: resourceIcon(r.type),
      tags: [r.type, r.difficulty],
    };
  }).filter((r) => r.score > 0);

  // ---- 3. 路径节点 ----
  const pathItems: RecommendItem[] = pathNodes.map((n: PathNode) => {
    const fields = [n.label, n.chapter];
    const weights = [3, 2];
    const score = calcScore(fields, keywords, weights);
    return {
      id: n.id,
      type: 'path' as const,
      title: n.label,
      summary: n.chapter,
      score,
      link: '/path',
      meta: `掌握度 ${n.mastery}% · ${statusLabel(n.status)}`,
      icon: 'Route',
      tags: [statusLabel(n.status)],
    };
  }).filter((p) => p.score > 0);

  // ---- 4. 建议问题 ----
  const questionItems: RecommendItem[] = tutorSuggestions.map((q, i) => {
    const score = scoreText(q, keywords) * 3;
    return {
      id: `q-${i}`,
      type: 'question' as const,
      title: q,
      summary: '向答疑智能体提问',
      score,
      link: '/tutor',
      meta: '智能答疑',
      icon: 'MessageCircleQuestion',
    };
  }).filter((q) => q.score > 0);

  // 排序并取 Top N
  const sortDesc = (a: RecommendItem, b: RecommendItem) => b.score - a.score;
  knowledgeItems.sort(sortDesc);
  resourceItems.sort(sortDesc);
  pathItems.sort(sortDesc);
  questionItems.sort(sortDesc);

  return {
    knowledge: knowledgeItems.slice(0, 6),
    resources: resourceItems.slice(0, 6),
    paths: pathItems.slice(0, 5),
    questions: questionItems.slice(0, 4),
    total: knowledgeItems.length + resourceItems.length + pathItems.length + questionItems.length,
  };
}

// 工具函数
function resourceIcon(type: string): string {
  const map: Record<string, string> = {
    doc: 'FileText', mindmap: 'GitBranch', quiz: 'ListChecks',
    reading: 'BookOpen', code: 'Code2',
  };
  return map[type] || 'FileText';
}

function statusLabel(status: PathNode['status']): string {
  return { done: '已掌握', current: '学习中', todo: '未开始', review: '需复习' }[status];
}

// 智能推荐一句话（基于输入生成引导语）
export function suggestPrompt(input: string, result: RecommendResult): string {
  if (result.total === 0) {
    return `暂未找到与「${input}」直接匹配的内容，试试更换关键词，如「深度学习」「Transformer」「A* 算法」`;
  }
  const parts: string[] = [];
  if (result.knowledge.length) parts.push(`${result.knowledge.length} 个知识点`);
  if (result.resources.length) parts.push(`${result.resources.length} 项学习资源`);
  if (result.paths.length) parts.push(`${result.paths.length} 个路径节点`);
  if (result.questions.length) parts.push(`${result.questions.length} 个相关问题`);
  return `为你找到 ${parts.join('、')}，点击卡片即可开始学习`;
}
