# 🎰 赌场游戏集合

一个交互式的赌场游戏合集，用于展示赌场数学模型、概率设计和心理学原理。

## 🎮 在线体验

[点击这里进入游戏大厅](https://xmeowchan.github.io/casino-games/)

## 🎲 游戏列表

### ✅ 已完成

#### 🎰 老虎机
- 真实的旋转动画效果
- 可调节下注金额（¥10/20/50/100）
- 实时显示余额、旋转次数、RTP
- 不同中奖类型的视觉反馈
- Near-miss 效应演示
- 累进奖池系统
- 连胜倍数加成
- 赌场级音效系统
- 完整的赔付表

### 🚧 即将推出

#### 🎡 轮盘赌
- 欧洲轮盘（单零）vs 美国轮盘（双零）
- 多种下注方式（直注、分注、街注等）
- 实时赔率计算
- 赌场优势对比

#### 🃏 21点（黑杰克）
- 经典规则实现
- 基本策略提示
- 算牌系统演示
- 多手牌模式

#### 🎲 骰宝
- 三骰子系统
- 多种下注组合
- 概率分布可视化
- 期望值计算

#### 💎 百家乐
- 庄闲对比
- 抽水机制
- 路单系统
- 概率分析

#### ♠️ 德州扑克
- 完整的德州扑克规则
- AI 对手
- 手牌概率计算
- 博弈论基础

## ✨ 教育目的

这个项目展示了：
- 赌场游戏的数学模型
- 概率论与统计学应用
- 心理学效应（Near-miss、损失厌恶等）
- 赌场优势（House Edge）的计算
- 长期来看玩家必输的数学原理
- 不同游戏的 RTP（玩家回报率）

## 🚀 本地运行

```bash
# 克隆仓库
git clone https://github.com/xmeowchan/casino-games.git

# 直接在浏览器中打开
open casino-games/index.html
```

或者使用本地服务器：

```bash
cd casino-games
python -m http.server 8000
# 访问 http://localhost:8000
```

## 📁 项目结构

```
casino-games/
├── index.html              # 游戏大厅主页
├── slot-machine.html       # 老虎机游戏
├── roulette.html          # 轮盘赌（即将推出）
├── blackjack.html         # 21点（即将推出）
├── sic-bo.html            # 骰宝（即将推出）
├── baccarat.html          # 百家乐（即将推出）
└── poker.html             # 德州扑克（即将推出）
```

## 🎨 技术特点

- 纯前端实现，无需后端
- 响应式设计，支持移动端
- Web Audio API 合成音效
- CSS3 动画和过渡效果
- LocalStorage 存档系统
- 真实的概率模型

## ⚠️ 免责声明

本项目仅用于教育和演示目的，展示赌博的数学原理和心理学效应。

**请勿用于真实赌博。赌博有风险，参与需谨慎。**

## 📖 相关资源

- [概率论基础](https://en.wikipedia.org/wiki/Probability_theory)
- [赌场优势计算](https://en.wikipedia.org/wiki/House_edge)
- [Near-miss 效应](https://en.wikipedia.org/wiki/Near-miss_(psychology))
- [虚拟卷轴技术](https://en.wikipedia.org/wiki/Slot_machine#Virtual_reels)

## 📄 许可

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果你想添加新的游戏或改进现有功能，请随时贡献。

---

**记住：赌场永远是赢家。这些游戏只是为了让你理解为什么。**
