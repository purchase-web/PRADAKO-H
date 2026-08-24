'use strict';

/* ==========================================================
   01. STANDARDS DATA
   Used only for:
   INTERNATIONAL FASTENER STANDARDS CROSS-REFERENCE GUIDE
========================================================== */

const standardsData = {
    screws: {
        subcategories: [
            {
                name: "Machine Screws",
                rows: [
                    { standard: "DIN 84", iso: "ISO 1207", asme: "ASME B18.6.3", bs: "BS 4183", astm: "ASTM F837" },
                    { standard: "DIN 85", iso: "ISO 1580", asme: "ASME B18.6.3", bs: "BS 4183", astm: "ASTM F837" },
                    { standard: "DIN 7985", iso: "ISO 7045", asme: "ASME B18.6.3", bs: "BS 4174", astm: "—" }
                ]
            },
            {
                name: "Self Tapping Screws",
                rows: [
                    { standard: "DIN 7971", iso: "ISO 1478", asme: "ASME B18.6.4", bs: "BS 4174", astm: "—" },
                    { standard: "DIN 7981", iso: "ISO 7049", asme: "ASME B18.6.4", bs: "BS 4174", astm: "—" },
                    { standard: "DIN 7982", iso: "ISO 7050", asme: "ASME B18.6.4", bs: "BS 4174", astm: "—" },
                    { standard: "DIN 7983", iso: "ISO 7051", asme: "ASME B18.6.4", bs: "BS 4174", astm: "—" },
                    { standard: "DIN 7976", iso: "ISO 1481", asme: "ASME B18.6.4", bs: "BS 4174", astm: "—" }
                ]
            },
            {
                name: "Socket Screws",
                rows: [
                    { standard: "DIN 912", iso: "ISO 4762", asme: "ASME B18.3", bs: "BS 4168", astm: "ASTM A574" },
                    { standard: "DIN 7984", iso: "ISO 14579", asme: "ASME B18.3", bs: "BS 4168", astm: "A574" },
                    { standard: "DIN 7991", iso: "ISO 10642", asme: "ASME B18.3", bs: "BS 4168", astm: "A574" }
                ]
            }
        ]
    },

    socket_screws: {
        subcategories: [
            {
                name: "Socket Head Cap Screws",
                rows: [
                    { standard: "DIN 912", iso: "ISO 4762", asme: "ASME B18.3", bs: "BS 4168", astm: "ASTM A574", material: "Alloy Steel", grade: "12.9" },
                    { standard: "DIN 6912", iso: "ISO 7380-2", asme: "ASME B18.3", bs: "BS 4168", astm: "A574", material: "Stainless Steel", grade: "A2/A4" }
                ]
            },
            {
                name: "Socket Set Screws",
                rows: [
                    { standard: "DIN 913", iso: "ISO 4026", asme: "ASME B18.3", bs: "BS 4168", astm: "—", material: "Alloy Steel", grade: "45H" },
                    { standard: "DIN 914", iso: "ISO 4027", asme: "ASME B18.3", bs: "BS 4168", astm: "—", material: "Alloy Steel", grade: "45H" },
                    { standard: "DIN 915", iso: "ISO 4028", asme: "ASME B18.3", bs: "BS 4168", astm: "—", material: "Stainless Steel", grade: "A2" },
                    { standard: "DIN 916", iso: "ISO 4029", asme: "ASME B18.3", bs: "BS 4168", astm: "—", material: "Alloy Steel", grade: "45H" }
                ]
            },
            {
                name: "Socket Button Screws",
                rows: [
                    { standard: "ISO 7380", iso: "ISO 7380-1", asme: "ASME B18.3", bs: "BS 4168", astm: "—", material: "Alloy Steel", grade: "10.9" }
                ]
            }
        ]
    },

    bolts: {
        subcategories: [
            {
                name: "Hex Bolts",
                rows: [
                    { standard: "DIN 931", iso: "ISO 4014", asme: "ASME B18.2.1", bs: "BS 4190", astm: "ASTM A307" },
                    { standard: "DIN 933", iso: "ISO 4017", asme: "ASME B18.2.1", bs: "BS 4190", astm: "ASTM A325" },
                    { standard: "DIN 6914", iso: "ISO 7412", asme: "ASME B18.2.6", bs: "BS 4395", astm: "ASTM A490" }
                ]
            },
            {
                name: "Structural Bolts",
                rows: [
                    { standard: "DIN 7990", iso: "ISO 4016", asme: "ASME B18.2.1", bs: "BS 4320", astm: "ASTM F3125" },
                    { standard: "EN 14399-4", iso: "—", asme: "—", bs: "BS EN 14399", astm: "F3125 Grade A325" }
                ]
            },
            {
                name: "Anchor Bolts",
                rows: [
                    { standard: "DIN 571", iso: "ISO 4018", asme: "ASME B18.2.1", bs: "BS 916", astm: "ASTM F1554" }
                ]
            }
        ]
    },

    threaded_rods_studs: {
        subcategories: [
            {
                name: "Threaded Rods",
                rows: [
                    { standard: "DIN 975", iso: "ISO 898-1", asme: "ASME B18.31.3", bs: "BS 4190", astm: "ASTM A307", material: "Mild Steel", grade: "4.6/4.8" },
                    { standard: "DIN 976", iso: "ISO 898-1", asme: "ASME B18.31.3", bs: "BS 4190", astm: "ASTM A193", material: "Alloy Steel", grade: "B7" },
                    { standard: "ISO 13918", iso: "ISO 13918", asme: "—", bs: "—", astm: "—", material: "Stainless Steel", grade: "A2/A4" }
                ]
            },
            {
                name: "Stud Bolts",
                rows: [
                    { standard: "DIN 938", iso: "ISO 897", asme: "ASME B18.31.2", bs: "BS 2693", astm: "ASTM A193", material: "Alloy Steel", grade: "B7/B16" },
                    { standard: "DIN 939", iso: "ISO 898", asme: "ASME B18.31.2", bs: "BS 2693", astm: "A193 B7", material: "Stainless Steel", grade: "B8" },
                    { standard: "DIN 940", iso: "ISO 2342", asme: "—", bs: "BS 2693", astm: "—", material: "Brass", grade: "C36000" }
                ]
            },
            {
                name: "Double End Studs",
                rows: [
                    { standard: "DIN 835", iso: "ISO 2342", asme: "ASME B18.31.2", bs: "BS 2693", astm: "ASTM A193", material: "Alloy Steel", grade: "B7" }
                ]
            }
        ]
    },

    nuts: {
        subcategories: [
            {
                name: "Hex Nuts",
                rows: [
                    { standard: "DIN 934", iso: "ISO 4032", asme: "ASME B18.2.2", bs: "BS 3692", astm: "ASTM A563" },
                    { standard: "DIN 555", iso: "ISO 4035", asme: "ASME B18.2.2", bs: "BS 3692", astm: "A563" },
                    { standard: "DIN 6915", iso: "ISO 7414", asme: "ASME B18.2.2", bs: "BS 4395", astm: "ASTM A563" }
                ]
            },
            {
                name: "Lock Nuts",
                rows: [
                    { standard: "DIN 985", iso: "ISO 10511", asme: "ASME B18.16.6", bs: "BS 771", astm: "ASTM A194" },
                    { standard: "DIN 980", iso: "ISO 7042", asme: "ASME B18.16.6", bs: "BS 771", astm: "A194" },
                    { standard: "DIN 6925", iso: "ISO 7040", asme: "ASME B18.16.6", bs: "BS 7371-8", astm: "—" }
                ]
            },
            {
                name: "Flange Nuts",
                rows: [
                    { standard: "DIN 6923", iso: "ISO 7043", asme: "ASME B18.2.4.2M", bs: "BS 7371-8", astm: "ASTM F594" }
                ]
            },
            {
                name: "Weld Nuts",
                rows: [
                    { standard: "DIN 928", iso: "ISO 21670", asme: "—", bs: "BS 7371-8", astm: "—", spec: "Square Weld Nut", application: "Sheet metal welding" },
                    { standard: "DIN 929", iso: "ISO 21670", asme: "—", bs: "BS 7371-8", astm: "—", spec: "Hex Weld Nut", application: "Heavy duty welding" }
                ]
            }
        ]
    },

    washers: {
        subcategories: [
            {
                name: "Plain Washers",
                rows: [
                    { standard: "IS 2016", iso: "—", asme: "—", bs: "—", astm: "—", spec: "Low Carbon Steel / SS", application: "General load distribution" },
                    { standard: "DIN 125A", iso: "—", asme: "—", bs: "—", astm: "—", spec: "Steel HV 100/140/200", application: "Standard fastening" },
                    { standard: "DIN 9021", iso: "—", asme: "—", bs: "—", astm: "—", spec: "Steel HV 100/140", application: "Large OD Washer" },
                    { standard: "ISO 7089", iso: "ISO 7089", asme: "—", bs: "—", astm: "—", spec: "Steel HV 100/140/200", application: "Metric applications" },
                    { standard: "ASME B18.22.1", iso: "—", asme: "ASME B18.22.1", bs: "—", astm: "—", spec: "Low Carbon / Hardened", application: "US applications" }
                ]
            },
            {
                name: "Spring Washers",
                rows: [
                    { standard: "DIN 127B", iso: "—", asme: "ASME B18.21.1", bs: "—", astm: "—", spec: "Spring Steel", application: "Split lock washer" },
                    { standard: "DIN 6796", iso: "—", asme: "—", bs: "—", astm: "—", spec: "51CrV4", application: "Disc spring / preload retention" },
                    { standard: "DIN 137A", iso: "—", asme: "ASME B18.21.1", bs: "BS 4464", astm: "—", spec: "Spring Steel", application: "Curved spring washer" }
                ]
            },
            {
                name: "Heavy / Structural Washers",
                rows: [
                    { standard: "DIN 6916", iso: "—", asme: "—", bs: "—", astm: "—", spec: "HV300 (HRC38-45)", application: "Preloaded bolting systems" },
                    { standard: "ASTM F436", iso: "—", asme: "—", bs: "—", astm: "ASTM F436", spec: "Through Hardened HRC38-45", application: "A325/A490 bolting" },
                    { standard: "DIN 7989", iso: "—", asme: "—", bs: "—", astm: "—", spec: "C45 Hardened", application: "Heavy duty joints" }
                ]
            },
            {
                name: "Special Washers",
                rows: [
                    { standard: "DIN 6319C", iso: "—", asme: "—", bs: "—", astm: "—", spec: "Steel Class 4-8", application: "Misalignment compensation" },
                    { standard: "DIN 436", iso: "—", asme: "—", bs: "—", astm: "—", spec: "Low Carbon Steel", application: "Timber / structural" }
                ]
            }
        ]
    }
};

/* ==========================================================
   02. CATALOGUE DATA — BY TYPE / BY STANDARD
   Used only for:
   SOME OF OUR STANDARD PRODUCTS
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
   06. CROSS-REFERENCE GUIDE TABLES / ACCORDIONS / TABS
========================================================== */

function pradakoProductsGenerateTableHTML(rows) {
    if (!rows || rows.length === 0) {
        return `
            <div class="pradako-products-table-container">
                <div style="padding:24px;text-align:center;">
                    No data available
                </div>
            </div>
        `;
    }

    const columns = Object.keys(rows[0]);

    let tableHtml = "<thead><tr>";

    columns.forEach(column => {
        const displayName = column.charAt(0).toUpperCase() + column.slice(1);
        tableHtml += `<th>${escapeHtmlStd(displayName)}</th>`;
    });

    tableHtml += "</tr></thead><tbody>";

    rows.forEach(row => {
        tableHtml += "<tr>";

        columns.forEach(column => {
            tableHtml += `<td>${escapeHtmlStd(row[column] || "—")}</td>`;
        });

        tableHtml += "</tr>";
    });

    tableHtml += "</tbody>";

    return `
        <div class="pradako-products-table-container">
            <table class="pradako-products-table">
                ${tableHtml}
            </table>
        </div>
    `;
}

function pradakoProductsBuildAccordion(categoryKey, containerId) {
    const container = pradakoGet(containerId);

    if (!container) return;

    const data = standardsData[categoryKey];

    if (!data || !data.subcategories || !data.subcategories.length) {
        container.innerHTML =
            '<div style="padding:20px;text-align:center;">No Data Available</div>';
        return;
    }

    container.innerHTML = data.subcategories.map(subcategory => `
        <div class="pradako-products-accordion-item">
            <div class="pradako-products-accordion-header">
                <span>${escapeHtmlStd(subcategory.name)}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
                            ${pradakoProductsGenerateTableHTML(subcategory.rows)}
            </div>
        </div>
    `).join("");

    const items = container.querySelectorAll(".pradako-products-accordion-item");

    items.forEach(item => {
        const header = item.querySelector(".pradako-products-accordion-header");
        const content = item.querySelector(".pradako-products-accordion-content");

        if (!header || !content) return;

        header.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            items.forEach(accordionItem => {
                accordionItem.classList.remove("open");

                const accordionContent =
                    accordionItem.querySelector(".pradako-products-accordion-content");

                if (accordionContent) {
                    accordionContent.style.maxHeight = null;
                }
            });

            if (!isOpen) {
                item.classList.add("open");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

function pradakoProductsInitTabs() {
    const tabs = document.querySelectorAll(".pradako-products-tab-btn");
    const panels = document.querySelectorAll(".pradako-products-category-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const category = tab.dataset.category;

            tabs.forEach(button => button.classList.remove("active"));

            panels.forEach(panel => {
                panel.classList.remove("pradako-products-active-panel");
            });

            tab.classList.add("active");

            const target = pradakoGet(`panel-${category}`);

            if (target) {
                target.classList.add("pradako-products-active-panel");
            }
        });
    });
}

/* ==========================================================
   07. PAGE NAVIGATION — SMOOTH SCROLL / SCROLL SPY
========================================================== */

function pradakoProductsInitSmoothScroll() {
    document
        .querySelectorAll(".pradako-products-nav a")
        .forEach(anchor => {
            anchor.addEventListener("click", function (event) {
                const href = this.getAttribute("href");

                if (!href || !href.startsWith("#")) return;

                event.preventDefault();

                const target = document.querySelector(href);

                if (!target) return;

                const nav = document.querySelector(".pradako-products-nav");
                const offset = nav ? nav.offsetHeight : 0;

                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: "smooth"
                });
            });
        });
}

function pradakoProductsInitScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".pradako-products-nav a");

    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach(section => {
            const top = section.offsetTop - 150;
            const height = section.offsetHeight;

            if (window.scrollY >= top && window.scrollY < top + height) {
                current = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }
        });
    });
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
   /products.html?type=Nuts#standards
   /products.html?type=Screws&subtype=Machine%20Screws#standards
========================================================== */

function pradakoApplyCatalogueRouteFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    const requestedType = urlParams.get("type");
    const requestedSubtype = urlParams.get("subtype");
    const requestedView = urlParams.get("view");

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
    if (!typeExists && !subtypeExists) {
        return false;
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
   12. INITIALIZATION
   Only one DOMContentLoaded block.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    pradakoProductsBuildAccordion("screws", "screwsAccordion");
    pradakoProductsBuildAccordion(
        "socket_screws",
        "socket_screwsAccordion"
    );
    pradakoProductsBuildAccordion("bolts", "boltsAccordion");
    pradakoProductsBuildAccordion(
        "threaded_rods_studs",
        "threaded_rods_studsAccordion"
    );
    pradakoProductsBuildAccordion("nuts", "nutsAccordion");
    pradakoProductsBuildAccordion("washers", "washersAccordion");

    pradakoProductsInitTabs();
    pradakoProductsInitSmoothScroll();
    pradakoProductsInitScrollSpy();

    pradakoInitCatalogueEvents();

    pradakoCatalogueState.mode = "type";
    pradakoCatalogueState.view = "grid";

    pradakoUpdateModeButtons("type");
    pradakoUpdateViewButtons("grid");

    /*
       Reads type and subtype from the footer URL.
       If no route exists, show the normal catalogue homepage.
    */
    const catalogueRouteApplied =
        pradakoApplyCatalogueRouteFromUrl();

    if (!catalogueRouteApplied) {
        renderPradakoCatalogue();
    }

    initPradakoCustomisedProducts();
    initPradakoProductsOverallAnimations();
    initProductTypeCta();
});


/* ==========================================================
   CUSTOMISED PRODUCTS GRID + TYPE-WISE MATRIX
   Handles:
   - Grid / Matrix view toggle
   - Dynamic breadcrumb using css-only arrows
   - Family tabs
   - Product-level Grid search cards
   - View All / Show Less
========================================================== */

function initPradakoCustomisedProducts() {
    const section =
        document.querySelector(".pradako-customised-products-section") ||
        document.getElementById("customized_products");

    if (!section || section.dataset.customisedProductsReady === "true") return;

    section.dataset.customisedProductsReady = "true";

    const gridView = section.querySelector("#customGridView");
    const matrixView = section.querySelector("#customMatrixView");
    const gridBtn = section.querySelector("#customGridViewBtn");
    const matrixBtn = section.querySelector("#customMatrixViewBtn");
    const chartBtn = section.querySelector("#customChartViewBtn");
    const familyTabs = section.querySelector("#customFamilyTabs");
    const matrixContent = section.querySelector("#customMatrixContent");
    const searchInput = section.querySelector("#customMatrixSearch");
    const clearSearchBtn = section.querySelector("#customMatrixClearSearch");
    const totalText = section.querySelector("#customProductTotal");
    const statusText = section.querySelector("#customProductStatus");
    const breadcrumb = section.querySelector("#customDynamicBreadcrumb");
    const gridSearchPanel = section.querySelector("#customGridSearchPanel");
    const gridSearchInput = section.querySelector("#customGridSearch");
    const gridSearchBtn = section.querySelector("#customGridSearchBtn");
    const gridSearchClearBtn = section.querySelector("#customGridClearSearch");
    const gridSearchStatus = section.querySelector("#customGridSearchStatus");
    const gridProductResults = section.querySelector("#customGridProductResults");
    const gridEmptyResult = section.querySelector("#customGridEmptyResult");

    if (!gridView || !matrixView || !gridBtn || !matrixBtn || !chartBtn) return;

    let activeFamily = "all";
    let currentView = "grid";
    let expandedGroups = new Set();
    let breadcrumbTrail = null;

    const escapeHtml = typeof escapeHtmlStd === "function"
        ? escapeHtmlStd
        : function (value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

    const escapeAttr = typeof escapeAttrStd === "function"
        ? escapeAttrStd
        : escapeHtml;

    function cleanText(value) {
        return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function normalise(value) {
        return cleanText(value).toLowerCase();
    }

    function slugify(value) {
        return normalise(value)
            .replace(/&/g, " and ")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "product-family";
    }

    function hasUrlScheme(value) {
        return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(cleanText(value));
    }

    function joinRelativeAssetPath(...parts) {
        const cleaned = parts
            .map((part) => cleanText(part))
            .filter(Boolean)
            .map((part, index) => {
                if (index === 0) return part.replace(/\/+$/g, "");
                return part.replace(/^\/+|\/+$/g, "");
            });

        return cleaned.join("/");
    }

    function buildProductImageValue(rawImage, context = {}) {
        const image = cleanText(rawImage);

        if (!image) return "";
        if (hasUrlScheme(image) || image.startsWith("/")) return image;

        /*
           Product pages can store images in either of these forms:

           1. Complete relative path on every product:
              images/.../product.jpg

           2. Split path used by bolt.html:
              imageBasePath + category folder + product.image

           A value containing a slash is already a usable relative path, so
           only plain filenames are combined with the optional page metadata.
        */
        if (image.includes("/")) return image;

        return joinRelativeAssetPath(
            context.imageBasePath || context.basePath || "",
            context.folder || context.imageFolder || "",
            image
        ) || image;
    }

    function normaliseProductItem(product, context = {}) {
        if (typeof product === "string" || typeof product === "number") {
            return {
                name: cleanText(product),
                image: "",
                url: ""
            };
        }

        if (!product || typeof product !== "object") {
            return {
                name: "",
                image: "",
                url: ""
            };
        }

        const rawImage = cleanText(
            product.image ||
            product.img ||
            product.src ||
            product.thumbnail ||
            product.imageUrl ||
            product.image_url ||
            ""
        );

        return {
            name: cleanText(
                product.name ||
                product.title ||
                product.label ||
                product.product ||
                product.productName ||
                product.product_name ||
                ""
            ),
            image: buildProductImageValue(rawImage, {
                imageBasePath:
                    product.imageBasePath ||
                    product.image_base_path ||
                    context.imageBasePath ||
                    context.basePath ||
                    "",
                folder:
                    product.folder ||
                    product.imageFolder ||
                    product.image_folder ||
                    context.folder ||
                    context.imageFolder ||
                    ""
            }),
            url: cleanText(
                product.url ||
                product.href ||
                product.link ||
                ""
            )
        };
    }

    function uniqueProductItems(products, context = {}) {
        const itemMap = new Map();

        (products || []).forEach((product) => {
            const item = normaliseProductItem(product, context);

            if (!item.name) return;

            const key = normalise(item.name);
            const existing = itemMap.get(key);

            if (!existing) {
                itemMap.set(key, item);
                return;
            }

            if (!existing.image && item.image) existing.image = item.image;
            if (!existing.url && item.url) existing.url = item.url;
        });

        return [...itemMap.values()];
    }

    function uniqueProducts(products) {
        return uniqueProductItems(products).map((product) => product.name);
    }

    function resolvePageUrl(value, baseUrl) {
        if (!value) return "";

        try {
            return new URL(value, baseUrl || window.location.href).href;
        } catch (error) {
            return value;
        }
    }

    function resolveGroupAssetUrls(groups, baseUrl) {
        return (groups || []).map((group) => {
            const productItems = uniqueProductItems(
                group.productItems?.length ? group.productItems : group.products
            ).map((product) => ({
                ...product,
                image: resolvePageUrl(product.image, baseUrl),
                url: resolvePageUrl(product.url, baseUrl)
            }));

            return {
                ...group,
                productItems,
                products: productItems.map((product) => product.name)
            };
        });
    }

    function createPendingGroup(familyName) {
        return {
            type: familyName,
            products: [],
            isPlaceholder: true
        };
    }

    function getFamilyNameFromCard(card) {
        return cleanText(
            card.getAttribute("data-custom-family") ||
            card.querySelector(".pradako-products-card-title")?.textContent ||
            card.querySelector("h3")?.textContent ||
            card.getAttribute("aria-label") ||
            "Product Family"
        );
    }

    function buildFamilyRegistryFromGridCards() {
        const cards = [...gridView.querySelectorAll("a.pradako-products-card-link[href]")];
        const usedSlugs = new Set();

        return cards.map((card, index) => {
            const name = getFamilyNameFromCard(card);
            const baseSlug = slugify(name);
            let slug = baseSlug;
            let suffix = 2;

            while (usedSlugs.has(slug)) {
                slug = `${baseSlug}-${suffix}`;
                suffix += 1;
            }

            usedSlugs.add(slug);

            return {
                name,
                slug,
                url: card.getAttribute("href") || "#",
                groups: [createPendingGroup(name)],
                sourceStatus: "loading",
                sourceMessage: "Loading product-page data",
                cardOrder: index,
                cardElement: card
            };
        });
    }

    let customProductCatalog = buildFamilyRegistryFromGridCards();

    function normaliseProductName(product) {
        return normaliseProductItem(product).name;
    }

    function normaliseGroups(rawGroups, familyName, options = {}) {
        if (!Array.isArray(rawGroups)) return [];

        return rawGroups
            .map((group, index) => {
                if (!group || typeof group !== "object") return null;

                const type = cleanText(
                    group.type ||
                    group.title ||
                    group.category ||
                    group.heading ||
                    group.name ||
                    `${familyName} ${index + 1}`
                );

                const rawProducts = Array.isArray(group.products)
                    ? group.products
                    : Array.isArray(group.items)
                        ? group.items
                        : Array.isArray(group.children)
                            ? group.children
                            : [];

                const folder = cleanText(
                    group.folder ||
                    group.imageFolder ||
                    group.image_folder ||
                    group.path ||
                    ""
                );

                const imageBasePath = cleanText(
                    group.imageBasePath ||
                    group.image_base_path ||
                    options.imageBasePath ||
                    options.basePath ||
                    ""
                );

                const productItems = uniqueProductItems(rawProducts, {
                    imageBasePath,
                    folder
                });
                const products = productItems.map((product) => product.name);

                if (!type && !products.length) return null;

                return {
                    type: type || familyName,
                    products,
                    productItems,
                    folder,
                    imageBasePath,
                    isPlaceholder: false
                };
            })
            .filter(Boolean);
    }

    function parseStructuredJsonData(documentNode, familyName) {
        const jsonNodes = [
            ...documentNode.querySelectorAll(
                'script[type="application/json"]#pradako-product-data, ' +
                'script[type="application/json"][data-pradako-product-data]'
            )
        ];

        for (const node of jsonNodes) {
            try {
                const parsed = JSON.parse(node.textContent || "");
                const groups = normaliseGroups(
                    parsed?.groups ||
                    parsed?.sections ||
                    parsed?.categories ||
                    parsed?.data ||
                    parsed,
                    familyName,
                    {
                        imageBasePath:
                            parsed?.imageBasePath ||
                            parsed?.image_base_path ||
                            parsed?.basePath ||
                            parsed?.base_path ||
                            ""
                    }
                );

                if (groups.length) return groups;
            } catch (error) {
                console.warn("Unable to parse structured product data", error);
            }
        }

        return [];
    }

    function parseRenderedProductMarkup(documentNode, familyName) {
        const categoryBlocks = [
            ...documentNode.querySelectorAll(
                ".mega-category, [data-product-category], [data-pradako-product-group]"
            )
        ];

        const groups = categoryBlocks.map((block, index) => {
            const typeNode = block.querySelector(
                ".category-title, [data-category-title], [data-product-group-title], h2"
            );

            const type = cleanText(typeNode?.textContent || `${familyName} ${index + 1}`);
            const productNodes = [
                ...block.querySelectorAll(
                    ".product-card h3, [data-product-name], .product-name"
                )
            ];

            const productItems = uniqueProductItems(
                productNodes.map((node) => {
                    const card = node.closest(
                        ".product-card, [data-product-card], .pradako-product-card"
                    ) || node.parentElement;
                    const imageNode = card?.querySelector("img");
                    const linkNode = card?.closest("a[href]") || card?.querySelector("a[href]");

                    return {
                        name: cleanText(
                            node.getAttribute("data-product-name") || node.textContent
                        ),
                        image: cleanText(
                            node.getAttribute("data-product-image") ||
                            imageNode?.getAttribute("src") ||
                            imageNode?.getAttribute("data-src") ||
                            ""
                        ),
                        url: cleanText(
                            node.getAttribute("data-product-url") ||
                            linkNode?.getAttribute("href") ||
                            ""
                        )
                    };
                })
            );

            return {
                type,
                products: productItems.map((product) => product.name),
                productItems,
                isPlaceholder: false
            };
        }).filter((group) => group.type || group.products.length);

        return groups;
    }

    function extractBalancedArray(source, openingBracketIndex) {
        let depth = 0;
        let quote = "";
        let escaped = false;
        let inLineComment = false;
        let inBlockComment = false;

        for (let index = openingBracketIndex; index < source.length; index += 1) {
            const character = source[index];
            const nextCharacter = source[index + 1] || "";

            if (inLineComment) {
                if (character === "\n") inLineComment = false;
                continue;
            }

            if (inBlockComment) {
                if (character === "*" && nextCharacter === "/") {
                    inBlockComment = false;
                    index += 1;
                }
                continue;
            }

            if (quote) {
                if (escaped) {
                    escaped = false;
                } else if (character === "\\") {
                    escaped = true;
                } else if (character === quote) {
                    quote = "";
                }
                continue;
            }

            if (character === "/" && nextCharacter === "/") {
                inLineComment = true;
                index += 1;
                continue;
            }

            if (character === "/" && nextCharacter === "*") {
                inBlockComment = true;
                index += 1;
                continue;
            }

            if (character === '"' || character === "'" || character === "`") {
                quote = character;
                continue;
            }

            if (character === "[") depth += 1;

            if (character === "]") {
                depth -= 1;

                if (depth === 0) {
                    return source.slice(openingBracketIndex, index + 1);
                }
            }
        }

        return "";
    }

    function removeJavaScriptComments(value) {
        let result = "";
        let quote = "";
        let escaped = false;
        let inLineComment = false;
        let inBlockComment = false;

        for (let index = 0; index < value.length; index += 1) {
            const character = value[index];
            const nextCharacter = value[index + 1] || "";

            if (inLineComment) {
                if (character === "\n") {
                    inLineComment = false;
                    result += character;
                }
                continue;
            }

            if (inBlockComment) {
                if (character === "*" && nextCharacter === "/") {
                    inBlockComment = false;
                    index += 1;
                }
                continue;
            }

            if (quote) {
                result += character;

                if (escaped) {
                    escaped = false;
                } else if (character === "\\") {
                    escaped = true;
                } else if (character === quote) {
                    quote = "";
                }
                continue;
            }

            if (character === "/" && nextCharacter === "/") {
                inLineComment = true;
                index += 1;
                continue;
            }

            if (character === "/" && nextCharacter === "*") {
                inBlockComment = true;
                index += 1;
                continue;
            }

            if (character === '"' || character === "'") {
                quote = character;
            }

            result += character;
        }

        return result;
    }

    function parseLooseArrayLiteral(arrayLiteral) {
        if (!arrayLiteral) return null;

        try {
            return JSON.parse(arrayLiteral);
        } catch (error) {
            // Continue with conservative JavaScript-to-JSON cleanup for trusted,
            // same-origin product-page data arrays.
        }

        try {
            const jsonCompatible = removeJavaScriptComments(arrayLiteral)

                // Convert single-quoted JavaScript strings into valid JSON strings.
                // This allows product arrays such as boltSections to be read without
                // executing the JavaScript contained in the linked product page.
                .replace(
                    /'((?:\\.|[^'\\])*)'/g,
                    function (_, stringContent) {
                        const decoded = decodeJavaScriptStringLiteral(
                            "'",
                            stringContent
                        );

                        return JSON.stringify(decoded);
                    }
                )

                // Quote unquoted object property names.
                .replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3')

                // Remove trailing commas before closing objects or arrays.
                .replace(/,\s*([}\]])/g, "$1");

            return JSON.parse(jsonCompatible);
        } catch (error) {
            console.warn("Unable to parse a product-page JavaScript data array", error);
            return null;
        }
    }

    function decodeJavaScriptStringLiteral(quote, value) {
        try {
            if (quote === '"') return JSON.parse(`"${value}"`);

            return value
                .replace(/\\'/g, "'")
                .replace(/\\n/g, "\n")
                .replace(/\\r/g, "\r")
                .replace(/\\t/g, "\t")
                .replace(/\\\\/g, "\\");
        } catch (error) {
            return value;
        }
    }

    function extractJavaScriptStringConstants(source) {
        const constants = {};
        const pattern = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(["'])([\s\S]*?)\2\s*;/g;
        let match;

        while ((match = pattern.exec(source)) !== null) {
            constants[match[1]] = cleanText(
                decodeJavaScriptStringLiteral(match[2], match[3])
            );
        }

        return constants;
    }

    function findImageBasePath(constants) {
        const entries = Object.entries(constants || {});

        const preferred = entries.find(([name]) => {
            return /image.*base.*path|base.*image.*path/i.test(name);
        });

        if (preferred) return preferred[1];

        const fallback = entries.find(([name, value]) => {
            return /base.*path|path.*base/i.test(name) && /images?\//i.test(value);
        });

        return fallback ? fallback[1] : "";
    }

    function countGroupProducts(groups) {
        return (groups || []).reduce((sum, group) => {
            return sum + uniqueProductItems(
                group.productItems?.length ? group.productItems : group.products
            ).length;
        }, 0);
    }

    function parseEmbeddedJavaScriptData(documentNode, familyName) {
        const declarationPattern = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\[/g;
        let bestGroups = [];
        let bestProductCount = 0;

        for (const script of documentNode.scripts) {
            const source = script.textContent || "";
            const constants = extractJavaScriptStringConstants(source);
            const imageBasePath = findImageBasePath(constants);
            let match;

            while ((match = declarationPattern.exec(source)) !== null) {
                const openingBracketIndex = source.indexOf("[", match.index);
                const arrayLiteral = extractBalancedArray(source, openingBracketIndex);
                const parsed = parseLooseArrayLiteral(arrayLiteral);
                const groups = normaliseGroups(parsed, familyName, {
                    imageBasePath
                });
                const productCount = countGroupProducts(groups);

                /*
                   A product page may contain several unrelated arrays. Choose
                   the array with the largest real product collection instead
                   of returning the first parseable array. This guarantees that
                   the complete boltSections/screwSections list is selected.
                */
                if (productCount > bestProductCount) {
                    bestGroups = groups;
                    bestProductCount = productCount;
                }
            }
        }

        return bestGroups;
    }

    function extractGroupsFromProductPage(htmlText, familyName) {
        const documentNode = new DOMParser().parseFromString(htmlText, "text/html");
        const structuredGroups = parseStructuredJsonData(documentNode, familyName);

        if (structuredGroups.length) return structuredGroups;

        const renderedGroups = parseRenderedProductMarkup(documentNode, familyName);

        if (renderedGroups.length) return renderedGroups;

        return parseEmbeddedJavaScriptData(documentNode, familyName);
    }

    async function loadFamilyFromProductPage(family) {
        const productPageUrl = family.url;

        if (!productPageUrl || productPageUrl === "#") {
            family.groups = [createPendingGroup(family.name)];
            family.sourceStatus = "missing";
            family.sourceMessage = "No product-page URL is linked to this card";
            return family;
        }

        try {
            const response = await fetch(productPageUrl, {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const htmlText = await response.text();
            const extractedGroups = extractGroupsFromProductPage(htmlText, family.name);
            const groups = resolveGroupAssetUrls(extractedGroups, response.url || productPageUrl);
            const hasProducts = groups.some((group) => group.products.length);

            family.groups = groups.length
                ? groups
                : [createPendingGroup(family.name)];
            family.sourceStatus = hasProducts ? "loaded" : "empty";
            family.sourceMessage = hasProducts
                ? "Data loaded from the linked HTML page"
                : "The linked HTML page does not contain product data yet";
        } catch (error) {
            family.groups = [createPendingGroup(family.name)];
            family.sourceStatus = "missing";
            family.sourceMessage = `Page data could not be loaded: ${error.message}`;
            console.warn(`Unable to load ${family.name} from ${productPageUrl}`, error);
        }

        return family;
    }

    async function loadCatalogFromProductPages() {
        if (!customProductCatalog.length) {
            if (statusText) statusText.textContent = "No customised-product cards were found";
            return;
        }

        if (statusText) {
            statusText.textContent = `Loading data from ${customProductCatalog.length} product pages...`;
        }

        await Promise.all(customProductCatalog.map((family) => loadFamilyFromProductPage(family)));

        expandedGroups.clear();
        breadcrumbTrail = null;
        renderFamilyTabs();
        renderGridSearch();

        if (currentView !== "grid") {
            renderCurrentCustomDataView();
        } else if (statusText) {
            const loadedCount = customProductCatalog.filter((family) => family.sourceStatus === "loaded").length;
            const pendingCount = customProductCatalog.length - loadedCount;

            statusText.textContent = pendingCount
                ? `${loadedCount} product pages loaded · ${pendingCount} pages are pending data`
                : `${loadedCount} product pages loaded successfully`;
        }
    }

    function familyTotal(family) {
        return (family.groups || []).reduce((sum, group) => {
            return sum + uniqueProducts(group.products).length;
        }, 0);
    }

    function getFamilyBySlug(slug) {
        return customProductCatalog.find((family) => family.slug === slug) || null;
    }

    function productMatches(product, query) {
        return normalise(product).includes(query);
    }

    function groupMatches(family, group, query) {
        if (!query) return true;

        return normalise(family.name).includes(query) ||
            normalise(group.type).includes(query) ||
            uniqueProducts(group.products).some((product) => productMatches(product, query));
    }

    function getVisibleProducts(group, query) {
        const products = uniqueProducts(group.products);

        if (!query) return products;

        const matchedProducts = products.filter((product) => productMatches(product, query));

        return matchedProducts.length ? matchedProducts : products;
    }

    function getPendingMessage(family) {
        if (family.sourceStatus === "loading") {
            return "Loading data from this product page...";
        }

        if (family.sourceStatus === "missing") {
            return "Product page not created or not reachable yet. Data will appear automatically after the page is added.";
        }

        return "No product data has been added to this page yet. Data will appear automatically after the page is updated.";
    }

    function familySourceSuffix(family) {
        if (family.sourceStatus === "loaded") return "";
        if (family.sourceStatus === "loading") return " · Loading page data";
        if (family.sourceStatus === "missing") return " · Page pending";
        return " · Product data pending";
    }

    function searchTextMatches(value, query) {
        if (!query) return true;

        const haystack = normalise(value);
        const tokens = query.split(/\s+/).filter(Boolean);

        return tokens.every((token) => haystack.includes(token));
    }

    function getGroupProductItems(group) {
        const products = group.productItems?.length
            ? group.productItems
            : (group.products || []).map((product) => ({
                name: normaliseProductName(product),
                image: "",
                url: ""
            }));

        return uniqueProductItems(products);
    }

    function familySearchAliases(familyName) {
        const value = normalise(familyName);
        const aliases = new Set([value]);

        if (value.endsWith("ies")) aliases.add(`${value.slice(0, -3)}y`);
        if (value.endsWith("ses")) aliases.add(value.slice(0, -2));
        if (value.endsWith("s")) aliases.add(value.slice(0, -1));

        return aliases;
    }

    function getExactFamilySearchMatch(query) {
        return customProductCatalog.find((family) => {
            return familySearchAliases(family.name).has(query);
        }) || null;
    }

    function collectGridProductMatches(query) {
        if (!query) return [];

        const matches = [];
        const seen = new Set();
        const exactFamily = getExactFamilySearchMatch(query);
        const familiesToSearch = exactFamily ? [exactFamily] : customProductCatalog;

        familiesToSearch.forEach((family) => {
            const familyMatched = searchTextMatches(family.name, query);

            (family.groups || []).forEach((group) => {
                const categoryMatched = searchTextMatches(group.type, query);

                getGroupProductItems(group).forEach((product) => {
                    const productMatched = searchTextMatches(product.name, query);

                    if (!familyMatched && !categoryMatched && !productMatched) return;

                    const key = `${family.slug}::${normalise(product.name)}`;

                    if (seen.has(key)) return;
                    seen.add(key);

                    matches.push({
                        ...product,
                        familyName: family.name,
                        familySlug: family.slug,
                        familyUrl: family.url,
                        category: group.type
                    });
                });
            });
        });

        return matches;
    }

    function highlightMatch(value, query) {
        const cleanValue = cleanText(value);
        const tokens = query.split(/\s+/).filter(Boolean);

        if (!cleanValue || !tokens.length) return escapeHtml(cleanValue);

        const expression = tokens
            .sort((a, b) => b.length - a.length)
            .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("|");

        if (!expression) return escapeHtml(cleanValue);

        const pattern = new RegExp(`(${expression})`, "ig");
        let cursor = 0;
        let output = "";
        let match;

        while ((match = pattern.exec(cleanValue)) !== null) {
            output += escapeHtml(cleanValue.slice(cursor, match.index));
            output += `<mark class="pradako-custom-search-highlight">${escapeHtml(match[0])}</mark>`;
            cursor = match.index + match[0].length;
        }

        output += escapeHtml(cleanValue.slice(cursor));
        return output;
    }

    function renderGridProductCard(product, query) {
        const image = cleanText(product.image);
        const pageUrl = cleanText(product.url) || cleanText(product.familyUrl) || "#";
        const safeProductName = escapeHtml(product.name);
        const imageMarkup = image
            ? `<img src="${escapeAttr(image)}" alt="${escapeAttr(product.name)}" loading="lazy">`
            : "";

        return `
            <a href="${escapeAttr(pageUrl)}"
               class="pradako-products-card-link pradako-custom-search-product-link"
               data-search-product="${escapeAttr(product.name)}"
               data-search-family="${escapeAttr(product.familyName)}">

                <article class="pradako-products-card pradako-custom-search-product-card">
                    <div class="pradako-products-image-box ${image ? "" : "image-missing"}">
                        ${imageMarkup}

                        <div class="pradako-custom-search-product-image-fallback" aria-hidden="true">
                            <i class="fa-solid fa-screwdriver-wrench"></i>
                            <span>${safeProductName}</span>
                        </div>
                    </div>

                    <div class="pradako-products-card-body">
                        <span class="pradako-custom-search-product-meta">
                            ${escapeHtml(product.familyName)} · ${escapeHtml(product.category)}
                        </span>

                        <h3 class="pradako-products-card-title">
                            ${highlightMatch(product.name, query)}
                        </h3>

                        <span class="pradako-products-card-btn">
                            View Product
                            <span><i class="fa-solid fa-angle-right"></i></span>
                        </span>
                    </div>
                </article>
            </a>
        `;
    }

    function renderGridSearch() {
        const rawQuery = cleanText(gridSearchInput?.value || "");
        const query = normalise(rawQuery);
        const searchActive = Boolean(query);
        const matches = collectGridProductMatches(query);

        gridView.classList.toggle("custom-grid-family-results-hidden", searchActive);

        if (gridProductResults) {
            gridProductResults.hidden = currentView !== "grid" || !searchActive || matches.length === 0;
            gridProductResults.innerHTML = searchActive && matches.length
                ? matches.map((product) => renderGridProductCard(product, query)).join("")
                : "";

            gridProductResults.querySelectorAll(".pradako-products-image-box img").forEach((img) => {
                img.addEventListener("error", () => {
                    const box = img.closest(".pradako-products-image-box");
                    if (box) box.classList.add("image-missing");
                    img.remove();
                }, { once: true });
            });
        }

        if (gridEmptyResult) {
            gridEmptyResult.hidden = currentView !== "grid" || !searchActive || matches.length > 0;
        }

        if (!gridSearchStatus) return;

        const pendingCount = customProductCatalog.filter((family) => {
            return family.sourceStatus !== "loaded";
        }).length;

        if (!searchActive) {
            const totalProducts = customProductCatalog.reduce((sum, family) => {
                return sum + familyTotal(family);
            }, 0);

            gridSearchStatus.textContent = pendingCount
                ? `${customProductCatalog.length} product families · ${totalProducts} product cards searchable · ${pendingCount} pages pending data`
                : `${customProductCatalog.length} product families · ${totalProducts} product cards searchable`;
            return;
        }

        if (!matches.length) {
            gridSearchStatus.textContent = `No product card matched “${rawQuery}”.`;
            return;
        }

        const familyCount = new Set(matches.map((product) => product.familySlug)).size;
        const productText = matches.length === 1
            ? "1 product card found"
            : `${matches.length} product cards found`;
        const familyText = familyCount === 1
            ? "1 family"
            : `${familyCount} families`;

        gridSearchStatus.textContent = `${productText} in ${familyText}`;
    }

    function renderCustomBreadcrumb() {
        if (!breadcrumb) return;

        const parts = [
            {
                label: "Customized Products",
                action: "root"
            }
        ];

        if (currentView === "grid") {
            parts.push({
                label: "Product Families",
                current: true
            });
        } else if (breadcrumbTrail && breadcrumbTrail.familySlug) {
            const family = getFamilyBySlug(breadcrumbTrail.familySlug);

            if (family && breadcrumbTrail.typeName) {
                parts.push({
                    label: family.name,
                    action: "family",
                    familySlug: family.slug
                });

                parts.push({
                    label: breadcrumbTrail.typeName,
                    current: true
                });
            } else if (family) {
                parts.push({
                    label: family.name,
                    current: true
                });
            }
        } else if (activeFamily === "all") {
            parts.push({
                label: currentView === "chart" ? "Product Chart" : "Product Matrix",
                current: true
            });
        } else {
            const family = getFamilyBySlug(activeFamily);

            parts.push({
                label: family ? family.name : "Selected Family",
                current: true
            });
        }

        breadcrumb.innerHTML = parts.map((part) => {
            if (part.current) {
                return `
                    <strong class="pmew-breadcrumb-item">
                        ${escapeHtml(part.label)}
                    </strong>
                `;
            }

            const familyAttr = part.familySlug
                ? ` data-family-slug="${escapeAttr(part.familySlug)}"`
                : "";

            return `
                <button type="button"
                        class="pmew-breadcrumb-item pradako-custom-breadcrumb-link"
                        data-custom-breadcrumb-action="${escapeAttr(part.action || "")}"${familyAttr}>
                    ${escapeHtml(part.label)}
                </button>
            `;
        }).join("");
    }

    function renderFamilyTabs() {
        if (!familyTabs) return;

        const tabs = [
            `
                <button type="button"
                        class="pradako-custom-family-tab ${activeFamily === "all" ? "active" : ""}"
                        data-family="all">
                    All <small>${customProductCatalog.length}</small>
                </button>
            `
        ];

        customProductCatalog.forEach((family) => {
            tabs.push(`
                <button type="button"
                        class="pradako-custom-family-tab ${activeFamily === family.slug ? "active" : ""}"
                        data-family="${escapeAttr(family.slug)}"
                        title="${escapeAttr(family.sourceMessage || "")}">
                    ${escapeHtml(family.name)} <small>${familyTotal(family)}</small>
                </button>
            `);
        });

        familyTabs.innerHTML = tabs.join("");
    }

    function renderTypeCard(family, group, groupIndex, query) {
        const key = `${family.slug}-${groupIndex}`;
        const products = getVisibleProducts(group, query);
        const totalProducts = uniqueProducts(group.products).length;
        const isExpanded = expandedGroups.has(key);
        const previewLimit = query ? 8 : 4;
        const shownProducts = isExpanded ? products : products.slice(0, previewLimit);
        const hiddenCount = Math.max(products.length - shownProducts.length, 0);
        const canExpand = products.length > previewLimit;

        const productChips = shownProducts.length
            ? shownProducts.map((product) => {
                return `<span class="pradako-custom-product-chip">${escapeHtml(product)}</span>`;
            }).join("") + (hiddenCount ? `<span class="pradako-custom-product-chip more">+ ${hiddenCount} more</span>` : "")
            : `<span class="pradako-custom-product-chip empty">${escapeHtml(getPendingMessage(family))}</span>`;

        return `
            <article class="pradako-custom-type-card">
                <div class="pradako-custom-type-card-inner">

                    <div class="pradako-custom-type-head">
                        <h5>${escapeHtml(group.type)}</h5>
                        <span class="pradako-custom-type-count">${totalProducts}</span>
                    </div>

                    <div class="pradako-custom-product-preview">
                        ${productChips}
                    </div>

                    <div class="pradako-custom-type-footer">
                        <span>${totalProducts ? `${totalProducts} Products` : "Page data pending"}</span>

                        <button
                            type="button"
                            class="pradako-custom-expand-btn"
                            data-expand-key="${escapeAttr(key)}"
                            data-family-slug="${escapeAttr(family.slug)}"
                            data-type-name="${escapeAttr(group.type)}"
                            ${canExpand ? "" : "disabled"}
                        >
                            ${canExpand ? (isExpanded ? "Show Less" : "View All") : "All Visible"}
                            <i class="fa-solid ${canExpand ? (isExpanded ? "fa-angle-up" : "fa-angle-down") : "fa-check"}"></i>
                        </button>
                    </div>

                </div>
            </article>
        `;
    }

    function renderFamilyBlock(family, query) {
        const groups = (family.groups || []).filter((group) => groupMatches(family, group, query));

        if (!groups.length) return "";

        const visibleProductCount = groups.reduce((sum, group) => {
            return sum + getVisibleProducts(group, query).length;
        }, 0);

        return `
            <section class="pradako-custom-family-block" data-family-block="${escapeAttr(family.slug)}">

                <div class="pradako-custom-family-heading">
                    <div>
                        <h4>${escapeHtml(family.name)}</h4>
                        <p>
                            ${groups.length} ${groups.length === 1 ? "type" : "types"} ·
                            ${visibleProductCount} ${visibleProductCount === 1 ? "name" : "names"} available in this view${escapeHtml(familySourceSuffix(family))}
                        </p>
                    </div>

                    <a href="${escapeAttr(family.url)}" class="pradako-custom-open-page">
                        Open Page
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>

                <div class="pradako-custom-type-grid">
                    ${groups.map((group, index) => renderTypeCard(family, group, index, query)).join("")}
                </div>

            </section>
        `;
    }

    function renderMatrix() {
        if (!matrixContent) return;

        const query = normalise(searchInput?.value || "");

        const selectedFamilies = activeFamily === "all"
            ? customProductCatalog
            : customProductCatalog.filter((family) => family.slug === activeFamily);

        const blocks = selectedFamilies
            .map((family) => renderFamilyBlock(family, query))
            .filter(Boolean);

        const visibleCount = selectedFamilies.reduce((sum, family) => {
            const groups = (family.groups || []).filter((group) => groupMatches(family, group, query));

            return sum + groups.reduce((groupSum, group) => {
                return groupSum + getVisibleProducts(group, query).length;
            }, 0);
        }, 0);

        if (!blocks.length) {
            matrixContent.innerHTML = `
                <div class="pradako-custom-empty-result">
                    No matching product type or product name found. Clear the search box or select another family.
                </div>
            `;

            if (totalText) totalText.textContent = "0";
            if (statusText) statusText.textContent = "No matching product names";

            return;
        }

        matrixContent.innerHTML = blocks.join("");

        if (totalText) totalText.textContent = visibleCount;

        if (statusText) {
            const familyLabel = activeFamily === "all"
                ? "All families"
                : (getFamilyBySlug(activeFamily)?.name || "Selected family");

            const pendingCount = selectedFamilies.filter((family) => family.sourceStatus !== "loaded").length;
            const pendingSuffix = pendingCount ? ` · ${pendingCount} page${pendingCount === 1 ? "" : "s"} pending data` : "";

            statusText.textContent = query
                ? `${familyLabel} · ${visibleCount} matching names${pendingSuffix}`
                : `${familyLabel} · ${visibleCount} names shown type-wise${pendingSuffix}`;
        }
    }

    function getChartProducts(family, group, query) {
        const products = uniqueProducts(group.products);

        if (!query) return products;

        const familyOrTypeMatched =
            normalise(family.name).includes(query) ||
            normalise(group.type).includes(query);

        if (familyOrTypeMatched) return products;

        return products.filter((product) => productMatches(product, query));
    }

    function renderChartColumn(family, group, query) {
        const products = getChartProducts(family, group, query);
        const totalProducts = uniqueProducts(group.products).length;

        const listItems = products.length
            ? products.map((product) => `
                <li>${escapeHtml(product)}</li>
            `).join("")
            : `
                <li class="empty">${escapeHtml(getPendingMessage(family))}</li>
            `;

        return `
            <article class="pradako-custom-chart-column">
                <h5>
                    ${escapeHtml(group.type)}
                    <span class="pradako-custom-chart-count">${totalProducts}</span>
                </h5>

                <ul class="pradako-custom-chart-list">
                    ${listItems}
                </ul>
            </article>
        `;
    }

    function renderChartFamilyBlock(family, query) {
        const groups = (family.groups || []).filter((group) => groupMatches(family, group, query));

        if (!groups.length) return "";

        const visibleProductCount = groups.reduce((sum, group) => {
            return sum + getChartProducts(family, group, query).length;
        }, 0);

        return `
            <section class="pradako-custom-chart-family" data-family-chart="${escapeAttr(family.slug)}">

                <div class="pradako-custom-chart-head">
                    <div>
                        <h4>${escapeHtml(family.name)}</h4>
                        <p>
                            ${groups.length} ${groups.length === 1 ? "type column" : "type columns"} ·
                            ${visibleProductCount} ${visibleProductCount === 1 ? "name" : "names"} shown in chart view${escapeHtml(familySourceSuffix(family))}
                        </p>
                    </div>

                    <a href="${escapeAttr(family.url)}" class="pradako-custom-chart-open">
                        Open Page
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>

                <div class="pradako-custom-chart-grid">
                    ${groups.map((group) => renderChartColumn(family, group, query)).join("")}
                </div>

            </section>
        `;
    }

    function renderChart() {
        if (!matrixContent) return;

        const query = normalise(searchInput?.value || "");

        const selectedFamilies = activeFamily === "all"
            ? customProductCatalog
            : customProductCatalog.filter((family) => family.slug === activeFamily);

        const blocks = selectedFamilies
            .map((family) => renderChartFamilyBlock(family, query))
            .filter(Boolean);

        const visibleCount = selectedFamilies.reduce((sum, family) => {
            const groups = (family.groups || []).filter((group) => groupMatches(family, group, query));

            return sum + groups.reduce((groupSum, group) => {
                return groupSum + getChartProducts(family, group, query).length;
            }, 0);
        }, 0);

        if (!blocks.length) {
            matrixContent.innerHTML = `
                <div class="pradako-custom-empty-result">
                    No matching product type or product name found. Clear the search box or select another family.
                </div>
            `;

            if (totalText) totalText.textContent = "0";
            if (statusText) statusText.textContent = "No matching product names";

            return;
        }

        matrixContent.innerHTML = `
            <div class="pradako-custom-chart-content">
                ${blocks.join("")}
            </div>
        `;

        if (totalText) totalText.textContent = visibleCount;

        if (statusText) {
            const familyLabel = activeFamily === "all"
                ? "All families"
                : (getFamilyBySlug(activeFamily)?.name || "Selected family");

            const pendingCount = selectedFamilies.filter((family) => family.sourceStatus !== "loaded").length;
            const pendingSuffix = pendingCount ? ` · ${pendingCount} page${pendingCount === 1 ? "" : "s"} pending data` : "";

            statusText.textContent = query
                ? `${familyLabel} · ${visibleCount} matching names in chart view${pendingSuffix}`
                : `${familyLabel} · ${visibleCount} names shown chart-wise${pendingSuffix}`;
        }
    }

    function renderCurrentCustomDataView() {
        if (currentView === "chart") {
            renderChart();
        } else {
            renderMatrix();
        }
    }

    function setCustomView(view) {
        currentView = view;

        const showGrid = view === "grid";
        const showMatrix = view === "matrix";
        const showChart = view === "chart";

        gridView.classList.toggle("custom-products-hidden", !showGrid);
        matrixView.classList.toggle("custom-products-hidden", showGrid);

        if (gridSearchPanel) {
            gridSearchPanel.hidden = !showGrid;
        }

        if (!showGrid) {
            if (gridProductResults) gridProductResults.hidden = true;
            if (gridEmptyResult) gridEmptyResult.hidden = true;
        }

        gridBtn.classList.toggle("active", showGrid);
        matrixBtn.classList.toggle("active", showMatrix);
        chartBtn.classList.toggle("active", showChart);

        gridBtn.setAttribute("aria-pressed", String(showGrid));
        matrixBtn.setAttribute("aria-pressed", String(showMatrix));
        chartBtn.setAttribute("aria-pressed", String(showChart));

        const panelEyebrow = section.querySelector(".pradako-custom-matrix-eyebrow");
        const panelTitle = section.querySelector(".pradako-custom-matrix-title-wrap h3");
        const panelText = section.querySelector(".pradako-custom-matrix-title-wrap p");

        if (panelEyebrow && panelTitle && panelText) {
            if (showChart) {
                panelEyebrow.textContent = "Column-wise product chart";
                panelTitle.textContent = "Customised products chart";
                panelText.textContent = "This chart is generated directly from each linked product HTML page.";
            } else {
                panelEyebrow.textContent = "Type-wise product chart";
                panelTitle.textContent = "Customised products matrix";
                panelText.textContent = "This matrix is generated directly from each linked product HTML page.";
            }
        }

        if (showGrid) {
            breadcrumbTrail = null;
            renderGridSearch();

            if (statusText) {
                const loadedCount = customProductCatalog.filter((family) => family.sourceStatus === "loaded").length;
                const pendingCount = customProductCatalog.length - loadedCount;

                statusText.textContent = pendingCount
                    ? `${loadedCount} product pages loaded · ${pendingCount} pages are pending data`
                    : "Ready to explore customised products";
            }
        }

        renderCustomBreadcrumb();
    }

    gridBtn.addEventListener("click", () => {
        setCustomView("grid");
    });

    matrixBtn.addEventListener("click", () => {
        setCustomView("matrix");
        renderFamilyTabs();
        renderMatrix();
    });

    chartBtn.addEventListener("click", () => {
        setCustomView("chart");
        renderFamilyTabs();
        renderChart();
    });

    familyTabs?.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-family]");

        if (!tab) return;

        activeFamily = tab.getAttribute("data-family") || "all";
        breadcrumbTrail = null;
        expandedGroups.clear();

        renderFamilyTabs();
        renderCurrentCustomDataView();
        renderCustomBreadcrumb();
    });

    matrixContent?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-expand-key]");

        if (!button || button.disabled) return;

        const key = button.getAttribute("data-expand-key");
        const familySlug = button.getAttribute("data-family-slug") || activeFamily;
        const typeName = button.getAttribute("data-type-name") || "";

        if (expandedGroups.has(key)) {
            expandedGroups.delete(key);
            breadcrumbTrail = activeFamily === "all" ? null : { familySlug: activeFamily };
        } else {
            expandedGroups.add(key);
            breadcrumbTrail = { familySlug, typeName };

            if (activeFamily === "all") {
                activeFamily = familySlug;
                renderFamilyTabs();
            }
        }

        renderMatrix();
        renderCustomBreadcrumb();
    });

    pradakoBindSearchControl({
        input: searchInput,
        clearButton: clearSearchBtn,
        onSearch: function () {
            breadcrumbTrail = null;
            expandedGroups.clear();

            renderCurrentCustomDataView();
            renderCustomBreadcrumb();
        }
    });

    pradakoBindSearchControl({
        input: gridSearchInput,
        clearButton: gridSearchClearBtn,
        onSearch: function () {
            renderGridSearch();
        }
    });

    gridSearchBtn?.addEventListener("click", () => {
        renderGridSearch();
        gridSearchInput?.focus();
    });

    breadcrumb?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-custom-breadcrumb-action]");

        if (!button) return;

        const action = button.getAttribute("data-custom-breadcrumb-action");

        if (action === "root") {
            activeFamily = "all";
            breadcrumbTrail = null;
            expandedGroups.clear();

            renderFamilyTabs();
            renderMatrix();
            setCustomView("grid");

            return;
        }

        if (action === "family") {
            activeFamily = button.getAttribute("data-family-slug") || activeFamily;
            breadcrumbTrail = null;
            expandedGroups.clear();

            renderFamilyTabs();
            renderMatrix();
            setCustomView("matrix");
        }
    });

    section.querySelectorAll(".pradako-products-image-box img").forEach((img) => {
        img.addEventListener("error", () => {
            const box = img.closest(".pradako-products-image-box");

            if (box) box.classList.add("image-missing");

            img.remove();
        });
    });

    renderFamilyTabs();
    renderMatrix();
    renderGridSearch();
    setCustomView("grid");
    loadCatalogFromProductPages();
}

/* ==========================================================
   13. SMALL OVERALL PAGE ANIMATION
   Soft premium reveal for the complete product page.
   Works for static sections and dynamically created catalogue cards.
========================================================== */

function injectPradakoProductsAnimationCss() {
    const styleId = "pradako-products-overall-animation-css";

    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;

    style.textContent = `
        .pmew-page-animate {
            opacity: 0;
            transform: translateY(28px);
            filter: blur(5px);
            transition:
                opacity 0.75s cubic-bezier(.16, 1, .3, 1),
                transform 0.75s cubic-bezier(.16, 1, .3, 1),
                filter 0.75s cubic-bezier(.16, 1, .3, 1);
            transition-delay: calc(var(--pmew-animation-delay, 0) * 55ms);
            will-change: opacity, transform, filter;
        }

        .pmew-page-visible {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
        }

        .pradako-products-card,
        .pradako-products-standard-card,
        .pradako-catalogue-type-card,
        .pradako-catalogue-subtype-block,
        .pradako-catalogue-subcat-card,
        .pradako-catalogue-product-card,
        .pradako-products-hot-card,
        .pradako-products-info-card,
        .pradako-standard-group-section {
            will-change: transform, box-shadow, border-color;
        }

        .pradako-products-hero h1.pmew-page-animate {
            transform: translateY(22px);
        }

        .pradako-products-hero-bottom.pmew-page-animate {
            transform: translateY(24px);
        }

        .pradako-products-nav.pmew-page-animate {
            transform: translateY(-18px);
        }

        .pradako-products-title.pmew-page-animate,
        .pradako-products-section-title.pmew-page-animate {
            transform: translateY(20px);
        }
                @media (prefers-reduced-motion: reduce) {
            .pmew-page-animate {
                opacity: 1 !important;
                transform: none !important;
                filter: none !important;
                transition: none !important;
                transition-delay: 0ms !important;
            }
        }
    `;

    document.head.appendChild(style);
}

function initPradakoProductsRevealAnimation() {
    const animatedSelector = [
        ".pradako-products-hero h1",
        ".pradako-products-hero-bottom",
        ".pradako-products-nav",
        ".pradako-products-title",
        ".pradako-products-section-title",
        ".pradako-products-controls",
        ".pradako-products-card",
        ".pradako-products-standard-card",
        ".pradako-catalogue-type-card",
        ".pradako-catalogue-subtype-block",
        ".pradako-catalogue-subcat-card",
        ".pradako-catalogue-product-card",
        ".pradako-standard-group-section",
        ".pradako-products-hot-card",
        ".pradako-products-info-card",
        ".pradako-producttype-premium-inner",
        ".pradako-producttype-premium-mini-card"
    ].join(",");

    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const markVisible = (element) => {
        element.classList.add("pmew-page-visible");
    };

    const observer =
        prefersReducedMotion || !("IntersectionObserver" in window)
            ? null
            : new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            markVisible(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -70px 0px"
                }
            );

    const prepareElements = (root = document) => {
        const elements = Array.from(root.querySelectorAll(animatedSelector));

        elements.forEach((element, index) => {
            if (element.dataset.pmewAnimated === "true") return;

            element.dataset.pmewAnimated = "true";
            element.classList.add("pmew-page-animate");
            element.style.setProperty("--pmew-animation-delay", String(index % 8));

            if (prefersReducedMotion || !observer) {
                markVisible(element);
                return;
            }

            observer.observe(element);
        });
    };

    prepareElements(document);

    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;

                if (node.matches && node.matches(animatedSelector)) {
                    prepareElements(node.parentElement || document);
                    return;
                }

                if (node.querySelector) {
                    prepareElements(node);
                }
            });
        });
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function initPradakoProductsHeroMicroMovement() {
    const hero = document.querySelector(".pradako-products-hero");

    if (!hero) return;

    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    let ticking = false;

    const updateHero = () => {
        const rect = hero.getBoundingClientRect();

        if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const progress = Math.min(
                Math.max(Math.abs(rect.top) / Math.max(rect.height, 1), 0),
                1
            );

            const offset = Math.round(progress * 26);

            hero.style.backgroundPosition = `center calc(100% + ${offset}px)`;
        }

        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;

        ticking = true;
        window.requestAnimationFrame(updateHero);
    };

    requestUpdate();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
}

function initPradakoProductsOverallAnimations() {
    if (window.__pradakoProductsOverallAnimationsReady) return;

    window.__pradakoProductsOverallAnimationsReady = true;

    injectPradakoProductsAnimationCss();
    initPradakoProductsRevealAnimation();
    initPradakoProductsHeroMicroMovement();
}


/* ==========================================================
   PRODUCT TYPE CTA FORM JS
   Add this at the bottom of products.js
========================================================== */

/* ==========================================================
   01. SMOOTH SCROLL TO PRODUCT TYPE CTA FORM
========================================================== */

function initProductTypeCtaScroll() {
    const ctaLinks = document.querySelectorAll(
        'a[href="#product-type-form"], a[href="#product-type-enquiry"]'
    );

    if (!ctaLinks.length) return;

    ctaLinks.forEach((link) => {
        link.addEventListener("click", function (event) {
            const href = this.getAttribute("href");

            if (!href) return;

            const target = document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}


/* ==========================================================
   02. PRODUCT TYPE CTA FORM VALIDATION
========================================================== */

function initProductTypeCtaFormValidation() {
    const form = document.querySelector(".pradako-producttype-premium-form");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        const fields = form.querySelectorAll("input, select, textarea");

        let hasValue = false;

        fields.forEach((field) => {
            if (field.value && field.value.trim() !== "") {
                hasValue = true;
            }
        });

        if (!hasValue) {
            event.preventDefault();

            alert("Please share at least one requirement detail before submitting.");

            const firstField = fields[0];

            if (firstField) {
                firstField.focus();
                firstField.classList.add("ptype-field-error");
            }

            return;
        }

        /*
            The form will submit to the backend action added in HTML:
            action="/submit-product-type-enquiry"
            method="POST"
        */
    });
}


/* ==========================================================
   03. REMOVE FIELD ERROR WHEN USER TYPES
========================================================== */

function initProductTypeCtaFieldReset() {
    const fields = document.querySelectorAll(
        ".pradako-producttype-premium-form input, .pradako-producttype-premium-form select, .pradako-producttype-premium-form textarea"
    );

    if (!fields.length) return;

    fields.forEach((field) => {
        field.addEventListener("input", function () {
            this.classList.remove("ptype-field-error");
        });

        field.addEventListener("change", function () {
            this.classList.remove("ptype-field-error");
        });
    });
}


/* ==========================================================
   04. FLOATING ENQUIRE BUTTON VISIBILITY
========================================================== */

function initProductTypeFloatingButton() {
    const floatingButton = document.querySelector(".pradako-producttype-premium-floating");
    const formSection = document.getElementById("product-type-enquiry");

    if (!floatingButton || !formSection) return;

    const handleFloatingButton = () => {
        const sectionRect = formSection.getBoundingClientRect();
        const sectionVisible =
            sectionRect.top < window.innerHeight &&
            sectionRect.bottom > 0;

        if (sectionVisible) {
            floatingButton.classList.add("ptype-floating-inside");
        } else {
            floatingButton.classList.remove("ptype-floating-inside");
        }
    };

    handleFloatingButton();

    window.addEventListener("scroll", handleFloatingButton, {
        passive: true
    });

    window.addEventListener("resize", handleFloatingButton);
}


/* ==========================================================
   05. PREMIUM REVEAL ANIMATION FOR CTA
========================================================== */

function initProductTypeCtaReveal() {
    const ctaSection = document.getElementById("product-type-enquiry");

    if (!ctaSection) return;

    ctaSection.classList.add("ptype-cta-ready");

    if (!("IntersectionObserver" in window)) {
        ctaSection.classList.add("ptype-cta-visible");
        return;
    }

    const observer = new IntersectionObserver(
        (entries, observerInstance) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    ctaSection.classList.add("ptype-cta-visible");
                    observerInstance.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -80px 0px"
        }
    );

    observer.observe(ctaSection);
}


/* ==========================================================
   06. INJECT SMALL SUPPORT css FROM JS
   This will not change your CTA design.
   It only supports error state and reveal animation.
========================================================== */

function injectProductTypeCtaSupportCss() {
    const styleId = "product-type-cta-support-css";

    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;

    style.textContent = `
        .ptype-field-error {
            border-color: #d93025 !important;
            box-shadow: 0 0 0 4px rgba(217, 48, 37, 0.12) !important;
        }

        .ptype-cta-ready {
            opacity: 0;
            transform: translateY(36px);
            transition:
                opacity 0.85s cubic-bezier(.16, 1, .3, 1),
                transform 0.85s cubic-bezier(.16, 1, .3, 1);
        }

        .ptype-cta-visible {
            opacity: 1;
            transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
            .ptype-cta-ready {
                opacity: 1 !important;
                transform: none !important;
                transition: none !important;
            }
        }
    `;

    document.head.appendChild(style);
}



function initProductTypeCta() {
    injectProductTypeCtaSupportCss();
    initProductTypeCtaScroll();
    initProductTypeCtaFormValidation();
    initProductTypeCtaFieldReset();
    initProductTypeFloatingButton();
    initProductTypeCtaReveal();
}

/* ==========================================================
   07. PRODUCT TYPE CTA INIT IS MERGED INTO THE MAIN DOMContentLoaded BLOCK
========================================================== */


/* ==========================================================
   INTERNATIONAL FASTENER CROSS-REFERENCE TABLE
   Clean final version.

   Features:
   - Fetches from master data:
     pradakoProductTypes
     pradakoSubtypeData
     pradakoStandardsBySubtype

   - Product tabs
   - Equivalent standards comparison table
   - Sticky table header
   - Sticky Products column
   - Main table canvas scroll only
   - No inner scrollbar inside standard-number cells
========================================================== */

(function () {
    "use strict";

    const PMEW_CROSSREF_SHELL_ID = "pmewCrossReferenceGuideShell";
    const PMEW_CROSSREF_STYLE_ID = "pmewCrossReferenceGuideStyle";

    const crossRefColumns = [
        { key: "is", title: "IS", family: "IS" },
        { key: "din", title: "DIN", family: "DIN" },
        { key: "bs", title: "BS / BSI", family: "BS / BSI" },
        { key: "ansi", title: "ANSI", family: "ANSI" },
        { key: "astm", title: "ASTM", family: "ASTM" },
        { key: "asme", title: "ASME", family: "ASME" },
        { key: "iso", title: "ISO", family: "ISO" },
        { key: "jis", title: "JIS", family: "JIS" },
        { key: "uni", title: "UNI", family: "UNI" },
        { key: "as_nzs", title: "AS / AS-NZS", family: "AS / AS-NZS" },
        { key: "cen_en", title: "CEN / EN", family: "CEN / EN" },
        { key: "dast", title: "DASt", family: "DASt" },
        { key: "gost", title: "GOST / GOST R", family: "GOST / GOST R" },
        { key: "mil_ms", title: "MIL / MS", family: "MIL / MS" },
        { key: "nas", title: "NAS", family: "NAS" },
        { key: "pn", title: "PN", family: "PN" },
        { key: "mix", title: "Other / MIX", family: "MIX" }
    ];

    function crHtml(value) {
        if (typeof escapeHtmlStd === "function") {
            return escapeHtmlStd(value);
        }

        if (value === null || value === undefined) return "";

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function crAttr(value) {
        return crHtml(value);
    }

    function crSlug(value) {
        if (typeof pradakoSlug === "function") {
            return pradakoSlug(value);
        }

        return String(value || "")
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/\+/g, "plus")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function crStandardUrl(standard) {
        if (typeof pradakoGetStandardProductUrl === "function") {
            return pradakoGetStandardProductUrl(standard);
        }

        return `/pages/products/standard-products.html?standard=${encodeURIComponent(String(standard || "").trim())}`;
    }

    function crNumber(value) {
        const match = String(value || "").match(/\d+/);
        return match ? parseInt(match[0], 10) : 999999;
    }

    function crSort(items) {
        return items.slice().sort((a, b) => {
            const numberA = crNumber(a);
            const numberB = crNumber(b);

            if (numberA !== numberB) return numberA - numberB;

            return String(a).localeCompare(String(b), undefined, {
                numeric: true,
                sensitivity: "base"
            });
        });
    }

    function crDetectFamily(standard) {
        const text = String(standard || "").toUpperCase().trim();

        if (text.startsWith("ANSI")) return "ANSI";
        if (text.startsWith("ASME")) return "ASME";
        if (text.startsWith("ASTM")) return "ASTM";

        if (
            text.startsWith("AS/NZS") ||
            text.startsWith("AS NZS") ||
            text.startsWith("AS-NZS") ||
            text.startsWith("AS / NZS") ||
            /^AS\s+\d/.test(text)
        ) {
            return "AS / AS-NZS";
        }

        if (text.startsWith("BSI") || text.startsWith("BS")) return "BS / BSI";

        if (
            text.startsWith("CEN") ||
            text.startsWith("EN ") ||
            text.startsWith("EN-") ||
            text.startsWith("EN/")
        ) {
            return "CEN / EN";
        }

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

    function crColumnKey(family) {
        const column = crossRefColumns.find(item => item.family === family);
        return column ? column.key : "mix";
    }

    function crCleanPart(value) {
        return String(value || "")
            .replace(/\s+\([^()]*[A-Za-z][^()]*\)\s*$/g, "")
            .replace(/\s+[—–]\s+.*$/g, "")
            .replace(/\s+-\s+.*$/g, "")
            .replace(/^[\s/,;|]+/g, "")
            .replace(/[\s/,;|]+$/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function crSplitStandard(rawStandard) {
        const value = String(rawStandard || "").trim();

        if (!value) return [];

        const familyRegex =
            /(ASME|ANSI|ASTM|AS\/NZS|AS\s*\/\s*NZS|AS NZS|AS-NZS|AS(?=\s+\d)|BSI|BS|CEN|EN|DAST|DIN|GOST\s*R|GOST|ISO|IS|JIS|MIL|MS|NAS|PN|UNI)\b/gi;

        const matches = [];
        let match;

        while ((match = familyRegex.exec(value)) !== null) {
            matches.push({
                index: match.index,
                token: match[0]
            });
        }

        if (!matches.length) {
            const cleaned = crCleanPart(value);
            return cleaned ? [cleaned] : [];
        }

        return matches.map((item, index) => {
            const next = matches[index + 1];
            const part = value.slice(item.index, next ? next.index : value.length);
            return crCleanPart(part);
        }).filter(Boolean);
    }

    function crCreateCells() {
        const cells = {};

        crossRefColumns.forEach(column => {
            cells[column.key] = [];
        });

        return cells;
    }

    function crAddCell(cells, columnKey, value) {
        const cleaned = crCleanPart(value);

        if (!cleaned) return;

        if (!cells[columnKey]) {
            cells[columnKey] = [];
        }

        const exists = cells[columnKey].some(item => {
            return item.toUpperCase() === cleaned.toUpperCase();
        });

        if (!exists) {
            cells[columnKey].push(cleaned);
        }
    }

    function crCategories() {
        if (!Array.isArray(pradakoProductTypes)) return [];

        return pradakoProductTypes
            .filter(type => {
                return type &&
                    type.key &&
                    Array.isArray(pradakoSubtypeData[type.key]) &&
                    pradakoSubtypeData[type.key].length;
            })
            .map(type => ({
                key: type.key,
                title: type.title || type.key
            }));
    }

    function crBuildRows(typeKey) {
        const rows = [];
        const groups = pradakoSubtypeData[typeKey] || [];

        groups.forEach(group => {
            (group.items || []).forEach(subtype => {
                const standards = pradakoStandardsBySubtype[subtype] || [];

                if (!standards.length) return;

                const cells = crCreateCells();

                standards.forEach(rawStandard => {
                    crSplitStandard(rawStandard).forEach(standardPart => {
                        const family = crDetectFamily(standardPart);
                        const columnKey = crColumnKey(family);
                        crAddCell(cells, columnKey, standardPart);
                    });
                });

                rows.push({
                    product: subtype,
                    group: group.group || typeKey,
                    cells
                });
            });
        });

        return rows;
    }

    function crCellHTML(items) {
        if (!items || !items.length) {
            return `<span class="pmew-crossref-empty">—</span>`;
        }

        return `
            <div class="pmew-crossref-pill-list">
                ${crSort(items).map(standard => `
                    <a class="pmew-crossref-pill"
                       href="${crAttr(crStandardUrl(standard))}">
                        ${crHtml(standard)}
                    </a>
                `).join("")}
            </div>
        `;
    }

    function crSearchText(row) {
        const cellText = crossRefColumns.map(column => {
            return (row.cells[column.key] || []).join(" ");
        }).join(" ");

        return `${row.product} ${row.group} ${cellText}`.toLowerCase();
    }

    function crTableHTML(rows) {
        return `
            <div class="pmew-crossref-table-wrap">
                <table class="pmew-crossref-table">
                    <thead>
                        <tr>
                            <th rowspan="2" class="pmew-crossref-product-head">
                                Products
                            </th>

                            <th colspan="${crossRefColumns.length}" class="pmew-crossref-equivalent-head">
                                Equivalent Standards
                            </th>
                        </tr>

                        <tr>
                            ${crossRefColumns.map(column => `
                                <th>${crHtml(column.title)}</th>
                            `).join("")}
                        </tr>
                    </thead>

                    <tbody>
                        ${rows.map(row => `
                            <tr data-crossref-row="${crAttr(crSearchText(row))}">
                                <td class="pmew-crossref-product-cell">
                                    <strong>${crHtml(row.product)}</strong>
                                    <small>${crHtml(row.group)}</small>
                                </td>

                                ${crossRefColumns.map(column => `
                                    <td>${crCellHTML(row.cells[column.key])}</td>
                                `).join("")}
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    function crPanelHTML(category, index) {
        const rows = crBuildRows(category.key);

        return `
            <div class="pmew-crossref-panel ${index === 0 ? "active" : ""}"
                 data-crossref-panel="${crAttr(category.key)}">

                <div class="pmew-crossref-toolbar">
                    <div>
                        <h3>${crHtml(category.title)} Equivalent Standards</h3>
                        <p>
                            Product-wise equivalent standards generated from the same master data used in Standard Products.
                        </p>
                    </div>

                    <div class="pmew-crossref-count">
                        ${rows.length} ${rows.length === 1 ? "entry" : "entries"}
                    </div>
                </div>

                <div class="pmew-crossref-search">
                    <input type="text"
                           placeholder="Search products or standards..."
                           data-crossref-search>
                </div>

                ${rows.length ? crTableHTML(rows) : `
                    <div class="pmew-crossref-no-data">
                        No standards added for ${crHtml(category.title)} yet.
                    </div>
                `}

                <div class="pmew-crossref-no-search-result" style="display:none;">
                    No matching standards found.
                </div>

            </div>
        `;
    }

    function crShellHTML() {
        const categories = crCategories();

        return `
            <section class="pmew-crossref-section" id="${PMEW_CROSSREF_SHELL_ID}">
                <div class="pmew-crossref-container">

                    <h2 class="pmew-crossref-title">
                        INTERNATIONAL FASTENER STANDARDS CROSS-REFERENCE GUIDE
                    </h2>

                    <div class="pmew-crossref-tabs" role="tablist">
                        ${categories.map((category, index) => `
                            <button type="button"
                                    class="pmew-crossref-tab ${index === 0 ? "active" : ""}"
                                    data-crossref-tab="${crAttr(category.key)}">
                                ${crHtml(category.title)}
                            </button>
                        `).join("")}
                    </div>

                    <div class="pmew-crossref-panels">
                        ${categories.map((category, index) => crPanelHTML(category, index)).join("")}
                    </div>

                </div>
            </section>
        `;
    }

    function crFindInsertionPoint() {
        const heading = Array.from(document.querySelectorAll("h1, h2, h3")).find(item => {
            return item.textContent.toLowerCase().includes("cross-reference");
        });

        if (heading) {
            const section = heading.closest("section") || heading.parentElement;
            return { mode: "replace", target: section };
        }

        const main = document.querySelector("main");

        if (main) {
            return { mode: "prepend", target: main };
        }

        const header =
            document.querySelector("header") ||
            document.querySelector(".site-header") ||
            document.querySelector(".main-header") ||
            document.querySelector(".navbar") ||
            document.querySelector("nav");

        if (header && header.parentNode) {
            return { mode: "after", target: header };
        }

        return { mode: "prepend", target: document.body };
    }

    function crRender() {
        if (typeof pradakoProductTypes === "undefined" ||
            typeof pradakoSubtypeData === "undefined" ||
            typeof pradakoStandardsBySubtype === "undefined") {
            return;
        }

        const oldShell = document.getElementById(PMEW_CROSSREF_SHELL_ID);

        if (oldShell) {
            oldShell.outerHTML = crShellHTML();
            crAttachEvents();
            crForceVisible();
            return;
        }

        const insertion = crFindInsertionPoint();
        const wrapper = document.createElement("div");

        wrapper.innerHTML = crShellHTML();

        const shell = wrapper.firstElementChild;

        if (!shell) return;

        if (insertion.mode === "replace" && insertion.target) {
            insertion.target.innerHTML = "";
            insertion.target.appendChild(shell);
        } else if (insertion.mode === "after" && insertion.target && insertion.target.parentNode) {
            insertion.target.parentNode.insertBefore(shell, insertion.target.nextSibling);
        } else if (insertion.target) {
            insertion.target.insertBefore(shell, insertion.target.firstChild);
        } else {
            document.body.appendChild(shell);
        }

        crAttachEvents();
        crForceVisible();
    }

    function crAttachEvents() {
        const shell = document.getElementById(PMEW_CROSSREF_SHELL_ID);

        if (!shell) return;

        const tabs = Array.from(shell.querySelectorAll("[data-crossref-tab]"));
        const panels = Array.from(shell.querySelectorAll("[data-crossref-panel]"));

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const key = tab.dataset.crossrefTab;

                tabs.forEach(item => item.classList.remove("active"));
                panels.forEach(panel => panel.classList.remove("active"));

                tab.classList.add("active");

                const target = shell.querySelector(`[data-crossref-panel="${key}"]`);

                if (target) {
                    target.classList.add("active");
                }
            });
        });

        shell.querySelectorAll("[data-crossref-search]").forEach(input => {
            input.addEventListener("input", () => {
                const panel = input.closest("[data-crossref-panel]");

                if (!panel) return;

                const query = input.value.trim().toLowerCase();
                const rows = Array.from(panel.querySelectorAll("[data-crossref-row]"));
                const empty = panel.querySelector(".pmew-crossref-no-search-result");

                let visibleCount = 0;

                rows.forEach(row => {
                    const text = row.getAttribute("data-crossref-row") || "";
                    const visible = !query || text.includes(query);

                    row.style.display = visible ? "" : "none";

                    if (visible) visibleCount++;
                });

                if (empty) {
                    empty.style.display = visibleCount ? "none" : "block";
                }
            });
        });
    }

    function crForceVisible() {
        const shell = document.getElementById(PMEW_CROSSREF_SHELL_ID);

        if (!shell) return;

        shell.style.display = "block";
        shell.style.opacity = "1";
        shell.style.visibility = "visible";

        let parent = shell.parentElement;

        while (parent && parent !== document.body) {
            const computed = window.getComputedStyle(parent);

            if (computed.display === "none") {
                parent.style.display = "block";
            }

            if (computed.visibility === "hidden") {
                parent.style.visibility = "visible";
            }

            if (computed.opacity === "0") {
                parent.style.opacity = "1";
            }

            parent = parent.parentElement;
        }
    }

    function crInjectcss() {
        [
            PMEW_CROSSREF_STYLE_ID,
            "pmew-crossref-sticky-canvas-css",
            "pmew-crossref-remove-inner-scroll-css"
        ].forEach(styleId => {
            const oldStyle = document.getElementById(styleId);

            if (oldStyle) {
                oldStyle.remove();
            }
        });

        const style = document.createElement("style");
        style.id = PMEW_CROSSREF_STYLE_ID;

        style.textContent = `
            .pmew-crossref-section,
            .pmew-crossref-section * {
                box-sizing: border-box;
            }

            .pmew-crossref-section {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 100%;
                padding: 90px 16px;
                background: #ffffff;
            }

            .pmew-crossref-container {
                width: min(1320px, 100%);
                margin: 0 auto;
            }

            .pmew-crossref-title {
                margin: 0 0 40px;
                color: var(--pmew-blue);
                // font-family: 'Montserrat', sans-serif;
                font-size: clamp(28px, 5vw, 36px);
                font-weight: 800;
                text-align: center;
                text-transform: uppercase;
            }

            .pmew-crossref-tabs {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 0;
                margin-bottom: 30px;
                border-bottom: 1px solid #dbe5ed;
            }

            .pmew-crossref-tab {
                border: 0;
                border-radius: 0;
                padding: 16px 28px;
                background: transparent;
                color: #0b2638;
                font-family: 'Montserrat', sans-serif;
                font-size: 15px;
                font-weight: 900;
                letter-spacing: 0.02em;
                cursor: pointer;
                transition: background 0.2s ease, color 0.2s ease;
            }

            .pmew-crossref-tab.active {
                background: #0f344c;
                color: #ffffff;
            }

            .pmew-crossref-panel {
                display: none;
            }

            .pmew-crossref-panel.active {
                display: block;
            }

            .pmew-crossref-toolbar {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 24px;
                margin-bottom: 18px;
                padding-bottom: 14px;
                border-bottom: 1px solid #e4ebf1;
            }

            .pmew-crossref-toolbar h3 {
                margin: 0;
                color: #0b2638;
                font-family: 'Montserrat', sans-serif;
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .pmew-crossref-toolbar p {
                margin: 8px 0 0;
                color: #748395;
                font-family: 'Montserrat', sans-serif;
                font-size: 14px;
                line-height: 1.6;
            }

            .pmew-crossref-count {
                flex: 0 0 auto;
                min-width: 96px;
                padding: 10px 18px;
                border-radius: 999px;
                background: #eef4f8;
                color: #0b2638;
                font-family: 'Montserrat', sans-serif;
                font-size: 14px;
                font-weight: 900;
                text-align: center;
                white-space: nowrap;
            }

            .pmew-crossref-search {
                margin: 0 0 18px;
            }

            .pmew-crossref-search input {
                width: 100%;
                max-width: 520px;
                height: 46px;
                padding: 0 18px;
                border: 1px solid #d8e2eb;
                border-radius: 14px;
                outline: none;
                background: #ffffff;
                color: #0b2638;
                font-family: 'Montserrat', sans-serif;
                font-size: 14px;
                font-weight: 600;
                transition: border-color 0.25s ease, box-shadow 0.25s ease;
            }

            .pmew-crossref-search input:focus {
                border-color: #0b2638;
                box-shadow: 0 0 0 4px rgba(11, 38, 56, 0.08);
            }

            .pmew-crossref-table-wrap {
                position: relative;
                width: 100%;
                max-height: 72vh;
                overflow: auto;
                border: 1px solid #dfe7ee;
                border-radius: 18px;
                background: #ffffff;
                box-shadow: 0 22px 55px rgba(11, 38, 56, 0.10);
                scroll-behavior: smooth;
                scrollbar-width: thin;
                scrollbar-color: #0f344c #eef4f8;
            }

            .pmew-crossref-table-wrap::-webkit-scrollbar {
                width: 14px;
                height: 14px;
            }

            .pmew-crossref-table-wrap::-webkit-scrollbar-track {
                background: #eef4f8;
                border-radius: 999px;
            }

            .pmew-crossref-table-wrap::-webkit-scrollbar-thumb {
                background: #0f344c;
                border: 3px solid #eef4f8;
                border-radius: 999px;
            }

            .pmew-crossref-table-wrap::-webkit-scrollbar-thumb:hover {
                background: #092538;
            }

            .pmew-crossref-table-wrap::-webkit-scrollbar-corner {
                background: #eef4f8;
            }

            .pmew-crossref-table {
                width: 100%;
                min-width: 1680px;
                border-collapse: separate;
                border-spacing: 0;
                table-layout: fixed;
                background: #ffffff;
                color: #0b2638;
                font-family: 'Montserrat', sans-serif;
            }

            .pmew-crossref-table th,
            .pmew-crossref-table td {
                border-right: 1px solid #dfe7ee;
                border-bottom: 1px solid #dfe7ee;
                padding: 14px;
                vertical-align: top;
                text-align: center;
            }

            .pmew-crossref-table thead {
                position: sticky;
                top: 0;
                z-index: 50;
            }

            .pmew-crossref-table thead th {
                position: sticky;
                top: 0;
                z-index: 55;
                background: #0f344c;
                color: #ffffff;
                font-size: 13px;
                font-weight: 900;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                box-shadow: 0 1px 0 #dfe7ee;
            }

            .pmew-crossref-table thead tr:first-child th {
                top: 0;
                z-index: 70;
                background: #092538;
                font-size: 15px;
            }

            .pmew-crossref-table thead tr:nth-child(2) th {
                top: 48px;
                z-index: 65;
                background: #0f344c;
            }

            .pmew-crossref-product-head {
                position: sticky !important;
                left: 0;
                top: 0 !important;
                z-index: 95 !important;
                width: 240px;
                min-width: 240px;
                background: #092538 !important;
                color: #ffffff !important;
                box-shadow: 8px 0 18px rgba(11, 38, 56, 0.16);
            }

            .pmew-crossref-product-cell {
                position: sticky !important;
                left: 0;
                z-index: 40;
                width: 240px;
                min-width: 240px;
                background: #ffffff !important;
                text-align: left !important;
                box-shadow: 8px 0 18px rgba(11, 38, 56, 0.08);
            }

            .pmew-crossref-table tbody tr:hover td {
                background: #f8fbfd;
            }

            .pmew-crossref-table tbody tr:hover .pmew-crossref-product-cell {
                background: #ffffff !important;
            }

            .pmew-crossref-product-cell strong {
                display: block;
                color: #0b2638;
                font-size: 15px;
                font-weight: 900;
                line-height: 1.4;
            }

            .pmew-crossref-product-cell small {
                display: block;
                margin-top: 6px;
                color: #7b8a99;
                font-size: 12px;
                font-weight: 700;
                line-height: 1.4;
                letter-spacing: 0.03em;
                text-transform: uppercase;
            }

            .pmew-crossref-pill-list {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 7px;
                max-height: none !important;
                overflow: visible !important;
                padding-right: 0 !important;
            }

            .pmew-crossref-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: auto !important;
                min-width: 72px;
                min-height: 30px;
                padding: 8px 12px !important;
                border-radius: 999px;
                background: #f3f7fa;
                color: #0b2638;
                border: 1px solid #e1e9ef;
                font-size: 12.5px !important;
                font-weight: 800;
                line-height: 1.35 !important;
                text-decoration: none;
                white-space: normal;
                transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
            }

            .pmew-crossref-pill:hover {
                background: #ffffff;
                border-color: #0b2638;
                transform: translateY(-1px);
            }

            .pmew-crossref-empty {
                color: #a8b3bd;
                font-weight: 900;
            }

            .pmew-crossref-no-data,
            .pmew-crossref-no-search-result {
                padding: 28px;
                border: 1px dashed #d8e2eb;
                border-radius: 18px;
                background: #ffffff;
                color: #7b8a99;
                font-family: 'Montserrat', sans-serif;
                font-size: 15px;
                font-weight: 700;
                text-align: center;
            }

            @media (max-width: 768px) {
                .pmew-crossref-section {
                    padding: 60px 14px;
                }

                .pmew-crossref-toolbar {
                    flex-direction: column;
                }

                .pmew-crossref-toolbar h3 {
                    font-size: 20px;
                }

                .pmew-crossref-tab {
                    padding: 14px 18px;
                    font-size: 13px;
                }

                .pmew-crossref-table-wrap {
                    max-height: 68vh;
                    border-radius: 14px;
                }

                .pmew-crossref-table {
                    min-width: 1450px;
                }

                .pmew-crossref-product-head,
                .pmew-crossref-product-cell {
                    width: 190px;
                    min-width: 190px;
                }

                .pmew-crossref-table thead tr:nth-child(2) th {
                    top: 46px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function crInit() {
        crInjectcss();
        crRender();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", crInit);
    } else {
        crInit();
    }

    window.addEventListener("load", () => {
        setTimeout(crInit, 250);
    });
})();














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
                subtypeFolders[currentSubtype] || []
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
/* ==========================================================
   18. PUBLIC FEATURED PRODUCTS DATA API
   ----------------------------------------------------------
   This is the only data interface used by featured-hot-products.js.

   STANDARD PRODUCTS
   - Generated directly from pradakoStandardsBySubtype.
   - Uses the same standard image-candidate and URL helpers as Products.

   CUSTOMISE PRODUCTS
   - Generated only from the Customised Products catalogue cards controlled
     by this file: #customized_products or
     .pradako-customised-products-section.
   - It never falls back to Standard Products.
========================================================== */

(function exposePradakoProductsApi() {
    "use strict";

    const API_VERSION = "20260805-18";
    const DEFAULT_CUSTOM_CATALOGUE_PAGE = "/pages/products/products.html";
    const customCache = new Map();
    let standardCache = null;

    const CUSTOM_SECTION_SELECTORS = [
        ".pradako-customised-products-section",
        "#customized_products",
        "#customised_products",
        "#customize_products",
        "#custom_products"
    ];

    function apiCleanText(value) {
        return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function apiSlug(value) {
        return apiCleanText(value)
            .toLowerCase()
            .replace(/&/g, " and ")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "product";
    }

    function apiAbsoluteUrl(value, baseUrl) {
        const source = apiCleanText(value);
        if (!source || source.startsWith("#")) return source;

        try {
            return new URL(source, baseUrl || window.location.href).href;
        } catch (error) {
            return source;
        }
    }

    function apiUnique(values) {
        const seen = new Set();
        return (values || []).filter((value) => {
            const key = apiCleanText(value);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function cloneProduct(product) {
        return {
            ...product,
            imageCandidates: Array.isArray(product.imageCandidates)
                ? [...product.imageCandidates]
                : []
        };
    }

    /*
       Product-specific image overrides for frequently featured standards.
       The first entry should be the most accurate available image. The next
       entries are independent fallbacks, so four different standards do not
       collapse to one shared subtype photograph when an exact filename is
       unavailable on the server.
    */
    const STANDARD_PRODUCT_IMAGE_OVERRIDES = Object.freeze({
        "DIN 931": [
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-931.jpg",
            "/assets/images/products/catalogue/hex-bolt.png"
        ],
        "DIN 933": [
            "/assets/images/watermarked-images/standard-fasteners/screws/10-hex-cap-screws/din-933-fully-threaded-hexagon-head-screw.png",
            "/assets/images/products/catalogue/structural-bolt.png"
        ],
        "ISO 4014": [
            "/assets/images/products/catalogue/hex-bolt.png",
            "/assets/images/watermarked-images/standard-fasteners/bolts/din-960.jpg"
        ],
        "ASME B18.2.1": [
            "/assets/images/products/catalogue/structural-bolt.png",
            "/assets/images/watermarked-images/standard-fasteners/hv-bolts/din-6914.jpg"
        ],
        "DIN 912": [
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/din-912-without-serration-iso-4762.jpg",
            "/assets/images/products/catalogue/socket-screw.png"
        ],
        "DIN 7991": [
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/din-7991.jpg",
            "/assets/images/products/catalogue/socket-screw.png"
        ],
        "ISO 7380": [
            "/assets/images/watermarked-images/standard-fasteners/screws/1-socket-screws/iso-7380-1.jpg",
            "/assets/images/products/catalogue/socket-screw.png"
        ],
        "DIN 934": [
            "/assets/images/watermarked-images/standard-fasteners/nuts/din-934.jpg",
            "/assets/images/products/catalogue/nut.png"
        ],
        "DIN 125": [
            "/assets/images/watermarked-images/standard-fasteners/washers/din-125.jpg",
            "/assets/images/products/catalogue/washer.png"
        ],
        "DIN 975": [
            "/assets/images/products/catalogue/threaded-rod.png"
        ]
    });

    const STANDARD_GENERIC_IMAGE_POOL = Object.freeze([
        "/assets/images/products/catalogue/hex-bolt.png",
        "/assets/images/products/catalogue/structural-bolt.png",
        "/assets/images/products/catalogue/socket-screw.png",
        "/assets/images/products/catalogue/pan-head-machine-screw.png",
        "/assets/images/products/catalogue/threaded-rod.png",
        "/assets/images/products/catalogue/nut.png",
        "/assets/images/products/catalogue/washer.png",
        "/assets/images/products/catalogue/rivet.png"
    ]);

    function apiHash(value) {
        let hash = 2166136261;
        const textValue = apiCleanText(value);

        for (let index = 0; index < textValue.length; index += 1) {
            hash ^= textValue.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }

        return hash >>> 0;
    }

    function rotateImagePool(pool, startIndex) {
        if (!Array.isArray(pool) || !pool.length) return [];

        const start = Math.abs(startIndex) % pool.length;
        return pool.map((_, offset) => pool[(start + offset) % pool.length]);
    }

    function getStandardImageCandidates(name, subtype, ordinal) {
        const candidates = [];
        const override = STANDARD_PRODUCT_IMAGE_OVERRIDES[name] || [];
        candidates.push(...override);

        if (typeof pradakoGetStandardProductImage === "function") {
            const imageValue = pradakoGetStandardProductImage(name, subtype);
            candidates.push(...(Array.isArray(imageValue) ? imageValue : [imageValue]));
        }

        /*
           Each standard receives a different starting position in this pool.
           These images are already declared in products.js and therefore make
           safe temporary fallbacks while exact standard photographs are added.
        */
        const poolStart = (apiHash(`${subtype}|${name}`) + ordinal) % STANDARD_GENERIC_IMAGE_POOL.length;
        candidates.push(...rotateImagePool(STANDARD_GENERIC_IMAGE_POOL, poolStart));

        /* Keep the common subtype image last, not second. */
        if (typeof pradakoGetSubtypeImage === "function") {
            candidates.push(pradakoGetSubtypeImage(subtype));
        }

        return apiUnique(candidates);
    }

    function getStandardProducts() {
        if (standardCache) return standardCache.map(cloneProduct);

        const results = [];
        const seen = new Set();
        let productOrdinal = 0;

        Object.entries(pradakoStandardsBySubtype || {}).forEach(([subtype, standards]) => {
            const family = typeof pradakoFindFamilyFromSubtype === "function"
                ? pradakoFindFamilyFromSubtype(subtype)
                : "Fasteners";

            (standards || []).forEach((standard, index) => {
                const name = apiCleanText(standard);

                if (!name || /\bdemo\b/i.test(name) || name === "—") return;

                const uniqueKey = `${family}|${subtype}|${name}`.toLowerCase();
                if (seen.has(uniqueKey)) return;
                seen.add(uniqueKey);

                const imageCandidates = getStandardImageCandidates(
                    name,
                    subtype,
                    productOrdinal
                );
                productOrdinal += 1;

                const url = typeof pradakoGetStandardProductUrl === "function"
                    ? pradakoGetStandardProductUrl(name)
                    : `/pages/products/standard-products.html?standard=${encodeURIComponent(String(name || "").trim())}`;

                results.push({
                    id: `standard-${apiSlug(subtype)}-${apiSlug(name)}-${index + 1}`,
                    name,
                    description: subtype,
                    subtype,
                    family,
                    category: family,
                    image: imageCandidates[0] || "",
                    imageCandidates,
                    url,
                    source: "standard"
                });
            });
        });

        standardCache = results;
        return standardCache.map(cloneProduct);
    }

    function findCustomSection(documentNode) {
        for (const selector of CUSTOM_SECTION_SELECTORS) {
            const section = documentNode.querySelector(selector);
            if (section) return section;
        }

        return null;
    }

    function getCustomCardRoot(section) {
        return section.querySelector("#customGridView") || section;
    }

    function readCustomCardName(card) {
        return apiCleanText(
            card.getAttribute("data-custom-family") ||
            card.getAttribute("data-product-name") ||
            card.querySelector(".pradako-products-card-title")?.textContent ||
            card.querySelector(".product-title")?.textContent ||
            card.querySelector("h3")?.textContent ||
            card.querySelector("h2")?.textContent ||
            card.getAttribute("aria-label") ||
            ""
        );
    }

    function readCustomCardDescription(card) {
        return apiCleanText(
            card.getAttribute("data-product-description") ||
            card.querySelector(".pradako-products-card-text")?.textContent ||
            card.querySelector(".pradako-products-card-note")?.textContent ||
            card.querySelector(".product-description")?.textContent ||
            card.querySelector("p")?.textContent ||
            "Made-to-requirement fastener solution"
        );
    }

    function readCustomCardImage(card, baseUrl) {
        const image = card.querySelector(
            ".pradako-products-image-box img, img[data-src], img"
        );

        const source = apiCleanText(
            image?.getAttribute("src") ||
            image?.getAttribute("data-src") ||
            card.getAttribute("data-product-image") ||
            ""
        );

        return source ? apiAbsoluteUrl(source, baseUrl) : "";
    }

    function readCustomCardUrl(card, baseUrl) {
        const anchor = card.matches("a[href]")
            ? card
            : card.querySelector("a[href]");

        const value = apiCleanText(
            anchor?.getAttribute("href") ||
            card.getAttribute("data-product-url") ||
            ""
        );

        return value
            ? apiAbsoluteUrl(value, baseUrl)
            : apiAbsoluteUrl("/pages/products/products.html#customized_products", baseUrl);
    }

    function parseCustomProducts(documentNode, baseUrl) {
        const section = findCustomSection(documentNode);
        if (!section) return [];

        const root = getCustomCardRoot(section);
        const candidateGroups = [
            Array.from(root.querySelectorAll("a.pradako-products-card-link[href]")),
            Array.from(root.querySelectorAll("[data-custom-family]")),
            Array.from(root.querySelectorAll("[data-product-card]")),
            Array.from(root.querySelectorAll(".pradako-products-card")),
            Array.from(root.querySelectorAll("article"))
        ];

        const cards = candidateGroups.find((group) => group.length) || [];
        const results = [];
        const seen = new Set();

        cards.forEach((card, index) => {
            const name = readCustomCardName(card);
            if (!name) return;

            const key = name.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);

            const image = readCustomCardImage(card, baseUrl);
            const url = readCustomCardUrl(card, baseUrl);

            results.push({
                id: `customised-${apiSlug(name)}-${index + 1}`,
                name,
                description: readCustomCardDescription(card),
                family: name,
                category: "Customised Products",
                image,
                imageCandidates: image ? [image] : [],
                url,
                source: "customised"
            });
        });

        return results;
    }

    async function getCustomisedProducts(options = {}) {
        const sourcePage = apiCleanText(
            options.customCataloguePage ||
            options.sourcePage ||
            DEFAULT_CUSTOM_CATALOGUE_PAGE
        );

        const currentSection = findCustomSection(document);
        if (currentSection) {
            const currentProducts = parseCustomProducts(document, window.location.href);
            if (currentProducts.length) return currentProducts.map(cloneProduct);
        }

        const absolutePage = apiAbsoluteUrl(sourcePage, window.location.href);

        if (!options.forceRefresh && customCache.has(absolutePage)) {
            return customCache.get(absolutePage).map(cloneProduct);
        }

        const response = await fetch(absolutePage, {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Unable to load the Customised Products catalogue: HTTP ${response.status}.`);
        }

        const html = await response.text();
        const documentNode = new DOMParser().parseFromString(html, "text/html");
        const products = parseCustomProducts(documentNode, response.url || absolutePage);

        if (!products.length) {
            throw new Error(
                "The Products page does not contain usable Customised Products cards inside #customized_products or .pradako-customised-products-section."
            );
        }

        customCache.set(absolutePage, products);
        return products.map(cloneProduct);
    }

    async function getFeaturedProducts(options = {}) {
        const [standard, customised] = await Promise.all([
            Promise.resolve(getStandardProducts()),
            getCustomisedProducts(options)
        ]);

        return {
            standard,
            customised,
            generatedAt: new Date().toISOString(),
            version: API_VERSION
        };
    }

    window.PradakoProductsAPI = Object.freeze({
        version: API_VERSION,
        customSectionSelectors: [...CUSTOM_SECTION_SELECTORS],
        getStandardProducts,
        getCustomisedProducts,
        getFeaturedProducts
    });

    window.dispatchEvent(new CustomEvent("pradako:products-api-ready", {
        detail: { version: API_VERSION }
    }));
})();
