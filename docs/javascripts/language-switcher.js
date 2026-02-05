/**
 * Language Switcher for Automotive Knowledge Base
 * Provides seamless switching between Chinese and English versions
 */

(function() {
  'use strict';

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
  } else {
    initLanguageSwitcher();
  }

  function initLanguageSwitcher() {
    const toggleBtn = document.getElementById('lang-toggle');
    const dropdown = document.getElementById('lang-dropdown');
    const currentLangText = document.getElementById('current-lang');

    if (!toggleBtn || !dropdown || !currentLangText) {
      console.warn('Language switcher elements not found');
      return;
    }

    // 检测当前语言
    const currentPath = window.location.pathname;
    const isEnglish = currentPath.includes('/en/');
    const currentLang = isEnglish ? 'en' : 'zh';

    // 设置当前语言显示
    updateCurrentLanguageDisplay(currentLangText, isEnglish);

    // 高亮当前语言选项
    highlightCurrentLanguage(currentLang);

    // 绑定事件
    bindToggleButtonEvent(toggleBtn, dropdown);
    bindDocumentClickEvent(toggleBtn, dropdown);
    bindLanguageOptionEvents(dropdown, currentLang);

    // 键盘快捷键支持 (Alt + L)
    bindKeyboardShortcut(toggleBtn, dropdown);
  }

  /**
   * 更新当前语言显示
   */
  function updateCurrentLanguageDisplay(element, isEnglish) {
    if (isEnglish) {
      element.textContent = 'English';
      element.setAttribute('data-lang', 'en');
    } else {
      element.textContent = '中文';
      element.setAttribute('data-lang', 'zh');
    }
  }

  /**
   * 高亮当前语言选项
   */
  function highlightCurrentLanguage(currentLang) {
    document.querySelectorAll('.lang-option').forEach(option => {
      const lang = option.getAttribute('data-lang');
      if (lang === currentLang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  /**
   * 绑定切换按钮事件
   */
  function bindToggleButtonEvent(toggleBtn, dropdown) {
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isActive = toggleBtn.classList.toggle('active');
      dropdown.classList.toggle('show', isActive);

      // 添加焦点管理
      if (isActive) {
        const firstOption = dropdown.querySelector('.lang-option');
        if (firstOption) {
          setTimeout(() => firstOption.focus(), 100);
        }
      }
    });
  }

  /**
   * 点击外部关闭下拉菜单
   */
  function bindDocumentClickEvent(toggleBtn, dropdown) {
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.language-switcher-float')) {
        toggleBtn.classList.remove('active');
        dropdown.classList.remove('show');
      }
    });

    // ESC键关闭下拉菜单
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && dropdown.classList.contains('show')) {
        toggleBtn.classList.remove('active');
        dropdown.classList.remove('show');
        toggleBtn.focus();
      }
    });
  }

  /**
   * 绑定语言选项点击事件
   */
  function bindLanguageOptionEvents(dropdown, currentLang) {
    document.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        const targetLang = this.getAttribute('data-lang');

        // 如果点击的是当前语言，只关闭下拉菜单
        if (targetLang === currentLang) {
          dropdown.classList.remove('show');
          document.getElementById('lang-toggle').classList.remove('active');
          return;
        }

        // 显示切换动画
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = 'scale(1)';
        }, 100);

        // 延迟跳转以显示视觉反馈
        setTimeout(() => {
          const targetUrl = this.getAttribute('href');
          const currentPath = window.location.pathname;

          // 智能路径转换
          let newPath;
          if (targetLang === 'en') {
            // 切换到英文
            if (currentPath === '/' || currentPath.endsWith('/index.html')) {
              newPath = targetUrl;
            } else {
              newPath = currentPath.replace(/^\//, '/en/');
            }
          } else {
            // 切换到中文
            newPath = currentPath.replace(/\/en\//, '/');
          }

          window.location.href = newPath;
        }, 150);
      });

      // 键盘导航支持
      option.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /**
   * 键盘快捷键支持
   */
  function bindKeyboardShortcut(toggleBtn, dropdown) {
    document.addEventListener('keydown', function(e) {
      // Alt + L 打开/关闭语言切换器
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        toggleBtn.click();
      }
    });
  }

  /**
   * 记住用户的语言偏好
   */
  function saveLanguagePreference(lang) {
    try {
      localStorage.setItem('preferred-language', lang);
    } catch (e) {
      console.warn('Unable to save language preference:', e);
    }
  }

  /**
   * 获取用户的语言偏好
   */
  function getLanguagePreference() {
    try {
      return localStorage.getItem('preferred-language') || 'zh';
    } catch (e) {
      return 'zh';
    }
  }

})();
