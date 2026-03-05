(function () {
  const KEYS = {
    activeTicket: "scratch_v2_active_ticket",
    tickets: "scratch_v2_tickets",
    stats: "scratch_v2_stats",
    prefs: "scratch_v2_prefs",
    migrationDone: "scratch_v2_migration_done",
  };

  const CARD_CONFIGS = {
    bronze: {
      type: "bronze",
      name: "10元档",
      title: "🥉 Emoji 掘金",
      description: "20格里大多是无效 emoji，刮出金额即中奖。",
      gameMode: "emoji_dig",
      price: 10,
      maxPrize: 500,
      distribution: [
        { payout: 10, probability: 0.2 },
        { payout: 20, probability: 0.08 },
        { payout: 50, probability: 0.038 },
        { payout: 100, probability: 0.01 },
        { payout: 200, probability: 0.006 },
        { payout: 500, probability: 0.001 },
        { payout: 0, probability: 0.665 },
      ],
    },
    silver: {
      type: "silver",
      name: "20元档",
      title: "🥈 幸运数字",
      description: "3个中奖数字对比12个我的数字，命中即中，附倍率格。",
      gameMode: "lucky_numbers",
      price: 20,
      maxPrize: 2000,
      distribution: [
        { payout: 20, probability: 0.18 },
        { payout: 40, probability: 0.08 },
        { payout: 100, probability: 0.031 },
        { payout: 200, probability: 0.015 },
        { payout: 500, probability: 0.0056 },
        { payout: 1000, probability: 0.0008 },
        { payout: 2000, probability: 0.0001 },
        { payout: 0, probability: 0.6875 },
      ],
    },
    gold: {
      type: "gold",
      name: "50元档",
      title: "🥇 喜相逢 Plus",
      description: "主区符号命中，副区三同金额，任一区达成即中奖。",
      gameMode: "xi_plus",
      price: 50,
      maxPrize: 5000,
      distribution: [
        { payout: 50, probability: 0.18 },
        { payout: 100, probability: 0.1 },
        { payout: 200, probability: 0.06 },
        { payout: 500, probability: 0.018 },
        { payout: 1000, probability: 0.002 },
        { payout: 2000, probability: 0.0004 },
        { payout: 5000, probability: 0.00004 },
        { payout: 0, probability: 0.63956 },
      ],
    },
    diamond: {
      type: "diamond",
      name: "100元档",
      title: "💎 超级混合票",
      description: "幸运数字区 + 符号区 + Fast Spot，分区命中可叠加派奖。",
      gameMode: "mega_mix",
      price: 100,
      maxPrize: 50000,
      distribution: [
        { payout: 100, probability: 0.2 },
        { payout: 200, probability: 0.11 },
        { payout: 500, probability: 0.055 },
        { payout: 1000, probability: 0.012 },
        { payout: 2000, probability: 0.002 },
        { payout: 5000, probability: 0.0003 },
        { payout: 10000, probability: 0.00008 },
        { payout: 50000, probability: 0.000004 },
        { payout: 0, probability: 0.620616 },
      ],
    },
  };

  const TYPE_KEYS = Object.keys(CARD_CONFIGS);
  const MODE_KEYS = ["emoji_dig", "lucky_numbers", "xi_plus", "mega_mix"];

  function nowIso() {
    return new Date().toISOString();
  }

  function safeParse(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function randomInt(min, max, rng) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function pickOne(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffled(arr, rng) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      const t = copy[i];
      copy[i] = copy[j];
      copy[j] = t;
    }
    return copy;
  }

  function weightedPick(distribution, rng) {
    const roll = rng();
    let cumulative = 0;
    for (const item of distribution) {
      cumulative += item.probability;
      if (roll <= cumulative) return item.payout;
    }
    return distribution[distribution.length - 1].payout;
  }

  function uniqueNumbers(count, min, max, rng, blockedSet) {
    const blocked = blockedSet || new Set();
    const pool = [];
    for (let i = min; i <= max; i += 1) {
      if (!blocked.has(i)) pool.push(i);
    }
    const out = [];
    let copy = pool.slice();
    for (let i = 0; i < count; i += 1) {
      if (!copy.length) break;
      const idx = Math.floor(rng() * copy.length);
      out.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return out;
  }

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `ticket_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  function createStatsShape() {
    const byType = {};
    TYPE_KEYS.forEach((type) => {
      byType[type] = { cards: 0, spent: 0, won: 0 };
    });

    const byMode = {};
    MODE_KEYS.forEach((mode) => {
      byMode[mode] = { cards: 0, spent: 0, won: 0 };
    });

    return {
      totalCards: 0,
      totalSpent: 0,
      totalWon: 0,
      byType,
      byMode,
    };
  }

  function loadTickets() {
    return safeParse(localStorage.getItem(KEYS.tickets), {});
  }

  function saveTickets(tickets) {
    localStorage.setItem(KEYS.tickets, JSON.stringify(tickets));
  }

  function normalizeStats(parsed) {
    const merged = createStatsShape();
    if (!parsed) return merged;

    merged.totalCards = Number(parsed.totalCards || 0);
    merged.totalSpent = Number(parsed.totalSpent || 0);
    merged.totalWon = Number(parsed.totalWon || 0);

    TYPE_KEYS.forEach((type) => {
      const from = parsed.byType && parsed.byType[type] ? parsed.byType[type] : {};
      merged.byType[type].cards = Number(from.cards || 0);
      merged.byType[type].spent = Number(from.spent || 0);
      merged.byType[type].won = Number(from.won || 0);
    });

    if (parsed.byType && parsed.byType.platinum && !parsed.byType.diamond) {
      merged.byType.diamond.cards += Number(parsed.byType.platinum.cards || 0);
      merged.byType.diamond.spent += Number(parsed.byType.platinum.spent || 0);
      merged.byType.diamond.won += Number(parsed.byType.platinum.won || 0);
    }

    MODE_KEYS.forEach((mode) => {
      const from = parsed.byMode && parsed.byMode[mode] ? parsed.byMode[mode] : {};
      merged.byMode[mode].cards = Number(from.cards || 0);
      merged.byMode[mode].spent = Number(from.spent || 0);
      merged.byMode[mode].won = Number(from.won || 0);
    });

    if (parsed.legacyImportedAt) {
      merged.legacyImportedAt = parsed.legacyImportedAt;
    }

    return merged;
  }

  function loadStats() {
    return normalizeStats(safeParse(localStorage.getItem(KEYS.stats), null));
  }

  function saveStats(stats) {
    localStorage.setItem(KEYS.stats, JSON.stringify(normalizeStats(stats)));
  }

  function ensureMigration() {
    if (localStorage.getItem(KEYS.migrationDone) === "1") {
      if (!localStorage.getItem(KEYS.stats)) {
        saveStats(createStatsShape());
      }
      return;
    }

    let stats = createStatsShape();

    const existing = safeParse(localStorage.getItem(KEYS.stats), null);
    if (existing) {
      stats = normalizeStats(existing);
    } else {
      const legacy = safeParse(localStorage.getItem("scratchCardStats"), null);
      if (legacy) {
        stats.totalCards = Number(legacy.totalCards || 0);
        stats.totalSpent = Number(legacy.totalSpent || 0);
        stats.totalWon = Number(legacy.totalWon || 0);
        stats.legacyImportedAt = nowIso();

        // 历史三档按旧类型映射，100档无历史值。
        stats.byType.bronze.cards = Number(legacy.totalCards || 0);
        stats.byType.bronze.spent = Number(legacy.totalSpent || 0);
        stats.byType.bronze.won = Number(legacy.totalWon || 0);
        stats.byMode.emoji_dig.cards = Number(legacy.totalCards || 0);
        stats.byMode.emoji_dig.spent = Number(legacy.totalSpent || 0);
        stats.byMode.emoji_dig.won = Number(legacy.totalWon || 0);
      }
    }

    saveStats(stats);
    if (!localStorage.getItem(KEYS.tickets)) {
      saveTickets({});
    }
    localStorage.setItem(KEYS.migrationDone, "1");
  }

  function ensureInitialized() {
    ensureMigration();
    if (!localStorage.getItem(KEYS.tickets)) {
      saveTickets({});
    }
  }

  function getTicket(ticketId) {
    if (!ticketId) return null;
    const tickets = loadTickets();
    return tickets[ticketId] || null;
  }

  function saveTicket(ticket) {
    const tickets = loadTickets();
    tickets[ticket.id] = ticket;
    saveTickets(tickets);
  }

  function getActiveTicket() {
    const id = localStorage.getItem(KEYS.activeTicket);
    if (!id) return null;
    const ticket = getTicket(id);
    if (!ticket) {
      localStorage.removeItem(KEYS.activeTicket);
      return null;
    }
    if (ticket.status === "settled") {
      localStorage.removeItem(KEYS.activeTicket);
      return null;
    }
    return ticket;
  }

  function setActiveTicket(id) {
    localStorage.setItem(KEYS.activeTicket, id);
  }

  function clearActiveTicketIfMatch(id) {
    if (localStorage.getItem(KEYS.activeTicket) === id) {
      localStorage.removeItem(KEYS.activeTicket);
    }
  }

  function generateEmojiDigOutcome(config, payout, rng) {
    const useless = [
      '\uD83C\uDF4E',
      '\uD83C\uDF4A',
      '\uD83C\uDF4B',
      '\uD83C\uDF49',
      '\uD83C\uDF47',
      '\uD83C\uDF52',
      '\u2B50',
      '\uD83C\uDFB2',
      '\uD83C\uDF81',
      '\uD83D\uDD25',
      '\u26BD',
      '\uD83C\uDF40',
    ];
    const cells = [];
    for (let i = 0; i < 20; i += 1) {
      cells.push({ kind: "emoji", label: pickOne(useless, rng), isWin: false });
    }

    let winningIndex = -1;
    if (payout > 0) {
      winningIndex = randomInt(0, cells.length - 1, rng);
      cells[winningIndex] = { kind: "amount", label: `¥${payout}`, amount: payout, isWin: true };
    }

    return {
      zones: [
        {
          id: "emoji-main",
          title: "主奖区",
          rule: "刮出金额即中奖；仅会出现一个中奖金额。",
          viewType: "emoji_grid",
          data: { columns: 5, cells },
        },
      ],
      payload: {
        mode: config.gameMode,
        winningIndex,
      },
      totalPayout: payout,
    };
  }

  function generateLuckyNumbersOutcome(config, payout, rng) {
    const winningNumbers = uniqueNumbers(3, 1, 35, rng);
    const blocked = new Set(winningNumbers);

    let multiplier = 1;
    let basePrize = 0;
    if (payout > 0) {
      const candidates = [1, 2, 5].filter((m) => payout % m === 0 && payout / m >= 10);
      const weighted = [];
      candidates.forEach((m) => {
        const weight = m === 1 ? 7 : m === 2 ? 2 : 1;
        for (let i = 0; i < weight; i += 1) weighted.push(m);
      });
      multiplier = pickOne(weighted, rng);
      basePrize = Math.floor(payout / multiplier);
    }

    const myNumbers = [];
    if (payout > 0) {
      const matchNumber = pickOne(winningNumbers, rng);
      myNumbers.push({ number: matchNumber, amount: basePrize, isMatch: true, isWin: true });
    }

    const restNumbers = uniqueNumbers(12 - myNumbers.length, 1, 35, rng, blocked);
    restNumbers.forEach((num) => {
      const decoyAmounts = [10, 20, 30, 40, 50, 80, 100, 200];
      myNumbers.push({ number: num, amount: pickOne(decoyAmounts, rng), isMatch: false, isWin: false });
    });

    const arrangedMy = shuffled(myNumbers, rng);

    return {
      zones: [
        {
          id: "numbers-main",
          title: "号码区",
          rule: "我的号码命中任一中奖号码即中该格奖金。",
          viewType: "lucky_numbers",
          data: {
            winningNumbers,
            myNumbers: arrangedMy,
          },
        },
        {
          id: "numbers-multiplier",
          title: "倍率区",
          rule: "中奖时按倍率结算；未中奖时倍率无效。",
          viewType: "multiplier",
          data: {
            symbol: `x${multiplier}`,
            value: multiplier,
            isActive: payout > 0,
          },
        },
      ],
      payload: {
        mode: config.gameMode,
        basePrize,
        multiplier,
      },
      totalPayout: payout,
    };
  }

  function fillNoTriple(values, count, rng, excluded) {
    const blocked = new Set(excluded || []);
    const counts = {};
    const out = [];

    while (out.length < count) {
      const options = values.filter((v) => !blocked.has(v) && (counts[v] || 0) < 2);
      if (!options.length) break;
      const next = pickOne(options, rng);
      counts[next] = (counts[next] || 0) + 1;
      out.push(next);
    }
    return out;
  }

  function generateXiPlusOutcome(config, payout, rng) {
    const source = payout > 0 && rng() < 0.62 ? "symbol" : payout > 0 ? "trio" : "none";
    const symbolPayout = source === "symbol" ? payout : 0;
    const trioPayout = source === "trio" ? payout : 0;

    const regularSymbols = ['\u798F', '\u7984', '\u65FA', '\u5409', '\u9F99', '\u51E4', '\u745E', '\u9526'];
    const decoyAmounts = [50, 80, 100, 150, 200, 300, 500, 800, 1000, 2000];
    const symbolCells = [];
    for (let i = 0; i < 10; i += 1) {
      symbolCells.push({ symbol: pickOne(regularSymbols, rng), isWin: false, multiplier: 1, amount: pickOne(decoyAmounts, rng) });
    }

    if (symbolPayout > 0) {
      const idx = randomInt(0, symbolCells.length - 1, rng);
      const useDouble = symbolPayout % 2 === 0 && rng() < 0.45;
      const symbol = useDouble ? "囍" : "喜";
      const multiplier = useDouble ? 2 : 1;
      symbolCells[idx] = {
        symbol,
        isWin: true,
        multiplier,
        amount: Math.floor(symbolPayout / multiplier),
      };
    }

    const trioValues = [50, 80, 100, 120, 150, 200, 300, 500, 800, 1000, 2000, 5000];
    let trioAmounts = [];
    let trioWinningAmount = 0;
    if (trioPayout > 0) {
      trioWinningAmount = trioPayout;
      trioAmounts = [trioWinningAmount, trioWinningAmount, trioWinningAmount].concat(
        fillNoTriple(trioValues, 6, rng, [trioWinningAmount])
      );
      trioAmounts = shuffled(trioAmounts, rng);
    } else {
      trioAmounts = fillNoTriple(trioValues, 9, rng, []);
      trioAmounts = shuffled(trioAmounts, rng);
    }

    return {
      zones: [
        {
          id: "xi-symbol",
          title: "喜符号区",
          rule: "刮出“喜”得对应奖金；刮出“囍”得双倍奖金。",
          viewType: "symbol_match",
          data: { columns: 5, cells: symbolCells },
        },
        {
          id: "xi-trio",
          title: "三同金额区",
          rule: "9格中若有三个相同金额，即中该金额。",
          viewType: "amount_trio",
          data: { columns: 3, amounts: trioAmounts, winningAmount: trioWinningAmount },
        },
      ],
      payload: {
        mode: config.gameMode,
        source,
        symbolPayout,
        trioPayout,
      },
      totalPayout: payout,
    };
  }

  function allocateMegaPayout(payout, rng) {
    const zoneIds = ["mega-numbers", "mega-symbol", "mega-fast"];
    const out = {
      "mega-numbers": 0,
      "mega-symbol": 0,
      "mega-fast": 0,
    };

    if (payout <= 0) {
      return out;
    }

    if (payout >= 200 && rng() < 0.3) {
      const pair = shuffled(zoneIds, rng).slice(0, 2);
      const splits = [50, 100, 200, 500, 1000, 2000, 5000, 10000].filter((v) => v > 0 && v < payout);
      const legal = splits.filter((v) => payout - v > 0);
      if (legal.length) {
        const first = pickOne(legal, rng);
        out[pair[0]] = first;
        out[pair[1]] = payout - first;
        return out;
      }
    }

    const single = pickOne(zoneIds, rng);
    out[single] = payout;
    return out;
  }

  function generateMegaLuckyZone(payout, rng) {
    const winningNumbers = uniqueNumbers(2, 1, 30, rng);
    const blocked = new Set(winningNumbers);
    const myNumbers = [];

    if (payout > 0) {
      const match = pickOne(winningNumbers, rng);
      myNumbers.push({ number: match, amount: payout, isMatch: true, isWin: true });
    }

    uniqueNumbers(8 - myNumbers.length, 1, 30, rng, blocked).forEach((num) => {
      myNumbers.push({ number: num, amount: pickOne([20, 50, 100, 200], rng), isMatch: false, isWin: false });
    });

    return {
      id: "mega-numbers",
      title: "幸运数字区",
      rule: "命中任一中奖数字，即中该区金额。",
      viewType: "mega_lucky",
      data: {
        winningNumbers,
        myNumbers: shuffled(myNumbers, rng),
      },
    };
  }

  function generateMegaSymbolZone(payout, rng) {
    const symbols = ['\u9526', '\u745E', '\u798F', '\u65FA', '\u9F99', '\u51E4', '\u91D1', '\u7984'];
    const decoyAmounts = [100, 150, 200, 300, 500, 800, 1000, 2000, 5000, 10000];
    const cells = [];
    for (let i = 0; i < 6; i += 1) {
      cells.push({ symbol: pickOne(symbols, rng), isWin: false, amount: pickOne(decoyAmounts, rng) });
    }

    if (payout > 0) {
      const idx = randomInt(0, cells.length - 1, rng);
      cells[idx] = { symbol: "财", isWin: true, amount: payout };
    }

    return {
      id: "mega-symbol",
      title: "符号区",
      rule: "刮出“财”即中该区金额。",
      viewType: "mega_symbol",
      data: {
        cells,
      },
    };
  }

  function generateMegaFastZone(payout, rng) {
    const blanks = ["谢谢", "空", "再来", "未中", "好运"]; 
    const spots = [];
    for (let i = 0; i < 4; i += 1) {
      spots.push({ label: pickOne(blanks, rng), isWin: false, amount: 0 });
    }

    if (payout > 0) {
      const idx = randomInt(0, spots.length - 1, rng);
      spots[idx] = { label: `¥${payout}`, isWin: true, amount: payout };
    }

    return {
      id: "mega-fast",
      title: "Fast Spot",
      rule: "刮出金额即中该区金额。",
      viewType: "fast_spot",
      data: {
        spots,
      },
    };
  }

  function generateMegaMixOutcome(config, payout, rng) {
    const zonePayouts = allocateMegaPayout(payout, rng);
    const zones = [
      generateMegaLuckyZone(zonePayouts["mega-numbers"], rng),
      generateMegaSymbolZone(zonePayouts["mega-symbol"], rng),
      generateMegaFastZone(zonePayouts["mega-fast"], rng),
    ];

    return {
      zones,
      payload: {
        mode: config.gameMode,
        zonePayouts,
      },
      totalPayout: zonePayouts["mega-numbers"] + zonePayouts["mega-symbol"] + zonePayouts["mega-fast"],
    };
  }

  function generateOutcome(config, payout, rng) {
    switch (config.gameMode) {
      case "emoji_dig":
        return generateEmojiDigOutcome(config, payout, rng);
      case "lucky_numbers":
        return generateLuckyNumbersOutcome(config, payout, rng);
      case "xi_plus":
        return generateXiPlusOutcome(config, payout, rng);
      case "mega_mix":
        return generateMegaMixOutcome(config, payout, rng);
      default:
        return generateEmojiDigOutcome(config, payout, rng);
    }
  }

  function createTicket(type, rng) {
    ensureInitialized();
    const config = CARD_CONFIGS[type];
    if (!config) {
      return { ok: false, message: "未知卡片类型" };
    }

    const balanceApi = window.globalBalance;
    if (!balanceApi || typeof balanceApi.getBalance !== "function") {
      return { ok: false, message: "余额系统不可用" };
    }

    const balance = Number(balanceApi.getBalance() || 0);
    if (balance < config.price) {
      return { ok: false, message: "余额不足" };
    }

    const random = typeof rng === "function" ? rng : Math.random;
    const payoutPicked = weightedPick(config.distribution, random);
    const generated = generateOutcome(config, payoutPicked, random);
    const finalPayout = Number(generated.totalPayout || 0);

    const ticket = {
      id: randomId(),
      type: config.type,
      price: config.price,
      gameMode: config.gameMode,
      status: "issued",
      payout: finalPayout,
      zones: generated.zones,
      outcome: {
        variant: config.gameMode,
        payload: generated.payload,
      },
      createdAt: nowIso(),
      revealedAt: null,
      settledAt: null,
    };

    balanceApi.setBalance(balance - config.price);
    saveTicket(ticket);
    setActiveTicket(ticket.id);

    const stats = loadStats();
    stats.totalCards += 1;
    stats.totalSpent += config.price;
    stats.byType[config.type].cards += 1;
    stats.byType[config.type].spent += config.price;
    stats.byMode[config.gameMode].cards += 1;
    stats.byMode[config.gameMode].spent += config.price;
    saveStats(stats);

    return { ok: true, ticket };
  }

  function markRevealed(ticketId) {
    const ticket = getTicket(ticketId);
    if (!ticket) return { ok: false, message: "票据不存在" };

    if (ticket.status === "issued") {
      ticket.status = "revealed";
      ticket.revealedAt = nowIso();
      saveTicket(ticket);
    }

    return { ok: true, ticket };
  }

  function settleTicket(ticketId) {
    const ticket = getTicket(ticketId);
    if (!ticket) return { ok: false, message: "票据不存在" };

    if (ticket.status === "settled") {
      return { ok: true, ticket, credited: 0 };
    }

    const balanceApi = window.globalBalance;
    if (!balanceApi || typeof balanceApi.getBalance !== "function") {
      return { ok: false, message: "余额系统不可用" };
    }

    const payout = Number(ticket.payout || 0);
    if (payout > 0) {
      const current = Number(balanceApi.getBalance() || 0);
      balanceApi.setBalance(current + payout);
    }

    const stats = loadStats();
    if (payout > 0) {
      stats.totalWon += payout;
      if (stats.byType[ticket.type]) {
        stats.byType[ticket.type].won += payout;
      }
      if (stats.byMode[ticket.gameMode]) {
        stats.byMode[ticket.gameMode].won += payout;
      }
      saveStats(stats);
    }

    ticket.status = "settled";
    if (!ticket.revealedAt) ticket.revealedAt = nowIso();
    ticket.settledAt = nowIso();
    saveTicket(ticket);
    clearActiveTicketIfMatch(ticket.id);

    return { ok: true, ticket, credited: payout };
  }

  function getStats() {
    ensureInitialized();
    return loadStats();
  }

  function getPrefs() {
    const defaults = { sound: true, vibration: true };
    const parsed = safeParse(localStorage.getItem(KEYS.prefs), defaults);
    return {
      sound: parsed.sound !== false,
      vibration: parsed.vibration !== false,
    };
  }

  function setPrefs(next) {
    const prefs = {
      sound: !!next.sound,
      vibration: !!next.vibration,
    };
    localStorage.setItem(KEYS.prefs, JSON.stringify(prefs));
    return prefs;
  }

  function getCardConfig(type) {
    const config = CARD_CONFIGS[type];
    if (!config) return null;

    const expected = config.distribution.reduce((sum, item) => sum + item.payout * item.probability, 0);
    const jackpot = config.distribution
      .filter((item) => item.payout > 0)
      .sort((a, b) => b.payout - a.payout)[0];

    return {
      type: config.type,
      name: config.name,
      title: config.title,
      description: config.description,
      gameMode: config.gameMode,
      price: config.price,
      maxPrize: config.maxPrize,
      distribution: config.distribution.map((item) => ({ payout: item.payout, probability: item.probability })),
      theoreticalRtp: (expected / config.price) * 100,
      jackpotProbability: jackpot ? jackpot.probability : 0,
    };
  }

  function getCardConfigs() {
    return TYPE_KEYS.map(getCardConfig).filter(Boolean);
  }

  window.ScratchV2 = {
    KEYS,
    ensureInitialized,
    getCardConfig,
    getCardConfigs,
    createTicket,
    getTicket,
    getActiveTicket,
    markRevealed,
    settleTicket,
    getStats,
    getPrefs,
    setPrefs,
    formatPercent(value) {
      return `${(value * 100).toFixed(4).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")}%`;
    },
    theoreticalRtp(type) {
      const cfg = CARD_CONFIGS[type];
      if (!cfg) return 0;
      const expected = cfg.distribution.reduce((sum, item) => sum + item.payout * item.probability, 0);
      return (expected / cfg.price) * 100;
    },
    simulate(type, rounds, rng) {
      const cfg = CARD_CONFIGS[type];
      if (!cfg) throw new Error("unknown card type");
      const random = typeof rng === "function" ? rng : Math.random;
      let spent = 0;
      let won = 0;
      for (let i = 0; i < rounds; i += 1) {
        spent += cfg.price;
        won += weightedPick(cfg.distribution, random);
      }
      return {
        type,
        rounds,
        spent,
        won,
        rtp: spent > 0 ? (won / spent) * 100 : 0,
      };
    },
  };
})();




