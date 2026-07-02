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
  const list = core.queryAuspiciousDays({ eventKey: "moving", days: 30, startDate: "2026-07-01" });
  assert.strictEqual(list.length, 30);
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
