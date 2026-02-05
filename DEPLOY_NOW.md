# 🚀 快速部署指南

## ⚡ 一键部署 (推荐)

在你的终端中运行以下命令：

```bash
cd /path/to/automotive-develop-architecture
./deploy.sh
```

脚本会自动：
1. ✅ 清理Git锁文件
2. ✅ 显示Git状态
3. ✅ 创建提交
4. ✅ 推送到GitHub
5. ✅ 部署到GitHub Pages

---

## 📋 手动部署 (如果脚本失败)

### 步骤 1: 清理锁文件
```bash
cd /path/to/automotive-develop-architecture
rm -f .git/index.lock
```

### 步骤 2: 检查状态
```bash
git status
```

你应该看到以下文件准备提交：
- ✅ mkdocs.yml
- ✅ overrides/main.html
- ✅ stylesheets/extra.css
- ✅ docs/javascripts/language-switcher.js
- ✅ CHANGES_SUMMARY.md
- ✅ INSTALLATION_GUIDE.md
- ✅ LANGUAGE_SWITCHER_README.md
- ✅ language-switcher-demo.html

### 步骤 3: 创建提交
```bash
git commit -m "Add bilingual language switcher

- Added floating language switcher button
- Material Design styled UI
- Responsive design
- Dark mode support
- Keyboard shortcuts
- Complete documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 步骤 4: 推送到GitHub
```bash
git push origin main
```

### 步骤 5: 部署到GitHub Pages
```bash
mkdocs gh-deploy --force
```

---

## 🌐 验证部署

访问你的网站并验证：
- 🔗 https://docs.compliance-waechter.com

检查项目：
- [ ] 右上角显示语言切换按钮
- [ ] 点击按钮可以展开中英文选项
- [ ] 切换语言功能正常
- [ ] 移动端显示正常
- [ ] 暗色模式下显示正常

---

## ⏱️ 部署时间

- GitHub推送：即时
- GitHub Pages更新：1-3分钟
- CDN缓存刷新：5-10分钟

如果看不到更新，请：
1. 等待5-10分钟
2. 清除浏览器缓存
3. 按 `Ctrl + Shift + R` (或 `Cmd + Shift + R`) 强制刷新

---

## ❓ 常见问题

### Q: 部署后看不到语言切换器？
**A:**
1. 检查浏览器控制台是否有JavaScript错误
2. 确认 GitHub Pages 部署成功
3. 清除浏览器缓存
4. 等待CDN缓存刷新（最多10分钟）

### Q: Git推送失败？
**A:**
1. 确认你有仓库的写权限
2. 检查网络连接
3. 如需身份验证，使用GitHub Personal Access Token

### Q: mkdocs gh-deploy 失败？
**A:**
1. 确认已安装 mkdocs-material 和 mkdocs-static-i18n
2. 检查 mkdocs.yml 配置
3. 尝试先本地构建：`mkdocs build`

---

## 📞 需要帮助？

如遇到问题，请：
1. 查看 INSTALLATION_GUIDE.md
2. 查看 LANGUAGE_SWITCHER_README.md
3. 联系: haiqing.lin@compliance-waechter.com

---

<div align="center">

**🎉 准备好了吗？运行 `./deploy.sh` 开始部署！**

</div>
