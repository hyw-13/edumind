// 智学伴 EduMind - 智能推荐引擎
// 根据用户输入文本，从知识库/资源/路径节点中匹配相关学习资料

import { knowledgeBase, type KnowledgePoint } from '@/data/knowledgeBase';
import { resources, pathNodes, tutorSuggestions, type Resource, type PathNode } from '@/data/mockData';
import { useStore } from '@/store/useStore';

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
  // —— 同义词词典扩充 ——
  '扩散模型': ['DDPM', '去噪', '采样', 'Score', 'SDE'],
  '多模态': ['CLIP', '视觉语言', 'VLM', 'GPT-4V', '具身'],
  'AlphaFold': ['蛋白质', '结构预测', '生物信息'],
  '具身智能': ['机器人', 'VLA', 'RT-2', '仿真'],
};

// 热门快捷主题
export const hotTopics = [
  '深度学习', 'Transformer 自注意力', 'A* 搜索算法', '决策树',
  '大语言模型', '神经网络反向传播', '知识图谱', 'AI 发展历史',
  '强化学习', '计算机视觉 CNN', '智能体', 'AI 伦理与对齐',
];

// 停用词
const stopWords = new Set(['的', '了', '是', '在', '我', '想', '要', '学', '学习', '了解', '关于', '什么', '怎么', '如何', '请', '帮', '推荐']);

// 判断是否为中文字符
function isChinese(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0x4e00 && code <= 0x9fff;
}

// 中文分词（简易：按空格 + 词典最长匹配 + 2-3 字子串细粒度抽取）
function tokenize(input: string): string[] {
  const cleaned = input.trim().toLowerCase();
  if (!cleaned) return [];
  // 按空格、标点分割
  const parts = cleaned.split(/[\s,，。.?？!！、;；:：/]+/).filter(Boolean);
  // 扩展同义词 + 子串
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
      // 中文细粒度分词：对长度 >=3 的中文片段，提取 2-3 字子串作为候选词
      const chineseChars = p.split('').filter(isChinese);
      if (chineseChars.length >= 3) {
        // 2 字子串（bigram）
        for (let i = 0; i < chineseChars.length - 1; i++) {
          const bigram = chineseChars[i] + chineseChars[i + 1];
          if (!stopWords.has(bigram)) expanded.add(bigram);
        }
        // 3 字子串（trigram）
        for (let i = 0; i < chineseChars.length - 2; i++) {
          const trigram = chineseChars[i] + chineseChars[i + 1] + chineseChars[i + 2];
          if (!stopWords.has(trigram)) expanded.add(trigram);
        }
      }
    }
  }
  return Array.from(expanded);
}

// 计算文本中包含关键词的得分（含 TF-IDF 式长度归一化）
// isLongText=true 时对弱匹配（包含/被包含）降权，并对超长文本做长度衰减，
// 避免冗长 detail 中随机命中堆砌出虚高分数。
function scoreText(text: string, keywords: string[], isLongText = false): number {
  const lower = text.toLowerCase();
  const textLen = lower.length;
  let score = 0;
  for (const kw of keywords) {
    if (!kw) continue;
    if (lower === kw) {
      score += 15;           // 完全匹配（最强信号）
    } else if (lower.includes(kw)) {
      // 包含匹配：长文本中降权（随机命中概率高）
      score += isLongText ? 3 : 6;
    } else if (kw.includes(lower)) {
      // 被包含匹配：长文本中进一步降权
      score += isLongText ? 1 : 2;
    }
  }
  // TF-IDF 长度归一化：超长文本按长度衰减
  if (isLongText && textLen > 200) {
    score = score * (200 / textLen);
  }
  return score;
}

// 计算单个候选项的综合得分
// fields 与 weights 一一对应；isLongFlags 标记该字段是否为长文本（detail 等）
function calcScore(fields: string[], keywords: string[], weights: number[], isLongFlags?: boolean[]): number {
  let total = 0;
  fields.forEach((f, i) => {
    const isLong = isLongFlags?.[i] ?? false;
    total += scoreText(f, keywords, isLong) * weights[i];
  });
  return total;
}

// 学习路径节点 → 关联学习资源映射（与 LearningPath 保持一致，用于动态掌握度计算）
const nodeRelatedResources: Record<string, string[]> = {
  n1:  [],
  n2:  [],
  n3:  ['res1'],
  n4:  ['res2', 'res12', 'res15'],
  n5:  ['res30'],
  n6:  ['res16'],
  n7:  ['res3', 'res17'],
  n8:  ['res7'],
  n9:  ['res13', 'res19', 'res22'],
  n10: ['res5'],
  n11: ['res14', 'res29'],
  n12: ['res21'],
  n13: ['res6', 'res24', 'res25'],
  n14: ['res8'],
  n15: ['res9'],
  n16: ['res11', 'res27'],
};

// 基于已学资源动态计算节点掌握度与状态（与 LearningPath 同算法）
// 取 pathNodes 的 mastery 为基础值，结合 store 中已学资源完成比例动态计算
function computeDynamicMastery(node: PathNode): { mastery: number; status: PathNode['status'] } {
  const related = nodeRelatedResources[node.id] || [];
  if (related.length === 0) {
    // 无关联资源（基础学科），保留原始掌握度
    return { mastery: node.mastery, status: node.status };
  }
  let learnedResourceIds: Set<string>;
  try {
    const state = useStore.getState();
    learnedResourceIds = new Set(state.learnedResources.map((r) => r.resourceId));
  } catch {
    learnedResourceIds = new Set();
  }
  const learnedCount = related.filter((rid) => learnedResourceIds.has(rid)).length;
  const learnedRatio = learnedCount / related.length; // 0 ~ 1
  // 动态掌握度 = 基础值 * 0.5 + 学习完成比例 * 50，上限 100
  const dynamicMastery = Math.min(100, Math.round(node.mastery * 0.5 + learnedRatio * 50));

  let status: PathNode['status'];
  if (dynamicMastery >= 70) {
    status = 'done';
  } else if (dynamicMastery >= 35) {
    status = 'current';
  } else if (learnedCount > 0) {
    status = 'review';
  } else {
    status = node.status === 'done' ? 'current' : node.status;
  }
  return { mastery: dynamicMastery, status };
}

// 匹配阈值：低于此分数的候选项将被过滤，剔除低分噪声匹配
const SCORE_THRESHOLD = 5;

// 主推荐函数
export function recommend(input: string): RecommendResult {
  const keywords = tokenize(input);
  const empty: RecommendResult = { knowledge: [], resources: [], paths: [], questions: [], total: 0 };
  if (keywords.length === 0) return empty;

  // ---- 1. 知识库知识点 ----
  // 权重设计（TF-IDF 思想）：标题最高，summary/keyTerms 次之，detail 长文本降权
  const knowledgeItems: RecommendItem[] = [];
  for (const ch of knowledgeBase) {
    for (const sec of ch.sections) {
      for (const pt of sec.points) {
        const fields = [pt.title, pt.summary, pt.detail, (pt.keyTerms || []).join(' '), `${ch.title} ${sec.title}`];
        const weights = [3, 2, 0.5, 2.5, 1];
        const isLongFlags = [false, false, true, false, false];
        let score = calcScore(fields, keywords, weights, isLongFlags);
        // 标题完全匹配额外加权（TF-IDF：标题是高信息量字段，强信号）
        const titleLower = pt.title.toLowerCase();
        for (const kw of keywords) {
          if (titleLower === kw) score += 10;
        }
        if (score > SCORE_THRESHOLD) {
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
    const isLongFlags = [false, false, true, false];
    const score = calcScore(fields, keywords, weights, isLongFlags);
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
  }).filter((r) => r.score > SCORE_THRESHOLD);

  // ---- 3. 路径节点 ----
  // 使用动态计算的实际掌握度（基于已学资源，与 LearningPath 同步）
  const pathItems: RecommendItem[] = pathNodes.map((n: PathNode) => {
    const fields = [n.label, n.chapter];
    const weights = [3, 2];
    const score = calcScore(fields, keywords, weights);
    const { mastery, status } = computeDynamicMastery(n);
    return {
      id: n.id,
      type: 'path' as const,
      title: n.label,
      summary: n.chapter,
      score,
      link: '/path',
      meta: `掌握度 ${mastery}% · ${statusLabel(status)}`,
      icon: 'Route',
      tags: [statusLabel(status)],
    };
  }).filter((p) => p.score > SCORE_THRESHOLD);

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
  }).filter((q) => q.score > SCORE_THRESHOLD);

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
