// 智学伴 EduMind - 学生画像特征抽取引擎
// 从自然语言对话中自动抽取特征，映射到 8 维画像并增量更新

import type { Profile } from '@/data/mockData';

// 抽取到的单个特征
export interface DetectedFeature {
  dimension: keyof Profile;
  label: string;        // 维度中文名
  keyword: string;      // 命中的关键词
  value: string;        // 抽取到的值描述
  score: number;        // 增量分数
}

export interface ExtractResult {
  delta: Partial<Profile>;              // 要更新的画像增量
  features: DetectedFeature[];          // 检测到的所有特征
  summary: string;                      // 抽取摘要（展示给用户）
}

// 维度中文名
export const dimLabels: Record<keyof Profile, string> = {
  knowledgeBase: '知识基础',
  cognitiveStyle: '认知风格',
  learningGoal: '学习目标',
  errorPattern: '易错点偏好',
  learningPace: '学习节奏',
  interest: '兴趣方向',
  background: '专业背景',
  history: '学习历史',
};

// 关键词规则表：[关键词, 增量分数, 值描述]
type Rule = { keywords: string[]; score: number; value: string };

const rules: Record<keyof Profile, Rule[]> = {
  // 专业背景
  background: [
    { keywords: ['计算机', '软件工程', '计科'], score: 12, value: '计算机相关专业' },
    { keywords: ['电子', '通信', '自动化', '电气'], score: 10, value: '工科相关' },
    { keywords: ['数学', '统计', '应用数学'], score: 14, value: '数学相关专业（基础扎实）' },
    { keywords: ['物理', '力学'], score: 8, value: '理科相关' },
    { keywords: ['文科', '管理', '经济', '语言'], score: -5, value: '非理工背景（需补基础）' },
    { keywords: ['大一', '本科一年级'], score: 5, value: '大一学生' },
    { keywords: ['大二', '本科二年级'], score: 8, value: '大二学生' },
    { keywords: ['大三', '本科三年级'], score: 10, value: '大三学生' },
    { keywords: ['大四', '本科四年级'], score: 10, value: '大四学生' },
    { keywords: ['研一', '研究生一年级'], score: 12, value: '研一学生' },
    { keywords: ['研二', '研三', '博士'], score: 14, value: '研究生及以上' },
  ],
  // 学习目标
  learningGoal: [
    { keywords: ['考研', '保研', '读研'], score: 12, value: '目标考研' },
    { keywords: ['就业', '找工作', '秋招', '春招', '实习'], score: 10, value: '目标就业' },
    { keywords: ['科研', '论文', '发paper', '顶会'], score: 14, value: '目标科研' },
    { keywords: ['竞赛', 'kaggle', '天池', '蓝桥'], score: 10, value: '目标竞赛' },
    { keywords: ['兴趣', '爱好', '好奇', '了解一下'], score: 8, value: '兴趣驱动' },
    { keywords: ['转行', '转专业', '跨考'], score: 8, value: '跨专业学习' },
  ],
  // 知识基础
  knowledgeBase: [
    { keywords: ['数学好', '数学扎实', '数学基础好', '线代好', '概率论好'], score: 12, value: '数学基础扎实' },
    { keywords: ['数学差', '数学不好', '数学弱', '怕数学'], score: -8, value: '数学基础薄弱' },
    { keywords: ['编程熟', '代码好', 'python熟', '编程能力强'], score: 12, value: '编程能力较强' },
    { keywords: ['编程差', '不会编程', '代码弱', '没写过代码'], score: -10, value: '编程基础薄弱' },
    { keywords: ['学过线代', '学过线性代数', '学过矩阵'], score: 8, value: '已学线性代数' },
    { keywords: ['学过概率', '学过概率论', '学过统计'], score: 8, value: '已学概率统计' },
    { keywords: ['学过微积分', '学过高数', '学过 calculus'], score: 6, value: '已学微积分' },
    { keywords: ['学过python', '会python', '学过编程'], score: 8, value: '已学编程基础' },
    { keywords: ['零基础', '没基础', '小白', '完全不懂'], score: -12, value: '零基础入门' },
    { keywords: ['有基础', '学过一些', '了解一点'], score: 5, value: '有一定基础' },
  ],
  // 认知风格
  cognitiveStyle: [
    { keywords: ['喜欢看视频', '看视频学', '视频教程', '听课'], score: 10, value: '视觉/听觉型（偏好视频）' },
    { keywords: ['喜欢看书', '看文档', '阅读', '看书学'], score: 10, value: '阅读型（偏好文档）' },
    { keywords: ['喜欢动手', '写代码', '实操', '实践', '做项目'], score: 12, value: '动手型（偏好实践）' },
    { keywords: ['喜欢推导', '推导公式', '理论推导', '数学证明'], score: 10, value: '逻辑推导型' },
    { keywords: ['喜欢图解', '可视化', '图表', '思维导图'], score: 8, value: '视觉图表型' },
    { keywords: ['喜欢系统', '系统学', '从头到尾', '循序渐进'], score: 6, value: '系统型学习' },
    { keywords: ['跳跃', '碎片', '按需', '用到再学'], score: -4, value: '碎片型学习' },
  ],
  // 易错点偏好
  errorPattern: [
    { keywords: ['粗心', '马虎', '计算错误', '看错'], score: 8, value: '易粗心计算错误' },
    { keywords: ['概念混淆', '搞混', '分不清'], score: 10, value: '概念易混淆' },
    { keywords: ['公式记不住', '记不住公式', '背不下来'], score: 8, value: '公式记忆困难' },
    { keywords: ['代码bug', '报错', '调试', 'debug'], score: 8, value: '代码易出错' },
    { keywords: ['理解慢', '看不懂', '难以理解'], score: 6, value: '概念理解偏慢' },
    { keywords: ['应用差', '不会用', '不会做题'], score: 8, value: '知识应用薄弱' },
  ],
  // 学习节奏
  learningPace: [
    { keywords: ['每天', '每天学', '坚持'], score: 10, value: '高频学习' },
    { keywords: ['周末', '周六', '周日'], score: 6, value: '周末集中学习' },
    { keywords: ['碎片', '通勤', '午休'], score: 4, value: '碎片时间学习' },
    { keywords: ['两小时', '2小时', '一小时', '1小时'], score: 8, value: '单次1-2小时' },
    { keywords: ['半小时', '30分钟'], score: 4, value: '单次短时' },
    { keywords: ['三小时', '3小时', '四小时', '4小时'], score: 10, value: '单次长时深度' },
    { keywords: ['学得快', '吸收快', '一遍就懂'], score: 8, value: '吸收速度快' },
    { keywords: ['学得慢', '需要反复', '要看几遍'], score: -4, value: '吸收速度偏慢' },
  ],
  // 兴趣方向
  interest: [
    { keywords: ['cv', '计算机视觉', '图像', '目标检测', '图像识别'], score: 12, value: '兴趣：计算机视觉' },
    { keywords: ['nlp', '自然语言', '文本', '语言模型', '对话'], score: 12, value: '兴趣：自然语言处理' },
    { keywords: ['强化学习', 'rl', '智能体', 'agent', '游戏ai'], score: 12, value: '兴趣：强化学习' },
    { keywords: ['大模型', 'llm', 'gpt', '大语言模型', 'transformer'], score: 12, value: '兴趣：大语言模型' },
    { keywords: ['机器人', '具身', '控制'], score: 10, value: '兴趣：智能机器人' },
    { keywords: ['知识图谱', 'kg', '推理'], score: 10, value: '兴趣：知识表示与推理' },
    { keywords: ['搜索', '规划', 'a星', '路径规划'], score: 8, value: '兴趣：搜索与规划' },
    { keywords: ['系统', '部署', '工程', 'mlops'], score: 8, value: '兴趣：AI工程' },
  ],
  // 学习历史
  history: [
    { keywords: ['学过机器学习', '学过ml', '看过吴恩达'], score: 10, value: '已学机器学习' },
    { keywords: ['学过深度学习', '学过dl', '看过李沐'], score: 10, value: '已学深度学习' },
    { keywords: ['学过神经网络', '学过cnn', '学过rnn'], score: 8, value: '已学神经网络' },
    { keywords: ['学过数据结构', '学过算法', '刷过题'], score: 8, value: '已学数据结构与算法' },
    { keywords: ['学过ai导论', '学过人工智能', '上过ai课'], score: 10, value: '已学AI导论' },
    { keywords: ['用过pytorch', '用过tensorflow', '用过框架'], score: 8, value: '已用深度学习框架' },
    { keywords: ['做过项目', '写过系统', '打过比赛'], score: 8, value: '有实践项目经验' },
  ],
};

// 主抽取函数
export function extractFeatures(text: string, currentProfile: Profile): ExtractResult {
  const lower = text.toLowerCase();
  const features: DetectedFeature[] = [];
  const delta: Partial<Profile> = {};

  for (const dim of Object.keys(rules) as (keyof Profile)[]) {
    for (const rule of rules[dim]) {
      for (const kw of rule.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          // 同一维度同一关键词只记一次
          if (!features.some((f) => f.dimension === dim && f.keyword === kw)) {
            features.push({
              dimension: dim,
              label: dimLabels[dim],
              keyword: kw,
              value: rule.value,
              score: rule.score,
            });
            // 累加增量（同维度多个特征累加，但有上限）
            delta[dim] = Math.min(95, (delta[dim] ?? currentProfile[dim]) + rule.score);
          }
          break; // 同一规则命中一次即可
        }
      }
    }
  }

  // 生成摘要
  let summary: string;
  if (features.length === 0) {
    summary = '暂未从这段对话中识别到明确的画像特征，可以告诉我你的专业、学习目标、数学/编程基础、喜欢的学习方式等。';
  } else {
    const grouped = new Map<keyof Profile, DetectedFeature[]>();
    features.forEach((f) => {
      if (!grouped.has(f.dimension)) grouped.set(f.dimension, []);
      grouped.get(f.dimension)!.push(f);
    });
    const parts = Array.from(grouped.entries()).map(([dim, feats]) => {
      const vals = feats.map((f) => f.value).join('、');
      return `**${dimLabels[dim]}**：${vals}`;
    });
    summary = `从对话中抽取到 ${features.length} 个特征：\n\n${parts.join('；')}。\n\n画像已据此动态更新。`;
  }

  return { delta, features, summary };
}

// 智能回复生成（基于抽取结果）
export function generateProfileReply(text: string, result: ExtractResult, round: number): string {
  if (result.features.length === 0) {
    // 引导用户补充信息
    const guides = [
      '感谢分享！为了更精准地构建画像，能告诉我你的**专业和年级**吗？',
      '了解了。你的**学习目标**是什么呢？比如考研、就业还是科研？',
      '好的。你觉得自己的**数学和编程基础**怎么样？学过哪些前置课程？',
      '明白了。你平时喜欢**怎么学习**？看视频、看书还是动手写代码？',
      '收到。最后想了解下你的**兴趣方向**——CV、NLP、强化学习还是大模型？',
    ];
    return guides[Math.min(round, guides.length - 1)];
  }

  // 有特征时的回复
  const featureList = result.features.slice(0, 4).map((f) => `- **${f.label}**：${f.value}（${f.score > 0 ? '+' : ''}${f.score}）`).join('\n');
  const followUps = [
    '还有什么想补充的吗？比如你的**学习目标**或**兴趣方向**？',
    '了解了！能再说说你的**数学和编程基础**吗？',
    '好的，画像正在完善。你平时**喜欢怎么学习**？视频、文档还是动手实践？',
    '收到！有没有觉得自己**容易在哪类问题上出错**？',
    '很好，画像已比较完整。你可以随时开始学习，画像会随你的学习行为持续更新。',
  ];
  return `${result.summary}\n\n已识别特征：\n${featureList}\n\n${followUps[Math.min(round, followUps.length - 1)]}`;
}
