// ==UserScript==
// @name         Illyriad Tools Suite - LuperTweaks
// @namespace    http://tampermonkey.net/
// @version      0.2.31
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
        sovHighlight: false,
        activeTheme: "Dark-mode"
    };

    // =========================================================================
    //  REQUIRED HELPER FUNCTIONS
    // =========================================================================

    function preloadCustomImages() {
        const themes = window.IKLuperThemes || {};
        const activeThemeObj = themes[settings.activeTheme] || themes["Dark-mode"] || {};

        Object.values(activeThemeObj).forEach(val => {
            if (typeof val === "string" && val.includes("url(")) {
                const match = val.match(/url\(['"]?(.*?)['"]?\)/);
                if (match && match[1]) {
                    const img = new Image();
                    img.src = match[1];
                }
            }
        });
    }

    function styleCKEditorPanels() {
        const iframes = document.querySelectorAll("iframe.cke_panel_frame, iframe.cke_wysiwyg_frame");
        const isDark = document.body.classList.contains("ik-dark-mode");

        if (!isDark) {
            iframes.forEach(iframe => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    const existingStyle = doc && doc.querySelector("#ikDarkPanelStyle");
                    if (existingStyle) existingStyle.remove();
                } catch (e) {}
            });
            return;
        }

        const themes = window.IKLuperThemes || {};
        const activeThemeObj = themes[settings.activeTheme] || themes["Dark-mode"] || {};

        let rootVarsCSS = ":root {\n";
        for (const [key, value] of Object.entries(activeThemeObj)) {
            rootVarsCSS += `  ${key}: ${value};\n`;
        }
        rootVarsCSS += "}\n";

        iframes.forEach(iframe => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (!doc || !doc.head) {
                    if (!iframe.__ikLoadBound) {
                        iframe.__ikLoadBound = true;
                        iframe.addEventListener("load", () => {
                            iframe.__ikLoadBound = false;
                            styleCKEditorPanels();
                        }, { once: true });
                    }
                    return;
                }

                let style = doc.querySelector("#ikDarkPanelStyle");
                if (!style) {
                    style = doc.createElement("style");
                    style.id = "ikDarkPanelStyle";
                    doc.head.appendChild(style);
                }
                style.textContent = `
                    ${rootVarsCSS}

                    /* 1. Main Text Editing Area (WYSIWYG iframe) */
                    body, html, body.cke_editable {
                        background-color: var(--ik-theme-content-bg) !important;
                        color: var(--ik-theme-text) !important;
                    }
                    body.cke_editable a {
                        color: var(--ik-theme-link) !important;
                    }

                    /* 2. Context Menus & Popups */
                    .cke_menu {
                        background-color: var(--ik-theme-content-bg) !important;
                        border-color: var(--ik-theme-border) !important;
                    }
                    .cke_menuitem a.cke_menubutton {
                        background-color: var(--ik-theme-content-bg) !important;
                        color: var(--ik-theme-text) !important;
                    }
                    .cke_menuitem a.cke_menubutton:hover,
                    .cke_menuitem a.cke_menubutton:focus,
                    .cke_menubutton_hover,
                    .cke_menubutton_focus {
                        background-color: var(--ik-theme-light-alt-bg) !important;
                        background-image: none !important;
                        border-color: var(--ik-theme-border) !important;
                        color: var(--ik-theme-text) !important;
                    }
                    .cke_menuitem a.cke_menubutton *,
                    .cke_menubutton_hover * {
                        color: var(--ik-theme-text) !important;
                        text-shadow: none !important;
                    }
                    .cke_menubutton:hover .cke_menubutton_icon,
                    .cke_menubutton_icon {
                        filter: invert(0.85) hue-rotate(180deg) !important;
                    }

                    /* 3. Toolbar & Button Fixes */
                    .cke_button_icon {
                        filter: invert(0.85) hue-rotate(180deg) !important;
                    }
                    .cke_combo_button,
                    .cke_dialog_ui_button {
                        background-image: -webkit-linear-gradient(top, var(--ik-theme-alt-bg), var(--ik-theme-alt-bg)) !important;
                        border-color: var(--ik-theme-border) !important;
                        outline: none !important;
                        text-shadow: none !important;
                    }

                    /* 4. CKEditor Dropdown Lists (Paragraph Format, Styles, etc.) */
                    .cke_panel_block,
                    .cke_panel_list {
                        background-color: var(--ik-theme-content-bg) !important;
                        border-color: var(--ik-theme-border) !important;
                    }
                    .cke_panel_grouptitle {
                        background-color: var(--ik-theme-alt-bg) !important;
                        background-image: -webkit-linear-gradient(top, var(--ik-theme-alt-bg), var(--ik-theme-alt-bg)) !important;
                        color: var(--ik-theme-text) !important;
                        border-bottom: 1px solid var(--ik-theme-border) !important;
                        text-shadow: none !important;
                    }
                    .cke_panel_listItem a {
                        color: var(--ik-theme-text) !important;
                        background-color: transparent !important;
                        border-color: var(--ik-theme-border) !important;
                    }
                    .cke_panel_listItem a[href*="Marker"] {
                        color: #000 !important;
                    }
                    .cke_panel_listItem a:hover,
                    .cke_panel_listItem:hover a,
                    .cke_panel_listItem a:focus {
                        background-color: var(--ik-theme-light-alt-bg) !important;
                        color: var(--ik-theme-text) !important;
                    }
                    li.cke_panel_listItem.cke_selected,
                    li.cke_panel_listItem.cke_selected a {
                        background-color: var(--ik-theme-light-alt-bg) !important;
                        color: var(--ik-theme-text) !important;
                    }
                `;
            } catch (e) {}
        });
    }

    // =========================================================================
    //  ADDITIONAL HELPER FUNCTIONS
    // =========================================================================

    function highlightZeroCityValues() {
        if (!document.body.classList.contains("ik-dark-mode")) return;
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
        } else {
            document.head.appendChild(style);
        }
        style.textContent = `
            #ikLuperTweaks {
                padding: 0 !important;
                overflow: auto !important;
                background-color: #fffae8;
            }

            .iklt-flex-wrapper {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                width: 100%;
                min-height: 100%; /* Changed from height: 100% to min-height: 100% */
                padding: 12px;
                font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif;
                color: #4a3311;
            }

            #ikltAccordion {
                margin-bottom: 12px;
            }

            #ikltAccordion h3 {
                cursor: pointer;
                padding: 6px 10px;
                font-size: 13px;
                margin-bottom: 2px;
                display: block !important;
            }

            #ikltAccordion h3 a {
                display: block !important;
                text-decoration: none;
            }

            #iklt220 {
               height: 220px !important;
            }

            #ikltAccordion > div:first-of-type {
                height: 75px !important;
                overflow-y: hidden !important;
            }

            /* Open state when Advanced Customization Options is expanded */
            #ikltAccordion.iklt-advanced-open > div:first-of-type {
                height: 385px !important;
                overflow-y: auto !important;
            }

            .iklt-option-row {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                cursor: pointer;
            }

            .iklt-footer {
                margin-top: auto;
                text-align: right;
                font-size: 11px;
                opacity: 0.7;
            }

            .ui-widget-content .ui-state-active {
                background: url("https://assets.illyriad.net/img/backgrounds/paper2.jpg");
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

            /* =========================================================================
               Dialog & UI Container Layout
               ========================================================================= */

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
                color: var(--ik-theme-special-text4) !important;
            }
            body.ik-dark-mode .subLinks a.selected {
                color: var(--ik-theme-special-text5) !important;
            }/* -------------------------------------------------------------------------------------------------------------------------------------------------- ^ .headLinks & .subLinks Text Colors ^ */

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
                border-color: var(--ik-theme-border-color) !important;
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
            body.ik-dark-mode fieldset { border-color: var(--ik-theme-alt-border-color) !important; }
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
                border-color: var(--ik-theme-border-color) !important;
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

            body.ik-dark-mode .ui-state-default a[href],
            body.ik-dark-mode .ui-state-default a,
            body.ik-dark-mode .ui-tabs-nav li:not(.ui-tabs-selected):not(.ui-tabs-active) a,
            body.ik-dark-mode .ui-tabs-nav li:not(.ui-tabs-selected):not(.ui-tabs-active) a[href] {
                color: var(--ik-theme-special-text4) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Main Unselected Header Color ^ */

            body.ik-dark-mode .ui-state-active, body.ik-dark-mode .ui-state-active a, body.ik-dark-mode .ui-state-active a[href] {
                color: var(--ik-theme-special-text5) !important;
            } /* -------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Main Selected Header Color ^ */

            body.ik-dark-mode .ui-widget-content:not([id="ikNotesPanel"]):not([id="ikNotesPanel"] *) {
                background-color: var(--ik-theme-content-bg) !important;
                background-image: var(--ik-theme-texture) !important;
                color: var(--ik-theme-text) !important;
                border-color: var(--ik-theme-border-color) !important;
            } /* -------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Main Selected Header Color ^ */

            body.ik-dark-mode .ui-accordion-header h3 a span:not([id*="Notes"] *),
            body.ik-dark-mode div.accordionCommand h3.ui-accordion-header a table.generic tbody tr td:not([id*="Notes"] *) {
                color: var(--ik-theme-special-text4) !important;
                border-color: var(--ik-theme-border-color) !important;
            } /* ------------------------------------------------------------------------------------------------------------------------------------------------------ ^ Accordion Active Tab Headers ^ */

            body.ik-dark-mode .ui-accordion-header.ui-state-active a,
            body.ik-dark-mode .ui-accordion-header.ui-state-active a[href],
            body.ik-dark-mode div.accordionCommand h3.ui-accordion-header.ui-state-active a table.generic tbody tr td:not([id*="Notes"] *) {
                color: var(--ik-theme-special-text5) !important;
                border-color: var(--ik-theme-border-color) !important;
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
            body.ik-dark-mode li.odd,
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
            } /* --------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Tables & Alternating Rows ^ */

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
            } /* --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Buttons ^ */

            body.ik-dark-mode div.ui-state-hover,
            body.ik-dark-mode a#ui-active-menuitem,
            body.ik-dark-mode a.ui-state-hover,
            body.ik-dark-mode .ui-menu .ui-menu-item a.ui-state-hover,
            body.ik-dark-mode .ui-autocomplete li a.ui-state-hover,
            body.ik-dark-mode a.jstree-clicked,
            body.ik-dark-mode a.jstree-hovered {
                background-color: var(--ik-theme-alt-bg) !important;
                background-image: none !important;
            } /* ----------------------------------------------------------------------------------------------------------------------------------------------- ^ City and trade list hover background ^ */

            body.ik-dark-mode .topBar {
                background-color: var(--ik-theme-content-bg) !important;
                color: var(--ik-theme-text) !important;
                border-color: var(--ik-theme-alt-border-color) !important;
            }
            body.ik-dark-mode .ui-dialog .ui-dialog-title:not([id*="Notes"] *),
            body.ik-dark-mode span.ui-dialog-title:not([id*="Notes"] *) {
                background-color: var(--ik-theme-content-bg) !important;
                color: var(--ik-theme-special-text3) !important;
            } /* ---------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Main page background ^ */

            body.ik-dark-mode div.flotr-legend { background-color: var(--ik-theme-alt-bg) !important; }
            body.ik-dark-mode legend { color: var(--ik-theme-special-text3) !important; }

            /* -------------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ Legends and Charts ^ */

            body.ik-dark-mode #dTownTD *, body.ik-dark-mode .dTownTD *, body.ik-dark-mode #citiesMenu { background-color: var(--ik-theme-special-text8) !important; }
            body.ik-dark-mode .cityMenu.selected { background-color: var(--ik-theme-special-text7) !important; }

            /* ------------------------------------------------------------------------------------------------------------------------------------------------------------- ^ City Menu Background Color ^ */

            body.ik-dark-mode div.ui-accordion-content.ui-helper-reset.ui-widget-content.ui-corner-bottom.ui-accordion-content-active hr,
            body.ik-dark-mode div#MainContentDiv div.info hr {
                border-color: var(--ik-theme-border-color) !important;
            }

            /* =========================================================================
               CKEditor / Mail Container & Fullscreen Dark Mode Styling
               ========================================================================= */

            body.ik-dark-mode #cke_MsgBodyEditor,
            body.ik-dark-mode .cke_chrome,
            body.ik-dark-mode .cke_inner,
            body.ik-dark-mode .cke_maximized,
            body.ik-dark-mode .cke_maximized .cke_inner {
                background-color: var(--ik-theme-alt-bg) !important;
                border-color: var(--ik-theme-border) !important;
            }

            body.ik-dark-mode .cke_maximized .cke_contents {
                background-color: var(--ik-theme-content-bg) !important;
            }

            body.ik-dark-mode .cke_combo_text,
            body.ik-dark-mode .cke_button_label,
            body.ik-dark-mode .cke_reset_all * {
                color: var(--ik-theme-text) !important;
                text-shadow: none !important;
            }
            body.ik-dark-mode .cke_reset_all {
                background-color: var(--ik-theme-alt-bg) !important;
                border-color: var(--ik-theme-border) !important;
                color: var(--ik-theme-text) !important;
            }

            body.ik-dark-mode span.cke_top,
            body.ik-dark-mode .cke_toolbox {
                background-color: var(--ik-theme-content-bg) !important;
                background-image: var(--ik-theme-header-texture) !important;
                border-bottom: 1px solid var(--ik-theme-border) !important;
                box-shadow: none !important;
            }

            body.ik-dark-mode span.cke_bottom {
                background-color: var(--ik-theme-content-bg) !important;
                background-image: var(--ik-theme-header-texture) !important;
                border-top: 1px solid var(--ik-theme-border) !important;
                box-shadow: none !important;
            }

            body.ik-dark-mode .cke_toolgroup {
                background: var(--ik-theme-alt-bg) !important;
                border-color: var(--ik-theme-border) !important;
            }

            body.ik-dark-mode a.cke_button {
                background: transparent !important;
                text-shadow: none !important;
            }
            body.ik-dark-mode a.cke_dialog_ui_button span {
                text-shadow: none !important;
            }

            body.ik-dark-mode a.cke_button:hover,
            body.ik-dark-mode a.cke_button_on {
                background-color: var(--ik-theme-light-alt-bg) !important;
                border-color: var(--ik-theme-border) !important;
            }

            body.ik-dark-mode .cke_button_icon {
                filter: invert(0.85) hue-rotate(180deg) !important;
            }

            body.ik-dark-mode .cke_combo_button,
            body.ik-dark-mode .cke_dialog_ui_button {
                background-image: -webkit-linear-gradient(top, var(--ik-theme-alt-bg), var(--ik-theme-alt-bg)) !important;
                border-color: var(--ik-theme-border) !important;
                outline: none !important;
                text-shadow: none !important;
            }

            body.ik-dark-mode .cke_dialog .ImagePreviewBox {
                background-color: var(--ik-theme-input-bg) !important;
                border-color: var(--ik-theme-border) !important;
                color: var(--ik-theme-text) !important;
            }

            body.ik-dark-mode .cke_dialog .cke_dark_background {
                background-color: var(--ik-theme-alt-bg) !important;
                border-color: var(--ik-theme-border) !important;
                color: var(--ik-theme-text) !important;
            }
            body.ik-dark-mode a.cke_specialchar:focus {
                background-color: var(--ik-theme-alt-bg) !important;
                border-color: transparent !important;
                color: var(--ik-theme-text) !important;
            }
            body.ik-dark-mode a.cke_specialchar:hover {
                background-color: var(--ik-theme-light-alt-bg) !important;
                border-color: var(--ik-theme-border) !important;
                color: var(--ik-theme-text) !important;
            }

            body.ik-dark-mode td.cke_dialog_footer,
            body.ik-dark-mode div.cke_dialog_title {
                box-shadow: none !important;
                text-shadow: none !important;
                background-color: var(--ik-theme-content-bg) !important;
                background-image: var(--ik-theme-header-texture) !important;
                border-color: var(--ik-theme-border) !important;
            }
            body.ik-dark-mode div.cke_inner,
            body.ik-dark-mode td.cke_dialog_contents_body,
            body.ik-dark-mode .cke_dialog_contents,
            body.ik-dark-mode .cke_menu {
                background-color: var(--ik-theme-content-bg) !important;
                border-color: var(--ik-theme-border) !important;
                color: var(--ik-theme-text) !important;
            }
            body.ik-dark-mode .cke_dialog iframe.cke_pasteframe,
            body.ik-dark-mode .cke_pasteframe,
            body.ik-dark-mode .cke_panel {
                background-color: var(--ik-theme-alt-bg) !important;
                border-color: var(--ik-theme-border) !important;
            }
            body.ik-dark-mode .cke_dialog_body {
                background-color: var(--ik-theme-alt-bg) !important;
            }
            body.ik-dark-mode .cke_dialog_tab {
                background-image: -webkit-linear-gradient(top, var(--ik-theme-alt-bg), var(--ik-theme-alt-bg)) !important;
            }
            body.ik-dark-mode .cke_dialog_tab_selected {
                background-image: -webkit-linear-gradient(top, var(--ik-theme-content-bg), var(--ik-theme-content-bg)) !important;
            }
            body.ik-dark-mode .cke_dialog_background_cover {
                background-color: var(--ik-theme-bg) !important;
            }

            /* =========================================================================
               DARK MODE IMAGE HANDLING
               ========================================================================= */

            body.ik-dark-mode .largeBorder { border-image: var(--ik-theme-border-image) 33 35 stretch repeat !important; }
            body.ik-dark-mode .smallBorder, body.ik-dark-mode .ui-dialog { border-image: var(--ik-theme-small-border-image) 10 6 10 6 stretch !important; }

            html.ik-dark-mode {
                background-image: var(--ik-theme-darkmode-credits) !important;
            }
            body.ik-dark-mode .smallBorder,
            body.ik-dark-mode #DockedFriends,
            body.ik-dark-mode .ui-state-active {
                background-image: var(--ik-theme-texture) !important;
                background-repeat: repeat !important;
            }
            body.ik-dark-mode div.headlinks a.selected,
            body.ik-dark-mode div.headLinks a.selected,
            body.ik-dark-mode .headlinks a.selected,
            body.ik-dark-mode .headLinks a.selected {
                background: var(--ik-theme-texture) repeat !important;
                background-image: var(--ik-theme-texture) !important;
                background-repeat: repeat !important;
                background-size: auto !important;
            }
            body.ik-dark-mode .ui-widget-header {
                background-image: var(--ik-theme-header-texture) !important;
                background-repeat: repeat !important;
            }
            body.ik-dark-mode #contentTD {
                background-image: var(--ik-theme-header-texture) !important;
                background-color: var(--ik-theme-content-bg) !important;
            }
            body.ik-dark-mode .ui-dialog .ui-dialog-titlebar {
                background-image: var(--ik-theme-headerO-texture) !important;
                background-repeat: repeat !important;
            }
            body.ik-dark-mode .headlinks,
            body.ik-dark-mode .headLinks {
                background-image: var(--ik-theme-headerO-texture) !important;
            }

            /* Icon Replacements */
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

            body.ik-dark-mode div.iconBox.ib3 a img.icon { content: var(--ik-theme-button-military-off) !important; }
            body.ik-dark-mode div.iconBox.ib3 a:hover img.icon { content: var(--ik-theme-button-military-on) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-moves-off) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-moves-on) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-orders-off) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-orders-on) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a img.sIcon.sIcon3 { content: var(--ik-theme-button-armies-off) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a:hover img.sIcon.sIcon3 { content: var(--ik-theme-button-armies-on) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a img.sIcon.sIcon4 { content: var(--ik-theme-button-command-off) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a:hover img.sIcon.sIcon4 { content: var(--ik-theme-button-command-on) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a img.sIcon.sIcon5 { content: var(--ik-theme-button-troops-off) !important; }
            body.ik-dark-mode div.iconBox.ib3.top a:hover img.sIcon.sIcon5 { content: var(--ik-theme-button-troops-on) !important; }

            body.ik-dark-mode div.iconBox.ib4 a img.icon { content: var(--ik-theme-button-diplomacy-off) !important; }
            body.ik-dark-mode div.iconBox.ib4 a:hover img.icon { content: var(--ik-theme-button-diplomacy-on) !important; }
            body.ik-dark-mode div.iconBox.ib4.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-moves-off) !important; }
            body.ik-dark-mode div.iconBox.ib4.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-moves-on) !important; }
            body.ik-dark-mode div.iconBox.ib4.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-orders-off) !important; }
            body.ik-dark-mode div.iconBox.ib4.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-orders-on) !important; }
            body.ik-dark-mode div.iconBox.ib4.top a img.sIcon.sIcon5 { content: var(--ik-theme-button-diplo-off) !important; }
            body.ik-dark-mode div.iconBox.ib4.top a:hover img.sIcon.sIcon5 { content: var(--ik-theme-button-diplo-on) !important; }

            body.ik-dark-mode div.iconBox.ib5 a img.icon { content: var(--ik-theme-button-trade-off) !important; }
            body.ik-dark-mode div.iconBox.ib5 a:hover img.icon { content: var(--ik-theme-button-trade-on) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-moves-off) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-moves-on) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-orders-off) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-orders-on) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a img.sIcon.sIcon3 { content: var(--ik-theme-button-markets-off) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a:hover img.sIcon.sIcon3 { content: var(--ik-theme-button-markets-on) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a img.sIcon.sIcon4 { content: var(--ik-theme-button-factions-off) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a:hover img.sIcon.sIcon4 { content: var(--ik-theme-button-factions-on) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a img.sIcon.sIcon5 { content: var(--ik-theme-button-tradeunits-off) !important; }
            body.ik-dark-mode div.iconBox.ib5.top a:hover img.sIcon.sIcon5 { content: var(--ik-theme-button-tradeunits-on) !important; }

            body.ik-dark-mode div.iconBox.ib6 a img.icon { content: var(--ik-theme-button-research-off) !important; }
            body.ik-dark-mode div.iconBox.ib6 a:hover img.icon { content: var(--ik-theme-button-research-on) !important; }
            body.ik-dark-mode div.iconBox.ib6.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-available-off) !important; }
            body.ik-dark-mode div.iconBox.ib6.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-available-on) !important; }
            body.ik-dark-mode div.iconBox.ib6.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-tree-off) !important; }
            body.ik-dark-mode div.iconBox.ib6.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-tree-on) !important; }
            body.ik-dark-mode div.iconBox.ib6.top a img.sIcon.sIcon4 { content: var(--ik-theme-button-discovery-off) !important; }
            body.ik-dark-mode div.iconBox.ib6.top a:hover img.sIcon.sIcon4 { content: var(--ik-theme-button-discovery-on) !important; }
            body.ik-dark-mode div.iconBox.ib6.top a img.sIcon.sIcon5 { content: var(--ik-theme-button-reading-off) !important; }
            body.ik-dark-mode div.iconBox.ib6.top a:hover img.sIcon.sIcon5 { content: var(--ik-theme-button-reading-on) !important; }

            body.ik-dark-mode div.iconBox.ib7 a img.icon { content: var(--ik-theme-button-magic-off) !important; }
            body.ik-dark-mode div.iconBox.ib7 a:hover img.icon { content: var(--ik-theme-button-magic-on) !important; }
            body.ik-dark-mode div.iconBox.ib7.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-active-off) !important; }
            body.ik-dark-mode div.iconBox.ib7.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-active-on) !important; }
            body.ik-dark-mode div.iconBox.ib7.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-cast-off) !important; }
            body.ik-dark-mode div.iconBox.ib7.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-cast-on) !important; }
            body.ik-dark-mode div.iconBox.ib7.top a img.sIcon.sIcon5 { content: var(--ik-theme-button-transmog-off) !important; }
            body.ik-dark-mode div.iconBox.ib7.top a:hover img.sIcon.sIcon5 { content: var(--ik-theme-button-transmog-on) !important; }

            body.ik-dark-mode div.iconBox.ib8 a img.icon[src*="ring2_off.png"] { content: var(--ik-theme-char-ring2-off) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a:hover img.icon[src*="ring2_on.png"] { content: var(--ik-theme-char-ring2-on) !important; }
            body.ik-dark-mode div.iconBox.ib8 a img.icon[src*="bg_off.png"] { content: var(--ik-theme-button-darkbg-off) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a:hover img.icon[src*="bg_on.png"] { content: var(--ik-theme-button-darkbg-on) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-favourites-off) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-favourites-on) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-leaderboard-off) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-leaderboard-on) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a img.sIcon.sIcon3 { content: var(--ik-theme-button-account-off) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a:hover img.sIcon.sIcon3 { content: var(--ik-theme-account-diplo-on) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a img.sIcon.sIcon4 { content: var(--ik-theme-button-support-off) !important; }
            body.ik-dark-mode div.iconBox.ib8.top a:hover img.sIcon.sIcon4 { content: var(--ik-theme-button-support-on) !important; }

            body.ik-dark-mode div.iconBox.ib9 a img.icon { content: var(--ik-theme-button-alliance-off) !important; }
            body.ik-dark-mode div.iconBox.ib9 a:hover img.icon { content: var(--ik-theme-button-alliance-on) !important; }
            body.ik-dark-mode div.iconBox.ib9.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-favourites-off) !important; }
            body.ik-dark-mode div.iconBox.ib9.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-favourites-on) !important; }
            body.ik-dark-mode div.iconBox.ib9.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-recruit-off) !important; }
            body.ik-dark-mode div.iconBox.ib9.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-recruit-on) !important; }
            body.ik-dark-mode div.iconBox.ib9.top a img.sIcon.sIcon3 { content: var(--ik-theme-button-standings-off) !important; }
            body.ik-dark-mode div.iconBox.ib9.top a:hover img.sIcon.sIcon3 { content: var(--ik-theme-button-standings-on) !important; }

            body.ik-dark-mode div.iconBox.ib10 a img.icon { content: var(--ik-theme-button-prestige-off) !important; }
            body.ik-dark-mode div.iconBox.ib10 a:hover img.icon { content: var(--ik-theme-button-prestige-on) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a img.sIcon.sIcon1 { content: var(--ik-theme-button-medal-off) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a:hover img.sIcon.sIcon1 { content: var(--ik-theme-button-medal-on) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-buy-off) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-buy-on) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a img.sIcon.sIcon3 { content: var(--ik-theme-button-alliance-off) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a:hover img.sIcon.sIcon3 { content: var(--ik-theme-button-alliance-on) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a img.sIcon.sIcon4 { content: var(--ik-theme-button-support-off) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a:hover img.sIcon.sIcon4 { content: var(--ik-theme-button-support-on) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a img.sIcon.sIcon5 { content: var(--ik-theme-button-history-off) !important; }
            body.ik-dark-mode div.iconBox.ib10.top a:hover img.sIcon.sIcon5 { content: var(--ik-theme-button-history-on) !important; }

            body.ik-dark-mode div.iconBox.ib11 a img.icon { content: var(--ik-theme-button-mail-off) !important; }
            body.ik-dark-mode div.iconBox.ib11 a:hover img.icon { content: var(--ik-theme-button-mail-on) !important; }
            body.ik-dark-mode div.iconBox.ib11.top a img.sIcon.sIcon2 { content: var(--ik-theme-button-notif-off) !important; }
            body.ik-dark-mode div.iconBox.ib11.top a:hover img.sIcon.sIcon2 { content: var(--ik-theme-button-notif-on) !important; }
            body.ik-dark-mode div.iconBox.ib11.top a img.sIcon.sIcon3 { content: var(--ik-theme-button-forum-off) !important; }
            body.ik-dark-mode div.iconBox.ib11.top a:hover img.sIcon.sIcon3 { content: var(--ik-theme-button-forum-on) !important; }
            body.ik-dark-mode div.iconBox.ib11.top a img.sIcon.sIcon4 { content: var(--ik-theme-button-chat-off) !important; }
            body.ik-dark-mode div.iconBox.ib11.top a:hover img.sIcon.sIcon4 { content: var(--ik-theme-button-chat-on) !important; }

            body.ik-dark-mode h1 img.h1Icon[src*="world_64x64_off.png"] { content: var(--ik-theme-button-world-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="regionalbonus_32x32_off.png"] { content: var(--ik-theme-button-region-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="quests_32x32_off.png"] { content: var(--ik-theme-button-quest-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="tournaments_32x32_off.png"] { content: var(--ik-theme-button-tourney-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="notes_32x32_off.png"] { content: var(--ik-theme-button-stats-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="city_64x64_off.png"] { content: var(--ik-theme-button-city-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="castle_32x32_off.png"] { content: var(--ik-theme-button-castle-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="town_summary_32x32_off.png"] { content: var(--ik-theme-button-res-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="production_summary_32x32_off.png"] { content: var(--ik-theme-button-prod-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="sovereignty_32x32_off.png"] { content: var(--ik-theme-button-sov-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="inventory_32x32_off.png"] { content: var(--ik-theme-button-inv-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="movements_32x32_off.png"] { content: var(--ik-theme-button-moves-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="orders_32x32_off.png"] { content: var(--ik-theme-button-orders-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="armies_32x32_off.png"] { content: var(--ik-theme-button-armies-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="commanders_32x32_off.png"] { content: var(--ik-theme-button-command-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="military_64x64_off.png"] { content: var(--ik-theme-button-military-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="diplomacy_64x64_off.png"] { content: var(--ik-theme-button-diplomacy-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="prices_32x32_off.png"] { content: var(--ik-theme-button-markets-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="factionmarket_32x32_off.png"] { content: var(--ik-theme-button-factions-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="trade_64x64_off.png"] { content: var(--ik-theme-button-trade-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="available_32x32_off.png"] { content: var(--ik-theme-button-available-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="complete_research_tree_32x32_off.png"] { content: var(--ik-theme-button-tree-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="discovery_32x32_off.png"] { content: var(--ik-theme-button-discovery-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="reading_32x32_off.png"] { content: var(--ik-theme-button-reading-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="research_64x64_off.png"] { content: var(--ik-theme-button-research-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="spells_in_progress_32x32_off.png"] { content: var(--ik-theme-button-active-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="cast_spell_32x32_off.png"] { content: var(--ik-theme-button-cast-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="transmogrification_32x32_off.png"] { content: var(--ik-theme-button-transmog-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="magic_64x64_off.png"] { content: var(--ik-theme-button-magic-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="favourites_32x32_off.png"] { content: var(--ik-theme-button-favourites-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="rankings_32x32_off.png"] { content: var(--ik-theme-button-leaderboard-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="account_preferences_32x32_off.png"] { content: var(--ik-theme-button-account-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="about_32x32_off.png"] { content: var(--ik-theme-button-support-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="alliances_64x64_off.png"], body.ik-dark-mode h1 img[src*="alliances_64x64_off.png"] { content: var(--ik-theme-button-alliance-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="alliance_32x32_off.png"] { content: var(--ik-theme-button-recruit-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="factions_standings_32x32_off.png"] { content: var(--ik-theme-button-standings-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="prestige_64x64_off.png"] { content: var(--ik-theme-button-prestige-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="medal_32x32_off.png"] { content: var(--ik-theme-button-medal-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="buy_prestige_32x32_off.png"] { content: var(--ik-theme-button-buy-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="history_32x32_off.png"] { content: var(--ik-theme-button-history-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="notifications_32x32_off.png"] { content: var(--ik-theme-button-notif-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="chat_32x32_off.png"] { content: var(--ik-theme-button-chat-off) !important; }
            body.ik-dark-mode h1 img.h1Icon[src*="mail_64x64_off.png"] { content: var(--ik-theme-button-mail-off) !important; }

            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.t { background-image: var(--ik-theme-popup-top) !important; }
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.m { background-image: var(--ik-theme-popup-mid) !important; }
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.b { background-image: var(--ik-theme-popup-bot) !important; }

            body.ik-dark-mode .ui-widget-header.ui-progressbar-value {
                background-image: var(--ik-theme-headerP-texture) !important;
                background-repeat: repeat !important;
                border-color: var(--ik-theme-border-color) !important;
            }

            /* =========================================================================
               DARK MODE DEFAULT OVERRIDES
               ========================================================================= */

            body.ik-dark-mode .ui-tabs-selected,
            body.ik-dark-mode .ui-tabs-active,
            body.ik-dark-mode .ui-tabs-selected a,
            body.ik-dark-mode .ui-tabs-active a,
            body.ik-dark-mode .ui-tabs-selected a[href],
            body.ik-dark-mode .ui-tabs-active a[href],
            body.ik-dark-mode .ui-tabs-nav li.ui-tabs-selected a,
            body.ik-dark-mode .ui-tabs-nav li.ui-tabs-selected a[href] {
                color: var(--ik-theme-special-text5) !important;
            }
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
            body.ik-dark-mode div#advRes {
                background-color: var(--ik-theme-content-bg) !important;
                border-color: var(--ik-theme-alt-border-color) !important;
            }
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.m div div b span [style*="860008"] { color: #ff5555 !important; }
            body.ik-dark-mode div#WzTtDiV div#WzBoDy table tbody tr td#WzBoDyI div.popup div.m div div b span [style*="004B00"] { color: #55ff55 !important; }
            body.ik-dark-mode div#WzTtDiV [style*="color: #004B00"],
            body.ik-dark-mode div#WzTtDiV [style*="color:#004B00"],
            body.ik-dark-mode div#WzTtDiV span[style*="004B00"] {
                color: #55ff55 !important;
            }
            body.ik-dark-mode div#WzTtDiV [style*="color: #860008"],
            body.ik-dark-mode div#WzTtDiV [style*="color:#860008"],
            body.ik-dark-mode div#WzTtDiV span[style*="860008"] {
                color: #ff5555 !important;
            }
            body.ik-dark-mode .indOwn, body.ik-dark-mode .indOwn a[href],
            body.ik-dark-mode .indHostile, body.ik-dark-mode .indHostile a[href],
            body.ik-dark-mode .indFriendly, body.ik-dark-mode .indFriendly a[href],
            body.ik-dark-mode .indCommunication, body.ik-dark-mode .indCommunication a[href],
            body.ik-dark-mode [class*="ind"], body.ik-dark-mode [class*="ind"] a[href] {
                color: var(--ik-theme-special-text9) !important;
            }
            body.ik-dark-mode div.ui-slider-range.ui-widget-header.ui-slider-range-min {
                background-image: var(--ik-theme-headerP-texture) !important;
                background-repeat: repeat !important;
            }
            body.ik-dark-mode .selected,
            body.ik-dark-mode a.selected,
            body.ik-dark-mode a:link.selected,
            body.ik-dark-mode a:visited.selected,
            body.ik-dark-mode span.selected {
                color: var(--ik-theme-special-text5) !important;
            }
            body.ik-dark-mode span.ikcat-dialog-tab {
                color: var(--ik-theme-special-text4) !important;
            }
            body.ik-dark-mode span.ikcat-dialog-tab.active,
            body.ik-dark-mode span.ikcat-dialog-tab.data-tab,
            body.ik-dark-mode span.ikcat-dialog-tab.active.data-tab {
                color: var(--ik-theme-special-text5) !important;
            }
            body.ik-dark-mode div.iconBox img.icon,
            body.ik-dark-mode div.iconBox img.sIcon {
                color: transparent !important;
                text-indent: -9999px;
            }
        `;
    }

function applySettings() {
        if (settings.darkMode) {
            document.documentElement.classList.add("ik-dark-mode");
            document.body.classList.add("ik-dark-mode");

            preloadCustomImages();

            const themes = window.IKLuperThemes || {};
            const activeThemeObj = themes[settings.activeTheme] || themes["Dark-mode"] || {};

            const root = document.documentElement;
            for (const [key, value] of Object.entries(activeThemeObj)) {
                root.style.setProperty(key, value);
            }
        } else {
            document.documentElement.classList.remove("ik-dark-mode");
            document.body.classList.remove("ik-dark-mode");
        }
        styleCKEditorPanels();
        SovImbalanceCheck();
    }

    function saveSettings() {
        const darkCheckbox = document.querySelector("#ikltDarkCheckbox");
        const sovCheckbox = document.querySelector("#ikltSovCheckbox");
        const themeSelect = document.querySelector("#ikltThemeSelect");

        if (darkCheckbox) settings.darkMode = darkCheckbox.checked;
        if (sovCheckbox) settings.sovHighlight = sovCheckbox.checked;
        if (themeSelect) settings.activeTheme = themeSelect.value;

        saveJSON(STORAGE.SETTINGS, settings);
        applySettings();
    }

    function restoreSettings() {
        const saved = loadJSON(STORAGE.SETTINGS, null);
        if (saved) settings = Object.assign({}, settings, saved);

        const darkCheckbox = document.querySelector("#ikltDarkCheckbox");
        const sovCheckbox = document.querySelector("#ikltSovCheckbox");
        const themeSelect = document.querySelector("#ikltThemeSelect");

        if (darkCheckbox) darkCheckbox.checked = !!settings.darkMode;
        if (sovCheckbox) sovCheckbox.checked = !!settings.sovHighlight;
        if (themeSelect) themeSelect.value = settings.activeTheme || "Dark-mode";

        applySettings();
    }

    function createTweaksContents() {
        if (document.querySelector("#ikLuperTweaks")) return;
        const content = document.createElement("div");
        content.id = "ikLuperTweaks";
        content.innerHTML = `
            <div class="iklt-flex-wrapper">
                <div id="ikltAccordion">
                    <h3 style="display: block !important; cursor: pointer; padding: 6px 10px; font-size: 13px; margin-bottom: 2px;"><a href="#" style="display: block !important; text-decoration: none;">User Interface Customizer</a></h3>
                    <div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                            <label class="iklt-option-row" style="margin-bottom: 0;">
                                <input type="checkbox" id="ikltDarkCheckbox" />
                                <span>Enable Preset Dark Mode Style</span>
                            </label>
                            <select id="ikltThemeSelect" style="padding: 2px 6px; font-size: 11px;">
                                <option value="Dark-mode">Dark-mode</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>
                        <div id="ikltSubAccordion" style="margin-top: 8px;">
                            <h3 style="display: block !important; cursor: pointer; padding: 4px 8px; font-size: 12px; margin-bottom: 2px;"><a href="#" style="display: block !important; text-decoration: none;">Advanced Customization Options</a></h3>
                            <div id="iklt220">
                            <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 3px;">Header color</td>
                                    <td style="padding: 3px; white-space: nowrap;">
                                        <input type="text" id="iklt_headerColor" style="width: 110px;" />
                                        <input type="submit" class="short" value="Apply" style="margin-left: 6px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 3px;">Active tab color</td>
                                    <td style="padding: 3px; white-space: nowrap;">
                                        <input type="text" id="iklt_activeTabColor" style="width: 110px;" />
                                        <input type="submit" class="short" value="Apply" style="margin-left: 6px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 3px;">Link color</td>
                                    <td style="padding: 3px; white-space: nowrap;">
                                        <input type="text" id="iklt_linkColor" style="width: 110px;" />
                                        <input type="submit" class="short" value="Apply" style="margin-left: 6px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 3px;">Name color</td>
                                    <td style="padding: 3px; white-space: nowrap;">
                                        <input type="text" id="iklt_nameColor" style="width: 110px;" />
                                        <input type="submit" class="short" value="Apply" style="margin-left: 6px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 3px;">Self color</td>
                                    <td style="padding: 3px; white-space: nowrap;">
                                        <input type="text" id="iklt_selfColor" style="width: 110px;" />
                                        <input type="submit" class="short" value="Apply" style="margin-left: 6px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 3px;">Border color</td>
                                    <td style="padding: 3px; white-space: nowrap;">
                                        <input type="text" id="iklt_borderColor" style="width: 110px;" />
                                        <input type="submit" class="short" value="Apply" style="margin-left: 6px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 3px;">Background color</td>
                                    <td style="padding: 3px; white-space: nowrap;">
                                        <input type="text" id="iklt_bgColor" style="width: 110px;" />
                                        <input type="submit" class="short" value="Apply" style="margin-left: 6px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 3px;">Background alternate color</td>
                                    <td style="padding: 3px; white-space: nowrap;">
                                        <input type="text" id="iklt_bgAltColor" style="width: 110px;" />
                                        <input type="submit" class="short" value="Apply" style="margin-left: 6px;" />
                                    </td>
                                </tr>
                            </table>
                            </div>
                        </div>
                    </div>
                    <h3 style="display: block !important; cursor: pointer; padding: 6px 10px; font-size: 13px; margin-bottom: 2px;"><a href="#" style="display: block !important; text-decoration: none;">City Skin Customizer</a></h3>
                    <div>
                        <label class="iklt-option-row">
                            <input type="checkbox" id="ikltSovCheckbox" />
                            <span>Highlight Sov Level Imbalance</span>
                        </label>
                    </div>
                </div>
                <div class="iklt-footer">LuperTweaks v2.32</div>
            </div>
        `;
        document.body.appendChild(content);

        // Initialize jQuery UI Accordion matching Illyriad's native style
        if (window.jQuery && jQuery.fn && typeof jQuery.fn.accordion === "function") {
            jQuery("#ikltAccordion").accordion({
                header: "> h3",
                collapsible: true,
                active: false,
                heightStyle: "content"
            });

            jQuery("#ikltSubAccordion").accordion({
                header: "h3",
                collapsible: true,
                active: false,
                heightStyle: "content"
            });

            // Set initial default closed height and attach MutationObserver to sub-accordion header
            setTimeout(() => {
                const contentDiv = jQuery("#ikltAccordion > div:first-of-type")[0];
                const subHeader = document.querySelector("#ikltSubAccordion h3");

                if (contentDiv) {
                    contentDiv.style.setProperty("height", "75px", "important");
                    contentDiv.style.setProperty("overflow-y", "hidden", "important");
                }

                if (contentDiv && subHeader) {
                    const observer = new MutationObserver(() => {
                        const isOpen = subHeader.getAttribute("aria-expanded") === "true" ||
                                       subHeader.getAttribute("aria-selected") === "true" ||
                                       subHeader.classList.contains("ui-state-active");

                        const targetHeight = isOpen ? "385px" : "75px";
                        const overflowVal = isOpen ? "auto" : "hidden";

                        contentDiv.style.setProperty("height", targetHeight, "important");
                        contentDiv.style.setProperty("overflow-y", overflowVal, "important");
                    });

                    observer.observe(subHeader, { attributes: true, attributeFilter: ["aria-expanded", "aria-selected", "class"] });
                }
            }, 50);
        }

        content.querySelector("#ikltDarkCheckbox").addEventListener("change", saveSettings);
        content.querySelector("#ikltThemeSelect").addEventListener("change", saveSettings);
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
            width: Math.max(380, Number(saved.width) || 380),
            height: Math.max(265, Number(saved.height) || 320),
            minWidth: 380, minHeight: 265, draggable: true, resizable: true, closeOnEscape: false,
            dragStop: saveTweaksGeometry, resizeStop: saveTweaksGeometry,
            open: function () {
                saveJSON(STORAGE.OPEN, true);
                $tweaks.dialog("widget").addClass("flora").css("z-index", 11000);
                restoreSettings();
                setTimeout(() => {
                    clampTweaks();
                    if (window.jQuery && jQuery.fn.accordion) {
                        jQuery("#ikltAccordion").accordion("refresh");
                        jQuery("#ikltSubAccordion").accordion("refresh");
                    }
                }, 0);
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
        preloadCustomImages();
        injectTweaksStyles();
        restoreSettings();
        if (!createTweaksDialog()) return false;

        setInterval(() => {
            highlightZeroCityValues();
            SovImbalanceCheck();
        }, 1000);

        if (window.CKEDITOR) {
            window.CKEDITOR.on('instanceReady', function(evt) {
                styleCKEditorPanels();
                evt.editor.on('maximize', function() {
                    setTimeout(styleCKEditorPanels, 50);
                    setTimeout(styleCKEditorPanels, 200);
                });
            });
        }

        const uiObserver = new MutationObserver(() => {
            styleCKEditorPanels();
        });
        uiObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

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
