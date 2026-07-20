/* ============================================================
   🍎 iOS桌面风格 - 桌面主页逻辑
   ============================================================ */

(function() {
    // ========== 桌面配置（所有自定义图片存在localStorage里） ==========
    const DESKTOP_STORAGE_KEY = 'milk_desktop_config';

    // 默认配置
    const defaultConfig = {
        wallpaper: '',
        profileBanner: '',
        profileAvatar: '',
        profileName: '陆沉',
        profileSign: '兔子小姐的专属',
        musicCover: '',
        musicTitle: '微醺心潮',
        musicArtist: '陆沉',
        quoteText: '你是我全部的渴望与幻想',
        quoteFrom: '— 陆沉',
        anniversaryDate: '',
        anniversaryLabel: '在一起的天数',
        tarotStars: 5,
        tarotTip: '今天也在想你',
        memoText: '记得喝温水哦～',
        photo1: '',
        photo2: '',
        photo3: '',
        photoLabel: '我们的回忆',
        icons: {
            chat: { bg: '', label: '传讯', icon: 'fa-comments' },
            tarot: { bg: '', label: '塔罗', icon: 'fa-crystal-ball' },
            reply: { bg: '', label: '字库', icon: 'fa-book' },
            moyu: { bg: '', label: '摸鱼', icon: 'fa-fish' },
            group: { bg: '', label: '群聊', icon: 'fa-users' },
            call: { bg: '', label: '通话', icon: 'fa-phone' },
            envelope: { bg: '', label: '信箱', icon: 'fa-envelope' },
            setting: { bg: '', label: '设置', icon: 'fa-cog' }
        }
    };

    // 读取配置
    function loadConfig() {
        try {
            const saved = localStorage.getItem(DESKTOP_STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch(e) {}
        return JSON.parse(JSON.stringify(defaultConfig));
    }

    // 保存配置
    function saveConfig(config) {
        localStorage.setItem(DESKTOP_STORAGE_KEY, JSON.stringify(config));
    }

    let config = loadConfig();

    // ========== 计算在一起天数 ==========
    function getDaysTogether() {
        if (!config.anniversaryDate) return 365; // 默认值
        const start = new Date(config.anniversaryDate);
        const now = new Date();
        const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff);
    }

    // ========== 随机语录 ==========
    const quotes = [
        { text: '你是我全部的渴望与幻想', from: '— 陆沉' },
        { text: '兔子小姐，今晚月色真美', from: '— 陆沉' },
        { text: '能遇见你，是我此生最大的幸运', from: '— 陆沉' },
        { text: '无论何时何地，我都在你身边', from: '— 陆沉' },
        { text: '我的心，只为你而跳动', from: '— 陆沉' },
        { text: '想把全世界最好的都给你', from: '— 陆沉' },
        { text: '你是我深渊里唯一的光', from: '— 陆沉' },
        { text: '晚安，我的兔子小姐', from: '— 陆沉' }
    ];

    function getRandomQuote() {
        const today = new Date().toDateString();
        const seed = today.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
        return quotes[seed % quotes.length];
    }

    // ========== 应用配置到CSS变量 ==========
    function applyConfig() {
        const root = document.documentElement;

        // 壁纸
        if (config.wallpaper) {
            document.getElementById('desktop-page').style.backgroundImage = `url('${config.wallpaper}')`;
        }

        // 头像
        const avatarEl = document.querySelector('.dt-widget-profile .profile-avatar');
        if (avatarEl) {
            if (config.profileAvatar) {
                avatarEl.style.backgroundImage = `url('${config.profileAvatar}')`;
            } else {
                avatarEl.style.backgroundImage = "url('https://file.youtochat.com/images/20260216/1771224856844_qdqqd.jpeg')";
            }
        }

        // 名字和签名
        const nameEl = document.querySelector('.dt-widget-profile .profile-name');
        if (nameEl) nameEl.textContent = config.profileName;
        const signEl = document.querySelector('.dt-widget-profile .profile-sign');
        if (signEl) signEl.textContent = config.profileSign;

        // banner图
        const bannerEl = document.querySelector('.dt-widget-profile .profile-banner');
        if (bannerEl && config.profileBanner) {
            bannerEl.style.backgroundImage = `url('${config.profileBanner}')`;
        }

        // 音乐封面
        const musicCoverEl = document.querySelector('.dt-widget-music .music-cover');
        if (musicCoverEl) {
            if (config.musicCover) {
                musicCoverEl.style.backgroundImage = `url('${config.musicCover}')`;
            } else {
                musicCoverEl.style.backgroundImage = "url('https://file.youtochat.com/images/20260216/1771224856844_qdqqd.jpeg')";
            }
        }
        const musicTitleEl = document.querySelector('.dt-widget-music .music-title');
        if (musicTitleEl) musicTitleEl.textContent = config.musicTitle;
        const musicArtistEl = document.querySelector('.dt-widget-music .music-artist');
        if (musicArtistEl) musicArtistEl.textContent = config.musicArtist;

        // 语录
        const quote = getRandomQuote();
        const quoteTextEl = document.querySelector('.dt-widget-quote .quote-text');
        if (quoteTextEl) quoteTextEl.textContent = quote.text;
        const quoteFromEl = document.querySelector('.dt-widget-quote .quote-from');
        if (quoteFromEl) quoteFromEl.textContent = quote.from;

        // 纪念日
        const annivNumEl = document.querySelector('.dt-widget-anniversary .anniv-number');
        if (annivNumEl) annivNumEl.textContent = getDaysTogether();
        const annivLabelEl = document.querySelector('.dt-widget-anniversary .anniv-label');
        if (annivLabelEl) annivLabelEl.textContent = config.anniversaryLabel;

        // 塔罗运势
        const starsEl = document.querySelector('.dt-widget-tarot .tarot-stars');
        if (starsEl) {
            starsEl.innerHTML = '★'.repeat(config.tarotStars) + '☆'.repeat(5 - config.tarotStars);
        }
        const tarotTipEl = document.querySelector('.dt-widget-tarot .tarot-tip');
        if (tarotTipEl) tarotTipEl.textContent = config.tarotTip;

        // 便签
        const memoTextEl = document.querySelector('.dt-widget-memo .memo-text');
        if (memoTextEl) memoTextEl.textContent = config.memoText;

        // 相册
        const photoItems = document.querySelectorAll('.dt-widget-photo .photo-item');
        const photos = [config.photo1, config.photo2, config.photo3];
        photoItems.forEach((el, i) => {
            if (photos[i]) {
                el.style.backgroundImage = `url('${photos[i]}')`;
            } else {
                el.style.backgroundImage = "url('https://file.youtochat.com/images/20260216/1771224856844_qdqqd.jpeg')";
            }
        });
        const photoLabelEl = document.querySelector('.dt-widget-photo .photo-label');
        if (photoLabelEl) photoLabelEl.textContent = config.photoLabel;

        // APP图标背景
        for (const [key, iconConfig] of Object.entries(config.icons)) {
            const iconEl = document.querySelector(`.app-icon-${key}`);
            if (iconEl) {
                const box = iconEl.querySelector('.app-icon-box');
                const label = iconEl.querySelector('.app-label');
                if (box && iconConfig.bg) {
                    box.style.backgroundImage = `url('${iconConfig.bg}')`;
                    box.classList.add('has-bg');
                }
                if (label) label.textContent = iconConfig.label;
            }
        }
    }

    // ========== 页面切换 ==========
    function openChatPage() {
        const wrapper = document.getElementById('chat-page-wrapper');
        const desktop = document.getElementById('desktop-page');
        const backBtn = document.getElementById('back-to-desktop');
        const dock = document.querySelector('.desktop-dock');
        const homeInd = document.querySelector('.home-indicator');

        wrapper.classList.add('active');
        desktop.classList.add('hidden');
        backBtn.classList.add('show');
        if (dock) dock.style.display = 'none';
        if (homeInd) home.style.display = 'none';
    }

    function closeChatPage() {
        const wrapper = document.getElementById('chat-page-wrapper');
        const desktop = document.getElementById('desktop-page');
        const backBtn = document.getElementById('back-to-desktop');
        const dock = document.querySelector('.desktop-dock');
        const homeInd = document.querySelector('.home-indicator');

        wrapper.classList.remove('active');
        desktop.classList.remove('hidden');
        backBtn.classList.remove('show');
        if (dock) dock.style.display = '';
        if (homeInd) home.style.display = '';
    }

    // ========== 图片上传处理 ==========
    function handleImageUpload(file, callback) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            callback(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    // ========== 初始化桌面 ==========
    function initDesktop() {
        // 创建桌面主页
        const desktopHTML = `
            <div class="desktop-page" id="desktop-page">
                <div class="desktop-status-bar">
                    <div class="status-left" id="desktop-time">9:41</div>
                    <div class="status-right">
                        <i class="fas fa-signal"></i>
                        <i class="fas fa-wifi"></i>
                        <i class="fas fa-battery-full"></i>
                    </div>
                </div>

                <div class="desktop-content">
                    <!-- 头像资料大组件 -->
                    <div class="dt-widget dt-widget-profile" data-action="chat">
                        <div class="profile-banner"></div>
                        <div class="profile-avatar-wrap">
                            <div class="profile-avatar"></div>
                        </div>
                        <div class="profile-info">
                            <div class="profile-name">陆沉</div>
                            <div class="profile-sign">兔子小姐的专属</div>
                            <div class="profile-status">
                                <span class="profile-status-dot"></span>
                                <span>在线</span>
                            </div>
                        </div>
                    </div>

                    <!-- 第一排双组件：音乐 + 语录 -->
                    <div class="dt-row-2">
                        <div class="dt-widget dt-widget-music">
                            <div class="dt-widget-content">
                                <div class="music-cover"></div>
                                <div class="music-info">
                                    <div class="music-label">正在播放</div>
                                    <div class="music-title">微醺心潮</div>
                                    <div class="music-artist">陆沉</div>
                                    <div class="music-progress">
                                        <div class="music-progress-bar"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="dt-widget dt-widget-quote">
                            <div class="dt-widget-content">
                                <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                                <div class="quote-text">你是我全部的渴望与幻想</div>
                                <div class="quote-from">— 陆沉</div>
                            </div>
                        </div>
                    </div>

                    <!-- 第二排双组件：纪念日 + 今日运势 -->
                    <div class="dt-row-2">
                        <div class="dt-widget dt-widget-anniversary">
                            <div class="dt-widget-content">
                                <div class="anniv-icon">💗</div>
                                <div class="anniv-number">365</div>
                                <div class="anniv-label">在一起的天数</div>
                                <div class="anniv-next">下一个纪念日还有30天</div>
                            </div>
                        </div>

                        <div class="dt-widget dt-widget-tarot">
                            <div class="dt-widget-content">
                                <div class="tarot-icon">🔮</div>
                                <div class="tarot-label">今日恋爱运势</div>
                                <div class="tarot-stars">★★★★★</div>
                                <div class="tarot-tip">今天也在想你</div>
                            </div>
                        </div>
                    </div>

                    <!-- APP图标网格 第一行 -->
                    <div class="dt-app-grid">
                        <div class="dt-app-icon app-icon-chat" data-action="chat">
                            <div class="app-icon-box"><i class="fas fa-comments"></i></div>
                            <div class="app-label">传讯</div>
                        </div>
                        <div class="dt-app-icon app-icon-tarot" data-action="tarot">
                            <div class="app-icon-box"><i class="fas fa-crystal-ball"></i></div>
                            <div class="app-label">塔罗</div>
                        </div>
                        <div class="dt-app-icon app-icon-reply" data-action="reply">
                            <div class="app-icon-box"><i class="fas fa-book"></i></div>
                            <div class="app-label">字库</div>
                        </div>
                        <div class="dt-app-icon app-icon-moyu" data-action="moyu">
                            <div class="app-icon-box"><i class="fas fa-fish"></i></div>
                            <div class="app-label">摸鱼</div>
                        </div>
                    </div>

                    <!-- 便签 + 相册 -->
                    <div class="dt-row-2">
                        <div class="dt-widget dt-widget-memo">
                            <div class="dt-widget-content">
                                <div class="memo-text">记得喝温水哦～</div>
                                <div class="memo-heart">♥</div>
                            </div>
                        </div>

                        <div class="dt-widget dt-widget-photo">
                            <div class="dt-widget-content">
                                <div class="photo-stack">
                                    <div class="photo-item"></div>
                                    <div class="photo-item"></div>
                                    <div class="photo-item"></div>
                                </div>
                                <div class="photo-label">我们的回忆</div>
                            </div>
                        </div>
                    </div>

                    <!-- APP图标网格 第二行 -->
                    <div class="dt-app-grid">
                        <div class="dt-app-icon app-icon-group" data-action="group">
                            <div class="app-icon-box"><i class="fas fa-users"></i></div>
                            <div class="app-label">群聊</div>
                        </div>
                        <div class="dt-app-icon app-icon-call" data-action="call">
                            <div class="app-icon-box"><i class="fas fa-phone"></i></div>
                            <div class="app-label">通话</div>
                        </div>
                        <div class="dt-app-icon app-icon-envelope" data-action="envelope">
                            <div class="app-icon-box"><i class="fas fa-envelope"></i></div>
                            <div class="app-label">信箱</div>
                        </div>
                        <div class="dt-app-icon app-icon-setting" data-action="setting">
                            <div class="app-icon-box"><i class="fas fa-cog"></i></div>
                            <div class="app-label">设置</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部Dock栏 -->
            <div class="desktop-dock">
                <div class="desktop-dock-inner">
                    <div class="dt-app-icon app-icon-chat" data-action="chat">
                        <div class="app-icon-box"><i class="fas fa-comments"></i></div>
                        <div class="app-label">传讯</div>
                    </div>
                    <div class="dock-divider"></div>
                    <div class="dt-app-icon app-icon-reply" data-action="reply">
                        <div class="app-icon-box"><i class="fas fa-book"></i></div>
                        <div class="app-label">字库</div>
                    </div>
                    <div class="dock-divider"></div>
                    <div class="dt-app-icon app-icon-setting" data-action="setting">
                        <div class="app-icon-box"><i class="fas fa-cog"></i></div>
                        <div class="app-label">设置</div>
                    </div>
                </div>
            </div>

            <!-- Home Indicator -->
            <div class="home-indicator"></div>

            <!-- 返回桌面按钮 -->
            <button class="back-to-desktop-btn" id="back-to-desktop" title="返回桌面">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // 插入到body最前面
        document.body.insertAdjacentHTML('afterbegin', desktopHTML);

        // 把原来的聊天界面包进wrapper
        const welcomeEl = document.getElementById('welcome-animation');
        const headerEl = document.querySelector('.header');
        const mainChatEl = document.querySelector('.main-chat-area');
        const inputWrapper = document.querySelector('.input-area-wrapper');
        const immersiveBtn = document.getElementById('immersive-exit-btn');

        const chatWrapper = document.createElement('div');
        chatWrapper.id = 'chat-page-wrapper';
        chatWrapper.className = 'chat-page-wrapper';

        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-main-container';

        // 把相关元素移进去
        chatWrapper.appendChild(chatContainer);

        // 在welcome前面插入wrapper
        if (welcomeEl) {
            welcomeEl.parentNode.insertBefore(chatWrapper, welcomeEl);
            chatContainer.appendChild(welcomeEl);
        }
        if (immersiveBtn) {
            chatContainer.appendChild(immersiveBtn);
        }
        if (headerEl) {
            chatContainer.appendChild(headerEl);
        }
        if (mainChatEl) {
            chatContainer.appendChild(mainChatEl);
        }
        if (inputWrapper) {
            chatContainer.appendChild(inputWrapper);
        }

        // 绑定点击事件
        document.querySelectorAll('[data-action="chat"]').forEach(el => {
            el.addEventListener('click', openChatPage);
        });

        document.getElementById('back-to-desktop').addEventListener('click', closeChatPage);

        // 绑定其他功能（暂时先打开聊天页，后续接具体功能）
        document.querySelectorAll('.dt-app-icon[data-action]').forEach(el => {
            const action = el.dataset.action;
            if (action === 'chat') return; // chat单独处理
            el.addEventListener('click', function() {
                openChatPage();
                // 延迟触发对应功能（等动画差不多了）
                setTimeout(() => {
                    triggerFeature(action);
                }, 300);
            });
        });

        // 小组件点击也打开聊天
        document.querySelectorAll('.dt-widget').forEach(widget => {
            if (!widget.dataset.action) {
                widget.addEventListener('click', openChatPage);
            }
        });

        // 更新时间
        updateTime();
        setInterval(updateTime, 30000);

        // 应用配置
        applyConfig();

        // 设置里加桌面自定义面板
        addDesktopSettings();
    }

    function updateTime() {
        const timeEl = document.getElementById('desktop-time');
        if (!timeEl) return;
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        timeEl.textContent = `${h}:${m}`;
    }

    // ========== 触发对应功能 ==========
    function triggerFeature(action) {
        switch(action) {
            case 'tarot':
                // 点击设置里的塔罗相关，或者打开聊天
                break;
            case 'reply':
                // 回复库
                if (typeof openReplyLibrary === 'function') {
                    openReplyLibrary();
                } else if (document.getElementById('reply-library-btn')) {
                    document.getElementById('reply-library-btn').click();
                }
                break;
            case 'moyu':
                // 摸鱼抽卡
                if (document.querySelector('.moyu-btn')) {
                    document.querySelector('.moyu-btn').click();
                }
                break;
            case 'group':
                if (document.getElementById('group-chat-btn')) {
                    document.getElementById('group-chat-btn').click();
                }
                break;
            case 'call':
                if (typeof startVideoCall === 'function') {
                    startVideoCall();
                }
                break;
            case 'envelope':
                if (typeof openEnvelope === 'function') {
                    openEnvelope();
                }
                break;
            case 'setting':
                if (document.getElementById('settings-btn')) {
                    document.getElementById('settings-btn').click();
                } else if (document.querySelector('.action-btn[title="设置"]')) {
                    document.querySelector('.action-btn[title="设置"]').click();
                }
                break;
        }
    }

    // ========== 设置面板添加自定义项 ==========
    function addDesktopSettings() {
        // 找到设置modal，加一个"桌面设置"tab
        const settingsModal = document.querySelector('.modal-content');
        if (!settingsModal) return;

        // 找到设置里的appearance区域，添加桌面自定义项
        const appearancePanel = document.getElementById('appearance-panel-theme');
        if (!appearancePanel) return;

        const desktopSettingsHTML = `
            <div class="desktop-settings-section" id="desktop-settings">
                <div class="desktop-settings-title">🍎 桌面自定义</div>
                <div class="desktop-upload-row">
                    <span class="desktop-upload-label">桌面壁纸</span>
                    <label class="desktop-upload-btn">
                        上传
                        <input type="file" accept="image/*" style="display:none" data-upload="wallpaper">
                    </label>
                </div>
                <div class="desktop-upload-row">
                    <span class="desktop-upload-label">头像卡Banner图</span>
                    <label class="desktop-upload-btn">
                        上传
                        <input type="file" accept="image/*" style="display:none" data-upload="profileBanner">
                    </label>
                </div>
                <div class="desktop-upload-row">
                    <span class="desktop-upload-label">头像图片</span>
                    <label class="desktop-upload-btn">
                        上传
                        <input type="file" accept="image/*" style="display:none" data-upload="profileAvatar">
                    </label>
                </div>
                <div class="desktop-upload-row">
                    <span class="desktop-upload-label">音乐封面</span>
                    <label class="desktop-upload-btn">
                        上传
                        <input type="file" accept="image/*" style="display:none" data-upload="musicCover">
                    </label>
                </div>
                <div class="desktop-upload-row">
                    <span class="desktop-upload-label">相册照片1</span>
                    <label class="desktop-upload-btn">
                        上传
                        <input type="file" accept="image/*" style="display:none" data-upload="photo1">
                    </label>
                </div>
                <div class="desktop-upload-row">
                    <span class="desktop-upload-label">相册照片2</span>
                    <label class="desktop-upload-btn">
                        上传
                        <input type="file" accept="image/*" style="display:none" data-upload="photo2">
                    </label>
                </div>
                <div class="desktop-upload-row">
                    <span class="desktop-upload-label">相册照片3</span>
                    <label class="desktop-upload-btn">
                        上传
                        <input type="file" accept="image/*" style="display:none" data-upload="photo3">
                    </label>
                </div>
                <div style="margin-top:8px;font-size:11px;color:var(--text-secondary);opacity:0.7;">
                    更多自定义项可在"桌面设置"中调整
                </div>
            </div>
        `;

        appearancePanel.insertAdjacentHTML('beforeend', desktopSettingsHTML);

        // 绑定上传事件
        document.querySelectorAll('[data-upload]').forEach(input => {
            input.addEventListener('change', function(e) {
                const key = this.dataset.upload;
                const file = e.target.files[0];
                if (!file) return;

                handleImageUpload(file, function(dataUrl) {
                    config[key] = dataUrl;
                    saveConfig(config);
                    applyConfig();
                });
            });
        });
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDesktop);
    } else {
        initDesktop();
    }

    // 暴露API
    window.DesktopMode = {
        openChat: openChatPage,
        closeChat: closeChatPage,
        getConfig: () => config,
        setConfig: (newConfig) => { config = newConfig; saveConfig(config); applyConfig(); },
        refresh: applyConfig
    };
})();
