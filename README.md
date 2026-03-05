# Casino Games Simulator (Educational Frontend)

一个纯前端的「赌场机制演示」项目，用来体验常见博彩游戏的 UI 设计、概率反馈与行为引导逻辑。

## 1. 项目目标

- 教育演示：展示概率、RTP、短期波动与长期期望
- 交互实验：验证移动端竖屏下的游戏 UI/动效/反馈节奏
- 本地可运行：无需后端，核心数据存放在 `localStorage`

> 本项目不是线上博彩系统，不提供充值、提现或真实货币结算。

## 2. 当前游戏列表

位于 `casino-games/`：

- `index.html`：游戏大厅
- `slot-machine.html`：老虎机
- `lucky-wheel.html`：幸运大转盘
- `blackjack.html`：21 点
- `sic-bo.html`：骰宝
- `scratch-card.html`：刮刮乐选卡页
- `scratch-play.html`：刮刮乐游玩页

## 3. 刮刮乐（v2）核心设计

### 票据与结算

- 票据状态机：`issued -> revealed -> settled`
- 结算幂等：同一票据只会入账一次
- 非法/伪造 ticket 拦截

### 4 档玩法

- `￥10` Emoji 掘金：金额即中
- `￥20` 幸运数字：命中号码 + 倍率区
- `￥50` 喜相逢 Plus：符号区 + 三同金额区
- `￥100` 超级混合票：数字区 + 符号区 + Fast Spot

### 交互规则

- 仅奖区遮罩，标题/规则始终可见
- 刮开为硬擦除（不使用半透明笔刷）
- 刮开进度按“格子揭示比例”计算
- 中奖高亮与 popping 在“全部揭晓后”统一触发
- 金额符号统一为 `￥`

## 4. 统一 UI 系统

- `casino-games/mobile-unified.css`：统一视觉变量与移动端适配
- `casino-games/mobile-unified.js`：统一交互层（按压反馈、顶栏结构、键盘可达、减少动画偏好）

目标：保证大厅与各游戏页在视觉语言、结构层级、交互手感上保持一致，而不是仅换背景色。

## 5. 数据存储（localStorage）

- 全局余额：`casino_global_balance`
- 刮刮乐：
  - `scratch_v2_active_ticket`
  - `scratch_v2_tickets`
  - `scratch_v2_stats`
  - `scratch_v2_prefs`

## 6. 本地运行

直接打开页面即可（无需构建）：

- 入口（推荐）：`index.html` 或 `casino-games/index.html`
- 刮刮乐：`casino-games/scratch-card.html`

## 7. 概率校验（刮刮乐）

```bash
node casino-games/scratch-rtp-sim.js
```

建议每档至少跑 100k 局，观察 RTP 是否收敛到目标区间。

## 8. 免责声明

本仓库仅用于前端交互与概率教育演示，不构成任何博彩服务或投资建议。
