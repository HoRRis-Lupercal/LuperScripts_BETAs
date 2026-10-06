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
        
        gear: [
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
            // =========================================================================
            // MORE TO ADD HERE
            // =========================================================================
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
            { name: "Scale of Kerberos", id: "[@c=536]", type: "Chain", x: 400, y: 551, spriteSheet: "itemst3" }
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
            /* Dialog Title Bar Tabs */
            .ikcat-dialog-tabs {
                float: left;
                margin: 5px 16px 0 8px; 
                display: flex;
                gap: 8px; 
            }

            .ikcat-dialog-tab {
                cursor: pointer;
                color: #4a3311;
                font-size: 13px;
                font-weight: normal;
                padding: 4px 10px 6px 10px; /* Extended bottom padding to connect with body */
                border-radius: 4px 4px 0 0; /* Tab shape */
                opacity: 0.7;
                transition: opacity 0.2s, color 0.2s, background-color 0.2s;
            }

            .ikcat-dialog-tab:hover {
                opacity: 1;
                color: #8b1111;
            }

            .ikcat-dialog-tab.active {
                opacity: 1;
                color: #e5dac1 !important;
                background-color: #e5dac1 !important; /* Illyriad light container background */
                font-weight: bold;
            }

            /* Core Dialog Layout - Fixes jQuery UI recursive shrink bug */
            #ikCatalogue {
                padding: 0 !important; /* CRITICAL: Removing padding stops jQuery UI from subtracting it on every frame */
                overflow: hidden !important;
            }

            /* Wrapper to safely handle flexbox and padding away from the game engine */
            .ikcat-flex-wrapper {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                padding: 8px;
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
                flex: 1 1 0px !important; 
                min-height: 0 !important; 
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
            <div class="ikcat-flex-wrapper">
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
