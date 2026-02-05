# 语言切换功能安装指南 | Installation Guide

## 📦 已完成的修改 | Completed Modifications

### 1. 文件修改 | File Modifications

#### ✅ `overrides/main.html`
- 添加了语言切换器HTML结构
- 集成了浮动按钮和下拉菜单

#### ✅ `stylesheets/extra.css`
- 新增140+行CSS样式代码
- 响应式设计支持
- 暗色模式适配
- 动画效果

#### ✅ `docs/javascripts/language-switcher.js` (新建)
- 完整的语言切换逻辑
- 智能路径检测和转换
- 键盘快捷键支持
- 无障碍功能

#### ✅ `mkdocs.yml`
- 添加了 `language-switcher.js` 引用

---

## 🚀 快速开始 | Quick Start

### 方法一：本地预览 | Method 1: Local Preview

```bash
# 1. 进入项目目录
cd /path/to/automotive-develop-architecture

# 2. 激活虚拟环境 (如果有)
source .venv/bin/activate

# 3. 启动本地服务器
mkdocs serve

# 4. 打开浏览器访问
# http://127.0.0.1:8000
```

### 方法二：直接预览演示 | Method 2: Demo Preview

打开项目根目录下的 `language-switcher-demo.html` 文件，可以直接在浏览器中预览语言切换功能的效果。

```bash
# 在浏览器中打开
open language-switcher-demo.html
# 或
firefox language-switcher-demo.html
```

### 方法三：构建静态网站 | Method 3: Build Static Site

```bash
# 构建网站
mkdocs build

# 生成的文件在 site/ 目录
# 可以部署到任何静态网站托管服务
```

---

## 📋 依赖检查 | Dependency Check

确保以下包已安装：

```bash
# 检查已安装的包
pip list | grep -E "mkdocs|material|i18n"
```

应该看到：
- ✅ mkdocs
- ✅ mkdocs-material
- ✅ mkdocs-static-i18n

如果缺少任何包，请安装：

```bash
pip install mkdocs-material mkdocs-static-i18n
```

---

## 🎯 功能验证 | Feature Verification

启动网站后，请验证以下功能：

### ✅ 基本功能
- [ ] 右上角显示语言切换浮动按钮
- [ ] 点击按钮显示中英文选项
- [ ] 点击选项可切换语言
- [ ] 当前语言显示对勾标记

### ✅ 交互功能
- [ ] 鼠标悬停有高亮效果
- [ ] 按钮有渐变色背景
- [ ] 切换时有平滑动画
- [ ] 点击外部区域关闭下拉菜单

### ✅ 响应式
- [ ] 桌面端显示正常
- [ ] 平板端显示正常
- [ ] 移动端显示正常

### ✅ 高级功能
- [ ] 按 `Alt + L` 打开语言切换器
- [ ] 按 `ESC` 关闭下拉菜单
- [ ] 暗色模式下样式正确

---

## 🔧 配置说明 | Configuration

### 语言配置 | Language Configuration

在 `mkdocs.yml` 中已配置：

```yaml
plugins:
  - i18n:
      default_language: zh
      languages:
        zh:
          name: 中文
          build: true
        en:
          name: English
          build: true

extra:
  alternate:
    - name: 中文
      link: /automotive-develop-architecture/
      lang: zh
    - name: English
      link: /automotive-develop-architecture/en/
      lang: en
```

### 自定义样式 | Custom Styling

如需修改样式，编辑 `stylesheets/extra.css` 中的相关CSS类：

```css
/* 修改按钮颜色 */
.lang-toggle-btn {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}

/* 修改位置 */
.language-switcher-float {
  top: 80px;    /* 上边距 */
  right: 20px;  /* 右边距 */
}
```

---

## 📱 部署 | Deployment

### GitHub Pages

```bash
# 构建并部署到 GitHub Pages
mkdocs gh-deploy
```

### 其他平台

构建完成后，将 `site/` 目录上传到任何静态托管服务：
- Netlify
- Vercel
- AWS S3
- Azure Static Web Apps
- 腾讯云对象存储
- 阿里云OSS

---

## ❓ 常见问题 | FAQ

### Q1: 语言切换器不显示？
**A:**
1. 检查浏览器控制台是否有JavaScript错误
2. 确认 `language-switcher.js` 文件路径正确
3. 清除浏览器缓存后重试

### Q2: 切换语言后页面404？
**A:**
1. 确保英文版本的文档已构建
2. 检查 `mkdocs.yml` 中的 `i18n` 配置
3. 重新运行 `mkdocs build`

### Q3: 样式显示异常？
**A:**
1. 确认 `extra.css` 在 `mkdocs.yml` 中正确引用
2. 检查是否有其他CSS冲突
3. 使用浏览器开发者工具调试

### Q4: 移动端按钮位置不对？
**A:**
编辑 `extra.css` 中的媒体查询：

```css
@media screen and (max-width: 768px) {
  .language-switcher-float {
    top: 56px;    /* 调整这里 */
    right: 10px;  /* 调整这里 */
  }
}
```

---

## 📊 文件清单 | File Checklist

确保以下文件都已正确创建/修改：

- [x] `overrides/main.html` (修改)
- [x] `stylesheets/extra.css` (修改)
- [x] `docs/javascripts/language-switcher.js` (新建)
- [x] `mkdocs.yml` (修改)
- [x] `LANGUAGE_SWITCHER_README.md` (新建)
- [x] `INSTALLATION_GUIDE.md` (新建)
- [x] `language-switcher-demo.html` (新建)

---

## 🎨 效果预览 | Preview

### 桌面端效果 | Desktop
- 浮动按钮：右上角，渐变蓝色
- 下拉菜单：圆角卡片，阴影效果
- 国旗图标：🇨🇳 中文 | 🇬🇧 English

### 移动端效果 | Mobile
- 按钮缩小：适配小屏幕
- 位置调整：避免遮挡内容
- 触摸友好：大按钮区域

---

## 📞 技术支持 | Support

如遇到问题，请：

1. 查看 `LANGUAGE_SWITCHER_README.md` 详细文档
2. 检查浏览器控制台错误信息
3. 联系：haiqing.lin@compliance-waechter.com

---

## ✅ 下一步 | Next Steps

1. ✅ 本地测试所有功能
2. ✅ 确认响应式布局
3. ✅ 测试暗色模式
4. 🚀 部署到生产环境
5. 📢 通知团队成员

---

<div align="center">

**🎉 安装完成！享受您的多语言知识库吧！**

**Installation Complete! Enjoy Your Multilingual Knowledge Base!**

</div>
