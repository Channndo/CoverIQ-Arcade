/* Isolated CoverIQ identity + save-gate. Does not replace local save. */
(function () {
    var signedIn = false;
    var signupUrl = 'https://cover-iq.com/signup';
    var banner;

    function canSave() {
        return signedIn === true;
    }

    function saveBlockedLines() {
        return [
            "Local save needs a CoverIQ account.",
            "Make a free account to save your dealership\nand appear on the leaderboard.",
            "You can keep playing — nothing was erased."
        ];
    }

    function ensureBanner() {
        var title = document.getElementById('title-screen');
        if (!title) return;
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'coveriq-save-banner';
            banner.style.cssText = 'position:absolute;left:8px;right:8px;bottom:8px;z-index:5;font-family:monospace;font-size:8px;line-height:1.4;text-align:center;color:#ffe27a;text-shadow:0 1px 0 #000;';
            title.appendChild(banner);
        }
        banner.textContent = canSave()
            ? 'CoverIQ account linked · local save on'
            : 'Play freely. Make a CoverIQ account to save locally.';
        banner.style.display = 'block';
    }

    function extractStats(payload) {
        var events = payload && payload.gameEvents ? payload.gameEvents : {};
        var probation = payload && payload.probation ? payload.probation : {};
        return {
            day: Number(events.currentDay) || 1,
            csi: Number(probation.csiScore) || 0,
            ros: Number(probation.serviceROs) || 0,
            days_won: Number(probation.daysSucceeded) || 0
        };
    }

    function onLocalSaved(payload) {
        if (!canSave()) return;
        var stats = extractStats(payload || (typeof buildSavePayload === 'function' ? buildSavePayload() : {}));
        try {
            window.parent.postMessage({
                source: 'coveriq-arcade',
                type: 'stats-snapshot',
                v: 1,
                gameSlug: 'car-planet',
                stats: stats
            }, '*');
        } catch (e) { /* fail-open: local save already wrote */ }
    }

    function applyIdentity(data) {
        signedIn = !!(data && data.signedIn);
        if (data && typeof data.signupUrl === 'string' && data.signupUrl) signupUrl = data.signupUrl;
        ensureBanner();
    }

    window.addEventListener('message', function (event) {
        var data = event.data;
        if (!data || data.source !== 'coveriq-arcade' || data.type !== 'identity') return;
        applyIdentity(data);
    });

    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ source: 'coveriq-arcade', type: 'identity-request', v: 1 }, '*');
        }
    } catch (e) { /* standalone */ }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureBanner);
    } else {
        ensureBanner();
    }

    window.CoverIQArcade = {
        canSave: canSave,
        saveBlockedLines: saveBlockedLines,
        onLocalSaved: onLocalSaved,
        signupUrl: function () { return signupUrl; }
    };
})();
