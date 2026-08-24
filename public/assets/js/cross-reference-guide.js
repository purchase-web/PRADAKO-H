"use strict";

/* =========================================================
   FETCH CROSS-REFERENCE SECTION INTO PRODUCT PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("pmew-cross-reference-section-loader");

    if (!loader) return;

    fetch("/pages/products/cross-reference-guide-section.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Cross-reference section could not be loaded.");
            }

            return response.text();
        })
        .then(html => {
            loader.innerHTML = html;
            pmewXrefInit();
        })
        .catch(error => {
            console.error(error);
            loader.innerHTML = `
                <section style="padding:40px 20px;text-align:center;color:#7a8ba0;">
                    Cross-reference guide could not be loaded.
                </section>
            `;
        });
});

/* =========================================================
   CROSS-REFERENCE SECTION DATA + LOGIC
========================================================= */

const pmewXrefData = {
    all: {
        title: "All Equivalent Standards",
        subtitle: "View all product-wise equivalent standards across fastener families.",
        rows: []
    },

    screws: {
        title: "Screws Equivalent Standards",
        subtitle: "Product-wise equivalent standards for screws and related fastener families.",
        rows: [
            {
                product: "Self Tapping Screws",
                type: "Type 1",
                standards: {
                    is: [],
                    din: ["DIN 968", "DIN 6928", "DIN 7504", "DIN 7971 C"],
                    bs: ["BS 4174"],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: ["ISO 1479", "ISO 1481", "ISO 7049", "ISO 7050"],
                    jis: ["JIS B 1122"],
                    uni: [],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            },
            {
                product: "Machine Screws",
                type: "Type 1",
                standards: {
                    is: [],
                    din: ["DIN 84", "DIN 85", "DIN 963", "DIN 965", "DIN 7985"],
                    bs: ["BS 4183"],
                    ansi: [],
                    astm: [],
                    asme: ["ASME B18.6.3"],
                    iso: ["ISO 1207", "ISO 1580", "ISO 2009", "ISO 7046", "ISO 7045"],
                    jis: [],
                    uni: ["UNI 6107", "UNI 6108", "UNI 6109", "UNI 7688", "UNI 7687"],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            },
            {
                product: "Countersunk Screws",
                type: "Type 1",
                standards: {
                    is: [],
                    din: ["DIN 963", "DIN 965", "DIN 7991"],
                    bs: [],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: ["ISO 2009", "ISO 7046", "ISO 10642"],
                    jis: [],
                    uni: ["UNI 6109", "UNI 7688", "UNI 5933"],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            },
            {
                product: "Wood Screws",
                type: "Type 4",
                standards: {
                    is: [],
                    din: ["DIN 95", "DIN 96", "DIN 97", "DIN 571", "DIN 7996"],
                    bs: [],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: [],
                    jis: [],
                    uni: ["UNI 701", "UNI 702", "UNI 703", "UNI 704", "UNI 8180"],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            }
        ]
    },

    "socket-screws": {
        title: "Socket Screws Equivalent Standards",
        subtitle: "Socket head cap screws, set screws, thin head socket screws and countersunk socket screws.",
        rows: [
            {
                product: "Socket Head Cap Screws",
                type: "Socket Family",
                standards: {
                    is: [],
                    din: ["DIN 912"],
                    bs: [],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: ["ISO 4762"],
                    jis: [],
                    uni: ["UNI 5931"],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            },
            {
                product: "Socket Set Screws",
                type: "Socket Family",
                standards: {
                    is: [],
                    din: ["DIN 913", "DIN 914", "DIN 915", "DIN 916"],
                    bs: [],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: ["ISO 4026", "ISO 4027", "ISO 4028", "ISO 4029"],
                    jis: [],
                    uni: ["UNI 5923", "UNI 5927", "UNI 5925", "UNI 5929"],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            },
            {
                product: "Socket Countersunk Screws",
                type: "Socket Family",
                standards: {
                    is: [],
                    din: ["DIN 7991"],
                    bs: [],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: ["ISO 10642"],
                    jis: [],
                    uni: ["UNI 5933"],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            },
            {
                product: "Thin Head Socket Screws",
                type: "Socket Family",
                standards: {
                    is: [],
                    din: ["DIN 6912", "DIN 7984"],
                    bs: [],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: [],
                    jis: [],
                    uni: ["UNI 9327"],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            }
        ]
    },

    nuts: {
        title: "Nuts Equivalent Standards",
        subtitle: "Nut standards will appear here when nut master data is connected.",
        rows: []
    },

    washers: {
        title: "Washers Equivalent Standards",
        subtitle: "Washer standards will appear here when washer master data is connected.",
        rows: []
    },

    bolts: {
        title: "Bolts Equivalent Standards",
        subtitle: "Hexagon screws, fine thread screws and related bolt standards.",
        rows: [
            {
                product: "Hexagon Screws",
                type: "Bolts",
                standards: {
                    is: [],
                    din: ["DIN 558"],
                    bs: [],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: ["ISO 4018"],
                    jis: [],
                    uni: [],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            },
            {
                product: "Fine Thread Hex Cap Screws",
                type: "Bolts",
                standards: {
                    is: [],
                    din: ["DIN 960", "DIN 961"],
                    bs: [],
                    ansi: [],
                    astm: [],
                    asme: [],
                    iso: ["ISO 8765", "ISO 8676"],
                    jis: [],
                    uni: ["UNI 5738", "UNI 5740"],
                    asnz: [],
                    cen: [],
                    dast: [],
                    gost: []
                }
            }
        ]
    },

    "threaded-rods-studs": {
        title: "Threaded Rods / Studs Equivalent Standards",
        subtitle: "Threaded rod and stud standards will appear here when master data is connected.",
        rows: []
    },

    "structural-assemblies": {
        title: "Structural Assemblies Equivalent Standards",
        subtitle: "Structural bolt assembly standards will appear here when master data is connected.",
        rows: []
    },

    rivets: {
        title: "Rivets Equivalent Standards",
        subtitle: "Rivet standards will appear here when master data is connected.",
        rows: []
    }
};

const pmewXrefColumns = [
    "is",
    "din",
    "bs",
    "ansi",
    "astm",
    "asme",
    "iso",
    "jis",
    "uni",
    "asnz",
    "cen",
    "dast",
    "gost"
];

let pmewXrefActiveFamily = "all";
let pmewXrefSearchTerm = "";

function pmewXrefBuildAllRows() {
    const families = [
        "screws",
        "socket-screws",
        "nuts",
        "washers",
        "bolts",
        "threaded-rods-studs",
        "structural-assemblies",
        "rivets"
    ];

    pmewXrefData.all.rows = families.flatMap(familyKey => {
        const family = pmewXrefData[familyKey];

        return family.rows.map(row => {
            return {
                ...row,
                type: `${row.type} · ${family.title.replace(" Equivalent Standards", "")}`
            };
        });
    });
}

function pmewXrefGetVisibleColumns() {
    return Array.from(document.querySelectorAll("#pmewXrefColumnChecks input:checked"))
        .map(input => input.value);
}

function pmewXrefCell(values) {
    if (!values || !values.length) {
        return `<span class="pmew-xref__dash">—</span>`;
    }

    return `
        <div class="pmew-xref__chips">
            ${values.map(value => `<span class="pmew-xref__chip">${value}</span>`).join("")}
        </div>
    `;
}

function pmewXrefMatchesSearch(row) {
    if (!pmewXrefSearchTerm) return true;

    const text = [
        row.product,
        row.type,
        ...Object.values(row.standards).flat()
    ].join(" ").toLowerCase();

    return text.includes(pmewXrefSearchTerm.toLowerCase());
}

function pmewXrefRender() {
    pmewXrefBuildAllRows();

    const familyData = pmewXrefData[pmewXrefActiveFamily];
    const visibleColumns = pmewXrefGetVisibleColumns();
    const rows = familyData.rows.filter(pmewXrefMatchesSearch);

    document.getElementById("pmewXrefTitle").textContent = familyData.title;
    document.getElementById("pmewXrefSubtitle").textContent = familyData.subtitle;
    document.getElementById("pmewXrefCount").textContent = `${rows.length} entries`;

    document.querySelectorAll(".pmew-xref__table [data-col]").forEach(cell => {
        cell.hidden = !visibleColumns.includes(cell.dataset.col);
    });

    const body = document.getElementById("pmewXrefBody");
    const empty = document.getElementById("pmewXrefEmpty");

    if (!rows.length) {
        body.innerHTML = "";
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    body.innerHTML = rows.map(row => {
        return `
            <tr>
                <td class="pmew-xref__product">
                    <strong>${row.product}</strong>
                    <span>${row.type}</span>
                </td>

                ${pmewXrefColumns.map(column => {
                    return `
                        <td data-col="${column}">
                            ${pmewXrefCell(row.standards[column])}
                        </td>
                    `;
                }).join("")}
            </tr>
        `;
    }).join("");

    document.querySelectorAll(".pmew-xref__table [data-col]").forEach(cell => {
        cell.hidden = !visibleColumns.includes(cell.dataset.col);
    });
}

function pmewXrefBind() {
    document.querySelectorAll(".pmew-xref__tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".pmew-xref__tab").forEach(item => {
                item.classList.remove("is-active");
            });

            tab.classList.add("is-active");
            pmewXrefActiveFamily = tab.dataset.family;
            pmewXrefSearchTerm = "";

            const search = document.getElementById("pmewXrefSearch");
            if (search) search.value = "";

            pmewXrefRender();
        });
    });

    const search = document.getElementById("pmewXrefSearch");

    if (search) {
        search.addEventListener("input", event => {
            pmewXrefSearchTerm = event.target.value.trim();
            pmewXrefRender();
        });
    }

    document.querySelectorAll("#pmewXrefColumnChecks input").forEach(input => {
        input.addEventListener("change", () => {
            const checked = pmewXrefGetVisibleColumns();

            if (!checked.length) {
                input.checked = true;
                return;
            }

            pmewXrefRender();
        });
    });
}

function pmewXrefInit() {
    pmewXrefBuildAllRows();
    pmewXrefBind();
    pmewXrefRender();
}