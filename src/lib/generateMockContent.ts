// 多智能体协作生成的内容生成器（模拟）
// 根据资源类型 + 主题 + 学生画像，生成结构化的演示内容
import type { ResourceType, Profile } from '@/data/mockData';

const styleLabel = (p: Profile) => {
  const v = Math.round(p.cognitiveStyle / 25);
  return ['未确定', '视频型', '阅读型', '动手型', '推导型'][v] || '混合型';
};

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
  return `# ${topic} · 个性化讲解文档

> **生成参数**：难度 ${difficulty} · 认知风格 ${style} · 知识基础 ${profile.knowledgeBase}/100
> **生成智能体**：总协调 → 画像构建 → 文档生成 → 质量校验

## 一、概念引入

**${topic}** 是人工智能领域的核心知识点之一。理解 ${topic} 的关键在于把握其背后的动机、数学定义与工程实现。

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
function generateMindmap(topic: string, profile: Profile): string {
  return `# ${topic} 知识思维导图

- ${topic}
  - 1. 基础概念
    - 1.1 定义与背景
    - 1.2 核心术语
    - 1.3 应用场景
  - 2. 数学原理
    - 2.1 形式化定义
    - 2.2 目标函数
    - 2.3 优化方法
      - 2.3.1 梯度下降
      - 2.3.2 牛顿法
      - 2.3.3 共轭梯度
  - 3. 算法实现
    - 3.1 数据预处理
    - 3.2 模型构建
    - 3.3 训练与评估
  - 4. 对比分析
    - 4.1 与相关方法对比
      - 4.1.1 优势
      - 4.1.2 劣势
    - 4.2 适用场景
  - 5. 进阶主题
    - 5.1 工程优化
    - 5.2 前沿进展
    - 5.3 开放问题
  - 6. 学习路径建议
    - 6.1 前置知识
    - 6.2 推荐顺序
    - 6.3 实践项目

> 知识图谱已生成：8 个核心节点 · 15 条关联边 · 层级深度 4
`;
}

// ============ 练习题库 ============
function generateQuiz(topic: string, difficulty: string, profile: Profile): string {
  return `# ${topic} 练习题库

> **题库参数**：难度 ${difficulty} · 10 道题 · 侧重易错点（${profile.errorPattern}/100）
> **题型分布**：4 道单选 + 3 道多选 + 3 道判断

---

## 第 1 题（单选 · ${difficulty}）

**关于 ${topic}，下列说法正确的是：**

- A. ${topic} 只适用于小规模数据集
- B. ${topic} 的目标是最小化训练误差
- C. ${topic} 通过数据学习规律并泛化到新样本 ✓
- D. ${topic} 不需要任何数学基础

**答案**：C

**解析**：${topic} 的核心是从数据中学习规律，并对未见过的数据保持泛化能力。A 错误（适用于各种规模），B 错误（应最小化泛化误差，而非仅训练误差），D 错误（需要数学基础）。

**知识点**：${topic} 基本概念

---

## 第 2 题（单选 · ${difficulty}）

**${topic} 中，正则项 $\\Omega(\\theta)$ 的主要作用是：**

- A. 加速训练收敛
- B. 防止过拟合 ✓
- C. 提高模型容量
- D. 减少参数数量

**答案**：B

**解析**：正则项通过对复杂模型施加惩罚，限制参数幅度，从而降低过拟合风险。它不直接加速收敛（A），不提高模型容量（C），也不减少参数数量（D）。

**知识点**：正则化

---

## 第 3 题（多选 · ${difficulty}）

**下列哪些是 ${topic} 的关键组成部分？（多选）**

- A. ✓ 损失函数
- B. ✓ 优化算法
- C. ✗ 数据可视化
- D. ✓ 模型假设空间

**答案**：A、B、D

**解析**：${topic} 的核心三要素是假设空间（模型）、损失函数（评估）、优化算法（求解）。数据可视化是辅助分析手段，非核心组成部分。

**知识点**：${topic} 组成要素

---

## 第 4 题（判断 · ${difficulty}）

**${topic} 中，训练误差越低，泛化能力一定越强。**

**答案**：错误 ✗

**解析**：训练误差低不代表泛化能力强。当模型过拟合时，训练误差可以很低，但泛化误差反而很高。需要通过交叉验证、正则化等手段控制泛化能力。

**知识点**：过拟合与泛化

---

## 第 5 题（判断 · ${difficulty}）

**学习率越大，${topic} 模型训练收敛越快且效果越好。**

**答案**：错误 ✗

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
