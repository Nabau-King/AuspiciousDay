(function (root, factory) {
  let SolarClass = root.Solar;
  if (!SolarClass && typeof module === "object" && module.exports) {
    SolarClass = require("./vendor/lunar-javascript/lunar.js").Solar;
  }
  const api = factory(SolarClass);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AuspiciousCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Solar) {
  if (!Solar) {
    throw new Error("lunar-javascript Solar API is required before auspicious-core.js");
  }

  const ZODIACS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

  const EVENT_TYPES = {
    moving: {
      key: "moving",
      name: "搬迁/入宅",
      shortName: "搬迁",
      yiKeywords: ["入宅", "移徙", "安床", "安香", "修造"],
      jiKeywords: ["入宅", "移徙", "搬家", "安床"],
      goodZhi: ["成", "开", "定", "除"],
      badZhi: ["破", "闭"],
      focus: "看入宅、移徙、安床等关键词，并避开破日、闭日与冲本人生肖。"
    },
    wedding: {
      key: "wedding",
      name: "结婚/嫁娶",
      shortName: "结婚",
      yiKeywords: ["嫁娶", "纳采", "订盟", "结婚", "冠笄"],
      jiKeywords: ["嫁娶", "纳采", "订盟"],
      goodZhi: ["成", "定", "开"],
      badZhi: ["破", "闭", "危"],
      focus: "优先看嫁娶、纳采、订盟，重视黄道与吉神，避冲生肖。"
    },
    opening: {
      key: "opening",
      name: "开业/开市",
      shortName: "开业",
      yiKeywords: ["开市", "开业", "交易", "立券", "纳财"],
      jiKeywords: ["开市", "交易", "立券", "纳财"],
      goodZhi: ["开", "成", "满"],
      badZhi: ["闭", "破"],
      focus: "优先看开市、交易、立券、纳财，兼看建除值星是否利于启动。"
    }
  };

  const LUCKY_SPIRITS = ["天德", "月德", "天恩", "天喜", "三合", "六合", "母仓", "圣心", "宝光", "金匮", "玉堂", "司命", "明堂"];
  const UNLUCKY_SPIRITS = ["月破", "大耗", "劫煞", "灾煞", "月煞", "月刑", "月害", "四废", "五墓", "天吏", "死神", "土府"];

  const SCORING_MODES = {
    balanced: {
      key: "balanced",
      name: "通用推荐",
      shortName: "推荐",
      description: "综合每日宜忌、黄道黑道、建除值星、吉神凶煞与生肖冲煞，适合作为默认候选排序。"
    },
    yi_only: {
      key: "yi_only",
      name: "仅按宜忌",
      shortName: "宜忌",
      description: "只按每日宜忌是否命中事项给出等级，保留冲生肖提示但不参与评分。"
    },
    strict: {
      key: "strict",
      name: "严格避忌",
      shortName: "严格",
      description: "在通用推荐基础上更保守：黑道、建除不利、凶煞或冲生肖会显著降级。"
    },
    raw: {
      key: "raw",
      name: "原始黄历",
      shortName: "原文",
      description: "尽量贴近黄历原始宜忌：宜项命中即列为可用，忌项命中即列为不宜，不额外叠加神煞分。"
    }
  };

  const SOURCE_PROFILES = {
    local_6tail: {
      key: "local_6tail",
      name: "本地黄历（6tail）",
      shortName: "本地",
      description: "使用内置 lunar-javascript 黄历数据，离线计算每日宜忌、黄道黑道、建除、神煞与冲煞。",
      weights: {
        noYiPenalty: 10,
        yiBase: 28,
        yiExtra: 4,
        jiPenalty: 85,
        yellowBonus: 12,
        blackPenalty: 14,
        goodZhiBonus: 10,
        badZhiPenalty: 16,
        luckyBonus: 4,
        unluckyPenalty: 5,
        zodiacPenalty: 30
      }
    },
    market_yi: {
      key: "market_yi",
      name: "常见万年历（宜忌优先）",
      shortName: "万年历",
      description: "模拟许多万年历产品的展示习惯：更重视每日宜忌命中，弱化黄道、建除、神煞的二次扣分。",
      weights: {
        noYiPenalty: 8,
        yiBase: 34,
        yiExtra: 3,
        jiPenalty: 95,
        yellowBonus: 6,
        blackPenalty: 5,
        goodZhiBonus: 4,
        badZhiPenalty: 6,
        luckyBonus: 2,
        unluckyPenalty: 2,
        zodiacPenalty: 18
      }
    },
    tongshu_strict: {
      key: "tongshu_strict",
      name: "传统通胜（保守）",
      shortName: "通胜",
      description: "模拟更保守的通胜筛选：宜项、黄道、建除、冲煞同时看，不满足关键条件时更容易降级。",
      weights: {
        noYiPenalty: 24,
        yiBase: 24,
        yiExtra: 2,
        jiPenalty: 100,
        yellowBonus: 10,
        blackPenalty: 28,
        goodZhiBonus: 8,
        badZhiPenalty: 30,
        luckyBonus: 4,
        unluckyPenalty: 8,
        zodiacPenalty: 36
      }
    },
    raw_text: {
      key: "raw_text",
      name: "黄历原文（轻评分）",
      shortName: "原文",
      description: "尽量保留原始宜忌结果，只做轻量等级标注，便于和外部黄历页面人工对照。",
      weights: {
        noYiPenalty: 4,
        yiBase: 24,
        yiExtra: 0,
        jiPenalty: 90,
        yellowBonus: 0,
        blackPenalty: 0,
        goodZhiBonus: 0,
        badZhiPenalty: 0,
        luckyBonus: 0,
        unluckyPenalty: 0,
        zodiacPenalty: 0
      }
    }
  };

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseDateKey(value) {
    const [year, month, day] = String(value).split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  function addDays(date, amount) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function eventConfig(eventKey) {
    return EVENT_TYPES[eventKey] || EVENT_TYPES.moving;
  }

  function scoringModeConfig(modeKey) {
    return SCORING_MODES[modeKey] || SCORING_MODES.balanced;
  }

  function sourceProfileConfig(sourceKey) {
    return SOURCE_PROFILES[sourceKey] || SOURCE_PROFILES.local_6tail;
  }

  function uniq(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function matchTerms(source, keywords) {
    return uniq(source.filter((term) => keywords.some((key) => term.includes(key) || key.includes(term))));
  }

  function normalizeZodiac(input) {
    const value = String(input || "").trim();
    if (!value) return "";
    if (/^\d{4}$/.test(value)) {
      const year = Number(value);
      return ZODIACS[((year - 4) % 12 + 12) % 12];
    }
    return ZODIACS.includes(value) ? value : "";
  }

  function gradeFromScore(score, forbidden) {
    if (forbidden || score < 45) return { key: "avoid", label: "不宜", tone: "传统宜忌不支持，建议另选日期。" };
    if (score >= 88) return { key: "excellent", label: "大吉", tone: "多项规则同向支持，可优先列入候选。" };
    if (score >= 68) return { key: "good", label: "可用", tone: "整体可用，仍建议结合现实安排复核。" };
    return { key: "careful", label: "谨慎", tone: "有可取之处，也存在需要避开的信号。" };
  }

  function lunarForDate(date) {
    return Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar();
  }

  function scoreDay(date, eventKey = "moving", zodiacInput = "", modeKey = "balanced", sourceKey = "local_6tail") {
    const event = eventConfig(eventKey);
    const mode = scoringModeConfig(modeKey);
    const source = sourceProfileConfig(sourceKey);
    const weights = source.weights;
    const userZodiac = normalizeZodiac(zodiacInput);
    const lunar = lunarForDate(date);
    const yi = lunar.getDayYi();
    const ji = lunar.getDayJi();
    const jiShen = lunar.getDayJiShen();
    const xiongSha = lunar.getDayXiongSha();
    const zhiXing = lunar.getZhiXing();
    const tianShenType = lunar.getDayTianShenType();
    const tianShenLuck = lunar.getDayTianShenLuck();
    const chongZodiac = lunar.getDayChongShengXiao();
    const yiMatches = matchTerms(yi, event.yiKeywords);
    const jiMatches = matchTerms(ji, event.jiKeywords);
    const luckyMatches = matchTerms(jiShen, LUCKY_SPIRITS);
    const unluckyMatches = matchTerms(xiongSha, UNLUCKY_SPIRITS);
    const zodiacClash = Boolean(userZodiac && userZodiac === chongZodiac);
    const reasons = [];
    const warnings = [];
    let score = mode.key === "yi_only" || mode.key === "raw" ? 50 : 50;
    let forbidden = false;

    if (yiMatches.length) {
      score += (mode.key === "strict" ? Math.min(weights.yiBase, 24) : weights.yiBase) + Math.min(yiMatches.length - 1, 2) * weights.yiExtra;
      reasons.push(`宜项命中：${yiMatches.join("、")}`);
    } else {
      score -= mode.key === "strict" ? Math.max(weights.noYiPenalty, 24) : weights.noYiPenalty;
      warnings.push(`每日宜项未直接出现“${event.shortName}”核心词`);
      if (mode.key === "strict") forbidden = true;
    }

    if (jiMatches.length) {
      score -= weights.jiPenalty;
      forbidden = true;
      warnings.push(`忌项命中：${jiMatches.join("、")}`);
    }

    if (mode.key === "yi_only" || mode.key === "raw") {
      if (yiMatches.length && !jiMatches.length) {
        score = mode.key === "raw" ? 72 : 78;
        reasons.push(`${mode.name}口径不叠加黄道、建除、神煞分`);
      } else if (!yiMatches.length && !jiMatches.length) {
        score = mode.key === "raw" ? 46 : 52;
        warnings.push(`${mode.name}口径下仅能作为备选观察日`);
      }
      if (zodiacClash) warnings.push(`冲本人生肖${userZodiac}，本口径仅提示不扣分`);
    } else {
      if (tianShenType === "黄道" || tianShenLuck === "吉") {
        score += weights.yellowBonus;
        reasons.push(`${lunar.getDayTianShen()}为${tianShenType}${tianShenLuck ? `（${tianShenLuck}）` : ""}`);
      } else {
        score -= mode.key === "strict" ? Math.max(weights.blackPenalty, 26) : weights.blackPenalty;
        warnings.push(`${lunar.getDayTianShen()}为${tianShenType}${tianShenLuck ? `（${tianShenLuck}）` : ""}`);
        if (mode.key === "strict") forbidden = true;
      }

      if (event.goodZhi.includes(zhiXing)) {
        score += weights.goodZhiBonus;
        reasons.push(`建除十二值星为“${zhiXing}”，适合${event.shortName}`);
      }
      if (event.badZhi.includes(zhiXing)) {
        score -= mode.key === "strict" ? Math.max(weights.badZhiPenalty, 28) : weights.badZhiPenalty;
        warnings.push(`建除十二值星为“${zhiXing}”，不利${event.shortName}`);
        if (mode.key === "strict") forbidden = true;
      }

      if (luckyMatches.length) {
        score += Math.min(luckyMatches.length, 3) * weights.luckyBonus;
        reasons.push(`吉神宜趋：${luckyMatches.slice(0, 4).join("、")}`);
      }
      if (unluckyMatches.length) {
        score -= Math.min(unluckyMatches.length, 3) * (mode.key === "strict" ? Math.max(weights.unluckyPenalty, 8) : weights.unluckyPenalty);
        warnings.push(`凶煞提示：${unluckyMatches.slice(0, 4).join("、")}`);
      }

      if (zodiacClash) {
        score -= mode.key === "strict" ? Math.max(weights.zodiacPenalty, 30) : weights.zodiacPenalty;
        warnings.push(`冲本人生肖${userZodiac}，建议谨慎或另选`);
        if (mode.key === "strict") forbidden = true;
      }
    }

    score = Math.max(0, Math.min(100, score));
    const grade = gradeFromScore(score, forbidden);

    return {
      key: dateKey(date),
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
      eventKey: event.key,
      eventName: event.name,
      modeKey: mode.key,
      modeName: mode.name,
      modeDescription: mode.description,
      sourceKey: source.key,
      sourceName: source.name,
      sourceDescription: source.description,
      score,
      grade,
      reasons,
      warnings,
      forbidden,
      zodiacClash,
      userZodiac,
      solarText: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
      weekText: `星期${lunar.getWeekInChinese()}`,
      lunarText: lunar.toString(),
      ganZhiText: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`,
      dayZodiac: lunar.getDayShengXiao(),
      chongText: `${lunar.getDayChongDesc()} ${chongZodiac ? `冲${chongZodiac}` : ""}`.trim(),
      chongZodiac,
      shaText: lunar.getDaySha(),
      zhiXing,
      tianShen: lunar.getDayTianShen(),
      tianShenType,
      tianShenLuck,
      yi,
      ji,
      yiMatches,
      jiMatches,
      jiShen,
      xiongSha,
      positions: {
        xi: `${lunar.getDayPositionXi()}（${lunar.getDayPositionXiDesc()}）`,
        fu: `${lunar.getDayPositionFu()}（${lunar.getDayPositionFuDesc()}）`,
        cai: `${lunar.getDayPositionCai()}（${lunar.getDayPositionCaiDesc()}）`
      }
    };
  }

  function queryAuspiciousDays(options = {}) {
    const eventKey = options.eventKey || "moving";
    const modeKey = options.modeKey || options.scoringMode || "balanced";
    const sourceKey = options.sourceKey || options.almanacSource || "local_6tail";
    const days = Number(options.days || 90);
    const startDate = options.startDate ? parseDateKey(options.startDate) : new Date();
    const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 12, 0, 0);
    const userZodiac = normalizeZodiac(options.zodiac || options.birthYear || "");
    const list = [];
    for (let index = 0; index < days; index += 1) {
      list.push(scoreDay(addDays(normalizedStart, index), eventKey, userZodiac, modeKey, sourceKey));
    }
    return list.sort((a, b) => {
      const gradeWeight = { excellent: 0, good: 1, careful: 2, avoid: 3 };
      const gradeDiff = gradeWeight[a.grade.key] - gradeWeight[b.grade.key];
      if (gradeDiff !== 0) return gradeDiff;
      if (b.score !== a.score) return b.score - a.score;
      return a.date - b.date;
    });
  }

  function summarizeDay(day) {
    const positives = day.reasons.length ? day.reasons.join("；") : "未见强支持项";
    const cautions = day.warnings.length ? day.warnings.join("；") : "未见明显冲突项";
    return `${day.solarText} ${day.weekText}（${day.lunarText}）${day.eventName}：${day.grade.label}，${day.score}分。${positives}。提醒：${cautions}。`;
  }

  return {
    EVENT_TYPES,
    SCORING_MODES,
    SOURCE_PROFILES,
    ZODIACS,
    addDays,
    dateKey,
    eventConfig,
    scoringModeConfig,
    sourceProfileConfig,
    normalizeZodiac,
    queryAuspiciousDays,
    scoreDay,
    summarizeDay
  };
});
