# 智学伴 EduMind

基于多智能体协同的 AI 学习平台，以《人工智能导论》课程为核心，构建 **10 章 69 个知识点**的结构化知识体系，提供 **35 项学习资源**、个性化学习路径规划、多智能体协作资源生成、智能答疑、学习报告等全流程学习支持。

> 在线演示：https://hyw-13.github.io/edumind/

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.3 |
| 开发语言 | TypeScript | 5.8 |
| 构建工具 | Vite | 6.3 |
| 路由 | react-router-dom | 7.3 |
| 状态管理 | Zustand | 5.0 |
| 样式方案 | Tailwind CSS | 3.4 |
| 图标库 | lucide-react | 0.511 |
| 类名工具 | clsx + tailwind-merge | - |

---

## 环境要求

- **Node.js** >= 18.0
- **npm** >= 9.0（或 pnpm / yarn）
- 浏览器：Chrome 90+ / Edge 90+ / Firefox 90+

---

## 安装与运行

### 默认安装

```bash
# 1. 克隆仓库
git clone https://github.com/hyw-13/edumind.git
cd edumind

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:5173/` 即可使用。

### 构建生产版本

```bash
npm run build       # 输出到 dist/
npm run preview     # 预览构建产物
```

---

## 八大功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 智能推荐 | `/` | 搜索资源 + 热门标签 + 今日推荐 + 继续学习 |
| 仪表盘 | `/dashboard` | 学习进度环形图、本周统计、学习趋势 |
| 多智能体 | `/agents` | 8 智能体状态总览 + 协作流程动画 |
| 知识库 | `/knowledge` | 10 章 69 知识点，结构化展示与 Markdown 详解 |
| 资源中心 | `/resources` | 35 项资源 + 多智能体协作生成 + 标记已学 |
| 学习路径 | `/path` | 16 节点 DAG 知识图谱 + 薄弱点检测与补救 |
| 智能答疑 | `/tutor` | 防幻觉 RAG 问答 + 资源卡片跳转 + 流式输出 |
| 学习报告 | `/report` | 掌握度/健康度/趋势/雷达图/资源统计 + 个性化建议 |

---

## 核心特性

### 多智能体协作生成
8 个专业智能体（总协调 / 画像 / 文档 / 思维导图 / 题库 / 代码 / 路径 / 答疑）按 4 步流程协作：任务拆解 → 画像匹配 → RAG 检索生成 → 质量校验。支持 5 类资源（文档 / 思维导图 / 题库 / 代码 / 阅读清单）的协作生成，生成题目在答题前隐藏答案与解析，答题后逐题展示。

### 思维导图完整展示
所有思维导图节点（root / branch / leaf）均支持点击查看完整内容，弹窗显示节点完整文本。`sanitize` 函数清理 Markdown 加粗 / 斜体 / 代码标记，避免 `**` 等标记残留。命中知识库的思维导图基于知识点 `detail` 自动提取"定义 / 原理 / 应用 / 对比 / 小结"5 大段填充真实分支内容。

### 防幻觉 RAG 智能答疑
三层过滤：精确匹配预设答案 → 知识库 RAG 检索（TF-IDF + 同义词扩展 + 中文 bigram/trigram 分词）→ 超范围致歉。推荐资源以可点击卡片形式展示，点击直接跳转资源中心对应资源（内部路由），不再跳转外部网页。

### 学习健康度动态计算
24 小时学习项数自动重置：归零时健康度回归基线 **60**；<10 项时随学习数增长（每项 +3，上限 +30）；>10 项时下降（超过部分每项 -5，最低 10）。叠加活跃天数加成（每天 +3，上限 +15）与答题加成（每次 +2，上限 +10），最终值限制在 [10, 99] 区间。

### 个性化推荐
推荐引擎基于同义词扩展词典（覆盖 30+ 主题）+ 中文细粒度分词 + TF-IDF 长度归一化，从知识库 / 资源 / 路径节点 / 建议问题 4 个维度返回 Top N 推荐，避免长文本随机命中堆砌虚高分数。

---

## 典型使用流程

### 流程 1：首次画像构建

```
打开首页 → 输入个人信息（专业、年级、学习方向）
        ↓
画像构建智能体抽取特征 → 8 维画像自动更新
        ↓
推荐引擎基于画像推送个性化资源
        ↓
点击资源 → 查看详情 → 标记已学 → 仪表盘数据联动
```

### 流程 2：薄弱点补救

```
学习路径页 → 检测到掌握度 < 60% 的节点
        ↓
顶部 amber 警告横幅提示薄弱环节
        ↓
点击「接受调整」→ 自动跳转对应资源
        ↓
学习并标记已学 → 掌握度 +4、完成率 +4%
```

### 流程 3：多智能体协作生成

```
资源中心 → 点击「协作生成」→ 选择资源类型
        ↓
4 步协作流程动画：
  ① 总协调智能体：任务拆解
  ② 画像构建智能体：确定深度
  ③ 专业智能体：RAG 检索 + 内容生成
  ④ 总协调智能体：质量校验入库
        ↓
展示生成结果（文档 / 思维导图 / 题库 / 代码 / 阅读清单）
```

### 流程 4：智能答疑

```
输入问题 → 防幻觉三层过滤
        ↓
  精确匹配 → 预设答案
  有效问题 → 知识库检索 + 通用解析模板
  无效问题 → 致歉回复 + 引导
        ↓
推荐资源卡片 → 点击跳转资源中心对应资源
```

---

## 项目结构

```
EduMind/
├── src/
│   ├── components/          # 通用组件
│   │   ├── Layout.tsx             # 全局布局
│   │   ├── ProgressRing.tsx       # SVG 环形进度
│   │   ├── LineChart.tsx          # SVG 折线图
│   │   ├── RadarChart.tsx         # SVG 雷达图
│   │   ├── MermaidMindmap.tsx     # 思维导图渲染器
│   │   ├── MarkdownRenderer.tsx   # Markdown 渲染
│   │   ├── StudentInfoEditor.tsx  # 个人信息编辑弹窗
│   │   └── Icon.tsx               # 图标入口
│   ├── pages/               # 8 大功能页面
│   │   ├── Discover.tsx           # 智能推荐
│   │   ├── Dashboard.tsx          # 仪表盘
│   │   ├── Agents.tsx             # 多智能体
│   │   ├── Knowledge.tsx          # 知识库
│   │   ├── Resources.tsx          # 资源中心
│   │   ├── LearningPath.tsx       # 学习路径
│   │   ├── Tutor.tsx              # 智能答疑
│   │   └── Report.tsx             # 学习报告
│   ├── store/               # Zustand 状态管理
│   │   ├── useStore.ts            # 画像 + 更新历史 + 已学记录
│   │   ├── useStudentStore.ts     # 学生信息（localStorage 持久化）
│   │   └── useTutorStore.ts       # 答疑对话
│   ├── data/                # 数据层
│   │   ├── mockData.ts            # 资源/智能体/推荐/报告数据
│   │   ├── knowledgeBase.ts       # 10 章 69 知识点
│   │   └── agentWorkflows.ts      # 智能体能力 + 协作工作流
│   ├── lib/                 # 工具库
│   │   ├── profileExtractor.ts    # 画像特征抽取引擎
│   │   ├── generateMockContent.ts # 协作生成内容模板
│   │   ├── recommender.ts         # 推荐算法
│   │   ├── studyStats.ts          # 学习数据聚合统计（健康度/掌握度/趋势）
│   │   └── utils.ts               # cn() 类名合并
│   ├── index.css            # 全局样式 + Tailwind
│   ├── App.tsx              # 路由配置
│   └── main.tsx             # 入口
├── tailwind.config.js       # 设计令牌扩展
├── vite.config.ts           # 构建配置
└── package.json
```

---

## 部署到 GitHub Pages

项目已配置 GitHub Actions 自动部署，推送代码即自动构建部署。

1. 在 GitHub 创建仓库（不要勾选 README/.gitignore）
2. 推送代码：
   ```bash
   git remote add origin https://github.com/用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**
4. 等待约 1-2 分钟，访问 `https://用户名.github.io/仓库名/`

---

## 详细设计文档

更多技术细节（界面设计、数据库设计、智能体设计、知识库设计、大模型设计）请参阅 [详细设计文档](.trae/documents/DetailedDesign.md)。
