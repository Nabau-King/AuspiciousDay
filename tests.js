const assert = require("assert");
const core = require("./auspicious-core.js");

function at(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

{
  const day = core.scoreDay(at("2026-07-09"), "wedding");
  assert(day.yiMatches.includes("嫁娶"), "wedding should match 嫁娶 in day yi");
  assert.strictEqual(day.grade.label, "大吉");
  assert(day.score >= 88, "excellent days should keep high score");
}

{
  const balanced = core.scoreDay(at("2026-07-02"), "wedding", "", "balanced");
  const yiOnly = core.scoreDay(at("2026-07-02"), "wedding", "", "yi_only");
  assert.strictEqual(yiOnly.modeName, "仅按宜忌");
  assert(yiOnly.reasons.some((item) => item.includes("不叠加黄道")), "yi-only mode should explain its scope");
  assert.notStrictEqual(yiOnly.score, balanced.score, "mode should change score for the same date");
}

{
  const local = core.scoreDay(at("2026-07-05"), "moving", "", "balanced", "local_6tail");
  const market = core.scoreDay(at("2026-07-05"), "moving", "", "balanced", "market_yi");
  assert.strictEqual(market.sourceName, "常见万年历（宜忌优先）");
  assert(market.score > local.score, "market yi-first profile should be more permissive when yi terms match");
}

{
  const balanced = core.scoreDay(at("2026-07-05"), "moving", "", "balanced");
  const strict = core.scoreDay(at("2026-07-05"), "moving", "", "strict");
  assert.strictEqual(strict.modeName, "严格避忌");
  assert(strict.score < balanced.score, "strict mode should downgrade black-road days");
}

{
  const day = core.scoreDay(at("2026-07-01"), "wedding");
  assert(day.jiMatches.includes("嫁娶"), "wedding should detect 忌嫁娶");
  assert.strictEqual(day.forbidden, true);
  assert.strictEqual(day.grade.label, "不宜");
}

{
  const yellow = core.scoreDay(at("2026-07-09"), "opening");
  const black = core.scoreDay(at("2026-07-08"), "opening");
  assert.strictEqual(yellow.tianShenType, "黄道");
  assert.strictEqual(black.tianShenType, "黑道");
  assert(yellow.score > black.score, "黄道 day should outrank comparable 黑道 day");
}

{
  const plain = core.scoreDay(at("2026-07-02"), "wedding");
  const clashed = core.scoreDay(at("2026-07-02"), "wedding", "羊");
  assert.strictEqual(clashed.zodiacClash, true);
  assert(clashed.score < plain.score, "zodiac clash should downgrade score");
  assert(clashed.warnings.some((item) => item.includes("冲本人生肖羊")));
}

{
  const list = core.queryAuspiciousDays({ eventKey: "moving", days: 30, startDate: "2026-07-01", modeKey: "raw", sourceKey: "raw_text" });
  assert.strictEqual(list.length, 30);
  assert(list.every((item) => item.modeKey === "raw"), "query should pass scoring mode to every day");
  assert(list.every((item) => item.sourceKey === "raw_text"), "query should pass source profile to every day");
  for (let index = 1; index < list.length; index += 1) {
    const prev = list[index - 1];
    const next = list[index];
    const weights = { excellent: 0, good: 1, careful: 2, avoid: 3 };
    assert(weights[prev.grade.key] <= weights[next.grade.key], "results should be grouped by recommendation grade");
  }
}

{
  assert.strictEqual(core.normalizeZodiac("1991"), "羊");
  assert.strictEqual(core.normalizeZodiac("羊"), "羊");
  assert.strictEqual(core.normalizeZodiac("not-a-zodiac"), "");
}

console.log("黄道吉日核心规则测试通过");
