// ==UserScript==
// @name         Illyriad Tools Suite - LuperTweaks
// @namespace    http://tampermonkey.net/
// @version      1.9
// @match        https://*.illyriad.co.uk/*
// ==/UserScript==

/*
 * Copyright (c) 2026 HoRRis Lupercal
 * Licensed under the HoRRis Lupercal Non-Commercial License
 */

(function () {
    "use strict";

    if (window.__IKTOOLS_LUPERTWEAKS_LOADED__) {
        return;
    }
    window.__IKTOOLS_LUPERTWEAKS_LOADED__ = true;

    // =========================================================================
    // CORE CHECK
    // =========================================================================

    if (!window.IKTools || typeof window.IKTools.registerTool !== "function") {
        console.error("LuperTweaks could not load because IKnights Tools Core is missing.");
        return;
    }

    const IKTools = window.IKTools;
    const { loadJSON, saveJSON } = IKTools.util;

    const STORAGE = {
        SETTINGS: "ikLuperTweaks.settings.v1",
        GEOMETRY: "ikLuperTweaks.geometry.v1",
        OPEN:     "ikLuperTweaks.open.v1"
    };

    let $tweaks = null;
    let tweaksInitialized = false;
    let resizeBound = false;

    let settings = {
        darkMode: false
    };


    // =========================================================================
    // CSS INJECTION & GLOBAL STYLING (THEME VARIABLES SECTION)
    // =========================================================================

    function injectTweaksStyles() {
        let style = document.querySelector("#ikLuperTweaksStyles");
        if (!style) {
            style = document.createElement("style");
            style.id = "ikLuperTweaksStyles";
            document.head.appendChild(style);
        }
        style.textContent = `
            /* =========================================================================
               CUSTOMIZABLE THEME VARIABLES (Modify these to easily create custom themes)
               ========================================================================= */
            :root {
                --ik-theme-text: #e3e3e3;
                --ik-theme-bg: #131314;
                --ik-theme-content-bg: #151516;
                --ik-theme-alt-bg: #202021;
                --ik-theme-input-bg: #515252;
                --ik-theme-border: #333537;
                /* ---- Accordian heading text color ---- */
                --ik-theme-special-text1: #ea882e;
                /* ---- Accordian selected text color ---- */
                --ik-theme-special-text2: #e54e20;
                /* ------- Tab header text color ------ */
                --ik-theme-special-text3: #ea882e;
                /* ------ Header 1 text color ------ */
                --ik-theme-special-text4: #ea882e; 
                /* ------ Header 2 text color ------ */
                --ik-theme-special-text5: #ea882e;
                /* ------ Name class text color ------ */
                --ik-theme-special-text6: #e54e20;
                /* ------ City Drop Down Selected color ------ */
                --ik-theme-special-text7: #2d2e30;
                /* ------ City Drop Down Background color ------ */
                --ik-theme-special-text8: #1e1f20;
                /* ------ Pop up Notif Text Color ------ */
                --ik-theme-special-text9: #434343;
                --ik-theme-link: #8ab4f8;
                --ik-theme-link-hover: #aecbfa;
                /* ------ Paper Background Image Link ------ */
                --ik-theme-texture: url("https://i.imgur.com/rcUBS5t.jpeg");
                /* ------ Progress Bar Image Link ------ */
                --ik-theme-headerP-texture: url("https://i.imgur.com/cozCMCU.jpeg");
                /* ------ Lighter Header Image Link ------ */
                --ik-theme-headerO-texture: url("https://i.imgur.com/yCH8seN.png");
                /* ------ Dark Header Image Link ------ */
                --ik-theme-header-texture: url("https://i.imgur.com/0nDOLcG.jpeg");
                /* ------ Large Header Image Link ------ */
                --ik-theme-headermain-texture: url("https://i.imgur.com/TQ2SkKz.png");
                
                /* ----------------- Custom Button Image Links ------------------ */

                --ik-theme-button-short-off: url("https://assets.illyriad.net/img/buttons/short_off_rev.png");
                --ik-theme-button-short-on: url("https://assets.illyriad.net/img/buttons/short_on_rev.png");

                --ik-theme-button-world-off: url("https://i.imgur.com/n2x7KAg.png");
                --ik-theme-button-world-on: url("https://i.imgur.com/RaBKZyN.png");
                
                --ik-theme-button-region-off: url("https://i.imgur.com/BIyjHR4.png");
                --ik-theme-button-region-on: url("https://i.imgur.com/4HbMmbd.png");
                
                --ik-theme-button-quest-off: url("https://i.imgur.com/PKZpNP1.png");
                --ik-theme-button-quest-on: url("https://i.imgur.com/tjPip3r.png");
                
                --ik-theme-button-tourney-off: url("https://i.imgur.com/yMXHy7o.png");
                --ik-theme-button-tourney-on: url("https://i.imgur.com/1PlkChY.png");
                
                --ik-theme-button-stats-off: url("https://i.imgur.com/JAl4zQO.png");
                --ik-theme-button-stats-on: url("https://i.imgur.com/L5erQO5.png");

                --ik-theme-button-herald-off: url("https://i.imgur.com/49AC6eF.png");
                --ik-theme-button-herald-on: url("https://i.imgur.com/RPscrs2.png");
                
                --ik-theme-button-city-off: url("https://i.imgur.com/m28vfLz.png");
                --ik-theme-button-city-on: url("https://i.imgur.com/fdNOBi5.png");
                
                --ik-theme-button-castle-off: url("https://i.imgur.com/pfGAKIG.png");
                --ik-theme-button-castle-on: url("https://i.imgur.com/ioWdmfh.png");
                
                --ik-theme-button-res-off: url("https://i.imgur.com/Fy2aIFi.png");
                --ik-theme-button-res-on: url("https://i.imgur.com/CuUPvWZ.png");
                
                --ik-theme-button-prod-off: url("https://i.imgur.com/oTH90xz.png");
                --ik-theme-button-prod-on: url("https://i.imgur.com/A5LQ7Ib.png");
                
                --ik-theme-button-sov-off: url("https://i.imgur.com/yuy2g5n.png");
                --ik-theme-button-sov-on: url("https://i.imgur.com/LQMvpD5.png");
                
                --ik-theme-button-inv-off: url("https://i.imgur.com/B8omxkJ.png");
                --ik-theme-button-inv-on: url("https://i.imgur.com/mOpruAO.png");

                --ik-theme-char-ring2-off: url("https://i.imgur.com/scbj2y9.png");
                --ik-theme-char-ring2-on: url("https://i.imgur.com/9Ijy5Vv.png");
            }

            /* Dialog & UI Container Layout */
            #ikLuperTweaks {
                padding: 0 !important;
                overflow: hidden !important;
                background-color: #fffae8;
            }

            .iklt-flex-wrapper {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                padding: 12px;
                font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif;
                color: #4a3311;
            }

            .iklt-section {
                margin-bottom: 16px;
                border: 1px solid rgba(139, 90, 43, 0.3);
                background: rgba(255, 255, 255, 0.4);
                border-radius: 4px;
                padding: 10px;
            }

            .iklt-section-title {
                font-weight: bold;
                font-size: 13px;
                margin-bottom: 8px;
                border-bottom: 1px solid rgba(139, 90, 43, 0.2);
                padding-bottom: 4px;
                color: #5c1d1d;
            }

            .iklt-option-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
                font-size: 12px;
                cursor: pointer;
            }

            .iklt-option-row input[type="checkbox"] {
                cursor: pointer;
            }

            .iklt-footer {
                margin-top: auto;
                text-align: right;
                font-size: 11px;
                opacity: 0.7;
            }

            /* =========================================================================
               DARK MODE CUSTOM STYLES
               ========================================================================= */

            /* ============================= Main Content ============================== */
            /* --------------------------- Main Header Image */
            html body.ik-dark-mode {
                background-image: var(--ik-theme-headermain-texture) !important;
                background-repeat: no-repeat !important;
            } 
            /* ----------------------- Input & Textbox Controls */
            body.ik-dark-mode input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]),
            body.ik-dark-mode textarea,
            body.ik-dark-mode select {
                background-color: var(--ik-theme-input-bg) !important;
                color: var(--ik-theme-text) !important;
                border: 1px solid var(--ik-theme-border) !important;
            } 
            /* ------------------- Accordian Headers Background */
            body.ik-dark-mode .ui-state-default {
                background-image: var(--ik-theme-header-texture) !important;
            }
            /* ----------------------- UI State Default Links */
            body.ik-dark-mode .ui-state-default a {
                color: var(--ik-theme-special-text1) !important;
            }
            /* ----------------------- UI State Active Links */
            body.ik-dark-mode .ui-state-active a {
                color: var(--ik-theme-special-text2) !important;
            }
            /* ------------------ UI Dialog & Standard Short Buttons (Off/Default) */
            body.ik-dark-mode .ui-dialog .ui-dialog-buttonpane button,
            body.ik-dark-mode button.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-only {
                background-image: var(--ik-theme-button-short-off) !important;
                background-repeat: no-repeat !important;
                background-size: 100% 100% !important;
            }
            /* ---------------- UI Dialog & Standard Short Buttons (On/Hover) */
            body.ik-dark-mode .ui-dialog .ui-dialog-buttonpane button.ui-state-hover,
            body.ik-dark-mode button.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-only.ui-state-hover {
                background-image: var(--ik-theme-button-short-on) !important;
                background-repeat: no-repeat !important;
                background-size: 100% 100% !important;
            }
            /* ----------------------- dTownTD Container Styling -------------------- */
            body.ik-dark-mode #dTownTD *,
            body.ik-dark-mode .dTownTD *,
            body.ik-dark-mode #citiesMenu {
                background-color: var(--ik-theme-special-text8) !important;
            }
            body.ik-dark-mode .cityMenu.selected {
                background-color: var(--ik-theme-special-text7) !important;
            }
            /* ------------------------- UI Widget Content ----------------------------- */
            body.ik-dark-mode .ui-widget-content {
                background-color: var(--ik-theme-content-bg) !important;
                background-image: var(--ik-theme-texture) !important;
                color: var(--ik-theme-text) !important;
            } 
            /* ---------------------- UI Widget Header */
            body.ik-dark-mode .ui-widget-header {
                background-image: var(--ik-theme-header-texture) !important;
                background-repeat: repeat !important;
            } 
            /* ------------------ UI Dialog Titlebar */
            body.ik-dark-mode .ui-dialog .ui-dialog-titlebar {
                background-image: var(--ik-theme-headerO-texture) !important;
                background-repeat: repeat !important;
            } 
            /* ------------------ UI Dialog Selected Title */
            body.ik-dark-mode .ui-dialog .ui-dialog-title {
                background-color: var(--ik-theme-content-bg) !important;
            }
            /* ------------------------- UI State Active */
            body.ik-dark-mode .ui-state-active {
                background-image: var(--ik-theme-texture) !important;
                background-repeat: repeat !important;
            } 
            /* ----------------------- UI Progressbar Value Texture ------------------- */
            body.ik-dark-mode .ui-widget-header.ui-progressbar-value {
                background-image: var(--ik-theme-headerP-texture) !important;
                background-repeat: repeat !important;
            }

            /* ----------------------- Default Page Text Color (Excluding LuperNotes display content) ------------------------ */
            body.ik-dark-mode, 
            body.ik-dark-mode p:not(#ikNotesPanel *), 
            body.ik-dark-mode td:not(#ikNotesPanel *), 
            body.ik-dark-mode th:not(#ikNotesPanel *), 
            body.ik-dark-mode span:not(#ikNotesPanel *):not(.name), 
            body.ik-dark-mode label:not(#ikNotesPanel *),
            body.ik-dark-mode #resbar,
            body.ik-dark-mode #resbar td,
            body.ik-dark-mode #resbar span,
            body.ik-dark-mode #resbar a {
                color: var(--ik-theme-text) !important;
            }

            /* ----------------------- Resbar Status Color Overrides ------------------------ */
            body.ik-dark-mode #resbar .resPos,
            body.ik-dark-mode #resbar span[class*="pos"],
            body.ik-dark-mode #resbar [style*="color: green"],
            body.ik-dark-mode #resbar [style*="color:green"],
            body.ik-dark-mode #resbar [style*="color: #008"],
            body.ik-dark-mode #resbar [style*="color:#008"],
            body.ik-dark-mode #resbar [style*="color: #009"],
            body.ik-dark-mode #resbar [style*="color:#009"],
            body.ik-dark-mode #resbar [style*="color: #00a"],
            body.ik-dark-mode #resbar [style*="color:#00a"],
            body.ik-dark-mode #resbar [style*="color: #00b"],
            body.ik-dark-mode #resbar [style*="color:#00b"],
            body.ik-dark-mode #resbar [style*="color: #00c"],
            body.ik-dark-mode #resbar [style*="color:#00c"],
            body.ik-dark-mode #resbar [style*="color: #00d"],
            body.ik-dark-mode #resbar [style*="color:#00d"],
            body.ik-dark-mode #resbar [style*="color: #00e"],
            body.ik-dark-mode #resbar [style*="color:#00e"],
            body.ik-dark-mode #resbar [style*="color: #00f"],
            body.ik-dark-mode #resbar [style*="color:#00f"] {
                color: #55ff55 !important;
            }

            body.ik-dark-mode #resbar .resNeg,
            body.ik-dark-mode #resbar .resFull,
            body.ik-dark-mode #resbar td[class*="resFull"],
            body.ik-dark-mode #resbar span[class*="neg"],
            body.ik-dark-mode #resbar [style*="color: red"],
            body.ik-dark-mode #resbar [style*="color:red"],
            body.ik-dark-mode #resbar [style*="color: #f00"],
            body.ik-dark-mode #resbar [style*="color:#f00"],
            body.ik-dark-mode #resbar [style*="color: rgb(255"],
            body.ik-dark-mode #resbar [style*="color:rgb(255"] {
                color: #ff5555 !important;
            }

            body.ik-dark-mode #resbar .resMax,
            body.ik-dark-mode #resbar span[class*="max"] {
                color: #ffaa00 !important;
            }

            /* ---------------------- Special Text Colors ---------------------- */
            body.ik-dark-mode a:visited:not(#ikNotesPanel *),
            body.ik-dark-mode .sideTab,
            body.ik-dark-mode legend {
                color: var(--ik-theme-special-text3) !important;
            }
            body.ik-dark-mode h1 {
                color: var(--ik-theme-special-text4) !important;
            }
            body.ik-dark-mode h2 {
                color: var(--ik-theme-special-text5) !important;
            }
            body.ik-dark-mode .name,
            body.ik-dark-mode span.name,
            body.ik-dark-mode a.name {
                color: var(--ik-theme-special-text6) !important;
            }

            /* ----------------------- Popup Indicator Text Colors ----------- */
            body.ik-dark-mode .indOwn,
            body.ik-dark-mode .indOwn a,
            body.ik-dark-mode .indOwn a:visited,
            body.ik-dark-mode .indHostile,
            body.ik-dark-mode .indHostile a,
            body.ik-dark-mode .indHostile a:visited,
            body.ik-dark-mode .indFriendly,
            body.ik-dark-mode .indFriendly a,
            body.ik-dark-mode .indFriendly a:visited,
            body.ik-dark-mode [class*="indOwn"],
            body.ik-dark-mode [class*="indOwn"] a,
            body.ik-dark-mode [class*="indOwn"] a:visited,
            body.ik-dark-mode [class*="indHostile"],
            body.ik-dark-mode [class*="indHostile"] a,
            body.ik-dark-mode [class*="indHostile"] a:visited,
            body.ik-dark-mode [class*="indFriendly"],
            body.ik-dark-mode [class*="indFriendly"] a,
            body.ik-dark-mode [class*="indFriendly"] a:visited {
                color: var(--ik-theme-special-text9) !important;
            }

            /* ----------------------- Link Colors (Excluding LuperNotes custom links) -------------------- */
            body.ik-dark-mode a:not(#ikNotesPanel *),
            body.ik-dark-mode a:link:not(#ikNotesPanel *),
            body.ik-dark-mode .link a:not(#ikNotesPanel *),
            body.ik-dark-mode .link a:link:not(#ikNotesPanel *),
            body.ik-dark-mode .link a:visited:not(#ikNotesPanel *) {
                color: var(--ik-theme-link) !important;
            }

            body.ik-dark-mode a:not(#ikNotesPanel *):hover,
            body.ik-dark-mode .link a:not(#ikNotesPanel *):hover {
                color: var(--ik-theme-link-hover) !important;
            }

            /* --------------------- Subheader Title and Background ----------------------- */  
            body.ik-dark-mode #contentTD {
                background-image: var(--ik-theme-header-texture) !important;
                background-color: var(--ik-theme-content-bg) !important;
            } 
            /* ------------------- City screen subheader background --------------------- */
            body.ik-dark-mode .headlinks,
            body.ik-dark-mode .headLinks {
                background-image: var(--ik-theme-headerO-texture) !important;
            } 
            body.ik-dark-mode .headlinks a.selected,
            body.ik-dark-mode .headLinks a.selected {
                background-image: var(--ik-theme-texture) !important;
            }

            /* --------------------------- Top Info Bar -------------------------------- */
            body.ik-dark-mode .topBar {
                background-color: var(--ik-theme-content-bg) !important;
                color: var(--ik-theme-text) !important;
            }

            /* ========================== Top Menu Buttons ============================= */
            /* ----------------------------- World Button ------------------------------- */
            body.ik-dark-mode div.iconBox.ib1 a img.icon {
                content: var(--ik-theme-button-world-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib1 a:hover img.icon {
                content: var(--ik-theme-button-world-on) !important;
            }
            /* ------------------------- World - Region Button -------------------------- */
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon1 {
                content: var(--ik-theme-button-region-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon1 {
                content: var(--ik-theme-button-region-on) !important;
            }
            /* ------------------------ World - Quests Button ------------------------- */
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon2 {
                content: var(--ik-theme-button-quest-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon2 {
                content: var(--ik-theme-button-quest-on) !important;
            }
            /* ------------------------ World - Tournament Button ------------------------- */
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon3 {
                content: var(--ik-theme-button-tourney-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon3 {
                content: var(--ik-theme-button-tourney-on) !important;
            }
            /* ------------------------ World - Stats Button ------------------------- */
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon4 {
                content: var(--ik-theme-button-stats-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon4 {
                content: var(--ik-theme-button-stats-on) !important;
            }
            /* ------------------------ World - Herald Button ------------------------- */
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon5 {
                content: var(--ik-theme-button-herald-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon5 {
                content: var(--ik-theme-button-herald-on) !important;
            }
            /* ----------------------------- City Button ------------------------------- */
            body.ik-dark-mode div.iconBox.ib2 a img.icon {
                content: var(--ik-theme-button-city-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib2 a:hover img.icon {
                content: var(--ik-theme-button-city-on) !important;
            }
            /* ------------------------- City - Castle Button -------------------------- */
            body.ik-dark-mode div.iconBox.ib2.top a img.sIcon.sIcon1 {
                content: var(--ik-theme-button-castle-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib2.top a:hover img.sIcon.sIcon1 {
                content: var(--ik-theme-button-castle-on) !important;
            }
            /* ------------------------ City - Resources Button ------------------------- */
            body.ik-dark-mode div.iconBox.ib2.top a img.sIcon.sIcon2 {
                content: var(--ik-theme-button-res-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib
