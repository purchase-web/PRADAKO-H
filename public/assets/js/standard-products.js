/* ==========================================================
   PRADAKO — STANDARD PRODUCTS (INDEPENDENT PAGE)
   ----------------------------------------------------------
   Extracted from /js/products.js on 8 August 2026.

   This file is a self-contained copy of the Standard Products
   catalogue engine only. It has no dependency on products.js
   and nothing here is shared with the Products page, so an
   edit there can never break this page.

   WHAT WAS CARRIED OVER, UNCHANGED
     - pradakoProductTypes            8 product types
     - pradakoSubtypeData             grouped subtypes (TYPE 1..4)
     - pradakoStandardsBySubtype      89 subtypes, 369 standards
     - pradakoStandardFamilies        17 standard bodies
     - the catalogue router, renderers, detail panel and events
     - the standard fastener image patch

   WHAT WAS LEFT BEHIND
     - standardsData and the equivalent-standards accordions
     - product tabs, smooth scroll and scroll spy
     - the customised products catalogue
     - hot products, product-at-a-glance and the enquiry footer
     - the cross-reference guide
     - the public featured-products data API

   TWO DELIBERATE CHANGES, both marked PRADAKO CHANGE below
     1. ?family= deep linking for By Standard (Number)
     2. image folders fall back to the parent directory, so the
        / folders can be deleted without breaking anything
========================================================== */

/* ==========================================================
   01. CATALOGUE MASTER DATA
========================================================== */

const pradakoProductTypes = [
    {
        key: "Screws",
        title: "Screws",
        image: "/assets/images/products/catalogue/pan-head-machine-screw.png",
        note: "Machine, tapping, sheet metal, countersunk, wood and drilling screws"
    },
    {
        key: "Socket Screws",
        title: "Socket Screws",
        image: "/assets/images/products/catalogue/socket-screw.png",
        note: "Socket cap, button, countersunk, shoulder and set screws"
    },
    {
        key: "Nuts",
        title: "Nuts",
        image: "/assets/images/products/catalogue/nut.png",
        note: "Hex, flange, lock, weld and special nuts"
    },
    {
        key: "Washers",
        title: "Washers",
        image: "/assets/images/products/catalogue/washer.png",
        note: "Plain, spring, structural and special washers"
    },
    {
        key: "Bolts",
        title: "Bolts",
        image: "/assets/images/products/catalogue/hex-bolt.png",
        note: "Hex, flange, carriage, anchor and custom bolts"
    },
    {
        key: "Threaded Rods / Studs",
        title: "Threaded Rods / Studs",
        image: "/assets/images/products/catalogue/threaded-rod.png",
        note: "Fully threaded rods, studs and special length fasteners"
    },
    {
        key: "Structural Bolts",
        title: "Structural Assemblies",
        image: "/assets/images/products/catalogue/structural-bolt.png",
        note: "EN, ASTM and high-strength structural assemblies"
    },
    {
        key: "Rivets",
        title: "Rivets",
        image: "/assets/images/products/catalogue/rivet.png",
        note: "Blind, solid, tubular and structural rivets"
    }
];

const pradakoSubtypeData = {
    "Screws": [
        {
            group: "TYPE 1",
            items: [
                "Self Tapping Screws",
                "Machine Screws",
                "Sheetmetal Screws",
                "Countersunk Screws"
            ]
        },
        {
            group: "TYPE 2",
            items: [
                "Socket Screws",
                "Shoulder Screws",
                "Hex Cap Screws",
                "Set Screws",
                "Grub Screws"
            ]
        },
        {
            group: "TYPE 3",
            items: [
                "Security Screws",
                "Coach Screws",
                "Screws with Washer Assemblies",
                "Wing Screws"
            ]
        },
        {
            group: "TYPE 4",
            items: [
                "Wood Screws",
                "Chipboard Screws",
                "Self Drilling Screws"
            ]
        }
    ],

    "Socket Screws": [
        {
            group: "SOCKET FAMILY",
            items: [
                "Socket Head Cap Screws",
                "Socket Countersunk Screws",
                "Socket Button Head Screws",
                "Low Head Socket Screws"
            ]
        },
        {
            group: "TYPE 2",
            items: [
                "Socket Screws",
                "Shoulder Screws",
                "Hex Cap Screws",
                "Set Screws",
                "Grub Screws"
            ]
        },
        {
            group: "SPECIAL SOCKET",
            items: [
                "Shoulder Socket Screws",
                "Socket Set Screws",
                "Grub Screws",
                "Socket Pipe Plugs"
            ]
        }
    ],

    "Nuts": [
        {
            group: "NUT FAMILY",
            items: [
                "Hex Nuts",
                "Heavy Hex Nuts",
                "Nyloc Nuts",
                "Flange Nuts",
                "Thin Nuts",
                "Lock Nuts"
            ]
        },
        {
            group: "SPECIAL NUTS",
            items: [
                "Weld Nuts",
                "Square Nuts",
                "Castle Nuts",
                "Rivet Nuts",
                "Acorn Nuts",
                "Slotted Nuts",
                "Wing Nuts",
                "Other Special Nuts"
            ]
        }
    ],

    "Washers": [
        {
            group: "WASHER FAMILY",
            items: [
                "Plain Washers",
                "Spring Lock Washers",
                "Hardened Washers",
                "Structural Washers"
            ]
        },
        {
            group: "SPECIAL WASHERS",
            items: [
                "Serrated Washers",
                "Square Washers",
                "Belleville Washers",
                "Thin Washers",
                "Sealing Washers"
            ]
        }
    ],

    "Bolts": [
        {
            group: "HEX / STRUCTURAL BOLTS",
            items: [
                "Hex Bolts",
                "Hex Screws",
                "Hex Head Bolts with Hex Nuts for Steel Structures",
                "Fine Thread Hex Head Bolts Half Thread",
                "Hexagon Head Screws with Metric Fine Threads Full Thread",
                "Hexagon Fit Bolts with Long Thread",
                "Hexagon Fit Bolts with Short Threaded Portion"
            ]
        },
        {
            group: "CSK / NIB / PLOW BOLTS",
            items: [
                "Flat CSK NIB Bolts",
                "Flat CSK NIB Bolts with Hex Nuts",
                "Flat CSK Bolts with Long Square",
                "Flat CSK Square Neck Bolts with Short Square Neck Plow Bolts"
            ]
        },
        {
            group: "SPECIAL BOLTS",
            items: [
                "Hex Flange Bolts",
                "Carriage Bolts",
                "Anchor Bolts",
                "Half Coach Bolts",
                "T Bolts",
                "Eye Bolts",
                "U Bolts",
                "J Bolts"
            ]
        }
    ],

    "Threaded Rods / Studs": [
        {
            group: "ROD / STUD FAMILY",
            items: [
                "Fully Threaded Rods",
                "Double End Studs",
                "Tap End Studs",
                "Weld Studs"
            ]
        },
        {
            group: "SPECIAL STUDS",
            items: [
                "Foundation Studs",
                "B7 Studs",
                "Stainless Steel Studs",
                "Custom Length Studs"
            ]
        }
    ],

    "Structural Bolts": [
        {
            group: "STRUCTURAL FAMILY",
            items: [
                "EN 14399 HV Assemblies",
                "EN 15048 SB Assemblies",
                "ASTM F3125 A325 Bolts",
                "ASTM F3125 A490 Bolts",
                "SQ SQ Holding Down Bolts"
            ]
        },
        {
            group: "ASSEMBLY PARTS",
            items: [
                "Heavy Hex Structural Nuts",
                "Hardened Structural Washers",
                "DTI Washers",
                "Hot Dip Galvanized Assemblies"
            ]
        }
    ],

    "Rivets": [
        {
            group: "RIVET FAMILY",
            items: [
                "Blind Rivets",
                "Solid Rivets",
                "Semi Tubular Rivets",
                "Structural Rivets"
            ]
        },
        {
            group: "SPECIAL RIVETS",
            items: [
                "Countersunk Rivets",
                "Pan Head Rivets",
                "Threaded Rivets",
                "Drive Rivets"
            ]
        }
    ]
};


/* ==========================================================
   03. STANDARD DATA FOR FINAL PRODUCT CARDS
 ========================================================== */

const pradakoStandardsBySubtype = {
    "Self Tapping Screws": [
        "DIN 7973",
        "DIN 7981 / ISO 7049",
        "DIN 7981C / ISO 7049",
        "DIN 7982 C / ISO 7050",
        "DIN 7982 / ISO 7050",
        "DIN 7983 / ISO 7051",
        "DIN 7983C / ISO 7051",
        "DIN 7504",
        "DIN 6928",
        "DIN 968",
        "DIN 7971 C",
        "DIN 7976",

        "ISO 14585",
        "ISO 14586",
        "ISO 14587",
        "ISO 1479",
        "ISO 1481",
        "ISO 7050",

        "JIS B 1122",
        "BS 4174"
    ],

    "Machine Screws": [
        "DIN 84 / ISO 1207",
        "DIN 85 / ISO 1580",
        "DIN 404",
        "DIN 920",
        "DIN 921",
        "DIN 922",
        "DIN 963 / ISO 2009",
        "DIN 964 / ISO 2010",
        "DIN 965 / ISO 7046",
        "DIN 966 / ISO 7047",
        "DIN 7985 / ISO 7045",

        "ISO 1207",
        "ISO 1580",
        "ISO 4017",
        "ISO 7046",
        "ISO 14584",

        "ANSI B18.6.3",
        "ASME B18.11",
        "BS 57",
        "BS 450 / BS 4183",
        "BS 1981",
        "BS 4174",
        "BS 4183",
        "BS 4190",
        "JIS B 1111"
    ],

    "Sheetmetal Screws": [
        "DIN 7971 / ISO 1481",
        "DIN 7972 / ISO 1482",
        "DIN 7973 / ISO 1483",
        "DIN 7976 / ISO 1479",
        "DIN 7981 / ISO 7049",
        "DIN 7982 / ISO 7050",
        "DIN 7983 / ISO 7051"
    ],

    "Countersunk Screws": [
        "DIN 95",
        "DIN 963",
        "DIN 966 H",
        "DIN 966 TX",
        "DIN 966 Z",
        "DIN 7500 M",
        "DIN 7504 OH",
        "DIN 7982 C",

        "ISO 7049",
        "ISO 7051",
        "ISO 14581",
        "ISO 14584",
        "ISO 14586",
        "ISO 14587",

        "ASME B18.3",
        "ASME B18.6.2",
        "ASME B18.6.3",

        "BS 57",
        "BS 450",
        "BS 1981"
    ],

    "Socket Screws": [
        "DIN 912 / ISO 4762",
        "DIN 914 / ISO 4027",
        "DIN 915 / ISO 4028",
        "DIN 916 / ISO 4029",
        "DIN 933 / DIN 934 / ISO 4017",
        "DIN 6912",
        "DIN 7500",
        "DIN 7984",
        "DIN 7991 / ISO 10642",

        "ISO 4762",
        "ISO 7380-1",
        "ISO 7380-2",
        "ISO 7435",
        "ISO 14579",
        "ISO 14580",
        "ISO 14581",
        "ISO 14583",

        "BS 84",
        "BS 2470",
        "BS 4168",
        "IS 6760"
    ],

    "Shoulder Screws": [
        "DIN 923",
        "DIN 927",

        "BS 57",
        "BS 2470",
        "BS 4168"
    ],

    "Hex Cap Screws": [
        "DIN 961",
        "DIN 7985",

        "ISO 4017",
        "ISO 8676",
        "ISO 14583",
        "ISO 15480",

        "BS 57",
        "BS 1083",
        "BS 1981",
        "BS 3692",
        "BS 4183",
        "IS 1363",
        "IS 1364",
        "IS 2269"
    ],

    "Set Screws": [
        "DIN 427",
        "DIN 438",
        "DIN 551",
        "DIN 553",
        "DIN 913",
        "DIN 914",
        "DIN 915",
        "DIN 916",
        "DIN 960",

        "BS 2470",
        "BS 4168",
        "UNI 5783",
        "UNI 7434"
    ],

    "Grub Screws": [
        "DIN 916",
        "ISO 4029",
        "ASME B18.3",
        "BS 4168"
    ],

    "Security Screws": [
        "DIN 7985",
        "DIN 7991",

        "ISO 7380"
    ],

    "Coach Screws": [
        "DIN 571"
    ],

    "Screws with Washer Assemblies": [
        "DIN 6900"
    ],

    "Wing Screws": [
        "DIN 316"
    ],

    "Wood Screws": [
        "DIN 95",
        "DIN 96",
        "DIN 97",
        "DIN 571",
        "DIN 7995",
        "DIN 7996",
        "DIN 7997",

        "ANSI B18.6.1",
        "BS 1210"
    ],

    "Chipboard Screws": [
        "DIN 967",
        "DIN 7505 A / B / C",
        "DIN 7981 / ISO 7049"
    ],

    "Self Drilling Screws": [
        "DIN 7504",
        "ISO 15480",
        "ASME B18.6.4",
        "JIS Self Drill Demo"
    ],

    "Socket Head Cap Screws": [
        "DIN 912",
        "ISO 4762",
        "ASME B18.3",
        "NAS 1351"
    ],

    "Socket Countersunk Screws": [
        "DIN 7991",
        "ISO 10642",
        "ASME B18.3",
        "BS 4168"
    ],

    "Socket Button Head Screws": [
        "ISO 7380",
        "ASME B18.3",
        "BS 4168"
    ],

    "Low Head Socket Screws": [
        "DIN 7984",
        "ISO 14580",
        "ASME B18.3"
    ],

    "Shoulder Socket Screws": [
        "ISO 7379",
        "ASME B18.3",
        "DIN 923",
        "NAS Shoulder Demo"
    ],

    "Socket Set Screws": [
        "DIN 913",
        "DIN 914",
        "DIN 915",
        "DIN 916"
    ],

    "Socket Pipe Plugs": [
        "DIN 906",
        "DIN 908",
        "ISO 6149",
        "ASME B16 Demo"
    ],

    "Hex Nuts": ["DIN 934", "ISO 4032", "ASME B18.2.2", "IS 1364"],
    "Heavy Hex Nuts": ["ASTM A194 2H", "ASME B18.2.2", "ISO 4033", "BS Heavy Hex Demo"],
    "Nyloc Nuts": ["DIN 985", "ISO 10511", "DIN 982", "ASME Lock Nut Demo"],
    "Flange Nuts": ["DIN 6923", "ISO 4161", "ASME B18.2.2", "JIS B 1190"],
    "Weld Nuts": ["DIN 928", "DIN 929", "ISO Weld Nut Demo", "JIS Weld Nut Demo"],
    "Square Nuts": ["DIN 557", "ASME B18.2.2", "BS Square Nut Demo", "IS Square Nut Demo"],
    "Castle Nuts": ["DIN 935", "ISO 7035", "ASME Slotted Nut Demo", "BS Castle Nut Demo"],
    "Rivet Nuts": ["DIN Rivet Nut Demo", "ISO Rivet Nut Demo", "ASME Rivet Nut Demo", "JIS Rivet Nut Demo"],

    "Acorn Nuts": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Lock Nuts": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Slotted Nuts": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Wing Nuts": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Thin Nuts":[
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Other Special Nuts": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Plain Washers": ["DIN 125", "ISO 7089", "ASME B18.22.1", "IS 2016"],
    "Spring Lock Washers": ["DIN 127", "ASME B18.21.1", "IS 3063", "BS 4464"],
    "Hardened Washers": ["ASTM F436", "EN 14399-6", "ISO 7416", "AS/NZS 1252"],
    "Structural Washers": ["EN 14399-6", "ASTM F436", "AS/NZS 1252", "BS Structural Washer Demo"],
    "Serrated Washers": ["DIN 6798", "ISO Serrated Demo", "ASME Serrated Demo", "JIS Serrated Demo"],
    "Square Washers": ["DIN 436", "ASME Square Washer Demo", "BS 3410", "IS Square Washer Demo"],
    "Belleville Washers": ["DIN 2093", "ISO Disc Spring Demo", "ASME Belleville Demo", "BS Disc Spring Demo"],

    "Thin Washers":[
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Sealing Washers": ["DIN Sealing Demo", "ISO Sealing Demo", "ASME Sealing Demo", "BS Sealing Demo"],

    "Hex Bolts": ["DIN 931", "DIN 933", "ISO 4014", "ASME B18.2.1"],
    "Hex Flange Bolts": ["DIN 6921", "ISO 4162", "ASME B18.2.1", "JIS B 1189"],
    "Carriage Bolts": ["DIN 603", "ASME B18.5", "BS 4933", "IS Carriage Demo"],
    "Anchor Bolts": ["ASTM F1554", "DIN Anchor Demo", "ASME Anchor Demo", "IS Anchor Demo"],
    "T Bolts": ["DIN 186", "DIN 188", "ISO T Bolt Demo", "ASME T Bolt Demo"],
    "Eye Bolts": ["DIN 444", "DIN 580", "ISO 3266", "ASME Eye Bolt Demo"],
    "U Bolts": ["DIN U Bolt Demo", "ASME U Bolt Demo", "BS U Bolt Demo", "IS U Bolt Demo"],
    "J Bolts": ["DIN J Bolt Demo", "ASTM F1554 J", "ASME J Bolt Demo", "IS J Bolt Demo"],

    "Hex Screws": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Hex Head Bolts with Hex Nuts for Steel Structures": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Fine Thread Hex Head Bolts Half Thread": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Hexagon Head Screws with Metric Fine Threads Full Thread": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Flat CSK NIB Bolts": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Flat CSK NIB Bolts with Hex Nuts": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Flat CSK Bolts with Long Square": [
        /* DIN STANDARDS */
        /* ISO STANDARDS */
        /* ASME STANDARDS */
        /* OTHER STANDARDS */
    ],

    "Flat CSK Square Neck Bolts with Short Square Neck Plow Bolts": [
        /* DIN STANDARDS */

        /* ISO STANDARDS */

        /* ASME STANDARDS */

        /* OTHER STANDARDS */
    ],

    "Half Coach Bolts": [
        /* DIN STANDARDS */

        /* ISO STANDARDS */

        /* ASME STANDARDS */

        /* OTHER STANDARDS */
    ],

    "Hexagon Fit Bolts with Long Thread": [
        /* DIN STANDARDS */

        /* ISO STANDARDS */

        /* ASME STANDARDS */

        /* OTHER STANDARDS */
    ],

    "Hexagon Fit Bolts with Short Threaded Portion": [
        /* DIN STANDARDS */

        /* ISO STANDARDS */

        /* ASME STANDARDS */

        /* OTHER STANDARDS */
    ],

    "Fully Threaded Rods": ["DIN 975", "DIN 976", "ASTM A193 B7", "ISO Threaded Rod Demo"],
    "Double End Studs": ["DIN 938", "DIN 939", "ASTM A193", "ASME B18.31.2"],
    "Tap End Studs": ["DIN 835", "DIN 938", "ASTM A193", "ASME B18.31.2"],
    "Weld Studs": ["ISO 13918", "DIN 32501", "AWS Weld Stud Demo", "EN Weld Stud Demo"],
    "Foundation Studs": ["ASTM F1554", "DIN Foundation Demo", "IS Foundation Demo", "BS Foundation Demo"],
    "B7 Studs": ["ASTM A193 B7", "ASTM A194 2H Nut Set", "ASME B18.31.2", "BS B7 Demo"],
    "Stainless Steel Studs": ["ASTM A193 B8", "ASTM A193 B8M", "ISO 3506", "DIN 976 A2/A4"],
    "Custom Length Studs": ["DIN 976 Custom", "ASTM A193 Custom", "ISO Custom Stud", "ASME Custom Stud"],

    "EN 14399 HV Assemblies": ["EN 14399-3", "EN 14399-4", "EN 14399-6", "DASt 021"],
    "EN 15048 SB Assemblies": ["EN 15048-1", "EN 15048-2", "EN 15048 SB Bolt", "EN 15048 SB Nut"],
    "ASTM F3125 A325 Bolts": ["ASTM F3125 Grade A325", "ASTM A563 Nut", "ASTM F436 Washer", "ASTM A325M Demo"],
    "ASTM F3125 A490 Bolts": ["ASTM F3125 Grade A490", "ASTM A563 DH Nut", "ASTM F436 Washer", "ASTM A490M Demo"],
    "Heavy Hex Structural Nuts": ["ASTM A563 DH", "ASTM A194 2H", "EN 14399-3 Nut", "AS/NZS 1252 Nut"],
    "Hardened Structural Washers": ["ASTM F436", "EN 14399-6", "AS/NZS 1252 Washer", "BS Structural Washer"],
    "DTI Washers": ["ASTM F959", "EN DTI Demo", "BS DTI Demo", "AS/NZS DTI Demo"],
    "Hot Dip Galvanized Assemblies": ["EN 14399 HDG", "ASTM F2329", "ISO 10684", "DASt 022"],

    "Blind Rivets": ["DIN 7337", "ISO 15977", "ASME Blind Rivet Demo", "JIS Blind Rivet Demo"],
    "Solid Rivets": ["DIN 660", "DIN 661", "ISO 1051", "BS Solid Rivet Demo"],
    "Semi Tubular Rivets": ["DIN 7338", "ISO Semi Tubular Demo", "ASME Semi Tubular Demo", "BS Semi Tubular Demo"],
    "Structural Rivets": ["ASTM Structural Rivet Demo", "EN Structural Rivet Demo", "ISO Structural Rivet Demo", "BS Structural Rivet Demo"],
    "Countersunk Rivets": ["DIN 661", "ISO Countersunk Rivet", "ASME Countersunk Rivet", "BS Countersunk Rivet"],
    "Pan Head Rivets": ["DIN 660", "ISO Pan Head Rivet", "ASME Pan Head Rivet", "BS Pan Head Rivet"],
    "Threaded Rivets": ["Rivet Nut Demo 1", "Rivet Nut Demo 2", "Rivet Nut Demo 3", "Rivet Nut Demo 4"],
    "Drive Rivets": ["DIN Drive Rivet Demo", "ISO Drive Rivet Demo", "ASME Drive Rivet Demo", "BS Drive Rivet Demo"]
};

const pradakoStandardFamilies = [
    { key: "ANSI", title: "ANSI", image: "/assets/images/products/standards/ansi.png" },
    { key: "ASME", title: "ASME", image: "/assets/images/products/standards/asme.png" },
    { key: "ASTM", title: "ASTM", image: "/assets/images/products/standards/astm.png" },
    { key: "AS / AS-NZS", title: "AS / AS-NZS", image: "/assets/images/products/standards/as-nzs.png" },
    { key: "BS / BSI", title: "BS / BSI", image: "/assets/images/products/standards/bsi.png" },
    { key: "CEN / EN", title: "CEN / EN", image: "/assets/images/products/standards/cen.png" },
    { key: "DASt", title: "DASt", image: "/assets/images/products/standards/dast.png" },
    { key: "DIN", title: "DIN", image: "/assets/images/products/standards/din.png" },
    { key: "GOST / GOST R", title: "GOST / GOST R", image: "/assets/images/products/standards/gost.png" },
    { key: "IS", title: "IS", image: "/assets/images/products/standards/is.png" },
    { key: "ISO", title: "ISO", image: "/assets/images/products/standards/iso.png" },
    { key: "JIS", title: "JIS", image: "/assets/images/products/standards/jis.png" },
    { key: "MIL / MS", title: "MIL / MS", image: "/assets/images/products/standards/mil-ms.png" },
    { key: "NAS", title: "NAS", image: "/assets/images/products/standards/nas.png" },
    { key: "PN", title: "PN", image: "/assets/images/products/standards/pn.png" },
    { key: "UNI", title: "UNI", image: "/assets/images/products/standards/uni.png" },
    { key: "MIX", title: "MIX", image: "/assets/images/products/standards/mix.png" }
];

/* ==========================================================
   04. COMMON HELPERS
========================================================== */

const pradakoCatalogueState = {
    mode: "type",
    view: "grid",
    selectedType: null,
    selectedSubtype: null,
    selectedStandardFamily: null
};

function pradakoGet(id) {
    return document.getElementById(id);
}

function escapeHtmlStd(text) {
    if (text === null || text === undefined) return "";

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttrStd(text) {
    return escapeHtmlStd(text);
}

function pradakoSlug(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/\+/g, "plus")
        .replace(/six lobe/g, "six-lobe")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function pradakoInitials(text) {
    return String(text || "P")
        .split(/[\s/.-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();
}

function pradakoCatalogueSearchValue() {
    const input = pradakoGet("productSearch");
    return input ? input.value.trim().toLowerCase() : "";
}

function pradakoTextMatches(data, search) {
    if (!search) return true;
    return JSON.stringify(data).toLowerCase().includes(search);
}

/* ==========================================================
   COMMON SEARCH CONTROL
   Same search + clear button behaviour for every search box
========================================================== */

function pradakoBindSearchControl(options) {
    const input = options?.input || null;
    const clearButton = options?.clearButton || null;
    const onSearch = typeof options?.onSearch === "function"
        ? options.onSearch
        : function () {};
    const hiddenClass = options?.hiddenClass || "is-hidden";

    if (!input || input.dataset.pmewSearchControlReady === "true") return;

    input.dataset.pmewSearchControlReady = "true";

    const updateClearButton = () => {
        if (!clearButton) return;

        clearButton.classList.toggle(
            hiddenClass,
            input.value.trim() === ""
        );
    };

    const runSearch = () => {
        updateClearButton();
        onSearch(input.value.trim());
    };

    input.addEventListener("input", runSearch);

    input.addEventListener("search", runSearch);

    input.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            input.value = "";
            runSearch();
            input.focus();
        }

        if (event.key === "Enter") {
            event.preventDefault();
            runSearch();
        }
    });

    if (clearButton && clearButton.dataset.pmewSearchClearReady !== "true") {
        clearButton.dataset.pmewSearchClearReady = "true";

        clearButton.addEventListener("click", event => {
            event.preventDefault();

            input.value = "";
            runSearch();
            input.focus();
        });
    }

    updateClearButton();
}

function pradakoGetTypeImage(typeKey) {
    const item = pradakoProductTypes.find(product => product.key === typeKey);
    return item ? item.image : "/assets/images/products/catalogue/pan-head-machine-screw.png";
}

function pradakoGetSubtypeImage(subtype) {
    return `/images/product/subtypes/${pradakoSlug(subtype)}.png`;
}

function pradakoGetStandardProductImage(standard) {
    return `/images/product/standards-products/${pradakoSlug(standard)}.png`;
}

function pradakoGetStandardProductUrl(standard) {
    if (
        window.PMEWStandardRouteResolver &&
        typeof window.PMEWStandardRouteResolver.resolve === "function"
    ) {
        return window.PMEWStandardRouteResolver.resolve(standard);
    }

    return `/pages/products/standard-products.html?standard=${encodeURIComponent(
        String(standard || "").trim()
    )}`;
}

function pradakoFindFamilyFromSubtype(subtype) {
    for (const [family, groups] of Object.entries(pradakoSubtypeData)) {
        const found = groups.some(group => group.items.includes(subtype));

        if (found) return family;
    }

    return "Fasteners";
}

function pradakoImageHTML(primary, fallback, altText) {
    const initials = pradakoInitials(altText);

    return `
        <img src="${escapeAttrStd(primary)}"
             alt="${escapeAttrStd(altText)}"
             loading="lazy"
             data-fallback="${escapeAttrStd(fallback || "")}"
             onerror="
                if (this.dataset.fallback && this.src.indexOf(this.dataset.fallback) === -1) {
                    this.src = this.dataset.fallback;
                } else {
                    this.style.display = 'none';
                    this.nextElementSibling.style.display = 'grid';
                }
             ">

        <span class="pradako-image-fallback" style="display:none;">
            ${escapeHtmlStd(initials)}
        </span>
    `;
}

/* ==========================================================
   05. STANDARD GROUPING HELPERS
   This creates:
   DIN STANDARDS
   ISO STANDARDS
   ASME STANDARDS
   OTHER STANDARDS
========================================================== */

function pradakoStandardBadge(standard) {
    const text = String(standard || "").toUpperCase().trim();

    if (text.startsWith("DIN") && text.includes("ISO")) return "DIN / ISO";
    if (text.startsWith("ASME")) return "ASME";
    if (text.startsWith("ANSI")) return "ANSI";
    if (text.startsWith("ASTM")) return "ASTM";
    if (text.startsWith("AS/NZS") || text.startsWith("AS NZS") || text.startsWith("AS-NZS") || /^AS\s+\d/.test(text)) return "AS / AS-NZS";
    if (text.startsWith("BSI") || text.startsWith("BS")) return "BS / BSI";
    if (text.startsWith("CEN") || text.startsWith("EN ") || text.startsWith("EN-") || text.startsWith("EN/")) return "CEN / EN";
    if (text.startsWith("DAST")) return "DASt";
    if (text.startsWith("DIN")) return "DIN";
    if (text.startsWith("GOST")) return "GOST";
    if (text.startsWith("ISO")) return "ISO";
    if (text.startsWith("IS ") || /^IS\d/.test(text)) return "IS";
    if (text.startsWith("JIS")) return "JIS";
    if (text.startsWith("MIL") || text.startsWith("MS ") || /^MS\d/.test(text)) return "MIL / MS";
    if (text.startsWith("NAS")) return "NAS";
    if (text.startsWith("PN")) return "PN";
    if (text.startsWith("UNI")) return "UNI";

    return "STD";
}

function pradakoStandardGroup(standard) {
    const family = pradakoDetectStandardFamily(standard);

    if (family === "MIX") return "OTHER";

    return family;
}

function pradakoStandardNumber(standard) {
    const match = String(standard || "").match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
}

function pradakoSortStandardsAscending(a, b) {
    const numberA = pradakoStandardNumber(a);
    const numberB = pradakoStandardNumber(b);

    if (numberA !== numberB) return numberA - numberB;

    return String(a).localeCompare(String(b), undefined, {
        numeric: true,
        sensitivity: "base"
    });
}

function pradakoGroupStandards(standards) {
    const groupOrder = [
        "ANSI",
        "ASME",
        "ASTM",
        "AS / AS-NZS",
        "BS / BSI",
        "CEN / EN",
        "DASt",
        "DIN",
        "GOST / GOST R",
        "IS",
        "ISO",
        "JIS",
        "MIL / MS",
        "NAS",
        "PN",
        "UNI",
        "OTHER"
    ];

    const grouped = {};

    groupOrder.forEach(group => {
        grouped[group] = [];
    });

    standards.forEach(standard => {
        const group = pradakoStandardGroup(standard);

        if (!grouped[group]) {
            grouped[group] = [];
        }

        grouped[group].push(standard);
    });

    return groupOrder
        .filter(group => grouped[group] && grouped[group].length)
        .map(group => ({
            group,
            title: group === "OTHER" ? "OTHER STANDARDS" : `${group} STANDARDS`,
            items: group === "OTHER"
                ? grouped[group]
                : grouped[group].sort(pradakoSortStandardsAscending)
        }));
}

/* ==========================================================
   STANDARD FAMILY HELPERS
   Used for Browse by Standard (Number): ANSI / ASME / DIN / ISO / MIX etc.
========================================================== */

function pradakoDetectStandardFamily(standard) {
    const text = String(standard || "").toUpperCase().trim();

    if (text.startsWith("ANSI")) return "ANSI";
    if (text.startsWith("ASME")) return "ASME";
    if (text.startsWith("ASTM")) return "ASTM";
    if (text.startsWith("AS/NZS") || text.startsWith("AS NZS") || text.startsWith("AS-NZS") || /^AS\s+\d/.test(text)) return "AS / AS-NZS";
    if (text.startsWith("BSI") || text.startsWith("BS")) return "BS / BSI";
    if (text.startsWith("CEN") || text.startsWith("EN ") || text.startsWith("EN-") || text.startsWith("EN/")) return "CEN / EN";
    if (text.startsWith("DAST")) return "DASt";
    if (text.startsWith("DIN")) return "DIN";
    if (text.startsWith("GOST")) return "GOST / GOST R";
    if (text.startsWith("ISO")) return "ISO";
    if (text.startsWith("IS ") || /^IS\d/.test(text)) return "IS";
    if (text.startsWith("JIS")) return "JIS";
    if (text.startsWith("MIL") || text.startsWith("MS ") || /^MS\d/.test(text)) return "MIL / MS";
    if (text.startsWith("NAS")) return "NAS";
    if (text.startsWith("PN")) return "PN";
    if (text.startsWith("UNI")) return "UNI";

    return "MIX";
}

function pradakoStandardMatchesFamily(standard, familyKey) {
    return pradakoDetectStandardFamily(standard) === familyKey;
}

function pradakoGetStandardFamily(familyKey) {
    return pradakoStandardFamilies.find(family => {
        return family.key === familyKey || family.title === familyKey;
    }) || null;
}

function pradakoBuildStandardFamilyEntries(familyKey, search) {
    const entries = [];
    const seen = new Set();

    pradakoProductTypes.forEach(type => {
        const groups = pradakoSubtypeData[type.key] || [];

        groups.forEach(group => {
            group.items.forEach(subtype => {
                const standards = pradakoStandardsBySubtype[subtype] || [];

                standards.forEach(standard => {
                    if (!pradakoStandardMatchesFamily(standard, familyKey)) return;

                    const haystack = [
                        familyKey,
                        type.title,
                        type.key,
                        group.group,
                        subtype,
                        standard
                    ].join(" ").toLowerCase();

                    if (search && !haystack.includes(search)) return;

                    const uniqueKey = `${familyKey}__${type.key}__${subtype}__${standard}`;

                    if (seen.has(uniqueKey)) return;

                    seen.add(uniqueKey);

                    entries.push({
                        familyKey,
                        typeKey: type.key,
                        typeTitle: type.title,
                        groupName: group.group,
                        subtype,
                        standard
                    });
                });
            });
        });
    });

    return entries.sort((a, b) => {
        const indexA = pradakoProductTypes.findIndex(type => type.key === a.typeKey);
        const indexB = pradakoProductTypes.findIndex(type => type.key === b.typeKey);

        if (indexA !== indexB) return indexA - indexB;

        const subtypeCompare = String(a.subtype).localeCompare(String(b.subtype), undefined, {
            numeric: true,
            sensitivity: "base"
        });

        if (subtypeCompare !== 0) return subtypeCompare;

        return pradakoSortStandardsAscending(a.standard, b.standard);
    });
}

function pradakoGroupStandardFamilyEntriesByType(entries) {
    const grouped = [];

    entries.forEach(entry => {
        let typeBlock = grouped.find(block => block.typeKey === entry.typeKey);

        if (!typeBlock) {
            typeBlock = {
                typeKey: entry.typeKey,
                typeTitle: entry.typeTitle,
                items: []
            };

            grouped.push(typeBlock);
        }

        typeBlock.items.push(entry);
    });

    return grouped;
}

function pradakoFamilyMatchesSearch(family, search) {
    if (!search) return true;
    if (pradakoTextMatches(family, search)) return true;

    return pradakoBuildStandardFamilyEntries(family.key, search).length > 0;
}

/* ==========================================================
   08. CATALOGUE ROUTER — STATE / BUTTONS
========================================================== */

function pradakoCatalogueSetTitle(title, subtitle, count) {
    const titleEl = pradakoGet("catalogueTitle");
    const subtitleEl = pradakoGet("catalogueSubtitle");
    const countEl = pradakoGet("catalogueCount");

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    if (countEl) countEl.textContent = count + (count === 1 ? " entry" : " entries");
}

function pradakoCatalogueSetBreadcrumb(items) {
    const breadcrumb = pradakoGet("catalogueBreadcrumb");

    if (!breadcrumb) return;

    breadcrumb.innerHTML = (items || []).map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.action) {
            return `
                <strong class="pmew-breadcrumb-item">
                    ${escapeHtmlStd(item.label)}
                </strong>
            `;
        }

        const typeAttr = item.type
            ? ` data-type="${escapeAttrStd(item.type)}"`
            : "";

        const familyAttr = item.family
            ? ` data-family="${escapeAttrStd(item.family)}"`
            : "";

        return `
            <button type="button"
                    class="pmew-breadcrumb-item"
                    data-breadcrumb-action="${escapeAttrStd(item.action)}"${typeAttr}${familyAttr}>
                ${escapeHtmlStd(item.label)}
            </button>
        `;
    }).join("");
}

function pradakoCatalogueSetLayout() {
    const content = pradakoGet("catalogueContent");

    if (!content) return;

    content.className =
        pradakoCatalogueState.view === "grid"
            ? "pradako-products-standards-grid grid-view"
            : "pradako-products-standards-grid list-view";
}

function pradakoCatalogueEmpty(count) {
    const empty = pradakoGet("catalogueEmpty");

    if (!empty) return;

    empty.style.display = count === 0 ? "block" : "none";
}

function pradakoRevealCatalogueContentNow() {
    const content = pradakoGet("catalogueContent");

    if (!content) return;

    const reveal = () => {
        content
            .querySelectorAll(
                ".pradako-standard-group-section, " +
                ".pradako-standard-group-head, " +
                ".pradako-products-standards-grid, " +
                ".pradako-catalogue-product-card"
            )
            .forEach(element => {
                element.classList.add("pmew-page-visible");
            });
    };

    requestAnimationFrame(reveal);
    setTimeout(reveal, 80);
}

function pradakoGetModeButtons() {
    const buttons = [];

    const typeBtn = pradakoGet("typeViewBtn");
    const standardBtn = pradakoGet("standardViewBtn");

    if (typeBtn) buttons.push(typeBtn);
    if (standardBtn) buttons.push(standardBtn);

    document
        .querySelectorAll(".pradako-products-toggle-btn[data-mode]")
        .forEach(button => {
            if (!buttons.includes(button)) buttons.push(button);
        });

    return buttons;
}

function pradakoGetViewButtons() {
    const buttons = [];

    const gridBtn = pradakoGet("gridViewBtn");
    const listBtn = pradakoGet("listViewBtn");

    if (gridBtn) buttons.push(gridBtn);
    if (listBtn) buttons.push(listBtn);

    document
        .querySelectorAll(".pradako-products-action-btn[data-view]")
        .forEach(button => {
            if (!buttons.includes(button)) buttons.push(button);
        });

    return buttons;
}

function pradakoUpdateModeButtons(mode) {
    pradakoGetModeButtons().forEach(button => {
        const buttonMode = button.dataset.mode ||
            (button.id === "standardViewBtn" ? "standard" : "type");

        const isActive = buttonMode === mode;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
}

function pradakoUpdateViewButtons(view) {
    pradakoGetViewButtons().forEach(button => {
        const buttonView = button.dataset.view ||
            (button.id === "listViewBtn" ? "list" : "grid");

        const isActive = buttonView === view;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
}

function setCatalogueMode(mode) {
    pradakoCatalogueState.mode = mode === "standard" ? "standard" : "type";
    pradakoCatalogueState.selectedType = null;
    pradakoCatalogueState.selectedSubtype = null;
    pradakoCatalogueState.selectedStandardFamily = null;

    pradakoUpdateModeButtons(pradakoCatalogueState.mode);

    renderPradakoCatalogue();
}

function setCatalogueView(view) {
    pradakoCatalogueState.view = view === "list" ? "list" : "grid";

    pradakoUpdateViewButtons(pradakoCatalogueState.view);

    renderPradakoCatalogue();
}

function setCatalogueType(typeKey) {
    pradakoCatalogueState.mode = "type";
    pradakoCatalogueState.selectedType = typeKey;
    pradakoCatalogueState.selectedSubtype = null;
    pradakoCatalogueState.selectedStandardFamily = null;

    pradakoUpdateModeButtons("type");

    renderPradakoCatalogue();

    pradakoGet("standards")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function setCatalogueSubtype(subtype) {
    pradakoCatalogueState.mode = "type";
    pradakoCatalogueState.selectedSubtype = subtype;
    pradakoCatalogueState.selectedStandardFamily = null;

    pradakoUpdateModeButtons("type");

    renderPradakoCatalogue();

    pradakoGet("standards")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function setCatalogueStandardFamily(familyKey) {
    pradakoCatalogueState.mode = "standard";
    pradakoCatalogueState.selectedType = null;
    pradakoCatalogueState.selectedSubtype = null;
    pradakoCatalogueState.selectedStandardFamily = familyKey;

    pradakoUpdateModeButtons("standard");

    renderPradakoCatalogue();

    pradakoGet("standards")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function renderPradakoCatalogue() {
    const content = pradakoGet("catalogueContent");

    if (!content) return;

    const detail = pradakoGet("catalogueDetail");

    if (detail) {
        detail.classList.remove("show");
        detail.innerHTML = "";
    }

    if (pradakoCatalogueState.mode === "standard") {
        if (pradakoCatalogueState.selectedStandardFamily) {
            renderPradakoStandardFamilyAllStandards(
                pradakoCatalogueState.selectedStandardFamily
            );
            return;
        }

        renderPradakoStandards();
        return;
    }

    if (pradakoCatalogueState.selectedSubtype) {
        renderPradakoSubtypeProducts(pradakoCatalogueState.selectedSubtype);
        return;
    }

    if (pradakoCatalogueState.selectedType) {
        renderPradakoSubtypeList(pradakoCatalogueState.selectedType);
        return;
    }

    renderPradakoTypes();
}

/* Compatibility for older inline onclick, if any still exists */
window.setCatalogueMode = setCatalogueMode;
window.setCatalogueView = setCatalogueView;
window.setCatalogueType = setCatalogueType;
window.setCatalogueSubtype = setCatalogueSubtype;
window.setCatalogueStandardFamily = setCatalogueStandardFamily;
window.renderPradakoCatalogue = renderPradakoCatalogue;

/* ==========================================================
   09. CATALOGUE ROUTER — RENDERERS
========================================================== */

function renderPradakoTypes() {
    pradakoCatalogueSetLayout();

    const search = pradakoCatalogueSearchValue();
    const data = pradakoProductTypes.filter(item => pradakoTextMatches(item, search));

    pradakoCatalogueSetTitle(
        "Browse by Standard (Type)",
        "Select Screws, Socket Screws, Nuts, Washers, Bolts, Threaded Rods / Studs, Structural Bolts or Rivets.",
        data.length
    );

    pradakoCatalogueSetBreadcrumb([
        { label: "Home", action: "mode-type" },
        { label: "By Standard (Type)" }
    ]);

    const content = pradakoGet("catalogueContent");

    if (!content) return;

    content.innerHTML = data.map(item => `
        <article class="pradako-catalogue-type-card"
                 data-catalogue-action="type"
                 data-type="${escapeAttrStd(item.key)}">

            <div class="pradako-catalogue-type-art">
                ${pradakoImageHTML(item.image, "", item.title)}
            </div>

            <div class="pradako-catalogue-type-body">
                <h4>${escapeHtmlStd(item.title)}</h4>
                <p>${escapeHtmlStd(item.note)}</p>
            </div>

        </article>
    `).join("");

    pradakoCatalogueEmpty(data.length);
}

function renderPradakoStandards() {
    pradakoCatalogueSetLayout();

    const search = pradakoCatalogueSearchValue();
    const data = pradakoStandardFamilies.filter(item => pradakoFamilyMatchesSearch(item, search));

    pradakoCatalogueSetTitle(
        "Browse by Standard (Number)",
        "Select ANSI, ASME, ASTM, AS / AS-NZS, BS / BSI, CEN / EN, DASt, DIN, GOST / GOST R, IS, ISO, JIS, MIL / MS, NAS, PN, UNI or MIX.",
        data.length
    );

    pradakoCatalogueSetBreadcrumb([
        { label: "Home", action: "mode-type" },
        { label: "By Standard (Number)" }
    ]);

    const content = pradakoGet("catalogueContent");

    if (!content) return;

    content.innerHTML = data.map(item => `
        <article class="pradako-products-standard-card"
                 data-catalogue-action="standard-family"
                 data-standard-family="${escapeAttrStd(item.key)}">

            <div class="pradako-products-standard-img">
                ${pradakoImageHTML(item.image, "", item.title)}
            </div>

            <p>${escapeHtmlStd(item.title)}</p>

        </article>
    `).join("");

    pradakoCatalogueEmpty(data.length);
}

function renderPradakoStandardFamilyAllStandards(familyKey) {
    const family = pradakoGetStandardFamily(familyKey);
    const familyTitle = family ? family.title : familyKey;
    const search = pradakoCatalogueSearchValue();

    const entries = pradakoBuildStandardFamilyEntries(familyKey, search);
    const groupedEntries = pradakoGroupStandardFamilyEntriesByType(entries);

    pradakoCatalogueSetTitle(
        `${familyTitle} Standards`,
        `${familyTitle} standard numbers are shown below. Product types are mentioned as section headings and each card also shows its product subtype.`,
        entries.length
    );

    pradakoCatalogueSetBreadcrumb([
        { label: "Home", action: "mode-type" },
        { label: "By Standard (Number)", action: "mode-standard" },
        { label: familyTitle }
    ]);

    const content = pradakoGet("catalogueContent");

    if (!content) return;

    content.className = "pradako-standard-group-wrap";

    if (!entries.length) {
        content.innerHTML = `
            <div class="pradako-custom-empty-result">
                No ${escapeHtmlStd(familyTitle)} standard numbers found for the current search.
            </div>
        `;

        pradakoCatalogueEmpty(0);
        return;
    }

    content.innerHTML = groupedEntries.map(typeBlock => {
        const cards = typeBlock.items.map(entry => {
            return `
                <article class="pradako-catalogue-product-card"
                         data-catalogue-action="standard-product-page"
                         data-standard="${escapeAttrStd(entry.standard)}"
                         data-subtype="${escapeAttrStd(entry.subtype)}"
                         data-url="${escapeAttrStd(pradakoGetStandardProductUrl(entry.standard))}">

                    <div class="pradako-catalogue-product-image">
                        ${pradakoImageHTML(
                            pradakoGetStandardProductImage(entry.standard),
                            pradakoGetSubtypeImage(entry.subtype),
                            entry.standard
                        )}
                    </div>

                    <span>${escapeHtmlStd(pradakoStandardBadge(entry.standard))}</span>

                    <h4>${escapeHtmlStd(entry.standard)}</h4>

                    <p>${escapeHtmlStd(entry.subtype)}</p>

                    ${entry.groupName
                        ? `<small class="pradako-standard-card-family-label">${escapeHtmlStd(entry.groupName)}</small>`
                        : ""
                    }

                    <b>Open Product Page <i class="fa-solid fa-angle-right"></i></b>

                </article>
            `;
        }).join("");

        return `
            <section class="pradako-standard-group-section">

                <div class="pradako-standard-group-head">
                    <h3>${escapeHtmlStd(typeBlock.typeTitle)}</h3>
                    <span>${typeBlock.items.length} ${typeBlock.items.length === 1 ? "entry" : "entries"}</span>
                </div>

                <div class="pradako-products-standards-grid ${pradakoCatalogueState.view === "list" ? "list-view" : "grid-view"}">
                    ${cards}
                </div>

            </section>
        `;
    }).join("");

    pradakoCatalogueEmpty(entries.length);
    pradakoRevealCatalogueContentNow();
}


function renderPradakoSubtypeList(typeKey) {
    const content = pradakoGet("catalogueContent");

    if (!content) return;

    const search = pradakoCatalogueSearchValue();
    const groups = pradakoSubtypeData[typeKey] || [];

    content.className = "pradako-catalogue-subtype-wrap";

    let visibleCount = 0;

    const html = groups.map(group => {
        const items = group.items.filter(item => {
            return !search ||
                item.toLowerCase().includes(search) ||
                group.group.toLowerCase().includes(search) ||
                typeKey.toLowerCase().includes(search);
        });

        visibleCount += items.length;

        if (!items.length) return "";

        return `
            <section class="pradako-catalogue-subtype-block">

                <div class="pradako-catalogue-subtype-head">
                    <h3>${escapeHtmlStd(typeKey)}</h3>
                    <span>${escapeHtmlStd(group.group)}</span>
                </div>

                <div class="pradako-catalogue-subtype-grid">
                    ${items.map(item => `
                        <article class="pradako-catalogue-subcat-card"
                                 data-catalogue-action="subtype"
                                 data-subtype="${escapeAttrStd(item)}">

                            <div class="pradako-catalogue-subcat-image">
                                ${pradakoImageHTML(
                                    pradakoGetSubtypeImage(item),
                                    pradakoGetTypeImage(typeKey),
                                    item
                                )}
                            </div>

                            <div class="pradako-catalogue-subcat-body">
                                <h4>${escapeHtmlStd(item)}</h4>
                                <small>
                                    ${escapeHtmlStd((pradakoStandardsBySubtype[item] || [])
                                        .slice(0, 4)
                                        .join(" · "))}
                                </small>
                            </div>

                            <b>View Products <i class="fa-solid fa-angle-right"></i></b>

                        </article>
                    `).join("")}
                </div>

            </section>
        `;
    }).join("");

    pradakoCatalogueSetTitle(
        typeKey,
        typeKey === "Screws"
            ? "Screws are arranged in TYPE 1, TYPE 2, TYPE 3 and TYPE 4 groups."
            : `Sub-categories for ${typeKey}.`,
        visibleCount
    );

    pradakoCatalogueSetBreadcrumb([
        { label: "Home", action: "mode-type" },
        { label: "By Type", action: "mode-type" },
        { label: typeKey }
    ]);

    content.innerHTML = html;

    pradakoCatalogueEmpty(visibleCount);
}

function renderPradakoSubtypeProducts(subtype) {
    const search = pradakoCatalogueSearchValue();
    const family = pradakoFindFamilyFromSubtype(subtype);
    const subtypeImage = pradakoGetSubtypeImage(subtype);

    const entries = (pradakoStandardsBySubtype[subtype] || [])
        .filter(item => item.toLowerCase().includes(search));

    const groupedEntries = pradakoGroupStandards(entries);

    pradakoCatalogueSetTitle(
        subtype,
        "Standards are separated into DIN, ISO, ASME and OTHER sections, arranged in ascending order.",
        entries.length
    );

    pradakoCatalogueSetBreadcrumb([
        { label: "Home", action: "mode-type" },
        { label: "By Type", action: "mode-type" },
        { label: family, action: "type", type: family },
        { label: subtype }
    ]);

    const content = pradakoGet("catalogueContent");

    if (!content) return;

    content.className = "pradako-standard-group-wrap";

    content.innerHTML = groupedEntries.map(groupBlock => `
        <section class="pradako-standard-group-section">

            <div class="pradako-standard-group-head">
                <h3>${escapeHtmlStd(groupBlock.title)}</h3>
                <span>${groupBlock.items.length} ${groupBlock.items.length === 1 ? "entry" : "entries"}</span>
            </div>

            <div class="pradako-products-standards-grid ${pradakoCatalogueState.view === "list" ? "list-view" : "grid-view"}">
                ${groupBlock.items.map(standard => `
                    <article class="pradako-catalogue-product-card"
                             data-catalogue-action="standard-product-page"
                             data-standard="${escapeAttrStd(standard)}"
                             data-subtype="${escapeAttrStd(subtype)}"
                             data-url="${escapeAttrStd(pradakoGetStandardProductUrl(standard))}">

                        <div class="pradako-catalogue-product-image">
                            ${pradakoImageHTML(
                                pradakoGetStandardProductImage(standard),
                                subtypeImage,
                                standard
                            )}
                        </div>

                        <span>${escapeHtmlStd(pradakoStandardBadge(standard))}</span>

                        <h4>${escapeHtmlStd(standard)}</h4>

                        <p>${escapeHtmlStd(subtype)}</p>

                        <b>Open Product Page <i class="fa-solid fa-angle-right"></i></b>

                    </article>
                `).join("")}
            </div>

        </section>
    `).join("");

    pradakoCatalogueEmpty(entries.length);
}

/* ==========================================================
   10. CATALOGUE DETAIL
   Kept for future use if you want modal/detail view again.
========================================================== */

function openCatalogueDetail(standard, subtype) {
    const detail = pradakoGet("catalogueDetail");

    if (!detail) return;

    const family = pradakoFindFamilyFromSubtype(subtype);
    const standardImage = pradakoGetStandardProductImage(standard);
    const subtypeImage = pradakoGetSubtypeImage(subtype);

    detail.innerHTML = `
        <div class="pradako-catalogue-detail">

            <button type="button" data-detail-close="true">
                Close
            </button>

            <span>${escapeHtmlStd(pradakoStandardBadge(standard))}</span>

            <h3>${escapeHtmlStd(standard)}</h3>

            <div class="pradako-catalogue-detail-grid">
                <div class="pradako-catalogue-detail-image">
                    ${pradakoImageHTML(standardImage, subtypeImage, standard)}
                </div>

                <p>
                    <strong>${escapeHtmlStd(subtype)}</strong><br>
                    This is the product detail area. Here you can add product image,
                    2D drawing, 3D STEP file, dimensions, weight chart and enquiry button.
                </p>
            </div>

            <div class="pradako-catalogue-specs">
                <div><small>Product Family</small><b>${escapeHtmlStd(family)}</b></div>
                <div><small>Product Type</small><b>${escapeHtmlStd(subtype)}</b></div>
                <div><small>Standard</small><b>${escapeHtmlStd(standard)}</b></div>
                <div><small>Drawing</small><b>2D PDF placeholder</b></div>
                <div><small>3D CAD</small><b>STEP placeholder</b></div>
                <div><small>Dimensions</small><b>Table placeholder</b></div>
            </div>

        </div>
    `;

    detail.classList.add("show");

    setTimeout(() => {
        detail.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 80);
}

window.openCatalogueDetail = openCatalogueDetail;

/* ==========================================================
   11. EVENT HANDLERS
========================================================== */

function pradakoHandleCatalogueClick(event) {
    const card = event.target.closest("[data-catalogue-action]");

    if (!card) return;

    const action = card.dataset.catalogueAction;

    if (action === "type") {
        setCatalogueType(card.dataset.type);
        return;
    }

    if (action === "subtype") {
        setCatalogueSubtype(card.dataset.subtype);
        return;
    }

    if (action === "detail") {
        openCatalogueDetail(card.dataset.standard, card.dataset.subtype);
        return;
    }

    if (action === "standard-family") {
        setCatalogueStandardFamily(card.dataset.standardFamily);
        return;
    }

    if (action === "standard-product-page") {
        const url = card.dataset.url;

        if (url) {
            window.location.href = url;
        }

        return;
    }

    if (action === "standard-link") {
        const url = card.dataset.url;

        if (url) {
            window.open(url, "_blank");
        }
    }
}

function pradakoHandleBreadcrumbClick(event) {
    const button = event.target.closest("[data-breadcrumb-action]");

    if (!button) return;

    const action = button.dataset.breadcrumbAction;

    if (action === "mode-type") {
        setCatalogueMode("type");
        return;
    }

    if (action === "mode-standard") {
        setCatalogueMode("standard");
        return;
    }

    if (action === "type") {
        setCatalogueType(button.dataset.type);
    }
}

function pradakoHandleDetailClose(event) {
    const button = event.target.closest("[data-detail-close]");

    if (!button) return;

    const detail = pradakoGet("catalogueDetail");

    if (detail) {
        detail.classList.remove("show");
        detail.innerHTML = "";
    }
}

function pradakoInitCatalogueEvents() {
    const controls = document.querySelector(".pradako-products-controls");
    const searchInput = pradakoGet("productSearch");
    const searchClearBtn = pradakoGet("productSearchClear");
    const content = pradakoGet("catalogueContent");
    const breadcrumb = pradakoGet("catalogueBreadcrumb");
    const detail = pradakoGet("catalogueDetail");

    if (controls && controls.dataset.catalogueControlsReady !== "true") {
        controls.dataset.catalogueControlsReady = "true";

        controls.addEventListener("click", event => {
            const modeButton = event.target.closest(".pradako-products-toggle-btn");
            const viewButton = event.target.closest(".pradako-products-action-btn[data-view]");
            const exportButton = event.target.closest("#exportBtn, .pradako-products-action-btn.export, [data-export]");

            if (modeButton && controls.contains(modeButton)) {
                event.preventDefault();

                const mode = modeButton.dataset.mode ||
                    (modeButton.id === "standardViewBtn" ? "standard" : "type");

                setCatalogueMode(mode === "standard" ? "standard" : "type");
                return;
            }

            if (viewButton && controls.contains(viewButton)) {
                event.preventDefault();

                const view = viewButton.dataset.view ||
                    (viewButton.id === "listViewBtn" ? "list" : "grid");

                setCatalogueView(view === "list" ? "list" : "grid");
                return;
            }

            if (exportButton && controls.contains(exportButton)) {
                event.preventDefault();
                alert("We are working on it. Please contact info@pradakomechanicals.com");
            }
        });
    }

    pradakoBindSearchControl({
        input: searchInput,
        clearButton: searchClearBtn,
        onSearch: function () {
            renderPradakoCatalogue();
        }
    });

    if (content && content.dataset.catalogueContentReady !== "true") {
        content.dataset.catalogueContentReady = "true";
        content.addEventListener("click", pradakoHandleCatalogueClick);
    }

    if (breadcrumb && breadcrumb.dataset.catalogueBreadcrumbReady !== "true") {
        breadcrumb.dataset.catalogueBreadcrumbReady = "true";
        breadcrumb.addEventListener("click", pradakoHandleBreadcrumbClick);
    }

    if (detail && detail.dataset.catalogueDetailReady !== "true") {
        detail.dataset.catalogueDetailReady = "true";
        detail.addEventListener("click", pradakoHandleDetailClose);
    }
}

/* ==========================================================
   FOOTER / EXTERNAL PRODUCT DEEP LINKING
   Examples:
   /standard-products.html?type=Nuts#standards
   /standard-products.html?type=Screws&subtype=Machine%20Screws#standards
   /standard-products.html?family=DIN#standards          PRADAKO CHANGE 1
========================================================== */

function pradakoApplyCatalogueRouteFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    const requestedType = urlParams.get("type");
    const requestedSubtype = urlParams.get("subtype");
    const requestedView = urlParams.get("view");

    /* PRADAKO CHANGE 1
       By Standard (Number) is now linkable in the same way as
       By Standard (Type), so a DIN or ISO listing can be shared. */
    const requestedFamily = urlParams.get("family");

    const familyExists =
        requestedFamily &&
        pradakoStandardFamilies.some(
            item => item.key.toLowerCase() ===
                    String(requestedFamily).toLowerCase()
        );

    const typeExists =
        requestedType &&
        Object.prototype.hasOwnProperty.call(
            pradakoSubtypeData,
            requestedType
        );

    const subtypeExists =
        requestedSubtype &&
        Object.prototype.hasOwnProperty.call(
            pradakoStandardsBySubtype,
            requestedSubtype
        );

    /*
       No catalogue route was supplied.
       Continue showing the normal default catalogue.
    */
    if (!typeExists && !subtypeExists && !familyExists) {
        return false;
    }

    /* PRADAKO CHANGE 1
       A family route switches the catalogue into standard-number
       mode and opens that standard body directly. */
    if (familyExists && !typeExists && !subtypeExists) {
        const matchedFamily = pradakoStandardFamilies.find(
            item => item.key.toLowerCase() ===
                    String(requestedFamily).toLowerCase()
        );

        pradakoCatalogueState.mode = "standard";

        pradakoCatalogueState.view =
            requestedView === "list" ? "list" : "grid";

        pradakoCatalogueState.selectedType = null;
        pradakoCatalogueState.selectedSubtype = null;
        pradakoCatalogueState.selectedStandardFamily = matchedFamily.key;

        pradakoUpdateModeButtons("standard");
        pradakoUpdateViewButtons(pradakoCatalogueState.view);

        renderPradakoCatalogue();

        window.requestAnimationFrame(() => {
            const standardsSection = document.getElementById("standards");

            if (standardsSection) {
                standardsSection.scrollIntoView({
                    behavior: "auto",
                    block: "start"
                });
            }
        });

        return true;
    }

    pradakoCatalogueState.mode = "type";

    pradakoCatalogueState.view =
        requestedView === "list" ? "list" : "grid";

    /*
       When only a subtype is supplied, automatically identify
       its parent family, for example:

       Machine Screws → Screws
       Hex Nuts → Nuts
       Hex Bolts → Bolts
    */
    pradakoCatalogueState.selectedType = typeExists
        ? requestedType
        : pradakoFindFamilyFromSubtype(requestedSubtype);

    pradakoCatalogueState.selectedSubtype = subtypeExists
        ? requestedSubtype
        : null;

    pradakoCatalogueState.selectedStandardFamily = null;

    pradakoUpdateModeButtons("type");
    pradakoUpdateViewButtons(pradakoCatalogueState.view);

    renderPradakoCatalogue();

    /*
       Wait until the dynamic catalogue has been rendered,
       then move to the standard-products section.
    */
    window.requestAnimationFrame(() => {
        const standardsSection = document.getElementById("standards");

        if (standardsSection) {
            standardsSection.scrollIntoView({
                behavior: "auto",
                block: "start"
            });
        }
    });

    return true;
}


/* ==========================================================
   INITIALISATION
   One DOMContentLoaded block. Catalogue only.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    pradakoInitCatalogueEvents();

    pradakoCatalogueState.mode = "type";
    pradakoCatalogueState.view = "grid";

    pradakoUpdateModeButtons("type");
    pradakoUpdateViewButtons("grid");

    /*
       Reads type, subtype or family from the URL.
       If no route exists, show the normal catalogue homepage.
    */
    const catalogueRouteApplied = pradakoApplyCatalogueRouteFromUrl();

    if (!catalogueRouteApplied) {
        renderPradakoCatalogue();
    }
});


/* ==========================================================
   STANDARD FASTENER IMAGE PATCH
   Paste this block at the VERY END of products.js.

   Required folder position:
   products.html
   standard-fasteners/
   js/products.js
========================================================== */

(() => {
    const ROOT = "/assets/images/watermarked-images/standard-fasteners";

    const typeImages = Object.freeze({
        "Screws":
            `${ROOT}/screws/6-machine-screws/din-7985iso-7045.jpg`,

        "Socket Screws":
            `${ROOT}/screws/1-socket-screws/iso-4762.jpg`,

        "Nuts":
            `${ROOT}/nuts/din-555.jpg`,

        "Washers":
            `${ROOT}/washers/din-125.jpg`,

        "Bolts":
            `${ROOT}/bolts/din-931.jpg`,

        "Threaded Rods / Studs":
            "/assets/images/products/catalogue/threaded-rod.png",

        "Structural Bolts":
            `${ROOT}/hv-bolts/din-6914.jpg`,

        "Rivets":
            "/assets/images/products/catalogue/rivet.png"
    });

    const subtypeFolders = Object.freeze({
        "Self Tapping Screws": [
            "screws/5-self-tapping-screws"
        ],

        "Machine Screws": [
            "screws/6-machine-screws"
        ],

        "Sheetmetal Screws": [
            "screws/sheet-metal-screws"
        ],

        "Countersunk Screws": [
            "screws/11-countersunk-screws"
        ],

        "Socket Screws": [
            "screws/1-socket-screws"
        ],

        "Shoulder Screws": [
            "screws/3-shoulder-screws"
        ],

        "Hex Cap Screws": [
            "screws/10-hex-cap-screws"
        ],

        "Set Screws": [
            "screws/9-set-screws"
        ],

        "Grub Screws": [
            "screws/grub-screws",
            "screws/9-set-screws"
        ],

        "Security Screws": [
            "screws/7-security-screws"
        ],

        "Coach Screws": [
            "screws/coach-screw"
        ],

        "Screws with Washer Assemblies": [
            "screws/screw-with-washer-assemblies"
        ],

        "Wing Screws": [
            "screws"
        ],

        "Wood Screws": [
            "screws/2-wood-screws"
        ],

        "Chipboard Screws": [
            "screws/8-chipboard-screw"
        ],

        "Self Drilling Screws": [
            "screws/4-self-drilling-screws"
        ],

        "Socket Head Cap Screws": [
            "screws/1-socket-screws"
        ],

        "Socket Countersunk Screws": [
            "screws/1-socket-screws",
            "screws/11-countersunk-screws"
        ],

        "Socket Button Head Screws": [
            "screws/1-socket-screws"
        ],

        "Low Head Socket Screws": [
            "screws/1-socket-screws"
        ],

        "Shoulder Socket Screws": [
            "screws/3-shoulder-screws"
        ],

        "Socket Set Screws": [
            "screws/1-socket-screws",
            "screws/9-set-screws"
        ],

        "Socket Pipe Plugs": [],

        "Hex Nuts": [
            "nuts"
        ],

        "Heavy Hex Nuts": [
            "nuts"
        ],

        "Nyloc Nuts": [
            "nuts"
        ],

        "Flange Nuts": [
            "nuts"
        ],

        "Thin Nuts": [
            "nuts"
        ],

        "Lock Nuts": [
            "nuts"
        ],

        "Weld Nuts": [
            "nuts"
        ],

        "Square Nuts": [
            "nuts"
        ],

        "Castle Nuts": [
            "nuts"
        ],

        "Rivet Nuts": [
            "nuts"
        ],

        "Acorn Nuts": [
            "nuts"
        ],

        "Slotted Nuts": [
            "nuts"
        ],

        "Wing Nuts": [
            "nuts"
        ],

        "Other Special Nuts": [
            "nuts"
        ],

        "Plain Washers": [
            "washers"
        ],

        "Spring Lock Washers": [
            "washers"
        ],

        "Hardened Washers": [
            "washers"
        ],

        "Structural Washers": [
            "washers"
        ],

        "Serrated Washers": [
            "washers"
        ],

        "Square Washers": [
            "washers"
        ],

        "Belleville Washers": [
            "washers"
        ],

        "Thin Washers": [
            "washers"
        ],

        "Sealing Washers": [
            "washers"
        ],

        "Hex Bolts": [
            "bolts"
        ],

        "Hex Screws": [
            "bolts"
        ],

        "Hex Head Bolts with Hex Nuts for Steel Structures": [
            "bolts"
        ],

        "Fine Thread Hex Head Bolts Half Thread": [
            "bolts"
        ],

        "Hexagon Head Screws with Metric Fine Threads Full Thread": [
            "bolts"
        ],

        "Hexagon Fit Bolts with Long Thread": [
            "bolts"
        ],

        "Hexagon Fit Bolts with Short Threaded Portion": [
            "bolts"
        ],

        "Flat CSK NIB Bolts": [
            "bolts"
        ],

        "Flat CSK NIB Bolts with Hex Nuts": [
            "bolts"
        ],

        "Flat CSK Bolts with Long Square": [
            "bolts"
        ],

        "Flat CSK Square Neck Bolts with Short Square Neck Plow Bolts": [
            "bolts"
        ],

        "Hex Flange Bolts": [
            "bolts"
        ],

        "Carriage Bolts": [
            "bolts"
        ],

        "Anchor Bolts": [
            "bolts"
        ],

        "Half Coach Bolts": [
            "bolts"
        ],

        "T Bolts": [
            "bolts"
        ],

        "Eye Bolts": [
            "bolts"
        ],

        "U Bolts": [
            "bolts"
        ],

        "J Bolts": [
            "bolts"
        ],

        "EN 14399 HV Assemblies": [
            "hv-bolts"
        ],

        "EN 15048 SB Assemblies": [
            "hv-bolts"
        ],

        "ASTM F3125 A325 Bolts": [
            "hv-bolts"
        ],

        "ASTM F3125 A490 Bolts": [
            "hv-bolts"
        ],

        "SQ SQ Holding Down Bolts": [
            "hv-bolts"
        ],

        "Heavy Hex Structural Nuts": [
            "nuts"
        ],

        "Hardened Structural Washers": [
            "washers"
        ],

        "DTI Washers": [
            "washers"
        ],

        "Hot Dip Galvanized Assemblies": [
            "hv-bolts"
        ]
    });

    const subtypeImages = Object.freeze({
        "Self Tapping Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/5-self-tapping-screws/din-7981.jpg",

        "Machine Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/6-machine-screws/din-7985iso-7045.jpg",

        "Sheetmetal Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/sheet-metal-screws/din-7981iso-7049.jpg",

        "Countersunk Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/11-countersunk-screws/din-7991-hexagon-socket-countersunk-head-screw.png",

        "Socket Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/iso-4762.jpg",

        "Shoulder Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/3-shoulder-screws/precision-socket-shoulder-screws.jpg",

        "Hex Cap Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/10-hex-cap-screws/din-933-fully-threaded-hexagon-head-screw.png",

        "Set Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/9-set-screws/din-913.jpg",

        "Grub Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/grub-screws/din-913.jpg",

        "Security Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/7-security-screws/din-7991-hex-socket-pin-countersunk-security-screws.jpg",

        "Coach Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/coach-screw/din-571.jpg",

        "Screws with Washer Assemblies":
            "/assets/images/watermarked-images/standard-fasteners/screws/screw-with-washer-assemblies/din-6900.jpg",

        "Wing Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/din-316-wing-screws.jpg",

        "Wood Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/2-wood-screws/din-7997.jpg",

        "Chipboard Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/8-chipboard-screw/din-7505-a.jpg",

        "Self Drilling Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/4-self-drilling-screws/din-7504k-with-epdm-washer.jpg",

        "Socket Head Cap Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/iso-4762.jpg",

        "Socket Countersunk Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/din-7991.jpg",

        "Socket Button Head Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/iso-7380-1.jpg",

        "Low Head Socket Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/din-7984.jpg",

        "Shoulder Socket Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/3-shoulder-screws/precision-socket-shoulder-screws.jpg",

        "Socket Set Screws":
            "/assets/images/watermarked-images/standard-fasteners/screws/9-set-screws/din-913.jpg",

        "Hex Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-555.jpg",

        "Heavy Hex Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-6915.jpg",

        "Nyloc Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-985.jpg",

        "Flange Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-6923.jpg",

        "Thin Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-936.jpg",

        "Lock Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-985.jpg",

        "Weld Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-928.jpg",

        "Square Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-557.jpg",

        "Castle Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-935.jpg",

        "Rivet Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-555.jpg",

        "Acorn Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-555.jpg",

        "Slotted Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-935.jpg",

        "Wing Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-555.jpg",

        "Other Special Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-555.jpg",

        "Plain Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/din-125.jpg",

        "Spring Lock Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/din-127.jpg",

        "Hardened Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/din-6916.jpg",

        "Structural Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/hsfg-washers.jpg",

        "Serrated Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/din-6907.jpg",

        "Square Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/din-436.jpg",

        "Belleville Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/din-2093.jpg",

        "Thin Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/iso-7090.jpg",

        "Sealing Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/din-6907.jpg",

        "Hex Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-931.jpg",

        "Hex Screws":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-558.jpg",

        "Hex Head Bolts with Hex Nuts for Steel Structures":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-7990.jpg",

        "Fine Thread Hex Head Bolts Half Thread":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-960.jpg",

        "Hexagon Head Screws with Metric Fine Threads Full Thread":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-961.jpg",

        "Hexagon Fit Bolts with Long Thread":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-609.jpg",

        "Hexagon Fit Bolts with Short Threaded Portion":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-610.jpg",

        "Flat CSK NIB Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-604.jpg",

        "Flat CSK NIB Bolts with Hex Nuts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-605.jpg",

        "Flat CSK Bolts with Long Square":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-607.jpg",

        "Flat CSK Square Neck Bolts with Short Square Neck Plow Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-608.jpg",

        "Hex Flange Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-6921.jpg",

        "Carriage Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-603.jpg",

        "Anchor Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-601.jpg",

        "Half Coach Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-601.jpg",

        "T Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-188.jpg",

        "Eye Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-188.jpg",

        "U Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-601.jpg",

        "J Bolts":
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-601.jpg",

        "EN 14399 HV Assemblies":
            "/assets/images/watermarked-images/standard-fasteners/hv-bolts/din-6914.jpg",

        "EN 15048 SB Assemblies":
            "/assets/images/watermarked-images/standard-fasteners/hv-bolts/iso-7411.jpg",

        "ASTM F3125 A325 Bolts":
            "/assets/images/watermarked-images/standard-fasteners/hv-bolts/din-6914.jpg",

        "ASTM F3125 A490 Bolts":
            "/assets/images/watermarked-images/standard-fasteners/hv-bolts/is-3757.jpg",

        "SQ SQ Holding Down Bolts":
            "/assets/images/watermarked-images/standard-fasteners/hv-bolts/iso-7411.jpg",

        "Heavy Hex Structural Nuts":
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-6915.jpg",

        "Hardened Structural Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/din-6916.jpg",

        "DTI Washers":
            "/assets/images/watermarked-images/standard-fasteners/washers/hsfg-washers.jpg",

        "Hot Dip Galvanized Assemblies":
            "/assets/images/watermarked-images/standard-fasteners/hv-bolts/din-6914.jpg"
    });

    const exactImages = Object.freeze({
        "Socket Screws||DIN 912 / ISO 4762":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/din-912-without-serration-iso-4762.jpg",

        "Socket Head Cap Screws||DIN 912":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/din-912-without-serration-iso-4762.jpg",

        "Socket Countersunk Screws||DIN 7991":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/din-7991.jpg",

        "Socket Button Head Screws||ISO 7380":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/iso-7380-1.jpg",

        "Machine Screws||DIN 7985 / ISO 7045":
            "/assets/images/watermarked-images/standard-fasteners/screws/6-machine-screws/din-7985iso-7045.jpg",

        "Security Screws||DIN 7991":
            "/assets/images/watermarked-images/standard-fasteners/screws/7-security-screws/din-7991-hex-socket-pin-countersunk-security-screws.jpg",

        "Security Screws||ISO 7380":
            "/assets/images/watermarked-images/standard-fasteners/screws/7-security-screws/iso-7380-hexalobular-pin-button-security-scews.jpg",

        "Self Drilling Screws||DIN 7504":
            "/assets/images/watermarked-images/standard-fasteners/screws/4-self-drilling-screws/din-7504k-with-epdm-washer.jpg",

        "Wing Screws||DIN 316":
            "/assets/images/watermarked-images/standard-fasteners/screws/din-316-wing-screws.jpg",

        "Socket Screws||DIN 933 / DIN 934 / ISO 4017":
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/din-933934-iso-4017.jpg"
    });

    const extensions = [
        "jpg",
        "png",
        "jpeg",
        "webp"
    ];

    function unique(values) {
        return [...new Set(
            (values || [])
                .flat()
                .map(value =>
                    String(value || "").trim()
                )
                .filter(Boolean)
        )];
    }

    /* PRADAKO CHANGE 2
       Nuts and bolts were only ever searched inside their /1536/
       sub-folder, so deleting that folder would have broken every
       nut and bolt image. Each folder now also offers its parent
       directory, which holds the same filenames. The page works
       whether /1536/ is present or removed. */
    const subtypeFolderList = (function buildFolderFallbacks() {
        const expanded = {};

        Object.keys(subtypeFolders).forEach(subtype => {
            const list = [];

            (subtypeFolders[subtype] || []).forEach(folder => {
                if (list.indexOf(folder) === -1) {
                    list.push(folder);
                }

                const parent = String(folder).replace(/\/1536$/, "");

                if (parent !== folder && list.indexOf(parent) === -1) {
                    list.push(parent);
                }
            });

            expanded[subtype] = list;
        });

        return Object.freeze(expanded);
    })();

    function imagePath(pathValue) {
        const value = String(pathValue || "").trim();

        if (!value) {
            return "";
        }

        /*
           Root-absolute website paths such as /assets/images/... are
           already complete URLs and must never be prefixed with ROOT.
           Only subtype-relative paths such as screws/... belong below
           the standard-fastener ROOT directory.
        */
        if (
            value.startsWith("/") ||
            /^(?:https?:)?\/\//i.test(value) ||
            /^(?:data|blob):/i.test(value)
        ) {
            return value;
        }

        const cleanPath = value.replace(/^\.\//, "").replace(/^\/+/, "");
        return `${ROOT}/${cleanPath}`;
    }

    function slug(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/\+/g, "plus")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function standardSlugVariants(standard) {
        const raw =
            String(standard || "").trim();

        const variants =
            new Set();

        const add = value => {
            const result =
                slug(value);

            if (result) {
                variants.add(result);
            }
        };

        if (!raw) {
            return [];
        }

        const withoutParentheses =
            raw.replace(/\([^)]*\)/g, " ");

        const withoutDescription =
            withoutParentheses.split(/[—–]/)[0];

        add(raw);
        add(withoutParentheses);
        add(withoutDescription);

        const slashParts =
            raw.split("/")
                .map(part => part.trim())
                .filter(Boolean);

        if (slashParts.length >= 2) {
            const left =
                slashParts[0];

            const remaining =
                slashParts
                    .slice(1)
                    .join("/");

            const rightParts =
                remaining.split(/[—–]/);

            const right =
                rightParts[0] || "";

            const description =
                rightParts[1] || "";

            add(
                `${left} ${right} ${description}`
            );

            add(
                `${left}${right} ${description}`
            );

            if (description) {
                add(
                    `${left} ${description} ${right}`
                );
            }
        }

        raw.split(/[\/—–]/)
            .map(part => part.trim())
            .filter(Boolean)
            .forEach(add);

        const standardMatches =
            raw.match(
                /\b(?:DIN|ISO|ASME|ASTM|ANSI|BS|IS|JIS|PN|UNI|EN|CEN|NAS|MIL|MS)\s*[A-Z]?\s*\d+(?:[.\-]\d+)*(?:\s*[A-Z])?/gi
            ) || [];

        standardMatches.forEach(add);

        [...variants].forEach(value => {
            add(
                value.replace(
                    /-(iso|din|asme|astm|ansi|bs|is|jis|pn|uni|en|cen|nas|mil|ms)-/g,
                    "$1-"
                )
            );

            add(
                value.replace(
                    /(\d)([a-z])\b/g,
                    "$1-$2"
                )
            );

            add(
                value.replace(
                    /(\d)-([a-z])\b/g,
                    "$1$2"
                )
            );
        });

        return [...variants];
    }

    function findSubtypesForStandard(
        standard,
        explicitSubtype = ""
    ) {
        const results = [];

        if (explicitSubtype) {
            results.push(explicitSubtype);
        }

        if (
            typeof pradakoStandardsBySubtype ===
            "object"
        ) {
            Object.entries(
                pradakoStandardsBySubtype
            ).forEach(([subtype, standards]) => {
                if (
                    Array.isArray(standards) &&
                    standards.includes(standard)
                ) {
                    results.push(subtype);
                }
            });
        }

        return unique(results);
    }

    function createStandardCandidates(
        standard,
        subtype = ""
    ) {
        const candidates = [];

        const subtypes =
            findSubtypesForStandard(
                standard,
                subtype
            );

        subtypes.forEach(currentSubtype => {
            const override =
                exactImages[
                    `${currentSubtype}||${standard}`
                ];

            if (override) {
                candidates.push(
                    imagePath(override)
                );
            }
        });

        const folders = unique(
            subtypes.flatMap(currentSubtype =>
                subtypeFolderList[currentSubtype] || []
            )
        );

        const variants =
            standardSlugVariants(standard);

        folders.forEach(folder => {
            variants.forEach(filename => {
                extensions.forEach(extension => {
                    candidates.push(
                        imagePath(
                            `${folder}/${filename}.${extension}`
                        )
                    );
                });
            });
        });

        return unique(candidates);
    }

    /*
       Update the eight main product-family cards.
    */
    pradakoProductTypes.forEach(item => {
        if (typeImages[item.key]) {
            item.image =
                typeImages[item.key];
        }
    });

    pradakoGetTypeImage =
        function (typeKey) {
            return typeImages[typeKey] ||
                "/assets/images/products/catalogue/pan-head-machine-screw.png";
        };

    pradakoGetSubtypeImage =
        function (subtype) {
            const relativeImage =
                subtypeImages[subtype];

            if (relativeImage) {
                return imagePath(
                    relativeImage
                );
            }

            const family =
                pradakoFindFamilyFromSubtype(
                    subtype
                );

            return typeImages[family] ||
                "/assets/images/products/catalogue/pan-head-machine-screw.png";
        };

    pradakoGetStandardProductImage =
        function (standard, subtype = "") {
            return createStandardCandidates(
                standard,
                subtype
            );
        };

    function tryNextImage(imageElement) {
        if (!imageElement) {
            return;
        }

        let candidates = [];

        try {
            candidates =
                JSON.parse(
                    decodeURIComponent(
                        imageElement.dataset
                            .imageCandidates ||
                        "%5B%5D"
                    )
                );
        } catch (error) {
            candidates = [];
        }

        const currentIndex =
            Number(
                imageElement.dataset
                    .imageIndex || 0
            );

        const nextIndex =
            currentIndex + 1;

        if (
            nextIndex <
            candidates.length
        ) {
            imageElement.dataset.imageIndex =
                String(nextIndex);

            imageElement.src =
                candidates[nextIndex];

            return;
        }

        imageElement.style.display =
            "none";

        const fallback =
            imageElement.nextElementSibling;

        if (fallback) {
            fallback.style.display =
                "grid";
        }
    }

    window.pradakoTryNextStandardImage =
        tryNextImage;

    pradakoImageHTML =
        function (
            primary,
            fallback,
            altText
        ) {
            const initials =
                pradakoInitials(
                    altText
                );

            const primaryCandidates =
                Array.isArray(primary)
                    ? primary
                    : [primary];

            const fallbackCandidates =
                Array.isArray(fallback)
                    ? fallback
                    : [fallback];

            const candidates =
                unique([
                    ...primaryCandidates,
                    ...fallbackCandidates
                ]);

            if (!candidates.length) {
                return `
                    <span
                        class="pradako-image-fallback"
                        style="display:grid;"
                    >
                        ${escapeHtmlStd(initials)}
                    </span>
                `;
            }

            const encodedCandidates =
                encodeURIComponent(
                    JSON.stringify(
                        candidates
                    )
                );

            return `
                <img
                    src="${escapeAttrStd(candidates[0])}"
                    alt="${escapeAttrStd(altText)}"
                    loading="lazy"
                    data-image-index="0"
                    data-image-candidates="${escapeAttrStd(encodedCandidates)}"
                    onerror="window.pradakoTryNextStandardImage(this)"
                >

                <span
                    class="pradako-image-fallback"
                    style="display:none;"
                >
                    ${escapeHtmlStd(initials)}
                </span>
            `;
        };
})();