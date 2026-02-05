#!/bin/bash
# 语言切换功能部署脚本
# Language Switcher Deployment Script

set -e  # 遇到错误立即退出

echo "🚀 开始部署语言切换功能..."
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 清理可能存在的锁文件
if [ -f .git/index.lock ]; then
    echo "⚠️  发现Git锁文件，正在清理..."
    rm -f .git/index.lock
    echo "✅ 锁文件已清理"
fi

# 检查Git状态
echo ""
echo "📊 检查Git状态..."
git status

# 确认是否继续
echo ""
read -p "是否继续提交并推送? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消部署"
    exit 1
fi

# 创建提交
echo ""
echo "📝 创建Git提交..."
git commit -m "✨ Add bilingual language switcher (中英文切换功能)

新增功能 | New Features:
- 🌐 浮动语言切换按钮 (右上角)
- 🎨 Material Design 风格UI
- ⚡ 一键快速切换中英文
- 📱 完美响应式设计
- 🌙 暗色模式支持
- ⌨️ 键盘快捷键 (Alt + L)
- ♿ 无障碍访问支持

技术实现 | Technical Implementation:
- 新增 language-switcher.js 脚本
- 更新 main.html 添加切换器HTML
- 扩展 extra.css 添加140+行样式
- 配置 mkdocs.yml 引用脚本

文档 | Documentation:
- LANGUAGE_SWITCHER_README.md (功能说明)
- INSTALLATION_GUIDE.md (安装指南)
- CHANGES_SUMMARY.md (变更摘要)
- language-switcher-demo.html (演示页面)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ 提交创建成功"

# 推送到远程仓库
echo ""
echo "⬆️  推送到GitHub..."
git push origin main

echo "✅ 推送成功"

# 部署到GitHub Pages
echo ""
echo "🌐 部署到GitHub Pages..."
mkdocs gh-deploy --force

echo ""
echo "🎉 部署完成！"
echo ""
echo "📍 你的网站将在几分钟内更新："
echo "   https://docs.compliance-waechter.com"
echo ""
echo "💡 提示: 如果看不到更新，请清除浏览器缓存或按 Ctrl+Shift+R 强制刷新"
