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
        darkMode: false,
        sovHighlight: false
    };

    // =========================================================================
    //  REQUIRED HELPER FUNCTIONS
    // =========================================================================

    function highlightZeroCityValues() {
        if (!document.body.classList.contains("ik-dark-mode")) return;

        // Target spans inside the selected city menu hierarchy
        const spans = document.querySelectorAll("div#citiesMenu div.cityMenu.selected div span, div#citiesMenu div div.cityMenu div span");
        spans.forEach(span => {
            if (span.textContent.trim() === "0") {
                span.style.setProperty("color", "#ff5555", "important");
                span.style.setProperty("font-weight", "bold", "important");
            }
        });
    }
    function SovImbalanceCheck() {
        const accordions = document.querySelectorAll("#sovAccordion h3");

        if (!settings.sovHighlight) {
            accordions.forEach(h3 => {
                const parentA = h3.querySelector("a");
                if (parentA) parentA.style.removeProperty("background-color");
            });
            return;
        }

        const romanMap = { "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5 };

        function parseRoman(text) {
            const match = text.match(/\b(I{1,3}|IV|V|IIII)\b/);
            if (!match) return 0;
            return romanMap[match[0]] || 0;
        }

        accordions.forEach(h3 => {
            const spans = h3.querySelectorAll("a > span, a span");
            if (spans.length >= 2) {
                const firstText = spans[0].textContent;
                const secondText = spans[1].textContent;
                
                const firstVal = parseRoman(firstText);
                const secondVal = parseRoman(secondText);
                
                const hasNoStructure = secondText.includes("No Structure Present");
                const parentA = h3.querySelector("a");

                if (parentA) {
                    // Highlight if "No Structure Present" OR if second level is lower than first
                    if (hasNoStructure || (secondVal > 0 && secondVal < firstVal)) {
                        parentA.style.setProperty("background-color", "var(--ik-theme-warning-highlight)", "important");
                    } else {
                        parentA.style.removeProperty("background-color");
                    }
                }
            }
        });
    }
    

    // =========================================================================
    // CSS INJECTION & GLOBAL STYLING
    // =========================================================================

    function injectTweaksStyles() {
        let style = document.querySelector("#ikLuperTweaksStyles");
        if (!style) {
            style = document.createElement("style");
            style.id = "ikLuperTweaksStyles";
            document.head.appendChild(style);
        }
        style.textContent = `
            :root {

                /* ==================================== Background Colors ==================================== */
                --ik-theme-bg: #131314;
                --ik-theme-content-bg: #151516;
                --ik-theme-alt-bg: #202021;
                --ik-theme-light-alt-bg: #515252;
                --ik-theme-input-bg: #515252;
                --ik-theme-border: #333537;

                /* ======================================= Text Colors ======================================= */
                --ik-theme-text: #e3e3e3;               /* Default text color */
                --ik-theme-special-text1: #e5b420;      /* Self Name color */
                --ik-theme-special-text2: #f00;         /* System Name color */
                --ik-theme-special-text3: #e54e20;      /*  */
                --ik-theme-special-text4: #ea882e;      /*  */ 
                --ik-theme-special-text5: #e54e20;      /*  */
                --ik-theme-special-text6: #ea882e;      /*  */
                --ik-theme-special-text7: #2d2e30;      /*  */
                --ik-theme-special-text8: #1e1f20;      /*  */
                --ik-theme-special-text9: #434343;      /*  */
                --ik-theme-health-bar: #d0110e;         /*  */
                --ik-theme-xp-bar: #f26723;             /*  */
                --ik-theme-link: #ea882e;               /*  */
                --ik-theme-link-hover: #e54e20;         /*  */
                --ik-theme-warning-highlight: #ff000042; /*  */

                /* =================================== Background Texture Images ============================= */
                --ik-theme-texture: url("https://i.imgur.com/rcUBS5t.jpeg");
                --ik-theme-headerP-texture: url("https://i.imgur.com/cozCMCU.jpeg");
                --ik-theme-headerO-texture: url("https://i.imgur.com/yCH8seN.png");
                --ik-theme-header-texture: url("https://i.imgur.com/0nDOLcG.jpeg");
                --ik-theme-headermain-texture: url("https://i.imgur.com/TQ2SkKz.png");
                --ik-theme-popup-top: url("https://i.imgur.com/FlehLqQ.png");
                --ik-theme-popup-mid: url("https://i.imgur.com/Aslo09q.png");
                --ik-theme-popup-bot: url("https://i.imgur.com/MwbBS3B.png");
                --ik-theme-herald-right: url("https://i.imgur.com/QbNEhg6.jpeg");
                --ik-theme-herald-left: url("https://i.imgur.com/DiMUiBi.jpeg");
                --ik-theme-herald-title: url("https://i.imgur.com/GWSmxmu.jpeg");
                --ik-theme-herald-book: url("https://i.imgur.com/5wmEX8r.jpeg");

                /* =================================== Top Button Row Images ============================= */
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

            /* =========================================================================
               Dialog & UI Container Layout
               ========================================================================= */

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

            .iklt-footer {
                margin-top: auto;
                text-align: right;
                font-size: 11px;
                opacity: 0.7;
            }

            /* ==========================================================================================================================================================================================
                                                                                            DARK MODE DEFAULT THEME RULES
            ============================================================================================================================================================================================= */
            
            body.ik-dark-mode p:not([id*="Notes"] *), 
            body.ik-dark-mode td:not([id*="Notes"] *), 
            body.ik-dark-mode th:not([id*="Notes"] *), 
            body.ik-dark-mode label:not([id*="Notes"] *),
            body.ik-dark-mode #resbar, 
            body.ik-dark-mode #resbar td, 
            body.ik-dark-mode #resbar span, 
            body.ik-dark-mode #resbar a,
            body.ik-dark-mode .ui-widget-content a,
            body.ik-dark-mode div#friendActivity.smallBorder div,
            body.ik-dark-mode span:not([id*="Notes"] *):not(.name):not(.ui-dialog-title):not(.ui-accordion-header *):not([class*="ikcat-dialog-tab"]) {
                color: var(--ik-theme-text) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Main Default Page Text ^ */

            body.ik-dark-mode a[href]:not([id*="Notes"] *),
            body.ik-dark-mode .link a[href]:not([id*="Notes"] *) { 
                color: var(--ik-theme-link) !important; 
            }
            body.ik-dark-mode a[href]:not([id*="Notes"] *):hover, 
            body.ik-dark-mode .link a[href]:not([id*="Notes"] *):hover { 
                color: var(--ik-theme-link-hover) !important; 
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Link Text Colors ^ */

            body.ik-dark-mode h1 { color: var(--ik-theme-special-text4) !important; }
            body.ik-dark-mode h2 { color: var(--ik-theme-special-text5) !important; }
            body.ik-dark-mode h3 { color: var(--ik-theme-special-text5) !important; }
            body.ik-dark-mode h4 { color: var(--ik-theme-special-text5) !important; }
            /* ------------------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Heading Text Colors ^ */

            body.ik-dark-mode .headLinks,
            body.ik-dark-mode .headlinks,
            body.ik-dark-mode .headLinks a[href],
            body.ik-dark-mode .headlinks a[href] {
                color: var(--ik-theme-special-text4) !important;
            }
            body.ik-dark-mode .subLinks,
            body.ik-dark-mode .sublinks,
            body.ik-dark-mode .subLinks a[href],
            body.ik-dark-mode .sublinks a[href] {
                color: var(--ik-theme-special-text5) !important;
            } /* -------------------------------------------------------------------------------------------------------------------------------------------------- ^ .headLinks & .subLinks Text Colors ^ */

            body.ik-dark-mode .name, 
            body.ik-dark-mode span.name, 
            body.ik-dark-mode a.name {
                color: var(--ik-theme-special-text6) !important;
            } /* ------------------------------------------------------------------------------- General Names */
            body.ik-dark-mode .name.nameYou, 
            body.ik-dark-mode span.name.nameYou, 
            body.ik-dark-mode a.name.nameYou {
                color: var(--ik-theme-special-text1) !important;
            } /* ----------------------------------------------------------------------------------- Your Name */
            body.ik-dark-mode .name.nameSystem, 
            body.ik-dark-mode span.name.nameSystem, 
            body.ik-dark-mode a.name.nameSystem {
                color: var(--ik-theme-special-text2) !important;
            } /* ------------------------------------------------------------------------------ System's Names */
            /* --------------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Name Text Colors ^ */
            
            html body.ik-dark-mode { 
                background-image: var(--ik-theme-headermain-texture) !important;
                background-repeat: no-repeat !important;
            } /* --------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Main Top Header Image ^ */
            
            body.ik-dark-mode [style*="font-weight:bold;color:#0000B0"] { 
                color: var(--ik-theme-special-text4) !important; 
            } /* --------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Medal Character Title ^ */
            
            body.ik-dark-mode div.skillBar,
            body.ik-dark-mode div [style*="background-color:#860008"],
            body.ik-dark-mode div [style*="background-color:#d3b994"],
            body.ik-dark-mode [data-type="1"],
            body.ik-dark-mode [data-type="2"],
            body.ik-dark-mode [data-type="3"],
            body.ik-dark-mode form.odd {
                background-color: var(--ik-theme-alt-bg) !important;
            } /* ------------------------------------------------------------------ Skill, Health, Level, Equipment, Header Background */
            body.ik-dark-mode div [style*="background-color:#a37342"],
            body.ik-dark-mode div.skillBarFill {
                background-color: var(--ik-theme-xp-bar) !important;
            } /* ------------------------------------------------------------------------------------------- Skill and Level Bar Color */
            body.ik-dark-mode div [style*="background-color:#950b09"] {
                background-color: var(--ik-theme-health-bar) !important;
            } /* ---------------------------------------------------------------------------------------------------- Health Bar Color */
            body.ik-dark-mode div [style*="color: #004B00"] {
                color: var(--ik-theme-special-text3) !important;
            } /* ------------------------------------------------------------------------------------------------------ Max Level Text */
            /* ----------------------------------------------------------------------------------------------------------------------------------------- ^ Commander Header, Skill Bars, and Equipment ^ */
            
            body.ik-dark-mode div.b-page { 
                background-color: var(--ik-theme-alt-bg) !important; 
            } /* ----------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Herald Page Drag Colour ^ */
            
            body.ik-dark-mode div.headline { 
                color: var(--ik-theme-special-text4) !important; 
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Herald Article Titles ^ */
            
            body.ik-dark-mode #book [style*="color:black"] { 
                color: var(--ik-theme-special-text4) !important;
            } /* ---------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Herald Additional Titles ^ */
            
            body.ik-dark-mode div.b-wrap.b-wrap-right { 
                background-image: var(--ik-theme-herald-right) !important; 
            } /* ----------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Herald Right Page Image ^ */
            
            body.ik-dark-mode div.b-wrap.b-wrap-left { 
                background-image: var(--ik-theme-herald-left) !important; 
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Herald Left Page Image ^ */
            
            body.ik-dark-mode div.b-page.b-page-0.b-p1 div.b-wrap.b-wrap-left { 
                background-image: var(--ik-theme-herald-title) !important; 
            } /* ----------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Herald Title Page Image ^ */
            
            body.ik-dark-mode div#hidePage { 
                background-image: var(--ik-theme-herald-book) !important; 
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Herald Background Book Image ^ */
            
            body.ik-dark-mode input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]),
            body.ik-dark-mode textarea:not(#ikNotesTextarea),
            body.ik-dark-mode select { 
                background-color: var(--ik-theme-input-bg) !important;
                color: var(--ik-theme-text) !important;
                border: 1px solid var(--ik-theme-border) !important;
            } /* --------------------------------------------------------------------------------------------------------------------------------------------------- ^ Main Input Fields and Textboxes ^ */
            
            body.ik-dark-mode div div.content table.generic tbody tr td#contentTD div.largeBorder div.scrollContent div#MainContentDiv div.info div div#radio.center.ui-buttonset { 
                background-image: var(--ik-theme-header-texture) !important; 
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Main Relocation Header ^ */
            
            body.ik-dark-mode .ui-state-default { 
                color: var(--ik-theme-special-text4) !important;
                background-image: var(--ik-theme-header-texture) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Main Widget and Popup Header ^ */
            
            body.ik-dark-mode div div.content table.generic tbody tr td#contentTD div.largeBorder div.scrollContent div#MainContentDiv div div.smallBorder > div:first-of-type { 
                background-image: var(--ik-theme-header-texture) !important; 
            } /* ---------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Medal Header Image ^ */
            
            body.ik-dark-mode div div.content table.generic tbody tr td#contentTD div.largeBorder div.scrollContent div#MainContentDiv div div.smallBorder div#medalCost div {
                background-image: var(--ik-theme-header-texture) !important; 
            }  /* ----------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Alliance Medal headers ^ */
            
            body.ik-dark-mode div#AwardMedalHTML div.smallBorder div form div div {
                background-color: var(--ik-theme-alt-bg) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Medal Player List Even ^ */
            
            body.ik-dark-mode div#AwardMedalHTML div.smallBorder div form div div div.odd { 
            background-color: var(--ik-theme-light-alt-bg) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Award Medal Player List Odd ^ */
            
            body.ik-dark-mode .ui-state-default a[href], body.ik-dark-mode .ui-state-default a {
                color: var(--ik-theme-special-text4) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Main Unselected Header Color ^ */
            
            body.ik-dark-mode .ui-state-active, body.ik-dark-mode .ui-state-active a, body.ik-dark-mode .ui-state-active a[href] {
                color: var(--ik-theme-special-text5) !important;
            } /* -------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Main Selected Header Color ^ */
            
            body.ik-dark-mode .ui-widget-content:not([id="ikNotesPanel"]):not([id="ikNotesPanel"] *) {
                background-color: var(--ik-theme-content-bg) !important;
                background-image: var(--ik-theme-texture) !important;
                color: var(--ik-theme-text) !important;
            } /* -------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Main Selected Header Color ^ */
            
            body.ik-dark-mode .ui-accordion-header h3 a span:not([id*="Notes"] *),
            body.ik-dark-mode div.accordionCommand h3.ui-accordion-header a table.generic tbody tr td:not([id*="Notes"] *) {
                color: var(--ik-theme-special-text4) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Accordion Active Tab Headers ^ */
            
            body.ik-dark-mode .ui-accordion-header.ui-state-active a,
            body.ik-dark-mode .ui-accordion-header.ui-state-active a[href],
            body.ik-dark-mode div.accordionCommand h3.ui-accordion-header.ui-state-active a table.generic tbody tr td:not([id*="Notes"] *) {
                color: var(--ik-theme-special-text5) !important;
            } /* --------------------------------------------------------------------------------------------------------------------------------------------------- ^ Accordion Commander Tab Headers ^ */
            
            body.ik-dark-mode .sideTab,
            body.ik-dark-mode span.ikcat-dialog-tab:not([id*="Notes"] *) {
                background-image: var(--ik-theme-headerO-texture) !important;
                background-repeat: repeat !important;
                color: var(--ik-theme-special-text4) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------ ^  LuperNotes/LuperList Tab Headings ^ */
            
            body.ik-dark-mode .sideTab.selected, 
            body.ik-dark-mode span.ikcat-dialog-tab.data-tab:not([id*="Notes"] *),
            body.ik-dark-mode span.ikcat-dialog-tab.selected:not([id*="Notes"] *) { 
                background-image: var(--ik-theme-texture) !important; 
                background-repeat: repeat !important; 
                color: var(--ik-theme-special-text5) !important; 
            } /* ---------------------------------------------------------------------------------------------------------------------------------------- ^ LuperNotes/LuperList Selected Tab Headings ^ */
            
            body.ik-dark-mode tr.odd, 
            body.ik-dark-mode form.odd, 
            body.ik-dark-mode table.oddeven > tbody > tr:nth-child(2n),
            body.ik-dark-mode table.evenodd > tbody > tr:nth-child(2n+1), 
            body.ik-dark-mode .ui-widget-content div.oddeven > div:not([id*="chat"]):nth-child(2n), 
            body.ik-dark-mode table.oddevencols > colgroup > col:nth-child(2n+1), 
            body.ik-dark-mode #Notifications > div:nth-child(2n), 
            body.ik-dark-mode td.rhsPanel div#sideBar.smallScrollContent div#DockedChat.smallBorder div#globalChatTab div.globalChatHldr div.globalChat.oddeven div:nth-child(2n), 
            body.ik-dark-mode td#contentTD div.largeBorder div.scrollContent div#MainContentDiv div.info div.odd, 
            body.ik-dark-mode td#contentTD div.largeBorder div.scrollContent div#MainContentDiv table.generic tbody tr td div.odd, 
            body.ik-dark-mode colgroup.odd, body.ik-dark-mode colgroup col.odd, body.ik-dark-mode table.generic.odd, 
            body.ik-dark-mode td#contentTD div.largeBorder div.scrollContent div#MainContentDiv div.info div table.generic.middle.oddeven tbody tr th,  
            body.ik-dark-mode td#contentTD div.largeBorder div.scrollContent div#MainContentDiv div.info div table.generic.middle.oddeven tbody tr td:nth-of-type(2),
            body.ik-dark-mode tr td#contentTD div.largeBorder div.scrollContent div#MainContentDiv div.info div#recentEvents.center.evenodd div.combat:nth-child(2n+1),
            body.ik-dark-mode td.rhsPanel div#sideBar.smallScrollContent div#DockedChat.smallBorder div#allianceChatTab div.allianceChatHldr div.allianceChat.oddeven div:nth-child(2n) { 
                background-color: var(--ik-theme-alt-bg) !important;
            } /* --------------------------------------------------------------------------- PROBABLY BROKEN!!!!!!! ------------------------------------------------------------------------------ ^ Tables & Alternating Rows ^ */
            
            body.ik-dark-mode .ui-dialog .ui-dialog-buttonpane button,
            body.ik-dark-mode button.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-only {
                background-image: var(--ik-theme-button-short-off) !important;
                background-repeat: no-repeat !important;
                background-size: 100% 100% !important;
            }
            body.ik-dark-mode .ui-dialog .ui-dialog-buttonpane button.ui-state-hover,
            body.ik-dark-mode button.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-only.ui-state-hover {
                background-image: var(--ik-theme-button-short-on) !important;
                background-repeat: no-repeat !important;
                background-size: 100% 100% !important;
            } /* ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- Buttons */
            
            body.ik-dark-mode div.ui-state-hover, 
            body.ik-dark-mode a#ui-active-menuitem, 
            body.ik-dark-mode a.ui-state-hover,
            body.ik-dark-mode .ui-menu .ui-menu-item a.ui-state-hover,
            body.ik-dark-mode .ui-autocomplete li a.ui-state-hover,
            body.ik-dark-mode a.jstree-clicked,
            body.ik-dark-mode a.jstree-hovered { 
                background-color: var(--ik-theme-alt-bg) !important;
                background-image: none !important;
            } /* ----------------------------------------------------------------------------------------------------------------------------------------------- City and trade list hover background */
            
            body.ik-dark-mode .topBar {
                background-color: var(--ik-theme-content-bg) !important;
                color: var(--ik-theme-text) !important;
            }
            body.ik-dark-mode .ui-dialog .ui-dialog-title:not([id*="Notes"] *),
            body.ik-dark-mode span.ui-dialog-title:not([id*="Notes"] *) { 
                background-color: var(--ik-theme-content-bg) !important; 
                color: var(--ik-theme-special-text3) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ Main page background */
            
            body.ik-dark-mode div.flotr-legend { background-color: var(--ik-theme-alt-bg) !important; }
            body.ik-dark-mode legend { color: var(--ik-theme-special-text3) !important; }

            /* --------------------------------------------------------------------------------------------------------------------------------------------------------- Legends and Charts */


            
            /* ================================================================================================================================================================================
            
            body.ik-dark-mode .ui-tabs-nav li:not(.ui-tabs-selected):not(.ui-tabs-active) a,
            body.ik-dark-mode .ui-tabs-nav li:not(.ui-tabs-selected):not(.ui-tabs-active) a[href] {
                color: var(--ik-theme-special-text4) !important;
            }

            body.ik-dark-mode #dTownTD *, body.ik-dark-mode .dTownTD *, body.ik-dark-mode #citiesMenu { background-color: var(--ik-theme-special-text8) !important; }
            
            body.ik-dark-mode .cityMenu.selected { background-color: var(--ik-theme-special-text7) !important; }
            
            ================================================================================================================================================================================= */

            /* ======================================================================================================================================================
                                                                         DARK MODE IMAGE HANDLING
            ========================================================================================================================================================= */

            body.ik-dark-mode .headlinks a.selected,
            body.ik-dark-mode .smallBorder,
            body.ik-dark-mode #DockedFriends,
            body.ik-dark-mode .ui-state-active {
                background-image: var(--ik-theme-texture) !important;
                background-repeat: repeat !important;
            } /* ----------------------------------------------------------------------------------------------------------------------------------------------------- ^ Paper Background ^ */
            body.ik-dark-mode .ui-widget-header { 
                background-image: var(--ik-theme-header-texture) !important;
                background-repeat: repeat !important;
            }
            body.ik-dark-mode #contentTD {
                background-image: var(--ik-theme-header-texture) !important;
                background-color: var(--ik-theme-content-bg) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ Dark Header background */
            body.ik-dark-mode .ui-dialog .ui-dialog-titlebar {
                background-image: var(--ik-theme-headerO-texture) !important;
                background-repeat: repeat !important;
            } 
            body.ik-dark-mode .headlinks,
            body.ik-dark-mode .headLinks {
                background-image: var(--ik-theme-headerO-texture) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ Light header background */
            body.ik-dark-mode div.iconBox.ib1 a img.icon { content: var(--ik-theme-button-world-off) !important; }
            body.ik-dark-mode div.iconBox.ib1 a:hover img.icon { content: var(--ik-theme-button-world-on) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-region-off) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-region-on) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-quest-off) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-quest-on) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon3 { content: var(--ik-theme-button-tourney-off) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon3 { content: var(--ik-theme-button-tourney-on) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon4 { content: var(--ik-theme-button-stats-off) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon4 { content: var(--ik-theme-button-stats-on) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a img.sIcon.sIcon5 { content: var(--ik-theme-button-herald-off) !important; }
            body.ik-dark-mode div.iconBox.ib1.top a:hover img.sIcon.sIcon5 { content: var(--ik-theme-button-herald-on) !important; }
            /* ---------------------------------------------------------------------------------------------------------------------------- ^ Top Row World Buttons ^ */
            body.ik-dark-mode div.iconBox.ib2 a img.icon { content: var(--ik-theme-button-city-off) !important; }
            body.ik-dark-mode div.iconBox.ib2 a:hover img.icon { content: var(--ik-theme-button-city-on) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-castle-off) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-castle-on) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-res-off) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-res-on) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a img.sIcon.sIcon3 { content: var(--ik-theme-button-prod-off) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a:hover img.sIcon.sIcon3 { content: var(--ik-theme-button-prod-on) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a img.sIcon.sIcon4 { content: var(--ik-theme-button-sov-off) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a:hover img.sIcon.sIcon4 { content: var(--ik-theme-button-sov-on) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a img.sIcon.sIcon5 { content: var(--ik-theme-button-inv-off) !important; }
            body.ik-dark-mode div.iconBox.ib2.top a:hover img.sIcon.sIcon5 { content: var(--ik-theme-button-inv-on) !important; }
            /* ----------------------------------------------------------------------------------------------------------------------------- ^ Top Row City Buttons ^ */
            body.ik-dark-mode div.iconBox.ib8 a img.icon[src*="ring2_off.png"] { content: var(--ik-theme-char-ring2-off) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a:hover img.icon[src*="ring2_on.png"] { content: var(--ik-theme-char-ring2-on) !important; }
            /* ------------------------------------------------------------------------------------------------------------------------- ^ Top Row Character Buttons ^ */       
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.t { background-image: var(--ik-theme-popup-top) !important; }
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.m { background-image: var(--ik-theme-popup-mid) !important; }
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.b { background-image: var(--ik-theme-popup-bot) !important; }
            /* -------------------------------------------------------------------------------------------------------------------------------------- ^ Scroll Popup ^ */
            body.ik-dark-mode .ui-widget-header.ui-progressbar-value {
                background-image: var(--ik-theme-headerP-texture) !important;
                background-repeat: repeat !important;
            }
            /* -------------------------------------------------------------------------------------------------------------- ^ City Research and Build Progress Bar ^ */
            
            /* ======================================================================================================================================================
                                                                               DARK MODE DEFAULT OVERRIDES
            ========================================================================================================================================================= */
                       
            body.ik-dark-mode .ui-tabs-selected,
            body.ik-dark-mode .ui-tabs-active,
            body.ik-dark-mode .ui-tabs-selected a,
            body.ik-dark-mode .ui-tabs-active a,
            body.ik-dark-mode .ui-tabs-selected a[href],
            body.ik-dark-mode .ui-tabs-active a[href],
            body.ik-dark-mode .ui-tabs-nav li.ui-tabs-selected a,
            body.ik-dark-mode .ui-tabs-nav li.ui-tabs-selected a[href] {
                color: var(--ik-theme-special-text5) !important;
            } /* ---------------------------------------------------------------------------------- Selected Tabs Override ------------------ */
            body.ik-dark-mode #resbar .resPos, body.ik-dark-mode #resbar span[class*="pos"],
            body.ik-dark-mode #resbar [style*="color: green"],
            body.ik-dark-mode #resbar [style*="color:green"] {
                color: #55ff55 !important; 
            }
            body.ik-dark-mode #resbar .resNeg, body.ik-dark-mode #resbar .resFull,
            body.ik-dark-mode #resbar span[class*="neg"],
            body.ik-dark-mode #resbar [style*="color: red"],
            body.ik-dark-mode #resbar [style*="color:red"] {
                color: #ff5555 !important;
            }
            body.ik-dark-mode #resbar .resMax, body.ik-dark-mode #resbar span[class*="max"] { color: #ffaa00 !important; }
            body.ik-dark-mode div#advRes { background-color: var(--ik-theme-alt-bg) !important; } /* T2 res dropdown background */
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.m div div b span [style*="860008"] { color: #ff5555 !important; }
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.m div div b span [style*="004B00"] { color: #55ff55 !important; }
            body.ik-dark-mode div#WzTtDiV [style*="color: #004B00"],
            body.ik-dark-mode div#WzTtDiV [style*="color:#004B00"],
            body.ik-dark-mode div#WzTtDiV span[style*="004B00"] {
                color: #55ff55 !important;
            } /* ---------------------------------------------------------------------------------------------------------------------------- ^ Resbar Stat Colors ^ */                      
            body.ik-dark-mode div#WzTtDiV [style*="color: #860008"],
            body.ik-dark-mode div#WzTtDiV [style*="color:#860008"],
            body.ik-dark-mode div#WzTtDiV span[style*="860008"] {
                color: #ff5555 !important;
            } /* ------------------------------------------------------------------------------------------------------------------------ ^ Item Popup Stat Colors ^ */
            body.ik-dark-mode .indOwn, body.ik-dark-mode .indOwn a[href],
            body.ik-dark-mode .indHostile, body.ik-dark-mode .indHostile a[href],
            body.ik-dark-mode .indFriendly, body.ik-dark-mode .indFriendly a[href],
            body.ik-dark-mode .indCommunication, body.ik-dark-mode .indCommunication a[href],
            body.ik-dark-mode [class*="ind"], body.ik-dark-mode [class*="ind"] a[href] {
                color: var(--ik-theme-special-text9) !important;
            } /* ------------------------------------------------------------------------------------------------------------------ ^ 7. Diplomatic & System Popups ^ */
            body.ik-dark-mode div.ui-slider-range.ui-widget-header.ui-slider-range-min { 
                background-image: var(--ik-theme-headerP-texture) !important;
                background-repeat: repeat !important;
            } /* --------------------------------------------------------------------------------------------------------------------- ^ Slider Background Override ^ */
            body.ik-dark-mode .selected,
            body.ik-dark-mode a.selected,
            body.ik-dark-mode a:link.selected,
            body.ik-dark-mode a:visited.selected,
            body.ik-dark-mode span.selected {
                color: var(--ik-theme-special-text5) !important;
            } /* ------------------------------------------------------------------------------------------------------------------ ^ Selected State Color Override ^ */
            body.ik-dark-mode span.ikcat-dialog-tab {
                color: var(--ik-theme-special-text4) !important;
            } /* ----------------------------------------------------------------------------------------------------------- ^ Inactive LuperLists / Catalogue Tabs ^ */
            body.ik-dark-mode span.ikcat-dialog-tab.active,
            body.ik-dark-mode span.ikcat-dialog-tab.data-tab,
            body.ik-dark-mode span.ikcat-dialog-tab.active.data-tab {
                color: var(--ik-theme-special-text5) !important;
            } /* -------------------------------------------------------------------------------------------------- ^ Active / Selected LuperLists / Catalogue Tabs ^ */
   
        `;
    }

    function applySettings() {
        if (settings.darkMode) {
            document.body.classList.add("ik-dark-mode");
        } else {
            document.body.classList.remove("ik-dark-mode");
        }
        SovImbalanceCheck();
    }

    function saveSettings() {
        const darkCheckbox = document.querySelector("#ikltDarkCheckbox");
        const sovCheckbox = document.querySelector("#ikltSovCheckbox");

        if (darkCheckbox) settings.darkMode = darkCheckbox.checked;
        if (sovCheckbox) settings.sovHighlight = sovCheckbox.checked;

        saveJSON(STORAGE.SETTINGS, settings);
        applySettings();
    }

    function restoreSettings() {
        const saved = loadJSON(STORAGE.SETTINGS, null);
        if (saved) settings = Object.assign({}, settings, saved);

        const darkCheckbox = document.querySelector("#ikltDarkCheckbox");
        const sovCheckbox = document.querySelector("#ikltSovCheckbox");

        if (darkCheckbox) darkCheckbox.checked = !!settings.darkMode;
        if (sovCheckbox) sovCheckbox.checked = !!settings.sovHighlight;

        applySettings();
    }

    function createTweaksContents() {
        if (document.querySelector("#ikLuperTweaks")) return;
        const content = document.createElement("div");
        content.id = "ikLuperTweaks";
        content.innerHTML = `
            <div class="iklt-flex-wrapper">
                <div class="iklt-section">
                    <div class="iklt-section-title">Theme Preferences</div>
                    <label class="iklt-option-row">
                        <input type="checkbox" id="ikltDarkCheckbox" />
                        <span>Enable Global Dark Mode</span>
                    </label>
                </div>
                <div class="iklt-section">
                    <div class="iklt-section-title">Sovereignty Helper</div>
                    <label class="iklt-option-row">
                        <input type="checkbox" id="ikltSovCheckbox" />
                        <span>Highlight Sov Level Imbalance</span>
                    </label>
                </div>
                <div class="iklt-footer">LuperTweaks v2.0</div>
            </div>
        `;
        document.body.appendChild(content);

        content.querySelector("#ikltDarkCheckbox").addEventListener("change", saveSettings);
        content.querySelector("#ikltSovCheckbox").addEventListener("change", saveSettings);
    }

    function saveTweaksGeometry() {
        if (!$tweaks) return;
        try {
            const widget = $tweaks.dialog("widget");
            if (!widget?.length) return;
            const offset = widget.offset();
            saveJSON(STORAGE.GEOMETRY, {
                left: Math.round(offset.left), top: Math.round(offset.top),
                width: Math.round(widget.outerWidth()), height: Math.round(widget.outerHeight())
            });
        } catch (e) {}
    }

    function clampTweaks() {
        if (!$tweaks) return;
        const widget = $tweaks.dialog("widget");
        if (!widget?.length) return;
        const width = widget.outerWidth(), height = widget.outerHeight();
        const current = widget.offset();
        widget.css({
            left: Math.max(0, Math.min(current.left, window.innerWidth - width)) + "px",
            top: Math.max(0, Math.min(current.top, window.innerHeight - height)) + "px"
        });
    }

    function createTweaksDialog() {
        if (!window.jQuery || !jQuery.fn || typeof jQuery.fn.dialog !== "function") return false;
        createTweaksContents();
        const saved = loadJSON(STORAGE.GEOMETRY, {});
        $tweaks = jQuery("#ikLuperTweaks");
        $tweaks.dialog({
            title: "LuperTweaks", autoOpen: false,
            width: Math.max(340, Number(saved.width) || 380),
            height: Math.max(260, Number(saved.height) || 320),
            minWidth: 300, minHeight: 220, draggable: true, resizable: true, closeOnEscape: false,
            dragStop: saveTweaksGeometry, resizeStop: saveTweaksGeometry,
            open: function () {
                saveJSON(STORAGE.OPEN, true);
                $tweaks.dialog("widget").addClass("flora").css("z-index", 11000);
                restoreSettings();
                setTimeout(clampTweaks, 0);
            },
            close: function () { saveTweaksGeometry(); saveJSON(STORAGE.OPEN, false); }
        });
        return true;
    }

    function openLuperTweaks() {
        if (!$tweaks && !initLuperTweaks()) return;
        if (!$tweaks.dialog("isOpen")) $tweaks.dialog("open");
        else try { $tweaks.dialog("moveToTop"); } catch (e) {}
    }

    function initLuperTweaks() {
        if (tweaksInitialized) return true;
        if (!window.jQuery || !jQuery.fn || typeof jQuery.fn.dialog !== "function") return false;
        injectTweaksStyles();
        restoreSettings();
        if (!createTweaksDialog()) return false;

        // Start dynamic value scanner loop
        setInterval(() => {
            highlightZeroCityValues();
            SovImbalanceCheck();
        }, 1000);

        if (!resizeBound) {
            resizeBound = true;
            window.addEventListener("resize", () => {
                if ($tweaks && $tweaks.dialog("isOpen")) { clampTweaks(); saveTweaksGeometry(); }
            });
        }
        tweaksInitialized = true;
        if (loadJSON(STORAGE.OPEN, false)) setTimeout(openLuperTweaks, 100);
        return true;
    }

    IKTools.registerTool({
        id: "lupertweaks",
        name: "Tweaks",
        description: "UI and page customization settings",
        order: 25,
        init: initLuperTweaks,
        open: openLuperTweaks
    });

})();
