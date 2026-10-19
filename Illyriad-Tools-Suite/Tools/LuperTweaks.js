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
        if (document.querySelector("#ikLuperTweaksStyles")) return;

        const style = document.createElement("style");
        style.id = "ikLuperTweaksStyles";
        style.textContent = `
            /* =========================================================================
               CUSTOMIZABLE THEME VARIABLES (Modify these to easily create custom themes)
               ========================================================================= */
            :root {
                --ik-theme-bg: #131314;
                --ik-theme-content-bg: #1e1f20;
                --ik-theme-alt-bg: #2d2e30;
                --ik-theme-border: #333537;
                --ik-theme-text: #e3e3e3;
                --ik-theme-link: #8ab4f8;
                --ik-theme-link-hover: #aecbfa;
                --ik-theme-texture: url("https://i.imgur.com/7j2EhYr.jpeg");
                --ik-theme-headerO-texture: url("https://i.imgur.com/yCH8seN.png");
                --ik-theme-header-texture: url("https://i.imgur.com/0nDOLcG.jpeg");
                /* ----------------- Custom Button Image Links ------------------ */
                --ik-theme-button-city-off: url("https://i.imgur.com/HgfvVmZ.png");
                --ik-theme-button-city-on: url("https://i.imgur.com/msAGiHn.png");
                --ik-theme-button-castle-off: url("https://i.imgur.com/pfGAKIG.png");
                --ik-theme-button-castle-on: url("https://i.imgur.com/ioWdmfh.png");
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
               
            /* ------------------- City screen header and background -------------------- */  
            body.ik-dark-mode #contentTD {
                background-image: var(--ik-theme-header-texture) !important;
                background-color: var(--ik-theme-content-bg) !important;
            }
            
            /* ------------------- City screen subheader background --------------------- */
            body.ik-dark-mode .headlinks,
            body.ik-dark-mode .headLinks {
                background-image: var(--ik-theme-headerO-texture) !important;
            } /* ---------------------- Subheader selected tab */
            body.ik-dark-mode .headlinks a.selected,
            body.ik-dark-mode .headLinks a.selected {
                background-image: var(--ik-theme-texture) !important;
            }

            /* --------------------------- Top Info Bar -------------------------------- */
            body.ik-dark-mode .topBar {
                background-color: var(--ik-theme-content-bg) !important;
            }

            /* ========================== Top Menu Buttons ============================= */
            /* ----------------------------- City Button ------------------------------- */
            /* ----------------------------- Main Button */
            body.ik-dark-mode div.iconBox.ib2 a img.icon {
                content: var(--ik-theme-button-city-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib2 a:hover img.icon {
                content: var(--ik-theme-button-city-on) !important;
            }
            /* ---------------------------- Castle Button */
            body.ik-dark-mode div.iconBox.ib2 a img.sIcon.sIcon1 {
                content: var(--ik-theme-button-castle-off) !important;
            }
            body.ik-dark-mode div.iconBox.ib2 a:hover img.sIcon.sIcon1 {
                content: var(--ik-theme-button-castle-on) !important;
            }
            

            /* -------------------------- Next Events Widget ---------------------------- */
            body.ik-dark-mode .smallBorder {
                background-image: var(--ik-theme-texture) !important;
                background-repeat: repeat !important;
            } /* ---------------------- Alternate row colour */
            body.ik-dark-mode table.oddeven > tbody > tr:nth-child(2n) {
                background-color: var(--ik-theme-alt-bg) !important;
            }

            /* ----------------------- Docked Friends Widget --------------------------- */
            body.ik-dark-mode #DockedFriends {
                background-image: var(--ik-theme-texture) !important;
                background-repeat: repeat !important;
            } 
            
            /* ---------------------------- Widget Tabs ------------------------------- */
            body.ik-dark-mode .sideTab {
                background-image: var(--ik-theme-headerO-texture) !important;
                background-repeat: repeat !important;
            } /* ------------------------- Selected Tab */
            body.ik-dark-mode .sideTab.selected {
                background-image: var(--ik-theme-texture) !important;
                background-repeat: repeat !important;
            }
            
            
        `;
        document.head.appendChild(style);
    }

    function applySettings() {
        if (settings.darkMode) {
            document.body.classList.add("ik-dark-mode");
        } else {
            document.body.classList.remove("ik-dark-mode");
        }
    }

    function saveSettings() {
        const darkCheckbox = document.querySelector("#ikltDarkCheckbox");
        if (darkCheckbox) {
            settings.darkMode = darkCheckbox.checked;
        }
        saveJSON(STORAGE.SETTINGS, settings);
        applySettings();
    }

    function restoreSettings() {
        const saved = loadJSON(STORAGE.SETTINGS, null);
        if (saved) {
            settings = Object.assign({}, settings, saved);
        }
        const darkCheckbox = document.querySelector("#ikltDarkCheckbox");
        if (darkCheckbox) {
            darkCheckbox.checked = !!settings.darkMode;
        }
        applySettings();
    }


    // =========================================================================
    // UI BUILDER
    // =========================================================================

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
                    <div style="font-size: 11px; opacity: 0.7; margin-left: 20px; margin-top: 2px;">
                        Applies a modern dark theme across the webpage, game panels, chat windows, and script tools.
                    </div>
                </div>

                <!-- Extensible placeholder for future customization options -->
                <div class="iklt-section" style="opacity: 0.6;">
                    <div class="iklt-section-title">Future Customizations</div>
                    <div style="font-size: 11px; font-style: italic;">
                        Additional modular tweak options will appear here in future updates.
                    </div>
                </div>

                <div class="iklt-footer">
                    LuperTweaks v1.9
                </div>
            </div>
        `;
        document.body.appendChild(content);

        const checkbox = content.querySelector("#ikltDarkCheckbox");
        checkbox.addEventListener("change", saveSettings);
    }


    // =========================================================================
    // GEOMETRY & DIALOG MANAGEMENT
    // =========================================================================

    function saveTweaksGeometry() {
        if (!$tweaks) return;
        try {
            const widget = $tweaks.dialog("widget");
            if (!widget?.length) return;
            const offset = widget.offset();
            saveJSON(STORAGE.GEOMETRY, {
                left: Math.round(offset.left),
                top: Math.round(offset.top),
                width: Math.round(widget.outerWidth()),
                height: Math.round(widget.outerHeight())
            });
        } catch (e) {
            console.warn("LuperTweaks could not save geometry.", e);
        }
    }

    function clampTweaks() {
        if (!$tweaks) return;
        const widget = $tweaks.dialog("widget");
        if (!widget?.length) return;

        const width = widget.outerWidth();
        const height = widget.outerHeight();
        const current = widget.offset();

        const maxLeft = Math.max(0, window.innerWidth - width);
        const maxTop = Math.max(0, window.innerHeight - height);

        widget.css({
            left: Math.max(0, Math.min(current.left, maxLeft)) + "px",
            top: Math.max(0, Math.min(current.top, maxTop)) + "px"
        });
    }

    function restoreTweaksGeometry() {
        if (!$tweaks) return;
        const geometry = loadJSON(STORAGE.GEOMETRY, null);
        if (!geometry) return;

        try {
            if (geometry.width && geometry.height) {
                $tweaks.dialog("option", "width", Math.max(340, geometry.width));
                $tweaks.dialog("option", "height", Math.max(260, geometry.height));
            }

            const widget = $tweaks.dialog("widget");
            widget.css({
                left: Number(geometry.left || 0) + "px",
                top: Number(geometry.top || 0) + "px"
            });

            clampTweaks();
        } catch (e) {
            console.warn("LuperTweaks geometry restore failed.", e);
        }
    }

    function createTweaksDialog() {
        if (!window.jQuery || !jQuery.fn || typeof jQuery.fn.dialog !== "function") {
            return false;
        }

        createTweaksContents();
        const saved = loadJSON(STORAGE.GEOMETRY, {});

        $tweaks = jQuery("#ikLuperTweaks");

        $tweaks.dialog({
            title: "LuperTweaks",
            autoOpen: false,
            width: Math.max(340, Number(saved.width) || 380),
            height: Math.max(260, Number(saved.height) || 320),
            minWidth: 300,
            minHeight: 220,
            draggable: true,
            resizable: true,
            closeOnEscape: false,
            dragStop: saveTweaksGeometry,
            resizeStop: saveTweaksGeometry,
            open: function () {
                saveJSON(STORAGE.OPEN, true);
                const widget = $tweaks.dialog("widget");
                widget.addClass("flora");
                widget.css("z-index", 11000);

                restoreTweaksGeometry();
                restoreSettings();
                setTimeout(clampTweaks, 0);
            },
            close: function () {
                saveTweaksGeometry();
                saveJSON(STORAGE.OPEN, false);
            }
        });

        const widget = $tweaks.dialog("widget");
        widget.addClass("flora");
        return true;
    }

    function openLuperTweaks() {
        if (!$tweaks) {
            if (!initLuperTweaks()) return;
        }

        if (!$tweaks.dialog("isOpen")) {
            $tweaks.dialog("open");
        } else {
            try {
                $tweaks.dialog("moveToTop");
            } catch (e) {}
        }
    }


    // =========================================================================
    // INITIALIZATION & REGISTRATION
    // =========================================================================

    function initLuperTweaks() {
        if (tweaksInitialized) return true;

        if (!window.jQuery || !jQuery.fn || typeof jQuery.fn.dialog !== "function") {
            return false;
        }

        injectTweaksStyles();
        restoreSettings(); // Apply saved settings immediately on startup

        if (!createTweaksDialog()) return false;

        if (!resizeBound) {
            resizeBound = true;
            window.addEventListener("resize", () => {
                if ($tweaks &&$tweaks.dialog("isOpen")) {
                    clampTweaks();
                    saveTweaksGeometry();
                }
            });
        }

        tweaksInitialized = true;

        if (loadJSON(STORAGE.OPEN, false)) {
            setTimeout(openLuperTweaks, 100);
        }

        console.log("IKnights LuperTweaks module loaded.");
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
