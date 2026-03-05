/**
 * 老虎机概率模拟器
 * 展示虚拟卷轴、RTP计算、near-miss效应
 */

class SlotMachine {
  constructor() {
    // 虚拟卷轴定义 - 每个符号映射到不同数量的虚拟位置
    this.symbols = {
      '💎': { weight: 5, name: 'Diamond' },
      '7️⃣': { weight: 30, name: 'Seven' },
      '🍊': { weight: 40, name: 'Orange' },
      '🍋': { weight: 50, name: 'Lemon' },
      '🍒': { weight: 60, name: 'Cherry' },
      'BAR': { weight: 71, name: 'Bar' }
    };

    // 赔付表
    this.payouts = {
      '💎💎💎': 5000,
      '7️⃣7️⃣7️⃣': 200,
      '🍊🍊🍊': 50,
      '🍋🍋🍋': 20,
      '🍒🍒🍒': 10,
      '🍒🍒': 2,  // 任意两个樱桃
      '🍒': 1     // 单个樱桃
    };

    this.totalWeight = Object.values(this.symbols).reduce((sum, s) => sum + s.weight, 0);
    
    // 统计数据
    this.stats = {
      totalSpins: 0,
      totalBet: 0,
      totalWin: 0,
      wins: {},
      nearMisses: 0
    };
  }

  // 根据权重随机选择符号
  spinReel() {
    const random = Math.floor(Math.random() * this.totalWeight);
    let cumulative = 0;
    
    for (const [symbol, data] of Object.entries(this.symbols)) {
      cumulative += data.weight;
      if (random < cumulative) {
        return symbol;
      }
    }
    return 'BAR';
  }

  // 检测near-miss（前两个匹配高价值符号，第三个不匹配）
  checkNearMiss(reels) {
    const highValue = ['💎', '7️⃣'];
    if (highValue.includes(reels[0]) && reels[0] === reels[1] && reels[0] !== reels[2]) {
      return true;
    }
    return false;
  }

  // 计算赔付
  calculatePayout(reels) {
    const key = reels.join('');
    
    // 检查三个相同
    if (this.payouts[key]) {
      return { amount: this.payouts[key], type: key };
    }
    
    // 检查两个樱桃
    const cherryCount = reels.filter(r => r === '🍒').length;
    if (cherryCount === 2) {
      return { amount: this.payouts['🍒🍒'], type: '🍒🍒' };
    }
    if (cherryCount === 1) {
      return { amount: this.payouts['🍒'], type: '🍒' };
    }
    
    return { amount: 0, type: 'loss' };
  }

  // 单次旋转
  spin(bet = 10) {
    const reels = [this.spinReel(), this.spinReel(), this.spinReel()];
    const payout = this.calculatePayout(reels);
    const winAmount = payout.amount * bet;
    
    // 更新统计
    this.stats.totalSpins++;
    this.stats.totalBet += bet;
    this.stats.totalWin += winAmount;
    
    if (payout.amount > 0) {
      this.stats.wins[payout.type] = (this.stats.wins[payout.type] || 0) + 1;
    }
    
    if (this.checkNearMiss(reels)) {
      this.stats.nearMisses++;
    }
    
    return {
      reels,
      payout: payout.amount,
      winAmount,
      netProfit: winAmount - bet,
      isNearMiss: this.checkNearMiss(reels)
    };
  }

  // 批量模拟
  simulate(spins, bet = 10) {
    console.log(`\n🎰 开始模拟 ${spins.toLocaleString()} 次旋转 (每次下注 ${bet} 元)\n`);
    
    for (let i = 0; i < spins; i++) {
      this.spin(bet);
    }
    
    this.printStats();
  }

  // 打印统计
  printStats() {
    const rtp = (this.stats.totalWin / this.stats.totalBet * 100).toFixed(2);
    const housEdge = (100 - rtp).toFixed(2);
    const nearMissRate = (this.stats.nearMisses / this.stats.totalSpins * 100).toFixed(2);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 模拟结果统计');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`总旋转次数: ${this.stats.totalSpins.toLocaleString()}`);
    console.log(`总投注额:   ¥${this.stats.totalBet.toLocaleString()}`);
    console.log(`总赢得额:   ¥${this.stats.totalWin.toLocaleString()}`);
    console.log(`净亏损:     ¥${(this.stats.totalBet - this.stats.totalWin).toLocaleString()}`);
    console.log('───────────────────────────────────────────────────────');
    console.log(`💰 RTP (玩家回报率):  ${rtp}%`);
    console.log(`🏦 赌场优势:          ${housEdge}%`);
    console.log(`😱 Near-Miss 比率:    ${nearMissRate}%`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('🎯 中奖分布:');
    console.log('───────────────────────────────────────────────────────');
    
    // 按赔付排序
    const sortedWins = Object.entries(this.stats.wins)
      .sort((a, b) => (this.payouts[b[0]] || 0) - (this.payouts[a[0]] || 0));
    
    for (const [combo, count] of sortedWins) {
      const rate = (count / this.stats.totalSpins * 100).toFixed(4);
      const payout = this.payouts[combo];
      const contribution = (count * payout / this.stats.totalBet * 100).toFixed(2);
      console.log(`${combo.padEnd(8)} | 中奖 ${count.toString().padStart(6)} 次 | 概率 ${rate.padStart(7)}% | 赔付 ${payout.toString().padStart(4)}x | RTP贡献 ${contribution}%`);
    }
    
    const lossCount = this.stats.totalSpins - Object.values(this.stats.wins).reduce((a, b) => a + b, 0);
    const lossRate = (lossCount / this.stats.totalSpins * 100).toFixed(2);
    console.log(`未中奖    | ${lossCount.toString().padStart(6)} 次 | 概率 ${lossRate.padStart(7)}%`);
    console.log('═══════════════════════════════════════════════════════\n');
  }

  // 理论RTP计算
  calculateTheoreticalRTP() {
    console.log('\n📐 理论RTP计算');
    console.log('═══════════════════════════════════════════════════════');
    
    let totalRTP = 0;
    const totalCombinations = Math.pow(this.totalWeight, 3);
    
    for (const [combo, payout] of Object.entries(this.payouts)) {
      if (combo.length === 3 && combo[0] === combo[1] && combo[1] === combo[2]) {
        // 三个相同符号
        const symbol = combo[0];
        const weight = this.symbols[symbol].weight;
        const probability = Math.pow(weight, 3) / totalCombinations;
        const rtpContribution = probability * payout * 100;
        totalRTP += rtpContribution;
        
        console.log(`${combo} | 概率 1/${Math.floor(1/probability).toLocaleString()} | 赔付 ${payout}x | RTP贡献 ${rtpContribution.toFixed(2)}%`);
      }
    }
    
    // 两个樱桃的概率（简化计算）
    const cherryWeight = this.symbols['🍒'].weight;
    const otherWeight = this.totalWeight - cherryWeight;
    const twoCherryProb = (3 * Math.pow(cherryWeight, 2) * otherWeight) / totalCombinations;
    const twoCherryRTP = twoCherryProb * this.payouts['🍒🍒'] * 100;
    totalRTP += twoCherryRTP;
    console.log(`🍒🍒   | 概率 1/${Math.floor(1/twoCherryProb).toLocaleString()} | 赔付 ${this.payouts['🍒🍒']}x | RTP贡献 ${twoCherryRTP.toFixed(2)}%`);
    
    // 单个樱桃
    const oneCherryProb = (3 * cherryWeight * Math.pow(otherWeight, 2)) / totalCombinations;
    const oneCherryRTP = oneCherryProb * this.payouts['🍒'] * 100;
    totalRTP += oneCherryRTP;
    console.log(`🍒     | 概率 1/${Math.floor(1/oneCherryProb).toLocaleString()} | 赔付 ${this.payouts['🍒']}x | RTP贡献 ${oneCherryRTP.toFixed(2)}%`);
    
    console.log('───────────────────────────────────────────────────────');
    console.log(`📊 理论总RTP: ${totalRTP.toFixed(2)}%`);
    console.log(`🏦 理论赌场优势: ${(100 - totalRTP).toFixed(2)}%`);
    console.log('═══════════════════════════════════════════════════════\n');
  }

  // 演示单次旋转
  demo(count = 10) {
    console.log('\n🎰 演示模式 - 观察实际旋转\n');
    
    for (let i = 0; i < count; i++) {
      const result = this.spin(10);
      const status = result.netProfit > 0 ? '✅ 赢' : result.netProfit === 0 ? '➖ 平' : '❌ 输';
      const nearMiss = result.isNearMiss ? ' 🔥 NEAR-MISS!' : '';
      
      console.log(`#${(i + 1).toString().padStart(2)} | ${result.reels.join(' ')} | 赔付 ${result.payout}x | 净利 ${result.netProfit > 0 ? '+' : ''}${result.netProfit} 元 | ${status}${nearMiss}`);
    }
    console.log('');
  }
}

// ============ 运行模拟 ============

const machine = new SlotMachine();

// 1. 显示理论RTP
machine.calculateTheoreticalRTP();

// 2. 演示10次旋转
machine.demo(10);

// 3. 模拟10,000次
machine.simulate(10000, 10);

// 4. 展示长期趋势
console.log('💡 关键洞察:');
console.log('───────────────────────────────────────────────────────');
console.log('1. RTP接近理论值，但短期波动巨大');
console.log('2. Near-Miss频繁出现，制造"差一点"的错觉');
console.log('3. 小奖频繁（维持希望），大奖稀少（刺激梦想）');
console.log('4. 长期来看，玩家必输（赌场优势）');
console.log('═══════════════════════════════════════════════════════\n');
