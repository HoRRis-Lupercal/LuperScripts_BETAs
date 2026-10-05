/*
 * IKnights Tools Suite - Core
 * Copyright (c) 2026 IKnights
 * Licensed under the IKnights Non-Commercial License
 */

(function () {
    "use strict";

    if (window.__IKTOOLS_CORE_LOADED__) {
        return;
    }

    window.__IKTOOLS_CORE_LOADED__ = true;


    // =========================================================================
    // CORE STATE
    // =========================================================================

    let toolsTabSelected = false;
    let notesTabSelected = false;
    let coreInitialized = false;
    let coreStarting = false;

    // LuperNotes States
    let notesGlobalMode = false;
    let currentNotesTown = null;
    let notesSyncInterval = null;

    const initializedTools = new Set();

    let nativeButtonWidth = 158;
    let nativeButtonHeight = 35;
    let nativeFallbackSkin = null;


    // =========================================================================
    // GLOBAL SUITE OBJECT
    // =========================================================================

    const IKTools =
        window.IKTools =
        window.IKTools || {};

    IKTools.tools =
        IKTools.tools || {};


    // =========================================================================
    // SHARED UTILITIES
    // =========================================================================

    function wait(ms) {
        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }


    function loadJSON(
        key,
        fallback
    ) {
        try {
            const raw =
                localStorage.getItem(
                    key
                );

            if (!raw) {
                return fallback;
            }

            return JSON.parse(
                raw
            );

        } catch (error) {
            console.warn(
                "IKnights Tools could not read:",
                key,
                error
            );

            return fallback;
        }
    }


    function saveJSON(
        key,
        value
    ) {
        localStorage.setItem(
            key,
            JSON.stringify(
                value
            )
        );
    }


    function parseHumanNumber(
        value
    ) {
        if (
            typeof value ===
            "number"
        ) {
            return Math.max(
                0,
                Math.floor(
                    value
                )
            );
        }

        let text =
            String(value || "")
                .trim()
                .toLowerCase()
                .replace(
                    /,/g,
                    ""
                )
                .replace(
                    /\s+/g,
                    ""
                );

        if (!text) {
            return 0;
        }

        let multiplier = 1;

        if (
            text.endsWith(
                "bn"
            )
        ) {
            multiplier =
                1000000000;

            text =
                text.slice(
                    0,
                    -2
                );

        } else if (
            text.endsWith(
                "b"
            )
        ) {
            multiplier =
                1000000000;

            text =
                text.slice(
                    0,
                    -1
                );

        } else if (
            text.endsWith(
                "m"
            )
        ) {
            multiplier =
                1000000;

            text =
                text.slice(
                    0,
                    -1
                );

        } else if (
            text.endsWith(
                "k"
            )
        ) {
            multiplier =
                1000;

            text =
                text.slice(
                    0,
                    -1
                );
        }

        const number =
            Number(text);

        if (
            !Number.isFinite(
                number
            )
        ) {
            return 0;
        }

        return Math.max(
            0,
            Math.floor(
                number *
                multiplier
            )
        );
    }


    function formatNumber(
        value
    ) {
        return Math.max(
            0,
            Math.floor(
                Number(value) ||
                0
            )
        ).toLocaleString();
    }


    IKTools.util = {
        wait,
        loadJSON,
        saveJSON,
        parseHumanNumber,
        formatNumber
    };


    // =========================================================================
    // TOOL REGISTRY
    // =========================================================================

    IKTools.registerTool =
        function (tool) {

            if (
                !tool ||
                !tool.id ||
                !tool.name ||
                typeof tool.open !==
                    "function"
            ) {
                console.warn(
                    "IKTools: Invalid tool registration.",
                    tool
                );

                return;
            }

            IKTools.tools[
                tool.id
            ] = tool;

            if (
                coreInitialized
            ) {
                initializeTool(
                    tool
                );

                renderToolsList();
            }
        };


    IKTools.openTool =
        function (id) {

            const tool =
                IKTools.tools[
                    id
                ];

            if (!tool) {
                console.warn(
                    "IKTools: Unknown tool:",
                    id
                );

                return;
            }

            initializeTool(
                tool
            );

            tool.open();
        };


    IKTools.render =
        function () {
            renderToolsList();
        };


    function initializeTool(
        tool
    ) {
        if (
            !tool ||
            initializedTools.has(
                tool.id
            )
        ) {
            return true;
        }

        if (
            typeof tool.init !==
            "function"
        ) {
            initializedTools.add(
                tool.id
            );

            return true;
        }

        try {
            const result =
                tool.init();

            /*
             * A tool can return false if something it needs,
             * such as jQuery UI, is not ready yet.
             *
             * The core will retry later.
             */
            if (
                result === false
            ) {
                return false;
            }

            initializedTools.add(
                tool.id
            );

            return true;

        } catch (error) {
            console.error(
                `IKTools: Failed to initialize ${tool.id}.`,
                error
            );

            return false;
        }
    }


    function initializeRegisteredTools() {
        Object.values(
            IKTools.tools
        ).forEach(
            tool => {
                initializeTool(
                    tool
                );
            }
        );
    }


    // =========================================================================
    // ILLYRIAD BUTTON STYLE
    // =========================================================================

    function absolutizeCssUrls(
        cssText,
        baseUrl
    ) {
        return cssText.replace(
            /url\(\s*(['"]?)(.*?)\1\s*\)/gi,

            function (
                match,
                quote,
                url
            ) {
                if (
                    !url ||
                    /^(?:data:|https?:|\/\/|#)/i
                        .test(
                            url
                        )
                ) {
                    return match;
                }

                try {
                    const absolute =
                        new URL(
                            url,
                            baseUrl ||
                            location.href
                        ).href;

                    return (
                        `url("${absolute}")`
                    );

                } catch (
                    error
                ) {
                    return match;
                }
            }
        );
    }


    function collectSendTradeRules(
        rules,
        baseUrl,
        output
    ) {
        if (!rules) {
            return;
        }

        for (
            const rule of
            Array.from(
                rules
            )
        ) {
            try {
                if (
                    rule.type ===
                        CSSRule.STYLE_RULE &&
                    rule.selectorText &&
                    rule.selectorText.includes(
                        ".sendTrade"
                    )
                ) {
                    const selectors =
                        rule.selectorText
                            .split(",")
                            .map(
                                selector =>
                                    selector.trim()
                            )
                            .filter(
                                selector =>
                                    selector.includes(
                                        ".sendTrade"
                                    )
                            )
                            .map(
                                selector =>
                                    selector.replace(
                                        /\.sendTrade/g,
                                        ".ik-game-button"
                                    )
                            );

                    if (
                        !selectors.length
                    ) {
                        continue;
                    }

                    const declaration =
                        absolutizeCssUrls(
                            rule.style.cssText,
                            baseUrl
                        );

                    output.push(
                        `${selectors.join(", ")} { ${declaration} }`
                    );

                    continue;
                }


                if (
                    rule.cssRules &&
                    rule.type ===
                        CSSRule.MEDIA_RULE
                ) {
                    const nested = [];

                    collectSendTradeRules(
                        rule.cssRules,
                        baseUrl,
                        nested
                    );

                    if (
                        nested.length
                    ) {
                        output.push(
                            `@media ${rule.conditionText} {
                                ${nested.join("\n")}
                            }`
                        );
                    }
                }

            } catch (
                error
            ) {
                /*
                 * Ignore inaccessible or unusual CSS rules.
                 */
            }
        }
    }


    function installNativeButtonCss() {
        document
            .querySelector(
                "#ikNativeButtonCss"
            )
            ?.remove();

        const copiedRules = [];

        for (
            const sheet of
            Array.from(
                document.styleSheets
            )
        ) {
            try {
                collectSendTradeRules(
                    sheet.cssRules,
                    sheet.href ||
                        location.href,
                    copiedRules
                );

            } catch (
                error
            ) {
                /*
                 * Cross-origin stylesheet or inaccessible CSSOM.
                 */
            }
        }


        if (
            copiedRules.length
        ) {
            const style =
                document.createElement(
                    "style"
                );

            style.id =
                "ikNativeButtonCss";

            style.textContent =
                copiedRules.join(
                    "\n"
                );

            document.head.appendChild(
                style
            );
        }

        captureNativeButtonMeasurements();
    }


    function captureNativeButtonMeasurements() {
        let sample =
            document.querySelector(
                'input.sendTrade[value="Send Trade Mission"]'
            );

        let temporary =
            false;


        if (!sample) {
            sample =
                document.createElement(
                    "input"
                );

            sample.type =
                "submit";

            sample.className =
                "sendTrade";

            sample.value =
                "Send Trade Mission";

            sample.style.position =
                "fixed";

            sample.style.left =
                "-10000px";

            sample.style.top =
                "-10000px";

            sample.style.visibility =
                "hidden";

            sample.style.pointerEvents =
                "none";

            document.body.appendChild(
                sample
            );

            temporary =
                true;
        }


        const rect =
            sample.getBoundingClientRect();

        const computed =
            getComputedStyle(
                sample
            );
        
        document.documentElement
            .style
            .setProperty(
                "--ik-native-btn-bg",
                computed.backgroundImage
            );

        const measuredWidth =
            rect.width ||
            parseFloat(
                computed.width
            );

        const measuredHeight =
            rect.height ||
            parseFloat(
                computed.height
            );


        if (
            Number.isFinite(
                measuredWidth
            ) &&
            measuredWidth >
                0
        ) {
            nativeButtonWidth =
                Math.round(
                    measuredWidth
                );
        }


        if (
            Number.isFinite(
                measuredHeight
            ) &&
            measuredHeight >
                0
        ) {
            nativeButtonHeight =
                Math.round(
                    measuredHeight
                );
        }


        nativeFallbackSkin = {
            background:
                computed.background,

            backgroundColor:
                computed.backgroundColor,

            backgroundImage:
                computed.backgroundImage,

            backgroundPosition:
                computed.backgroundPosition,

            backgroundRepeat:
                computed.backgroundRepeat,

            borderTop:
                computed.borderTop,

            borderRight:
                computed.borderRight,

            borderBottom:
                computed.borderBottom,

            borderLeft:
                computed.borderLeft,

            boxShadow:
                computed.boxShadow,

            color:
                computed.color,

            fontFamily:
                computed.fontFamily,

            fontSize:
                computed.fontSize,

            fontWeight:
                computed.fontWeight,

            lineHeight:
                computed.lineHeight,

            textAlign:
                computed.textAlign,

            textShadow:
                computed.textShadow,

            paddingTop:
                computed.paddingTop,

            paddingRight:
                computed.paddingRight,

            paddingBottom:
                computed.paddingBottom,

            paddingLeft:
                computed.paddingLeft,

            cursor:
                computed.cursor
        };


        document.documentElement
            .style
            .setProperty(
                "--ik-native-button-width",
                `${nativeButtonWidth}px`
            );


        document.documentElement
            .style
            .setProperty(
                "--ik-native-button-height",
                `${nativeButtonHeight}px`
            );


        if (
            temporary
        ) {
            sample.remove();
        }


        applyFallbackSkinIfNeeded();
    }


    function applyFallbackSkinIfNeeded() {
        if (
            document.querySelector(
                "#ikNativeButtonCss"
            ) ||
            !nativeFallbackSkin
        ) {
            return;
        }

        document
            .querySelectorAll(
                ".ik-game-button"
            )
            .forEach(
                button => {
                    Object.assign(
                        button.style,
                        nativeFallbackSkin
                    );
                }
            );
    }


    IKTools.ui =
        IKTools.ui || {};

    IKTools.ui.refreshNativeButtons =
        function () {
            installNativeButtonCss();
            applyFallbackSkinIfNeeded();
        };


    // =========================================================================
    // CORE CSS
    // =========================================================================

    function injectCoreStyles() {
        if (
            document.querySelector(
                "#ikToolsCoreStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "ikToolsCoreStyles";

        style.textContent = `

            /* =============================================================
               SAFE ILLYRIAD-STYLE BUTTON
               ============================================================= */

            .ik-game-button {
                box-sizing: border-box !important;

                width:
                    var(
                        --ik-native-button-width,
                        158px
                    ) !important;

                min-width:
                    var(
                        --ik-native-button-width,
                        158px
                    ) !important;

                max-width:
                    var(
                        --ik-native-button-width,
                        158px
                    ) !important;

                height:
                    var(
                        --ik-native-button-height,
                        35px
                    ) !important;

                min-height:
                    var(
                        --ik-native-button-height,
                        35px
                    ) !important;

                max-height:
                    var(
                        --ik-native-button-height,
                        35px
                    ) !important;

                flex:
                    0 0
                    var(
                        --ik-native-button-width,
                        158px
                    ) !important;

                float: none !important;
                margin: 0 !important;
            }


            /* =============================================================
               TOOLS PANEL
               ============================================================= */

            #ikToolsPanel {
                width: calc(100% - 2px) !important;
                box-sizing: border-box;
                padding: 6px;
            }

            #ikToolsList {
                height: 120px;
                overflow-y: auto;
                box-sizing: border-box;
                padding-top: 4px;
            }

            #ikToolsList .iktools-launch-button {
                display: block !important;
                margin: 5px auto !important;
            }

            #ikToolsList .iktools-empty {
                text-align: center;
                font-style: italic;
                padding-top: 15px;
            }
            /* =============================================================
               TAB LAYOUT (1/3 SPLIT)
               ============================================================= */
            
            #FriendsBtn, #NotesBtn, #CommunitiesBtn {
                width: calc((100% - 10px) / 3) !important;
                float: left !important;
                box-sizing: border-box !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                text-align: center !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                
                position: relative !important;
                left: auto !important;
                right: auto !important;
                margin: 0 !important;
                display: block !important;
                
                border-left: 1px solid #c9a471 !important;
                border-right: none !important;
            }
            #FriendsBtn { 
                border-left: none !important; 
                margin-left: 6px !important; /* Pads inward from left border */
            }
            #CommunitiesBtn {
                margin-right: 6px !important; /* Pads inward from right border */
            }

            /* =============================================================
               TAB PANELS (FULL HEIGHT FIX)
               ============================================================= */
               
            #FriendsTab, #NotesTab, #CommunitiesTab {
                position: absolute !important;
                top: 25px !important; 
                bottom: 0 !important; 
                left: 0 !important;
                right: 0 !important;
                width: 100% !important;
                height: auto !important;
                overflow-x: hidden !important;
            }

            /* =============================================================
               NOTES PANEL
               ============================================================= */
               
            #ikNotesPanel {
                display: flex;
                flex-direction: column;
                width: calc(100% - 2px) !important;
                margin-left: 2px !important; 
                height: 100%; /* Fixes the squashed panel */
                box-sizing: border-box;
                padding: 1px;
            }
            #ikNotesHeader {
                text-align: center;
                font-weight: bold;
                font-size: 11px;
                padding: 4px;
                margin-bottom: 2px;
                flex-shrink: 0;
            }
            #cityNotesTitleLabel.selected {
                background: transparent !important; /* Prevents native tab backgrounds from appearing here */
                border: none !important;
            }
            #ikNotesDisplay, #ikNotesTextarea {
                flex: 1 1 auto;
                padding: 4px;
                font-family: monospace;
                font-size: 10.5px;
                line-height: 1.35;
                box-sizing: border-box;
                width: 100%;
                overflow-y: auto;
                background: transparent;
                border: none;
            }
            #ikNotesDisplay {
                white-space: pre-wrap;
                word-break: break-word;
            }
            #ikNotesTextarea {
                resize: none;
                display: none;
                border: 1px inset rgba(0,0,0,0.2);
            }
            #ikNotesFooter {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-between !important;
                gap: 4px !important;
                padding-top: 4px !important;
                flex-shrink: 0 !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            
            #ikNotesFooter .ik-game-button {
                flex: 0 0 calc(50% - 2px) !important; 
                width: calc(50% - 2px) !important;
                min-width: 0 !important;
                max-width: none !important;
                height: 28px !important;
                min-height: 28px !important;
                max-height: 28px !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                overflow: hidden !important;
                
                /* Uses Illyriad's native sprite sheet without squishing side borders */
                background-image: var(--ik-native-btn-bg) !important;
                background-size: auto 200% !important;
                background-position: center top !important;
                background-repeat: no-repeat !important;
                
                border: none !important;
                background-color: transparent !important;
                color: #ffffff !important;
                font-size: 11px !important;
                font-weight: bold !important;
                padding: 0 !important;
                text-shadow: 1px 1px 1px rgba(0,0,0,0.8) !important;
            }

        `;

        document.head.appendChild(
            style
        );
    }

    // =========================================================================
    // LUPERNOTES FUNCTIONALITY
    // =========================================================================

    function cleanTownName(rawName) {
        if (!rawName) return '';
        return rawName.replace(/[\(\[\{]\s*Capital\s*[\)\]\}]/gi, '').replace(/^(Capital)\s*[-:]?\s*/gi, '').replace(/\s*-\s*.*$/, '').replace(/^[\s-:]+|[\s-:]+$/g, '').trim() || rawName;
    }

    function getActiveTownId() {
        try { if (window.Illyriad && window.Illyriad.Town && window.Illyriad.Town.CurrentTownID) return String(window.Illyriad.Town.CurrentTownID); } catch(e) {}
        const el = document.querySelector('#ddlTowns, select[name="towns"], #townSelect, #currentTown, .town-select, #ddlTown');
        if (el && el.tagName === 'SELECT' && el.value) return String(el.value);
        if (el && el.textContent) return el.textContent.trim();
        const opt = document.querySelector('select option:checked');
        return (opt && opt.value) ? String(opt.value) : 'default_city';
    }

    function getActiveTownName() {
        let rawName = '';
        try { if (window.Illyriad && window.Illyriad.Town && window.Illyriad.Town.CurrentTownName) rawName = window.Illyriad.Town.CurrentTownName; } catch(e) {}
        if (!rawName) {
            const el = document.querySelector('#ddlTowns, select[name="towns"], #townSelect, #currentTown, .town-select, #ddlTown');
            if (el && el.tagName === 'SELECT' && el.selectedIndex >= 0) rawName = el.options[el.selectedIndex].text.trim();
            else if (el && el.textContent) rawName = el.textContent.trim();
        }
        if (!rawName) {
            const opt = document.querySelector('select option:checked');
            if (opt && opt.text) rawName = opt.text.trim();
        }
        return cleanTownName(rawName || getActiveTownId());
    }

    function getNotesStorageKey() {
        return notesGlobalMode ? 'ikNotes_global' : ('ikNotes_' + getActiveTownId());
    }

    function renderClickableText(text) {
        if (!text || !text.trim()) {
            const emptyLabel = notesGlobalMode ? 'No global notes yet.' : 'No city notes yet.';
            return `<span style="font-style: italic; opacity: 0.7;">${emptyLabel} Click "Edit" to add notes.</span>`;
        }
        
        let cleanText = text.replace(/!TextColour\(([^)]+)\)/gi, '')
                            .replace(/!UITextColour\(([^)]+)\)/gi, '')
                            .replace(/!UIButtonColour\(([^)]+)\)/gi, '')
                            .replace(/!UIBodyColour\(([^)]+)\)/gi, '')
                            .replace(/!UIBorderColour\(([^)]+)\)/gi, '')
                            .replace(/!UIHeaderColour\(([^)]+)\)/gi, '');
                            
        let escaped = cleanText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        let linkRegex = /\[([^\]]+)\]\(([^)]+)\)(?:\{([^}]+)\})?|((?:https?:\/\/|www\.)[^\s<]+)/gi;
        
        let processed = escaped.replace(linkRegex, (match, label, mdUrl, hexColor, bareUrl) => {
            let href = mdUrl ? mdUrl.trim() : bareUrl.trim();
            let displayText = label || bareUrl;
            let finalColor = hexColor ? hexColor.trim() : '#3479c6';
            if (!href.startsWith('http') && !href.startsWith('/')) href = 'https://' + href;
            return `<a href="${href}" target="_top" style="color: ${finalColor}; text-decoration: underline;" onclick="event.stopPropagation();">${displayText}</a>`;
        });
        
        processed = processed.replace(/&lt;fs\(([^)]+)\)&gt;/gi, (match, size) => {
            let cleanSize = size.trim().replace(/[^a-zA-Z0-9.%]/g, '');
            if (/^\d+(\.\d+)?$/.test(cleanSize)) cleanSize += 'px';
            return `<span style="font-size: ${cleanSize};">`;
        });
        
        processed = processed.replace(/&lt;\/fs(?:\([^)]+\))?&gt;/gi, '</span>');
        processed = processed.replace(/&lt;(\/?[bui])&gt;/gi, '<$1>');
        
        let defaultTextColor = '';
        const colorMatch = text.match(/!TextColour\(([^)]+)\)/i);
        if (colorMatch && colorMatch[1]) defaultTextColor = colorMatch[1].trim();

        if (defaultTextColor) {
            return `<span style="color: ${defaultTextColor};">${processed}</span>`;
        }
        return `<span>${processed}</span>`;
    }

    function applyCustomUITheme(text) {
        const uiTextColor = (text.match(/!UITextColour\(([^)]+)\)/i) || [])[1] || '';
        const uiHeaderBg = (text.match(/!UIHeaderColour\(([^)]+)\)/i) || [])[1] || '';
        const uiBodyBg = (text.match(/!UIBodyColour\(([^)]+)\)/i) || [])[1] || '';
        const uiBtnBg = (text.match(/!UIButtonColour\(([^)]+)\)/i) || [])[1] || '';
        const uiBorderColor = (text.match(/!UIBorderColour\(([^)]+)\)/i) || [])[1] || '';

        const panel = document.querySelector('#ikNotesPanel');
        const header = document.querySelector('#ikNotesHeader');
        const title = document.querySelector('#cityNotesTitleLabel');
        const display = document.querySelector('#ikNotesDisplay');
        const textarea = document.querySelector('#ikNotesTextarea');
        
        // Ensure this specifically queries the footer buttons to avoid class mismatches
        const buttons = document.querySelectorAll('#ikNotesFooter .ik-game-button');

        if(panel) { panel.style.backgroundColor = uiBorderColor; panel.style.borderColor = uiBorderColor; }
        if(header) { header.style.backgroundColor = uiHeaderBg; header.style.borderColor = uiBorderColor; }
        if(title) { title.style.color = uiTextColor; }
        if(display) { display.style.backgroundColor = uiBodyBg; display.style.borderColor = uiBorderColor; }
        if(textarea) { 
            textarea.style.backgroundColor = uiBodyBg; 
            textarea.style.borderColor = uiBorderColor; 
            textarea.style.color = (text.match(/!TextColour\(([^)]+)\)/i) || [])[1] || ''; 
        }
        buttons.forEach(btn => {
            btn.style.backgroundColor = uiBtnBg;
            btn.style.color = uiTextColor;
            btn.style.borderColor = uiBorderColor;
        });
    }

    function updateNotesDisplay() {
        const displayDiv = document.querySelector('#ikNotesDisplay');
        if (!displayDiv) return;
        const savedText = localStorage.getItem(getNotesStorageKey()) || '';
        displayDiv.innerHTML = renderClickableText(savedText);
        applyCustomUITheme(savedText);
    }
    
    function checkAndSyncTownNotes() {
        const activeTownId = getActiveTownId();
        const activeTownName = getActiveTownName();
        const titleLabel = document.querySelector('#cityNotesTitleLabel');
        
        if (activeTownId !== currentNotesTown) {
            currentNotesTown = activeTownId;
            if (!notesGlobalMode) {
                const savedText = localStorage.getItem(getNotesStorageKey()) || '';
                const textarea = document.querySelector('#ikNotesTextarea');
                if (textarea && textarea.style.display !== 'none') {
                    textarea.value = savedText;
                }
                updateNotesDisplay();
            }
        }
        if (titleLabel) {
            const expectedTitle = notesGlobalMode ? 'Global Notes' : ('City Notes (' + activeTownName + ')');
            if (titleLabel.textContent !== expectedTitle) titleLabel.textContent = expectedTitle;
        }
    }

    // =========================================================================
    // TOOLS & NOTES TABS
    // =========================================================================

    function showNotesTab() {
        const friendsBtn =
            document.querySelector(
                "#FriendsBtn"
            );

        const toolsBtn =
            document.querySelector(
                "#CommunitiesBtn"
            );

        const notesBtn =
            document.querySelector(
                "#NotesBtn"
            );

        const friendsTab =
            document.querySelector(
                "#FriendsTab"
            );

        const toolsTab =
            document.querySelector(
                "#CommunitiesTab"
            );

        const notesTab =
            document.querySelector(
                "#NotesTab"
            );


        if (
            !friendsBtn ||
            !toolsBtn ||
            !notesBtn ||
            !friendsTab ||
            !toolsTab ||
            !notesTab
        ) {
            return;
        }


        friendsBtn.classList.remove(
            "selected"
        );

        toolsBtn.classList.remove(
            "selected"
        );

        notesBtn.classList.add(
            "selected"
        );


        friendsTab.style.display =
            "none";

        toolsTab.style.display =
            "none";

        notesTab.style.display =
            "block";


        toolsTabSelected =
            false;

        notesTabSelected =
            true;
    }


    function showToolsTab() {
        const friendsBtn =
            document.querySelector(
                "#FriendsBtn"
            );

        const toolsBtn =
            document.querySelector(
                "#CommunitiesBtn"
            );

        const notesBtn =
            document.querySelector(
                "#NotesBtn"
            );

        const friendsTab =
            document.querySelector(
                "#FriendsTab"
            );

        const toolsTab =
            document.querySelector(
                "#CommunitiesTab"
            );

        const notesTab =
            document.querySelector(
                "#NotesTab"
            );


        if (
            !friendsBtn ||
            !toolsBtn ||
            !friendsTab ||
            !toolsTab
        ) {
            return;
        }


        friendsBtn.classList.remove(
            "selected"
        );

        if (notesBtn) {
            notesBtn.classList.remove(
                "selected"
            );
        }

        toolsBtn.classList.add(
            "selected"
        );


        friendsTab.style.display =
            "none";

        if (notesTab) {
            notesTab.style.display =
                "none";
        }

        toolsTab.style.display =
            "block";


        toolsTabSelected =
            true;

        notesTabSelected =
            false;


        renderToolsList();
    }


    function showFriendsTab() {
        const friendsBtn =
            document.querySelector(
                "#FriendsBtn"
            );

        const toolsBtn =
            document.querySelector(
                "#CommunitiesBtn"
            );

        const notesBtn =
            document.querySelector(
                "#NotesBtn"
            );

        const friendsTab =
            document.querySelector(
                "#FriendsTab"
            );

        const toolsTab =
            document.querySelector(
                "#CommunitiesTab"
            );

        const notesTab =
            document.querySelector(
                "#NotesTab"
            );


        if (
            !friendsBtn ||
            !toolsBtn ||
            !friendsTab ||
            !toolsTab
        ) {
            return;
        }


        toolsBtn.classList.remove(
            "selected"
        );

        if (notesBtn) {
            notesBtn.classList.remove(
                "selected"
            );
        }

        friendsBtn.classList.add(
            "selected"
        );


        toolsTab.style.display =
            "none";

        if (notesTab) {
            notesTab.style.display =
                "none";
        }

        friendsTab.style.display =
            "block";


        toolsTabSelected =
            false;

        notesTabSelected =
            false;
    }


    function bindToolsTabs() {
        const friendsBtn =
            document.querySelector(
                "#FriendsBtn"
            );

        const toolsBtn =
            document.querySelector(
                "#CommunitiesBtn"
            );

        const notesBtn =
            document.querySelector(
                "#NotesBtn"
            );


        if (
            !friendsBtn ||
            !toolsBtn
        ) {
            return;
        }


        if (
            toolsBtn.dataset
                .ikToolsBound !==
            "1"
        ) {
            toolsBtn.dataset
                .ikToolsBound =
                "1";

            toolsBtn.addEventListener(
                "click",

                event => {
                    event.preventDefault();

                    event.stopImmediatePropagation();

                    showToolsTab();
                },

                true
            );
        }


        if (
            notesBtn &&
            notesBtn.dataset
                .ikToolsBound !==
            "1"
        ) {
            notesBtn.dataset
                .ikToolsBound =
                "1";

            notesBtn.addEventListener(
                "click",

                event => {
                    event.preventDefault();

                    event.stopImmediatePropagation();

                    showNotesTab();
                },

                true
            );
        }


        if (
            friendsBtn.dataset
                .ikToolsBound !==
            "1"
        ) {
            friendsBtn.dataset
                .ikToolsBound =
                "1";

            friendsBtn.addEventListener(
                "click",

                event => {
                    if (
                        !toolsTabSelected &&
                        !notesTabSelected
                    ) {
                        return;
                    }

                    event.preventDefault();

                    event.stopImmediatePropagation();

                    showFriendsTab();
                },

                true
            );
        }
    }


    function renderToolsList() {
        const list =
            document.querySelector(
                "#ikToolsList"
            );

        if (!list) {
            return;
        }


        list.innerHTML =
            "";


        const tools =
            Object.values(
                IKTools.tools
            )
                .sort(
                    (
                        a,
                        b
                    ) => {

                        const orderA =
                            Number(
                                a.order ??
                                999
                            );

                        const orderB =
                            Number(
                                b.order ??
                                999
                            );


                        if (
                            orderA !==
                            orderB
                        ) {
                            return (
                                orderA -
                                orderB
                            );
                        }


                        return (
                            a.name.localeCompare(
                                b.name
                            )
                        );
                    }
                );


        if (
            !tools.length
        ) {
            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "iktools-empty";

            empty.textContent =
                "No tools loaded.";

            list.appendChild(
                empty
            );

            return;
        }


        tools.forEach(
            tool => {

                const button =
                    document.createElement(
                        "input"
                    );

                button.type =
                    "button";

                button.className =
                    "ik-game-button iktools-launch-button";

                button.value =
                    tool.name;

                button.title =
                    tool.description ||
                    tool.name;


                button.addEventListener(
                    "click",
                    () => {
                        IKTools.openTool(
                            tool.id
                        );
                    }
                );


                list.appendChild(
                    button
                );
            }
        );


        applyFallbackSkinIfNeeded();
    }


    function ensureToolsPanel() {
        const dock =
            document.querySelector(
                "#DockedFriends"
            );

        const friendsBtn =
            document.querySelector(
                "#FriendsBtn"
            );

        const toolsBtn =
            document.querySelector(
                "#CommunitiesBtn"
            );

        const friendsTab =
            document.querySelector(
                "#FriendsTab"
            );

        const toolsTab =
            document.querySelector(
                "#CommunitiesTab"
            );


        if (
            !dock ||
            !friendsBtn ||
            !toolsBtn ||
            !friendsTab ||
            !toolsTab
        ) {
            return false;
        }


        toolsBtn.textContent =
            "Tools";

        toolsBtn.style.cursor =
            "pointer";

        toolsBtn.title =
            "Tools";


        if (
            !document.querySelector(
                "#NotesBtn"
            )
        ) {
            const notesBtn =
                toolsBtn.cloneNode(
                    true
                );

            notesBtn.id =
                "NotesBtn";

            notesBtn.textContent =
                "Notes";

            notesBtn.title =
                "Notes";

            notesBtn.classList.remove(
                "selected"
            );

            toolsBtn.parentNode.insertBefore(notesBtn, toolsBtn);
        }


        if (
            toolsTab.dataset
                .ikToolsOwned !==
                "1" ||
            !toolsTab.querySelector(
                "#ikToolsList"
            )
        ) {
            toolsTab.dataset
                .ikToolsOwned =
                "1";

            toolsTab.innerHTML = `
                <div id="ikToolsPanel">
                    <div id="ikToolsList"></div>
                </div>
            `;

            toolsTab.style.width =
                "245px";

            toolsTab.style.overflow =
                "hidden";
        }


        if (!document.querySelector("#NotesTab")) {
            const notesTab = toolsTab.cloneNode(false);
            notesTab.id = "NotesTab";
            
        // Build the LuperNotes structured UI
            notesTab.innerHTML = `
                <div id="ikNotesPanel">
                    <div id="ikNotesHeader">
                        <span id="cityNotesTitleLabel" class="selected">City Notes</span>
                    </div>
                    <div id="ikNotesDisplay"></div>
                    <textarea id="ikNotesTextarea" placeholder="Enter notes here..."></textarea>
                    <div id="ikNotesFooter">
                        <input type="button" id="ikNotesGlobalBtn" class="ik-game-button" value="Global" />
                        <input type="button" id="ikNotesEditBtn" class="ik-game-button" value="Edit" />
                    </div>
                </div>
            `;
            notesTab.style.display = "none";
            toolsTab.parentNode.appendChild(notesTab);

            // Bind Elements
            const display = notesTab.querySelector('#ikNotesDisplay');
            const textarea = notesTab.querySelector('#ikNotesTextarea');
            const globalBtn = notesTab.querySelector('#ikNotesGlobalBtn');
            const editBtn = notesTab.querySelector('#ikNotesEditBtn');

            // Initialize State
            currentNotesTown = getActiveTownId();
            textarea.value = localStorage.getItem(getNotesStorageKey()) || "";
            updateNotesDisplay();

            // Setup Edit Toggle
            editBtn.addEventListener('click', () => {
                const isEditing = textarea.style.display !== 'none';
                const key = getNotesStorageKey();
                if (isEditing) {
                    localStorage.setItem(key, textarea.value);
                    textarea.style.display = 'none';
                    display.style.display = 'block';
                    editBtn.value = 'Edit';
                    updateNotesDisplay();
                } else {
                    textarea.value = localStorage.getItem(key) || "";
                    display.style.display = 'none';
                    textarea.style.display = 'block';
                    editBtn.value = 'Done';
                    applyCustomUITheme(textarea.value);
                    textarea.focus();
                }
            });

            // Setup Global Mode Toggle
            globalBtn.addEventListener('click', () => {
                if (textarea.style.display !== 'none') {
                    localStorage.setItem(getNotesStorageKey(), textarea.value);
                }
                notesGlobalMode = !notesGlobalMode;
                globalBtn.value = notesGlobalMode ? 'City' : 'Global';
                
                const key = getNotesStorageKey();
                textarea.value = localStorage.getItem(key) || "";
                updateNotesDisplay();
                
                const titleLabel = document.querySelector('#cityNotesTitleLabel');
                if (titleLabel) {
                    titleLabel.textContent = notesGlobalMode ? 'Global Notes' : ('City Notes (' + getActiveTownName() + ')');
                }
            });

            // Auto-Save and UI Update on Type
            textarea.addEventListener('input', event => {
                localStorage.setItem(getNotesStorageKey(), event.target.value);
                applyCustomUITheme(event.target.value);
            });

            // Start background sync for town switching
            if (!notesSyncInterval) {
                notesSyncInterval = setInterval(checkAndSyncTownNotes, 500);
            }
        }


        bindToolsTabs();

        renderToolsList();


        if (
            toolsTabSelected
        ) {
            showToolsTab();

        } else if (
            notesTabSelected
        ) {
            showNotesTab();
        }


        return true;
    }

    // =========================================================================
    // CORE STARTUP
    // =========================================================================

    function initializeCoreNow() {
        if (
            coreInitialized
        ) {
            return true;
        }


        if (
            !document.body ||
            !document.head
        ) {
            return false;
        }


        injectCoreStyles();

        installNativeButtonCss();

        ensureToolsPanel();

        initializeRegisteredTools();

        coreInitialized =
            true;


        setInterval(
            () => {
                ensureToolsPanel();

                initializeRegisteredTools();

                applyFallbackSkinIfNeeded();
            },

            750
        );


        console.log(
            "IKnights Tools Core loaded."
        );


        return true;
    }


    IKTools.init =
        function () {

            if (
                coreInitialized ||
                coreStarting
            ) {
                return;
            }


            coreStarting =
                true;


            let tries =
                0;


            const startup =
                setInterval(
                    () => {

                        tries++;


                        if (
                            initializeCoreNow() ||
                            tries >= 60
                        ) {
                            clearInterval(
                                startup
                            );

                            coreStarting =
                                false;
                        }

                    },

                    500
                );
        };


})();
