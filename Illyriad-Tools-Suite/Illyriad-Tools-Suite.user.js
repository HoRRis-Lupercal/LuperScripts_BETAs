// ==UserScript==
// @name         Illyriad Tools Suite
// @namespace    Developed by IKnights, modified by HoRRis
// @version      0.2.24
// @description  Unified Illyriad tools suite.
// @author       IKnights and HoRRis
//
// @match        https://elgea.illyriad.co.uk/*
// @match        http://elgea.illyriad.co.uk/*
//
// @require      https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/Illyriad-Tools-Suite/Core/IKTools-Core.js
// @require      https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/Illyriad-Tools-Suite/Tools/IKQuartermaster.js
// @require      https://raw.githubusercontent.com/HoRRis-Lupercal/LuperScripts_BETAs/refs/heads/main/Illyriad-Tools-Suite/Tools/LuperCat/CatalogueData.js
// @require      https://raw.githubusercontent.com/HoRRis-Lupercal/LuperScripts_BETAs/refs/heads/main/Illyriad-Tools-Suite/Tools/LuperCat/LuperLists.js
// @require      https://raw.githubusercontent.com/HoRRis-Lupercal/LuperScripts_BETAs/refs/heads/main/Illyriad-Tools-Suite/Tools/LuperTweaks/LuperStyles.js
// @require      https://raw.githubusercontent.com/HoRRis-Lupercal/LuperScripts_BETAs/refs/heads/main/Illyriad-Tools-Suite/Tools/LuperTweaks/LuperTweaks.js
//
// @updateURL    https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/Illyriad-Tools-Suite/Illyriad-Tools-Suite.user.js
// @downloadURL  https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/Illyriad-Tools-Suite/Illyriad-Tools-Suite.user.js
//
// @grant        none
// @run-at       document-idle
// @license      IKnights Non-Commercial
// ==/UserScript==


(function () {
    "use strict";

    if (
        !window.IKTools ||
        typeof window.IKTools.init !== "function"
    ) {
        console.error(
            "IKnights Tools Suite could not start because the core module failed to load."
        );

        return;
    }

    window.IKTools.init();

})();
