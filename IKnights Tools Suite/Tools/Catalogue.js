/*
 * Illyriad Tools Suite - LuperCat
 * Copyright (c) 2026 HoRRis Lupercal
 * Licensed under the HoRRis Lupercal Non-Commercial License
 */

(function () {
    "use strict";

    if (window.__IKTOOLS_CATALOGUE_LOADED__) {
        return;
    }

    window.__IKTOOLS_CATALOGUE_LOADED__ = true;


    // =========================================================================
    // CORE CHECK
    // =========================================================================

    if (
        !window.IKTools ||
        typeof window.IKTools.registerTool !== "function"
    ) {
        console.error(
            "Catalogue could not load because IKnights Tools Core is missing."
        );

        return;
    }


    const IKTools = window.IKTools;

    const {
        loadJSON,
        saveJSON
    } = IKTools.util;


    // =========================================================================
    // CONFIG & DATASETS
    // =========================================================================

    const STORAGE = {
        SETTINGS: "ikCatalogue.settings.v1",
        GEOMETRY: "ikCatalogue.geometry.v1",
        OPEN:     "ikCatalogue.open.v1"
    };

    const SPRITE_SHEETS = {
        default: {
            url: "https://assets.illyriad.net/img/icons/items-t2.png",
            iconWidth: 48,
            iconHeight: 48
        },
        itemsbase9: {
            url: "https://assets.illyriad.net/img/icons/base9.png",
            iconWidth: 48,
            iconHeight: 48
        },
        itemst2: {
            url: "https://assets.illyriad.net/img/icons/items-t2.png",
            iconWidth: 48,
            iconHeight: 48
        },
        itemst3: {
            url: "https://assets.illyriad.net/img/icons/items-t3b.png",
            iconWidth: 48,
            iconHeight: 48
        },
        sfb: {
            url: "https://assets.illyriad.net/img/icons/tourneysword.png",
            iconWidth: 48,
            iconHeight: 48
        }
    };

    const GEAR_DATA = [
        { name: "Draught Horse", id: "[@c=33]", type: "Horses", x: 1, y: 192, spriteSheet: "itemst2" },
        { name: "Heavy Warhorse", id: "[@c=34]", type: "Horses", x: 1, y: 48, spriteSheet: "itemst2" },
        { name: "Nimble Warhorse", id: "[@c=35]", type: "Horses", x: 1, y: 384, spriteSheet: "itemst2" },
        { name: "Riding Horse", id: "[@c=36]", type: "Horses", x: 1, y: 337, spriteSheet: "itemst2" },
        { name: "Steady Warhorse", id: "[@c=37]", type: "Horses", x: 1, y: 289, spriteSheet: "itemst2" },
        { name: "Adventurer's Sword", id: "[@c=40]", type: "Swords", x: 144, y: 1, spriteSheet: "itemst2" },
        { name: "Barbarian Sword", id: "[@c=41]", type: "Swords", x: 144, y: 624, spriteSheet: "itemst2" },
        { name: "Battle Sword", id: "[@c=42]", type: "Swords", x: 144, y: 336, spriteSheet: "itemst2" },
        { name: "Bone Handled Sword", id: "[@c=43]", type: "Swords", x: 144, y: 192, spriteSheet: "itemst2" },
        { name: "Chitin-Crafted Shortsword", id: "[@c=44]", type: "Swords", x: 144, y: 48, spriteSheet: "itemst2" },
        { name: "Dwarven Battle Axe", id: "[@c=45]", type: "Swords", x: 144, y: 432, spriteSheet: "itemst2" },
        { name: "Ebony-Hilt Sword", id: "[@c=46]", type: "Swords", x: 96, y: 817, spriteSheet: "itemst2" },
        { name: "Elven Sword", id: "[@c=47]", type: "Swords", x: 96, y: 769, spriteSheet: "itemst2" },
        { name: "Fang-Barbed Sword", id: "[@c=48]", type: "Swords", x: 144, y: 288, spriteSheet: "itemst2" },
        { name: "War Axe", id: "[@c=49]", type: "Swords", x: 96, y: 673, spriteSheet: "itemst2" },
        { name: "Light Sword", id: "[@c=50]", type: "Swords", x: 96, y: 530, spriteSheet: "itemst2" },
        { name: "Longsword", id: "[@c=51]", type: "Swords", x: 96, y: 625, spriteSheet: "itemst2" },
        { name: "Machete", id: "[@c=52]", type: "Swords", x: 96, y: 383, spriteSheet: "itemst2" },
        { name: "Mountain-Tribe's Sword", id: "[@c=53]", type: "Swords", x: 144, y: 576, spriteSheet: "itemst2" },
        { name: "Obsidian Blade", id: "[@c=54]", type: "Swords", x: 96, y: 960, spriteSheet: "itemst2" },
        { name: "Orc Marauder's Sword", id: "[@c=55]", type: "Swords", x: 96, y: 480, spriteSheet: "itemst2" },
        { name: "Orcish Sword", id: "[@c=56]", type: "Swords", x: 96, y: 432, spriteSheet: "itemst2" }
    ];


    let $catalogue = null;
    let statusClearTimer = null;
    let catalogueInitialized = false;
    let resizeBound = false;


    // =========================================================================
    // CSS INJECTION
    // =========================================================================

    function injectCatalogueStyles() {
        if (document.querySelector("#ikCatalogueStyles")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "ikCatalogueStyles";
        style.textContent = `
            #ikCatalogue {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                height: 100%;
                overflow: hidden;
            }

            #ikCatalogue .ikcat-main {
                display: flex;
                flex-direction: column;
                height: 100%;
                padding: 6px;
                box-sizing: border-box;
            }

            #ikCatalogue .ikcat-controls {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
                align-items: center;
                flex-shrink: 0;
            }

            #ikCatalogue #ikCatSearch {
                flex: 1;
                height: 26px;
                padding: 2px 6px;
                box-sizing: border-box;
            }

            #ikCatalogue #ikCatTypeSelect {
                height: 26px;
                max-width: 150px;
                box-sizing: border-box;
            }

            #ikCatalogue .ikcat-grid-container {
                flex: 1 1 auto;
                overflow-y: auto;
                border: 1px inset rgba(0, 0, 0, 0.25);
                background: rgba(0, 0, 0, 0.05);
                padding: 6px;
                box-sizing: border-box;
            }

            #ikCatalogue .ikcat-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
                gap: 6px;
                justify-items: center;
            }

            #ikCatalogue .ikcat-card {
                width: 52px;
                height: 52px;
                border: 1px solid rgba(139, 90, 43, 0.4);
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.1s ease, border-color 0.1s ease, background-color 0.1s ease;
                position: relative;
            }

            #ikCatalogue .ikcat-card:hover {
                border-color: #278117;
                background-color: rgba(255, 255, 255, 0.7);
                transform: scale(1.05);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            #ikCatalogue .ikcat-icon {
                width: 48px;
                height: 48px;
                background-repeat: no-repeat;
                pointer-events: none;
            }

            #ikCatalogue .ikcat-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 6px;
                flex-shrink: 0;
                min-height: 20px;
            }

            #ikCatalogue .ikcat-status {
                font-size: 11px;
                font-weight: bold;
            }

            #ikCatalogue .ikcat-count {
                font-size: 11px;
                opacity: 0.8;
            }
        `;

        document.head.appendChild(style);
    }


    // =========================================================================
    // UI BUILDER & GRID RENDER
    // =========================================================================

    function setStatus(message, type) {
        const status = document.querySelector("#ikCatStatus");
        if (!status) return;

        if (statusClearTimer) {
            clearTimeout(statusClearTimer);
            statusClearTimer = null;
        }

        status.textContent = message || "";
        if (!message) {
            status.style.color = "";
            return;
        }

        if (type === "good") status.style.color = "#278117";
        else if (type === "warn") status.style.color = "#9a6400";
        else if (type === "error") status.style.color = "#b22222";
        else status.style.color = "";

        statusClearTimer = setTimeout(() => {
            status.textContent = "";
            status.style.color = "";
            statusClearTimer = null;
        }, 4000);
    }

    function populateTypeDropdown() {
        const select = document.querySelector("#ikCatTypeSelect");
        if (!select) return;

        const types = Array.from(new Set(GEAR_DATA.map(item => item.type))).sort();
        select.innerHTML = `<option value="">All Types</option>`;

        types.forEach(type => {
            const opt = document.createElement("option");
            opt.value = type;
            opt.textContent = type;
            select.appendChild(opt);
        });
    }

    function renderCatalogueGrid() {
        const grid = document.querySelector("#ikCatGrid");
        const countDisplay = document.querySelector("#ikCatCount");
        const query = (document.querySelector("#ikCatSearch")?.value || "").toLowerCase().trim();
        const selectedType = document.querySelector("#ikCatTypeSelect")?.value || "";

        if (!grid) return;

        grid.innerHTML = "";

        const filtered = GEAR_DATA.filter(item => {
            const matchesSearch = !query || 
                item.name.toLowerCase().includes(query) || 
                item.id.toLowerCase().includes(query);
            const matchesType = !selectedType || item.type === selectedType;
            return matchesSearch && matchesType;
        });

        filtered.forEach(item => {
            const sheetInfo = SPRITE_SHEETS[item.spriteSheet] || SPRITE_SHEETS.default;

            const card = document.createElement("div");
            card.className = "ikcat-card";
            card.title = `${item.name} (${item.type})\nTag: ${item.id}\nClick to copy tag`;

            const icon = document.createElement("div");
            icon.className = "ikcat-icon";
            icon.style.backgroundImage = `url("${sheetInfo.url}")`;
            icon.style.backgroundPosition = `-${item.x}px -${item.y}px`;

            card.appendChild(icon);

            card.addEventListener("click", () => {
                handleItemClick(item);
            });

            grid.appendChild(card);
        });

        if (countDisplay) {
            countDisplay.textContent = `Showing ${filtered.length} / ${GEAR_DATA.length}`;
        }
    }

    async function handleItemClick(item) {
        try {
            await navigator.clipboard.writeText(item.id);
            setStatus(`Copied ${item.name} (${item.id}) to clipboard!`, "good");

            const chatBox = document.querySelector("#chatInput, #txtChatMessage, input.chatInput");
            if (chatBox) {
                chatBox.value += (chatBox.value ? " " : "") + item.id;
                chatBox.focus();
            }
        } catch (err) {
            setStatus(`Selected: ${item.id}`, "warn");
        }
    }

    function createCatalogueContents() {
        if (document.querySelector("#ikCatalogue")) return;

        const content = document.createElement("div");
        content.id = "ikCatalogue";
        content.innerHTML = `
            <div class="ikcat-main">
                <div class="ikcat-controls">
                    <input type="text" id="ikCatSearch" placeholder="Search gear or ID..." autocomplete="off" />
                    <select id="ikCatTypeSelect"></select>
                </div>
                <div class="ikcat-grid-container">
                    <div id="ikCatGrid" class="ikcat-grid"></div>
                </div>
                <div class="ikcat-footer">
                    <div id="ikCatStatus" class="ikcat-status"></div>
                    <div id="ikCatCount" class="ikcat-count"></div>
                </div>
            </div>
        `;

        document.body.appendChild(content);
        populateTypeDropdown();
        bindCatalogueEvents();
    }


    // =========================================================================
    // EVENTS
    // =========================================================================

    function bindCatalogueEvents() {
        const content = document.querySelector("#ikCatalogue");
        if (!content || content.dataset.bound === "1") return;

        content.dataset.bound = "1";

        const searchInput = content.querySelector("#ikCatSearch");
        const typeSelect = content.querySelector("#ikCatTypeSelect");

        searchInput?.addEventListener("input", () => {
            renderCatalogueGrid();
            saveSettings();
        });

        typeSelect?.addEventListener("change", () => {
            renderCatalogueGrid();
            saveSettings();
        });
    }

    function saveSettings() {
        const state = {
            search: document.querySelector("#ikCatSearch")?.value || "",
            type: document.querySelector("#ikCatTypeSelect")?.value || ""
        };
        saveJSON(STORAGE.SETTINGS, state);
    }

    function restoreSettings() {
        const state = loadJSON(STORAGE.SETTINGS, null);
        if (!state) return;

        const searchInput = document.querySelector("#ikCatSearch");
        const typeSelect = document.querySelector("#ikCatTypeSelect");

        if (searchInput && state.search !== undefined) searchInput.value = state.search;
        if (typeSelect && state.type !== undefined) typeSelect.value = state.type;
    }


    // =========================================================================
    // GEOMETRY & DIALOG MANAGEMENT
    // =========================================================================

    function saveCatalogueGeometry() {
        if (!$catalogue) return;
        try {
            const widget = $catalogue.dialog("widget");
            if (!widget?.length) return;
            const offset = widget.offset();

            saveJSON(STORAGE.GEOMETRY, {
                left: Math.round(offset.left),
                top: Math.round(offset.top),
                width: Math.round(widget.outerWidth()),
                height: Math.round(widget.outerHeight())
            });
        } catch (e) {
            console.warn("Catalogue could not save geometry.", e);
        }
    }

    function clampCatalogue() {
        if (!$catalogue) return;
        const widget = $catalogue.dialog("widget");
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

    function restoreCatalogueGeometry() {
        if (!$catalogue) return;
        const geometry = loadJSON(STORAGE.GEOMETRY, null);
        if (!geometry) return;

        try {
            if (geometry.width && geometry.height) {
                $catalogue.dialog("option", "width", Math.max(380, geometry.width));
                $catalogue.dialog("option", "height", Math.max(320, geometry.height));
            }

            const widget = $catalogue.dialog("widget");
            widget.css({
                left: Number(geometry.left || 0) + "px",
                top: Number(geometry.top || 0) + "px"
            });

            clampCatalogue();
        } catch (e) {
            console.warn("Catalogue geometry restore failed.", e);
        }
    }

    function createCatalogueDialog() {
        if (!window.jQuery || !jQuery.fn || typeof jQuery.fn.dialog !== "function") {
            return false;
        }

        createCatalogueContents();

        const saved = loadJSON(STORAGE.GEOMETRY, {});

        $catalogue = jQuery("#ikCatalogue");

        $catalogue.dialog({
            title: "Item Catalogue",
            autoOpen: false,
            width: Math.max(380, Number(saved.width) || 420),
            height: Math.max(320, Number(saved.height) || 480),
            minWidth: 340,
            minHeight: 280,
            draggable: true,
            resizable: true,
            closeOnEscape: false,
            dragStop: saveCatalogueGeometry,
            resizeStop: saveCatalogueGeometry,
            open: function () {
                saveJSON(STORAGE.OPEN, true);
                const widget = $catalogue.dialog("widget");
                widget.addClass("flora");
                widget.css("z-index", 11000);

                restoreCatalogueGeometry();
                restoreSettings();
                renderCatalogueGrid();

                setTimeout(clampCatalogue, 0);
            },
            close: function () {
                saveCatalogueGeometry();
                saveJSON(STORAGE.OPEN, false);
            }
        });

        $catalogue.dialog("widget").addClass("flora");
        return true;
    }

    function openCatalogue() {
        if (!$catalogue) {
            if (!initCatalogue()) return;
        }

        if (!$catalogue.dialog("isOpen")) {
            $catalogue.dialog("open");
        } else {
            try {
                $catalogue.dialog("moveToTop");
            } catch (e) {}
        }

        renderCatalogueGrid();
    }


    // =========================================================================
    // INITIALIZATION & REGISTRATION
    // =========================================================================

    function initCatalogue() {
        if (catalogueInitialized) return true;

        if (!window.jQuery || !jQuery.fn || typeof jQuery.fn.dialog !== "function") {
            return false;
        }

        injectCatalogueStyles();

        if (!createCatalogueDialog()) return false;

        if (!resizeBound) {
            resizeBound = true;
            window.addEventListener("resize", () => {
                if ($catalogue &&$catalogue.dialog("isOpen")) {
                    clampCatalogue();
                    saveCatalogueGeometry();
                }
            });
        }

        catalogueInitialized = true;

        if (loadJSON(STORAGE.OPEN, false)) {
            setTimeout(openCatalogue, 100);
        }

        console.log("IKnights Catalogue module loaded.");
        return true;
    }

    IKTools.registerTool({
        id: "catalogue",
        name: "Catalogue",
        description: "Searchable item & gear catalogue",
        order: 20,
        init: initCatalogue,
        open: openCatalogue
    });

})();
