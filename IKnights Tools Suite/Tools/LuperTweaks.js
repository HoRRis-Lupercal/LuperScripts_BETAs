// ==UserScript==
// @name         Illyriad Tools Suite - LuperTweaks
// @namespace    http://tampermonkey.net/
// @version      1.0
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
        opaquePopups: false
    };


    // =========================================================================
    // CSS INJECTION & GLOBAL STYLING
    // =========================================================================

    function injectTweaksStyles() {
        if (document.querySelector("#ikLuperTweaksStyles")) return;

        const style = document.createElement("style");
        style.id = "ikLuperTweaksStyles";
        style.textContent = `
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

            /* Global Opaque / Non-Transparent Mode Rules (Affects base page, scripts, and chat) */
            body.ik-opaque-mode .ui-dialog,
            body.ik-opaque-mode .ui-widget-content,
            body.ik-opaque-mode .window,
            body.ik-opaque-mode div[id*="chat"],
            body.ik-opaque-mode div[class*="chat"],
            body.ik-opaque-mode .dialog,
            body.ik-opaque-mode #chatWin {
                background-color: #f7f2e0 !important;
                opacity: 1 !important;
                background-image: none !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    function applySettings() {
        if (settings.opaquePopups) {
            document.body.classList.add("ik-opaque-mode");
        } else {
            document.body.classList.remove("ik-opaque-mode");
        }
    }

    function saveSettings() {
        const opaqueCheckbox = document.querySelector("#ikltOpaqueCheckbox");
        if (opaqueCheckbox) {
            settings.opaquePopups = opaqueCheckbox.checked;
        }
        saveJSON(STORAGE.SETTINGS, settings);
        applySettings();
    }

    function restoreSettings() {
        const saved = loadJSON(STORAGE.SETTINGS, null);
        if (saved) {
            settings = Object.assign({}, settings, saved);
        }
        const opaqueCheckbox = document.querySelector("#ikltOpaqueCheckbox");
        if (opaqueCheckbox) {
            opaqueCheckbox.checked = !!settings.opaquePopups;
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
                    <div class="iklt-section-title">Window & Popup Appearance</div>
                    <label class="iklt-option-row">
                        <input type="checkbox" id="ikltOpaqueCheckbox" />
                        <span>Enable Non-Transparent Popups & Chat Windows</span>
                    </label>
                    <div style="font-size: 11px; opacity: 0.7; margin-left: 20px; margin-top: 2px;">
                        Removes transparency from game dialogs, popups, and default chat windows.
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
                    LuperTweaks v1.0
                </div>
            </div>
        `;
        document.body.appendChild(content);

        const checkbox = content.querySelector("#ikltOpaqueCheckbox");
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
