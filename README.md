# 黄道吉日查询

一个可直接部署到 GitHub Pages 的纯静态黄道吉日查询工具。首版支持搬迁/入宅、结婚/嫁娶、开业/开市，并可选填写生肖或出生年提示冲煞。

## 运行方式

直接打开 `index.html` 即可使用，不需要构建工具、后端服务或第三方 CDN。

## 文件结构

- `index.html`：应用主页面，包含界面样式与交互逻辑。
- `auspicious-core.js`：黄历数据读取、事项匹配、评分与结果摘要。
- `vendor/lunar-javascript/`：`lunar-javascript@1.7.7` 离线库与 MIT 许可文件。
- `manifest.json` / `sw.js`：PWA 安装与离线缓存支持。
- `tests.js`：核心评分规则测试。

## 当前功能

- 查询未来 30、90、180、365 天的候选吉日。
- 支持搬迁/入宅、结婚/嫁娶、开业/开市三类事项。
- 输出公历、农历、星期、干支、建除、黄道黑道、宜忌命中、冲煞、推荐等级。
- 支持可选生肖/出生年，用于标记冲本人生肖的日期。
- 支持日期详情、复制结果、本地历史记录、分享卡片 PNG。
- 支持浅色/深色主题与 PWA 离线访问。

## 测试

如果本地有 Node.js，可运行：

```bash
node tests.js
```

在 Codex 桌面环境中可使用 bundled Node：

```bash
C:\Users\Nabau\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe tests.js
```

## 说明

结果基于传统黄历通用规则，用于择日参考和整理候选日期，不替代法律、财务、医疗、安全或其他高风险现实决策。
