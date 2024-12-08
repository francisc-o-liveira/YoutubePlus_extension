(function() {

    chrome.storage.sync.get(['isFeatureActive'], function (result) {
        if (result.isFeatureActive) blockAds();
    });

    const isPopupBlockerActive = false;
    const isUpdateCheckerActive = false;
    const isLoggingActive = true;

    const customUpdateNotification = {
        isActive: true,
        displayTime: 5000,
    };

    let currentUrl = window.location.href;
    let adFound = false;
    let adCheckLoopCount = 0;
    let updateSkipped = false;

    log("Script started");

    if (isPopupBlockerActive) blockPopups();

    function blockPopups() {
        setInterval(() => {
            const overlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const closeButton = document.getElementById("dismiss-button");

            const video = document.querySelector('video');

            document.body.style.setProperty('overflow-y', 'auto', 'important');

            if (overlay) {
                overlay.removeAttribute("opened");
                overlay.remove();
            }

            if (popup) {
                log("Popup found, removing...");

                if (closeButton) closeButton.click();

                popup.remove();
                video.play();

                setTimeout(() => {
                    video.play();
                }, 500);

                log("Popup removed");
            }

            if (!video.paused) return;
            video.play();

        }, 1000);
    }

    function blockAds() {
        log("blockAds()");

        let normalPlaybackRate = 1;

        setInterval(() => {
            const video = document.querySelector('video');
            const ad = [...document.querySelectorAll('.ad-showing')][0];

            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                removePageAds();
            }

            if (ad) {
                adFound = true;
                adCheckLoopCount += 1;

                if (adCheckLoopCount < 10) {
                    const adButton = document.querySelector('.ytp-ad-button-icon');
                    adButton?.click();

                    const blockButton = document.querySelector('[label="Block ad"]');
                    blockButton?.click();

                    const confirmButton = document.querySelector('.Eddif [label="CONTINUE"] button');
                    confirmButton?.click();

                    const closeButton = document.querySelector('.zBmRhe-Bz112c');
                    closeButton?.click();
                } else {
                    if (video) video.play();
                }

                const popupContainer = document.querySelector('body > ytd-app > ytd-popup-container > tp-yt-paper-dialog');
                if (popupContainer && popupContainer.style.display === "") {
                    popupContainer.style.display = 'none';
                }

                log("Ad found");

                const skipButtonSelectors = [
                    'ytp-ad-skip-button-container',
                    'ytp-ad-skip-button-modern',
                    '.videoAdUiSkipButton',
                    '.ytp-ad-skip-button',
                    '.ytp-ad-skip-button-modern',
                    '.ytp-ad-skip-button',
                    '.ytp-ad-skip-button-slot'
                ];

                if (video) {
                    video.playbackRate = 10;
                    video.volume = 0;

                    skipButtonSelectors.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        if (elements && elements.length > 0) {
                            elements.forEach(element => {
                                element?.click();
                            });
                        }
                    });

                    video.play();

                    const randomOffset = Math.random() * (0.5 - 0.1) + 0.1;
                    video.currentTime = video.duration + randomOffset || 0;
                }

                log("Ad skipped (✔️)");

            } else {
                if (video && video.playbackRate === 10) {
                    video.playbackRate = normalPlaybackRate;
                }

                if (adFound) {
                    adFound = false;

                    if (normalPlaybackRate === 10) normalPlaybackRate = 1;
                    if (video && isFinite(normalPlaybackRate)) video.playbackRate = normalPlaybackRate;

                    adCheckLoopCount = 0;
                } else {
                    if (video) normalPlaybackRate = video.playbackRate;
                }
            }

        }, 50);

        removePageAds();
    }

    function removePageAds() {
        const adElements = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");
        const styleElement = document.createElement('style');

        styleElement.textContent = `
            ytd-action-companion-ad-renderer,
            ytd-display-ad-renderer,
            ytd-video-masthead-ad-advertiser-info-renderer,
            ytd-video-masthead-ad-primary-video-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-ad-slot-renderer,
            yt-about-this-ad-renderer,
            yt-mealbar-promo-renderer,
            ytd-statement-banner-renderer,
            ytd-ad-slot-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-banner-promo-renderer-background
            statement-banner-style-type-compact,
            .ytd-video-masthead-ad-v3-renderer,
            div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint,
            div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer,
            div#main-container.style-scope.ytd-promoted-video-renderer,
            div#player-ads.style-scope.ytd-watch-flexy,
            ad-slot-renderer,
            ytm-promoted-sparkles-web-renderer,
            masthead-ad,
            tp-yt-iron-overlay-backdrop,

            #masthead-ad {
                display: none !important;
            }
        `;

        document.head.appendChild(styleElement);

        adElements?.forEach((element) => {
            if (element.getAttribute("id") === "rendering-content") {
                element.childNodes?.forEach((childElement) => {
                    if (childElement?.data.targetId && childElement?.data.targetId !== "engagement-panel-macro-markers-description-chapters") {
                        element.style.display = 'none';
                    }
                });
            }
        });

        log("Page ads removed (✔️)");
    }

    function log(message, level = 'info', ...args) {
        if (!isLoggingActive) return;

        const prefix = 'AdBlocker:';
        const formattedMessage = `${prefix} ${message}`;
        switch (level) {
            case 'error':
                console.error(formattedMessage, ...args);
                break;
            case 'log':
                console.log(formattedMessage, ...args);
                break;
            case 'warn':
                console.warn(formattedMessage, ...args);
                break;
            case 'info':
            default:
                console.info(formattedMessage, ...args);
                break;
        }
    }

})();