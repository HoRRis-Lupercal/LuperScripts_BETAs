// ==UserScript==
// @name         IKnights Tools Suite
// @namespace    IKnights
// @version      0.12.1
// @description  IKnights' integrated Illyriad tools suite.
// @author       IKnights and HoRRis
//
// @match        https://elgea.illyriad.co.uk/*
// @match        http://elgea.illyriad.co.uk/*
//
// @require      https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/IKnights%20Tools%20Suite/Core/IKTools-Core.js
// @require      https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/IKnights%20Tools%20Suite/Tools/Quartermaster.js
// @require      https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/IKnights%20Tools%20Suite/Tools/Catalogue.js
//
// @updateURL    https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/IKnights%20Tools%20Suite/IKnights-Tools-Suite.user.js
// @downloadURL  https://github.com/HoRRis-Lupercal/LuperScripts_BETAs/raw/refs/heads/main/IKnights%20Tools%20Suite/IKnights-Tools-Suite.user.js
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
