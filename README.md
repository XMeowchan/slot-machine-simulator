# Slot Machine Simulator (Educational)

一个前端本地运行的小游戏集合，当前重点是中国风刮刮乐演示。

## 项目定位

- 教育演示：展示概率、RTP、期望值与短期波动
- 本地实现：不依赖后端，数据存储在浏览器 `localStorage`
- 非真实博彩系统：不提供提现、不做服务器防篡改

## 主要功能

- 4 档刮刮乐：`￥10 / ￥20 / ￥50 / ￥100`
- 玩法模式：
  - `￥10` Emoji 掘金（金额即中）
  - `￥20` 幸运数字（命中 + 倍率区）
  - `￥50` 喜相逢 Plus（符号区 + 三同金额区）
  - `￥100` 超级混合票（幸运数字 + 符号区 + Fast Spot）
- 票据状态机：`issued -> revealed -> settled`
- 幂等结算：同一票据不会重复派奖
- 进度按格子计算（不是整区像素）

## 关键规则（当前版本）

- 只有奖区会被遮罩，标题/规则始终可见
- 刮开使用硬擦除，不使用半透明笔刷
- 中奖高亮与 popping 在“全部揭晓”后统一触发
- 金额显示统一使用 `￥`

## 数据结构（localStorage）

- `casino_global_balance`
- `scratch_v2_active_ticket`
- `scratch_v2_tickets`
- `scratch_v2_stats`
- `scratch_v2_prefs`

## 本地运行

直接打开以下页面即可：

- 购票页：`casino-games/scratch-card.html`
- 刮卡页：`casino-games/scratch-play.html?ticket=<id>`

## 验证建议

- 正常流程：购票 -> 刮开 -> 结算一次
- 异常流程：无 ticket 或伪造 ticket 需拦截
- 刷新/回退/重复点击揭晓，不可重复派奖
- 运行 RTP 脚本观察长期收敛：

```bash
node casino-games/scratch-rtp-sim.js
```

## 免责声明

本仓库用于前端交互与概率教育演示，不构成任何博彩服务。
