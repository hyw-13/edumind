// 多智能体协作工作流定义
// 定义每种资源类型由哪些智能体、按什么顺序协作生成

import type { ResourceType } from '@/data/mockData';

// 单个协作步骤
export interface WorkflowStep {
  agentId: string;        // 执行智能体 ID
  agentName: string;      // 智能体名称
  action: string;         // 动作标题
  detail: string;         // 详细说明（展示给用户）
  output: string;         // 本步骤产出
  duration: number;       // 动画时长 ms
  tools?: string[];       // 使用的工具/技术
}

// 资源生成工作流
export interface AgentWorkflow {
  type: ResourceType;
  title: string;          // 资源类型名
  icon: string;           // 图标
  desc: string;           // 资源类型说明
  steps: WorkflowStep[];  // 协作步骤
}

// 智能体能力描述
export interface AgentCapability {
  id: string;
  name: string;
  role: string;           // 角色定位
  icon: string;
  capabilities: string[]; // 能力列表
  tools: string[];        // 使用的工具/技术
  models: string[];       // 使用的大模型
  color: string;          // 主题色
}

// 8 大智能体能力详情
export const agentCapabilities: AgentCapability[] = [
  {
    id: 'orchestrator',
    name: '总协调智能体',
    role: '任务拆解与全局调度',
    icon: 'Network',
    capabilities: ['需求理解与任务拆解', '智能体调度与并行编排', '质量门禁与结果聚合', '冲突检测与重试策略'],
    tools: ['LangGraph', '状态图引擎', '消息队列'],
    models: ['讯飞星火 4.0 Ultra'],
    color: 'teal',
  },
  {
    id: 'profile',
    name: '画像构建智能体',
    role: '学生特征抽取与画像维护',
    icon: 'UserSearch',
    capabilities: ['自然语言特征抽取', '8 维画像动态更新', '学习风格识别', '知识短板诊断'],
    tools: ['特征抽取引擎', '画像向量库'],
    models: ['讯飞星火 4.0 Ultra'],
    color: 'amber',
  },
  {
    id: 'doc',
    name: '文档生成智能体',
    role: '课程讲解与拓展阅读',
    icon: 'FileText',
    capabilities: ['RAG 知识检索', '讲解文档生成', '拓展阅读精选', '多难度分级撰写'],
    tools: ['RAG 检索', '知识库向量索引', 'Markdown 渲染'],
    models: ['讯飞星火 4.0 Ultra'],
    color: 'teal',
  },
  {
    id: 'mindmap',
    name: '思维导图智能体',
    role: '知识结构可视化',
    icon: 'GitBranch',
    capabilities: ['知识 DAG 构建', '概念关联分析', '层级结构优化', 'Mermaid 图生成'],
    tools: ['知识图谱引擎', 'Mermaid 语法'],
    models: ['讯飞星火 4.0 Ultra'],
    color: 'rose',
  },
  {
    id: 'quiz',
    name: '题库生成智能体',
    role: '多题型练习与评估',
    icon: 'ListChecks',
    capabilities: ['多题型自动生成', '难度梯度控制', '易错点针对性出题', '答案与解析生成'],
    tools: ['题型模板库', '难度评估模型'],
    models: ['讯飞星火 4.0 Ultra'],
    color: 'amber',
  },
  {
    id: 'code',
    name: '代码案例智能体',
    role: '实操案例与项目',
    icon: 'Code2',
    capabilities: ['可执行代码编写', 'Jupyter Notebook 生成', '代码注释与讲解', '运行结果模拟'],
    tools: ['代码沙箱', 'Jupyter 内核', 'Python/PyTorch'],
    models: ['讯飞星火 4.0 Ultra', 'CodeGeeX'],
    color: 'teal',
  },
  {
    id: 'path',
    name: '路径规划智能体',
    role: '动态学习路径',
    icon: 'Route',
    capabilities: ['知识前置依赖分析', '个性化路径生成', '动态节点插入', '学习节奏调控'],
    tools: ['拓扑排序', '知识图谱', '画像匹配'],
    models: ['讯飞星火 4.0 Ultra'],
    color: 'amber',
  },
  {
    id: 'tutor',
    name: '答疑智能体',
    role: '即时多模态答疑',
    icon: 'MessageCircleQuestion',
    capabilities: ['自然语言问答', '代码/公式渲染', '上下文记忆', '追问引导'],
    tools: ['RAG 检索', '多轮对话管理'],
    models: ['讯飞星火 4.0 Ultra'],
    color: 'teal',
  },
];

// 5 种资源类型的协作工作流
export const workflows: AgentWorkflow[] = [
  {
    type: 'doc',
    title: '专业课程讲解文档',
    icon: 'FileText',
    desc: '基于知识库 RAG 检索 + 学生画像，生成个性化深度的讲解文档',
    steps: [
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '接收需求并拆解任务',
        detail: '解析学生请求，识别主题「{topic}」，拆解为 4 个子任务分发至各智能体',
        output: '任务编排计划', duration: 800,
        tools: ['LangGraph 状态图'],
      },
      {
        agentId: 'profile', agentName: '画像构建智能体',
        action: '查询学生画像，确定讲解深度',
        detail: '读取 8 维画像：知识基础 {kb}/100，认知风格 {style}，据此确定讲解深度与术语密度',
        output: '个性化讲解策略', duration: 1000,
        tools: ['画像向量库'],
      },
      {
        agentId: 'doc', agentName: '文档生成智能体',
        action: 'RAG 检索知识库并生成讲解文档',
        detail: '检索「{topic}」相关知识点 12 条，结合讲解策略生成 Markdown 文档（含公式、示例、对比表）',
        output: '讲解文档初稿', duration: 1600,
        tools: ['RAG 检索', '讯飞星火 4.0 Ultra'],
      },
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '质量校验与资源入库',
        detail: '校验知识点覆盖度 95%、术语准确性 98%、与画像匹配度 92%，通过后推送至资源中心',
        output: '✓ 讲解文档已生成', duration: 700,
        tools: ['质量门禁'],
      },
    ],
  },
  {
    type: 'mindmap',
    title: '知识点思维导图',
    icon: 'GitBranch',
    desc: '构建知识 DAG，可视化概念关联与层级结构',
    steps: [
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '接收需求并拆解任务',
        detail: '识别主题「{topic}」，调度思维导图智能体构建知识结构',
        output: '任务编排计划', duration: 700,
        tools: ['LangGraph'],
      },
      {
        agentId: 'profile', agentName: '画像构建智能体',
        action: '匹配认知风格',
        detail: '检测学生偏好{style}，调整导图详细度与配色方案',
        output: '导图风格策略', duration: 900,
      },
      {
        agentId: 'mindmap', agentName: '思维导图智能体',
        action: '构建知识 DAG 与概念关联',
        detail: '解析「{topic}」知识点，提取 8 个核心节点 + 15 条关联边，生成层级 DAG',
        output: '思维导图结构', duration: 1400,
        tools: ['知识图谱引擎', 'Mermaid'],
      },
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '结构完整性校验',
        detail: '校验 DAG 无环、节点覆盖完整、关联合理，通过后入库',
        output: '✓ 思维导图已生成', duration: 600,
      },
    ],
  },
  {
    type: 'quiz',
    title: '不同类型练习题目',
    icon: 'ListChecks',
    desc: '基于易错点画像，生成多题型、多难度梯度的练习题库',
    steps: [
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '接收需求并拆解任务',
        detail: '识别主题「{topic}」，调度题库智能体生成练习',
        output: '任务编排计划', duration: 700,
      },
      {
        agentId: 'profile', agentName: '画像构建智能体',
        action: '识别易错点与知识短板',
        detail: '分析画像：易错点偏好 {err}/100，知识基础 {kb}/100，定位薄弱环节',
        output: '出题策略（侧重易错点）', duration: 900,
      },
      {
        agentId: 'quiz', agentName: '题库生成智能体',
        action: '生成多题型练习题',
        detail: '生成 10 道题：4 道单选 + 3 道多选 + 3 道判断，含答案与解析，难度梯度 入门→进阶→高阶',
        output: '题库初稿（10 题）', duration: 1500,
        tools: ['题型模板', '讯飞星火 4.0 Ultra'],
      },
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '难度与区分度校验',
        detail: '校验题目难度分布合理、答案无歧义、解析准确，通过后入库',
        output: '✓ 题库已生成（10 题）', duration: 600,
      },
    ],
  },
  {
    type: 'code',
    title: '代码类实操案例',
    icon: 'Code2',
    desc: '编写可执行的 Jupyter Notebook，含注释、讲解与运行结果',
    steps: [
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '接收需求并拆解任务',
        detail: '识别主题「{topic}」，调度代码智能体编写实操案例',
        output: '任务编排计划', duration: 700,
      },
      {
        agentId: 'profile', agentName: '画像构建智能体',
        action: '评估编程基础',
        detail: '读取画像：编程能力 {kb}/100，调整代码注释详细度与复杂度',
        output: '代码风格策略', duration: 900,
      },
      {
        agentId: 'code', agentName: '代码案例智能体',
        action: '编写可执行 Notebook',
        detail: '编写「{topic}」完整实现，含 Markdown 讲解 cell + 代码 cell + 模拟运行结果',
        output: 'Jupyter Notebook', duration: 1800,
        tools: ['代码沙箱', 'PyTorch', 'CodeGeeX'],
      },
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '可执行性校验',
        detail: '沙箱运行测试通过，无语法错误，输出符合预期，入库',
        output: '✓ 代码案例已生成', duration: 700,
      },
    ],
  },
  {
    type: 'reading',
    title: '拓展阅读材料',
    icon: 'BookOpen',
    desc: '基于兴趣方向精选论文、博客与参考资料',
    steps: [
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '接收需求并拆解任务',
        detail: '识别主题「{topic}」，调度文档智能体精选阅读材料',
        output: '任务编排计划', duration: 700,
      },
      {
        agentId: 'profile', agentName: '画像构建智能体',
        action: '匹配兴趣方向',
        detail: '读取画像：兴趣方向 {interest}，精选相关方向的论文与资料',
        output: '阅读推荐策略', duration: 900,
      },
      {
        agentId: 'doc', agentName: '文档生成智能体',
        action: '精选并整理拓展阅读',
        detail: '检索 3 篇经典论文 + 2 篇技术博客，生成摘要与阅读建议',
        output: '拓展阅读合集', duration: 1300,
        tools: ['RAG 检索', '论文库'],
      },
      {
        agentId: 'orchestrator', agentName: '总协调智能体',
        action: '相关性校验',
        detail: '校验资料与主题相关度 ≥ 90%，阅读难度匹配画像，入库',
        output: '✓ 拓展阅读已生成', duration: 600,
      },
    ],
  },
];

// 根据资源类型获取工作流
export function getWorkflow(type: ResourceType): AgentWorkflow | undefined {
  return workflows.find((w) => w.type === type);
}

// 获取参与某工作流的所有智能体 ID
export function getParticipatingAgents(type: ResourceType): string[] {
  const wf = getWorkflow(type);
  if (!wf) return [];
  return [...new Set(wf.steps.map((s) => s.agentId))];
}
