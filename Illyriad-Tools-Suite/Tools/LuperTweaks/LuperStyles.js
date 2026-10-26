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

        /* ==================== Background Images ==================== */
        "--ik-theme-texture": 'url("https://i.imgur.com/rcUBS5t.jpeg")',
        "--ik-theme-headerP-texture": 'url("https://i.imgur.com/cozCMCU.jpeg")',
        "--ik-theme-headerO-texture": 'url("https://i.imgur.com/yCH8seN.png")',
        "--ik-theme-header-texture": 'url("https://i.imgur.com/0nDOLcG.jpeg")',
        "--ik-theme-headermain-texture": 'url("https://i.imgur.com/TQ2SkKz.png")',
        "--ik-theme-popup-top": 'url("https://i.imgur.com/FlehLqQ.png")',
        "--ik-theme-popup-mid": 'url("https://i.imgur.com/Aslo09q.png")',
        "--ik-theme-popup-bot": 'url("https://i.imgur.com/MwbBS3B.png")',
        "--ik-theme-herald-right": 'url("https://i.imgur.com/QbNEhg6.jpeg")',
        "--ik-theme-herald-left": 'url("https://i.imgur.com/DiMUiBi.jpeg")',
        "--ik-theme-herald-title": 'url("https://i.imgur.com/GWSmxmu.jpeg")',
        "--ik-theme-herald-book": 'url("https://i.imgur.com/5wmEX8r.jpeg")',
        "--ik-theme-darkmode-credits": 'url("https://i.imgur.com/L2TjMJF.png")',

        /* ==================== Button Images ==================== */
        "--ik-theme-button-short-off": 'url("https://assets.illyriad.net/img/buttons/short_off_rev.png")',
        "--ik-theme-button-short-on": 'url("https://assets.illyriad.net/img/buttons/short_on_rev.png")',

        /* Top Button Row Images */
        "--ik-theme-button-world-off": 'url("https://i.imgur.com/JFzM27f.png")',
        "--ik-theme-button-world-on": 'url("https://i.imgur.com/DeinIVP.png")',
        "--ik-theme-button-region-off": 'url("https://i.imgur.com/Hm1YmGo.png")',
        "--ik-theme-button-region-on": 'url("https://i.imgur.com/U0s8RLQ.png")',
        "--ik-theme-button-quest-off": 'url("https://i.imgur.com/6Vf66Bl.png")',
        "--ik-theme-button-quest-on": 'url("https://i.imgur.com/QXGDRaE.png")',
        "--ik-theme-button-tourney-off": 'url("https://i.imgur.com/aoYMc2u.png")',
        "--ik-theme-button-tourney-on": 'url("https://i.imgur.com/MUiE2dX.png")',
        "--ik-theme-button-stats-off": 'url("https://i.imgur.com/pBTmIFY.png")',
        "--ik-theme-button-stats-on": 'url("https://i.imgur.com/1XLTZpA.png")',
        "--ik-theme-button-herald-off": 'url("https://i.imgur.com/OIiImD8.png")',
        "--ik-theme-button-herald-on": 'url("https://i.imgur.com/xQnBkvS.png")',

        "--ik-theme-button-city-off": 'url("https://i.imgur.com/m28vfLz.png")',
        "--ik-theme-button-city-on": 'url("https://i.imgur.com/fdNOBi5.png")',
        "--ik-theme-button-castle-off": 'url("https://i.imgur.com/pfGAKIG.png")',
        "--ik-theme-button-castle-on": 'url("https://i.imgur.com/ioWdmfh.png")',
        "--ik-theme-button-res-off": 'url("https://i.imgur.com/Fy2aIFi.png")',
        "--ik-theme-button-res-on": 'url("https://i.imgur.com/CuUPvWZ.png")',
        "--ik-theme-button-prod-off": 'url("https://i.imgur.com/oTH90xz.png")',
        "--ik-theme-button-prod-on": 'url("https://i.imgur.com/A5LQ7Ib.png")',
        "--ik-theme-button-sov-off": 'url("https://i.imgur.com/yuy2g5n.png")',
        "--ik-theme-button-sov-on": 'url("https://i.imgur.com/LQMvpD5.png")',
        "--ik-theme-button-inv-off": 'url("https://i.imgur.com/B8omxkJ.png")',
        "--ik-theme-button-inv-on": 'url("https://i.imgur.com/mOpruAO.png")',

        "--ik-theme-button-diplomacy-off": 'url("https://i.imgur.com/gLJkolH.png")',
        "--ik-theme-button-diplomacy-on": 'url("https://i.imgur.com/NRrGZy8.png")',
        "--ik-theme-button-diplo-off": 'url("https://i.imgur.com/XHnkzln.png")',
        "--ik-theme-button-diplo-on": 'url("https://i.imgur.com/As5hJLV.png")',

        "--ik-theme-button-military-off": 'url("https://i.imgur.com/WogeJW4.png")',
        "--ik-theme-button-military-on": 'url("https://i.imgur.com/42cX1vD.png")',
        "--ik-theme-button-moves-off": 'url("https://i.imgur.com/xs29aaS.png")',
        "--ik-theme-button-moves-on": 'url("https://i.imgur.com/87Oc0NL.png")',
        "--ik-theme-button-orders-off": 'url("https://i.imgur.com/DSzzFCg.png")',
        "--ik-theme-button-orders-on": 'url("https://i.imgur.com/50xv7JI.png")',
        "--ik-theme-button-armies-off": 'url("https://i.imgur.com/UwdTC3v.png")',
        "--ik-theme-button-armies-on": 'url("https://i.imgur.com/UTABW2g.png")',
        "--ik-theme-button-command-off": 'url("https://i.imgur.com/iR9V0wt.png")',
        "--ik-theme-button-command-on": 'url("https://i.imgur.com/Gy78Fy5.png")',
        "--ik-theme-button-troops-off": 'url("https://i.imgur.com/AIjJDt9.png")',
        "--ik-theme-button-troops-on": 'url("https://i.imgur.com/YdKdl9X.png")',

        "--ik-theme-button-trade-off": 'url("https://i.imgur.com/zQjSBB3.png")',
        "--ik-theme-button-trade-on": 'url("https://i.imgur.com/WKMeVQf.png")',
        "--ik-theme-button-markets-off": 'url("https://i.imgur.com/IpgklHw.png")',
        "--ik-theme-button-markets-on": 'url("https://i.imgur.com/zyzC0LY.png")',
        "--ik-theme-button-factions-off": 'url("https://i.imgur.com/NnwAIu3.png")',
        "--ik-theme-button-factions-on": 'url("https://i.imgur.com/ez3tjr7.png")',
        "--ik-theme-button-tradeunits-off": 'url("https://i.imgur.com/bVu08BZ.png")',
        "--ik-theme-button-tradeunits-on": 'url("https://i.imgur.com/NJTjkkl.png")',

        "--ik-theme-button-research-off": 'url("https://i.imgur.com/DRKzyix.png")',
        "--ik-theme-button-research-on": 'url("https://i.imgur.com/MeGsVOh.png")',
        "--ik-theme-button-available-off": 'url("https://i.imgur.com/MYJpkFr.png")',
        "--ik-theme-button-available-on": 'url("https://i.imgur.com/peLkTTe.png")',
        "--ik-theme-button-tree-off": 'url("https://i.imgur.com/2c7vO7J.png")',
        "--ik-theme-button-tree-on": 'url("https://i.imgur.com/hThbH33.png")',
        "--ik-theme-button-discovery-off": 'url("https://i.imgur.com/28XZQzJ.png")',
        "--ik-theme-button-discovery-on": 'url("https://i.imgur.com/du17d4L.png")',
        "--ik-theme-button-reading-off": 'url("https://i.imgur.com/Iwlvpfp.png")',
        "--ik-theme-button-reading-on": 'url("https://i.imgur.com/Sksjc6L.png")',

        "--ik-theme-button-magic-off": 'url("https://i.imgur.com/MBLGBC6.png")',
        "--ik-theme-button-magic-on": 'url("https://i.imgur.com/tpi5hpJ.png")',
        "--ik-theme-button-active-off": 'url("https://i.imgur.com/xo4GpRH.png")',
        "--ik-theme-button-active-on": 'url("https://i.imgur.com/dB9yeye.png")',
        "--ik-theme-button-cast-off": 'url("https://i.imgur.com/Z2E3SsS.png")',
        "--ik-theme-button-cast-on": 'url("https://i.imgur.com/GRbIo9S.png")',
        "--ik-theme-button-transmog-off": 'url("https://i.imgur.com/MhguUCq.png")',
        "--ik-theme-button-transmog-on": 'url("https://i.imgur.com/cGXlYgb.png")',
        
        "--ik-theme-char-ring2-off": 'url("https://i.imgur.com/A0HcanB.png")',
        "--ik-theme-char-ring2-on": 'url("https://i.imgur.com/e6K9WWv.png")',
        "--ik-theme-button-darkbg-off": 'url("https://i.imgur.com/SZ2F31y.png")',
        "--ik-theme-button-darkbg-on": 'url("https://i.imgur.com/QCulzt0.png")',
        "--ik-theme-button-favourites-off": 'url("https://i.imgur.com/MTHSDKT.png")',
        "--ik-theme-button-favourites-on": 'url("https://i.imgur.com/bKrrPTr.png")',
        "--ik-theme-button-leaderboard-off": 'url("https://i.imgur.com/DLEy2UC.png")',
        "--ik-theme-button-leaderboard-on": 'url("https://i.imgur.com/woJ5vdb.png")',
        "--ik-theme-button-account-off": 'url("https://i.imgur.com/ZhQGSps.png")',
        "--ik-theme-button-account-on": 'url("https://i.imgur.com/YIsonO2.png")',
        "--ik-theme-button-support-off": 'url("https://i.imgur.com/fvHdVjU.png")',
        "--ik-theme-button-support-on": 'url("https://i.imgur.com/Lnwiuwi.png")'
    },
    "Custom": {
        /* You can modify these values or inherit/override specific variables for your custom theme */
        "--ik-theme-bg": "#1e1e1e",
        "--ik-theme-content-bg": "#252526",
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
