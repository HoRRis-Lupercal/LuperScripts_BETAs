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
    let coreInitialized = false;
    let coreStarting = false;

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
                width: 245px;
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

        `;

        document.head.appendChild(
            style
        );
    }


    // =========================================================================
    // TOOLS TAB
    // =========================================================================

    function showToolsTab() {
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

        toolsBtn.classList.add(
            "selected"
        );


        friendsTab.style.display =
            "none";

        toolsTab.style.display =
            "block";


        toolsTabSelected =
            true;


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

        const friendsTab =
            document.querySelector(
                "#FriendsTab"
            );

        const toolsTab =
            document.querySelector(
                "#CommunitiesTab"
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

        friendsBtn.classList.add(
            "selected"
        );


        toolsTab.style.display =
            "none";

        friendsTab.style.display =
            "block";


        toolsTabSelected =
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
                        !toolsTabSelected
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

                /*
                 * Normal button behavior.
                 *
                 * It only LOOKS like an Illyriad button.
                 */
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


        bindToolsTabs();

        renderToolsList();


        if (
            toolsTabSelected
        ) {
            showToolsTab();
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
