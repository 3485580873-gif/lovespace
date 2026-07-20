/* ============================================================
   🍎 iOS桌面风格 - 桌面主页逻辑（v2 完整版）
   - 双页布局（上下滚动）
   - APP图标点击打开对应功能
   - 小组件点击编辑内容
   - 长按APP图标更换背景
   - 完整桌面设置面板
   ============================================================ */

(function() {
    // ========== 配置存储 ==========
    const STORAGE_KEY = 'milk_desktop_config';

    const defaultConfig = {
        wallpaper: '',
        // 头像资料卡
        profileBanner: '',
        profileAvatar: '',
        profileName: '陆沉',
        profileSign: '兔子小姐的专属',
        // 音乐
        musicCover: '',
        musicTitle: '微醺心潮',
        musicArtist: '陆沉',
        // 语录
        quoteText: '你是我全部的渴望与幻想',
        quoteFrom: '— 陆沉',
        // 纪念日
        anniversaryDate: '',
        anniversaryLabel: '在一起的天数',
        anniversaryNext: '下一个纪念日还有30天',
        // 运势
        tarotStars: 5,
        tarotTip: '今天也在想你',
        // 便签
        memoText: '记得喝温水哦～',
        // 相册
        photo1: '',
        photo2: '',
        photo3: '',
        photoLabel: '我们的回忆',
        // 心情
        moodEmoji: '💕',
        moodText: '今天也很想你',
        // 睡眠
        sleepHours: '8',
        sleepQuality: '睡得很好',
        // 喝水
        waterCount: 3,
        waterGoal: 8,
        // 恋爱指数
        loveIndex: 98,
        loveText: '甜度爆表',
        // 天气
        weatherEmoji: '☀️',
        weatherText: '晴朗 26°C',
        // APP图标
        icons: {
            chat:   { bg: '', label: '传讯' },
            reply:  { bg: '', label: '字库' },
            tarot:  { bg: '', label: '塔罗' },
            envelope:{ bg: '', label: '信箱' },
            group:  { bg: '', label: '群聊' },
            call:   { bg: '', label: '通话' },
            survey: { bg: '', label: '问卷' },
            setting:{ bg: '', label: '设置' }
        },
        // 第二页APP
        icons2: {
            moyu:    { bg: '', label: '摸鱼' },
            mood:    { bg: '', label: '心情' },
            album:   { bg: '', label: '相册' },
            theme:   { bg: '', label: '主题' },
            stats:   { bg: '', label: '统计' },
            coin:    { bg: '', label: '抽签' },
            dream:   { bg: '', label: '梦向' },
            desktop: { bg: '', label: '桌面设置' }
        }
    };

    let config = loadConfig();

    function loadConfig() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return deepMerge(defaultConfig, parsed);
            }
        } catch(e) {}
        return JSON.parse(JSON.stringify(defaultConfig));
    }

    function saveConfig() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    function deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    // ========== 工具函数 ==========
    function getDaysTogether() {
        if (!config.anniversaryDate) return 365;
        const start = new Date(config.anniversaryDate);
        const now = new Date();
        const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff);
    }

    function handleImageUpload(file, callback) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function(e) { callback(e.target.result); };
        reader.readAsDataURL(file);
    }

    function updateTime() {
        const timeEl = document.getElementById('desktop-time');
        if (!timeEl) return;
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        timeEl.textContent = `${h}:${m}`;
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
        if (homeInd) homeInd.style.display = 'none';
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
        if (homeInd) homeInd.style.display = '';
    }

    // ========== 打开各功能 ==========
    function openFeature(action) {
        // 先打开聊天页作为容器
        openChatPage();

        setTimeout(() => {
            switch(action) {
                case 'chat':
                    // 就是聊天页，不用额外操作
                    break;
                case 'reply':
                    // 字库/回复库
                    try {
                        const modal = document.getElementById('custom-replies-modal');
                        if (modal && typeof showModal === 'function') showModal(modal);
                    } catch(e) {}
                    break;
                case 'tarot':
                    // 塔罗/运势
                    try {
                        if (typeof generateFortune === 'function') {
                            generateFortune();
                        } else {
                            const modal = document.getElementById('fortune-lenormand-modal');
                            if (modal && typeof showModal === 'function') showModal(modal);
                        }
                    } catch(e) {}
                    break;
                case 'envelope':
                    // 信箱
                    try {
                        const modal = document.getElementById('envelope-modal');
                        if (modal && typeof showModal === 'function') showModal(modal);
                    } catch(e) {}
                    break;
                case 'group':
                    // 群聊
                    try {
                        const btn = document.getElementById('group-chat-btn');
                        if (btn) btn.click();
                    } catch(e) {}
                    break;
                case 'call':
                    // 通话
                    try {
                        if (window.callFeature && typeof window.callFeature.startCall === 'function') {
                            window.callFeature.startCall(false);
                        }
                    } catch(e) {}
                    break;
                case 'survey':
                    // 问卷
                    try {
                        const modal = document.getElementById('dream-questionnaire-modal');
                        if (modal && typeof showModal === 'function') showModal(modal);
                    } catch(e) {}
                    break;
                case 'setting':
                    // 设置
                    try {
                        const btn = document.getElementById('settings-btn');
                        if (btn) btn.click();
                        setTimeout(openDesktopSettingsTab, 300);
                    } catch(e) {}
                    break;
                case 'desktop':
                    // 桌面设置
                    setTimeout(openDesktopSettings, 350);
                    break;
                case 'mood':
                    // 心情
                    try {
                        const btn = document.getElementById('daily-greeting-btn');
                        if (btn) btn.click();
                    } catch(e) {}
                    break;
                case 'theme':
                    // 主题
                    try {
                        const btn = document.getElementById('theme-toggle');
                        if (btn) btn.click();
                    } catch(e) {}
                    break;
                case 'coin':
                    // 抽签
                    try {
                        const modal = document.getElementById('decision-menu-modal');
                        if (modal && typeof showModal === 'function') showModal(modal);
                    } catch(e) {}
                    break;
                case 'dream':
                    // 梦向问卷
                    try {
                        const modal = document.getElementById('dream-questionnaire-modal');
                        if (modal && typeof showModal === 'function') showModal(modal);
                    } catch(e) {}
                    break;
                case 'stats':
                    // 统计
                    try {
                        const modal = document.getElementById('stats-modal');
                        if (modal && typeof showModal === 'function') {
                            showModal(modal);
                            if (typeof renderStatsContent === 'function') renderStatsContent();
                        }
                    } catch(e) {}
                    break;
                case 'album':
                case 'moyu':
                    // 暂无独立页面，给提示
                    alert('该功能正在开发中～');
                    break;
            }
        }, 350);
    }

    function openDesktopSettingsTab() {
        // 切到桌面设置
        const panel = document.getElementById('desktop-settings-panel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ========== 小组件编辑 ==========
    function openWidgetEditor(widgetKey) {
        const editor = document.getElementById('widget-editor-modal');
        if (!editor) return;

        // 填充当前值
        const titleEl = document.getElementById('we-title');
        const fieldsEl = document.getElementById('we-fields');
        const saveBtn = document.getElementById('we-save-btn');

        const widgetDefs = {
            profile: {
                title: '编辑头像资料卡',
                fields: [
                    { key: 'profileName', label: '名字', type: 'text' },
                    { key: 'profileSign', label: '签名', type: 'text' },
                    { key: 'profileAvatar', label: '头像图片', type: 'image' },
                    { key: 'profileBanner', label: 'Banner背景图', type: 'image' }
                ]
            },
            music: {
                title: '编辑音乐组件',
                fields: [
                    { key: 'musicTitle', label: '歌曲名', type: 'text' },
                    { key: 'musicArtist', label: '歌手', type: 'text' },
                    { key: 'musicCover', label: '专辑封面', type: 'image' }
                ]
            },
            quote: {
                title: '编辑今日语录',
                fields: [
                    { key: 'quoteText', label: '语录内容', type: 'textarea' },
                    { key: 'quoteFrom', label: '出处', type: 'text' }
                ]
            },
            anniversary: {
                title: '编辑纪念日',
                fields: [
                    { key: 'anniversaryDate', label: '开始日期 (YYYY-MM-DD)', type: 'date' },
                    { key: 'anniversaryLabel', label: '标签文字', type: 'text' },
                    { key: 'anniversaryNext', label: '下一个纪念日提示', type: 'text' }
                ]
            },
            tarot: {
                title: '编辑今日运势',
                fields: [
                    { key: 'tarotStars', label: '星星数 (1-5)', type: 'number', min: 1, max: 5 },
                    { key: 'tarotTip', label: '运势小贴士', type: 'text' }
                ]
            },
            memo: {
                title: '编辑心动便签',
                fields: [
                    { key: 'memoText', label: '便签内容', type: 'textarea' }
                ]
            },
            photo: {
                title: '编辑相册回忆',
                fields: [
                    { key: 'photo1', label: '照片1', type: 'image' },
                    { key: 'photo2', label: '照片2', type: 'image' },
                    { key: 'photo3', label: '照片3', type: 'image' },
                    { key: 'photoLabel', label: '相册名称', type: 'text' }
                ]
            },
            mood: {
                title: '编辑今日心情',
                fields: [
                    { key: 'moodEmoji', label: '心情表情', type: 'text' },
                    { key: 'moodText', label: '心情描述', type: 'text' }
                ]
            },
            sleep: {
                title: '编辑睡眠打卡',
                fields: [
                    { key: 'sleepHours', label: '睡眠时长(小时)', type: 'text' },
                    { key: 'sleepQuality', label: '睡眠质量', type: 'text' }
                ]
            },
            water: {
                title: '编辑喝水提醒',
                fields: [
                    { key: 'waterCount', label: '已喝杯数', type: 'number', min: 0, max: 20 },
                    { key: 'waterGoal', label: '目标杯数', type: 'number', min: 1, max: 20 }
                ]
            },
            love: {
                title: '编辑恋爱指数',
                fields: [
                    { key: 'loveIndex', label: '指数(0-100)', type: 'number', min: 0, max: 100 },
                    { key: 'loveText', label: '描述文字', type: 'text' }
                ]
            },
            weather: {
                title: '编辑天气小组件',
                fields: [
                    { key: 'weatherEmoji', label: '天气表情', type: 'text' },
                    { key: 'weatherText', label: '天气描述', type: 'text' }
                ]
            }
        };

        const def = widgetDefs[widgetKey];
        if (!def) return;

        titleEl.textContent = def.title;
        fieldsEl.innerHTML = '';

        def.fields.forEach(field => {
            const row = document.createElement('div');
            row.className = 'we-field-row';

            const label = document.createElement('div');
            label.className = 'we-field-label';
            label.textContent = field.label;
            row.appendChild(label);

            if (field.type === 'image') {
                const uploadLabel = document.createElement('label');
                uploadLabel.className = 'we-upload-btn';
                uploadLabel.textContent = config[field.key] ? '已上传 ✓ 更换' : '上传图片';
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';
                input.dataset.fieldKey = field.key;
                input.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (!file) return;
                    handleImageUpload(file, function(dataUrl) {
                        config[field.key] = dataUrl;
                        uploadLabel.textContent = '已上传 ✓ 更换';
                        applyConfig();
                    });
                });
                uploadLabel.appendChild(input);
                row.appendChild(uploadLabel);
            } else if (field.type === 'textarea') {
                const textarea = document.createElement('textarea');
                textarea.className = 'we-textarea';
                textarea.value = config[field.key] || '';
                textarea.dataset.fieldKey = field.key;
                row.appendChild(textarea);
            } else {
                const input = document.createElement('input');
                input.type = field.type || 'text';
                input.className = 'we-input';
                input.value = config[field.key] || '';
                if (field.min !== undefined) input.min = field.min;
                if (field.max !== undefined) input.max = field.max;
                input.dataset.fieldKey = field.key;
                row.appendChild(input);
            }

            fieldsEl.appendChild(row);
        });

        // 保存
        saveBtn.onclick = function() {
            fieldsEl.querySelectorAll('[data-field-key]').forEach(el => {
                const key = el.dataset.fieldKey;
                if (el.tagName === 'INPUT' && el.type !== 'file') {
                    if (el.type === 'number') {
                        config[key] = parseInt(el.value) || 0;
                    } else {
                        config[key] = el.value;
                    }
                } else if (el.tagName === 'TEXTAREA') {
                    config[key] = el.value;
                }
            });
            saveConfig();
            applyConfig();
            hideModal(editor);
        };

        showModal(editor);
    }

    // ========== 图标背景编辑（长按） ==========
    function openIconEditor(iconKey, isPage2) {
        const editor = document.getElementById('icon-editor-modal');
        if (!editor) return;

        const iconConfig = isPage2 ? config.icons2[iconKey] : config.icons[iconKey];
        if (!iconConfig) return;

        document.getElementById('ie-icon-name').textContent = iconConfig.label;

        const preview = document.getElementById('ie-preview');
        if (iconConfig.bg) {
            preview.style.backgroundImage = `url('${iconConfig.bg}')`;
            preview.classList.add('has-bg');
        } else {
            preview.style.backgroundImage = '';
            preview.classList.remove('has-bg');
        }

        const nameInput = document.getElementById('ie-name-input');
        nameInput.value = iconConfig.label;

        // 上传
        const uploadInput = document.getElementById('ie-upload-input');
        uploadInput.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            handleImageUpload(file, function(dataUrl) {
                iconConfig.bg = dataUrl;
                preview.style.backgroundImage = `url('${dataUrl}')`;
                preview.classList.add('has-bg');
            });
        };

        // 清除背景
        document.getElementById('ie-clear-btn').onclick = function() {
            iconConfig.bg = '';
            preview.style.backgroundImage = '';
            preview.classList.remove('has-bg');
        };

        // 保存
        document.getElementById('ie-save-btn').onclick = function() {
            iconConfig.label = nameInput.value;
            saveConfig();
            applyConfig();
            hideModal(editor);
        };

        showModal(editor);
    }

    function showModal(modal) {
        if (modal && typeof window.showModal === 'function') {
            window.showModal(modal);
        } else if (modal) {
            modal.style.display = 'block';
        }
    }

    function hideModal(modal) {
        if (modal && typeof window.hideModal === 'function') {
            window.hideModal(modal);
        } else if (modal) {
            modal.style.display = 'none';
        }
    }

    // ========== 应用配置 ==========
    function applyConfig() {
        // 壁纸
        const desktop = document.getElementById('desktop-page');
        if (desktop && config.wallpaper) {
            desktop.style.backgroundImage = `url('${config.wallpaper}')`;
        }

        // 头像资料卡
        setBg('.dt-widget-profile .profile-avatar', config.profileAvatar, 'https://file.youtochat.com/images/20260216/1771224856844_qdqqd.jpeg');
        setBg('.dt-widget-profile .profile-banner', config.profileBanner, null);
        setText('.dt-widget-profile .profile-name', config.profileName);
        setText('.dt-widget-profile .profile-sign', config.profileSign);

        // 音乐
        setBg('.dt-widget-music .music-cover', config.musicCover, 'https://file.youtochat.com/images/20260216/1771224856844_qdqqd.jpeg');
        setText('.dt-widget-music .music-title', config.musicTitle);
        setText('.dt-widget-music .music-artist', config.musicArtist);

        // 语录
        setText('.dt-widget-quote .quote-text', config.quoteText);
        setText('.dt-widget-quote .quote-from', config.quoteFrom);

        // 纪念日
        setText('.dt-widget-anniversary .anniv-number', getDaysTogether());
        setText('.dt-widget-anniversary .anniv-label', config.anniversaryLabel);
        setText('.dt-widget-anniversary .anniv-next', config.anniversaryNext);

        // 运势
        const starsEl = document.querySelector('.dt-widget-tarot .tarot-stars');
        if (starsEl) {
            const s = Math.min(5, Math.max(1, config.tarotStars || 5));
            starsEl.textContent = '★'.repeat(s) + '☆'.repeat(5 - s);
        }
        setText('.dt-widget-tarot .tarot-tip', config.tarotTip);

        // 便签
        setText('.dt-widget-memo .memo-text', config.memoText);

        // 相册
        const photos = [config.photo1, config.photo2, config.photo3];
        document.querySelectorAll('.dt-widget-photo .photo-item').forEach((el, i) => {
            if (photos[i]) {
                el.style.backgroundImage = `url('${photos[i]}')`;
            } else {
                el.style.backgroundImage = "url('https://file.youtochat.com/images/20260216/1771224856844_qdqqd.jpeg')";
            }
        });
        setText('.dt-widget-photo .photo-label', config.photoLabel);

        // 心情
        setText('.dt-widget-mood .mood-emoji', config.moodEmoji);
        setText('.dt-widget-mood .mood-text', config.moodText);

        // 睡眠
        setText('.dt-widget-sleep .sleep-hours', config.sleepHours);
        setText('.dt-widget-sleep .sleep-quality', config.sleepQuality);

        // 喝水
        setText('.dt-widget-water .water-count', config.waterCount);
        setText('.dt-widget-water .water-goal', config.waterGoal);
        const waterBar = document.querySelector('.dt-widget-water .water-bar-fill');
        if (waterBar) {
            const pct = Math.min(100, (config.waterCount / config.waterGoal) * 100);
            waterBar.style.width = pct + '%';
        }

        // 恋爱指数
        setText('.dt-widget-love .love-num', config.loveIndex);
        setText('.dt-widget-love .love-text', config.loveText);
        const loveBar = document.querySelector('.dt-widget-love .love-bar-fill');
        if (loveBar) {
            loveBar.style.width = Math.min(100, config.loveIndex) + '%';
        }

        // 天气
        setText('.dt-widget-weather .weather-emoji', config.weatherEmoji);
        setText('.dt-widget-weather .weather-text', config.weatherText);

        // APP图标 - 第一页
        for (const [key, iconConfig] of Object.entries(config.icons)) {
            const iconEls = document.querySelectorAll(`.app-icon-${key}:not(.page2-icon) .app-icon-box`);
            iconEls.forEach(box => {
                if (iconConfig.bg) {
                    box.style.backgroundImage = `url('${iconConfig.bg}')`;
                    box.classList.add('has-bg');
                } else {
                    box.style.backgroundImage = '';
                    box.classList.remove('has-bg');
                }
            });
            const labelEls = document.querySelectorAll(`.app-icon-${key}:not(.page2-icon) .app-label`);
            labelEls.forEach(el => { el.textContent = iconConfig.label; });
        }

        // APP图标 - 第二页
        for (const [key, iconConfig] of Object.entries(config.icons2)) {
            const iconEls = document.querySelectorAll(`.app-icon-${key}.page2-icon .app-icon-box`);
            iconEls.forEach(box => {
                if (iconConfig.bg) {
                    box.style.backgroundImage = `url('${iconConfig.bg}')`;
                    box.classList.add('has-bg');
                } else {
                    box.style.backgroundImage = '';
                    box.classList.remove('has-bg');
                }
            });
            const labelEls = document.querySelectorAll(`.app-icon-${key}.page2-icon .app-label`);
            labelEls.forEach(el => { el.textContent = iconConfig.label; });
        }
    }

    function setBg(selector, bgUrl, defaultUrl) {
        const els = document.querySelectorAll(selector);
        els.forEach(el => {
            if (bgUrl) {
                el.style.backgroundImage = `url('${bgUrl}')`;
            } else if (defaultUrl) {
                el.style.backgroundImage = `url('${defaultUrl}')`;
            }
        });
    }

    function setText(selector, text) {
        const els = document.querySelectorAll(selector);
        els.forEach(el => { el.textContent = text; });
    }

    // ========== 初始化桌面HTML ==========
    function initDesktop() {
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
                    <!-- ========== 第一页 ========== -->
                    <div class="desktop-page-1">
                        <!-- 头像资料大组件 -->
                        <div class="dt-widget dt-widget-profile" data-widget="profile">
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
                            <div class="widget-edit-hint">点击编辑</div>
                        </div>

                        <!-- 音乐 + 语录 -->
                        <div class="dt-row-2">
                            <div class="dt-widget dt-widget-music" data-widget="music">
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
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>

                            <div class="dt-widget dt-widget-quote" data-widget="quote">
                                <div class="dt-widget-content">
                                    <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                                    <div class="quote-text">你是我全部的渴望与幻想</div>
                                    <div class="quote-from">— 陆沉</div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>
                        </div>

                        <!-- 纪念日 + 运势 -->
                        <div class="dt-row-2">
                            <div class="dt-widget dt-widget-anniversary" data-widget="anniversary">
                                <div class="dt-widget-content">
                                    <div class="anniv-icon">💗</div>
                                    <div class="anniv-number">365</div>
                                    <div class="anniv-label">在一起的天数</div>
                                    <div class="anniv-next">下一个纪念日还有30天</div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>

                            <div class="dt-widget dt-widget-tarot" data-widget="tarot">
                                <div class="dt-widget-content">
                                    <div class="tarot-icon">🔮</div>
                                    <div class="tarot-label">今日恋爱运势</div>
                                    <div class="tarot-stars">★★★★★</div>
                                    <div class="tarot-tip">今天也在想你</div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>
                        </div>

                        <!-- APP图标 第一行 -->
                        <div class="dt-app-grid">
                            <div class="dt-app-icon app-icon-chat" data-action="chat">
                                <div class="app-icon-box"><i class="fas fa-comments"></i></div>
                                <div class="app-label">传讯</div>
                            </div>
                            <div class="dt-app-icon app-icon-reply" data-action="reply">
                                <div class="app-icon-box"><i class="fas fa-book-open"></i></div>
                                <div class="app-label">字库</div>
                            </div>
                            <div class="dt-app-icon app-icon-tarot" data-action="tarot">
                                <div class="app-icon-box"><i class="fas fa-star-and-crescent"></i></div>
                                <div class="app-label">塔罗</div>
                            </div>
                            <div class="dt-app-icon app-icon-envelope" data-action="envelope">
                                <div class="app-icon-box"><i class="fas fa-envelope"></i></div>
                                <div class="app-label">信箱</div>
                            </div>
                        </div>

                        <!-- 便签 + 相册 -->
                        <div class="dt-row-2">
                            <div class="dt-widget dt-widget-memo" data-widget="memo">
                                <div class="dt-widget-content">
                                    <div class="memo-text">记得喝温水哦～</div>
                                    <div class="memo-heart">♥</div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>

                            <div class="dt-widget dt-widget-photo" data-widget="photo">
                                <div class="dt-widget-content">
                                    <div class="photo-stack">
                                        <div class="photo-item"></div>
                                        <div class="photo-item"></div>
                                        <div class="photo-item"></div>
                                    </div>
                                    <div class="photo-label">我们的回忆</div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>
                        </div>

                        <!-- APP图标 第二行 -->
                        <div class="dt-app-grid">
                            <div class="dt-app-icon app-icon-group" data-action="group">
                                <div class="app-icon-box"><i class="fas fa-users"></i></div>
                                <div class="app-label">群聊</div>
                            </div>
                            <div class="dt-app-icon app-icon-call" data-action="call">
                                <div class="app-icon-box"><i class="fas fa-phone"></i></div>
                                <div class="app-label">通话</div>
                            </div>
                            <div class="dt-app-icon app-icon-survey" data-action="survey">
                                <div class="app-icon-box"><i class="fas fa-clipboard-list"></i></div>
                                <div class="app-label">问卷</div>
                            </div>
                            <div class="dt-app-icon app-icon-setting" data-action="setting">
                                <div class="app-icon-box"><i class="fas fa-cog"></i></div>
                                <div class="app-label">设置</div>
                            </div>
                        </div>

                        <!-- 翻页提示 -->
                        <div class="page-indicator">
                            <span class="dot active"></span>
                            <span class="dot"></span>
                            <div class="scroll-hint">下滑查看第二页 <i class="fas fa-chevron-down"></i></div>
                        </div>
                    </div>

                    <!-- ========== 第二页 ========== -->
                    <div class="desktop-page-2">
                        <!-- 页面标题 -->
                        <div class="page2-title">更多精彩</div>

                        <!-- 心情 + 天气 -->
                        <div class="dt-row-2">
                            <div class="dt-widget dt-widget-mood" data-widget="mood">
                                <div class="dt-widget-content">
                                    <div class="mood-emoji">💕</div>
                                    <div class="mood-label">今日心情</div>
                                    <div class="mood-text">今天也很想你</div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>

                            <div class="dt-widget dt-widget-weather" data-widget="weather">
                                <div class="dt-widget-content">
                                    <div class="weather-emoji">☀️</div>
                                    <div class="weather-label">他的城市</div>
                                    <div class="weather-text">晴朗 26°C</div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>
                        </div>

                        <!-- 恋爱指数（大组件） -->
                        <div class="dt-widget dt-widget-love" data-widget="love">
                            <div class="dt-widget-content">
                                <div class="love-header">
                                    <span class="love-icon">💘</span>
                                    <span class="love-title">恋爱指数</span>
                                </div>
                                <div class="love-score">
                                    <span class="love-num">98</span>
                                    <span class="love-unit">分</span>
                                </div>
                                <div class="love-bar">
                                    <div class="love-bar-fill"></div>
                                </div>
                                <div class="love-text">甜度爆表</div>
                            </div>
                            <div class="widget-edit-hint">点击编辑</div>
                        </div>

                        <!-- 睡眠 + 喝水 -->
                        <div class="dt-row-2">
                            <div class="dt-widget dt-widget-sleep" data-widget="sleep">
                                <div class="dt-widget-content">
                                    <div class="sleep-icon">🌙</div>
                                    <div class="sleep-label">昨晚睡眠</div>
                                    <div class="sleep-hours">8</div>
                                    <div class="sleep-unit">小时</div>
                                    <div class="sleep-quality">睡得很好</div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>

                            <div class="dt-widget dt-widget-water" data-widget="water">
                                <div class="dt-widget-content">
                                    <div class="water-icon">💧</div>
                                    <div class="water-label">今日喝水</div>
                                    <div class="water-count-row">
                                        <span class="water-count">3</span>
                                        <span class="water-sep">/</span>
                                        <span class="water-goal">8</span>
                                        <span class="water-unit">杯</span>
                                    </div>
                                    <div class="water-bar">
                                        <div class="water-bar-fill"></div>
                                    </div>
                                </div>
                                <div class="widget-edit-hint">点击编辑</div>
                            </div>
                        </div>

                        <!-- 第二页APP图标 第一行 -->
                        <div class="dt-app-grid page2-icons">
                            <div class="dt-app-icon app-icon-moyu page2-icon" data-action="moyu">
                                <div class="app-icon-box"><i class="fas fa-fish"></i></div>
                                <div class="app-label">摸鱼</div>
                            </div>
                            <div class="dt-app-icon app-icon-mood page2-icon" data-action="mood">
                                <div class="app-icon-box"><i class="fas fa-smile"></i></div>
                                <div class="app-label">心情</div>
                            </div>
                            <div class="dt-app-icon app-icon-album page2-icon" data-action="album">
                                <div class="app-icon-box"><i class="fas fa-images"></i></div>
                                <div class="app-label">相册</div>
                            </div>
                            <div class="dt-app-icon app-icon-theme page2-icon" data-action="theme">
                                <div class="app-icon-box"><i class="fas fa-palette"></i></div>
                                <div class="app-label">主题</div>
                            </div>
                        </div>

                        <!-- 第二页APP图标 第二行 -->
                        <div class="dt-app-grid page2-icons">
                            <div class="dt-app-icon app-icon-stats page2-icon" data-action="stats">
                                <div class="app-icon-box"><i class="fas fa-chart-bar"></i></div>
                                <div class="app-label">统计</div>
                            </div>
                            <div class="dt-app-icon app-icon-coin page2-icon" data-action="coin">
                                <div class="app-icon-box"><i class="fas fa-coins"></i></div>
                                <div class="app-label">抽签</div>
                            </div>
                            <div class="dt-app-icon app-icon-dream page2-icon" data-action="dream">
                                <div class="app-icon-box"><i class="fas fa-moon"></i></div>
                                <div class="app-label">梦向</div>
                            </div>
                            <div class="dt-app-icon app-icon-desktop page2-icon" data-action="desktop">
                                <div class="app-icon-box"><i class="fas fa-sliders-h"></i></div>
                                <div class="app-label">桌面设置</div>
                            </div>
                        </div>

                        <!-- 底部留白 -->
                        <div class="page2-bottom-space"></div>
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
                        <div class="app-icon-box"><i class="fas fa-book-open"></i></div>
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

            <!-- 小组件编辑弹窗 -->
            <div class="modal" id="widget-editor-modal" style="z-index: 5000;">
                <div class="modal-content" style="max-width: 380px;">
                    <div class="modal-title" id="we-title">编辑组件</div>
                    <div class="we-fields" id="we-fields"></div>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-secondary" onclick="this.closest('.modal').style.display='none'">取消</button>
                        <button class="modal-btn modal-btn-primary" id="we-save-btn">保存</button>
                    </div>
                </div>
            </div>

            <!-- 图标编辑弹窗 -->
            <div class="modal" id="icon-editor-modal" style="z-index: 5000;">
                <div class="modal-content" style="max-width: 340px;">
                    <div class="modal-title">
                        <i class="fas fa-palette"></i>
                        <span>编辑图标 - <span id="ie-icon-name">传讯</span></span>
                    </div>
                    <div style="text-align: center; margin-bottom: 16px;">
                        <div class="ie-preview" id="ie-preview">
                            <i class="fas fa-comments"></i>
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary, #999); margin-top: 8px;">
                            长按任意图标可打开此面板
                        </div>
                    </div>
                    <div class="we-field-row">
                        <div class="we-field-label">图标名称</div>
                        <input type="text" class="we-input" id="ie-name-input" value="传讯">
                    </div>
                    <div class="we-field-row">
                        <div class="we-field-label">图标背景图</div>
                        <label class="we-upload-btn" style="display: inline-block;">
                            上传图片
                            <input type="file" id="ie-upload-input" accept="image/*" style="display:none">
                        </label>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-secondary" id="ie-clear-btn">清除背景</button>
                        <button class="modal-btn modal-btn-secondary" onclick="this.closest('.modal').style.display='none'">取消</button>
                        <button class="modal-btn modal-btn-primary" id="ie-save-btn">保存</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', desktopHTML);

        // 把原来的聊天界面包进wrapper
        wrapChatPage();

        // 绑定事件
        bindEvents();

        // 更新时间
        updateTime();
        setInterval(updateTime, 30000);

        // 应用配置
        applyConfig();

        // 设置面板添加桌面设置
        addDesktopSettings();

        // 页面指示器滚动联动
        setupPageIndicator();
    }

    function wrapChatPage() {
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

        chatWrapper.appendChild(chatContainer);

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

        // 移动其他modal元素到chatContainer外（保持全局可访问）
        // 实际上modal都在body最后，不用动
    }

    function bindEvents() {
        // 返回桌面
        document.getElementById('back-to-desktop').addEventListener('click', closeChatPage);

        // 头像资料卡点击→聊天
        document.querySelector('.dt-widget-profile').addEventListener('click', function(e) {
            // 如果点了编辑提示，不跳
            if (e.target.closest('.widget-edit-hint')) return;
            openChatPage();
        });

        // APP图标点击
        document.querySelectorAll('.dt-app-icon[data-action]').forEach(icon => {
            const action = icon.dataset.action;
            let pressTimer = null;
            let isLongPress = false;

            icon.addEventListener('click', function(e) {
                if (isLongPress) {
                    isLongPress = false;
                    return;
                }
                // 桌面设置和主题切换不需要进聊天页
                if (action === 'desktop') {
                    openDesktopSettings();
                    return;
                }
                if (action === 'theme') {
                    const btn = document.getElementById('theme-toggle');
                    if (btn) btn.click();
                    return;
                }
                if (action === 'chat') {
                    openChatPage();
                } else {
                    openFeature(action);
                }
            });

            // 长按编辑图标
            icon.addEventListener('touchstart', function(e) {
                isLongPress = false;
                pressTimer = setTimeout(() => {
                    isLongPress = true;
                    if (navigator.vibrate) navigator.vibrate(50);
                    handleIconLongPress(icon);
                }, 500);
            });

            icon.addEventListener('touchend', function() {
                if (pressTimer) clearTimeout(pressTimer);
            });

            icon.addEventListener('touchmove', function() {
                if (pressTimer) clearTimeout(pressTimer);
            });

            // 桌面端：右键=长按
            icon.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                handleIconLongPress(icon);
            });
        });

        // 小组件点击编辑
        document.querySelectorAll('.dt-widget[data-widget]').forEach(widget => {
            const widgetKey = widget.dataset.widget;
            widget.addEventListener('click', function(e) {
                // 头像卡特殊处理：点击主体进聊天，点编辑提示才编辑
                if (widgetKey === 'profile') {
                    if (e.target.closest('.widget-edit-hint')) {
                        e.stopPropagation();
                        openWidgetEditor(widgetKey);
                    }
                    return;
                }
                openWidgetEditor(widgetKey);
            });
        });

        // 滚动监听
        const desktopContent = document.querySelector('.desktop-content');
        let lastScrollTop = 0;
        desktopContent.addEventListener('scroll', function() {
            const st = this.scrollTop;
            const page2 = document.querySelector('.desktop-page-2');
            if (page2) {
                const page2Top = page2.offsetTop - window.innerHeight * 0.5;
                const dots = document.querySelectorAll('.page-indicator .dot');
                if (st > page2Top) {
                    dots[0].classList.remove('active');
                    dots[1].classList.add('active');
                } else {
                    dots[0].classList.add('active');
                    dots[1].classList.remove('active');
                }
            }
            lastScrollTop = st;
        });
    }

    function handleIconLongPress(iconEl) {
        // 找到对应的icon key
        let iconKey = null;
        let isPage2 = iconEl.classList.contains('page2-icon');

        for (const cls of iconEl.classList) {
            if (cls.startsWith('app-icon-')) {
                iconKey = cls.replace('app-icon-', '');
                break;
            }
        }

        if (iconKey) {
            openIconEditor(iconKey, isPage2);
        }
    }

    function setupPageIndicator() {
        // 点击指示器圆点翻页
        document.querySelectorAll('.page-indicator .dot').forEach((dot, idx) => {
            dot.addEventListener('click', function() {
                const page2 = document.querySelector('.desktop-page-2');
                const content = document.querySelector('.desktop-content');
                if (idx === 1 && page2) {
                    content.scrollTo({ top: page2.offsetTop - 20, behavior: 'smooth' });
                } else {
                    content.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // ========== 桌面设置面板（独立Modal） ==========
    function addDesktopSettings() {
        const settingsHTML = `
            <div class="modal" id="desktop-settings-modal" style="z-index: 5000;">
                <div class="modal-content" style="max-width: 400px; max-height: 85vh; display: flex; flex-direction: column;">
                    <div class="modal-title">
                        <i class="fas fa-sliders-h"></i>
                        <span>🍎 桌面设置</span>
                    </div>
                    <div style="flex: 1; overflow-y: auto; padding: 0 4px;">
                        <div class="ds-section">
                            <div class="ds-section-title">壁纸</div>
                            <div class="ds-row">
                                <span class="ds-label">桌面壁纸</span>
                                <label class="ds-btn">
                                    上传
                                    <input type="file" accept="image/*" style="display:none" data-dt-upload="wallpaper">
                                </label>
                            </div>
                        </div>

                        <div class="ds-section">
                            <div class="ds-section-title">小组件编辑</div>
                            <div class="ds-grid">
                                <button class="ds-quick-btn" data-dt-edit="profile">
                                    <i class="fas fa-user-circle"></i>
                                    <span>头像卡</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="music">
                                    <i class="fas fa-music"></i>
                                    <span>音乐</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="quote">
                                    <i class="fas fa-quote-left"></i>
                                    <span>语录</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="anniversary">
                                    <i class="fas fa-heart"></i>
                                    <span>纪念日</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="tarot">
                                    <i class="fas fa-star-and-crescent"></i>
                                    <span>运势</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="memo">
                                    <i class="fas fa-sticky-note"></i>
                                    <span>便签</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="photo">
                                    <i class="fas fa-images"></i>
                                    <span>相册</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="mood">
                                    <i class="fas fa-smile"></i>
                                    <span>心情</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="weather">
                                    <i class="fas fa-sun"></i>
                                    <span>天气</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="love">
                                    <i class="fas fa-heartbeat"></i>
                                    <span>恋爱指数</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="sleep">
                                    <i class="fas fa-moon"></i>
                                    <span>睡眠</span>
                                </button>
                                <button class="ds-quick-btn" data-dt-edit="water">
                                    <i class="fas fa-tint"></i>
                                    <span>喝水</span>
                                </button>
                            </div>
                        </div>

                        <div class="ds-section">
                            <div class="ds-section-title">图标背景（长按桌面上的图标也可编辑）</div>
                            <div style="font-size: 11px; color: var(--text-secondary, #999); margin-bottom: 8px; line-height: 1.5;">
                                提示：在桌面上长按任意图标，即可快速更换该图标的背景图片和名称。
                            </div>
                        </div>

                        <div class="ds-tip-box">
                            <i class="fas fa-lightbulb"></i>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 2px;">使用小技巧</div>
                                <div style="font-size: 11px; line-height: 1.6; opacity: 0.8;">
                                    • 点击小组件可编辑内容<br>
                                    • 长按APP图标可换背景<br>
                                    • 上下滑动查看第二页<br>
                                    • 点底部Dock快速切功能
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-buttons" style="flex-shrink: 0;">
                        <button class="modal-btn modal-btn-primary" onclick="this.closest('.modal').style.display='none'">完成</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', settingsHTML);

        // 绑定上传事件
        document.querySelectorAll('[data-dt-upload]').forEach(input => {
            input.addEventListener('change', function(e) {
                const key = this.dataset.dtUpload;
                const file = e.target.files[0];
                if (!file) return;
                handleImageUpload(file, function(dataUrl) {
                    config[key] = dataUrl;
                    saveConfig();
                    applyConfig();
                });
            });
        });

        // 绑定编辑事件
        document.querySelectorAll('[data-dt-edit]').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.dataset.dtEdit;
                openWidgetEditor(key);
            });
        });
    }

    // 修改desktop图标的行为：打开桌面设置modal
    function openDesktopSettings() {
        const modal = document.getElementById('desktop-settings-modal');
        if (modal) {
            showModal(modal);
        }
    }

    // ========== 启动 ==========
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
        setConfig: (newConfig) => { config = deepMerge(config, newConfig); saveConfig(); applyConfig(); },
        refresh: applyConfig,
        openWidgetEditor: openWidgetEditor,
        openIconEditor: openIconEditor
    };
})();
