// ==UserScript==
// @name         B站视频双击全屏
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  双击B站视频播放区域即可进入/退出浏览器全屏模式
// @author       SeiShiRo
// @match        https://*.bilibili.com/*
// @match        https://www.bilibili.com/*
// @grant        none
// @icon         https://www.bilibili.com/favicon.ico
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    /**
     * 切换全屏功能
     * @param {HTMLElement} targetElement - 要全屏的目标元素
     */
    function toggleFullscreen(targetElement) {
        // 检查是否支持全屏API
        if (!document.fullscreenEnabled) {
            console.warn('[双击全屏] 当前浏览器不支持全屏功能');
            return;
        }

        // 如果已经有元素在全屏，先退出
        if (document.fullscreenElement) {
            document.exitFullscreen()
                .then(() => {
                    console.log('[双击全屏] 已退出全屏');
                })
                .catch((err) => {
                    console.error('[双击全屏] 退出全屏失败:', err);
                });
        } else {
            // 请求全屏
            targetElement.requestFullscreen()
                .then(() => {
                    console.log('[双击全屏]已进入全屏模式');
                })
                .catch((err) => {
                    console.error('[双击全屏] 进入全屏失败:', err);
                });
        }
    }

    /**
     * 查找B站播放器视频区域
     * @returns {HTMLElement|null}
     */
    function findVideoArea() {
        // 尝试多个选择器，按优先级排序
        const selectors = [
            '.bpx-player-video-area',        // 视频区域
            '.bpx-player-primary-area',      // 播放器主区域
            '.bilibili-player-video-area',   // 旧版播放器
            'video'                          // 视频元素
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log('[双击全屏] 找到目标元素:', selector);
                return element;
            }
        }

        return null;
    }

    /**
     * 处理双击事件
     * @param {Event} e
     */
    function handleDoubleClick(e) {
        // 防止事件冒泡，避免触发其他双击功能
        e.stopPropagation();

        const targetElement = findVideoArea();
        if (targetElement) {
            toggleFullscreen(targetElement);
        } else {
            console.warn('[双击全屏] 未找到播放器元素');
        }
    }

    /**
     * 为目标元素添加双击监听
     * @param {HTMLElement} element
     */
    function attachDoubleClickListener(element) {
        // 检查是否已经添加过监听
        if (element.hasAttribute('data-dblclick-fullscreen-enabled')) {
            return;
        }

        element.addEventListener('dblclick', handleDoubleClick, { passive: true });
        element.setAttribute('data-dblclick-fullscreen-enabled', 'true');
        console.log('[双击全屏] 已为元素添加双击监听:', element.className || element.tagName);
    }

    /**
     * 初始化脚本
     */
    function init() {
        console.log('[双击全屏] 脚本开始初始化...');

        // 使用MutationObserver监听DOM变化，处理动态加载的播放器
        const observer = new MutationObserver((mutations) => {
            const videoArea = findVideoArea();
            if (videoArea) {
                attachDoubleClickListener(videoArea);
            }
        });

        // 开始监听document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 立即尝试查找并绑定
        const videoArea = findVideoArea();
        if (videoArea) {
            attachDoubleClickListener(videoArea);
            console.log('[双击全屏] 初始化完成');
        } else {
            console.log('[双击全屏] 未找到播放器，等待加载...');
        }

        // 监听全屏变化事件
        document.addEventListener('fullscreenchange', () => {
            const isFullscreen = !!document.fullscreenElement;
            console.log('[双击全屏] 全屏状态变化:', isFullscreen ? '已进入' : '已退出');
        });

        // 监听全屏错误
        document.addEventListener('fullscreenerror', (e) => {
            console.error('[双击全屏] 全屏错误:', e);
        });
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
