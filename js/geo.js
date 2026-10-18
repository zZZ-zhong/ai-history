/* ============================================================
   AI EVOLUTION — 地理层
   每个节点的发生地（可多个）。
   坐标为 WGS-84，渲染到腾讯地图前会转成 GCJ-02（见 app.js）。
   字段：place 城市 / country 国家 / lat / lon / note 一句话说明 / cn 是否位于中国境内
   ============================================================ */

window.AI_GEO = {
  'mcp-neuron': [
    {
      place: '芝加哥',
      country: '美国',
      lat: 41.8781,
      lon: -87.6298,
      note: '皮茨在芝加哥大学读本科，麦卡洛克在伊利诺伊大学，两人靠书信往返写完这篇论文。'
    },
    {
      place: '厄巴纳',
      country: '美国',
      lat: 40.102,
      lon: -88.2272,
      note: '论文发表于《数学生物物理学通报》：用理想化的逻辑门单元描述神经元。'
    }
  ],
  'turing-test': [
    {
      place: '曼彻斯特',
      country: '英国',
      lat: 53.4808,
      lon: -2.2426,
      note: '图灵在曼彻斯特大学写下《计算机器与智能》，开篇提出"模仿游戏"。'
    }
  ],
  dartmouth: [
    {
      place: '汉诺威',
      country: '美国',
      lat: 43.7044,
      lon: -72.2887,
      note: '达特茅斯学院暑期研究计划，麦卡锡在提案里第一次写下 Artificial Intelligence。'
    }
  ],
  perceptron: [
    {
      place: '布法罗',
      country: '美国',
      lat: 42.8864,
      lon: -78.8784,
      note: '康奈尔航空实验室的 Mark I 感知机，用 20×20 的光电单元阵列做图像分类。'
    }
  ],
  eliza: [
    {
      place: '剑桥',
      country: '美国',
      lat: 42.3601,
      lon: -71.0942,
      note: '魏泽鲍姆在 MIT 用几百行 MAD-SLIP 脚本，让机器扮演一位心理治疗师。'
    }
  ],
  'perceptron-limits': [
    {
      place: '剑桥',
      country: '美国',
      lat: 42.3601,
      lon: -71.0942,
      note: '明斯基与佩珀特在 MIT 出版《感知机》，证明单层网络连异或都做不了。'
    }
  ],
  xcon: [
    {
      place: '匹兹堡',
      country: '美国',
      lat: 40.4406,
      lon: -79.9959,
      note: '卡内基梅隆为 DEC 写配置系统，规则从几百条长到一万条以上。'
    },
    {
      place: '梅纳德',
      country: '美国',
      lat: 42.4251,
      lon: -71.4498,
      note: 'DEC 总部所在地，XCON 在此上线，据估算每年省下数千万美元。'
    }
  ],
  backprop: [
    {
      place: '拉霍亚',
      country: '美国',
      lat: 32.8328,
      lon: -117.2713,
      note: '鲁梅尔哈特与辛顿在加州大学圣迭戈分校完成《通过反向传播学习表征》。'
    },
    {
      place: '匹兹堡',
      country: '美国',
      lat: 40.4406,
      lon: -79.9959,
      note: '威廉姆斯在卡内基梅隆参与，三人共同署名，实验在两地之间往返。'
    }
  ],
  'deep-blue': [
    {
      place: '约克敦海茨',
      country: '美国',
      lat: 41.2098,
      lon: -73.8009,
      note: 'IBM 沃森研究中心，深蓝的评估函数与专用芯片在这里成型。'
    },
    {
      place: '纽约',
      country: '美国',
      lat: 40.758,
      lon: -73.9855,
      note: '六局对抗在曼哈顿公平大厦进行，最后一局第 19 手，卡斯帕罗夫认输。'
    }
  ],
  'deep-learning': [
    {
      place: '多伦多',
      country: '加拿大',
      lat: 43.6629,
      lon: -79.3957,
      note: '辛顿提出用逐层无监督预训练初始化深层网络，让"深"重新可训练。'
    }
  ],
  'watson-siri': [
    {
      place: '约克敦海茨',
      country: '美国',
      lat: 41.2098,
      lon: -73.8009,
      note: 'Watson 在 IBM 研究院完成，靠检索与置信度打分在《危险边缘》三局两胜。'
    },
    {
      place: '库比蒂诺',
      country: '美国',
      lat: 37.3349,
      lon: -122.009,
      note: 'Siri 随 iPhone 4S 发布，语音助手第一次进入主流手机。'
    }
  ],
  alexnet: [
    {
      place: '多伦多',
      country: '加拿大',
      lat: 43.6629,
      lon: -79.3957,
      note: '两块 GTX 580 显卡训练约六天，Top-5 错误率从 26% 降到 15.3%。'
    },
    {
      place: '佛罗伦萨',
      country: '意大利',
      lat: 43.7696,
      lon: 11.2558,
      note: 'ILSVRC 结果在 ECCV 会场公布，报告厅里临时加座。'
    }
  ],
  alphago: [
    {
      place: '首尔',
      country: '韩国',
      lat: 37.5665,
      lon: 126.978,
      note: '四季酒店五番棋，李世石在第四局下出被称作"神之一手"的第 78 手。'
    },
    {
      place: '伦敦',
      country: '英国',
      lat: 51.5074,
      lon: -0.1278,
      note: 'DeepMind 总部：策略网络、价值网络与蒙特卡洛树搜索在这里合流。'
    }
  ],
  transformer: [
    {
      place: '山景城',
      country: '美国',
      lat: 37.3861,
      lon: -122.0839,
      note: '八位作者在 Google Research 写出《Attention Is All You Need》，全文八页。'
    }
  ],
  pretrain: [
    {
      place: '山景城',
      country: '美国',
      lat: 37.3861,
      lon: -122.0839,
      note: 'BERT 用双向掩码预训练，一次刷新 11 项自然语言理解任务的成绩。'
    },
    {
      place: '旧金山',
      country: '美国',
      lat: 37.7749,
      lon: -122.4194,
      note: 'GPT-1 在 OpenAI 用单向语言模型做生成式预训练，再微调迁移。'
    }
  ],
  gpt3: [
    {
      place: '旧金山',
      country: '美国',
      lat: 37.7749,
      lon: -122.4194,
      note: '1750 亿参数、31 位作者，第一次系统展示"上下文学习"。'
    }
  ],
  chatgpt: [
    {
      place: '旧金山',
      country: '美国',
      lat: 37.7749,
      lon: -122.4194,
      note: '11 月 30 日以"研究预览"发布，两个月用户破亿，成为增长最快的消费应用。'
    },
    {
      place: '伦敦',
      country: '英国',
      lat: 51.5074,
      lon: -0.1278,
      note: 'Stability AI 在伦敦开源 Stable Diffusion，图像生成从实验室扩散到个人电脑。'
    }
  ],
  gpt4: [
    {
      place: '旧金山',
      country: '美国',
      lat: 37.7749,
      lon: -122.4194,
      note: '3 月 14 日发布，支持图像输入，多项专业考试进入人类前列。'
    }
  ],
  'video-open': [
    {
      place: '旧金山',
      country: '美国',
      lat: 37.7749,
      lon: -122.4194,
      note: 'Sora 展示分钟级、镜头连贯的视频生成，把世界模型的话题推到台前。'
    },
    {
      place: '门洛帕克',
      country: '美国',
      lat: 37.4848,
      lon: -122.1484,
      note: 'Meta 连续放出 Llama 系列开放权重，开源模型开始追平闭源。'
    },
    {
      place: '杭州',
      country: '中国',
      lat: 30.2741,
      lon: 120.1551,
      cn: true,
      note: '阿里通义千问、深度求索 DeepSeek 相继开源，中国团队进入第一梯队。'
    }
  ],
  'reasoning-agents': [
    {
      place: '旧金山',
      country: '美国',
      lat: 37.7749,
      lon: -122.4194,
      note: 'o 系列把强化学习带进推理链，"推理时计算"成为新的扩展维度。'
    },
    {
      place: '杭州',
      country: '中国',
      lat: 30.2741,
      lon: 120.1551,
      cn: true,
      note: 'DeepSeek-R1 公开推理模型与训练细节，引发全球范围的复现与蒸馏。'
    },
    {
      place: '伦敦',
      country: '英国',
      lat: 51.5074,
      lon: -0.1278,
      note: 'Anthropic 把工具调用、长任务与计算机操作做成产品化的智能体。'
    }
  ]
};
