/* Isolated CoverIQ stats bridge. Auto World has no campaign save file. */
(function () {
    var signedIn = false;

    function postStats(stats) {
        if (!signedIn) return;
        try {
            window.parent.postMessage({
                source: 'coveriq-arcade',
                type: 'stats-snapshot',
                v: 1,
                gameSlug: 'auto-world',
                stats: stats
            }, '*');
        } catch (e) { /* fail-open */ }
    }

    window.addEventListener('message', function (event) {
        var data = event.data;
        if (!data || data.source !== 'coveriq-arcade' || data.type !== 'identity') return;
        signedIn = !!data.signedIn;
    });

    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ source: 'coveriq-arcade', type: 'identity-request', v: 1 }, '*');
        }
    } catch (e) { /* standalone */ }

    window.CoverIQArcade = {
        canSave: function () { return signedIn; },
        onFightWon: function (fightsWon) {
            postStats({ fights_won: Number(fightsWon) || 0 });
        },
        onRunComplete: function (fightsWon) {
            postStats({ fights_won: Number(fightsWon) || 0, run_complete: 1 });
        }
    };
})();
