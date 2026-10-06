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

    const CATALOGUE_DATA = {
        item: [
            // Add your Item data here
            { name: "Wood", id: "[@c=1]", type: "Basic", x: 1, y: 1, spriteSheet: "itemsbase9" },
            { name: "Clay", id: "[@c=2]", type: "Basic", x: 49, y: 1, spriteSheet: "itemsbase9" }
        ],
        gear: [
            { name: "Draught Horse", id: "[@c=33]", type: "Horses", x: 1, y: 192, spriteSheet: "itemst2" },
            { name: "Heavy Warhorse", id: "[@c=34]", type: "Horses", x: 1, y: 48, spriteSheet: "itemst2" },
            { name: "Nimble Warhorse", id: "[@c=35]", type: "Horses", x: 1, y: 384, spriteSheet: "itemst2" },
            { name: "Riding Horse", id: "[@c=36]", type: "Horses", x: 1, y: 337, spriteSheet: "itemst2" },
            { name: "Steady Warhorse", id: "[@c=37]", type: "Horses", x: 1, y: 289, spriteSheet: "itemst2" },
            { name: "Adventurer's Sword", id: "[@c=40]", type: "Swords", x: 144, y: 1, spriteSheet: "itemst2" }
        ],
        unit: [
            // Add your Unit data here
            { name: "Spearman", id: "[@u=1]", type: "Spear", x: 1, y: 1, spriteSheet: "sfb" },
            { name: "Swordsman", id: "[@u=2]", type: "Sword", x: 49, y: 1, spriteSheet: "sfb" }
        ]
    };

    let $catalogue = null;
    let statusClearTimer = null;
    let catalogueInitialized = false;
    let resizeBound = false;
    let activeTooltipItem = null;
    let currentTab = "gear"; // Set default active tab


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
            
            /* Dialog Title Bar Tabs */
            .ikcat-dialog-tabs {
                float: left;
                margin: 2px 16px 0 8px; /* Added 8px left margin to fix clipping */
                display: flex;
                gap: 8px; 
            }

            .ikcat-dialog-tab {
                cursor: pointer;
                color: #4a3311;
                font-size: 13px;
                font-weight: normal;
                padding: 3px 8px; /* Added padding for the background shape */
                border-radius: 3px;
                opacity: 0.7;
                transition: opacity 0.2s, color 0.2s, background-color 0.2s;
            }

            .ikcat-dialog-tab:hover {
                opacity: 1;
                color: #8b1111;
            }

            .ikcat-dialog-tab.active {
                opacity: 1;
                color: #b22222;
                background-color: #fffbe8 !important; /* Tan background to match chat headers */
                font-weight: bold;
            }

            /* Core Dialog Flex Layout - Fixed for jQuery UI Resizing */
            #ikCatalogue {
                box-sizing: border-box !important;
                display: flex !important; /* Force flex directly on the dialog wrapper */
                flex-direction: column !important;
                overflow: hidden !important;
                padding: 8px !important;
            }

            #ikCatalogue .ikcat-controls {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
                align-items: center;
                flex-shrink: 0; /* Prevents controls from collapsing */
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
                flex: 1 1 0px !important; /* Critical fix: forces dynamic scale filling during resize */
                min-height: 0 !important; /* Critical fix: prevents permanent shrinkage */
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

            /* Tooltip Copy Button Styling - Let Illyriad handle the button, just fix the text color */
            #WzTtDiV #ikCatCopyBtn {
                color: #ffffff !important; /* Force text to white, overriding tooltip brown */
                margin: 4px auto !important;
                cursor: pointer !important;
            }
            
            #WzTtDiV #ikCatCopyBtn.ikcat-copied {
                color: #a4ff99 !important; /* Light green to stand out against the default red button */
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

        const activeData = CATALOGUE_DATA[currentTab] || [];
        const types = Array.from(new Set(activeData.map(item => item.type))).sort();
        
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

        const activeData = CATALOGUE_DATA[currentTab] || [];
        const filtered = activeData.filter(item => {
            const matchesSearch = !query || 
                item.name.toLowerCase().includes(query) || 
                item.id.toLowerCase().includes(query);
            const matchesType = !selectedType || item.type === selectedType;
            return matchesSearch && matchesType;
        });

        filtered.forEach(item => {
            const sheetInfo = SPRITE_SHEETS[item.spriteSheet] || SPRITE_SHEETS.default;
            const numId = item.id.match(/\d+/)[0];

            const card = document.createElement("div");
            card.className = "ikcat-card";
            card.title = `${item.name} (${item.type})\nClick to view details & copy`;

            const icon = document.createElement("div");
            icon.className = "ikcat-icon";
            icon.style.backgroundImage = `url("${sheetInfo.url}")`;
            icon.style.backgroundPosition = `-${item.x}px -${item.y}px`;

            card.appendChild(icon);

            // Handle the click logic to trigger the game's native popup engine
            card.addEventListener("click", (e) => {
                e.stopPropagation(); 
                closeActiveTooltip(); 
                activeTooltipItem = item;
                
                // Call the game's native data extractor and popup generator directly
                if (typeof window.ExtractData === "function") {
                    try {
                        const gameData = window.ExtractData("c=" + numId);
                        if (gameData && gameData.popup) {
                            gameData.popup({ data: gameData });
                        }
                    } catch (err) {
                        console.error("IKTools: Native popup failed to generate", err);
                    }
                }
            });
            grid.appendChild(card);
        });

        if (countDisplay) {
            countDisplay.textContent = `Showing ${filtered.length} / ${activeData.length}`;
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
        const tabs = content.querySelectorAll(".ikcat-tab");

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
            type: document.querySelector("#ikCatTypeSelect")?.value || "",
            tab: currentTab
        };
        saveJSON(STORAGE.SETTINGS, state);
    }

    function restoreSettings() {
        const state = loadJSON(STORAGE.SETTINGS, null);
        
        if (state && state.tab) {
            currentTab = state.tab;
        }

        // Apply active class to the correct title bar tab
        if ($catalogue) {
            const widget = $catalogue.dialog("widget");
            const tabs = widget.find(".ikcat-dialog-tab");
            if (tabs.length) {
                tabs.removeClass("active");
                tabs.filter(`[data-tab='${currentTab}']`).addClass("active");
            }
        }

        if (!state) return; // Exit if no state saved for search/dropdown

        const searchInput = document.querySelector("#ikCatSearch");
        const typeSelect = document.querySelector("#ikCatTypeSelect");
        
        if (searchInput && state.search !== undefined) searchInput.value = state.search;
        populateTypeDropdown(); 
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
            title: "Catalogue", // Keep for screen readers/internals
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

        const widget = $catalogue.dialog("widget");
        widget.addClass("flora");

        // --- NEW TITLE BAR INJECTION ---
        const titleBar = widget.find(".ui-dialog-titlebar");
        titleBar.find(".ui-dialog-title").hide(); // Hide the default "Catalogue" text

        if (!titleBar.find(".ikcat-dialog-tabs").length) {
            const tabsHtml = `
                <div class="ikcat-dialog-tabs">
                    <span class="ikcat-dialog-tab" data-tab="gear">Gear Catalogue</span>
                    <span class="ikcat-dialog-tab" data-tab="item">Item Catalogue</span>
                    <span class="ikcat-dialog-tab" data-tab="unit">Unit Catalogue</span>
                </div>
            `;
            titleBar.prepend(tabsHtml);

            // Bind click events directly on the new title tabs
            titleBar.find(".ikcat-dialog-tab").on("click", function(e) {
                const clickedTab = e.target.dataset.tab;
                if (currentTab === clickedTab) return;

                titleBar.find(".ikcat-dialog-tab").removeClass("active");
                jQuery(this).addClass("active");
                currentTab = clickedTab;
                
                const searchInput = document.querySelector("#ikCatSearch");
                if (searchInput) searchInput.value = ""; 
                
                populateTypeDropdown();
                renderCatalogueGrid();
                saveSettings();
            });
        }

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
    // CUSTOM TOOLTIPs
    // =========================================================================

    function injectCopyButtonIntoTooltip() {
        if (document.getElementById("ikTooltipObserver")) return;
        const marker = document.createElement("div");
        marker.id = "ikTooltipObserver";
        document.body.appendChild(marker);

        // Watch the DOM for changes to the wz_tooltip container
        const observer = new MutationObserver(() => {
            const wz = document.getElementById("WzTtDiV");
            
            // Check if tooltip is currently visible, we have an active item, and our button isn't there
            if (wz && wz.style.visibility === "visible" && activeTooltipItem && !document.getElementById("ikCatCopyBtn")) {
                const popupBody = document.getElementById("WzBoDyI");

            if (popupBody) {
                    const middleSection = popupBody.querySelector(".m");
                    const targetContainer = middleSection || popupBody;

                    const btnContainer = document.createElement("div");
                    btnContainer.style.cssText = "text-align: center; margin-top: 6px; margin-bottom: 4px; padding-bottom: 4px;";
                    
                    const btn = document.createElement("button"); 
                    btn.id = "ikCatCopyBtn";
                    btn.textContent = `Copy ${activeTooltipItem.id}`;
                    
                    btn.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        try {
                            await navigator.clipboard.writeText(activeTooltipItem.id);
                        } catch(err) {}
                        
                        const chatBox = document.querySelector("#chatInput, #txtChatMessage, input.chatInput");
                        if (chatBox) {
                            chatBox.value += (chatBox.value ? " " : "") + activeTooltipItem.id;
                            chatBox.focus();
                        }
                        
                        btn.textContent = "Copied!";
                        btn.classList.add("ikcat-copied");
                        
                        setTimeout(closeActiveTooltip, 1000);
                    });

                    btnContainer.appendChild(btn);
                    targetContainer.appendChild(btnContainer);
                }

            }
        });

        // CRITICAL: We must watch for attribute modifications because wz_tooltip toggles CSS visibility
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ["style"] 
        });

        // Close the tooltip if the user clicks anywhere else on the screen
        document.addEventListener("click", (e) => {
            const wz = document.getElementById("WzTtDiV");
            if (wz && activeTooltipItem && !wz.contains(e.target)) {
                closeActiveTooltip();
            }
        });
    }

    function closeActiveTooltip() {
        // wz_tooltip's native global hide function
        if (typeof window.tt_Hide === "function") {
            window.tt_Hide();
        } else {
            // Fallback manual hide
            const wz = document.getElementById("WzTtDiV");
            if (wz) wz.style.visibility = "hidden";
        }
        activeTooltipItem = null;
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
        injectCopyButtonIntoTooltip();

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
