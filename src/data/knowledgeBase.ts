// 《人工智能导论》知识库 - 结构化知识体系
// 基于完整 8 大章节组织，作为项目所有学习内容的权威数据源

export interface KnowledgePoint {
  id: string;
  title: string;
  summary: string;       // 简要描述
  detail: string;        // 详细说明（支持 Markdown）
  keyTerms?: string[];   // 关键术语
}

export interface KnowledgeSection {
  id: string;
  title: string;
  summary: string;
  points: KnowledgePoint[];
}

export interface KnowledgeChapter {
  id: string;
  index: number;         // 章序号
  title: string;
  subtitle: string;
  summary: string;
  sections: KnowledgeSection[];
}

// ========== 第一章 引言 ==========
const chapter1: KnowledgeChapter = {
  id: 'ch1',
  index: 1,
  title: '引言',
  subtitle: '走进人工智能的世界',
  summary: '介绍人工智能的基本概念、研究意义、发展动因与本课程的学习路径。',
  sections: [
    {
      id: 'ch1-s1',
      title: '什么是人工智能',
      summary: '从工程与智能两个维度理解 AI 的本质',
      points: [
        {
          id: 'ch1-s1-p1',
          title: '人工智能的定义',
          summary: '让机器表现出类人智能的科学与工程',
          detail: '人工智能（Artificial Intelligence, AI）是研究、开发用于**模拟、延伸和扩展人的智能**的理论、方法、技术及应用系统的一门学科。\n\n广义上，AI 包含两种视角：\n- **工程视角**：构造能完成需要人类智能才能完成的任务的系统\n- **科学视角**：把智能作为一种自然现象加以研究，理解其原理',
          keyTerms: ['智能', '人工智能', '工程视角', '科学视角'],
        },
        {
          id: 'ch1-s1-p2',
          title: '智能的层次',
          summary: '感知 → 记忆 → 推理 → 决策 → 学习',
          detail: '智能可分解为多个层次：\n1. **感知**：视觉、听觉、触觉等信号获取\n2. **记忆与知识**：信息的存储与组织\n3. **推理与决策**：基于知识解决问题\n4. **学习与适应**：从经验中改进性能\n5. **语言与交互**：自然语言理解与生成\n\n人工智能的目标是让机器在不同层次上逼近甚至超越人类。',
        },
      ],
    },
    {
      id: 'ch1-s2',
      title: '人工智能的意义与价值',
      summary: 'AI 已成为新一代基础设施',
      points: [
        {
          id: 'ch1-s2-p1',
          title: '科学意义',
          summary: '理解智能本身',
          detail: 'AI 研究有助于回答"智能是什么"这一根本问题，与神经科学、认知科学、心理学等学科交叉融合。',
        },
        {
          id: 'ch1-s2-p2',
          title: '工程与社会意义',
          summary: '解放生产力、重塑产业',
          detail: 'AI 已渗透到医疗、教育、金融、制造、交通等几乎所有行业，成为继电力、互联网之后的**新一代基础设施**，深刻改变生产方式与生活形态。',
        },
      ],
    },
    {
      id: 'ch1-s3',
      title: '发展动因',
      summary: '数据、算力、算法三驾马车',
      points: [
        {
          id: 'ch1-s3-p1',
          title: '三大驱动力',
          summary: '数据 + 算力 + 算法',
          detail: '现代 AI 的爆发由三大要素共同推动：\n- **数据**：互联网产生海量标注数据\n- **算力**：GPU/TPU 等专用硬件普及\n- **算法**：深度学习、Transformer 等突破\n\n三者缺一不可，任何一方的瓶颈都会制约 AI 发展。',
          keyTerms: ['数据', '算力', '算法'],
        },
      ],
    },
  ],
};

// ========== 第二章 人工智能基础概念 ==========
const chapter2: KnowledgeChapter = {
  id: 'ch2',
  index: 2,
  title: '人工智能基础概念',
  subtitle: '定义、流派与属性',
  summary: '辨析 AI 的强弱分级、三大研究流派及其属性维度，奠定概念基础。',
  sections: [
    {
      id: 'ch2-s1',
      title: '人工智能的定义与分级',
      summary: '弱 AI / 强 AI / 超 AI',
      points: [
        {
          id: 'ch2-s1-p1',
          title: '弱人工智能（ANI）',
          summary: '专用智能，单一任务超越人类',
          detail: '**弱人工智能（Artificial Narrow Intelligence, ANI）**：在特定领域或单一任务上达到甚至超越人类水平，但缺乏通用智能。\n\n例子：\n- AlphaGo（围棋）\n- 人脸识别系统\n- 语音助手\n- 自动翻译\n\n当前所有商业化 AI 系统均属此类。',
          keyTerms: ['ANI', '弱人工智能', '专用智能'],
        },
        {
          id: 'ch2-s1-p2',
          title: '强人工智能（AGI）',
          summary: '通用智能，具备人类全部认知能力',
          detail: '**强人工智能（Artificial General Intelligence, AGI）**：能够像人类一样在**任意认知任务**上学习、理解、推理的智能系统。\n\n特征：\n- 跨领域迁移能力\n- 抽象与类比能力\n- 自我意识（争议）\n\n目前仍是研究目标，尚未实现。',
          keyTerms: ['AGI', '强人工智能', '通用智能'],
        },
        {
          id: 'ch2-s1-p3',
          title: '超人工智能（ASI）',
          summary: '全面超越人类的智能',
          detail: '**超人工智能（Artificial Superintelligence, ASI）**：在科学创造、社会技能、综合智能等所有领域**全面超越最聪明人类**的智能形态。\n\n属于哲学与未来学讨论范畴，伴随重大伦理与安全问题。',
          keyTerms: ['ASI', '超人工智能'],
        },
      ],
    },
    {
      id: 'ch2-s2',
      title: '三大研究流派',
      summary: '符号主义 / 连接主义 / 行为主义',
      points: [
        {
          id: 'ch2-s2-p1',
          title: '符号主义（Symbolism）',
          summary: '基于逻辑推理的"理性主义"流派',
          detail: '**符号主义**又称**逻辑主义**或**心理学派**，认为智能的基础是**符号操作**，通过逻辑推理实现对人类思维的模拟。\n\n核心思想：\n- 认知即计算（Cognition = Computation）\n- 物理符号系统假设（Newell & Simon）\n\n代表方法：专家系统、知识图谱、自动定理证明、逻辑编程。\n\n优点：可解释性强；缺点：难以处理模糊与感知问题。',
          keyTerms: ['符号主义', '逻辑主义', '物理符号系统', '专家系统'],
        },
        {
          id: 'ch2-s2-p2',
          title: '连接主义（Connectionism）',
          summary: '基于神经网络的"经验主义"流派',
          detail: '**连接主义**又称**联结主义**或**神经网络学派**，认为智能源于**大量简单单元的相互连接**，通过调整连接权重实现学习。\n\n核心思想：\n- 仿生学：模拟生物神经元\n- 分布式表征与并行处理\n\n代表方法：感知机、多层神经网络、深度学习、Transformer。\n\n优点：擅长感知与模式识别；缺点：可解释性弱、数据饥渴。',
          keyTerms: ['连接主义', '神经网络', '深度学习', '分布式表征'],
        },
        {
          id: 'ch2-s2-p3',
          title: '行为主义（Actionism）',
          summary: '基于"感知-行动"的进化流派',
          detail: '**行为主义**又称**进化主义**或**控制论学派**，认为智能源于**智能体与环境的交互**，强调感知-行动的反馈机制。\n\n核心思想：\n- 智能涌现于环境交互\n- 控制-反馈（PID、强化学习）\n\n代表方法：Brooks 机器人、强化学习、进化算法、具身智能。\n\n优点：适应动态环境；缺点：高阶认知建模困难。',
          keyTerms: ['行为主义', '进化主义', '强化学习', '具身智能'],
        },
      ],
    },
    {
      id: 'ch2-s3',
      title: '人工智能的属性',
      summary: '感知、推理、学习、决策',
      points: [
        {
          id: 'ch2-s3-p1',
          title: '四大核心属性',
          summary: 'AI 系统应具备的能力维度',
          detail: '| 属性 | 含义 | 典型技术 |\n|------|------|----------|\n| 感知 | 获取环境信息 | CV、ASR |\n| 推理 | 基于知识得出结论 | 逻辑推理、概率推理 |\n| 学习 | 从数据改进性能 | 机器学习、深度学习 |\n| 决策 | 选择最优行动 | 强化学习、规划 |',
        },
      ],
    },
    {
      id: 'ch2-s4',
      title: '研究领域概览',
      summary: 'AI 的主要研究分支',
      points: [
        {
          id: 'ch2-s4-p1',
          title: '主要研究领域',
          summary: '机器学习、CV、NLP、机器人等',
          detail: '人工智能的主要研究领域包括：\n- **机器学习**：让机器从数据中学习\n- **深度学习**：基于深层神经网络的学习\n- **计算机视觉（CV）**：让机器"看懂"图像与视频\n- **自然语言处理（NLP）**：让机器"理解"和"生成"语言\n- **语音处理**：语音识别与合成\n- **知识表示与推理**：符号化知识处理\n- **智能机器人**：感知-决策-执行一体化\n- **多智能体系统**：多智能体协同\n- **强化学习**：试错学习与决策优化',
        },
      ],
    },
  ],
};

// ========== 第三章 发展历史 ==========
const chapter3: KnowledgeChapter = {
  id: 'ch3',
  index: 3,
  title: '人工智能发展历史',
  subtitle: '从孕育到爆发',
  summary: '梳理 AI 70 余年发展脉络，含两次繁荣与两次低谷，理解学科演进规律。',
  sections: [
    {
      id: 'ch3-s1',
      title: '孕育期（1940s-1955）',
      summary: 'AI 思想与硬件的奠基',
      points: [
        {
          id: 'ch3-s1-p1',
          title: '1943 MP 神经元模型',
          summary: 'McCulloch & Pitts 首次提出神经元数学模型',
          detail: '**1943 年**，神经生理学家 McCulloch 与数学家 Pitts 发表《A Logical Calculus of Ideas Immanent in Nervous Activity》，提出**M-P 神经元模型**。\n\n贡献：\n- 首次将生物神经元抽象为数学模型\n- 证明简单神经网络可执行任意逻辑运算\n- 为连接主义奠定理论基础',
          keyTerms: ['M-P 模型', 'McCulloch', 'Pitts'],
        },
        {
          id: 'ch3-s1-p2',
          title: '1946 ENIAC 与 1950 图灵测试',
          summary: '硬件诞生与智能判定标准',
          detail: '- **1946 年**：ENIAC 诞生，世界上第一台通用电子计算机，为 AI 提供算力基础\n- **1950 年**：图灵发表《Computing Machinery and Intelligence》，提出**图灵测试**——若机器能在对话中让人无法分辨其是否为人，则可认为具有智能\n\n图灵测试长期作为 AI 智能的判定标准，深刻影响了后续研究方向。',
          keyTerms: ['ENIAC', '图灵测试', '图灵'],
        },
      ],
    },
    {
      id: 'ch3-s2',
      title: '诞生与第一次繁荣（1956-1969）',
      summary: '达特茅斯会议开启 AI 学科',
      points: [
        {
          id: 'ch3-s2-p1',
          title: '1956 达特茅斯会议',
          summary: 'AI 学科正式诞生的标志性事件',
          detail: '**1956 年夏季**，McCarthy、Minsky、Shannon、Rochester 四人在**达特茅斯学院**召开为期 2 个月的研讨会，首次提出"**Artificial Intelligence**"一词。\n\n会议核心议题：\n- 自动计算机\n- 知识表示与推理\n- 神经网络\n- 计算规模\n- 自我改进\n- 抽象与随机\n\n标志着人工智能作为独立学科正式诞生。',
          keyTerms: ['达特茅斯会议', 'McCarthy', 'Minsky', 'AI诞生'],
        },
        {
          id: 'ch3-s2-p2',
          title: '早期突破',
          summary: '感知机、几何定理证明器、ELIZA',
          detail: '**第一次繁荣期（1956-1969）**的代表成果：\n- **1957** Rosenblatt 提出**感知机（Perceptron）**，首个可学习神经网络\n- **1959** Gelernter 几何定理证明器\n- **1965** ELIZA 聊天机器人（Weizenbaum）\n- **1969** Shakey 机器人（SRI），首个可推理的移动机器人\n\n这一时期 AI 研究经费充裕、研究热情高涨，对前景普遍乐观。',
          keyTerms: ['感知机', 'ELIZA', 'Shakey'],
        },
      ],
    },
    {
      id: 'ch3-s3',
      title: '第一次低谷（1969-1973）',
      summary: '理论瓶颈与现实失望',
      points: [
        {
          id: 'ch3-s3-p1',
          title: 'Minsky 对感知机的批判',
          summary: 'XOR 问题暴露单层网络局限',
          detail: '**1969 年**，Minsky 与 Papert 出版《Perceptrons》，严格证明单层感知机**无法解决异或（XOR）等线性不可分问题**。\n\n影响：\n- 神经网络研究陷入长期低潮\n- 连接主义经费大幅削减\n- 研究重心转向符号主义',
          keyTerms: ['Perceptrons', 'XOR问题', 'Minsky'],
        },
        {
          id: 'ch3-s3-p2',
          title: '1973 莱特希尔报告',
          summary: '英国 AI 经费全面削减',
          detail: '**1973 年**，英国数学家 Lighthill 受政府委托发布《Lighthill Report》，认为 AI 研究未兑现承诺，导致英国高校 AI 经费大幅削减。\n\n加上美国 DARPA 削减资助，AI 进入**第一次寒冬**。',
          keyTerms: ['Lighthill报告', 'AI寒冬'],
        },
      ],
    },
    {
      id: 'ch3-s4',
      title: '第二次繁荣（1980-1987）',
      summary: '专家系统的兴起',
      points: [
        {
          id: 'ch3-s4-p1',
          title: '专家系统的商业化',
          summary: '符号主义的高光时刻',
          detail: '**1980 年代**，**专家系统（Expert System）**成为 AI 商业化里程碑：\n- **DENDRAL**（1965-）：化学分子结构推断\n- **MYCIN**（1976-）：血液感染诊断\n- **XCON**（1980-）：DEC 公司计算机配置，年节省 4000 万美元\n\n专家系统基于"知识库 + 推理机"，能模拟人类专家决策，引发第一次 AI 商业热潮。',
          keyTerms: ['专家系统', 'MYCIN', 'XCON', '知识库', '推理机'],
        },
      ],
    },
    {
      id: 'ch3-s5',
      title: '第二次低谷（1987-1993）',
      summary: '专家系统的瓶颈',
      points: [
        {
          id: 'ch3-s5-p1',
          title: '专家系统的局限',
          summary: '知识获取瓶颈与维护成本',
          detail: '**1987 年起**，专家系统的缺陷暴露：\n- **知识获取瓶颈**：依赖领域专家手工编码，难以扩展\n- **脆弱性**：超出预设范围即失效\n- **维护成本高**：知识库越大越难维护\n- **Lisp 机型专用机被通用工作站取代**\n\nAI 进入**第二次寒冬**，研究重心转向统计方法与机器学习。',
          keyTerms: ['知识获取瓶颈', '第二次寒冬'],
        },
      ],
    },
    {
      id: 'ch3-s6',
      title: '稳步发展期（1993-2011）',
      summary: '统计学习与算法突破',
      points: [
        {
          id: 'ch3-s6-p1',
          title: '统计机器学习的崛起',
          summary: 'SVM、Boosting 等经典算法',
          detail: '该时期重要进展：\n- **1995** Vapnik 提出**支持向量机（SVM）**\n- **1995** LeCun 卷积神经网络 LeNet 应用于手写数字识别\n- **1997** Deep Blue 击败国际象棋世界冠军 Kasparov\n- **1997** LSTM（Hochreiter & Schmidhuber）解决长程依赖\n- **2001** Boosting、随机森林等方法成熟\n- **2006** Hinton 提出**深度信念网络**，"深度学习"概念兴起',
          keyTerms: ['SVM', 'LeNet', 'Deep Blue', 'LSTM', '深度信念网络'],
        },
      ],
    },
    {
      id: 'ch3-s7',
      title: '爆发期（2012 至今）',
      summary: '深度学习与大模型时代',
      points: [
        {
          id: 'ch3-s7-p1',
          title: '深度学习革命',
          summary: 'AlexNet、ResNet 引领 CV 革命',
          detail: '- **2012** AlexNet 在 ImageNet 竞赛 top-5 错误率从 26% 降至 15%，开启**深度学习时代**\n- **2014** GAN（生成对抗网络）提出\n- **2015** ResNet 残差网络，深度可达 152 层\n- **2016** AlphaGo 击败围棋世界冠军李世石\n- **2017** Transformer 架构（《Attention is All You Need》）\n- **2018** BERT 预训练语言模型\n- **2020** GPT-3 涌现能力\n- **2022** ChatGPT 引爆通用对话\n- **2023+** GPT-4、Gemini、Claude 等多模态大模型',
          keyTerms: ['AlexNet', 'AlphaGo', 'Transformer', 'BERT', 'GPT', 'ChatGPT'],
        },
      ],
    },
  ],
};

// ========== 第四章 科学背景 ==========
const chapter4: KnowledgeChapter = {
  id: 'ch4',
  index: 4,
  title: '人工智能的科学背景',
  subtitle: '多学科交叉的智能研究',
  summary: 'AI 与神经科学、语言学、哲学、心理学、脑与认知科学等学科深度交叉。',
  sections: [
    {
      id: 'ch4-s1',
      title: '神经科学',
      summary: 'AI 的生物启发之源',
      points: [
        {
          id: 'ch4-s1-p1',
          title: '神经元与突触',
          summary: '生物神经网络启发了人工神经网络',
          detail: '神经科学揭示了大脑的基本单元——**神经元**及其通过**突触**连接形成的网络：\n- 人脑约 860 亿神经元，每神经元平均 7000 突触\n- 神经元通过电化学信号传递信息\n- 突触强度可塑（Hebb 学习律）\n\n这些发现直接启发了 M-P 模型、感知机、Hebbian 学习等 AI 早期工作。',
          keyTerms: ['神经元', '突触', 'Hebb学习律'],
        },
      ],
    },
    {
      id: 'ch4-s2',
      title: '语言学',
      summary: 'NLP 的理论基础',
      points: [
        {
          id: 'ch4-s2-p1',
          title: '乔姆斯基生成语法',
          summary: '形式语言与语法理论',
          detail: '语言学家**乔姆斯基（Chomsky）**提出**生成语法**，认为人类语言能力具有天赋的语法结构。\n\n影响：\n- 早期 NLP 采用规则与语法分析\n- 后期转向统计与神经方法\n- 当代大模型证明海量数据可隐式学习语法',
          keyTerms: ['乔姆斯基', '生成语法'],
        },
      ],
    },
    {
      id: 'ch4-s3',
      title: '哲学',
      summary: '智能与心智的根本问题',
      points: [
        {
          id: 'ch4-s3-p1',
          title: '心智哲学与图灵测试',
          summary: '智能的判定与意识之谜',
          detail: '哲学为 AI 提供根本性思考：\n- **笛卡尔心物二元论**：心智与身体是否分离\n- **图灵测试**：行为主义智能判定标准\n- **塞尔中文屋实验**：质疑强 AI 是否真正"理解"\n- **功能主义**：智能是信息处理过程，与载体无关\n\n这些讨论持续影响 AI 伦理与 AGI 研究。',
          keyTerms: ['图灵测试', '中文屋实验', '功能主义'],
        },
      ],
    },
    {
      id: 'ch4-s4',
      title: '心理学',
      summary: '认知建模与学习理论',
      points: [
        {
          id: 'ch4-s4-p1',
          title: '认知心理学',
          summary: '人类认知过程建模',
          detail: '心理学为 AI 提供认知模型：\n- **信息加工理论**：人脑即信息处理系统\n- **工作记忆与长时记忆**模型\n- **强化学习**源于行为主义（巴甫洛夫、斯金纳）\n- **认知负荷理论**指导教学系统设计',
          keyTerms: ['信息加工理论', '工作记忆', '强化学习'],
        },
      ],
    },
    {
      id: 'ch4-s5',
      title: '脑与认知科学',
      summary: '理解智能的本源',
      points: [
        {
          id: 'ch4-s5-p1',
          title: '脑科学进展',
          summary: '从神经影像到类脑计算',
          detail: '脑科学通过 fMRI、EEG 等手段揭示大脑工作机制：\n- 视觉皮层层级处理（启发了 CNN）\n- 注意力机制（启发了 Transformer Attention）\n- 海马体与情景记忆（启发了记忆增强网络）\n\n**类脑计算**试图在硬件层面模拟大脑，如 IBM TrueNorth、Intel Loihi。',
          keyTerms: ['fMRI', '视觉皮层', '类脑计算'],
        },
      ],
    },
  ],
};

// ========== 第五章 核心技术 ==========
const chapter5: KnowledgeChapter = {
  id: 'ch5',
  index: 5,
  title: '人工智能核心技术',
  subtitle: '11 大技术支柱',
  summary: '系统讲解 AI 11 个核心技术子领域，从知识表示到大模型与智能体。',
  sections: [
    {
      id: 'ch5-s1',
      title: '知识表示',
      summary: '让机器拥有可推理的知识',
      points: [
        {
          id: 'ch5-s1-p1',
          title: '主要表示方法',
          summary: '一阶谓词逻辑、产生式、框架、语义网络',
          detail: '知识表示是符号主义的核心，常用方法：\n\n| 方法 | 特点 | 应用 |\n|------|------|------|\n| 一阶谓词逻辑 | 形式化、可推理 | 自动定理证明 |\n| 产生式规则 | IF-THEN 形式 | 专家系统 |\n| 框架 | 结构化对象表示 | 知识库 |\n| 语义网络 | 节点-边图结构 | 概念关系 |\n| 本体（Ontology） | 概念层级与关系 | 知识图谱 |',
          keyTerms: ['谓词逻辑', '产生式', '框架', '语义网络', '本体'],
        },
      ],
    },
    {
      id: 'ch5-s2',
      title: '搜索技术',
      summary: '问题求解的通用方法',
      points: [
        {
          id: 'ch5-s2-p1',
          title: '无信息搜索',
          summary: 'BFS / DFS / UCS',
          detail: '搜索是在状态空间中寻找从初始到目标的路径：\n- **广度优先搜索 BFS**：完备、最优，复杂度 O(b^d)\n- **深度优先 DFS**：不完备，复杂度 O(b^m)\n- **一致代价搜索 UCS**：每步代价不同时最优\n- **深度受限 / 迭代加深**：兼顾空间与完备性',
          keyTerms: ['BFS', 'DFS', 'UCS', '迭代加深'],
        },
        {
          id: 'ch5-s2-p2',
          title: '启发式搜索',
          summary: 'A* 算法',
          detail: "**A* 算法**结合 g(n)（已花费代价）与 h(n)（启发估计）：\n\n`f(n) = g(n) + h(n)`\n\n- **可采纳性**：h(n) ≤ h*(n)（不高估）→ 保证最优\n- **一致性**：h(n) ≤ c(n,n') + h(n') → 不重复扩展\n\n应用：路径规划、游戏 AI、8 数码问题。",
          keyTerms: ['A*', '启发函数', '可采纳性', '一致性'],
        },
        {
          id: 'ch5-s2-p3',
          title: '博弈搜索',
          summary: 'Minimax 与 Alpha-Beta 剪枝',
          detail: '博弈搜索处理对抗环境：\n- **Minimax**：最大化己方最小收益\n- **Alpha-Beta 剪枝**：在不影响结果下剪去无关分支\n- **Monte Carlo Tree Search (MCTS)**：AlphaGo 的核心技术',
          keyTerms: ['Minimax', 'Alpha-Beta', 'MCTS'],
        },
      ],
    },
    {
      id: 'ch5-s3',
      title: '知识图谱',
      summary: '结构化知识的工业级表达',
      points: [
        {
          id: 'ch5-s3-p1',
          title: '知识图谱基础',
          summary: '三元组与本体',
          detail: '**知识图谱（Knowledge Graph）**以**三元组**（实体-关系-实体）形式存储知识：\n\n`(北京, 首都Of, 中国)`\n\n核心组件：\n- **实体**：人、地、物、概念\n- **关系**：实体间连接\n- **属性**：实体的数值/文本特征\n\n典型应用：Google Knowledge Graph、 Wikidata、百度知心。',
          keyTerms: ['知识图谱', '三元组', '实体', '关系'],
        },
        {
          id: 'ch5-s3-p2',
          title: '构建与推理',
          summary: '抽取、融合、推理',
          detail: '知识图谱构建流程：\n1. **实体抽取**（NER）\n2. **关系抽取**\n3. **实体消歧与对齐**\n4. **知识融合**\n5. **知识推理**（TransE、图神经网络）\n\n应用：智能问答、推荐系统、辅助决策。',
        },
      ],
    },
    {
      id: 'ch5-s4',
      title: '机器学习',
      summary: '从数据中学习规律',
      points: [
        {
          id: 'ch5-s4-p1',
          title: '学习范式',
          summary: '监督 / 无监督 / 强化',
          detail: '机器学习三大范式：\n\n| 范式 | 训练数据 | 目标 | 典型算法 |\n|------|----------|------|----------|\n| 监督学习 | (x, y) 标签对 | 学习 x→y 映射 | 线性回归、SVM、决策树 |\n| 无监督学习 | 仅 x | 发现结构 | K-Means、PCA |\n| 强化学习 | 状态-动作-奖励 | 最大化累计奖励 | Q-Learning、PPO |',
          keyTerms: ['监督学习', '无监督学习', '强化学习'],
        },
        {
          id: 'ch5-s4-p2',
          title: '经典算法',
          summary: '线性回归 / 决策树 / SVM / 集成',
          detail: '经典机器学习算法：\n- **线性回归**：y = wx + b，最小二乘求解\n- **逻辑回归**：分类任务，sigmoid 输出概率\n- **决策树**：ID3/C4.5/CART，基于信息增益/基尼\n- **支持向量机**：最大化间隔，核技巧处理非线性\n- **集成方法**：Bagging（随机森林）、Boosting（GBDT、XGBoost）\n- **KNN**：惰性学习，距离度量',
          keyTerms: ['线性回归', '决策树', 'SVM', '随机森林', 'XGBoost'],
        },
        {
          id: 'ch5-s4-p3',
          title: '模型评估',
          summary: '过拟合与交叉验证',
          detail: '关键概念：\n- **偏差-方差权衡**：模型复杂度的核心矛盾\n- **过拟合**：训练好测试差，需正则化/剪枝\n- **欠拟合**：模型太简单\n- **交叉验证**：K 折 CV 评估泛化性\n- **评估指标**：\n  - 分类：准确率、精确率、召回率、F1、AUC\n  - 回归：MSE、MAE、R²',
          keyTerms: ['偏差-方差', '过拟合', '交叉验证', 'F1', 'AUC'],
        },
      ],
    },
    {
      id: 'ch5-s5',
      title: '深度学习',
      summary: '多层神经网络的学习',
      points: [
        {
          id: 'ch5-s5-p1',
          title: '神经网络基础',
          summary: '感知机 / 反向传播',
          detail: '**神经网络**由神经元层组成：\n- **感知机**：单层神经元，无法解决 XOR\n- **多层感知机 MLP**：含隐藏层，万能逼近器\n- **反向传播**：链式法则计算梯度\n\n前向传播：`h = σ(Wx + b)`\n\n反向传播：从损失 L 出发，逐层求偏导 `∂L/∂W`，使用梯度下降更新。',
          keyTerms: ['MLP', '反向传播', '链式法则', '梯度下降'],
        },
        {
          id: 'ch5-s5-p2',
          title: '激活函数',
          summary: 'Sigmoid / Tanh / ReLU',
          detail: '| 函数 | 公式 | 特点 |\n|------|------|------|\n| Sigmoid | 1/(1+e^-x) | 输出 (0,1)，易梯度消失 |\n| Tanh | (e^x-e^-x)/(e^x+e^-x) | 输出 (-1,1)，零中心 |\n| ReLU | max(0,x) | 计算快，缓解梯度消失 |\n| Leaky ReLU | max(αx,x) | 解决神经元死亡 |\n| GELU | x·Φ(x) | Transformer 默认 |',
          keyTerms: ['Sigmoid', 'ReLU', 'GELU'],
        },
        {
          id: 'ch5-s5-p3',
          title: '优化与正则化',
          summary: 'SGD / Adam / Dropout',
          detail: '**优化器**：\n- SGD、Momentum、RMSProp\n- **Adam**：自适应矩估计，最常用\n\n**正则化**：\n- L1/L2 权重衰减\n- **Dropout**：随机失活神经元\n- **Batch Normalization**：批归一化加速收敛\n- **Layer Normalization**：Transformer 默认',
          keyTerms: ['Adam', 'Dropout', 'BatchNorm'],
        },
      ],
    },
    {
      id: 'ch5-s6',
      title: '计算机视觉',
      summary: '让机器"看懂"世界',
      points: [
        {
          id: 'ch5-s6-p1',
          title: '核心任务',
          summary: '分类 / 检测 / 分割',
          detail: 'CV 三大基础任务：\n- **图像分类**：整图属于哪类（ResNet、ViT）\n- **目标检测**：定位 + 分类（YOLO、Faster R-CNN）\n- **图像分割**：\n  - 语义分割（FCN、U-Net）\n  - 实例分割（Mask R-CNN）\n\n其他任务：姿态估计、超分辨率、生成（GAN、Diffusion）。',
          keyTerms: ['图像分类', '目标检测', '语义分割', 'YOLO'],
        },
        {
          id: 'ch5-s6-p2',
          title: 'CNN 经典架构',
          summary: 'LeNet / AlexNet / ResNet',
          detail: '卷积神经网络发展脉络：\n- **LeNet-5**（1998）：首个商用 CNN，识别手写数字\n- **AlexNet**（2012）：ImageNet 冠军，开启深度学习时代\n- **VGG**（2014）：小卷积核堆叠\n- **GoogLeNet/Inception**（2014）：多尺度并行\n- **ResNet**（2015）：残差连接，深度可达 152 层\n- **EfficientNet**（2019）：复合缩放\n- **ViT**（2020）：Transformer 用于视觉',
          keyTerms: ['LeNet', 'AlexNet', 'ResNet', 'ViT'],
        },
      ],
    },
    {
      id: 'ch5-s7',
      title: '自然语言处理',
      summary: '让机器"理解"语言',
      points: [
        {
          id: 'ch5-s7-p1',
          title: 'NLP 发展阶段',
          summary: '规则 → 统计 → 神经',
          detail: 'NLP 经历三阶段：\n1. **规则方法**（1950-1980）：基于语法规则\n2. **统计方法**（1990-2010）：n-gram、HMM、CRF\n3. **神经方法**（2013-）：词向量（word2vec）、RNN、Transformer',
          keyTerms: ['n-gram', 'HMM', 'CRF', 'word2vec'],
        },
        {
          id: 'ch5-s7-p2',
          title: 'Transformer',
          summary: '现代 NLP 的基石',
          detail: '**Transformer**（《Attention is All You Need》, 2017）核心：\n- **自注意力机制**：任意位置直接交互\n- **多头注意力**：多视角建模\n- **位置编码**：注入顺序信息\n- **Encoder-Decoder** 架构\n\n相比 RNN：\n- 并行计算，训练速度快\n- 长程依赖建模能力强\n\n衍生：BERT（Encoder）、GPT（Decoder）、T5（Encoder-Decoder）。',
          keyTerms: ['Transformer', '自注意力', '多头注意力', '位置编码'],
        },
      ],
    },
    {
      id: 'ch5-s8',
      title: '大语言模型',
      summary: 'LLM 时代',
      points: [
        {
          id: 'ch5-s8-p1',
          title: '预训练范式',
          summary: '预训练 + 微调',
          detail: '大语言模型采用两阶段：\n1. **预训练**：海量无标注文本上自监督学习\n   - 因果语言建模（GPT）：预测下一 token\n   - 掩码语言建模（BERT）：预测被遮蔽 token\n2. **微调**：\n   - 监督微调（SFT）：指令数据\n   - 人类反馈强化学习（RLHF）：偏好对齐\n   - 直接偏好优化（DPO）',
          keyTerms: ['预训练', 'SFT', 'RLHF', 'DPO'],
        },
        {
          id: 'ch5-s8-p2',
          title: '涌现能力与推理',
          summary: 'CoT、ToT、ReAct',
          detail: '模型规模增大出现**涌现能力**：\n- 上下文学习（In-Context Learning）\n- 思维链（Chain-of-Thought, CoT）\n- 工具使用（Tool Use）\n\n代表性模型：\n- GPT 系列（OpenAI）\n- Claude 系列（Anthropic）\n- LLaMA 系列（Meta）\n- 通义千问、文心一言、讯飞星火、DeepSeek 等国产模型',
          keyTerms: ['涌现能力', 'CoT', 'GPT', 'Claude', '讯飞星火'],
        },
      ],
    },
    {
      id: 'ch5-s9',
      title: '智能体',
      summary: '能感知与行动的 AI',
      points: [
        {
          id: 'ch5-s9-p1',
          title: '智能体架构',
          summary: 'PEAS 与理性',
          detail: '**智能体（Agent）**通过感知环境、决策行动来达成目标。\n\n**PEAS** 描述：\n- P：Performance 性能度量\n- E：Environment 环境\n- A：Actuators 执行器\n- S：Sensors 传感器\n\n智能体类型：\n- 简单反射智能体\n- 基于模型的反射智能体\n- 基于目标的智能体\n- 基于效用的智能体\n- 学习智能体',
          keyTerms: ['PEAS', '智能体', '理性'],
        },
        {
          id: 'ch5-s9-p2',
          title: '多智能体系统',
          summary: '协同与博弈',
          detail: '**多智能体系统（MAS）**研究多个智能体在共享环境中的协作与竞争：\n- 合作：分工、协商\n- 博弈：纳什均衡、机制设计\n- 应用：自动驾驶车队、多机器人搬运、智能电网\n\n现代 LLM 智能体：AutoGPT、MetaGPT、LangGraph 编排。',
          keyTerms: ['多智能体', '博弈', 'LangGraph'],
        },
      ],
    },
    {
      id: 'ch5-s10',
      title: '智能机器人',
      summary: '感知-决策-执行一体化',
      points: [
        {
          id: 'ch5-s10-p1',
          title: '机器人组成',
          summary: '感知 / 控制 / 执行',
          detail: '智能机器人三要素：\n- **感知系统**：摄像头、激光雷达、IMU、力传感器\n- **决策与控制**：SLAM、路径规划、运动控制\n- **执行机构**：电机、机械臂、底盘\n\n代表系统：Boston Dynamics Atlas、Tesla Optimus、宇树 H1。',
          keyTerms: ['SLAM', '激光雷达', '运动控制'],
        },
      ],
    },
    {
      id: 'ch5-s11',
      title: '前沿方向',
      summary: '迈向通用智能',
      points: [
        {
          id: 'ch5-s11-p1',
          title: '前沿研究方向',
          summary: 'AGI / 多模态 / 具身智能',
          detail: 'AI 当下前沿方向：\n- **多模态大模型**：GPT-4o、Gemini、Claude 3.5\n- **具身智能**：结合机器人与大模型（RT-2、π0）\n- **世界模型**：Sora 视频生成、World Labs\n- **AI for Science**：AlphaFold、材料发现\n- **可解释 AI**：机械可解释性\n- **AI 对齐**：确保 AI 行为符合人类价值',
          keyTerms: ['多模态', '具身智能', '世界模型', 'AI对齐'],
        },
      ],
    },
  ],
};

// ========== 第六章 应用领域 ==========
const chapter6: KnowledgeChapter = {
  id: 'ch6',
  index: 6,
  title: '人工智能应用领域',
  subtitle: 'AI 赋能千行百业',
  summary: '介绍 AI 在智能制造、医疗、交通、金融、教育、安防、家居七大领域的应用。',
  sections: [
    {
      id: 'ch6-s1',
      title: '智能制造',
      summary: '工业 4.0 的核心引擎',
      points: [
        {
          id: 'ch6-s1-p1',
          title: '智能工厂',
          summary: '预测性维护、视觉质检',
          detail: 'AI 在制造业的应用：\n- **预测性维护**：传感器数据预测设备故障\n- **机器视觉质检**：替代人工检测，准确率 >99%\n- **数字孪生**：虚拟仿真优化生产\n- **智能排产**：强化学习优化调度',
        },
      ],
    },
    {
      id: 'ch6-s2',
      title: '智慧医疗',
      summary: '辅助诊断与药物研发',
      points: [
        {
          id: 'ch6-s2-p1',
          title: '医疗 AI 应用',
          summary: '影像诊断 / 药物发现',
          detail: '- **医学影像**：肺结节、糖网、皮肤癌筛查\n- **药物研发**：AlphaFold 蛋白质结构预测\n- **病历理解**：大模型辅助诊断与编码\n- **手术机器人**：达芬奇机器人',
        },
      ],
    },
    {
      id: 'ch6-s3',
      title: '智能交通',
      summary: '自动驾驶与智慧出行',
      points: [
        {
          id: 'ch6-s3-p1',
          title: '自动驾驶',
          summary: '感知-决策-控制',
          detail: '自动驾驶等级（SAE L0-L5）：\n- L2：辅助驾驶（特斯拉 Autopilot）\n- L3：条件自动驾驶\n- L4：高度自动驾驶（Robotaxi）\n- L5：完全自动驾驶\n\n核心技术：多传感器融合、BEV 感知、端到端模型。',
        },
      ],
    },
    {
      id: 'ch6-s4',
      title: '智能金融',
      summary: '风控与量化',
      points: [
        {
          id: 'ch6-s4-p1',
          title: '金融 AI',
          summary: '风控 / 量化 / 反欺诈',
          detail: '- **信用评分**：基于机器学习评估违约风险\n- **量化交易**：高频策略、深度学习预测\n- **反欺诈**：图神经网络检测异常交易\n- **智能客服**：大模型驱动',
        },
      ],
    },
    {
      id: 'ch6-s5',
      title: '智能教育',
      summary: '个性化学习',
      points: [
        {
          id: 'ch6-s5-p1',
          title: '教育 AI',
          summary: '自适应学习与智能辅导',
          detail: '- **自适应学习**：根据学生掌握度动态调整内容\n- **智能辅导系统（ITS）**：一对一答疑\n- **作文评分**：自动批改与反馈\n- **学习分析**：从行为数据洞察学习模式\n\n本课程「智学伴」即属于此类应用。',
        },
      ],
    },
    {
      id: 'ch6-s6',
      title: '智能安防',
      summary: '视频分析与预警',
      points: [
        {
          id: 'ch6-s6-p1',
          title: '安防 AI',
          summary: '人脸识别 / 行为分析',
          detail: '- **人脸识别**：1:1 比对、1:N 搜索\n- **行为分析**：跌倒、打架、聚集检测\n- **车辆识别**：车牌、车型、颜色\n- **视频结构化**：将视频转为可检索数据',
        },
      ],
    },
    {
      id: 'ch6-s7',
      title: '智能家居',
      summary: '让生活更便捷',
      points: [
        {
          id: 'ch6-s7-p1',
          title: '家居 AI',
          summary: '语音助手 / 智能家电',
          detail: '- **智能音箱**：小爱、小度、天猫精灵\n- **智能家电**：空调、扫地机器人、冰箱\n- **家庭安防**：智能门锁、摄像头\n- **场景联动**：基于行为习惯自动调节',
        },
      ],
    },
  ],
};

// ========== 第七章 伦理与未来趋势 ==========
const chapter7: KnowledgeChapter = {
  id: 'ch7',
  index: 7,
  title: '人工智能伦理与未来趋势',
  subtitle: '科技向善与未来展望',
  summary: '讨论 AI 带来的伦理挑战、安全问题与未来发展方向。',
  sections: [
    {
      id: 'ch7-s1',
      title: '人工智能伦理',
      summary: '科技向善',
      points: [
        {
          id: 'ch7-s1-p1',
          title: '伦理挑战',
          summary: '偏见 / 隐私 / 责任',
          detail: 'AI 主要伦理问题：\n- **算法偏见**：训练数据偏差导致歧视性决策\n- **隐私侵犯**：人脸识别、数据收集\n- **责任归属**：自动驾驶事故谁负责？\n- **透明性**：黑箱模型难以问责\n- **深度伪造**：虚假信息泛滥',
          keyTerms: ['算法偏见', '隐私', '深度伪造'],
        },
      ],
    },
    {
      id: 'ch7-s2',
      title: 'AI 安全与对齐',
      summary: '确保 AI 行为符合人类价值',
      points: [
        {
          id: 'ch7-s2-p1',
          title: '对齐问题',
          summary: 'RLHF / Constitutional AI',
          detail: '**AI 对齐（Alignment）**确保 AI 目标与人类价值一致：\n- **RLHF**：人类反馈强化学习\n- **Constitutional AI**（Anthropic）：基于宪法的自我改进\n- **可解释性**：理解模型内部机制\n- **红队测试**：主动发现危险能力',
          keyTerms: ['AI对齐', 'RLHF', 'Constitutional AI', '红队'],
        },
      ],
    },
    {
      id: 'ch7-s3',
      title: '未来趋势',
      summary: '迈向 AGI',
      points: [
        {
          id: 'ch7-s3-p1',
          title: '未来发展方向',
          summary: 'AGI / 具身智能 / AI for Science',
          detail: 'AI 未来趋势：\n1. **AGI 探索**：通用人工智能\n2. **具身智能**：大模型 + 机器人\n3. **AI for Science**：科研范式变革\n4. **边缘 AI**：在端侧设备运行\n5. **AI 治理**：全球监管框架',
        },
      ],
    },
  ],
};

// ========== 第八章 学习路径与参考资源 ==========
const chapter8: KnowledgeChapter = {
  id: 'ch8',
  index: 8,
  title: '学习路径与参考资源',
  subtitle: '如何系统地学习 AI',
  summary: '提供从入门到进阶的学习路径与权威参考资源。',
  sections: [
    {
      id: 'ch8-s1',
      title: '学习路径',
      summary: '分阶段进阶',
      points: [
        {
          id: 'ch8-s1-p1',
          title: '四阶段路径',
          summary: '基础 / 入门 / 进阶 / 高阶',
          detail: '**阶段一：基础准备**\n- 数学：线性代数、概率论、微积分、最优化\n- 编程：Python、NumPy、Pandas\n\n**阶段二：AI 入门**\n- 概念：AI/ML/DL 关系\n- 经典 ML：监督/无监督/强化\n- 算法：线性回归、决策树、SVM\n\n**阶段三：深度学习进阶**\n- 神经网络基础\n- CNN（CV 方向）\n- RNN/Transformer（NLP 方向）\n- 框架：PyTorch / TensorFlow\n\n**阶段四：前沿高阶**\n- 大模型预训练与微调\n- 多模态、强化学习\n- 论文阅读与复现',
        },
      ],
    },
    {
      id: 'ch8-s2',
      title: '参考资源',
      summary: '权威教材与课程',
      points: [
        {
          id: 'ch8-s2-p1',
          title: '推荐教材',
          summary: '国内外经典教材',
          detail: '**入门**\n- 周志华《机器学习》（西瓜书）\n- 李航《统计学习方法》\n- 《人工智能：一种现代方法》（Russell & Norvig）\n\n**进阶**\n- Goodfellow《Deep Learning》（花书）\n- Bishop《Pattern Recognition and ML》\n\n**实战**\n- 《动手学深度学习》（李沐）\n- 《Dive into Deep Learning》',
        },
        {
          id: 'ch8-s2-p2',
          title: '在线课程',
          summary: 'MOOC 与公开课',
          detail: '- 吴恩达 Machine Learning / Deep Learning Specialization\n- 李宏毅机器学习/生成式 AI 课程\n- Stanford CS231n（CV）、CS224n（NLP）\n- fast.ai 实战课程\n- Hugging Face NLP Course',
        },
      ],
    },
  ],
};

export const knowledgeBase: KnowledgeChapter[] = [
  chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8,
];

// 工具函数：按 ID 查找知识点
export function findKnowledgePoint(id: string): KnowledgePoint | undefined {
  for (const ch of knowledgeBase) {
    for (const sec of ch.sections) {
      const p = sec.points.find((p) => p.id === id);
      if (p) return p;
    }
  }
  return undefined;
}

// 工具函数：统计
export const knowledgeStats = {
  totalChapters: knowledgeBase.length,
  totalSections: knowledgeBase.reduce((acc, ch) => acc + ch.sections.length, 0),
  totalPoints: knowledgeBase.reduce(
    (acc, ch) => acc + ch.sections.reduce((a, s) => a + s.points.length, 0),
    0,
  ),
};
