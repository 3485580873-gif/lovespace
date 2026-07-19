/**
 * couple-space.js - 情侣空间功能模块
 * 依赖: 全局 settings, messages, customReplies, stickerLibrary, customEmojis
 */

(function () {
    'use strict';

    // ==================== 数据结构 ====================
    const COUPLE_KEY = 'coupleSpaceData';
    const COUPLE_INVITE_KEY = 'coupleInviteStatus';
    const COUPLE_AFFECTION_KEY = 'coupleAffection';
    const PERIOD_KEY = 'periodReminder';

    let coupleData = null;
    let affectionData = null;
    let periodData = null;
    let isCoupleActive = false;
    let inviteStatus = null;

    // ==================== 初始化 ====================
    async function initCoupleSpace() {
        try {
            coupleData = await localforage.getItem(getStorageKey(COUPLE_KEY)) || {
                feed: [],
                letters: [],
                whispers: [],
                bills: [],
                diaries: [],
                gifts: [],
                giftRecords: []
            };
            affectionData = await localforage.getItem(getStorageKey(COUPLE_AFFECTION_KEY)) || {
                affection: 0,
                level: 0,
                levelName: '初识'
            };
            periodData = await localforage.getItem(getStorageKey(PERIOD_KEY)) || {
                day1: null,
                day2: null,
                lastNotified: null
            };
            inviteStatus = await localforage.getItem(getStorageKey(COUPLE_INVITE_KEY)) || {
                invited: false,
                accepted: false,
                invitedBy: null
            };
            isCoupleActive = inviteStatus && inviteStatus.accepted === true;
        } catch (e) {
            console.warn('[couple-space] 初始化失败，使用默认空数据', e);
            coupleData = { feed: [], letters: [], whispers: [], bills: [], diaries: [], gifts: [], giftRecords: [] };
            affectionData = { affection: 0, level: 0, levelName: '初识' };
            periodData = { day1: null, day2: null, lastNotified: null };
            inviteStatus = { invited: false, accepted: false, invitedBy: null };
            isCoupleActive = false;
        }
        // 检查自动邀请
        checkAutoInvite();
        // 检查经期提醒
        checkPeriodReminder();
        // 检查自动发动态
        scheduleAutoFeed();
        // 检查礼物赠送通知
        checkPendingGiftNotifications();
        // 更新入口按钮
        updateCoupleEntry();
    }

    function saveCoupleData() {
        localforage.setItem(getStorageKey(COUPLE_KEY), coupleData).catch(() => {});
    }
    function saveAffectionData() {
        localforage.setItem(getStorageKey(COUPLE_AFFECTION_KEY), affectionData).catch(() => {});
    }
    function savePeriodData() {
        localforage.setItem(getStorageKey(PERIOD_KEY), periodData).catch(() => {});
    }
    function saveInviteStatus() {
        localforage.setItem(getStorageKey(COUPLE_INVITE_KEY), inviteStatus).catch(() => {});
        isCoupleActive = inviteStatus && inviteStatus.accepted === true;
        updateCoupleEntry();
    }

    // ==================== 邀请系统 ====================
    function checkAutoInvite() {
        if (isCoupleActive) return;
        if (inviteStatus.invited) return;
        // 5% 几率对方邀请我方
        if (Math.random() < 0.05) {
            inviteStatus.invited = true;
            inviteStatus.invitedBy = 'partner';
            saveInviteStatus();
            showCoupleInviteNotification();
        }
    }

    function showCoupleInviteNotification() {
        const partnerName = (settings && settings.partnerName) || '对方';
        const popup = document.createElement('div');
        popup.id = 'couple-invite-popup';
        popup.style.cssText = `
            position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
            background:var(--secondary-bg);border:1.5px solid var(--accent-color);
            border-radius:20px;padding:20px 24px;z-index:8000;
            max-width:340px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,0.2);
            animation:slideUpNotif 0.4s cubic-bezier(0.22,1,0.36,1);
            text-align:center;
        `;
        popup.innerHTML = `
            <div style="font-size:40px;margin-bottom:8px;">💕</div>
            <div style="font-size:16px;font-weight:700;margin-bottom:4px;">${partnerName} 邀请你建立情侣空间</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:16px;">
                "想和你一起记录我们的点点滴滴 ✨"
            </div>
            <div style="display:flex;gap:10px;">
                <button onclick="window.acceptCoupleInvite()" style="flex:1;padding:10px;border-radius:14px;border:none;background:var(--accent-color);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:var(--font-family);">💖 接受</button>
                <button onclick="this.closest('#couple-invite-popup').remove()" style="flex:1;padding:10px;border-radius:14px;border:1px solid var(--border-color);background:transparent;color:var(--text-secondary);font-size:14px;cursor:pointer;font-family:var(--font-family);">稍后</button>
            </div>
        `;
        document.body.appendChild(popup);
        // 系统通知
        if (typeof window._sendPartnerNotification === 'function') {
            window._sendPartnerNotification('💕 情侣空间邀请', partnerName + ' 邀请你建立情侣空间');
        }
    }

    window.acceptCoupleInvite = function () {
        const popup = document.getElementById('couple-invite-popup');
        if (popup) popup.remove();
        inviteStatus.accepted = true;
        saveInviteStatus();
        // 生成欢迎动态
        const partnerName = (settings && settings.partnerName) || '对方';
        const myName = (settings && settings.myName) || '我';
        addFeedItem('system', `${partnerName} 和 ${myName} 建立了情侣空间 💕`, true);
        showNotification('🎉 情侣空间已建立！', 'success');
        // 在聊天界面通知
        if (typeof addMessage === 'function') {
            addMessage({
                id: Date.now() + '_couple_welcome',
                sender: 'system',
                text: '💕 你们建立了情侣空间！开始记录你们的甜蜜日常吧 ~',
                timestamp: new Date(),
                type: 'system'
            });
        }
        updateCoupleEntry();
        // 打开情侣空间
        setTimeout(() => openCoupleSpace(), 500);
    };

    // ==================== 入口按钮 ====================
    function updateCoupleEntry() {
        let btn = document.getElementById('couple-entry-btn');
        if (!btn) {
            // 在设置或高级功能中添加入口
            const container = document.getElementById('advanced-modal')?.querySelector('.settings-item-list');
            if (container) {
                const entry = document.createElement('div');
                entry.className = 'settings-item';
                entry.id = 'couple-entry-btn';
                entry.innerHTML = `
                    <i class="fas fa-heart"></i>
                    <span>情侣空间</span>
                    <span class="badge" id="couple-entry-badge">${isCoupleActive ? '💕 已开启' : '💌 邀请'}</span>
                `;
                entry.addEventListener('click', openCoupleSpace);
                container.appendChild(entry);
            }
        } else {
            const badge = document.getElementById('couple-entry-badge');
            if (badge) {
                badge.textContent = isCoupleActive ? '💕 已开启' : '💌 邀请';
            }
        }
    }

    // ==================== 打开情侣空间 ====================
    window.openCoupleSpace = function () {
        if (!isCoupleActive) {
            // 未建立情侣空间 - 显示邀请面板
            renderInvitePanel();
            const modal = document.getElementById('couple-space-modal');
            if (modal) showModal(modal);
            return;
        }
        // 更新显示名称
        const partnerName = (settings && settings.partnerName) || '梦角';
        const nameDisplay = document.getElementById('cs-partner-name-display');
        if (nameDisplay) nameDisplay.textContent = `与 ${partnerName} 的空间`;

        // 加载各面板
        renderFeed();
        renderLetters();
        renderWhispers();
        renderBills();
        renderDiaries();
        renderGifts();

        // 更新亲密度
        updateAffectionDisplay();

        const modal = document.getElementById('couple-space-modal');
        if (modal) showModal(modal);
    };

    // ==================== 邀请面板 ====================
    function renderInvitePanel() {
        const body = document.getElementById('cs-body');
        if (!body) return;
        const partnerName = (settings && settings.partnerName) || '对方';
        const myName = (settings && settings.myName) || '我';

        let actionHtml = '';
        if (inviteStatus.invited && inviteStatus.invitedBy === 'partner') {
            actionHtml = `
                <div style="margin-top:12px;font-size:14px;color:var(--text-secondary);">
                    💕 ${partnerName} 已经邀请了你，点击接受吧！
                </div>
                <button class="cs-invite-btn" onclick="window.acceptCoupleInvite()" style="margin-top:16px;">
                    💖 接受邀请
                </button>
            `;
        } else if (inviteStatus.invited && inviteStatus.invitedBy === 'me') {
            actionHtml = `
                <div style="margin-top:12px;font-size:14px;color:var(--text-secondary);">
                    ⏳ 已发送邀请，等待 ${partnerName} 回应...
                </div>
                <button class="cs-invite-btn" disabled style="margin-top:16px;opacity:0.6;">
                    等待中...
                </button>
            `;
        } else {
            actionHtml = `
                <button class="cs-invite-btn" onclick="window.sendCoupleInvite()" style="margin-top:16px;">
                    💌 邀请 ${partnerName}
                </button>
            `;
        }

        body.innerHTML = `
            <div class="cs-invite-panel">
                <span class="icon-big">💕</span>
                <h3>建立情侣空间</h3>
                <p>
                    和 <strong>${partnerName}</strong> 一起创建属于你们的专属空间吧！<br>
                    记录动态、写情书、记账、日记……<br>
                    所有回忆，都在这里。
                </p>
                ${actionHtml}
            </div>
        `;
    }

    window.sendCoupleInvite = function () {
        const partnerName = (settings && settings.partnerName) || '对方';
        inviteStatus.invited = true;
        inviteStatus.invitedBy = 'me';
        saveInviteStatus();
        showNotification(`💌 已向 ${partnerName} 发送邀请`, 'success');
        renderInvitePanel();
        // 模拟对方接受（30%概率立即接受，其余需要等待）
        if (Math.random() < 0.3) {
            setTimeout(() => {
                inviteStatus.accepted = true;
                saveInviteStatus();
                const myName = (settings && settings.myName) || '我';
                addFeedItem('system', `${partnerName} 接受了 ${myName} 的邀请 💕`, true);
                showNotification('🎉 对方接受了邀请！', 'success');
                if (typeof addMessage === 'function') {
                    addMessage({
                        id: Date.now() + '_couple_accept',
                        sender: 'system',
                        text: `💕 ${partnerName} 接受了你的情侣空间邀请！`,
                        timestamp: new Date(),
                        type: 'system'
                    });
                }
                updateCoupleEntry();
                renderInvitePanel();
                setTimeout(() => openCoupleSpace(), 500);
            }, 3000 + Math.random() * 5000);
        }
    };

    // ==================== 动态系统 ====================
    function addFeedItem(sender, content, isSystem = false) {
        if (!coupleData) return;
        const item = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            sender: sender,
            content: content,
            timestamp: Date.now(),
            isSystem: isSystem,
            likes: [],
            comments: [],
            likedByMe: false
        };
        coupleData.feed.unshift(item);
        saveCoupleData();
        return item;
    }

    function renderFeed() {
        const container = document.getElementById('cs-feed');
        if (!container) return;
        const partnerName = (settings && settings.partnerName) || '对方';
        const myName = (settings && settings.myName) || '我';

        if (!coupleData || coupleData.feed.length === 0) {
            container.innerHTML = `
                <div class="cs-empty">
                    <i class="fas fa-rss"></i>
                    <p>还没有动态，开始记录你们的日常吧 ~</p>
                </div>
            `;
            return;
        }

        container.innerHTML = coupleData.feed.map(item => {
            const isMe = item.sender === 'me' || item.sender === myName;
            const senderName = item.isSystem ? '💕 系统' : (isMe ? myName : partnerName);
            const avatarSrc = isMe ? getMyAvatarSrc() : getPartnerAvatarSrc();
            const timeStr = formatTime(item.timestamp);
            const likeCount = item.likes ? item.likes.length : 0;
            const liked = item.likedByMe || false;
            const commentCount = item.comments ? item.comments.length : 0;

            const commentsHtml = (item.comments && item.comments.length > 0)
                ? `<div class="cs-feed-comments">
                    ${item.comments.map(c => `
                        <div class="cs-comment-item">
                            <span class="cname">${c.sender === 'me' ? myName : partnerName}</span>
                            <span class="ctext">${escapeHtml(c.text)}</span>
                            <span class="cactions">
                                ${c.sender === 'me' ? `<button onclick="window.deleteComment('${item.id}','${c.id}')" title="删除">✕</button>` : ''}
                            </span>
                        </div>
                    `).join('')}
                </div>`
                : '';

            return `
                <div class="cs-feed-item" data-id="${item.id}">
                    <div class="cs-feed-header">
                        <div class="cs-feed-avatar">
                            ${avatarSrc ? `<img src="${avatarSrc}">` : `<i class="fas fa-user"></i>`}
                        </div>
                        <span class="cs-feed-name">${senderName}</span>
                        <span class="cs-feed-time">${timeStr}</span>
                    </div>
                    <div class="cs-feed-content">${escapeHtml(item.content)}</div>
                    <div class="cs-feed-actions">
                        <button class="cs-feed-action ${liked ? 'liked' : ''}" onclick="window.toggleFeedLike('${item.id}')">
                            <i class="fas fa-${liked ? 'heart' : 'heart'}"></i> ${likeCount > 0 ? likeCount : ''}
                        </button>
                        <button class="cs-feed-action" onclick="window.toggleFeedComments('${item.id}')">
                            <i class="fas fa-comment"></i> ${commentCount > 0 ? commentCount : ''}
                        </button>
                        ${!item.isSystem ? `<button class="cs-feed-action" onclick="window.deleteFeedItem('${item.id}')" style="color:var(--text-secondary);margin-left:auto;"><i class="fas fa-trash-alt" style="font-size:11px;"></i></button>` : ''}
                    </div>
                    ${commentsHtml}
                    <div class="cs-comment-input-wrap" id="comment-input-${item.id}" style="display:none;">
                        <input type="text" placeholder="写评论..." id="comment-text-${item.id}" maxlength="200">
                        <button onclick="window.addComment('${item.id}')">发送</button>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定评论输入框回车
        container.querySelectorAll('.cs-comment-input-wrap input').forEach(inp => {
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const feedId = inp.id.replace('comment-text-', '');
                    window.addComment(feedId);
                }
            });
        });
    }

    window.toggleFeedLike = function (feedId) {
        const item = coupleData.feed.find(f => f.id === feedId);
        if (!item) return;
        if (!item.likes) item.likes = [];
        if (item.likedByMe) {
            item.likes = item.likes.filter(id => id !== 'me');
            item.likedByMe = false;
        } else {
            item.likes.push('me');
            item.likedByMe = true;
            // 对方自动点赞（50%概率）
            if (Math.random() < 0.5) {
                item.likes.push('partner');
            }
        }
        saveCoupleData();
        renderFeed();
    };

    window.toggleFeedComments = function (feedId) {
        const wrap = document.getElementById(`comment-input-${feedId}`);
        if (!wrap) return;
        wrap.style.display = wrap.style.display === 'none' ? 'flex' : 'none';
        if (wrap.style.display === 'flex') {
            const inp = document.getElementById(`comment-text-${feedId}`);
            if (inp) setTimeout(() => inp.focus(), 100);
        }
    };

    window.addComment = function (feedId) {
        const inp = document.getElementById(`comment-text-${feedId}`);
        if (!inp || !inp.value.trim()) return;
        const text = inp.value.trim();
        const item = coupleData.feed.find(f => f.id === feedId);
        if (!item) return;
        if (!item.comments) item.comments = [];
        const myName = (settings && settings.myName) || '我';
        const partnerName = (settings && settings.partnerName) || '对方';
        item.comments.push({
            id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            sender: 'me',
            text: text,
            timestamp: Date.now()
        });
        inp.value = '';
        saveCoupleData();
        renderFeed();

        // 对方自动回复评论（60%概率）
        if (Math.random() < 0.6) {
            setTimeout(() => {
                const replyTexts = ['说的对~', '我也这么想', '嗯嗯！', '好呀好呀', '有道理呢', '嘿嘿', '没错~', '我也是这么觉得的'];
                const reply = replyTexts[Math.floor(Math.random() * replyTexts.length)];
                item.comments.push({
                    id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    sender: 'partner',
                    text: reply,
                    timestamp: Date.now()
                });
                saveCoupleData();
                renderFeed();
            }, 1000 + Math.random() * 1500);
        }
    };

    window.deleteComment = function (feedId, commentId) {
        const item = coupleData.feed.find(f => f.id === feedId);
        if (!item) return;
        item.comments = item.comments.filter(c => c.id !== commentId);
        saveCoupleData();
        renderFeed();
    };

    window.deleteFeedItem = function (feedId) {
        if (!confirm('确定删除这条动态吗？')) return;
        coupleData.feed = coupleData.feed.filter(f => f.id !== feedId);
        saveCoupleData();
        renderFeed();
    };

    // ==================== 自动发动态 ====================
    let autoFeedTimer = null;

    function scheduleAutoFeed() {
        if (!isCoupleActive) return;
        if (autoFeedTimer) clearTimeout(autoFeedTimer);
        // 每1-6小时检查一次
        const interval = 3600000 + Math.random() * 18000000;
        autoFeedTimer = setTimeout(() => {
            if (isCoupleActive && Math.random() < 0.4) {
                generateAutoFeed();
            }
            scheduleAutoFeed();
        }, interval);
    }

    function generateAutoFeed() {
        const sourcePool = [];
        // 从字卡库收集
        if (typeof customReplies !== 'undefined' && customReplies.length > 0) {
            sourcePool.push(...customReplies.filter(r => r && r.trim()));
        }
        // 从表情库收集
        if (typeof stickerLibrary !== 'undefined' && stickerLibrary.length > 0) {
            // 表情库是图片，用占位文本
            sourcePool.push('📸 分享了表情');
        }
        // 从 Emoji 收集
        if (typeof customEmojis !== 'undefined' && customEmojis.length > 0) {
            sourcePool.push(...customEmojis);
        }
        // 内置补充
        const builtin = [
            '今天天气真好呀 ☀️', '想你了 💕', '刚刚看到一朵云像你 ☁️',
            '在听一首歌，想到了你 🎵', '今天也要加油哦 💪', '晚安 🌙', '早安 🌅',
            '好想和你一起散步 🚶', '今天工作很顺利 ✨', '有点饿了... 🍜'
        ];
        sourcePool.push(...builtin);

        if (sourcePool.length < 3) return;

        // 随机选3-8条组合
        const count = Math.min(3 + Math.floor(Math.random() * 6), sourcePool.length);
        const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        let content = selected.join(' ');
        // 随机加前缀
        const prefixes = ['今天', '刚刚', '突然想到', '好想告诉你', '你知道吗', '偷偷说一句'];
        if (Math.random() < 0.4) {
            content = prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + content;
        }

        const partnerName = (settings && settings.partnerName) || '对方';
        const feedItem = addFeedItem('partner', content, false);
        saveCoupleData();

        // 在聊天界面通知
        if (typeof addMessage === 'function') {
            addMessage({
                id: Date.now() + '_feed_notify',
                sender: 'system',
                text: `💬 ${partnerName} 发了一条新动态：${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
                timestamp: new Date(),
                type: 'system'
            });
        }
        // 系统通知
        if (typeof window._sendPartnerNotification === 'function') {
            window._sendPartnerNotification('💬 新动态', `${partnerName} 发了一条动态`);
        }

        // 自动点赞（我自己）
        setTimeout(() => {
            const latest = coupleData.feed.find(f => f.id === feedItem.id);
            if (latest) {
                if (!latest.likes) latest.likes = [];
                latest.likes.push('me');
                latest.likedByMe = true;
                saveCoupleData();
                renderFeed();
            }
        }, 2000 + Math.random() * 3000);
    }

    // ==================== 情书系统 ====================
    function renderLetters() {
        const container = document.getElementById('cs-letters');
        if (!container) return;
        const partnerName = (settings && settings.partnerName) || '对方';
        const myName = (settings && settings.myName) || '我';

        const letters = coupleData.letters || [];

        let html = `
            <div class="cs-letter-editor">
                <textarea id="letter-input" placeholder="写一封情书... 💌" maxlength="2000"></textarea>
                <div class="editor-toolbar">
                    <label>字体 <input type="text" id="letter-font-input" placeholder="font-family" value="" style="width:140px;"></label>
                    <label style="margin-left:auto;">
                        <input type="checkbox" id="letter-request-reply"> 请求对方回信
                    </label>
                </div>
                <div class="editor-actions">
                    <button class="btn-send" onclick="window.sendLetter()"><i class="fas fa-paper-plane"></i> 寄出情书</button>
                    <button class="btn-cancel" onclick="document.getElementById('letter-input').value=''">清空</button>
                </div>
            </div>
            <div id="letter-list">
        `;

        if (letters.length === 0) {
            html += `<div class="cs-empty"><i class="fas fa-envelope"></i><p>还没有情书，写一封吧 💕</p></div>`;
        } else {
            html += letters.map((item, idx) => {
                const isMe = item.sender === 'me';
                const senderName = isMe ? myName : partnerName;
                const timeStr = formatTime(item.timestamp);
                const fontStyle = item.font ? `font-family:${item.font};` : '';
                const replyHtml = item.reply
                    ? `<div class="letter-reply"><span class="reply-label">💌 回信</span>${escapeHtml(item.reply)}</div>`
                    : '';
                return `
                    <div class="cs-letter-item" data-idx="${idx}">
                        <div class="letter-header">
                            <span class="letter-from">${senderName}</span>
                            <span class="letter-time">${timeStr}</span>
                        </div>
                        <div class="letter-body" style="${fontStyle}">${escapeHtml(item.content)}</div>
                        ${replyHtml}
                        <button class="letter-delete" onclick="window.deleteLetter(${idx})" title="长按删除">✕</button>
                    </div>
                `;
            }).join('');
        }

        html += `</div>`;
        container.innerHTML = html;

        // 恢复之前保存的字体
        const savedFont = localStorage.getItem('letterFont') || '';
        const fontInput = document.getElementById('letter-font-input');
        if (fontInput) fontInput.value = savedFont;
    }

    window.sendLetter = function () {
        const input = document.getElementById('letter-input');
        const content = input.value.trim();
        if (!content) { showNotification('请写一些内容 💌', 'warning'); return; }

        const font = document.getElementById('letter-font-input').value.trim();
        if (font) localStorage.setItem('letterFont', font);

        const requestReply = document.getElementById('letter-request-reply').checked;

        const letterItem = {
            id: 'l_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            sender: 'me',
            content: content,
            timestamp: Date.now(),
            font: font,
            reply: null,
            requestedReply: requestReply
        };
        coupleData.letters.push(letterItem);
        input.value = '';
        saveCoupleData();
        renderLetters();
        showNotification('💌 情书已寄出！', 'success');
        playSound('send');

        // 对方回信（如果请求了回信，80%概率；否则30%）
        const replyChance = requestReply ? 0.8 : 0.3;
        if (Math.random() < replyChance) {
            setTimeout(() => {
                generateLetterReply(letterItem.id);
            }, 2000 + Math.random() * 4000);
        }
    };

    function generateLetterReply(letterId) {
        const letter = coupleData.letters.find(l => l.id === letterId);
        if (!letter || letter.reply) return;

        const partnerName = (settings && settings.partnerName) || '对方';
        const replyPool = [
            '收到你的信了，心里暖暖的 💕',
            '我也好想你呀 ~ 每天都在想你',
            '你的字迹真好看，像你一样温柔',
            '我会一直陪着你，无论何时 🥺',
            '刚刚读完你的信，眼角湿润了',
            '你写的情话，我都记在心里了 ✨',
            '好想现在就见到你 🤗',
            '谢谢你的信，我也爱你 💖',
            '你是我的全世界 🌍',
            '读了一遍又一遍，舍不得放下',
            '今天最美的时刻，就是收到你的信',
            '我也写了一封回信给你，在梦里 💭'
        ];
        const replyText = replyPool[Math.floor(Math.random() * replyPool.length)];
        letter.reply = replyText;
        saveCoupleData();
        renderLetters();

        // 聊天通知
        if (typeof addMessage === 'function') {
            addMessage({
                id: Date.now() + '_letter_reply',
                sender: 'system',
                text: `💌 ${partnerName} 回信了：${replyText.substring(0, 20)}${replyText.length > 20 ? '...' : ''}`,
                timestamp: new Date(),
                type: 'system'
            });
        }
        showNotification(`💌 ${partnerName} 回信了！`, 'success');
        playSound('message');
    }

    window.deleteLetter = function (idx) {
        if (!confirm('确定删除这封情书吗？')) return;
        coupleData.letters.splice(idx, 1);
        saveCoupleData();
        renderLetters();
        showNotification('已删除', 'success');
    };

    // ==================== 悄悄话系统 ====================
    function renderWhispers() {
        const container = document.getElementById('cs-whisper');
        if (!container) return;
        const partnerName = (settings && settings.partnerName) || '对方';
        const myName = (settings && settings.myName) || '我';

        const whispers = coupleData.whispers || [];

        let html = `
            <div class="cs-letter-editor">
                <textarea id="whisper-input" placeholder="写一句悄悄话... 🤫" maxlength="500"></textarea>
                <div class="editor-toolbar">
                    <label>字体 <input type="text" id="whisper-font-input" placeholder="font-family" value="" style="width:140px;"></label>
                </div>
                <div class="editor-actions">
                    <button class="btn-send" onclick="window.sendWhisper()"><i class="fas fa-comment-dots"></i> 发送悄悄话</button>
                    <button class="btn-cancel" onclick="document.getElementById('whisper-input').value=''">清空</button>
                </div>
            </div>
            <div id="whisper-list">
        `;

        if (whispers.length === 0) {
            html += `<div class="cs-empty"><i class="fas fa-comment-dots"></i><p>还没有悄悄话，说点什么吧 🤫</p></div>`;
        } else {
            html += whispers.map((item, idx) => {
                const isMe = item.sender === 'me';
                const senderName = isMe ? myName : partnerName;
                const timeStr = formatTime(item.timestamp);
                const fontStyle = item.font ? `font-family:${item.font};` : '';
                return `
                    <div class="cs-letter-item" data-idx="${idx}">
                        <div class="letter-header">
                            <span class="letter-from">${senderName} 🤫</span>
                            <span class="letter-time">${timeStr}</span>
                        </div>
                        <div class="letter-body" style="${fontStyle}">${escapeHtml(item.content)}</div>
                        ${item.reply ? `<div class="letter-reply"><span class="reply-label">💬 回应</span>${escapeHtml(item.reply)}</div>` : ''}
                        <button class="letter-delete" onclick="window.deleteWhisper(${idx})" title="长按删除">✕</button>
                    </div>
                `;
            }).join('');
        }

        html += `</div>`;
        container.innerHTML = html;

        const savedFont = localStorage.getItem('whisperFont') || '';
        const fontInput = document.getElementById('whisper-font-input');
        if (fontInput) fontInput.value = savedFont;
    }

    window.sendWhisper = function () {
        const input = document.getElementById('whisper-input');
        const content = input.value.trim();
        if (!content) { showNotification('写点什么吧 🤫', 'warning'); return; }

        const font = document.getElementById('whisper-font-input').value.trim();
        if (font) localStorage.setItem('whisperFont', font);

        const whisperItem = {
            id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            sender: 'me',
            content: content,
            timestamp: Date.now(),
            font: font,
            reply: null
        };
        coupleData.whispers.push(whisperItem);
        input.value = '';
        saveCoupleData();
        renderWhispers();
        showNotification('🤫 悄悄话已发送！', 'success');
        playSound('send');

        // 对方回应（40%概率）
        if (Math.random() < 0.4) {
            setTimeout(() => {
                const replyPool = ['嘿嘿', '收到~', '我也是 💕', '好巧！', '嗯嗯', '真的吗', '好呀好呀', '🤭'];
                const reply = replyPool[Math.floor(Math.random() * replyPool.length)];
                whisperItem.reply = reply;
                saveCoupleData();
                renderWhispers();
                const partnerName = (settings && settings.partnerName) || '对方';
                showNotification(`🤫 ${partnerName} 回应了你的悄悄话`, 'success');
            }, 1500 + Math.random() * 3000);
        }
    };

    window.deleteWhisper = function (idx) {
        if (!confirm('确定删除这条悄悄话吗？')) return;
        coupleData.whispers.splice(idx, 1);
        saveCoupleData();
        renderWhispers();
        showNotification('已删除', 'success');
    };

    // ==================== 记账本 ====================
    function renderBills() {
        const container = document.getElementById('cs-bills');
        if (!container) return;
        const bills = coupleData.bills || [];

        let totalIncome = 0, totalExpense = 0;
        bills.forEach(b => {
            if (b.type === 'income') totalIncome += b.amount;
            else totalExpense += b.amount;
        });
        const balance = totalIncome - totalExpense;

        let html = `
            <div class="cs-bill-summary">
                <div class="stat"><div class="num income">+${totalIncome.toFixed(2)}</div><div class="label">收入</div></div>
                <div class="stat"><div class="num expense">-${totalExpense.toFixed(2)}</div><div class="label">支出</div></div>
                <div class="stat"><div class="num" style="color:var(--text-primary);">${balance.toFixed(2)}</div><div class="label">结余</div></div>
            </div>
            <div class="cs-bill-editor">
                <input class="bill-amount-input" id="bill-amount" type="number" step="0.01" placeholder="金额">
                <select id="bill-type">
                    <option value="income">收入</option>
                    <option value="expense">支出</option>
                </select>
                <input class="bill-desc-input" id="bill-desc" placeholder="描述...">
                <button class="bill-add-btn" onclick="window.addBill()">记账</button>
            </div>
            <div id="bill-list">
        `;

        if (bills.length === 0) {
            html += `<div class="cs-empty"><i class="fas fa-coins"></i><p>还没有记账记录</p></div>`;
        } else {
            html += bills.map((item, idx) => {
                const isIncome = item.type === 'income';
                const sign = isIncome ? '+' : '-';
                const partnerName = (settings && settings.partnerName) || '对方';
                return `
                    <div class="cs-bill-item">
                        <span class="bill-icon">${isIncome ? '📈' : '📉'}</span>
                        <div class="bill-info">
                            <div class="bill-amount ${item.type}">${sign}${item.amount.toFixed(2)}</div>
                            <div class="bill-desc">${escapeHtml(item.desc || '无备注')}</div>
                        </div>
                        ${item.note ? `<span class="bill-note">${escapeHtml(item.note)}</span>` : ''}
                        <button class="bill-delete" onclick="window.deleteBill(${idx})">✕</button>
                    </div>
                `;
            }).join('');
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    window.addBill = function () {
        const amountInput = document.getElementById('bill-amount');
        const typeSelect = document.getElementById('bill-type');
        const descInput = document.getElementById('bill-desc');

        const amount = parseFloat(amountInput.value);
        if (!amount || amount <= 0) { showNotification('请输入有效金额', 'warning'); return; }
        const type = typeSelect.value;
        const desc = descInput.value.trim() || '无备注';

        const billItem = {
            id: 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: type,
            amount: amount,
            desc: desc,
            timestamp: Date.now(),
            note: null
        };
        coupleData.bills.push(billItem);
        amountInput.value = '';
        descInput.value = '';
        saveCoupleData();
        renderBills();
        showNotification('💰 记账成功！', 'success');

        // 请求对方留言（80%概率）
        if (Math.random() < 0.8) {
            setTimeout(() => {
                const notePool = [
                    '买得值！', '好便宜呀', '真会过日子', '嘿嘿，我记下了', '不错不错', '下次我也要买',
                    '这钱花得值', '你开心就好~', '哇，好棒！', '我也想要', '你太会买了'
                ];
                const note = notePool[Math.floor(Math.random() * notePool.length)];
                const latestBill = coupleData.bills.find(b => b.id === billItem.id);
                if (latestBill) {
                    latestBill.note = note;
                    saveCoupleData();
                    renderBills();
                    const partnerName = (settings && settings.partnerName) || '对方';
                    showNotification(`💬 ${partnerName} 留言：${note}`, 'success');
                    if (typeof addMessage === 'function') {
                        addMessage({
                            id: Date.now() + '_bill_note',
                            sender: 'system',
                            text: `💰 ${partnerName} 在账单上留言：${note}`,
                            timestamp: new Date(),
                            type: 'system'
                        });
                    }
                }
            }, 1000 + Math.random() * 3000);
        }
    };

    window.deleteBill = function (idx) {
        if (!confirm('确定删除这条记账记录吗？')) return;
        coupleData.bills.splice(idx, 1);
        saveCoupleData();
        renderBills();
        showNotification('已删除', 'success');
    };

    // ==================== 日记/备忘录 ====================
    function renderDiaries() {
        const container = document.getElementById('cs-diary');
        if (!container) return;
        const partnerName = (settings && settings.partnerName) || '对方';
        const myName = (settings && settings.myName) || '我';

        const diaries = coupleData.diaries || [];

        let html = `
            <div class="cs-letter-editor">
                <input type="text" id="diary-title-input" placeholder="日记标题..." style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:10px;font-size:14px;background:var(--primary-bg);color:var(--text-primary);outline:none;font-family:var(--font-family);margin-bottom:8px;box-sizing:border-box;">
                <textarea id="diary-input" placeholder="写下今天的故事..." maxlength="3000" style="min-height:100px;"></textarea>
                <div class="editor-actions">
                    <button class="btn-send" onclick="window.addDiary()"><i class="fas fa-book"></i> 写日记</button>
                    <button class="btn-cancel" onclick="document.getElementById('diary-input').value='';document.getElementById('diary-title-input').value=''">清空</button>
                </div>
            </div>
            <div id="diary-list">
        `;

        if (diaries.length === 0) {
            html += `<div class="cs-empty"><i class="fas fa-book"></i><p>还没有日记，记录今天吧 📖</p></div>`;
        } else {
            html += diaries.map((item, idx) => {
                const isMe = item.sender === 'me';
                const senderName = isMe ? myName : partnerName;
                const timeStr = formatTime(item.timestamp);
                const replyHtml = item.reply
                    ? `<div class="diary-reply"><span class="reply-name">${partnerName}</span> 留言：${escapeHtml(item.reply)}</div>`
                    : '';
                return `
                    <div class="cs-diary-item">
                        <div class="diary-header">
                            <span class="diary-title">${escapeHtml(item.title || '无题')}</span>
                            <span style="display:flex;align-items:center;gap:6px;">
                                <span>${senderName} · ${timeStr}</span>
                                <button class="diary-delete" onclick="window.deleteDiary(${idx})">✕</button>
                            </span>
                        </div>
                        <div class="diary-body">${escapeHtml(item.content)}</div>
                        ${replyHtml}
                    </div>
                `;
            }).join('');
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    window.addDiary = function () {
        const titleInput = document.getElementById('diary-title-input');
        const input = document.getElementById('diary-input');
        const title = titleInput.value.trim() || '无题';
        const content = input.value.trim();
        if (!content) { showNotification('写点内容吧 📖', 'warning'); return; }

        const diaryItem = {
            id: 'd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            sender: 'me',
            title: title,
            content: content,
            timestamp: Date.now(),
            reply: null
        };
        coupleData.diaries.push(diaryItem);
        titleInput.value = '';
        input.value = '';
        saveCoupleData();
        renderDiaries();
        showNotification('📖 日记已保存！', 'success');
        playSound('send');

        // 对方留言（70%概率）
        if (Math.random() < 0.7) {
            setTimeout(() => {
                const replyPool = [
                    '我也要记下来！', '好棒的一天', '你写的真好', '我也想和你一起经历', '今天我也在想你',
                    '这个日子值得记住 💕', '我也有类似的经历呢', '你总是让我感动', '好温馨 ~', '我的每一天都和你有关'
                ];
                const reply = replyPool[Math.floor(Math.random() * replyPool.length)];
                const latest = coupleData.diaries.find(d => d.id === diaryItem.id);
                if (latest) {
                    latest.reply = reply;
                    saveCoupleData();
                    renderDiaries();
                    const partnerName = (settings && settings.partnerName) || '对方';
                    showNotification(`💬 ${partnerName} 在你的日记留言了`, 'success');
                }
            }, 1500 + Math.random() * 3000);
        }
    };

    window.deleteDiary = function (idx) {
        if (!confirm('确定删除这篇日记吗？')) return;
        coupleData.diaries.splice(idx, 1);
        saveCoupleData();
        renderDiaries();
        showNotification('已删除', 'success');
    };

    // ==================== 礼物系统 ====================
    const GIFT_SHOP = [
        { id: 'g1', name: '玫瑰花', icon: '🌹', affection: 10, price: '❤️ x1' },
        { id: 'g2', name: '巧克力', icon: '🍫', affection: 15, price: '❤️ x2' },
        { id: 'g3', name: '小熊玩偶', icon: '🧸', affection: 20, price: '❤️ x3' },
        { id: 'g4', name: '情侣手链', icon: '💎', affection: 30, price: '❤️ x5' },
        { id: 'g5', name: '专属情书', icon: '💌', affection: 25, price: '❤️ x4' },
        { id: 'g6', name: '星空投影', icon: '🌌', affection: 40, price: '❤️ x8' },
        { id: 'g7', name: '定制戒指', icon: '💍', affection: 50, price: '❤️ x10' },
        { id: 'g8', name: '浪漫晚餐', icon: '🍽️', affection: 35, price: '❤️ x6' },
    ];

    function renderGifts() {
        const container = document.getElementById('cs-gifts');
        if (!container) return;
        const partnerName = (settings && settings.partnerName) || '对方';
        const myName = (settings && settings.myName) || '我';

        const giftRecords = coupleData.giftRecords || [];

        // 计算亲密度
        updateAffectionDisplay();

        let html = `
            <div style="margin-bottom:14px;">
                <div style="font-size:13px;font-weight:600;margin-bottom:8px;">🎁 礼物商店</div>
                <div class="cs-gift-shop">
                    ${GIFT_SHOP.map(g => `
                        <div class="gift-card" onclick="window.sendGift('${g.id}')">
                            <span class="gift-icon-big">${g.icon}</span>
                            <div class="gift-name-sm">${g.name}</div>
                            <div class="gift-aff">+${g.affection} 亲密度</div>
                            <div class="gift-price">${g.price}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="font-size:13px;font-weight:600;margin-bottom:8px;">📦 礼物记录</div>
            <div id="gift-record-list">
        `;

        if (giftRecords.length === 0) {
            html += `<div class="cs-empty"><i class="fas fa-gift"></i><p>还没有礼物记录，送一份礼物吧 🎁</p></div>`;
        } else {
            html += giftRecords.map((item, idx) => {
                const isFromMe = item.from === 'me';
                const fromName = isFromMe ? myName : partnerName;
                const toName = isFromMe ? partnerName : myName;
                const timeStr = formatTime(item.timestamp);
                const gift = GIFT_SHOP.find(g => g.id === item.giftId);
                return `
                    <div class="cs-gift-item">
                        <span class="gift-icon">${gift ? gift.icon : '🎁'}</span>
                        <div class="gift-info">
                            <div class="gift-name">${gift ? gift.name : '礼物'}</div>
                            <div class="gift-from">${fromName} → ${toName} · ${timeStr}</div>
                            ${item.note ? `<div class="gift-note">💬 ${escapeHtml(item.note)}</div>` : ''}
                        </div>
                        <span class="gift-affection">+${gift ? gift.affection : 0}</span>
                        <button class="bill-delete" onclick="window.deleteGiftRecord(${idx})" style="opacity:0.3;">✕</button>
                    </div>
                `;
            }).join('');
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    window.sendGift = function (giftId, note = '') {
        const gift = GIFT_SHOP.find(g => g.id === giftId);
        if (!gift) return;

        const partnerName = (settings && settings.partnerName) || '对方';
        const myName = (settings && settings.myName) || '我';

        // 增加亲密度
        affectionData.affection += gift.affection;
        updateAffectionLevel();
        saveAffectionData();

        // 记录礼物
        const record = {
            id: 'gr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            from: 'me',
            giftId: giftId,
            timestamp: Date.now(),
            note: note || ''
        };
        coupleData.giftRecords.push(record);
        saveCoupleData();
        renderGifts();
        updateAffectionDisplay();

        showNotification(`🎁 赠送了 ${gift.name}！亲密度 +${gift.affection}`, 'success');
        playSound('send');

        // 聊天界面通知
        if (typeof addMessage === 'function') {
            addMessage({
                id: Date.now() + '_gift_notify',
                sender: 'system',
                text: `🎁 ${myName} 送了 ${gift.name} 给 ${partnerName} 💕 ${note ? '（' + note + '）' : ''}`,
                timestamp: new Date(),
                type: 'system'
            });
        }

        // 系统通知
        if (typeof window._sendPartnerNotification === 'function') {
            window._sendPartnerNotification('🎁 礼物送达', `${myName} 送了 ${gift.name} 给你`);
        }

        // 对方回赠（30%概率）
        if (Math.random() < 0.3) {
            setTimeout(() => {
                const randomGift = GIFT_SHOP[Math.floor(Math.random() * GIFT_SHOP.length)];
                affectionData.affection += randomGift.affection;
                updateAffectionLevel();
                saveAffectionData();
                const replyRecord = {
                    id: 'gr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    from: 'partner',
                    giftId: randomGift.id,
                    timestamp: Date.now(),
                    note: '回赠 💕'
                };
                coupleData.giftRecords.push(replyRecord);
                saveCoupleData();
                renderGifts();
                updateAffectionDisplay();
                showNotification(`💝 ${partnerName} 回赠了 ${randomGift.name}！`, 'success');
                if (typeof addMessage === 'function') {
                    addMessage({
                        id: Date.now() + '_gift_return',
                        sender: 'system',
                        text: `💝 ${partnerName} 回赠了 ${randomGift.name} 给 ${myName}`,
                        timestamp: new Date(),
                        type: 'system'
                    });
                }
            }, 3000 + Math.random() * 5000);
        }
    };

    window.deleteGiftRecord = function (idx) {
        if (!confirm('确定删除这条礼物记录吗？')) return;
        coupleData.giftRecords.splice(idx, 1);
        saveCoupleData();
        renderGifts();
        showNotification('已删除', 'success');
    };

    // ==================== 亲密度系统 ====================
    const LEVELS = [
        { min: 0, name: '初识' },
        { min: 50, name: '熟悉' },
        { min: 150, name: '亲密' },
        { min: 300, name: '热恋' },
        { min: 500, name: '深爱' },
        { min: 800, name: '永恒' },
        { min: 1200, name: '灵魂伴侣' },
        { min: 1800, name: '命中注定' },
        { min: 2600, name: '一生一世' },
        { min: 3600, name: '超越时间' }
    ];

    function updateAffectionLevel() {
        let level = 0;
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (affectionData.affection >= LEVELS[i].min) {
                level = i;
                break;
            }
        }
        affectionData.level = level;
        affectionData.levelName = LEVELS[level].name;
    }

    function updateAffectionDisplay() {
        const container = document.getElementById('cs-body');
        if (!container) return;
        const aff = affectionData.affection || 0;
        const levelName = affectionData.levelName || '初识';
        const nextLevel = LEVELS[affectionData.level + 1];
        const progress = nextLevel ? (aff / nextLevel.min * 100) : 100;

        let existing = container.querySelector('.cs-affection-bar');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.className = 'cs-affection-bar';
        bar.innerHTML = `
            <div>
                <span class="level">Lv.${affectionData.level}</span>
                <span class="level-label">${levelName}</span>
                <span class="aff-num">❤️ ${aff}</span>
            </div>
            <div class="aff-progress">
                <div class="fill" style="width:${Math.min(progress, 100)}%;"></div>
            </div>
            ${nextLevel ? `<div style="font-size:10px;color:var(--text-secondary);margin-top:4px;">下一级: ${nextLevel.name} (${aff}/${nextLevel.min})</div>` : '<div style="font-size:10px;color:var(--text-secondary);margin-top:4px;">✨ 已达最高等级</div>'}
        `;
        container.prepend(bar);
    }

    // ==================== 经期提醒 ====================
    function checkPeriodReminder() {
        if (!periodData.day1 && !periodData.day2) return;
        const now = new Date();
        const today = now.getDate();
        const month = now.getMonth();

        // 检查是否今天需要提醒
        const days = [periodData.day1, periodData.day2].filter(d => d !== null);
        if (!days.includes(today)) return;

        const key = `${month}_${today}`;
        if (periodData.lastNotified === key) return;

        // 提醒
        const partnerName = (settings && settings.partnerName) || '对方';
        const careMsgs = [
            '今天要注意保暖哦 🧣',
            '多喝热水，别着凉了 💧',
            '辛苦啦，抱抱你 🫂',
            '记得好好休息，我来照顾你 💕',
            '今天身体还好吗？想你了 🥺',
            '注意休息，别太累了 ✨',
            '给你准备了暖宝宝，随时来拿 🤗',
            '今天要好好对自己哦 💖'
        ];
        const msg = careMsgs[Math.floor(Math.random() * careMsgs.length)];

        // 弹窗
        const popup = document.createElement('div');
        popup.style.cssText = `
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            background:var(--secondary-bg);border:2px solid #ff6b6b;
            border-radius:24px;padding:24px 28px;z-index:10000;
            max-width:340px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);
            text-align:center;animation:modalContentSlideIn 0.35s ease;
        `;
        popup.innerHTML = `
            <div style="font-size:48px;margin-bottom:8px;">🌺</div>
            <div style="font-size:17px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">${partnerName} 的关心</div>
            <div style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:16px;">${msg}</div>
            <button onclick="this.closest('div[style]').remove()" style="padding:8px 32px;border-radius:20px;border:none;background:var(--accent-color);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:var(--font-family);">💕 收到</button>
        `;
        document.body.appendChild(popup);

        periodData.lastNotified = key;
        savePeriodData();

        // 聊天通知
        if (typeof addMessage === 'function') {
            addMessage({
                id: Date.now() + '_period_care',
                sender: 'system',
                text: `🌺 ${partnerName} 的关心：${msg}`,
                timestamp: new Date(),
                type: 'system'
            });
        }
        if (typeof window._sendPartnerNotification === 'function') {
            window._sendPartnerNotification('🌺 来自伴侣的关心', msg);
        }
    }

    // ==================== 工具函数 ====================
    function formatTime(ts) {
        const d = new Date(ts);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        if (diff < 172800000) return '昨天';
        return `${d.getMonth()+1}月${d.getDate()}日`;
    }

    function getPartnerAvatarSrc() {
        const img = document.querySelector('#partner-avatar img, [id*="partner-avatar"] img');
        return img ? img.src : null;
    }

    function getMyAvatarSrc() {
        const img = document.querySelector('#my-avatar img, [id*="my-avatar"] img');
        return img ? img.src : null;
    }

    function playSound(type) {
        if (typeof window.playSound === 'function') window.playSound(type);
    }

    function showNotification(msg, type) {
        if (typeof window.showNotification === 'function') window.showNotification(msg, type);
    }

    // ==================== 暴露全局API ====================
    window.coupleSpace = {
        init: initCoupleSpace,
        open: openCoupleSpace,
        addFeed: addFeedItem,
        sendGift: window.sendGift,
        addDiary: window.addDiary,
        addBill: window.addBill,
        sendLetter: window.sendLetter,
        sendWhisper: window.sendWhisper,
        getAffection: () => affectionData,
        getStatus: () => isCoupleActive,
        getInviteStatus: () => inviteStatus,
        acceptInvite: window.acceptCoupleInvite,
        sendInvite: window.sendCoupleInvite,
        openPeriodSettings: openPeriodSettings
    };

    // ==================== 经期设置入口 ====================
    function openPeriodSettings() {
        const modal = document.getElementById('period-reminder-modal');
        if (!modal) return;
        document.getElementById('period-day1').value = periodData.day1 || '';
        document.getElementById('period-day2').value = periodData.day2 || '';
        updatePeriodStatus();
        showModal(modal);
    }

    function updatePeriodStatus() {
        const el = document.getElementById('period-status');
        if (!el) return;
        const d1 = periodData.day1, d2 = periodData.day2;
        if (d1 && d2) {
            el.textContent = `📅 提醒日：每月 ${d1} 号、${d2} 号`;
            el.style.color = 'var(--accent-color)';
        } else {
            el.textContent = '⚠️ 请设置两个提醒日期';
            el.style.color = 'var(--text-secondary)';
        }
    }

    document.addEventListener('click', function (e) {
        if (e.target.id === 'save-period-btn') {
            const day1 = parseInt(document.getElementById('period-day1').value);
            const day2 = parseInt(document.getElementById('period-day2').value);
            if (!day1 || !day2 || day1 < 1 || day1 > 31 || day2 < 1 || day2 > 31) {
                showNotification('请输入有效的日期 (1-31)', 'warning');
                return;
            }
            periodData.day1 = day1;
            periodData.day2 = day2;
            periodData.lastNotified = null;
            savePeriodData();
            updatePeriodStatus();
            hideModal(document.getElementById('period-reminder-modal'));
            showNotification('✅ 经期提醒已保存！', 'success');
        }
    });

    // ==================== 检查未读礼物通知 ====================
    function checkPendingGiftNotifications() {
        // 在首次加载时检查是否有新的礼物记录
        const lastChecked = localStorage.getItem('coupleGiftLastChecked') || 0;
        const giftRecords = coupleData.giftRecords || [];
        const newGifts = giftRecords.filter(r => r.timestamp > lastChecked && r.from === 'partner');
        if (newGifts.length > 0) {
            newGifts.forEach(g => {
                const gift = GIFT_SHOP.find(gg => gg.id === g.giftId);
                if (gift) {
                    const partnerName = (settings && settings.partnerName) || '对方';
                    showNotification(`💝 ${partnerName} 送了 ${gift.name} 给你！`, 'success');
                    if (typeof addMessage === 'function') {
                        addMessage({
                            id: Date.now() + '_gift_notify_incoming',
                            sender: 'system',
                            text: `💝 ${partnerName} 送了 ${gift.name} 给你${g.note ? '（' + g.note + '）' : ''}`,
                            timestamp: new Date(),
                            type: 'system'
                        });
                    }
                }
            });
            localStorage.setItem('coupleGiftLastChecked', Date.now());
        }
    }

    // ==================== 初始化 ====================
    // 在页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initCoupleSpace, 800);
        });
    } else {
        setTimeout(initCoupleSpace, 800);
    }

    // 聊天设置里添加经期提醒入口
    setTimeout(() => {
        const chatModal = document.getElementById('chat-modal');
        if (chatModal) {
            const observer = new MutationObserver(() => {
                if (chatModal.style.display === 'flex' || chatModal.style.display === 'block') {
                    // 在显示设置中添加经期提醒入口（如果还没有）
                    const panel = document.getElementById('cs-panel-rhythm');
                    if (panel && !document.getElementById('period-settings-entry')) {
                        const entry = document.createElement('div');
                        entry.id = 'period-settings-entry';
                        entry.className = 'setting-pill-row';
                        entry.style.cssText = 'border-top:1px solid var(--border-color);cursor:pointer;';
                        entry.innerHTML = `
                            <span class="setting-pill-icon"><i class="fas fa-calendar-heart"></i></span>
                            <span class="setting-pill-label">经期提醒 <span style="font-size:11px;color:var(--text-secondary);font-weight:400;">设置每月提醒日</span></span>
                            <i class="fas fa-chevron-right" style="color:var(--text-secondary);font-size:12px;"></i>
                        `;
                        entry.addEventListener('click', openPeriodSettings);
                        panel.appendChild(entry);
                    }
                }
            });
            observer.observe(chatModal, { attributes: true, attributeFilter: ['style'] });
        }
    }, 1000);

})();
