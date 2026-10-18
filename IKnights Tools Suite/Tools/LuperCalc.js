// ==UserScript==
// @name         Illyriad Tools Suite - LuperCalc
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

    if (window.__IKTOOLS_LUPERCALC_LOADED__) {
        return;
    }

    window.__IKTOOLS_LUPERCALC_LOADED__ = true;

    // =========================================================================
    // CORE CHECK
    // =========================================================================

    if (
        !window.IKTools ||
        typeof window.IKTools.registerTool !== "function"
    ) {
        console.error(
            "LuperCalc could not load because IKnights Tools Core is missing."
        );
        return;
    }

    const IKTools = window.IKTools;
    const { loadJSON, saveJSON } = IKTools.util;

    // =========================================================================
    // CONFIG & DATASETS
    // =========================================================================

    const STORAGE = {
        GEOMETRY: "ikLuperCalc.geometry.v1",
        OPEN:     "ikLuperCalc.open.v1"
    };

    let $luperCalc = null;
    let luperCalcInitialized = false;
    let resizeBound = false;
    let currentTab = "calculator"; // Default tab

    // =========================================================================
    // CSS INJECTION
    // =========================================================================

    function injectLuperCalcStyles() {
        if (document.querySelector("#ikLuperCalcStyles")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "ikLuperCalcStyles";
        style.textContent = `
            /* Dialog Title Bar Tabs */
            .ikcalc-dialog-tabs {
                float: left;
                margin: 5px 16px 0 8px; 
                display: flex;
                gap: 8px; 
            }

            .ikcalc-dialog-tab {
                display: inline-block !important;
                cursor: pointer;
                color: #4a3311;
                font-size: 13px;
                font-weight: normal;
                padding: 4px 10px 6px 10px; 
                border-radius: 4px 4px 0 0; 
                opacity: 0.7;
                transition: opacity 0.2s, color 0.2s, background-color 0.2s;
            }

            .ikcalc-dialog-tab:hover {
                opacity: 1;
                color: #8b1111;
            }

            .ikcalc-dialog-tab.active {
                opacity: 1;
                color: #b22222;
                background-color: #fffae8 !important;
                font-weight: bold;
            }

            /* Core Dialog Layout */
            #ikLuperCalc {
                padding: 0 !important;
                overflow: hidden !important;
            }

            .ikcalc-flex-wrapper {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                padding: 8px;
                background-color: #fffae8;
            }

            .ikcalc-tab-content {
                display: none;
                flex: 1 1 0px;
                min-height: 0;
                overflow-y: auto;
                box-sizing: border-box;
            }

            .ikcalc-tab-content.active {
                display: flex;
                flex-direction: column;
            }

            /* Calculator Armies Screen Styles */
            .ikcalc-army-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex: 1;
            }

            .ikcalc-results-panel {
                border: 1px inset rgba(0, 0, 0, 0.25);
                background: rgba(0, 0, 0, 0.03);
                padding: 8px;
                min-height: 100px;
                max-height: 150px;
                overflow-y: auto;
                border-radius: 4px;
                font-size: 12px;
                font-family: serif;
            }

            .ikcalc-army-dropdown {
                border: 1px solid rgba(139, 90, 43, 0.4);
                background: rgba(255, 255, 255, 0.5);
                border-radius: 4px;
                margin-bottom: 4px;
            }

            .ikcalc-army-header {
                padding: 6px 10px;
                background-color: rgba(139, 90, 43, 0.15);
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
            }

            .ikcalc-army-header:hover {
                background-color: rgba(139, 90, 43, 0.25);
            }

            .ikcalc-army-body {
                padding: 8px;
                border-top: 1px solid rgba(139, 90, 43, 0.2);
                display: none; /* Collapsed by default */
                background: #fff;
            }

            .ikcalc-army-dropdown.expanded .ikcalc-army-body {
                display: block;
            }

            /* Create Army Screen Recreation Style */
            .ikcalc-create-army-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 6px;
            }

            .ikcalc-unit-input-group {
                display: flex;
                flex-direction: column;
                font-size: 11px;
                gap: 2px;
            }

            .ikcalc-unit-input-group label {
                font-weight: bold;
                color: #4a3311;
            }

            .ikcalc-unit-input-group input {
                padding: 2px 4px;
                border: 1px inset #ccc;
                border-radius: 2px;
                font-size: 11px;
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================================================
    // UI BUILDER
    // =========================================================================

    const SAMPLE_UNITS = [
        "Spearman", "Swordsman", "Archer", "Light Cavalry", 
        "Heavy Cavalry", "Crossbowman", "Pikeman", "Scout", 
        "Ram", "Catapult", "Mage", "Acolyte"
    ];

    function createArmyBuilderHTML(instanceId) {
        let gridHtml = SAMPLE_UNITS.map(unit => `
            <div class="ikcalc-unit-input-group">
                <label>${unit}</label>
                <input type="number" min="0" value="0" data-unit="${unit}" class="ikcalc-unit-qty" />
            </div>
        `).join("");

        return `
            <div class="ikcalc-army-dropdown" id="${instanceId}">
                <div class="ikcalc-army-header">
                    <span>Army Group (Click to expand/collapse)</span>
                    <span>▼</span>
                </div>
                <div class="ikcalc-army-body">
                    <div style="margin-bottom: 6px; font-size: 11px; font-style: italic;">
                        Configure Unit Compositions (Create Army Screen Recreation):
                    </div>
                    <div class="ikcalc-create-army-grid">
                        ${gridHtml}
                    </div>
                </div>
            </div>
        `;
    }

    function createLuperCalcContents() {
        if (document.querySelector("#ikLuperCalc")) return;

        const content = document.createElement("div");
        content.id = "ikLuperCalc";
        
        content.innerHTML = `
            <div class="ikcalc-flex-wrapper">
                <!-- Tab 1: Battle Calculator -->
                <div id="ikCalcTabCalculator" class="ikcalc-tab-content active">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">Battle Calculation Results:</div>
                    <div class="ikcalc-results-panel">
                        <span style="color: #888; font-style: italic;">Battle calculation results will appear here...</span>
                    </div>
                    <div style="font-weight: bold; font-size: 12px; margin: 8px 0 4px 0;">Armies Setup:</div>
                    <div class="ikcalc-army-container">
                        ${createArmyBuilderHTML("ikArmyDropdown1")}
                        ${createArmyBuilderHTML("ikArmyDropdown2")}
                    </div>
                </div>

                <!-- Tab 2: Additional Tools Tab (Placeholder) -->
                <div id="ikCalcTabSettings" class="ikcalc-tab-content">
                    <div style="padding: 10px; font-size: 12px;">
                        <h3>LuperCalc Settings & Options</h3>
                        <p>Configure default calculation parameters or preferences here.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(content);
        bindLuperCalcEvents();
    }

    // =========================================================================
    // EVENTS
    // =========================================================================

    function bindLuperCalcEvents() {
        const content = document.querySelector("#ikLuperCalc");
        if (!content || content.dataset.bound === "1") return;
        content.dataset.bound = "1";

        // Bind collapsible headers for the Armies dropdowns
        content.querySelectorAll(".ikcalc-army-header").forEach(header => {
            header.addEventListener("click", () => {
                const dropdown = header.closest(".ikcalc-army-dropdown");
                dropdown.classList.toggle("expanded");
                const arrow = header.querySelector("span:last-child");
                arrow.textContent = dropdown.classList.contains("expanded") ? "▲" : "▼";
            });
        });
    }

    // =========================================================================
    // GEOMETRY & DIALOG MANAGEMENT
    // =========================================================================

    function saveLuperCalcGeometry() {
        if (!$luperCalc) return;
        try {
            const widget = $luperCalc.dialog("widget");
            if (!widget?.length) return;
            const offset = widget.offset();

            saveJSON(STORAGE.GEOMETRY, {
                left: Math.round(offset.left),
                top: Math.round(offset.top),
                width: Math.round(widget.outerWidth()),
                height: Math.round(widget.outerHeight())
            });
        } catch (e) {
            console.warn("LuperCalc could not save geometry.", e);
        }
    }

    function clampLuperCalc() {
        if (!$luperCalc) return;
        const widget = $luperCalc.dialog("widget");
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

    function restoreLuperCalcGeometry() {
        if (!$luperCalc) return;
        const geometry = loadJSON(STORAGE.GEOMETRY, null);
        if (!geometry) return;

        try {
            if (geometry.width && geometry.height) {
                $luperCalc.dialog("option", "width", Math.max(400, geometry.width));
                $luperCalc.dialog("option", "height", Math.max(350, geometry.height));
            }

            const widget = $luperCalc.dialog("widget");
            widget.css({
                left: Number(geometry.left || 0) + "px",
                top: Number(geometry.top || 0) + "px"
            });

            clampLuperCalc();
        } catch (e) {
            console.warn("LuperCalc geometry restore failed.", e);
        }
    }

    function createLuperCalcDialog() {
        if (!window.jQuery || !jQuery.fn || typeof jQuery.fn.dialog !== "function") {
            return false;
        }

        createLuperCalcContents();
        const saved = loadJSON(STORAGE.GEOMETRY, {});

        $luperCalc = jQuery("#ikLuperCalc");

        $luperCalc.dialog({
            title: "LuperCalc",
            autoOpen: false,
            width: Math.max(400, Number(saved.width) || 480),
            height: Math.max(350, Number(saved.height) || 520),
            minWidth: 360,
            minHeight: 300,
            draggable: true,
            resizable: true,
            closeOnEscape: false,
            dragStop: saveLuperCalcGeometry,
            resizeStop: saveLuperCalcGeometry,
            open: function () {
                saveJSON(STORAGE.OPEN, true);
                const widget = $luperCalc.dialog("widget");
                widget.addClass("flora");
                widget.css("z-index", 11000);

                restoreLuperCalcGeometry();
                setTimeout(clampLuperCalc, 0);
            },
            close: function () {
                saveLuperCalcGeometry();
                saveJSON(STORAGE.OPEN, false);
            }
        });

        const widget = $luperCalc.dialog("widget");
        widget.addClass("flora");

        // --- TITLE BAR TABS INJECTION ---
        const titleBar = widget.find(".ui-dialog-titlebar");
        titleBar.find(".ui-dialog-title").hide();

        if (!titleBar.find(".ikcalc-dialog-tabs").length) {
            const tabsHtml = `
                <div class="ikcalc-dialog-tabs">
                    <span class="ikcalc-dialog-tab active" data-tab="calculator">Battle Calculator</span>
                    <span class="ikcalc-dialog-tab" data-tab="settings">Settings</span>
                </div>
            `;
            titleBar.prepend(tabsHtml);

            titleBar.find(".ikcalc-dialog-tab").on("click", function(e) {
                const clickedTab = e.target.dataset.tab;
                if (currentTab === clickedTab) return;

                titleBar.find(".ikcalc-dialog-tab").removeClass("active");
                jQuery(this).addClass("active");
                currentTab = clickedTab;

                widget.find(".ikcalc-tab-content").removeClass("active");
                widget.find(`#ikCalcTab${clickedTab.charAt(0).toUpperCase() + clickedTab.slice(1)}`).addClass("active");
            });
        }

        return true;
    }

    function openLuperCalc() {
        if (!$luperCalc) {
            if (!initLuperCalc()) return;
        }

        if (!$luperCalc.dialog("isOpen")) {
            $luperCalc.dialog("open");
        } else {
            try {
                $luperCalc.dialog("moveToTop");
            } catch (e) {}
        }
    }

    // =========================================================================
    // INITIALIZATION & REGISTRATION
    // =========================================================================

    function initLuperCalc() {
        if (luperCalcInitialized) return true;

        if (!window.jQuery || !jQuery.fn || typeof jQuery.fn.dialog !== "function") {
            return false;
        }

        injectLuperCalcStyles();

        if (!createLuperCalcDialog()) return false;

        if (!resizeBound) {
            resizeBound = true;
            window.addEventListener("resize", () => {
                if ($luperCalc &&$luperCalc.dialog("isOpen")) {
                    clampLuperCalc();
                    saveLuperCalcGeometry();
                }
            });
        }

        luperCalcInitialized = true;

        if (loadJSON(STORAGE.OPEN, false)) {
            setTimeout(openLuperCalc, 100);
        }

        console.log("IKnights LuperCalc module loaded.");
        return true;
    }

    IKTools.registerTool({
        id: "lupercalc",
        name: "LuperCalc",
        description: "Battle calculator and army management tool",
        order: 25,
        init: initLuperCalc,
        open: openLuperCalc
    });

})();
