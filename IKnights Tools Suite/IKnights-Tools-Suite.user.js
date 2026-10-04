// ==UserScript==
// @name         IKnights Tools Suite
// @namespace    IKnights
// @version      0.12.0
// @description  IKnights' integrated Illyriad tools suite.
// @author       IKnights
//
// @match        https://elgea.illyriad.co.uk/*
// @match        http://elgea.illyriad.co.uk/*
//
// @require      https://raw.githubusercontent.com/lKnights/Illyriad-Userscripts/main/IKnights-Tools-Suite/core/IKTools-Core.js
// @require      https://raw.githubusercontent.com/lKnights/Illyriad-Userscripts/main/IKnights-Tools-Suite/tools/Quartermaster.js
//
// @updateURL    https://raw.githubusercontent.com/lKnights/Illyriad-Userscripts/main/IKnights-Tools-Suite/IKnights-Tools-Suite.user.js
// @downloadURL  https://raw.githubusercontent.com/lKnights/Illyriad-Userscripts/main/IKnights-Tools-Suite/IKnights-Tools-Suite.user.js
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
