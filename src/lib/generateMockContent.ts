// 多智能体协作生成的内容生成器（模拟）
// 根据资源类型 + 主题 + 学生画像，生成结构化的演示内容
import type { ResourceType, Profile } from '@/data/mockData';
import { knowledgeBase, findKnowledgePoint, type KnowledgePoint } from '@/data/knowledgeBase';

const styleLabel = (p: Profile) => {
  const v = Math.round(p.cognitiveStyle / 25);
  return ['未确定', '视频型', '阅读型', '动手型', '推导型'][v] || '混合型';
};

// 根据主题从知识库中检索最相关的知识点（按标题/摘要/关键术语匹配）
// 用于在生成 doc/quiz 时用真实知识点内容替换模板，提升内容真实性
function findKnowledgePointByTopic(topic: string): KnowledgePoint | undefined {
  const t = topic.trim().toLowerCase();
  if (!t) return undefined;
  // 优先：标题完全匹配
  for (const ch of knowledgeBase) {
    for (const sec of ch.sections) {
      for (const pt of sec.points) {
        if (pt.title.toLowerCase() === t) return pt;
      }
    }
  }
  // 其次：标题包含匹配
  for (const ch of knowledgeBase) {
    for (const sec of ch.sections) {
      for (const pt of sec.points) {
        const title = pt.title.toLowerCase();
        if (title.includes(t) || t.includes(title)) return pt;
      }
    }
  }
  // 最后：关键术语 / 摘要包含匹配
  for (const ch of knowledgeBase) {
    for (const sec of ch.sections) {
      for (const pt of sec.points) {
        const terms = (pt.keyTerms || []).join(' ').toLowerCase();
        if (terms.includes(t) || pt.summary.toLowerCase().includes(t)) return pt;
      }
    }
  }
  return undefined;
}

// 截取知识点 detail 的前 N 字作为摘要
function detailSnippet(pt: KnowledgePoint, max = 800): string {
  if (!pt.detail) return '';
  return pt.detail.length > max ? pt.detail.slice(0, max) + '…' : pt.detail;
}

export function generateMockContent(
  type: ResourceType,
  topic: string,
  profile: Profile
): string {
  const kb = profile.knowledgeBase;
  const difficulty = kb >= 75 ? '高阶' : kb >= 50 ? '进阶' : '入门';
  const style = styleLabel(profile);

  switch (type) {
    case 'doc':
      return generateDoc(topic, difficulty, style, profile);
    case 'mindmap':
      return generateMindmap(topic, profile);
    case 'quiz':
      return generateQuiz(topic, difficulty, profile);
    case 'code':
      return generateCode(topic, difficulty, profile);
    case 'reading':
      return generateReading(topic, profile);
    default:
      return `# ${topic}\n\n生成内容。`;
  }
}

// ============ 讲解文档 ============
function generateDoc(topic: string, difficulty: string, style: string, profile: Profile): string {
  const kp = findKnowledgePointByTopic(topic);
  const header = `# ${topic} · 个性化讲解文档

> **生成参数**：难度 ${difficulty} · 认知风格 ${style} · 知识基础 ${profile.knowledgeBase}/100
> **生成智能体**：总协调 → 画像构建 → 文档生成 → 质量校验
${kp ? `\n> **数据来源**：课程知识库 · 已匹配真实知识点「${kp.title}」` : ''}

## 一、概念引入

`;

  // 命中知识库：用真实知识点内容替换模板
  if (kp) {
    const intro = `${kp.summary}

${difficulty === '入门' ? '本节将从直观示例入手，逐步建立概念。' : difficulty === '进阶' ? '本节假设你已具备基础概念，将聚焦于原理推导与对比分析。' : '本节将深入数学推导、工程优化与前沿进展。'}

## 二、核心内容

${detailSnippet(kp, 1200)}

## 三、关键术语

${(kp.keyTerms || []).map((t) => `- **${t}**`).join('\n') || '- 见正文核心定义'}

## 四、学习建议

基于你的画像（知识基础 ${profile.knowledgeBase}/100，易错点偏好 ${profile.errorPattern}/100）：
1. 先通读「概念引入」建立整体认知
2. 重点理解「核心内容」中的原理机制与典型应用
3. 结合代码案例验证理论，注意易错点

> 下一步：完成下方练习题，巩固 ${topic} 相关知识点。
`;
    return header + intro;
  }

  // 未命中知识库：回退到通用模板
  return header + `**${topic}** 是人工智能领域的核心知识点之一。理解 ${topic} 的关键在于把握其背后的动机、数学定义与工程实现。

${difficulty === '入门' ? '本节将从直观示例入手，逐步建立概念。' : difficulty === '进阶' ? '本节假设你已具备基础概念，将聚焦于原理推导与对比分析。' : '本节将深入数学推导、工程优化与前沿进展。'}

## 二、核心定义

${topic} 的形式化定义：

- **输入**：观测数据 $X$
- **输出**：预测/决策 $Y$
- **目标**：最小化损失 $\\mathcal{L}(\\theta)$

关键性质：
1. **可学习性**：模型能够从数据中归纳模式
2. **泛化性**：对未见过数据保持低误差
3. **可解释性**：决策过程可追溯（部分模型）

## 三、原理详解

### 1. 数学基础

设样本集 $D = \\{(x_i, y_i)\\}_{i=1}^n$，${topic} 的目标函数：

$$\\theta^* = \\arg\\min_\\theta \\frac{1}{n} \\sum_{i=1}^n \\ell(f_\\theta(x_i), y_i) + \\lambda \\Omega(\\theta)$$

其中 $\\Omega(\\theta)$ 为正则项，防止过拟合。

### 2. 算法流程

| 步骤 | 操作 | 输出 |
|------|------|------|
| 1 | 数据预处理 | 标准化样本 |
| 2 | 模型初始化 | 参数 $\\theta_0$ |
| 3 | 迭代优化 | 更新 $\\theta$ |
| 4 | 收敛判定 | 最终模型 |

### 3. 关键示例

以 ${topic} 的典型场景为例：

\`\`\`text
输入: 样本 (x, y)
模型预测: ŷ = f_θ(x)
误差: ℓ(ŷ, y) = (ŷ - y)²
梯度: ∇θ ℓ = 2(ŷ - y) · ∇θ f_θ(x)
更新: θ ← θ - η · ∇θ ℓ
\`\`\`

## 四、易错点提示

基于你的画像（易错点偏好 ${profile.errorPattern}/100），重点提醒：

- ❌ 混淆**训练误差**与**泛化误差**：前者低不代表后者低
- ❌ 忽视**正则化**：无正则项的模型极易过拟合
- ❌ **学习率**设置不当：过大震荡，过慢收敛

## 五、小结

${topic} 的核心是**通过数据学习规律**。掌握 ${topic} 需要：
1. 理解数学定义与目标函数
2. 熟悉优化算法（梯度下降族）
3. 关注泛化能力与正则化

> 下一步：完成下方练习题，巩固 ${topic} 相关知识点。
`;
}

// ============ 思维导图 ============
// 使用 ## 作为主分支，### 作为子分支，确保 MermaidMindmap 解析时层级完整不丢分支
// 命中知识库时基于 kp 的 summary/detail/keyTerms 生成真实分支内容，避免空泛模板
function generateMindmap(topic: string, profile: Profile): string {
  const kp = findKnowledgePointByTopic(topic);
  const terms = kp && kp.keyTerms && kp.keyTerms.length
    ? kp.keyTerms.map((t) => `- ${t}`).join('\n')
    : `- 核心概念\n- 关键定义\n- 典型应用`;

  // 未命中知识库：保留通用模板
  if (!kp) {
    return `# ${topic} 知识思维导图

## 1. 基础概念
- 定义与背景
- 核心术语
- 应用场景

## 2. 数学原理
### 形式化定义
- 目标函数
- 假设空间
### 优化方法
- 梯度下降
- 牛顿法
- 共轭梯度

## 3. 算法实现
- 数据预处理
- 模型构建
- 训练与评估

## 4. 对比分析
### 与相关方法对比
- 优势
- 劣势
### 适用场景
- 典型用例
- 局限条件

## 5. 关键转折点分析
- 历史里程碑
- 突破性工作
- 演进脉络
- 代表性成果

## 6. 关键术语
${terms}

## 7. 进阶主题
- 工程优化
- 前沿进展
- 开放问题

## 8. 学习路径建议
- 前置知识
- 推荐顺序
- 实践项目

> 知识图谱已生成：8 个核心分支 · 完整层级结构 · 层级深度 4
`;
  }

  // ===== 命中知识库：基于 kp 内容生成充实的思维导图 =====
  const detail = kp.detail || '';

  // 提取 detail 中 **标签**：内容 段落
  // 用 [^*] 避免跨段匹配，非贪婪到下一个 **xxx** 或段末
  const sections: { label: string; content: string }[] = [];
  const sectionRe = /\*\*([^*\n]{2,16})\*\*[：:]\s*([\s\S]*?)(?=\n\s*\*\*[^*\n]{2,16}\*\*[：:]|$)/g;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(detail)) !== null) {
    sections.push({ label: m[1].trim(), content: m[2].trim() });
  }

  // 从 content 中提取关键短语作为子节点
  const extractPhrases = (content: string, max = 5): string[] => {
    if (!content) return [];
    // 取第一段（在双换行前）
    const firstPara = content.split(/\n\n/)[0];
    // 移除列表符号、表格、Markdown 加粗等
    const clean = firstPara
      .replace(/^\s*[-+*]\s+/gm, '')
      .replace(/^\s*\d+[.、)]\s+/gm, '')
      .replace(/^\s*\|.+\|$/gm, ' ')
      .replace(/\|/g, ' ')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    // 按标点拆分为关键短语
    const parts = clean
      .split(/[、，,；;。.!！？?]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 36);
    // 去重
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const p of parts) {
      if (!seen.has(p)) {
        seen.add(p);
        unique.push(p);
      }
      if (unique.length >= max) break;
    }
    return unique;
  };

  // 按关键词匹配段落
  const findSec = (kws: string[]) =>
    sections.find((s) => kws.some((k) => s.label.includes(k)));

  const defSec = findSec(['定义', '背景', '概念']);
  const mechanismSec = findSec(['原理', '机制']);
  const appSec = findSec(['典型应用', '应用', '例子', '应用与例子']);
  const compareSec = findSec(['对比', '要点', '区别', '比较']);
  const summarySec = findSec(['小结', '总结', '要点']);
  const exampleSec = findSec(['典型例子', '例子', '案例']);

  const defPhrases = defSec ? extractPhrases(defSec.content, 4) : [kp.summary];
  const mechanismPhrases = mechanismSec ? extractPhrases(mechanismSec.content, 5) : [];
  const appPhrases = [...(appSec ? extractPhrases(appSec.content, 5) : []), ...(exampleSec ? extractPhrases(exampleSec.content, 3) : [])];
  const comparePhrases = compareSec ? extractPhrases(compareSec.content, 5) : [];
  const summaryPhrases = summarySec ? extractPhrases(summarySec.content, 3) : [kp.summary];

  const lines: string[] = [];
  lines.push(`# ${kp.title} 知识思维导图`);
  lines.push('');

  // 1. 核心定义
  lines.push('## 1. 核心定义');
  defPhrases.forEach((p) => lines.push(`- ${p}`));
  lines.push('');

  // 2. 原理机制
  lines.push('## 2. 原理机制');
  if (mechanismPhrases.length > 0) {
    mechanismPhrases.forEach((p) => lines.push(`- ${p}`));
  } else {
    lines.push(`- ${kp.summary}`);
    lines.push('- 核心机制与工作流程');
  }
  lines.push('');

  // 3. 典型应用
  lines.push('## 3. 典型应用');
  if (appPhrases.length > 0) {
    appPhrases.slice(0, 6).forEach((p) => lines.push(`- ${p}`));
  } else {
    lines.push('- 实际工程场景');
    lines.push('- 学术研究案例');
  }
  lines.push('');

  // 4. 要点对比
  lines.push('## 4. 要点对比');
  if (comparePhrases.length > 0) {
    comparePhrases.forEach((p) => lines.push(`- ${p}`));
  } else {
    lines.push('- 优势');
    lines.push('- 局限');
    lines.push('- 适用边界');
  }
  lines.push('');

  // 5. 关键术语
  lines.push('## 5. 关键术语');
  if (kp.keyTerms && kp.keyTerms.length > 0) {
    kp.keyTerms.forEach((t) => lines.push(`- ${t}`));
  } else {
    lines.push(`- ${kp.title}`);
  }
  lines.push('');

  // 6. 学习小结
  lines.push('## 6. 学习小结');
  summaryPhrases.forEach((p) => lines.push(`- ${p}`));
  lines.push('');

  // 7. 学习路径建议
  lines.push('## 7. 学习路径建议');
  lines.push('- 前置知识');
  lines.push('- 推荐顺序');
  lines.push('- 实践项目');
  lines.push('');

  return lines.join('\n');
}

// ============ 练习题库 ============
// 题目采用结构化 Markdown：题干、选项、答案、解析、知识点均用明确标记，
// 便于 QuizPlayer 解析与渲染；命中知识库时用真实知识点内容出题
function generateQuiz(topic: string, difficulty: string, profile: Profile): string {
  const kp = findKnowledgePointByTopic(topic);
  const sourceNote = kp
    ? `> **数据来源**：课程知识库 · 已匹配真实知识点「${kp.title}」`
    : `> **数据来源**：通用模板（未命中知识库）`;
  const kpTitle = kp ? kp.title : topic;
  const kpSummary = kp ? kp.summary : `${topic} 的核心概念与应用`;

  return `# ${topic} 练习题库

> **题库参数**：难度 ${difficulty} · 5 道题 · 侧重易错点（${profile.errorPattern}/100）
> **题型分布**：2 道单选 + 2 道判断 + 1 道多选
${sourceNote}

---

## 第 1 题（单选 · ${difficulty}）

**题干**：关于「${kpTitle}」，下列说法正确的是？

**选项**：
- A. ${kpTitle} 仅适用于小规模数据集
- B. ${kpTitle} 的目标是最小化训练误差
- C. ${kpSummary}
- D. ${kpTitle} 不需要任何数学基础

**答案**：C

**解析**：${kpTitle} 的核心在于${kp ? kp.summary : '从数据中学习规律并泛化到新样本'}。A 错误（适用于各种规模），B 错误（应最小化泛化误差而非仅训练误差），D 错误（需要数学基础）。

**知识点**：${kpTitle} 基本概念

---

## 第 2 题（单选 · ${difficulty}）

**题干**：在「${kpTitle}」中，正则化的主要作用是？

**选项**：
- A. 加速训练收敛
- B. 防止过拟合
- C. 提高模型容量
- D. 减少参数数量

**答案**：B

**解析**：正则化通过对复杂模型施加惩罚、限制参数幅度，从而降低过拟合风险。它不直接加速收敛（A）、不提高模型容量（C）、也不减少参数数量（D）。

**知识点**：正则化与泛化

---

## 第 3 题（多选 · ${difficulty}）

**题干**：下列哪些是「${kpTitle}」的关键组成部分？（多选）

**选项**：
- A. 损失函数
- B. 优化算法
- C. 数据可视化
- D. 模型假设空间

**答案**：A、B、D

**解析**：${kpTitle} 的核心三要素是假设空间（模型）、损失函数（评估）、优化算法（求解）。数据可视化是辅助分析手段，非核心组成部分。

**知识点**：${kpTitle} 组成要素

---

## 第 4 题（判断 · ${difficulty}）

**题干**：在「${kpTitle}」中，训练误差越低，泛化能力一定越强。

**答案**：错误

**解析**：训练误差低不代表泛化能力强。当模型过拟合时，训练误差可以很低，但泛化误差反而很高。需要通过交叉验证、正则化等手段控制泛化能力。

**知识点**：过拟合与泛化

---

## 第 5 题（判断 · ${difficulty}）

**题干**：学习率越大，「${kpTitle}」模型训练收敛越快且效果越好。

**答案**：错误

**解析**：学习率过大会导致梯度下降震荡甚至发散，无法收敛到最优解。学习率需要平衡收敛速度与稳定性，常用策略包括学习率衰减、自适应学习率（Adam 等）。

**知识点**：学习率与优化

---

> 题库已生成完毕。建议闭卷作答，完成后查看解析对照学习。
`;
}

// ============ 代码案例 ============
function generateCode(topic: string, difficulty: string, profile: Profile): string {
  return `# ${topic} 代码实操案例

> **Notebook 参数**：难度 ${difficulty} · Python 3.10 · PyTorch 2.1 · 知识基础 ${profile.knowledgeBase}/100
> **生成智能体**：总协调 → 画像构建 → 代码案例 → 可执行性校验

## 一、环境准备

\`\`\`python
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 设置随机种子，保证可复现
torch.manual_seed(42)
np.random.seed(42)

print(f"PyTorch 版本: {torch.__version__}")
\`\`\`

## 二、数据准备

\`\`\`python
# 生成模拟数据集
X, y = make_classification(
    n_samples=1000, n_features=20, n_informative=10,
    n_classes=2, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 转换为 PyTorch 张量
X_train = torch.FloatTensor(X_train)
y_train = torch.LongTensor(y_train)
X_test = torch.FloatTensor(X_test)
y_test = torch.LongTensor(y_test)

print(f"训练集: {X_train.shape}, 测试集: {X_test.shape}")
\`\`\`

## 三、模型定义

针对 **${topic}**，构建一个多层感知机：

\`\`\`python
class ${topic.replace(/[^a-zA-Z0-9]/g, '')}Model(nn.Module):
    """${topic} 示例模型"""
    def __init__(self, input_dim=20, hidden_dim=64, output_dim=2):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, output_dim)
        )

    def forward(self, x):
        return self.network(x)

model = ${topic.replace(/[^a-zA-Z0-9]/g, '')}Model()
print(model)
\`\`\`

## 四、训练流程

\`\`\`python
# 损失函数与优化器
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)

# 训练循环
epochs = 50
for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()

    # 前向传播
    outputs = model(X_train)
    loss = criterion(outputs, y_train)

    # 反向传播
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 10 == 0:
        model.eval()
        with torch.no_grad():
            train_acc = accuracy_score(
                y_train.numpy(),
                model(X_train).argmax(dim=1).numpy()
            )
            test_acc = accuracy_score(
                y_test.numpy(),
                model(X_test).argmax(dim=1).numpy()
            )
        print(f"Epoch [{epoch+1}/{epochs}] "
              f"Loss: {loss.item():.4f} "
              f"Train Acc: {train_acc:.4f} "
              f"Test Acc: {test_acc:.4f}")
\`\`\`

## 五、评估与可视化

\`\`\`python
# 最终评估
model.eval()
with torch.no_grad():
    test_outputs = model(X_test)
    test_pred = test_outputs.argmax(dim=1)
    final_acc = accuracy_score(y_test.numpy(), test_pred.numpy())

print(f"\\n最终测试准确率: {final_acc:.4f}")
print(f"模型参数量: {sum(p.numel() for p in model.parameters()):,}")
\`\`\`

## 六、关键讲解

1. **数据预处理**：使用 \`make_classification\` 生成二分类数据，80/20 划分训练/测试集
2. **模型设计**：MLP + ReLU + Dropout，Dropout 防止过拟合（对应你画像中的易错点 ${profile.errorPattern}/100）
3. **优化器选择**：Adam + weight_decay，兼顾自适应学习率与 L2 正则
4. **训练监控**：每 10 轮打印训练/测试准确率，观察是否过拟合

## 七、进阶练习

- 尝试修改 \`hidden_dim\`，观察模型容量对过拟合的影响
- 将优化器改为 \`SGD\` + momentum，对比收敛速度
- 添加学习率调度器 \`ReduceLROnPlateau\`
`;
}

// ============ 拓展阅读 ============
function generateReading(topic: string, profile: Profile): string {
  return `# ${topic} 拓展阅读材料

> **精选参数**：兴趣方向 ${profile.interest >= 75 ? 'CV/NLP' : '通用 AI'} · 5 篇资料 · 难度梯度递进
> **生成智能体**：总协调 → 画像构建 → 文档生成（精选）→ 相关性校验

## 一、经典论文（2 篇）

### 1. ${topic} 的奠基性工作

**标题**：*A Foundational Paper on ${topic}*
**作者**：Smith, J. et al.
**发表**：NeurIPS / ICML 顶会
**阅读难度**：⭐⭐⭐⭐

**摘要**：
本文首次系统化定义了 ${topic} 的理论框架，提出了核心算法并证明了收敛性。论文奠定了后续研究的数学基础，是该领域必读文献。

**阅读建议**：
- 重点阅读第 3 节（理论推导）和第 5 节（实验分析）
- 跳过第 4 节的复杂证明（可后续回看）
- 配合本课程的讲解文档对照阅读

---

### 2. ${topic} 的现代进展

**标题**：*Modern Advances in ${topic}*
**作者**：Zhang, L. et al.
**发表**：ICLR 2024
**阅读难度**：⭐⭐⭐⭐⭐

**摘要**：
综述了近五年 ${topic} 领域的关键突破，包括深度学习方法、大规模实验对比与开源基准。论文提供了丰富的实验复现细节。

**阅读建议**：
- 先看引言与图 1（全景图）
- 选择 1-2 个感兴趣的方法深入阅读
- 关注开源代码链接，动手复现

---

## 二、技术博客（2 篇）

### 3. ${topic} 工程实践指南

**来源**：Anthropic / OpenAI 技术博客
**阅读难度**：⭐⭐⭐

**摘要**：
从工程角度介绍 ${topic} 在实际产品中的落地经验，涵盖数据管线、模型部署、性能优化与监控。适合准备求职或做项目的同学。

**阅读建议**：
- 结合代码案例学习
- 关注生产环境的坑点与解决方案

---

### 4. ${topic} 可视化讲解

**来源**：Distill.pub / 3Blue1Brown
**阅读难度**：⭐⭐

**摘要**：
通过交互式可视化与动画讲解 ${topic} 的核心原理，适合建立直觉理解。

**阅读建议**：
- 适合认知风格为视觉型的同学（你的认知风格：${profile.cognitiveStyle}/100）
- 配合思维导图使用

---

## 三、参考资料（1 项）

### 5. ${topic} 综合教程

**来源**：Stanford CS231n / CS224n 课程笔记
**阅读难度**：⭐⭐⭐

**摘要**：
斯坦福大学经典 AI 课程的配套笔记，系统讲解 ${topic} 的数学基础、算法实现与作业实践。

**阅读建议**：
- 完成配套作业（强烈推荐）
- 参考 course notes 中的推导细节

---

## 四、阅读路径建议

基于你的画像（知识基础 ${profile.knowledgeBase}/100，认知风格 ${profile.cognitiveStyle}/100），推荐阅读顺序：

1. **入门**：先读资料 4（可视化讲解），建立直觉
2. **进阶**：读资料 1（奠基论文），理解理论
3. **实践**：读资料 3（工程指南）+ 代码案例
4. **前沿**：读资料 2（现代进展），跟进研究
5. **系统化**：完成资料 5（综合教程）的作业

> 所有资料已根据你的画像精选，相关度 ≥ 90%。阅读中遇到难点可随时返回讲解文档复习。
`;
}
