// ==UserScript==
// @name         LuperChat V0.7
// @namespace    http://tampermonkey.net/
// @version      20.5
// @description  Searchable image database popup with tooltip support via "Image" button in chat interface.
// @author       You
// @match        https://*.illyriad.co.uk/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. CONFIGURATION (EDIT EVERYTHING HERE)
    // ==========================================
    const CONFIG = {
        // --- MULTIPLE SPRITE SHEETS CONFIGURATION ---
        spriteSheets: {
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
        },

        // --- GEAR DATASET ---
        GEAR_DATA: [
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
            { name: "Orcish Sword", id: "[@c=56]", type: "Swords", x: 96, y: 432, spriteSheet: "itemst2" },
            { name: "Razor-Edged Sword", id: "[@c=57]", type: "Swords", x: 144, y: 97, spriteSheet: "itemst2" },
            { name: "Reinforced Sword", id: "[@c=58]", type: "Swords", x: 144, y: 385, spriteSheet: "itemst2" },
            { name: "Sabre", id: "[@c=59]", type: "Swords", x: 96, y: 721, spriteSheet: "itemst2" },
            { name: "Scimitar", id: "[@c=60]", type: "Swords", x: 96, y: 864, spriteSheet: "itemst2" },
            { name: "Seaxe", id: "[@c=61]", type: "Swords", x: 96, y: 337, spriteSheet: "itemst2" },
            { name: "Short Sword", id: "[@c=62]", type: "Swords", x: 144, y: 337, spriteSheet: "itemst2" },
            { name: "Silversteel Sword", id: "[@c=63]", type: "Swords", x: 96, y: 913, spriteSheet: "itemst2" },
            { name: "Spiked Sword", id: "[@c=64]", type: "Swords", x: 144, y: 480, spriteSheet: "itemst2" },
            { name: "Traditional Sword", id: "[@c=65]", type: "Swords", x: 144, y: 144, spriteSheet: "itemst2" },
            { name: "Arctic Bow", id: "[@c=67]", type: "Bows", x: 336, y: 672, spriteSheet: "itemst2" },
            { name: "Chitin-Cored Bow", id: "[@c=68]", type: "Bows", x: 336, y: 720, spriteSheet: "itemst2" },
            { name: "Desert Bow", id: "[@c=69]", type: "Bows", x: 336, y: 768, spriteSheet: "itemst2" },
            { name: "Ebony Bow", id: "[@c=70]", type: "Bows", x: 336, y: 816, spriteSheet: "itemst2" },
            { name: "Elven Spirit Bow", id: "[@c=71]", type: "Bows", x: 336, y: 864, spriteSheet: "itemst2" },
            { name: "Hero's Bow", id: "[@c=72]", type: "Bows", x: 336, y: 912, spriteSheet: "itemst2" },
            { name: "High-Power Bow", id: "[@c=73]", type: "Bows", x: 336, y: 960, spriteSheet: "itemst2" },
            { name: "Hillsman's Bow", id: "[@c=74]", type: "Bows", x: 336, y: 288, spriteSheet: "itemst2" },
            { name: "Hunter's Bow", id: "[@c=75]", type: "Bows", x: 384, y: 0, spriteSheet: "itemst2" },
            { name: "Composite Bow", id: "[@c=76]", type: "Bows", x: 384, y: 48, spriteSheet: "itemst2" },
            { name: "Jungle Bow", id: "[@c=77]", type: "Bows", x: 384, y: 96, spriteSheet: "itemst2" },
            { name: "Leopard Gut Bow", id: "[@c=78]", type: "Bows", x: 384, y: 144, spriteSheet: "itemst2" },
            { name: "Light Bow", id: "[@c=79]", type: "Bows", x: 384, y: 192, spriteSheet: "itemst2" },
            { name: "Long-Draw Bow", id: "[@c=80]", type: "Bows", x: 384, y: 240, spriteSheet: "itemst2" },
            { name: "Mammoth Tusk Bow", id: "[@c=81]", type: "Bows", x: 384, y: 288, spriteSheet: "itemst2" },
            { name: "Marksman's Bow", id: "[@c=82]", type: "Bows", x: 336, y: 240, spriteSheet: "itemst2" },
            { name: "Mountain Bow", id: "[@c=83]", type: "Bows", x: 336, y: 336, spriteSheet: "itemst2" },
            { name: "Plains Bow", id: "[@c=84]", type: "Bows", x: 336, y: 384, spriteSheet: "itemst2" },
            { name: "Poacher's Bow", id: "[@c=85]", type: "Bows", x: 336, y: 432, spriteSheet: "itemst2" },
            { name: "Rapid-Draw Bow", id: "[@c=86]", type: "Bows", x: 336, y: 480, spriteSheet: "itemst2" },
            { name: "Three-Wood Bow", id: "[@c=87]", type: "Bows", x: 336, y: 528, spriteSheet: "itemst2" },
            { name: "War Bow", id: "[@c=88]", type: "Bows", x: 336, y: 576, spriteSheet: "itemst2" },
            { name: "Woodsman's Bow", id: "[@c=89]", type: "Bows", x: 336, y: 624, spriteSheet: "itemst2" },
            { name: "Arctic Spear", id: "[@c=91]", type: "Spears", x: 192, y: 625, spriteSheet: "itemst2" },
            { name: "Battle Spear", id: "[@c=92]", type: "Spears", x: 192, y: 530, spriteSheet: "itemst2" },
            { name: "Boar Spear", id: "[@c=93]", type: "Spears", x: 192, y: 480, spriteSheet: "itemst2" },
            { name: "Defender's Spear", id: "[@c=94]", type: "Spears", x: 192, y: 432, spriteSheet: "itemst2" },
            { name: "Desert Pike", id: "[@c=95]", type: "Spears", x: 192, y: 385, spriteSheet: "itemst2" },
            { name: "Desert Spear", id: "[@c=96]", type: "Spears", x: 192, y: 337, spriteSheet: "itemst2" },
            { name: "Dragon Spear", id: "[@c=97]", type: "Spears", x: 192, y: 289, spriteSheet: "itemst2" },
            { name: "Duelling Spear", id: "[@c=98]", type: "Spears", x: 192, y: 241, spriteSheet: "itemst2" },
            { name: "Ebony Spear", id: "[@c=99]", type: "Spears", x: 192, y: 193, spriteSheet: "itemst2" },
            { name: "Fang-Barbed Spear", id: "[@c=100]", type: "Spears", x: 192, y: 145, spriteSheet: "itemst2" },
            { name: "Fang-Tipped Spear", id: "[@c=101]", type: "Spears", x: 192, y: 97, spriteSheet: "itemst2" },
            { name: "Forester's Spear", id: "[@c=102]", type: "Spears", x: 192, y: 48, spriteSheet: "itemst2" },
            { name: "Harpoon-Spear", id: "[@c=103]", type: "Spears", x: 192, y: 1, spriteSheet: "itemst2" },
            { name: "Hill-Tribe Spear", id: "[@c=104]", type: "Spears", x: 144, y: 960, spriteSheet: "itemst2" },
            { name: "Iron-Banded Spear", id: "[@c=105]", type: "Spears", x: 192, y: 576, spriteSheet: "itemst2" },
            { name: "Jungle Hunter's Spear", id: "[@c=106]", type: "Spears", x: 144, y: 913, spriteSheet: "itemst2" },
            { name: "Jungle Spear", id: "[@c=107]", type: "Spears", x: 144, y: 864, spriteSheet: "itemst2" },
            { name: "Light Spear", id: "[@c=108]", type: "Spears", x: 144, y: 817, spriteSheet: "itemst2" },
            { name: "Mountain Spear", id: "[@c=109]", type: "Spears", x: 144, y: 768, spriteSheet: "itemst2" },
            { name: "Obsidian-Tipped Spear", id: "[@c=110]", type: "Spears", x: 144, y: 720, spriteSheet: "itemst2" },
            { name: "Pike", id: "[@c=111]", type: "Spears", x: 144, y: 672, spriteSheet: "itemst2" },
            { name: "Plainsman's Spear", id: "[@c=112]", type: "Spears", x: 192, y: 864, spriteSheet: "itemst2" },
            { name: "Razor-Edged Spear", id: "[@c=113]", type: "Spears", x: 192, y: 817, spriteSheet: "itemst2" },
            { name: "Silversteel Spear", id: "[@c=114]", type: "Spears", x: 192, y: 768, spriteSheet: "itemst2" },
            { name: "Trident", id: "[@c=115]", type: "Spears", x: 192, y: 720, spriteSheet: "itemst2" },
            { name: "War Spear", id: "[@c=116]", type: "Spears", x: 192, y: 672, spriteSheet: "itemst2" },
            { name: "Animal-Scale Armour", id: "[@c=120]", type: "Leather", x: 1, y: 480, spriteSheet: "itemst2" },
            { name: "Cloth-Backed Leather", id: "[@c=121]", type: "Leather", x: 1, y: 528, spriteSheet: "itemst2" },
            { name: "Desert Armour", id: "[@c=122]", type: "Leather", x: 1, y: 576, spriteSheet: "itemst2" },
            { name: "Extra Heavy Armour", id: "[@c=123]", type: "Leather", x: 48, y: 336, spriteSheet: "itemst2" },
            { name: "Extra Light Armour", id: "[@c=124]", type: "Leather", x: 48, y: 384, spriteSheet: "itemst2" },
            { name: "Forester's Armour", id: "[@c=125]", type: "Leather", x: 1, y: 624, spriteSheet: "itemst2" },
            { name: "Fur-Lined Armour", id: "[@c=126]", type: "Leather", x: 1, y: 672, spriteSheet: "itemst2" },
            { name: "Hardened Leather", id: "[@c=127]", type: "Leather", x: 1, y: 720, spriteSheet: "itemst2" },
            { name: "Heavy Leather", id: "[@c=128]", type: "Leather", x: 1, y: 768, spriteSheet: "itemst2" },
            { name: "Highland Armour", id: "[@c=129]", type: "Leather", x: 1, y: 816, spriteSheet: "itemst2" },
            { name: "Jungle Armour", id: "[@c=130]", type: "Leather", x: 1, y: 864, spriteSheet: "itemst2" },
            { name: "Light Leather", id: "[@c=131]", type: "Leather", x: 1, y: 912, spriteSheet: "itemst2" },
            { name: "Midnight Armour", id: "[@c=132]", type: "Leather", x: 1, y: 960, spriteSheet: "itemst2" },
            { name: "Over-Padded Armour", id: "[@c=133]", type: "Leather", x: 48, y: 1, spriteSheet: "itemst2" },
            { name: "Plainsman's Armour", id: "[@c=134]", type: "Leather", x: 48, y: 48, spriteSheet: "itemst2" },
            { name: "Reinforced Leather", id: "[@c=135]", type: "Leather", x: 48, y: 96, spriteSheet: "itemst2" },
            { name: "Splintmail", id: "[@c=136]", type: "Leather", x: 48, y: 144, spriteSheet: "itemst2" },
            { name: "Sun-Burnished Armour", id: "[@c=137]", type: "Leather", x: 48, y: 192, spriteSheet: "itemst2" },
            { name: "Upland Armour", id: "[@c=138]", type: "Leather", x: 48, y: 240, spriteSheet: "itemst2" },
            { name: "Vanguard's Armour", id: "[@c=139]", type: "Leather", x: 48, y: 288, spriteSheet: "itemst2" },
            { name: "Cloth-Backed Chainmail", id: "[@c=141]", type: "Chain", x: 432, y: 192, spriteSheet: "itemst2" },
            { name: "Desert Chainmail", id: "[@c=142]", type: "Chain", x: 432, y: 144, spriteSheet: "itemst2" },
            { name: "Double-Weave Chainmail", id: "[@c=143]", type: "Chain", x: 432, y: 96, spriteSheet: "itemst2" },
            { name: "Extra Heavy Chainmail", id: "[@c=144]", type: "Chain", x: 384, y: 432, spriteSheet: "itemst2" },
            { name: "Extra Light Chainmail", id: "[@c=145]", type: "Chain", x: 384, y: 384, spriteSheet: "itemst2" },
            { name: "Fur-Lined Chainmail", id: "[@c=146]", type: "Chain", x: 432, y: 48, spriteSheet: "itemst2" },
            { name: "Heavy Chain Armour", id: "[@c=147]", type: "Chain", x: 384, y: 336, spriteSheet: "itemst2" },
            { name: "Highland Chainmail", id: "[@c=148]", type: "Chain", x: 432, y: 0, spriteSheet: "itemst2" },
            { name: "Hillsman's Chainmail", id: "[@c=149]", type: "Chain", x: 384, y: 960, spriteSheet: "itemst2" },
            { name: "Jungle Chainmail", id: "[@c=150]", type: "Chain", x: 384, y: 912, spriteSheet: "itemst2" },
            { name: "Light Chain Armour", id: "[@c=151]", type: "Chain", x: 384, y: 864, spriteSheet: "itemst2" },
            { name: "Master-Crafted Chainmail", id: "[@c=152]", type: "Chain", x: 384, y: 816, spriteSheet: "itemst2" },
            { name: "Over-Padded Chainmail", id: "[@c=153]", type: "Chain", x: 384, y: 768, spriteSheet: "itemst2" },
            { name: "Plainsman's Chainmail", id: "[@c=154]", type: "Chain", x: 384, y: 720, spriteSheet: "itemst2" },
            { name: "Reinforced Chainmail", id: "[@c=155]", type: "Chain", x: 384, y: 672, spriteSheet: "itemst2" },
            { name: "Silversteel Chainmail", id: "[@c=156]", type: "Chain", x: 384, y: 624, spriteSheet: "itemst2" },
            { name: "Thick-Ring Chainmail", id: "[@c=157]", type: "Chain", x: 384, y: 576, spriteSheet: "itemst2" },
            { name: "Vanguard's Chainmail", id: "[@c=158]", type: "Chain", x: 384, y: 528, spriteSheet: "itemst2" },
            { name: "Woodsman's Chainmail", id: "[@c=159]", type: "Chain", x: 384, y: 480, spriteSheet: "itemst2" },
            { name: "Ancient Pattern Armour", id: "[@c=161]", type: "Plate", x: 48, y: 432, spriteSheet: "itemst2" },
            { name: "Chain-Edged Platemail", id: "[@c=162]", type: "Plate", x: 48, y: 480, spriteSheet: "itemst2" },
            { name: "Desert Platemail", id: "[@c=163]", type: "Plate", x: 48, y: 528, spriteSheet: "itemst2" },
            { name: "Dwarven Champion's", id: "[@c=164]", type: "Plate", x: 48, y: 576, spriteSheet: "itemst2" },
            { name: "Forester's Platemail", id: "[@c=165]", type: "Plate", x: 48, y: 624, spriteSheet: "itemst2" },
            { name: "Fur-Lined Platemail", id: "[@c=166]", type: "Plate", x: 48, y: 672, spriteSheet: "itemst2" },
            { name: "Heavy Platemail", id: "[@c=167]", type: "Plate", x: 48, y: 720, spriteSheet: "itemst2" },
            { name: "Highland Platemail", id: "[@c=168]", type: "Plate", x: 48, y: 768, spriteSheet: "itemst2" },
            { name: "Jungle Platemail", id: "[@c=169]", type: "Plate", x: 48, y: 816, spriteSheet: "itemst2" },
            { name: "Light Platemail", id: "[@c=170]", type: "Plate", x: 48, y: 864, spriteSheet: "itemst2" },
            { name: "Obsidian Platemail", id: "[@c=171]", type: "Plate", x: 48, y: 912, spriteSheet: "itemst2" },
            { name: "Plainsman's Platemail", id: "[@c=172]", type: "Plate", x: 96, y: 0, spriteSheet: "itemst2" },
            { name: "Reinforced Platemail", id: "[@c=173]", type: "Plate", x: 96, y: 48, spriteSheet: "itemst2" },
            { name: "Silversteel Platemail", id: "[@c=174]", type: "Plate", x: 96, y: 96, spriteSheet: "itemst2" },
            { name: "Spiked Platemail", id: "[@c=175]", type: "Plate", x: 96, y: 144, spriteSheet: "itemst2" },
            { name: "Thickened Platemail", id: "[@c=176]", type: "Plate", x: 96, y: 192, spriteSheet: "itemst2" },
            { name: "Under-Padded Platemail", id: "[@c=177]", type: "Plate", x: 48, y: 960, spriteSheet: "itemst2" },
            { name: "Upland Platemail", id: "[@c=178]", type: "Plate", x: 96, y: 240, spriteSheet: "itemst2" },
            { name: "Vanguard's Platemail", id: "[@c=179]", type: "Plate", x: 96, y: 288, spriteSheet: "itemst2" },
            { name: "Elven Thoroughbred", id: "[@c=422]", type: "Horses", x: 0, y: 96, spriteSheet: "itemst2" },
            { name: "Battlebred", id: "[@c=423]", type: "Horses", x: 0, y: 432, spriteSheet: "itemst2" },
            { name: "Dwarven Battle Mule", id: "[@c=424]", type: "Horses", x: 0, y: 144, spriteSheet: "itemst2" },
            { name: "War Wolf", id: "[@c=425]", type: "Horses", x: 0, y: 240, spriteSheet: "itemst2" },
            { name: "Soul-Forged Blade", id: "[@c=426]", type: "Swords", x: 0, y: 0, spriteSheet: "sfb" },
            { name: "Armored Charger", id: "[@c=427]", type: "Horses", x: 351, y: 50, spriteSheet: "itemst3" },
            { name: "Demonheart Thoroughbred", id: "[@c=428]", type: "Horses", x: 401, y: 51, spriteSheet: "itemst3" },
            { name: "Demonheart Battlebred", id: "[@c=429]", type: "Horses", x: 451, y: 52, spriteSheet: "itemst3" },
            { name: "Demonheart Battle Mule", id: "[@c=430]", type: "Horses", x: 2, y: 101, spriteSheet: "itemst3" },
            { name: "Demonheart War Wolf", id: "[@c=431]", type: "Horses", x: 50, y: 101, spriteSheet: "itemst3" },
            { name: "Flanged Mace", id: "[@c=432]" },
            { name: "Goldstone Warhammer", id: "[@c=433]" },
            { name: "Morningstar", id: "[@c=434]" },
            { name: "Spiked Flail", id: "[@c=435]" },
            { name: "Titan Hammer", id: "[@c=436]" },
            { name: "Yura Warmace", id: "[@c=437]" },
            { name: "Decimation Mallet", id: "[@c=438]" },
            { name: "Ridersbane Pick", id: "[@c=439]" },
            { name: "Possessed Falchion", id: "[@c=440]" },
            { name: "Consecrated Scepter", id: "[@c=441]" },
            { name: "Jeweled Lightblade", id: "[@c=442]" },
            { name: "Twilight Greatsword", id: "[@c=443]" },
            { name: "Dawnbreaker Greatsword", id: "[@c=444]" },
            { name: "Viper Estoc", id: "[@c=445]" },
            { name: "Deathspike Rapier", id: "[@c=446]" },
            { name: "Penumbral Falchion", id: "[@c=447]" },
            { name: "Resplendent Scepter", id: "[@c=448]" },
            { name: "Greatsword of Dusk", id: "[@c=449]" },
            { name: "Greatsword of Dawn", id: "[@c=450]" },
            { name: "Serpent's Kiss", id: "[@c=451]" },
            { name: "Deathwish Flail", id: "[@c=452]" },
            { name: "Bulwark Battle Edge", id: "[@c=453]" },
            { name: "Bane of Kerberos", id: "[@c=454]" },
            { name: "Hailstorm Bow", id: "[@c=455]" },
            { name: "Rockpiercer Recurve Bow", id: "[@c=456]" },
            { name: "Siege Bow", id: "[@c=457]" },
            { name: "Gilded Longbow", id: "[@c=458]" },
            { name: "Ornate Shortbow", id: "[@c=459]" },
            { name: "Flatbow", id: "[@c=460]" },
            { name: "Nightstalker Greatbow", id: "[@c=461]" },
            { name: "Dawnhunter Greatbow", id: "[@c=462]" },
            { name: "Wicked Bow", id: "[@c=463]" },
            { name: "Celestial Bow", id: "[@c=464]" },
            { name: "Sniper's Bow", id: "[@c=465]" },
            { name: "Reaper Longbow", id: "[@c=466]" },
            { name: "Hellfire Recurve", id: "[@c=467]" },
            { name: "Slayer's Shortbow", id: "[@c=468]" },
            { name: "Viper Shortbow", id: "[@c=469]" },
            { name: "Death's Reach", id: "[@c=470]" },
            { name: "Hand of the Heavens", id: "[@c=471]" },
            { name: "Blackout Greatbow", id: "[@c=472]" },
            { name: "Aurora Greatbow", id: "[@c=473]" },
            { name: "Cobrastrike Shortbow", id: "[@c=474]" },
            { name: "Heartpiercer", id: "[@c=475]" },
            { name: "Citadel Bow", id: "[@c=476]" },
            { name: "Hunter of Kerberos", id: "[@c=477]" },
            { name: "Becs De Corbin", id: "[@c=478]", type: "Spears", x: 400, y: 303, spriteSheet: "itemst3" },
            { name: "Planson", id: "[@c=479]", type: "Spears", x: 450, y: 302, spriteSheet: "itemst3" },
            { name: "Winged Spear", id: "[@c=480]", type: "Spears", x: 0, y: 353, spriteSheet: "itemst3" },
            { name: "Grim Spontoon", id: "[@c=481]", type: "Spears", x: 49, y: 353, spriteSheet: "itemst3" },
            { name: "Naginata", id: "[@c=482]", type: "Spears", x: 98, y: 353, spriteSheet: "itemst3" },
            { name: "Spear of the Asp", id: "[@c=483]", type: "Spears", x: 149, y: 353, spriteSheet: "itemst3" },
            { name: "Wastelander Angon", id: "[@c=484]", type: "Spears", x: 199, y: 353, spriteSheet: "itemst3" },
            { name: "Jeweled Labrys", id: "[@c=485]", type: "Spears", x: 248, y: 353, spriteSheet: "itemst3" },
            { name: "Opulent Glaive", id: "[@c=486]", type: "Spears", x: 299, y: 353, spriteSheet: "itemst3" },
            { name: "Moonbeam Poleaxe", id: "[@c=487]", type: "Spears", x: 350, y: 352, spriteSheet: "itemst3" },
            { name: "Sunburst Halberd", id: "[@c=488]", type: "Spears", x: 400, y: 352, spriteSheet: "itemst3" },
            { name: "Fiendish Lance", id: "[@c=489]", type: "Spears", x: 451, y: 352, spriteSheet: "itemst3" },
            { name: "Radiant Bardiche", id: "[@c=490]", type: "Spears", x: 0, y: 402, spriteSheet: "itemst3" },
            { name: "Boreal Billhook", id: "[@c=491]", type: "Spears", x: 49, y: 403, spriteSheet: "itemst3" },
            { name: "War Scythe", id: "[@c=492]", type: "Spears", x: 101, y: 403, spriteSheet: "itemst3" },
            { name: "Death's-Head Lance", id: "[@c=493]", type: "Spears", x: 150, y: 403, spriteSheet: "itemst3" },
            { name: "Divine Verdict", id: "[@c=494]", type: "Spears", x: 199, y: 403, spriteSheet: "itemst3" },
            { name: "Mooncrusher Poleaxe", id: "[@c=495]", type: "Spears", x: 251, y: 402, spriteSheet: "itemst3" },
            { name: "Helios Halberd", id: "[@c=496]", type: "Spears", x: 299, y: 402, spriteSheet: "itemst3" },
            { name: "Venomstrike Spear", id: "[@c=497]", type: "Spears", x: 349, y: 402, spriteSheet: "itemst3" },
            { name: "Mancleaver", id: "[@c=498]", type: "Spears", x: 400, y: 402, spriteSheet: "itemst3" },
            { name: "Angon of the Aegis", id: "[@c=499]", type: "Spears", x: 450, y: 402, spriteSheet: "itemst3" },
            { name: "Torment of Kerberos", id: "[@c=500]", type: "Spears", x: 0, y: 452, spriteSheet: "itemst3" },
            { name: "Lionsmane Armour", id: "[@c=501]", type: "Leather", x: 50, y: 452, spriteSheet: "itemst3" },
            { name: "Reinforced Tunic", id: "[@c=502]", type: "Leather", x: 100, y: 452, spriteSheet: "itemst3" },
            { name: "Warding Leather", id: "[@c=503]", type: "Leather", x: 150, y: 452, spriteSheet: "itemst3" },
            { name: "Ornate Tunic", id: "[@c=504]", type: "Leather", x: 200, y: 452, spriteSheet: "itemst3" },
            { name: "Snakeskin Tunic", id: "[@c=505]", type: "Leather", x: 250, y: 452, spriteSheet: "itemst3" },
            { name: "Ursine Leather", id: "[@c=506]", type: "Leather", x: 300, y: 452, spriteSheet: "itemst3" },
            { name: "Peerless Leather", id: "[@c=507]", type: "Leather", x: 350, y: 452, spriteSheet: "itemst3" },
            { name: "Hellborn Tunic", id: "[@c=508]", type: "Leather", x: 400, y: 452, spriteSheet: "itemst3" },
            { name: "Astral Leather", id: "[@c=509]", type: "Leather", x: 450, y: 452, spriteSheet: "itemst3" },
            { name: "Ornamented Leather", id: "[@c=510]", type: "Leather", x: 2, y: 501, spriteSheet: "itemst3" },
            { name: "Deathstalker Garb", id: "[@c=511]", type: "Leather", x: 50, y: 501, spriteSheet: "itemst3" },
            { name: "Righteous Embrace", id: "[@c=512]", type: "Leather", x: 100, y: 501, spriteSheet: "itemst3" },
            { name: "Tunic of the Shrouded", id: "[@c=513]", type: "Leather", x: 150, y: 501, spriteSheet: "itemst3" },
            { name: "Tunic of Radiance", id: "[@c=514]", type: "Leather", x: 200, y: 501, spriteSheet: "itemst3" },
            { name: "Cobra's Hood", id: "[@c=515]", type: "Leather", x: 250, y: 501, spriteSheet: "itemst3" },
            { name: "Sadist's Surcoat", id: "[@c=516]", type: "Leather", x: 300, y: 501, spriteSheet: "itemst3" },
            { name: "Redoubt Leather", id: "[@c=517]", type: "Leather", x: 350, y: 501, spriteSheet: "itemst3" },
            { name: "Hide of Kerberos", id: "[@c=518]", type: "Leather", x: 400, y: 501, spriteSheet: "itemst3" },
            { name: "Heirloom Brigandine", id: "[@c=519]", type: "Chain", x: 450, y: 501, spriteSheet: "itemst3" },
            { name: "Jewel Encrusted Doublet", id: "[@c=520]", type: "Chain", x: 2, y: 551, spriteSheet: "itemst3" },
            { name: "Serpentscale Doublet", id: "[@c=522]", type: "Chain", x: 2, y: 651, spriteSheet: "itemst3" },
            { name: "Darkheart Ringmail", id: "[@c=523]", type: "Chain", x: 2, y: 701, spriteSheet: "itemst3" },
            { name: "Exalted Ringmail", id: "[@c=524]", type: "Chain", x: 2, y: 601, spriteSheet: "itemst3" },
            { name: "Chainmail of Warding", id: "[@c=525]", type: "Chain", x: 2, y: 601, spriteSheet: "itemst3" },
            { name: "Siege Brigandine", id: "[@c=526]", type: "Chain", x: 2, y: 601, spriteSheet: "itemst3" },
            { name: "Daystrider Chainmail", id: "[@c=527]", type: "Chain", x: 2, y: 601, spriteSheet: "itemst3" },
            { name: "Moonrise Chainmail", id: "[@c=528]", type: "Chain", x: 2, y: 551, spriteSheet: "itemst3" },
            { name: "Demonscale Mail", id: "[@c=529]", type: "Chain", x: 50, y: 551, spriteSheet: "itemst3" },
            { name: "Sanctified Ringmail", id: "[@c=530]", type: "Chain", x: 100, y: 551, spriteSheet: "itemst3" },
            { name: "Chainmail of Nightfall", id: "[@c=531]", type: "Chain", x: 150, y: 551, spriteSheet: "itemst3" },
            { name: "Scintillating Chainmail", id: "[@c=532]", type: "Chain", x: 200, y: 551, spriteSheet: "itemst3" },
            { name: "Ouroboros Doublet", id: "[@c=533]", type: "Chain", x: 250, y: 551, spriteSheet: "itemst3" },
            { name: "Deathgiver's Caress", id: "[@c=534]", type: "Chain", x: 300, y: 551, spriteSheet: "itemst3" },
            { name: "Mail of Impunity", id: "[@c=535]", type: "Chain", x: 350, y: 551, spriteSheet: "itemst3" },
            { name: "Scale of Kerberos", id: "[@c=536]", type: "Chain", x: 400, y: 551, spriteSheet: "itemst3" },
            { name: "Adorned Platemail", id: "[@c=537]" },
            { name: "Trophy Platemail", id: "[@c=538]" },
            { name: "Peerless Platemail", id: "[@c=539]" },
            { name: "Deathadder Platemail", id: "[@c=540]" },
            { name: "Platemail of the Void", id: "[@c=541]" },
            { name: "Elysian Platemail", id: "[@c=542]" }
        ],

        // --- ITEM DATASET ---
        ITEM_DATA: [
            { name: "Wood", id: "[@i=1|1]", type: "General", x: 197, y: 199, spriteSheet: "itemsbase9" },
            { name: "Clay", id: "[@i=1|2]", type: "General", x: 394, y: 250, spriteSheet: "itemsbase9" },
            { name: "Iron", id: "[@i=1|3]", type: "General", x: 197, y: 245, spriteSheet: "itemsbase9" },
            { name: "Stone", id: "[@i=1|4]", type: "General", x: 295, y: 198, spriteSheet: "itemsbase9" },
            { name: "Food", id: "[@i=1|5]", type: "General", x: 344, y: 247, spriteSheet: "itemsbase9" },
            { name: "Mana", id: "[@i=2|1]", type: "General", x: 50, y: 219, spriteSheet: "itemsbase9" },
            { name: "Research", id: "[@i=2|2]", type: "General", x: 442, y: 198, spriteSheet: "itemsbase9" },
            { name: "Horse", id: "[@i=3|1]", type: "General", x: 246, y: 246, spriteSheet: "itemsbase9" },
            { name: "Livestock", id: "[@i=3|2]", type: "General", x: 99, y: 223, spriteSheet: "itemsbase9" },
            { name: "Sword", id: "[@i=3|3]", type: "General", x: 246, y: 194, spriteSheet: "itemsbase9" },
            { name: "Bow", id: "[@i=3|4]", type: "General", x: 1, y: 268, spriteSheet: "itemsbase9" },
            { name: "Spear", id: "[@i=3|5]", type: "General", x: 344, y: 194, spriteSheet: "itemsbase9" },
            { name: "Saddle", id: "[@i=3|6]", type: "General", x: 392, y: 197, spriteSheet: "itemsbase9" },
            { name: "Book", id: "[@i=3|7]", type: "General", x: 50, y: 268, spriteSheet: "itemsbase9" },
            { name: "Leather Armour", id: "[@i=3|8]", type: "General", x: 148, y: 242, spriteSheet: "itemsbase9" },
            { name: "Chainmail", id: "[@i=3|9]", type: "General", x: 443, y: 247, spriteSheet: "itemsbase9" },
            { name: "Plate Armour", id: "[@i=3|10]", type: "General", x: 1, y: 219, spriteSheet: "itemsbase9" },
            { name: "Siege Block", id: "[@i=3|11]", type: "General", x: 100, y: 174, spriteSheet: "itemsbase9" },
            { name: "Beer", id: "[@i=3|12]", type: "General", x: 149, y: 195, spriteSheet: "itemsbase9" },

        ],

        // --- UNIT DATASET ---
        UNIT_DATA: [
            { name: "Spearman", id: "[@u=1]", type: "Infantry", x: 0, y: 0, spriteSheet: "itemsT1" },
            { name: "Archer", id: "[@u=2]", type: "Ranged", x: 48, y: 0, spriteSheet: "itemsT1" },
            { name: "Cavalry", id: "[@u=3]", type: "Cavalry", x: 96, y: 0, spriteSheet: "default" }
            // Add more unit records here as needed
        ],

        // Button filters for the three modes
        GEAR_BUTTON_LABELS: ["Horses", "Spears", "Bows", "Swords", "Leather", "Chain", "Plate"],
        ITEM_BUTTON_LABELS: ["Generated", "Crafted", "Harvested"],
        UNIT_BUTTON_LABELS: ["Human", "Dwarf", "Elf", "Orc", "NPC Factions", "Animals"],

        // --- GLOBAL AESTHETICS ---
        fontFamily: 'Georgia, "Times New Roman", serif',

        // --- CHAT INJECTED BUTTON CONFIGURATION ---
        chatButton: {
            text: "Images",
            showInDockedChat: true,
            bgColor: "#8c1c1c",
            hoverBgColor: "#a82222",
            textColor: "#ffffff",
            borderColor: "#4a0f0f",
            fontSize: "11px",
            padding: "0 6px",
            borderRadius: "2px"
        },

        // --- POPUP CONTAINER STYLES ---
        popup: {
            bgColor: "#f2e5c9",
            borderColor: "#4a2c11",
            borderWidth: "2px",
            borderRadius: "4px",
            zIndex: 1,
            defaultTop: "115px",
            defaultLeft: "5px"
        },

        // --- POPUP HEADER & SEARCH BAR STYLES ---
        header: {
            bgColor: "#4a2c11",
            modeBtnBgColor: "#c8a44b",
            modeBtnHoverBgColor: "#d8b45b",
            closeBtnBgColor: "#8c1c1c",
            closeBtnHoverBgColor: "#a82222",
            closeBtnTextColor: "#ffffff",
            searchInputBgColor: "#fcf6e8",
            searchInputTextColor: "#33200e",
            searchInputBorderColor: "#7a5026"
        },

        // --- CATEGORY FILTER BUTTON STYLES ---
        filterButtons: {
            bgColor: "#e2cd9e",
            textColor: "#4a2c11",
            hoverBgColor: "#fff4dc",
            activeBgColor: "#4a2c11",
            activeTextColor: "#fcf6e8",
            borderColor: "#8b5a2b",
            fontSize: "10px",
            fontWeight: "bold"
        },

        // --- DATA TABLE STYLES ---
        table: {
            headerBgColor: "#3d220a",
            headerTextColor: "#fcf6e8",
            rowBgColor: "#f2e5c9",
            altRowBgColor: "#e8d8b5",
            textColor: "#33200e",
            borderColor: "#a68257",
            fontSize: "12px",
            imageSize: "32px"
        }
    };

    // ==========================================
    // 2. STATE VARIABLES & OBSERVER
    // ==========================================
    let isPopupOpen = false;
    let currentMode = 'gear'; // Modes: 'gear', 'items', 'units'
    let currentSearchText = "";
    let currentTypeFilter = "";

    const domObserver = new MutationObserver(() => {
        attachButtonsToChat();
    });

    // ==========================================
    // 3. UI INITIALIZATION & STYLING
    // ==========================================

    function injectStyles() {
        let css = `
            .illy-img-btn-injected {
                background-color: ${CONFIG.chatButton.bgColor} !important;
                color: ${CONFIG.chatButton.textColor} !important;
                border: 1px solid ${CONFIG.chatButton.borderColor} !important;
                padding: ${CONFIG.chatButton.padding} !important;
                font-size: ${CONFIG.chatButton.fontSize} !important;
                border-radius: ${CONFIG.chatButton.borderRadius} !important;
                cursor: pointer;
                font-family: Arial, sans-serif !important;
                white-space: nowrap !important;
                flex: 0 0 auto !important;
                align-self: center !important;
                width: auto !important;
                height: 21px !important;
                line-height: 19px !important;
                box-sizing: border-box !important;
                text-align: center !important;
                background-image: none !important;
                text-shadow: none !important;
                box-shadow: none !important;
                margin: 0 !important;
            }
            .illy-img-btn-injected:hover {
                background-color: ${CONFIG.chatButton.hoverBgColor} !important;
            }

            #illy-img-popup {
                display: none;
                position: fixed;
                box-sizing: border-box;
                background-color: ${CONFIG.popup.bgColor};
                border: ${CONFIG.popup.borderWidth} solid ${CONFIG.popup.borderColor};
                border-radius: ${CONFIG.popup.borderRadius};
                z-index: ${CONFIG.popup.zIndex};
                box-shadow: 0px 4px 15px rgba(0,0,0,0.6);
                flex-direction: column;
                font-family: ${CONFIG.fontFamily};
                overflow: hidden;
            }

            .illy-popup-header {
                display: flex;
                justify-content: space-between;
                align-items: stretch;
                background: ${CONFIG.header.bgColor};
                padding: 6px;
                border-bottom: 1px solid ${CONFIG.header.searchInputBorderColor};
                flex-shrink: 0;
                gap: 8px;
            }
            .illy-header-actions {
                display: flex;
                gap: 5px;
                flex: 1;
            }
            #illy-search-input {
                flex: 1.6;
                min-width: 0;
                padding: 5px 8px;
                background-color: ${CONFIG.header.searchInputBgColor};
                color: ${CONFIG.header.searchInputTextColor};
                border: 1px solid ${CONFIG.header.searchInputBorderColor};
                border-radius: 3px;
                font-family: ${CONFIG.fontFamily};
                font-size: 13px;
                outline: none;
                box-sizing: border-box;
            }
            .illy-action-btn {
                flex: 1;
                background: ${CONFIG.header.modeBtnBgColor};
                color: ${CONFIG.header.closeBtnTextColor};
                border: 1px solid #4a0f0f;
                padding: 4px 0;
                cursor: pointer;
                border-radius: 3px;
                font-weight: bold;
                font-family: Arial, sans-serif;
                font-size: 12px;
                outline: none;
                transition: background 0.1s;
                text-align: center;
            }
            .illy-action-btn:hover {
                background: ${CONFIG.header.modeBtnHoverBgColor};
            }
            .illy-action-btn.active {
                background: ${CONFIG.header.closeBtnHoverBgColor};
                box-shadow: inset 0px 2px 4px rgba(0,0,0,0.3);
            }
            #illy-close-btn {
                background: ${CONFIG.header.closeBtnBgColor};
                flex: 0 0 45px !important;
                min-width: 45px;
            }
            #illy-close-btn:hover {
                background: ${CONFIG.header.closeBtnHoverBgColor};
            }

            .illy-btn-grid {
                display: flex;
                flex-wrap: nowrap;
                justify-content: space-between;
                gap: 4px;
                padding: 6px 8px;
                background: transparent;
                border-bottom: 1px solid ${CONFIG.filterButtons.borderColor};
                flex-shrink: 0;
            }
            .illy-filter-btn {
                flex: 1 1 0;
                min-width: 0;
                padding: 5px 1px;
                font-size: ${CONFIG.filterButtons.fontSize};
                font-weight: ${CONFIG.filterButtons.fontWeight};
                font-family: ${CONFIG.fontFamily};
                background: ${CONFIG.filterButtons.bgColor};
                color: ${CONFIG.filterButtons.textColor};
                border: 1px solid ${CONFIG.filterButtons.borderColor};
                border-radius: 3px;
                cursor: pointer;
                text-align: center;
                outline: none;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .illy-filter-btn:hover { background: ${CONFIG.filterButtons.hoverBgColor}; }
            .illy-filter-btn.active {
                background: ${CONFIG.filterButtons.activeBgColor};
                color: ${CONFIG.filterButtons.activeTextColor};
                border-color: ${CONFIG.filterButtons.activeBgColor};
            }

            .illy-copy-btn {
                padding: 3px 8px;
                font-size: 11px;
                font-family: Arial, sans-serif;
                background: ${CONFIG.filterButtons.bgColor};
                color: ${CONFIG.filterButtons.textColor};
                border: 1px solid ${CONFIG.filterButtons.borderColor};
                border-radius: 3px;
                cursor: pointer;
                outline: none;
                white-space: nowrap;
                transition: background 0.1s, color 0.1s;
            }
            .illy-copy-btn:hover {
                background: ${CONFIG.filterButtons.hoverBgColor};
            }
            .illy-copy-btn:active, .illy-copy-btn.copied {
                background: ${CONFIG.filterButtons.activeBgColor};
                color: ${CONFIG.filterButtons.activeTextColor};
                border-color: ${CONFIG.filterButtons.activeBgColor};
            }

            .illy-table-container {
                flex-grow: 1;
                overflow-y: auto;
                background: transparent;
            }

            #illy-data-table {
                width: 100%;
                table-layout: fixed;
                border-collapse: collapse;
                font-size: ${CONFIG.table.fontSize};
                font-family: ${CONFIG.fontFamily};
            }
            #illy-data-table th, #illy-data-table td {
                border: 1px solid ${CONFIG.table.borderColor};
                padding: 6px;
                text-align: left;
                color: ${CONFIG.table.textColor};
                vertical-align: middle;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            /* Added explicit right padding to the ID column cells and header to prevent clipping against scrollbars/edges */
            #illy-data-table th:nth-child(4),
            #illy-data-table td:nth-child(4) {
                padding-right: 5px;
            }

            #illy-data-table th {
                background-color: ${CONFIG.table.headerBgColor};
                color: ${CONFIG.table.headerTextColor};
                position: sticky;
                top: 0;
                font-weight: bold;
                z-index: 2;
            }
            #illy-data-table tr:nth-child(even) {
                background-color: ${CONFIG.table.altRowBgColor};
            }
            #illy-data-table tr:nth-child(odd) {
                background-color: ${CONFIG.table.rowBgColor};
            }
            #illy-data-table img {
                max-width: ${CONFIG.table.imageSize};
                max-height: ${CONFIG.table.imageSize};
                display: block;
                margin: 0 auto;
            }

            .illy-sprite-icon {
                display: block;
                margin: 0 auto;
                background-repeat: no-repeat;
                box-sizing: border-box;
            }
        `;

        if (!CONFIG.chatButton.showInDockedChat) {
            css += `
                .illy-img-btn-injected { display: none !important; }
                [style*="position: absolute"] .illy-img-btn-injected,
                [style*="position:fixed"] .illy-img-btn-injected,
                [style*="position: fixed"] .illy-img-btn-injected,
                [style*="POSITION: ABSOLUTE"] .illy-img-btn-injected,
                .ui-dialog .illy-img-btn-injected,
                .floating .illy-img-btn-injected,
                .undocked .illy-img-btn-injected,
                .window .illy-img-btn-injected,
                .popup .illy-img-btn-injected {
                    display: inline-block !important;
                }
                #leftcolumn .illy-img-btn-injected,
                #left_column .illy-img-btn-injected,
                #column_left .illy-img-btn-injected,
                #sidebar .illy-img-btn-injected,
                .sidebar .illy-img-btn-injected,
                #chatdock .illy-img-btn-injected,
                .chatdock .illy-img-btn-injected,
                #leftbar .illy-img-btn-injected,
                #leftpane .illy-img-btn-injected,
                #column1 .illy-img-btn-injected,
                [id*="dock"] .illy-img-btn-injected,
                [class*="dock"] .illy-img-btn-injected,
                [id*="sidebar"] .illy-img-btn-injected,
                [class*="sidebar"] .illy-img-btn-injected,
                [id*="left"] .illy-img-btn-injected {
                    display: none !important;
                }
            `;
        }

        if (typeof GM_addStyle !== 'undefined') {
            GM_addStyle(css);
        } else {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    function updatePopupPosition() {
        const popup = document.getElementById('illy-img-popup');
        if (!popup) return;

        let topPos = parseInt(CONFIG.popup.defaultTop) || 135;
        let leftPos = parseInt(CONFIG.popup.defaultLeft) || 0;

        let targetWidth = window.innerWidth * 0.55;

        const allDivs = document.querySelectorAll('div, table, section');
        for (const el of allDivs) {
            const rect = el.getBoundingClientRect();

            if (rect.top > 60 && rect.top < 150
                && rect.left > window.innerWidth * 0.4 && rect.width
                >= 150 && rect.width <= 450 && rect.height > 250) {
                targetWidth = rect.left - leftPos - 8;
                break;
            }
        }

        popup.style.top = `${topPos}px`;
        popup.style.left = `${leftPos}px`;
        popup.style.width = `${targetWidth}px`;
        popup.style.height = `calc(100vh - ${topPos + 15}px)`;
    }

    function createPopupUI() {
        if (document.getElementById('illy-img-popup')) return;

        const popup = document.createElement('div');
        popup.id = 'illy-img-popup';
        popup.style.display = 'none';

        popup.innerHTML = `
            <div class="illy-popup-header">
                <input type="text" id="illy-search-input" placeholder="Search by name...">
                <div class="illy-header-actions">
                    <button class="illy-action-btn active" id="illy-gear-btn">Gear</button>
                    <button class="illy-action-btn" id="illy-item-btn">Items</button>
                    <button class="illy-action-btn" id="illy-unit-btn">Units</button>
                    <button class="illy-action-btn" id="illy-close-btn">X</button>
                </div>
            </div>
            <div class="illy-btn-grid" id="illy-btn-container"></div>
            <div class="illy-table-container">
                <table id="illy-data-table">
                    <thead>
                        <tr>
                            <th style="width: 48px; text-align: center;">Icon</th>
                            <th style="text-align: center;">Name</th>
                            <th style="width: 140px; text-align: center;">Tooltip</th>
                            <th style="width: 140px; text-align: center;">ID</th>
                        </tr>
                    </thead>
                    <tbody id="illy-table-body"></tbody>
                </table>
            </div>
        `;
        document.body.appendChild(popup);

        document.getElementById('illy-close-btn').addEventListener('click', () => {
            isPopupOpen = false;
            popup.style.display = 'none';
        });

        const gearBtn = document.getElementById('illy-gear-btn');
        const itemBtn = document.getElementById('illy-item-btn');
        const unitBtn = document.getElementById('illy-unit-btn');

        function setMode(newMode) {
            currentMode = newMode;
            currentTypeFilter = "";

            gearBtn.classList.toggle('active', currentMode === 'gear');
            itemBtn.classList.toggle('active', currentMode === 'items');
            unitBtn.classList.toggle('active', currentMode === 'units');

            renderFilterButtons();
            updateTable();
        }

        gearBtn.addEventListener('click', () => setMode('gear'));
        itemBtn.addEventListener('click', () => setMode('items'));
        unitBtn.addEventListener('click', () => setMode('units'));

        document.getElementById('illy-search-input').addEventListener('input', (e) => {
            currentSearchText = e.target.value.toLowerCase();
            updateTable();
        });

        renderFilterButtons();
    }

    function renderFilterButtons() {
        const btnContainer = document.getElementById('illy-btn-container');
        btnContainer.innerHTML = '';

        let labelsToUse = CONFIG.GEAR_BUTTON_LABELS;
        if (currentMode === 'items') labelsToUse = CONFIG.ITEM_BUTTON_LABELS;
        else if (currentMode === 'units') labelsToUse = CONFIG.UNIT_BUTTON_LABELS;

        labelsToUse.forEach(label => {
            const btn = document.createElement('button');
            btn.className = 'illy-filter-btn';
            if (currentTypeFilter === label) btn.classList.add('active');
            btn.textContent = label;
            btn.title = label;
            btn.addEventListener('click', () => handleFilterClick(btn, label));
            btnContainer.appendChild(btn);
        });
    }

    // ==========================================
    // 4. CHAT INTEGRATION & UNIFORM LAYOUT
    // ==========================================

    function isDockedChat(container) {
        if (container.closest('#leftcolumn, #left_column, #column_left, #sidebar, .sidebar, #chatdock, .chatdock, #leftbar, #leftpane, #column1, [id*="dock"], [class*="dock"]')) {
            return true;
        }
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.width <= 280) return true;
        return false;
    }

    function attachButtonsToChat() {
        domObserver.disconnect();

        const candidates = document.querySelectorAll('input, button');

        candidates.forEach(el => {
            const isSend = (el.value && el.value.trim().toLowerCase() === 'send') ||
                           (el.textContent && el.textContent.trim().toLowerCase() === 'send');

            if (!isSend) return;

            // --- EXCLUSION BLOCKS ---

            // 1. Exclude Private Message Dialogs
            const dialogWrapper = el.closest('.ui-dialog');
            if (dialogWrapper) {
                const dialogTitle = dialogWrapper.querySelector('.ui-dialog-title');
                if (dialogTitle && dialogTitle.textContent.includes('Chat with')) {
                    return;
                }
            }

            // 2. Exclude Unit, Trade, and Diplomatic Windows
            // If the script finds multiple "Send" buttons in the same table, it's a list of units, not a chat.
            const parentTable = el.closest('table, tbody');
            if (parentTable) {
                const sendBtns = Array.from(parentTable.querySelectorAll('input, button')).filter(b =>
                    (b.value && b.value.trim().toLowerCase() === 'send') ||
                    (b.textContent && b.textContent.trim().toLowerCase() === 'send')
                );
                // Skip injecting the button if more than one send button exists here
                if (sendBtns.length > 1) {
                    return;
                }
            }
            // ------------------------

            const container = el.closest('form, div, td, tr') || el.parentElement;
            if (!container) return;

            const isDocked = isDockedChat(container);

            if (isDocked && !CONFIG.chatButton.showInDockedChat) {
                const existingBtn = container.querySelector('.illy-img-btn-injected');
                if (existingBtn) existingBtn.remove();
                return;
            }

            const textInput = container.querySelector('input[type="text"], input:not([type])');
            if (!textInput) return;

            let imgBtn = container.querySelector('.illy-img-btn-injected');

            if (!imgBtn) {
                imgBtn = document.createElement('button');
                imgBtn.className = 'illy-img-btn-injected';
                imgBtn.textContent = CONFIG.chatButton.text;
                imgBtn.type = 'button';

                imgBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePopup();
                });

                textInput.parentNode.insertBefore(imgBtn, textInput);
            }

            container.style.setProperty('display', 'flex', 'important');
            container.style.setProperty('flex-direction', 'row', 'important');
            container.style.setProperty('align-items', 'center', 'important');
            container.style.setProperty('justify-content', 'space-between', 'important');
            container.style.setProperty('width', '100%', 'important');
            container.style.setProperty('box-sizing', 'border-box', 'important');
            container.style.setProperty('gap', '4px', 'important');
            container.style.setProperty('padding-left', '2px', 'important');
            container.style.setProperty('padding-right', '2px', 'important');

            imgBtn.style.setProperty('flex', '0 0 auto', 'important');
            imgBtn.style.setProperty('align-self', 'center', 'important');
            imgBtn.style.setProperty('margin', '0', 'important');
            imgBtn.style.setProperty('height', '21px', 'important');
            imgBtn.style.setProperty('line-height', '19px', 'important');
            imgBtn.style.setProperty('padding', CONFIG.chatButton.padding, 'important');
            imgBtn.style.setProperty('box-sizing', 'border-box', 'important');

            textInput.style.setProperty('flex', '1 1 auto', 'important');
            textInput.style.setProperty('align-self', 'center', 'important');
            textInput.style.setProperty('width', 'auto', 'important');
            textInput.style.setProperty('min-width', '0', 'important');
            textInput.style.setProperty('margin', '0', 'important');
            textInput.style.setProperty('height', '21px', 'important');
            textInput.style.setProperty('padding', '2px 5px', 'important');
            textInput.style.setProperty('box-sizing', 'border-box', 'important');

            el.style.setProperty('flex', '0 0 auto', 'important');
            el.style.setProperty('align-self', 'center', 'important');
            el.style.setProperty('margin', '0', 'important');
            el.style.setProperty('position', 'relative', 'important');
            el.style.setProperty('top', '-2px', 'important');
            el.style.setProperty('height', '26px', 'important');
            el.style.setProperty('line-height', '19px', 'important');
            el.style.setProperty('padding', '0 6px', 'important');
            el.style.setProperty('box-sizing', 'border-box', 'important');
            el.style.setProperty('vertical-align', 'middle', 'important');
        });

        domObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'id']
        });
    }

    // ==========================================
    // 5. POPUP LOGIC & TABLE RENDERING
    // ==========================================

    function togglePopup() {
        const popup = document.getElementById('illy-img-popup');
        isPopupOpen = !isPopupOpen;

        if (isPopupOpen) {
            updatePopupPosition();
            popup.style.display = 'flex';
            updateTable();
        } else {
            popup.style.display = 'none';
        }
    }

    function handleFilterClick(clickedBtn, label) {
        const allBtns = document.querySelectorAll('.illy-filter-btn');

        if (clickedBtn.classList.contains('active')) {
            clickedBtn.classList.remove('active');
            currentTypeFilter = "";
        } else {
            allBtns.forEach(b => b.classList.remove('active'));
            clickedBtn.classList.add('active');
            currentTypeFilter = label;
        }
        updateTable();
    }

    function updateTable() {
        const tbody = document.getElementById('illy-table-body');
        tbody.innerHTML = '';

        let datasetToUse = CONFIG.GEAR_DATA;
        if (currentMode === 'items') datasetToUse = CONFIG.ITEM_DATA;
        else if (currentMode === 'units') datasetToUse = CONFIG.UNIT_DATA;

        const filteredData = datasetToUse.filter(item => {
            const matchesText = item.name.toLowerCase().includes(currentSearchText);
            const matchesType = currentTypeFilter === "" || item.type === currentTypeFilter;
            return matchesText && matchesType;
        });

        filteredData.forEach(item => {
            const tr = document.createElement('tr');

            const tdImg = document.createElement('td');
            tdImg.style.textAlign = 'center';

            if (item.image) {
                const img = document.createElement('img');
                img.src = item.image;
                tdImg.appendChild(img);
            } else {
                const spriteDiv = document.createElement('div');
                spriteDiv.className = 'illy-sprite-icon';

                const sheetKey = item.spriteSheet || item.sheet || 'default';
                const sheetConfig = CONFIG.spriteSheets[sheetKey]
                    || CONFIG.spriteSheets['default']
                    || Object.values(CONFIG.spriteSheets)[0]
                    || {};

                const posX = item.x || 0;
                const posY = item.y || 0;
                const iconW = item.w || item.width || sheetConfig.iconWidth || 48;
                const iconH = item.h || item.height || sheetConfig.iconHeight || 48;
                const sheetUrl = sheetConfig.url || '';

                spriteDiv.style.width = `${iconW}px`;
                spriteDiv.style.height = `${iconH}px`;
                spriteDiv.style.backgroundImage = `url("${sheetUrl}")`;
                spriteDiv.style.backgroundPosition = `-${posX}px -${posY}px`;

                tdImg.appendChild(spriteDiv);
            }

            const tdName = document.createElement('td');
            tdName.textContent = item.name;
            tdName.style.textAlign = 'center';

            // --- TOOLTIP BUTTON LOGIC ---
            const tdTooltip = document.createElement('td');
            tdTooltip.style.textAlign = 'center';

            const tooltipBtn = document.createElement('button');
            tooltipBtn.className = 'illy-copy-btn';
            tooltipBtn.textContent = 'Tooltip';
            tooltipBtn.style.padding = '4px 12px';
            tooltipBtn.style.width = '90%';

            tooltipBtn.addEventListener('click', (e) => {
                try {
                    // Strip brackets and @ to convert "[@c=45]" into "c=45"
                    const cleanData = item.id.replace(/[@\[\]]/g, '');

                    const $btn = $(e.currentTarget);
                    $btn.attr("data", cleanData);

                    // Pass the correctly formatted string to ExtractData
                    const a = ExtractData($btn.attr("data"));

                    if (a && a.popup) {
                        a.popup({ data: a });
                    }
                } catch (err) {
                    console.error("Tooltip failed: ", err);
                }
            });
            tdTooltip.appendChild(tooltipBtn);

            // --- CLICK TO COPY BUTTON LOGIC ---
            const tdId = document.createElement('td');
            tdId.style.textAlign = 'center';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'illy-copy-btn';
            copyBtn.textContent = item.id;
            copyBtn.title = "Click to copy ID";
            copyBtn.style.padding = '4px 12px';
            copyBtn.style.width = '90%';

            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(item.id).then(() => {
                    copyBtn.textContent = "Copied!";
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = item.id;
                        copyBtn.classList.remove('copied');
                    }, 800);
                }).catch(err => {
                    console.error('Failed to copy ID: ', err);
                });
            });
            tdId.appendChild(copyBtn);

            tr.append(tdImg, tdName, tdTooltip, tdId);
            tbody.appendChild(tr);
        });

        if (filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 15px; color:${CONFIG.table.textColor};">No data found.</td></tr>`;
        }
    }

    // ==========================================
    // 6. INITIALIZE & TIMERS
    // ==========================================

    injectStyles();
    createPopupUI();

    attachButtonsToChat();

    setInterval(attachButtonsToChat, 1000);

    window.addEventListener('resize', () => {
        if (isPopupOpen) updatePopupPosition();
        attachButtonsToChat();
    });

})();
