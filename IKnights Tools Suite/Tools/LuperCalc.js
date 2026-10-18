// ==UserScript==
// @name         Illyriad Tools Suite - LuperCalc
// @namespace    http://tampermonkey.net/
// @version      2.0.1
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
    // CONFIG & DATASETS (Placeholder / Extensible for external dataset)
    // =========================================================================

    const STORAGE = {
        STATE: "ikLuperCalc.state.v2",
        GEOMETRY: "ikLuperCalc.geometry.v2",
        OPEN:     "ikLuperCalc.open.v2"
    };

    const SAMPLE_UNITS = [
        "Militiaman", "Pikeman", "Longbowman", "Charioteer", 
        "Knight", "White Wyrm", "Messenger", "Scout", 
        "Ranger", "Agent", "Scribe of Allembine", "Assassin"
    ];

    const ARMY_TYPES = [
        "Standard Army", "Horde", "Expeditionary Force", "Garrison Defense", "Elite Vanguard"
    ];

    const GEAR_OPTIONS = {
        weapons: ["None", "Iron Sword", "Steel Broadsword", "Elven Bow", "Battle Axe", "Lance"],
        armour: ["None", "Leather Armour", "Chainmail", "Plate Cuirass", "Dragonscale"],
        mounts: ["None", "Warhorse", "Armoured Charger", "Desert Camel", "Griffon"]
    };

    const SKILL_LIST = [
        "Heroism", "Defy Death", "Break Spear Wall", "Cover", 
        "Sword Mastery", "Avoid Charge", "Vitality", "Accelerated Healing", 
        "Uncanny Sense", "Close Quarter Penetration", "Agile Defence", "Forced March", 
        "Concentrated Fire", "Tortoise Formation", "Military Logistics", "Bloodlust", 
        "Interlocked Shields", "Force Of Will", "Tactical Precision", "Vanguard Discipline"
    ];

    // Default application state structure
    const DEFAULT_STATE = {
        armies: Array.from({ length: 5 }, (_, i) => ({
            name: `Army ${i + 1}`,
            divisions: Array.from({ length: 5 }, (_, d) => ({
                name: `Division ${d + 1}`,
                commanderId: 0,
                units: SAMPLE_UNITS.reduce((acc, u) => ({ ...acc, [u]: 0 }), {})
            }))
        })),
        commanders: Array.from({ length: 10 }, (_, i) => ({
            name: `Commander ${i + 1}`,
            weapon: "None",
            armour: "None",
            mount: "None",
            skills: SKILL_LIST.reduce((acc, s) => ({ ...acc, [s]: 0 }), {})
        })),
        calc: {
            armyType: ARMY_TYPES[0],
            selectedArmyIndex: 0,
            units: SAMPLE_UNITS.reduce((acc, u) => ({ ...acc, [u]: 0 }), {})
        }
    };

    let calcState = loadJSON(STORAGE.STATE, DEFAULT_STATE);
    let $luperCalc = null;
    let luperCalcInitialized = false;
    let resizeBound = false;
    let currentTab = "armies"; // Default tab
    let activeArmyIndex = 0;
    let activeDivisionIndex = 0;
    let activeCommanderIndex = 0;

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
            .ikcalc-dialog-tabs {
                float: left;
                margin: 5px 16px 0 8px; 
                display: flex;
                gap: 6px; 
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

            /* Sub-nav bars */
            .ikcalc-subnav {
                display: flex;
                gap: 4px;
                margin-bottom: 8px;
                flex-wrap: wrap;
            }

            .ikcalc-subnav-btn {
                background: rgba(139, 90, 43, 0.15);
                border: 1px solid rgba(139, 90, 43, 0.4);
                padding: 4px 10px;
                font-size: 11px;
                cursor: pointer;
                border-radius: 3px;
                color: #4a3311;
            }

            .ikcalc-subnav-btn:hover {
                background: rgba(139, 90, 43, 0.3);
            }

            .ikcalc-subnav-btn.active {
                background: #8b5a2b;
                color: #fff;
                font-weight: bold;
            }

            /* Armies & Division Panels */
            .ikcalc-panel-box {
                border: 1px solid rgba(139, 90, 43, 0.3);
                background: rgba(255, 255, 255, 0.4);
                padding: 8px;
                border-radius: 4px;
                margin-bottom: 8px;
            }

            .ikcalc-row {
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 6px;
            }

            .ikcalc-row label {
                font-weight: bold;
                font-size: 11px;
                color: #4a3311;
            }

            .ikcalc-row input, .ikcalc-row select {
                padding: 3px 6px;
                font-size: 11px;
                border: 1px inset #ccc;
                border-radius: 3px;
            }

            /* Unit table recreation */
            .ikcalc-unit-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 4px;
                font-size: 11px;
            }

            .ikcalc-unit-table th, .ikcalc-unit-table td {
                border: 1px solid rgba(139, 90, 43, 0.2);
                padding: 4px 6px;
                text-align: left;
            }

            .ikcalc-unit-table th {
                background: rgba(139, 90, 43, 0.2);
                color: #4a3311;
            }

            .ikcalc-unit-table input[type="number"] {
                width: 60px;
                padding: 2px 4px;
            }

            /* Commanders Grid */
            .ikcalc-skills-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 6px;
                margin-top: 8px;
            }

            .ikcalc-skill-card {
                border: 1px solid rgba(139, 90, 43, 0.3);
                background: #fff;
                padding: 6px;
                border-radius: 3px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
            }

            .ikcalc-skill-card input {
                width: 45px;
                text-align: center;
            }

            .ikcalc-results-panel {
                border: 1px inset rgba(0, 0, 0, 0.25);
                background: rgba(0, 0, 0, 0.03);
                padding: 8px;
                min-height: 120px;
                max-height: 180px;
                overflow-y: auto;
                border-radius: 4px;
                font-size: 12px;
                font-family: serif;
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================================================
    // UI BUILDER & RENDERING
    // =========================================================================

    function createLuperCalcContents() {
        if (document.querySelector("#ikLuperCalc")) return;

        const content = document.createElement("div");
        content.id = "ikLuperCalc";
        
        content.innerHTML = `
            <div class="ikcalc-flex-wrapper">
                <!-- Tab 1: Armies -->
                <div id="ikCalcTabArmies" class="ikcalc-tab-content active">
                    <div class="ikcalc-subnav" id="ikArmySubNav"></div>
                    <div class="ikcalc-panel-box">
                        <div class="ikcalc-row">
                            <label>Army Name:</label>
                            <input type="text" id="ikArmyNameInput" style="flex:1;" />
                        </div>
                    </div>
                    <div class="ikcalc-subnav" id="ikDivisionSubNav"></div>
                    <div class="ikcalc-panel-box" id="ikDivisionDetailsPanel"></div>
                </div>

                <!-- Tab 2: Commanders -->
                <div id="ikCalcTabCommanders" class="ikcalc-tab-content">
                    <div class="ikcalc-subnav" id="ikCommanderSubNav"></div>
                    <div class="ikcalc-panel-box" id="ikCommanderDetailsPanel"></div>
                </div>

                <!-- Tab 3: Battle Calculator -->
                <div id="ikCalcTabCalculator" class="ikcalc-tab-content">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">Battle Calculation Results:</div>
                    <div class="ikcalc-results-panel" id="ikCalcResults">
                        <span style="color: #888; font-style: italic;">Battle simulation results will appear here...</span>
                    </div>
                    <div class="ikcalc-panel-box" style="margin-top: 8px;">
                        <div class="ikcalc-row">
                            <label>Army Type:</label>
                            <select id="ikCalcArmyTypeSelect" style="flex:1;">
                                ${ARMY_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
                            </select>
                        </div>
                        <div class="ikcalc-row">
                            <label>Import Army:</label>
                            <select id="ikCalcImportArmySelect" style="flex:1;"></select>
                        </div>
                        <div style="font-weight: bold; font-size: 11px; margin-top: 6px;">Test Army Unit Compositions:</div>
                        <div id="ikCalcUnitInputsContainer" style="margin-top: 4px;"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(content);
        renderArmiesTab();
        renderCommandersTab();
        renderCalculatorTab();
        bindLuperCalcEvents();
    }

    // =========================================================================
    // RENDERING LOGIC
    // =========================================================================

    function renderArmiesTab() {
        const armyNav = document.querySelector("#ikArmySubNav");
        const divisionNav = document.querySelector("#ikDivisionSubNav");
        const armyNameInput = document.querySelector("#ikArmyNameInput");
        const divisionPanel = document.querySelector("#ikDivisionDetailsPanel");

        if (!armyNav) return;

        // Render Army buttons (1 to 5)
        armyNav.innerHTML = calcState.armies.map((army, idx) => `
            <button class="ikcalc-subnav-btn ${idx === activeArmyIndex ? 'active' : ''}" data-army="${idx}">
                ${army.name}
            </button>
        `).join("");

        const currentArmy = calcState.armies[activeArmyIndex];
        if (armyNameInput) armyNameInput.value = currentArmy.name;

        // Render Division buttons (1 to 5)
        divisionNav.innerHTML = currentArmy.divisions.map((div, idx) => `
            <button class="ikcalc-subnav-btn ${idx === activeDivisionIndex ? 'active' : ''}" data-division="${idx}">
                ${div.name}
            </button>
        `).join("");

        const currentDiv = currentArmy.divisions[activeDivisionIndex];

        // Commander options dropdown
        const commanderOptions = calcState.commanders.map((cmd, idx) => `
            <option value="${idx}" ${currentDiv.commanderId === idx ? 'selected' : ''}>${cmd.name}</option>
        `).join("");

        // Units table
        const unitsRows = SAMPLE_UNITS.map(unit => `
            <tr>
                <td>${unit}</td>
                <td><input type="number" min="0" value="${currentDiv.units[unit] || 0}" data-unit="${unit}" class="ik-army-unit-input" /></td>
            </tr>
        `).join("");

        divisionPanel.innerHTML = `
            <div class="ikcalc-row">
                <label>Division Name:</label>
                <input type="text" id="ikDivisionNameInput" value="${currentDiv.name}" style="flex:1;" />
            </div>
            <div class="ikcalc-row">
                <label>Commander:</label>
                <select id="ikDivisionCommanderSelect" style="flex:1;">
                    ${commanderOptions}
                </select>
            </div>
            <div style="font-weight: bold; font-size: 11px; margin-top: 8px;">Division Unit Compositions:</div>
            <table class="ikcalc-unit-table">
                <thead>
                    <tr><th>Unit Name</th><th>Count</th></tr>
                </thead>
                <tbody>
                    ${unitsRows}
                </tbody>
            </table>
        `;
        bindArmiesEvents();
    }

    function renderCommandersTab() {
        const commanderNav = document.querySelector("#ikCommanderSubNav");
        const commanderPanel = document.querySelector("#ikCommanderDetailsPanel");

        if (!commanderNav) return;

        commanderNav.innerHTML = calcState.commanders.map((cmd, idx) => `
            <button class="ikcalc-subnav-btn ${idx === activeCommanderIndex ? 'active' : ''}" data-commander="${idx}">
                ${cmd.name}
            </button>
        `).join("");

        const currentCmd = calcState.commanders[activeCommanderIndex];

        const weaponOpts = GEAR_OPTIONS.weapons.map(w => `<option value="${w}" ${currentCmd.weapon === w ? 'selected' : ''}>${w}</option>`).join("");
        const armourOpts = GEAR_OPTIONS.armour.map(a => `<option value="${a}" ${currentCmd.armour === a ? 'selected' : ''}>${a}</option>`).join("");
        const mountOpts = GEAR_OPTIONS.mounts.map(m => `<option value="${m}" ${currentCmd.mount === m ? 'selected' : ''}>${m}</option>`).join("");

        const skillsCards = SKILL_LIST.map(skill => `
            <div class="ikcalc-skill-card">
                <span>${skill} (0/10)</span>
                <input type="number" min="0" max="10" value="${currentCmd.skills[skill] || 0}" data-skill="${skill}" class="ik-cmd-skill-input" />
            </div>
        `).join("");

        commanderPanel.innerHTML = `
            <div class="ikcalc-row">
                <label>Commander Name:</label>
                <input type="text" id="ikCommanderNameInput" value="${currentCmd.name}" style="flex:1;" />
            </div>
            <div class="ikcalc-row">
                <label>Weapon:</label>
                <select id="ikCommanderWeapon" style="flex:1;">${weaponOpts}</select>
            </div>
            <div class="ikcalc-row">
                <label>Armour:</label>
                <select id="ikCommanderArmour" style="flex:1;">${armourOpts}</select>
            </div>
            <div class="ikcalc-row">
                <label>Mount:</label>
                <select id="ikCommanderMount" style="flex:1;">${mountOpts}</select>
            </div>
            <div style="font-weight: bold; font-size: 11px; margin-top: 8px;">Commander Skills (20 Trees):</div>
            <div class="ikcalc-skills-grid">
                ${skillsCards}
            </div>
        `;
        bindCommandersEvents();
    }

    function renderCalculatorTab() {
        const typeSelect = document.querySelector("#ikCalcArmyTypeSelect");
        const importSelect = document.querySelector("#ikCalcImportArmySelect");
        const unitsContainer = document.querySelector("#ikCalcUnitInputsContainer");

        if (!typeSelect) return;

        typeSelect.value = calcState.calc.armyType;

        importSelect.innerHTML = `<option value="">-- Choose Army from Armies Tab --</option>` + 
            calcState.armies.map((army, idx) => `<option value="${idx}">${army.name}</option>`).join("");

        unitsContainer.innerHTML = `
            <table class="ikcalc-unit-table">
                <thead>
                    <tr><th>Unit Name</th><th>Available Count</th></tr>
                </thead>
                <tbody>
                    ${SAMPLE_UNITS.map(unit => `
                        <tr>
                            <td>${unit}</td>
                            <td><input type="number" min="0" value="${calcState.calc.units[unit] \vert{}\vert{} 0}" data-calc-unit="${unit}" class="ik-calc-unit-input" /></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
        bindCalculatorEvents();
    }

    // =========================================================================
    // EVENT BINDINGS
    // =========================================================================

    function bindArmiesEvents() {
        const content = document.querySelector("#ikCalcTabArmies");
        if (!content) return;

        content.querySelectorAll("[data-army]").forEach(btn => {
            btn.onclick = (e) => {
                activeArmyIndex = Number(e.target.dataset.army);
                activeDivisionIndex = 0;
                renderArmiesTab();
            };
        });

        content.querySelectorAll("[data-division]").forEach(btn => {
            btn.onclick = (e) => {
                activeDivisionIndex = Number(e.target.dataset.division);
                renderArmiesTab();
            };
        });

        const armyNameInput = document.querySelector("#ikArmyNameInput");
        if (armyNameInput) {
            armyNameInput.oninput = (e) => {
                calcState.armies[activeArmyIndex].name = e.target.value;
                saveJSON(STORAGE.STATE, calcState);
                renderArmiesTab();
            };
        }

        const divNameInput = document.querySelector("#ikDivisionNameInput");
        if (divNameInput) {
            divNameInput.oninput = (e) => {
                calcState.armies[activeArmyIndex].divisions[activeDivisionIndex].name = e.target.value;
                saveJSON(STORAGE.STATE, calcState);
                renderArmiesTab();
            };
        }

        const cmdSelect = document.querySelector("#ikDivisionCommanderSelect");
        if (cmdSelect) {
            cmdSelect.onchange = (e) => {
                calcState.armies[activeArmyIndex].divisions[activeDivisionIndex].commanderId = Number(e.target.value);
                saveJSON(STORAGE.STATE, calcState);
            };
        }

        content.querySelectorAll(".ik-army-unit-input").forEach(input => {
            input.oninput = (e) => {
                const unitName = e.target.dataset.unit;
                calcState.armies[activeArmyIndex].divisions[activeDivisionIndex].units[unitName] = Number(e.target.value) || 0;
                saveJSON(STORAGE.STATE, calcState);
            };
        });
    }

    function bindCommandersEvents() {
        const content = document.querySelector("#ikCalcTabCommanders");
        if (!content) return;

        content.querySelectorAll("[data-commander]").forEach(btn => {
            btn.onclick = (e) => {
                activeCommanderIndex = Number(e.target.dataset.commander);
                renderCommandersTab();
            };
        });

        const nameInput = document.querySelector("#ikCommanderNameInput");
        if (nameInput) {
            nameInput.oninput = (e) => {
                calcState.commanders[activeCommanderIndex].name = e.target.value;
                saveJSON(STORAGE.STATE, calcState);
                renderArmiesTab(); // Refresh army views in case commander name changed
                renderCommandersTab();
            };
        }

        const wSelect = document.querySelector("#ikCommanderWeapon");
        if (wSelect) wSelect.onchange = (e) => { calcState.commanders[activeCommanderIndex].weapon = e.target.value; saveJSON(STORAGE.STATE, calcState); };

        const aSelect = document.querySelector("#ikCommanderArmour");
        if (aSelect) aSelect.onchange = (e) => { calcState.commanders[activeCommanderIndex].armour = e.target.value; saveJSON(STORAGE.STATE, calcState); };

        const mSelect = document.querySelector("#ikCommanderMount");
        if (mSelect) mSelect.onchange = (e) => { calcState.commanders[activeCommanderIndex].mount = e.target.value; saveJSON(STORAGE.STATE, calcState); };

        content.querySelectorAll(".ik-cmd-skill-input").forEach(input => {
            input.oninput = (e) => {
                const skillName = e.target.dataset.skill;
                calcState.commanders[activeCommanderIndex].skills[skillName] = Number(e.target.value) || 0;
                saveJSON(STORAGE.STATE, calcState);
            };
        });
    }

    function bindCalculatorEvents() {
        const content = document.querySelector("#ikCalcTabCalculator");
        if (!content) return;

        const typeSelect = document.querySelector("#ikCalcArmyTypeSelect");
        if (typeSelect) {
            typeSelect.onchange = (e) => {
                calcState.calc.armyType = e.target.value;
                saveJSON(STORAGE.STATE, calcState);
            };
        }

        const importSelect = document.querySelector("#ikCalcImportArmySelect");
        if (importSelect) {
            importSelect.onchange = (e) => {
                const armyIdx = e.target.value;
                if (armyIdx !== "") {
                    const selectedArmy = calcState.armies[Number(armyIdx)];
                    // Aggregate units across divisions for calculator
                    const aggregated = SAMPLE_UNITS.reduce((acc, u) => ({ ...acc, [u]: 0 }), {});
                    selectedArmy.divisions.forEach(div => {
                        Object.keys(div.units).forEach(u => {
                            aggregated[u] = (aggregated[u] || 0) + (div.units[u] || 0);
                        });
                    });
                    calcState.calc.units = aggregated;
                    saveJSON(STORAGE.STATE, calcState);
                    renderCalculatorTab();
                }
            };
        }

        content.querySelectorAll(".ik-calc-unit-input").forEach(input => {
            input.oninput = (e) => {
                const unitName = e.target.dataset.calcUnit;
                calcState.calc.units[unitName] = Number(e.target.value) || 0;
                saveJSON(STORAGE.STATE, calcState);
            };
        });
    }

    function bindLuperCalcEvents() {
        // Global dialog events if needed
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
                $luperCalc.dialog("option", "width", Math.max(450, geometry.width));
                $luperCalc.dialog("option", "height", Math.max(400, geometry.height));
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
            width: Math.max(450, Number(saved.width) || 520),
            height: Math.max(400, Number(saved.height) || 560),
            minWidth: 380,
            minHeight: 320,
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
                    <span class="ikcalc-dialog-tab active" data-tab="armies">Armies</span>
                    <span class="ikcalc-dialog-tab" data-tab="commanders">Commanders</span>
                    <span class="ikcalc-dialog-tab" data-tab="calculator">Battle Calculator</span>
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
        description: "Battle calculator and army/commander management tool",
        order: 25,
        init: initLuperCalc,
        open: openLuperCalc
    });

})();
