// ==UserScript==
// @name         Illyriad Tools Suite - LuperStyles
// @namespace    http://tampermonkey.net/
// @version      0.2
// ==/UserScript==

const THEMES = {
    "Dark-mode": {
        /* ==================== Background Colors ==================== */
        "--ik-theme-bg": "#131314",
        "--ik-theme-content-bg": "#151516",
        "--ik-theme-alt-bg": "#202021",
        "--ik-theme-light-alt-bg": "#515252",
        "--ik-theme-input-bg": "#515252",
        "--ik-theme-border": "#333537",

        /* ==================== Text Colors ==================== */
        "--ik-theme-text": "#e3e3e3",
        "--ik-theme-special-text1": "#e5b420",
        "--ik-theme-special-text2": "#f00",
        "--ik-theme-special-text3": "#e54e20",
        "--ik-theme-special-text4": "#ea882e",
        "--ik-theme-special-text5": "#e54e20",
        "--ik-theme-special-text6": "#ea882e",
        "--ik-theme-special-text7": "#2d2e30",
        "--ik-theme-special-text8": "#1e1f20",
        "--ik-theme-special-text9": "#434343",
        "--ik-theme-health-bar": "#d0110e",
        "--ik-theme-xp-bar": "#f26723",
        "--ik-theme-link": "#ea882e",
        "--ik-theme-link-hover": "#e54e20",
        "--ik-theme-warning-highlight": "#ff000042",
        "--ik-theme-border-color": "#515252",
        "--ik-theme-alt-border-color": "#515252",

        /* ==================== Background Images ==================== */
        "--ik-theme-texture": 'url("https://i.imgur.com/bVPeeR1.jpeg")',
        "--ik-theme-headerP-texture": 'url("https://i.imgur.com/pd2Fk0k.jpeg")',
        "--ik-theme-headerO-texture": 'url("https://i.imgur.com/56MuJba.png")',
        "--ik-theme-header-texture": 'url("https://i.imgur.com/yLBHkHn.jpeg")',
        "--ik-theme-headermain-texture": 'url("https://i.imgur.com/4uN1QEX.png")',
        "--ik-theme-popup-top": 'url("https://i.imgur.com/IpJ1c9a.png")',
        "--ik-theme-popup-mid": 'url("https://i.imgur.com/Ze6w7Ao.png")',
        "--ik-theme-popup-bot": 'url("https://i.imgur.com/IWDUzGv.png")',
        "--ik-theme-herald-right": 'url("https://i.imgur.com/euSGpqg.jpeg")',
        "--ik-theme-herald-left": 'url("https://i.imgur.com/2kpFWov.jpeg")',
        "--ik-theme-herald-title": 'url("https://i.imgur.com/Wk5bDRK.jpeg")',
        "--ik-theme-herald-book": 'url("https://i.imgur.com/qQOXNaQ.jpeg")',
        "--ik-theme-darkmode-credits": 'url("https://i.imgur.com/Ht3gA2r.png")',
        "--ik-theme-border-image": 'url("https://assets.illyriad.net/img/backgrounds/borderclasps3.png")',
        "--ik-theme-small-border-image": 'url("https://assets.illyriad.net/img/backgrounds/border_tiny.png")',

        /* ==================== Button Images ==================== */
        "--ik-theme-button-short-off": 'url("https://assets.illyriad.net/img/buttons/short_off_rev.png")',
        "--ik-theme-button-short-on": 'url("https://assets.illyriad.net/img/buttons/short_on_rev.png")',

        /* Top Button Row Images */
        "--ik-theme-button-world-off": 'url("https://i.imgur.com/8mweI6h.png")',
        "--ik-theme-button-world-on": 'url("https://i.imgur.com/mSotCKt.png")',
        "--ik-theme-button-region-off": 'url("https://i.imgur.com/8hmh66k.png")',
        "--ik-theme-button-region-on": 'url("https://i.imgur.com/JSpZkQi.png")',
        "--ik-theme-button-quest-off": 'url("https://i.imgur.com/kBsMx99.png")',
        "--ik-theme-button-quest-on": 'url("https://i.imgur.com/bBFao58.png")',
        "--ik-theme-button-tourney-off": 'url("https://i.imgur.com/7I9CM8R.png")',
        "--ik-theme-button-tourney-on": 'url("https://i.imgur.com/yoYSmkj.png")',
        "--ik-theme-button-stats-off": 'url("https://i.imgur.com/E2nlgAF.png")',
        "--ik-theme-button-stats-on": 'url("https://i.imgur.com/4SMAfuv.png")',
        "--ik-theme-button-herald-off": 'url("https://i.imgur.com/fDAh0lu.png")',
        "--ik-theme-button-herald-on": 'url("https://i.imgur.com/ZfNx7ZY.png")',

        "--ik-theme-button-city-off": 'url("https://i.imgur.com/NI96uz6.png")',
        "--ik-theme-button-city-on": 'url("https://i.imgur.com/m3IXU7a.png")',
        "--ik-theme-button-castle-off": 'url("https://i.imgur.com/D7S3ncV.png")',
        "--ik-theme-button-castle-on": 'url("https://i.imgur.com/6k3TEsF.png")',
        "--ik-theme-button-res-off": 'url("https://i.imgur.com/zCkxEC8.png")',
        "--ik-theme-button-res-on": 'url("https://i.imgur.com/VxbDdzw.png")',
        "--ik-theme-button-prod-off": 'url("https://i.imgur.com/if9Uvfx.png")',
        "--ik-theme-button-prod-on": 'url("https://i.imgur.com/Z1m0l06.png")',
        "--ik-theme-button-sov-off": 'url("https://i.imgur.com/Ta50rJ3.png")',
        "--ik-theme-button-sov-on": 'url("https://i.imgur.com/drtdYhI.png")',
        "--ik-theme-button-inv-off": 'url("https://i.imgur.com/LlsKBd8.png")',
        "--ik-theme-button-inv-on": 'url("https://i.imgur.com/eQeHEby.png")',

        "--ik-theme-button-diplomacy-off": 'url("https://i.imgur.com/ul2sv1x.png")',
        "--ik-theme-button-diplomacy-on": 'url("https://i.imgur.com/T8scZ4B.png")',
        "--ik-theme-button-diplo-off": 'url("https://i.imgur.com/Sr3xtbJ.png")',
        "--ik-theme-button-diplo-on": 'url("https://i.imgur.com/RpLIYH7.png")',

        "--ik-theme-button-military-off": 'url("https://i.imgur.com/nUHR9Zs.png")',
        "--ik-theme-button-military-on": 'url("https://i.imgur.com/NoFisYj.png")',
        "--ik-theme-button-moves-off": 'url("https://i.imgur.com/XC4e1ka.png")',
        "--ik-theme-button-moves-on": 'url("https://i.imgur.com/HOKhSS6.png")',
        "--ik-theme-button-orders-off": 'url("https://i.imgur.com/logTL0i.png")',
        "--ik-theme-button-orders-on": 'url("https://i.imgur.com/Xpc2fSO.png")',
        "--ik-theme-button-armies-off": 'url("https://i.imgur.com/kE3aSOL.png")',
        "--ik-theme-button-armies-on": 'url("https://i.imgur.com/M7gmlqd.png")',
        "--ik-theme-button-command-off": 'url("https://i.imgur.com/qMammF8.png")',
        "--ik-theme-button-command-on": 'url("https://i.imgur.com/zzVar3k.png")',
        "--ik-theme-button-troops-off": 'url("https://i.imgur.com/g02QXcU.png")',
        "--ik-theme-button-troops-on": 'url("https://i.imgur.com/Woe7jJv.png")',

        "--ik-theme-button-trade-off": 'url("https://i.imgur.com/sowIrLS.png")',
        "--ik-theme-button-trade-on": 'url("https://i.imgur.com/y9rb9e7.png")',
        "--ik-theme-button-markets-off": 'url("https://i.imgur.com/tbQkDnx.png")',
        "--ik-theme-button-markets-on": 'url("https://i.imgur.com/aF84qpi.png")',
        "--ik-theme-button-factions-off": 'url("https://i.imgur.com/smVbw5w.png")',
        "--ik-theme-button-factions-on": 'url("https://i.imgur.com/2zOGkbb.png")',
        "--ik-theme-button-tradeunits-off": 'url("https://i.imgur.com/oCCnrSn.png")',
        "--ik-theme-button-tradeunits-on": 'url("https://i.imgur.com/W2AWeda.png")',

        "--ik-theme-button-research-off": 'url("https://i.imgur.com/rdvsb5U.png")',
        "--ik-theme-button-research-on": 'url("https://i.imgur.com/owlPuMu.png")',
        "--ik-theme-button-available-off": 'url("https://i.imgur.com/epab08T.png")',
        "--ik-theme-button-available-on": 'url("https://i.imgur.com/Hje9TdQ.png")',
        "--ik-theme-button-tree-off": 'url("https://i.imgur.com/mThyqL6.png")',
        "--ik-theme-button-tree-on": 'url("https://i.imgur.com/CCpizKp.png")',
        "--ik-theme-button-discovery-off": 'url("https://i.imgur.com/rWgow5u.png")',
        "--ik-theme-button-discovery-on": 'url("https://i.imgur.com/wEU1snc.png")',
        "--ik-theme-button-reading-off": 'url("https://i.imgur.com/IzzuKX1.png")',
        "--ik-theme-button-reading-on": 'url("https://i.imgur.com/vFwluJb.png")',

        "--ik-theme-button-magic-off": 'url("https://i.imgur.com/XWUSHyi.png")',
        "--ik-theme-button-magic-on": 'url("https://i.imgur.com/Tkcm4xa.png")',
        "--ik-theme-button-active-off": 'url("https://i.imgur.com/anfgwrq.png")',
        "--ik-theme-button-active-on": 'url("https://i.imgur.com/9ZIMLzd.png")',
        "--ik-theme-button-cast-off": 'url("https://i.imgur.com/ai5l18g.png")',
        "--ik-theme-button-cast-on": 'url("https://i.imgur.com/QTms7k7.png")',
        "--ik-theme-button-transmog-off": 'url("https://i.imgur.com/ljoFk8E.png")',
        "--ik-theme-button-transmog-on": 'url("https://i.imgur.com/QGCIuTF.png")',
        
        "--ik-theme-char-ring2-off": 'url("https://i.imgur.com/BymSTQB.png")',
        "--ik-theme-char-ring2-on": 'url("https://i.imgur.com/eqpzQBm.png")',
        "--ik-theme-button-darkbg-off": 'url("https://i.imgur.com/0JECVbh.png")',
        "--ik-theme-button-darkbg-on": 'url("https://i.imgur.com/kwVBQAB.png")',
        "--ik-theme-button-favourites-off": 'url("https://i.imgur.com/1g3vtDX.png")',
        "--ik-theme-button-favourites-on": 'url("https://i.imgur.com/8FxgR7U.png")',
        "--ik-theme-button-leaderboard-off": 'url("https://i.imgur.com/XxebsgF.png")',
        "--ik-theme-button-leaderboard-on": 'url("https://i.imgur.com/RFNqMcH.png")',
        "--ik-theme-button-account-off": 'url("https://i.imgur.com/LMzosvT.png")',
        "--ik-theme-button-account-on": 'url("https://i.imgur.com/3EfWJ4S.png")',
        "--ik-theme-button-support-off": 'url("https://i.imgur.com/f0k69Kz.png")',
        "--ik-theme-button-support-on": 'url("https://i.imgur.com/Rhc1Qby.png")',

        "--ik-theme-button-alliance-off": 'url("https://i.imgur.com/7uzcST8.png")',
        "--ik-theme-button-alliance-on": 'url("https://i.imgur.com/ID9pQhs.png")',
        "--ik-theme-button-recruit-off": 'url("https://i.imgur.com/Y5hmywH.png")',
        "--ik-theme-button-recruit-on": 'url("https://i.imgur.com/jtWx47t.png")',
        "--ik-theme-button-recruit-off": 'url("https://i.imgur.com/jWDFmqp.png")',
        "--ik-theme-button-recruit-on": 'url("https://i.imgur.com/6KymOzB.png")',

        "--ik-theme-button-prestige-off": 'url("https://i.imgur.com/E1VkYZl.png")',
        "--ik-theme-button-prestige-on": 'url("https://i.imgur.com/I4JKA2b.png")',
        "--ik-theme-button-medal-off": 'url("https://i.imgur.com/sh4Du4L.png")',
        "--ik-theme-button-medal-on": 'url("https://i.imgur.com/Dr6X4uR.png")',
        "--ik-theme-button-buy-off": 'url("https://i.imgur.com/mECO02L.png")',
        "--ik-theme-button-buy-on": 'url("https://i.imgur.com/kSsFxRu.png")',
        "--ik-theme-button-history-off": 'url("https://i.imgur.com/kKc9fMn.png")',
        "--ik-theme-button-history-on": 'url("https://i.imgur.com/AeyDNIA.png")',
        
        "--ik-theme-button-mail-off": 'url("https://i.imgur.com/v7JqGC4.png")',
        "--ik-theme-button-mail-on": 'url("https://i.imgur.com/WDrnrTn.png")',
        "--ik-theme-button-notif-off": 'url("https://i.imgur.com/ch3iAHC.png")',
        "--ik-theme-button-notif-on": 'url("https://i.imgur.com/3oupSsE.png")',
        "--ik-theme-button-forum-off": 'url("https://i.imgur.com/sQYWiNd.png")',
        "--ik-theme-button-forum-on": 'url("https://i.imgur.com/aQ0C6Dt.png")',
        "--ik-theme-button-chat-off": 'url("https://i.imgur.com/nmgSnr3.png")',
        "--ik-theme-button-chat-on": 'url("https://i.imgur.com/5rQtAzt.png")'
        
    },
    "Custom": {
        /* You can modify these values or inherit/override specific variables for your custom theme */
        "--ik-theme-bg": "#1e1e1e",
        "--ik-theme-content-bg": "#cb5959",
        "--ik-theme-alt-bg": "#2d2d2d",
        "--ik-theme-light-alt-bg": "#3c3c3c",
        "--ik-theme-input-bg": "#3c3c3c",
        "--ik-theme-border": "#474747",
        "--ik-theme-text": "#d4d4d4",
        "--ik-theme-link": "#4ec9b0",
        "--ik-theme-link-hover": "#9cdcfe"
        // Note: Any unspecified properties will fall back gracefully or can be added here
    }
};

// Expose globally so LuperTweaks can access it
window.IKLuperThemes = THEMES;
