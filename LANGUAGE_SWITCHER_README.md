# 语言切换功能说明 / Language Switcher Guide

## 🌐 功能特点 / Features

### 中文
- ✅ **一键切换**: 点击浮动按钮即可在中英文之间切换
- ✅ **智能路径**: 自动识别当前页面并切换到对应语言版本
- ✅ **视觉反馈**: 清晰的当前语言标识和切换动画
- ✅ **响应式设计**: 完美适配桌面、平板和移动设备
- ✅ **暗色模式**: 自动适配Material主题的暗色模式
- ✅ **键盘快捷键**: 按 `Alt + L` 快速打开语言切换器
- ✅ **无障碍支持**: 完整的ARIA标签和键盘导航

### English
- ✅ **One-Click Switch**: Toggle between Chinese and English with a single click
- ✅ **Smart Routing**: Automatically detects current page and switches to corresponding language version
- ✅ **Visual Feedback**: Clear language indicator with smooth animations
- ✅ **Responsive Design**: Perfect adaptation for desktop, tablet, and mobile devices
- ✅ **Dark Mode**: Automatically adapts to Material theme's dark mode
- ✅ **Keyboard Shortcut**: Press `Alt + L` to quickly open language switcher
- ✅ **Accessibility**: Full ARIA labels and keyboard navigation support

---

## 📂 文件结构 / File Structure

```
automotive-develop-architecture/
├── mkdocs.yml                              # 配置文件 (添加了 language-switcher.js)
├── overrides/
│   ├── main.html                           # 主模板 (添加了语言切换器HTML)
│   └── partials/
│       └── announce.html
├── stylesheets/
│   └── extra.css                           # 样式文件 (添加了语言切换器样式)
└── docs/
    └── javascripts/
        ├── mermaid.js
        └── language-switcher.js            # 语言切换逻辑 (新增)
```

---

## 🚀 使用方法 / Usage

### 本地预览 / Local Preview

1. **安装依赖 / Install Dependencies**
```bash
pip install mkdocs-material mkdocs-static-i18n --break-system-packages
```

2. **启动本地服务器 / Start Local Server**
```bash
cd /path/to/automotive-develop-architecture
mkdocs serve
```

3. **访问网站 / Visit Website**
打开浏览器访问: `http://127.0.0.1:8000`

### 构建静态网站 / Build Static Site

```bash
mkdocs build
```

构建后的文件将保存在 `site/` 目录中。

---

## 🎨 自定义配置 / Customization

### 修改语言切换器位置 / Change Position

编辑 `stylesheets/extra.css` 文件中的 `.language-switcher-float` 类:

```css
.language-switcher-float {
  position: fixed;
  top: 80px;      /* 调整上边距 */
  right: 20px;    /* 调整右边距 */
  z-index: 1000;
}
```

### 修改按钮颜色 / Change Button Color

编辑 `stylesheets/extra.css` 文件中的 `.lang-toggle-btn` 类:

```css
.lang-toggle-btn {
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  /* 改为你喜欢的颜色 */
}
```

### 添加更多语言 / Add More Languages

1. 编辑 `mkdocs.yml` 中的 `plugins.i18n.languages` 配置
2. 在 `overrides/main.html` 中添加新的语言选项
3. 更新 `docs/javascripts/language-switcher.js` 中的语言检测逻辑

---

## 🔧 技术细节 / Technical Details

### 核心组件 / Core Components

1. **HTML 结构** (在 `overrides/main.html` 中)
   - 浮动按钮容器
   - 下拉菜单
   - 语言选项链接

2. **CSS 样式** (在 `stylesheets/extra.css` 中)
   - 响应式布局
   - 动画效果
   - 暗色模式适配

3. **JavaScript 逻辑** (在 `docs/javascripts/language-switcher.js` 中)
   - 当前语言检测
   - 路径智能转换
   - 事件处理
   - 键盘快捷键

### 浏览器兼容性 / Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

---

## 🐛 故障排除 / Troubleshooting

### 语言切换器不显示 / Switcher Not Showing

1. 清除浏览器缓存
2. 检查 `mkdocs.yml` 中是否正确引用了 `language-switcher.js`
3. 确保 `extra.css` 文件被正确加载
4. 使用浏览器开发者工具检查控制台错误

### 切换后页面404 / 404 After Switching

1. 确保英文版本的页面文件存在
2. 检查 `mkdocs.yml` 中的 `plugins.i18n` 配置
3. 重新构建网站: `mkdocs build`

### 样式显示异常 / Style Issues

1. 检查 `extra.css` 文件是否正确加载
2. 确认没有其他CSS冲突
3. 清除浏览器缓存后重试

---

## 📝 更新日志 / Changelog

### v1.0.0 (2026-02-05)
- ✨ 初始版本发布
- ✅ 支持中英文切换
- ✅ 响应式设计
- ✅ 暗色模式支持
- ✅ 键盘快捷键 (Alt + L)
- ✅ 无障碍功能

---

## 📧 联系方式 / Contact

如有问题或建议，请联系:

- **Email**: haiqing.lin@compliance-waechter.com
- **GitHub**: https://github.com/michaellinhq/automotive-develop-architecture
- **Website**: https://compliance-waechter.com

---

## 📄 许可证 / License

本项目采用专有许可证。未经授权不得复制、修改或分发。

This project uses a proprietary license. Unauthorized copying, modification, or distribution is prohibited.
