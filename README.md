# 黄道吉日查询

一个可直接部署到 GitHub Pages 的纯静态黄道吉日查询工具。首版支持搬迁/入宅、结婚/嫁娶、开业/开市，并可选填写生肖或出生年提示冲煞。

## 运行方式

直接打开 `index.html` 即可使用，不需要构建工具、后端服务或第三方 CDN。

## GitHub Pages 部署

本仓库使用 `.github/workflows/static.yml` 通过 GitHub Actions 发布到 Pages。首次使用前需要在仓库页面完成一次设置：

1. 打开 `Settings` -> `Pages`。
2. 在 `Build and deployment` 的 `Source` 中选择 `GitHub Actions`。
3. 保存后重新运行 `Deploy static content to Pages` workflow，或向 `main` 分支推送一次提交。

如果 `Upload artifact` 成功但 `Deploy to GitHub Pages` 失败，通常是 Pages 尚未启用，或发布源还没有切换到 `GitHub Actions`。

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


## 说明

结果基于传统黄历通用规则，用于择日参考和整理候选日期，不替代法律、财务、医疗、安全或其他高风险现实决策。
