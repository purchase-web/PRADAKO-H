#!/usr/bin/env python3
"""
PRADAKO — CATALOGUE BUILD SCRIPT
================================

WHY THIS EXISTS
---------------
Before this script, engineering data lived at FAMILY level only. That meant all
56 screws displayed the identical spec chips ("4.8 / 8.8 / 10.9 · M1.6 – M24 ·
DIN 84"), which a tier-1 buyer reads as decoration within about two seconds.

This script derives PER-PRODUCT attributes — standard, drive, head form, thread
type, grades, materials, finishes, size range, sector, cross-reference set and
applicable engineering tools — by matching each product name against an ordered
rules table, then falling back to family defaults.

    python3 tools/build_catalog.py

Reads   : tools/catalog.source.json      (names, images, grouping — the truth)
Writes  : js/customised-products-data.js (enriched catalogue consumed by the site)

DERIVED VS VERIFIED
-------------------
Every attribute produced by a RULE is tagged  "source": "derived"  and shows a
"Derived" marker in the admin export. Anything listed in tools/overrides.json is
tagged "verified" and is never overwritten by a rule.

    >>> The works team should move attributes from derived to verified by
    >>> editing tools/overrides.json and re-running this script. Nothing in
    >>> the site code needs to change.

Run  `python3 tools/build_catalog.py --report`  for a coverage table showing how
many products are still on derived data.
"""

import json
import os
import re
import sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


# =============================================================================
#  FINISH / MATERIAL / SECTOR PRESETS
# =============================================================================

F_STD = ["Trivalent zinc (blue/yellow/black)", "Zinc flake", "Black oxide",
         "Phosphate", "Hot dip galvanised", "Plain"]
F_HT = ["Zinc flake (Geomet/Delta-Tone)", "Trivalent zinc", "Phosphate & oil",
        "Hot dip galvanised", "Xylan", "Black oxide"]
F_SS = ["Passivated", "Electropolished", "Pickled", "PTFE", "Plain bright"]
F_TAP = ["Trivalent zinc", "Zinc flake", "Ruspert", "Black phosphate", "Nickel"]

M_CARB = ["C1018 / C1022 low carbon", "10B21 boron steel"]
M_ALLOY = ["10B21 / 10B33 boron", "SCM435 / 34CrMo4", "42CrMo4 / AISI 4140"]
M_SS = ["AISI 304 / 304L", "AISI 316 / 316L", "AISI 410"]
M_CASE = ["Case-hardened C1022", "Carbon steel, case hardened"]

S_AUTO = ["Automotive", "Two & three wheeler", "Commercial vehicle"]
S_CONST = ["Construction", "Infrastructure", "Structural steel"]
S_GEN = ["General engineering", "Machine building"]
S_ENERGY = ["Wind energy", "Solar", "Power generation"]
S_MARINE = ["Marine & offshore", "Chemical process", "Desalination"]


# =============================================================================
#  RULES TABLE
#  Ordered, most specific first. First match wins per attribute; unmatched
#  attributes fall through to the family default.
# =============================================================================

RULES = [
    # ---- SOCKET / ALLEN -----------------------------------------------------
    (r"socket head cap|allen bolt|allen screw|socket screw", dict(
        standards=["DIN 912", "ISO 4762", "ASME B18.3", "IS 2269"],
        crossRef=["DIN 912", "ISO 4762", "ASME B18.3", "IS 2269", "JIS B 1176"],
        drive="Hex socket", head="Cylindrical / Cap", threadType="Metric coarse & fine",
        grades=["8.8", "10.9", "12.9", "A2-70", "A4-80"], materials=M_ALLOY,
        finishes=F_HT, sizeRange="M1.6 – M36", sectors=S_AUTO + S_GEN)),

    (r"12[ -]?point", dict(
        standards=["DIN 6900", "ISO 14579", "ASME B18.2.1"],
        crossRef=["DIN 6900", "ISO 14579"],
        drive="12-point (double hex)", head="Flange / 12-point", threadType="Metric fine",
        grades=["10.9", "12.9"], materials=M_ALLOY, finishes=F_HT,
        sizeRange="M6 – M24", sectors=S_AUTO + ["Aerospace", "Motorsport"])),

    (r"grub screw|set screw", dict(
        standards=["DIN 913", "DIN 914", "DIN 915", "DIN 916", "ISO 4026", "ISO 4027", "ISO 4028", "ISO 4029"],
        crossRef=["DIN 913", "ISO 4026", "ASME B18.3", "IS 6094"],
        drive="Hex socket / Slotted", head="Headless", threadType="Metric coarse",
        grades=["14H", "45H", "A2-70"], materials=["Alloy steel, hardened 45H", "AISI 304 / 420"],
        finishes=["Black oxide", "Plain", "Passivated"],
        sizeRange="M1.6 – M24", sectors=S_GEN + ["Tooling & fixtures"])),

    (r"shoulder bolt|distance screw", dict(
        standards=["ISO 7379", "DIN 923", "ASME B18.3"],
        crossRef=["ISO 7379", "DIN 923"],
        drive="Hex socket", head="Cylindrical shoulder", threadType="Metric coarse",
        grades=["12.9", "A2-70"], materials=["SCM435 hardened", "AISI 303/304"],
        finishes=["Black oxide", "Plain ground"], sizeRange="6 – 25 mm shoulder dia",
        sectors=["Tooling & fixtures", "Machine building", "Automotive"])),

    # ---- TORX / SECURITY ----------------------------------------------------
    (r"trox|six lobe|torx", dict(
        standards=["ISO 14583", "ISO 14579", "DIN 34800"],
        crossRef=["ISO 14583", "ISO 14579"],
        drive="Torx / six-lobe", head="Pan / Countersunk / Cap",
        threadType="Metric coarse", grades=["8.8", "10.9", "A2-70"],
        materials=M_CARB + M_ALLOY, finishes=F_TAP,
        sizeRange="M2 – M16", sectors=S_AUTO + ["Electronics", "White goods"])),

    (r"security|anti[ -]?theft|tamper", dict(
        standards=["Manufacturer standard", "DIN 7500 (form)", "ISO 7045 (reference)"],
        crossRef=["Pradako proprietary", "Customer drawing"],
        drive="Pin-Torx / Two-hole / One-way / Shear-off",
        head="Button / Mushroom / Shear nut", threadType="Metric coarse",
        grades=["8.8", "10.9", "A2-70"], materials=M_CARB + M_SS,
        finishes=F_STD, sizeRange="M4 – M20",
        sectors=["Public infrastructure", "Rail", "Transit", "Retail fit-out"])),

    # ---- TAPPING / DRILLING -------------------------------------------------
    (r"self drilling|tek screw|buldex", dict(
        standards=["DIN 7504", "ISO 15480", "ISO 15481", "ISO 15482", "AS 3566"],
        crossRef=["DIN 7504 K/N/P", "ISO 15480", "AS 3566 Class 3/4"],
        drive="Hex washer / Phillips / Torx", head="Hex washer / Pan / Countersunk",
        threadType="Self-drilling, point 2–5", grades=["Case hardened", "Bi-metal A2"],
        materials=M_CASE + ["Bi-metal (A2 body, carbon point)"],
        finishes=F_TAP + ["Ruspert 1000 h"], sizeRange="#6 – #14  |  3.5 – 6.3 mm",
        sectors=S_CONST + ["Roofing & cladding", "Solar mounting", "HVAC"])),

    (r"self tapping|sheet metal screw|type 17|bt type|high low|hi low|trilobular|thread rolling", dict(
        standards=["DIN 7981", "DIN 7982", "DIN 7983", "ISO 7049", "ISO 7050", "ISO 1478", "DIN 7500"],
        crossRef=["DIN 7981", "ISO 7049", "ASME B18.6.4", "IS 7999"],
        drive="Phillips / Pozidriv / Torx / Slotted",
        head="Pan / Countersunk / Raised / Hex washer",
        threadType="Self-tapping AB/B/C, tri-lobular",
        grades=["Case hardened", "A2-70"], materials=M_CASE + ["AISI 304 / 410"],
        finishes=F_TAP, sizeRange="ST2.2 – ST8  |  #4 – #14",
        sectors=["Appliance", "Electronics", "Sheet metal", "Automotive trim"])),

    (r"machine screw", dict(
        standards=["DIN 84", "DIN 963", "DIN 965", "DIN 7985", "ISO 1207", "ISO 2009", "ISO 7045", "ASME B18.6.3"],
        crossRef=["DIN 7985", "ISO 7045", "ASME B18.6.3", "IS 1365", "JIS B 1111"],
        drive="Slotted / Phillips / Pozidriv / Torx",
        head="Pan / Cheese / Countersunk / Raised", threadType="Metric coarse & fine",
        grades=["4.8", "8.8", "A2-70", "A4-80"], materials=M_CARB + M_SS,
        finishes=F_STD + ["Nickel", "Brass plated"], sizeRange="M1.6 – M10",
        sectors=["Electronics", "Appliance", "Instrumentation", "General engineering"])),

    # ---- APPLICATION SCREWS -------------------------------------------------
    (r"wood|timber|coach screw|decking|chipboard", dict(
        standards=["DIN 571", "DIN 96", "DIN 97", "DIN 7997", "ISO 1479", "EN 14592"],
        crossRef=["DIN 571 (coach)", "DIN 7997", "EN 14592"],
        drive="Torx / Pozidriv / External hex", head="Countersunk / Hex / Flange",
        threadType="Wood thread, partial or full", grades=["Case hardened", "A2-70", "A4-80"],
        materials=M_CASE + ["AISI 304 / 316"], finishes=["Yellow zinc", "Ruspert", "Green organic", "Plain"],
        sizeRange="3.0 – 12.0 mm  ×  16 – 400 mm",
        sectors=["Timber construction", "Decking & landscaping", "Furniture", "Roofing"])),

    (r"drywall|gypsum|sandwich panel|plasterboard", dict(
        standards=["DIN 18182", "EN 14566", "ASTM C1002", "ASTM C954"],
        crossRef=["DIN 18182-2", "EN 14566", "ASTM C1002"],
        drive="Phillips #2", head="Bugle", threadType="Coarse / fine drywall thread",
        grades=["Case hardened"], materials=M_CASE,
        finishes=["Black phosphate", "Trivalent zinc", "Grey phosphate"],
        sizeRange="3.5 – 4.8 mm  ×  25 – 150 mm",
        sectors=["Drywall & interiors", "Construction", "Modular building"])),

    (r"concrete screw|hex slotted concrete", dict(
        standards=["ETA (ETAG 001)", "ICC-ES AC193", "EN 1992-4"],
        crossRef=["ETA approved", "ICC-ES AC193"],
        drive="Hex washer / Torx / Phillips", head="Hex flange / Countersunk",
        threadType="Hardened concrete thread", grades=["Case hardened", "A4 stainless"],
        materials=["Case-hardened carbon", "AISI 410", "AISI 316"],
        finishes=["Blue Ruspert", "Zinc flake", "Mechanical zinc"],
        sizeRange="6.0 – 14.0 mm  ×  40 – 200 mm",
        sectors=S_CONST + ["Anchoring", "Façade", "Seismic"])),

    (r"roofing screw|epdm", dict(
        standards=["DIN 7504 K", "AS 3566 Class 3/4", "EN 14592"],
        crossRef=["DIN 7504 K", "AS 3566"],
        drive="Hex washer 5/16\"", head="Hex flange with bonded EPDM washer",
        threadType="Self-drilling / self-tapping", grades=["Case hardened", "Bi-metal A2"],
        materials=M_CASE + ["Bi-metal A2/carbon"],
        finishes=["Ruspert", "Zinc flake", "Powder-coated head to RAL"],
        sizeRange="5.5 – 6.3 mm  ×  25 – 150 mm",
        sectors=["Roofing & cladding", "Industrial sheds", "Solar mounting"])),

    (r"solar power fastener|solar", dict(
        standards=["ISO 3506", "DIN 7504", "EN 1993-1-4"],
        crossRef=["ISO 3506-1 A2/A4", "DIN 7504"],
        drive="Hex / Torx / Hex socket", head="Hex flange / T-head / Cap",
        threadType="Metric coarse", grades=["A2-70", "A4-80", "8.8"],
        materials=["AISI 304 / 316", "Anodised aluminium", "10B21"],
        finishes=["Passivated", "Anodised", "Zinc flake 1000 h"],
        sizeRange="M6 – M16", sectors=["Solar mounting", "Renewables", "Structural"])),

    # ---- SEMS / WASHER ASSEMBLIES -------------------------------------------
    (r"sems|washer assembl|screws with washer", dict(
        standards=["DIN 6900", "IFI 111", "IFI 113", "JIS B 1188"],
        crossRef=["DIN 6900-2", "IFI 111", "JIS B 1188"],
        drive="Phillips / Pozidriv / Torx / Hex", head="Pan / Hex flange",
        threadType="Metric coarse, captive washer",
        grades=["4.8", "8.8", "A2-70"], materials=M_CARB + M_SS,
        finishes=F_STD, sizeRange="M2.5 – M12",
        sectors=["Electronics", "Automotive", "White goods", "Assembly lines"])),

    # ---- HEX / STRUCTURAL BOLTS ---------------------------------------------
    (r"heavy hex|structural bolt|structural heavy|hsfg|friction grip|a325|a490|tc bolt|tension control", dict(
        standards=["ASTM F3125 Gr A325/A490", "EN 14399-3", "EN 14399-10", "DIN 6914", "IS 3757"],
        crossRef=["ASTM A325 ≡ F3125 GrA325", "ASTM A490 ≡ F3125 GrA490", "EN 14399-3 HR", "DIN 6914", "IS 3757"],
        drive="Heavy hex", head="Heavy hex", threadType="Metric coarse / UNC",
        grades=["8.8", "10.9", "A325", "A490"],
        materials=["Medium carbon Q&T", "42CrMo4 / AISI 4140", "AISI 4037"],
        finishes=["Hot dip galvanised", "Mechanical zinc", "Plain", "Zinc flake"],
        sizeRange="M12 – M36  |  1/2\" – 1.1/2\"",
        sectors=["Structural steel", "Bridges", "Wind towers", "Infrastructure"],
        tests=["Tensile & proof load", "Rotational capacity", "Hardness", "Charpy impact"])),

    (r"^hex bolt|hex bolts$|hex head bolt|taper hex bolt", dict(
        standards=["DIN 931", "DIN 933", "ISO 4014", "ISO 4017", "ASME B18.2.1", "IS 1364"],
        crossRef=["DIN 933 ≡ ISO 4017", "DIN 931 ≡ ISO 4014", "ASME B18.2.1", "IS 1364", "JIS B 1180"],
        drive="External hex", head="Hex", threadType="Metric coarse & fine, UNC/UNF",
        grades=["4.6", "5.6", "8.8", "10.9", "12.9", "A2-70", "A4-80"],
        materials=M_CARB + M_ALLOY, finishes=F_HT,
        sizeRange="M3 – M64  |  1/4\" – 2.1/2\"", sectors=S_AUTO + S_CONST + S_GEN)),

    (r"flange bolt|flange hex|serrated flange", dict(
        standards=["DIN 6921", "ISO 4162", "JIS B 1189", "IS 6649"],
        crossRef=["DIN 6921 ≡ ISO 4162", "JIS B 1189"],
        drive="External hex", head="Hex flange, serrated or plain",
        threadType="Metric coarse & fine", grades=["8.8", "10.9", "12.9"],
        materials=M_ALLOY, finishes=F_HT,
        sizeRange="M5 – M20", sectors=S_AUTO + ["Powertrain", "Chassis"])),

    (r"carriage bolt|cup head|coach bolt|mushroom head|round head serrated|elevator bolt", dict(
        standards=["DIN 603", "DIN 605", "ISO 8677", "ASME B18.5", "IS 2609"],
        crossRef=["DIN 603 ≡ ISO 8677", "ASME B18.5", "IS 2609"],
        drive="None (square neck anti-rotation)", head="Cup / Mushroom / Dome",
        threadType="Metric coarse", grades=["4.6", "4.8", "8.8", "A2-70"],
        materials=M_CARB + M_SS, finishes=F_STD,
        sizeRange="M5 – M24", sectors=S_CONST + ["Timber", "Agriculture", "Conveyors"])),

    (r"countersunk", dict(
        standards=["DIN 7991", "ISO 10642", "DIN 963", "ISO 2009", "ASME B18.3"],
        crossRef=["DIN 7991 ≡ ISO 10642", "DIN 963 ≡ ISO 2009"],
        drive="Hex socket / Phillips / Torx", head="Countersunk 90°",
        threadType="Metric coarse", grades=["8.8", "10.9", "12.9", "A2-70"],
        materials=M_ALLOY + M_SS, finishes=F_HT,
        sizeRange="M3 – M24", sectors=S_AUTO + S_GEN + ["Mould & die"])),

    (r"plow bolt|plough", dict(
        standards=["ASTM A325 (ref)", "SAE J429 Gr8", "DIN 605", "IS 2609"],
        crossRef=["ASAE S274", "SAE J429 Grade 8", "DIN 605"],
        drive="None (square/countersunk neck)", head="Countersunk flat / Domed",
        threadType="Metric coarse / UNC", grades=["8.8", "10.9", "SAE Gr8"],
        materials=["Medium carbon Q&T", "42CrMo4"],
        finishes=["Black oxide", "Phosphate", "Zinc"],
        sizeRange="M10 – M24  |  1/2\" – 1\"",
        sectors=["Agriculture", "Earthmoving", "Mining", "Tillage equipment"])),

    (r"track shoe", dict(
        standards=["ISO 10823", "SAE J429", "Manufacturer standard"],
        crossRef=["OEM equivalent (Caterpillar / Komatsu / Hitachi patterns)"],
        drive="External hex / 12-point", head="Hex / Cone",
        threadType="Metric fine", grades=["10.9", "12.9"],
        materials=["42CrMo4 / SCM440", "Boron alloy Q&T"],
        finishes=["Phosphate & oil", "Black oxide"],
        sizeRange="M12 – M24", sectors=["Earthmoving", "Mining", "Crawler undercarriage"])),

    (r"foundation bolt|anchor bolt|j bolt|l bolt|^w bent", dict(
        standards=["IS 5624", "ASTM F1554 Gr36/55/105", "DIN 529", "EN 1992-4"],
        crossRef=["ASTM F1554", "IS 5624", "DIN 529"],
        drive="External hex / Threaded end", head="L / J / Bent / Headed / Plate",
        threadType="Metric coarse, rolled or cut",
        grades=["4.6", "8.8", "F1554 Gr36/55/105", "A2-70"],
        materials=["Low carbon", "42CrMo4", "AISI 304 / 316"],
        finishes=["Hot dip galvanised", "Zinc", "Plain", "Epoxy"],
        sizeRange="M12 – M64  |  300 – 3000 mm length",
        sectors=S_CONST + ["Wind towers", "Petrochemical", "Heavy plant"])),

    (r"eye bolt|forge eye", dict(
        standards=["DIN 580", "DIN 582", "ISO 3266", "IS 4190"],
        crossRef=["DIN 580 ≡ ISO 3266", "DIN 582"],
        drive="Eye / Ring", head="Forged eye", threadType="Metric coarse",
        grades=["Class 4 / Grade 8 lifting", "A2-70"],
        materials=["C15E forged", "AISI 304"],
        finishes=["Hot dip galvanised", "Painted", "Passivated"],
        sizeRange="M6 – M100", sectors=["Lifting & rigging", "Heavy plant", "Shipping"],
        tests=["Proof load 2.5×WLL", "Magnetic particle", "Dimensional"])),

    (r"u bolt|u-bolt", dict(
        standards=["DIN 3570", "IS 2016 (ref)", "ASME B18.31.2"],
        crossRef=["DIN 3570", "ASME B18.31.2"],
        drive="Threaded both ends", head="U / Round or square bend",
        threadType="Metric coarse", grades=["4.6", "8.8", "A2-70", "A4-80"],
        materials=["Low carbon", "42CrMo4", "AISI 304 / 316"],
        finishes=["Hot dip galvanised", "Zinc", "PTFE", "Plain"],
        sizeRange="M6 – M36", sectors=["Pipe support", "Automotive suspension", "Marine", "Rail"])),

    (r"wheel bolt|wheel nut", dict(
        standards=["ISO 4000 (ref)", "JIS D 2401", "OEM standard"],
        crossRef=["OEM drawing", "JIS D 2401"],
        drive="External hex / Socket / Spline", head="Cone 60° / Ball / Flat seat",
        threadType="Metric fine (M12×1.5, M14×1.5)",
        grades=["10.9", "12.9"], materials=["SCM435 / 42CrMo4 Q&T"],
        finishes=["Zinc flake 720 h", "Trivalent zinc", "Black chrome"],
        sizeRange="M12×1.5 – M22×1.5",
        sectors=["Automotive", "Commercial vehicle", "Trailer & axle"],
        tests=["Torque-tension", "Salt spray 720 h", "Core hardness", "Decarburisation"])),

    (r"guardrail|crash barrier", dict(
        standards=["EN 1317", "AASHTO M180", "IS 5624", "MORTH Section 800"],
        crossRef=["AASHTO M180", "EN 1317", "MORTH"],
        drive="External hex", head="Mushroom / Oval / Hex",
        threadType="Metric coarse", grades=["4.6", "8.8"],
        materials=["Low carbon", "Medium carbon"],
        finishes=["Hot dip galvanised 610 g/m²", "Mechanical zinc"],
        sizeRange="M10 – M24",
        sectors=["Highway safety", "Infrastructure", "Road furniture"])),

    (r"blade bolt|hammer bolt|tower bolt", dict(
        standards=["ISO 898-1", "EN 14399", "DIN 6914", "IEC 61400 (ref)"],
        crossRef=["EN 14399-3", "DIN 6914", "ISO 898-1"],
        drive="External hex / Hex socket", head="Hex / Heavy hex / Cap",
        threadType="Metric coarse, rolled", grades=["8.8", "10.9"],
        materials=["42CrMo4 / AISI 4140", "34CrNiMo6"],
        finishes=["Zinc flake", "Hot dip galvanised", "Xylan"],
        sizeRange="M16 – M64", sectors=["Wind energy", "Tower structures", "Heavy plant"],
        tests=["Tensile & proof load", "Charpy impact −40 °C", "Ultrasonic", "Hardness"])),

    (r"engine bolt|con[ -]?rod", dict(
        standards=["ISO 898-1", "DIN 2510", "OEM standard"],
        crossRef=["ISO 898-1 Class 12.9/14.9", "OEM drawing"],
        drive="External hex / 12-point / Hex socket", head="Hex flange / 12-point / Cap",
        threadType="Metric fine, rolled after heat treatment",
        grades=["10.9", "12.9", "14.9"],
        materials=["SCM435 / 34CrMo4", "42CrMo4", "SAE 4340"],
        finishes=["Phosphate & oil", "Zinc flake", "MoS2"],
        sizeRange="M6 – M20",
        sectors=["Automotive powertrain", "Engine assembly", "Motorsport"],
        tests=["Torque-to-yield", "Fatigue", "Magnetic particle", "Decarburisation"])),

    (r"lag bolt|hanger bolt", dict(
        standards=["DIN 571", "DIN 525", "ASME B18.2.1", "IS 6735"],
        crossRef=["DIN 571", "ASME B18.2.1", "DIN 525"],
        drive="External hex", head="Hex / Double-end",
        threadType="Wood thread one end, metric the other",
        grades=["4.6", "8.8", "A2-70"], materials=M_CARB + M_SS,
        finishes=["Hot dip galvanised", "Yellow zinc", "Plain"],
        sizeRange="M6 – M20  ×  40 – 300 mm",
        sectors=["Timber construction", "Solar mounting", "Signage"])),

    (r"^t bolt|t-bolt|square bolt|square head", dict(
        standards=["DIN 186", "DIN 261", "DIN 478", "DIN 479", "ISO 299"],
        crossRef=["DIN 186 (T-head)", "DIN 261", "DIN 479"],
        drive="None / External square", head="T-head / Square",
        threadType="Metric coarse", grades=["4.6", "8.8", "A2-70"],
        materials=M_CARB + M_SS, finishes=F_STD,
        sizeRange="M6 – M36", sectors=["Machine tool", "Jigs & fixtures", "Solar mounting"])),

    (r"stud bolt|double end|double ended", dict(
        standards=["ASTM A193 B7", "ASTM A193 B16", "ASTM A320 L7", "ASME B16.5", "DIN 938", "DIN 939", "DIN 2510"],
        crossRef=["ASTM A193 B7 + A194 2H", "ASTM A320 L7 + A194 Gr4", "DIN 2510", "DIN 976"],
        drive="Threaded both ends", head="None (double-end stud)",
        threadType="Metric coarse / UNC 8-pitch",
        grades=["B7", "B7M", "B16", "B8/B8M", "L7", "8.8", "10.9"],
        materials=["42CrMo4 / AISI 4140", "AISI 304 / 316", "AISI 316L"],
        finishes=["PTFE (blue/green)", "Hot dip galvanised", "Xylan", "Zinc", "Plain"],
        sizeRange="M6 – M100  |  1/4\" – 4\"",
        sectors=["Petrochemical", "Refinery", "Power generation", "Marine"],
        tests=["Tensile & proof load", "Hardness", "Charpy at −101 °C (L7)", "PMI"])),

    # ---- NUTS ---------------------------------------------------------------
    (r"nylock|nyloc|self lock nut|prevailing torque|metal insert nut", dict(
        standards=["DIN 985", "DIN 982", "ISO 7040", "ISO 7042", "ISO 10511", "IS 7002"],
        crossRef=["DIN 985 ≡ ISO 10511", "DIN 982 ≡ ISO 7040", "ISO 7042 (all-metal)"],
        drive="External hex", head="Hex with nylon insert or metal crimp",
        threadType="Metric coarse & fine", grades=["6", "8", "10", "A2-70", "A4-80"],
        materials=["C1010 / C1022", "Medium carbon Q&T", "AISI 304 / 316"],
        finishes=F_STD, sizeRange="M3 – M48",
        sectors=S_AUTO + ["Rail", "Vibration-critical joints"],
        tests=["Prevailing torque (first/fifth cycle)", "Proof load", "Salt spray"])),

    (r"weld nut", dict(
        standards=["DIN 928", "DIN 929", "ISO 21670", "JIS B 1196"],
        crossRef=["DIN 928 (square)", "DIN 929 (hex)", "ISO 21670"],
        drive="None (projection welded)", head="Square / Hex / Round with projections",
        threadType="Metric coarse", grades=["5", "8", "A2"],
        materials=["Low carbon weldable steel", "AISI 304"],
        finishes=["Plain (weldable)", "Copper flash"],
        sizeRange="M3 – M16", sectors=S_AUTO + ["Body-in-white", "White goods"])),

    (r"rivet nut|clinch nut|self clinching", dict(
        standards=["DIN 16983", "ISO 16047 (test)", "IFI 111", "IFI 141"],
        crossRef=["IFI 141", "DIN 16983"],
        drive="Tool-set (blind or press-in)", head="Flat / Countersunk / Knurled body",
        threadType="Metric coarse", grades=["Carbon", "A2-70", "Aluminium"],
        materials=["Low carbon", "AISI 304", "Aluminium 5052"],
        finishes=["Trivalent zinc", "Passivated", "Plain"],
        sizeRange="M3 – M12", sectors=["Sheet metal", "Electronics enclosures", "Automotive"])),

    (r"castle nut|slotted nut", dict(
        standards=["DIN 935", "DIN 937", "ISO 7035", "ISO 7036", "IS 2232"],
        crossRef=["DIN 935 ≡ ISO 7035", "ASME B18.2.2"],
        drive="External hex", head="Hex with castellations",
        threadType="Metric coarse & fine", grades=["6", "8", "A2-70"],
        materials=["C1022", "Medium carbon", "AISI 304"],
        finishes=F_STD, sizeRange="M4 – M52",
        sectors=["Automotive steering & suspension", "Rail", "Agriculture"])),

    (r"dome nut|cap nut|acorn", dict(
        standards=["DIN 1587", "DIN 917", "ISO 4161 (ref)"],
        crossRef=["DIN 1587 (high)", "DIN 917 (low)"],
        drive="External hex", head="Hex with closed dome",
        threadType="Metric coarse", grades=["6", "A2-70", "A4-80"],
        materials=["C1010", "AISI 304 / 316", "Brass"],
        finishes=["Trivalent zinc", "Nickel", "Passivated", "Chrome"],
        sizeRange="M3 – M24", sectors=["Architectural", "Furniture", "Marine", "Sanitary"])),

    (r"flange nut|flange lock", dict(
        standards=["DIN 6923", "ISO 4161", "JIS B 1190", "IS 6650"],
        crossRef=["DIN 6923 ≡ ISO 4161", "JIS B 1190"],
        drive="External hex", head="Hex flange, serrated or plain",
        threadType="Metric coarse & fine", grades=["8", "10", "A2-70"],
        materials=["C1022", "Medium carbon Q&T", "AISI 304"],
        finishes=F_STD, sizeRange="M5 – M20", sectors=S_AUTO + S_GEN)),

    (r"wing nut|wing screw", dict(
        standards=["DIN 315", "DIN 316", "ISO 1580 (ref)"],
        crossRef=["DIN 315 (American form)", "DIN 316 (German form)"],
        drive="Hand-tightened wings", head="Wing", threadType="Metric coarse",
        grades=["4.8", "A2-70"], materials=["Low carbon", "AISI 304", "Brass"],
        finishes=["Trivalent zinc", "Passivated", "Plain"],
        sizeRange="M3 – M16", sectors=["Assembly", "Furniture", "Access panels"])),

    (r"jam nut|thin nut", dict(
        standards=["DIN 439", "ISO 4035", "ISO 8675", "ASME B18.2.2"],
        crossRef=["DIN 439 ≡ ISO 4035", "ISO 8675 (fine)"],
        drive="External hex", head="Hex, reduced height",
        threadType="Metric coarse & fine", grades=["04", "05", "A2-70"],
        materials=["C1010", "AISI 304 / 316"], finishes=F_STD,
        sizeRange="M2 – M64", sectors=S_GEN + ["Locking assemblies"])),

    (r"^hex nut|hex nuts$|heavy hex nut|heavy hex structure|structural nut", dict(
        standards=["DIN 934", "ISO 4032", "ISO 4033", "ASTM A563", "ASME B18.2.2", "IS 1364"],
        crossRef=["DIN 934 ≡ ISO 4032", "ASTM A563 DH", "ASME B18.2.2", "IS 1364", "JIS B 1181"],
        drive="External hex", head="Hex", threadType="Metric coarse & fine, UNC/UNF",
        grades=["5", "6", "8", "10", "12", "A2-70", "A4-80"],
        materials=["C1010 / C1022", "Medium carbon Q&T", "AISI 304 / 316"],
        finishes=F_STD, sizeRange="M2 – M64  |  #2 – 2.1/2\"",
        sectors=S_AUTO + S_CONST + S_GEN)),

    (r"square nut", dict(
        standards=["DIN 557", "DIN 562", "ISO 898-2", "ASME B18.2.2"],
        crossRef=["DIN 557", "DIN 562 (thin)"],
        drive="External square", head="Square", threadType="Metric coarse",
        grades=["4", "5", "A2-70"], materials=["C1010", "AISI 304"],
        finishes=F_STD, sizeRange="M4 – M24",
        sectors=["Channel & strut systems", "Timber", "Machine building"])),

    (r"cage nut|spring nut|chuck nut|flare nut|friction grip nut", dict(
        standards=["DIN 934 (ref)", "EIA-310 (cage)", "Manufacturer standard"],
        crossRef=["EIA-310-D (rack)", "Customer drawing"],
        drive="External hex / Spring clip", head="Application specific",
        threadType="Metric coarse", grades=["5", "8", "A2-70"],
        materials=["Spring steel", "C1022", "AISI 304"],
        finishes=["Trivalent zinc", "Black phosphate", "Passivated"],
        sizeRange="M3 – M12", sectors=["Data centre & racks", "HVAC", "Automotive"])),

    # ---- WASHERS ------------------------------------------------------------
    (r"dti|direct tension|tug washer", dict(
        standards=["ASTM F959", "ASTM F959M", "EN 14399-9", "ASTM F3125 (bolt)"],
        crossRef=["ASTM F959 ≡ EN 14399-9", "Squirter® equivalent"],
        drive="None", head="Load-indicating washer with protrusions",
        threadType="N/A", grades=["Type 325", "Type 490", "HRD"],
        materials=["Hardened carbon steel", "Weathering steel"],
        finishes=["Mechanical zinc", "Hot dip galvanised", "Plain", "Silicone squirt"],
        sizeRange="M12 – M36  |  1/2\" – 1.1/2\"",
        sectors=["Structural steel", "Bridges", "Wind towers"],
        tests=["Compressive load", "Gap verification", "Calibration lot testing"])),

    (r"spring washer|lock washer|split washer", dict(
        standards=["DIN 127", "DIN 128", "DIN 7980", "IS 3063", "ASME B18.21.1"],
        crossRef=["DIN 127 B ≡ IS 3063", "DIN 128 A (curved)", "ASME B18.21.1"],
        drive="None", head="Split spring / Curved", threadType="N/A",
        grades=["Spring temper 42–52 HRC", "A2", "A4"],
        materials=["65Mn spring steel", "AISI 304 / 316", "Phosphor bronze"],
        finishes=["Trivalent zinc", "Phosphate", "Hot dip galvanised", "Passivated"],
        sizeRange="M2 – M48", sectors=S_AUTO + S_GEN + ["Rail"])),

    (r"serrated|tooth lock|star washer", dict(
        standards=["DIN 6797", "DIN 6798", "DIN 6796", "ISO 10673"],
        crossRef=["DIN 6797 (internal/external tooth)", "DIN 6798", "DIN 6796 (conical)"],
        drive="None", head="Internal / External / Conical toothed",
        threadType="N/A", grades=["Spring temper", "200 HV", "A2"],
        materials=["Spring steel", "AISI 304"],
        finishes=["Trivalent zinc", "Phosphate", "Passivated"],
        sizeRange="M2 – M30", sectors=S_AUTO + ["Electrical bonding", "Vibration joints"])),

    (r"washer", dict(
        standards=["DIN 125", "DIN 126", "DIN 9021", "ISO 7089", "ISO 7090", "ISO 7093", "ASTM F436", "IS 2016"],
        crossRef=["DIN 125A ≡ ISO 7089", "DIN 125B ≡ ISO 7090", "DIN 9021 ≡ ISO 7093", "ASTM F436", "IS 2016"],
        drive="None", head="Flat annular", threadType="N/A",
        grades=["100 HV", "140 HV", "200 HV", "300 HV", "A2", "A4"],
        materials=["Low carbon steel", "AISI 304 / 316", "Copper", "Brass", "Nylon"],
        finishes=["Trivalent zinc", "Zinc flake", "Hot dip galvanised", "Plain", "Passivated"],
        sizeRange="M1.6 – M64  |  #0 – 2.1/2\"", sectors=S_CONST + S_AUTO + S_GEN)),

    # ---- RIVETS -------------------------------------------------------------
    (r"blind rivet|friction lock rivet|colou?r rivet|colored rivet", dict(
        standards=["DIN 7337", "ISO 15977", "ISO 15979", "ISO 15983", "IFI 114"],
        crossRef=["DIN 7337 ≡ ISO 15977", "ISO 15983 (countersunk)"],
        drive="Blind-set (pull mandrel)", head="Dome / Countersunk / Large flange",
        threadType="N/A", grades=["Standard", "Multi-grip", "Sealed", "Structural"],
        materials=["Aluminium 5052", "Steel", "AISI 304 / 316", "Copper", "Monel"],
        finishes=["Plain", "Anodised", "Powder-coated head to RAL", "Zinc"],
        sizeRange="2.4 – 8.0 mm dia  |  grip 1 – 25 mm",
        sectors=["Automotive", "Architectural cladding", "Appliance", "Signage"])),

    (r"solid rivet|snap head|mushroom head rivet|pan head rivet|flush rivet|split rivet|tubular rivet|drive rivet", dict(
        standards=["DIN 660", "DIN 661", "DIN 662", "DIN 124", "DIN 7338", "IS 2155", "IS 1929"],
        crossRef=["DIN 660 (round head)", "DIN 661 (countersunk)", "IS 2155"],
        drive="Hammer / Press set", head="Snap / Round / Countersunk / Mushroom / Pan",
        threadType="N/A", grades=["Soft temper", "A2", "Copper"],
        materials=["Low carbon steel", "Aluminium", "Copper", "Brass", "AISI 304"],
        finishes=["Plain", "Trivalent zinc", "Tinned"],
        sizeRange="1.6 – 25 mm dia", sectors=["Rail", "Brake linings", "Heavy fabrication", "Restoration"])),

    (r"self piercing rivet", dict(
        standards=["ISO 12996 (test)", "VDI 3431", "OEM standard"],
        crossRef=["OEM drawing", "ISO 12996"],
        drive="Press-set (no pre-drilled hole)", head="Countersunk / Flat",
        threadType="N/A", grades=["Hardened boron"],
        materials=["Boron steel, hardened & tempered"],
        finishes=["Zinc-tin (Almac®)", "Zinc flake"],
        sizeRange="3.0 – 5.5 mm dia  |  grip 1.5 – 6.0 mm",
        sectors=["Automotive body-in-white", "Aluminium structures", "EV battery trays"])),

    (r"threaded rivet", dict(
        standards=["DIN 16983", "IFI 141"], crossRef=["IFI 141", "DIN 16983"],
        drive="Blind-set threaded insert", head="Flat / Countersunk / Knurled",
        threadType="Metric coarse", grades=["Carbon", "A2-70", "Aluminium"],
        materials=["Low carbon", "AISI 304", "Aluminium 5052"],
        finishes=["Trivalent zinc", "Passivated", "Plain"],
        sizeRange="M3 – M12", sectors=["Sheet metal", "Automotive", "Enclosures"])),

    # ---- PINS ---------------------------------------------------------------
    (r"dowel pin|location pin", dict(
        standards=["ISO 2338", "ISO 8734", "DIN 6325", "DIN 7", "ASME B18.8.2"],
        crossRef=["ISO 2338 ≡ DIN 7", "ISO 8734 ≡ DIN 6325", "ASME B18.8.2"],
        drive="Press fit", head="None (parallel cylindrical)",
        threadType="N/A (m6 / h8 tolerance)",
        grades=["m6", "h8", "Hardened 60±2 HRC"],
        materials=["Case-hardened steel", "AISI 304 / 420", "Alloy steel"],
        finishes=["Plain ground", "Trivalent zinc", "Black oxide"],
        sizeRange="1 – 50 mm dia  ×  4 – 200 mm",
        sectors=["Tooling & fixtures", "Mould & die", "Machine building"])),

    (r"taper pin", dict(
        standards=["ISO 2339", "ISO 8736", "ISO 8737", "DIN 1", "DIN 258"],
        crossRef=["ISO 2339 ≡ DIN 1", "DIN 7977 (threaded)"],
        drive="Drive / Extract", head="Taper 1:50", threadType="N/A",
        grades=["Unhardened", "h10"], materials=["Free-cutting steel", "AISI 304"],
        finishes=["Plain", "Trivalent zinc", "Black oxide"],
        sizeRange="2 – 50 mm dia", sectors=["Machine building", "Shaft coupling", "Tooling"])),

    (r"spring pin|roll pin|coiled|spiral wound", dict(
        standards=["ISO 8752", "ISO 13337", "DIN 1481", "DIN 7346", "ASME B18.8.2"],
        crossRef=["ISO 8752 ≡ DIN 1481 (heavy)", "ISO 13337 ≡ DIN 7346 (light)"],
        drive="Press fit (self-retaining)", head="Slotted or coiled hollow",
        threadType="N/A", grades=["Spring temper 44–52 HRC", "A2"],
        materials=["Spring steel 65Mn / C67S", "AISI 301 / 420"],
        finishes=["Plain", "Phosphate", "Trivalent zinc", "Passivated"],
        sizeRange="1.5 – 25 mm dia", sectors=S_AUTO + S_GEN + ["Agriculture"])),

    (r"cotter|clevis pin|r-clip|hairpin|linch", dict(
        standards=["ISO 1234", "DIN 94", "ISO 2341", "DIN 1434", "DIN 11024"],
        crossRef=["ISO 1234 ≡ DIN 94 (split)", "ISO 2341 ≡ DIN 1434 (clevis)"],
        drive="Hand insert", head="Split / Headed / Spring clip",
        threadType="N/A", grades=["Soft temper", "Spring temper", "A2"],
        materials=["Low carbon", "Spring steel", "AISI 304"],
        finishes=["Trivalent zinc", "Plain", "Passivated"],
        sizeRange="1.0 – 20 mm dia", sectors=["Agriculture", "Trailers", "Lifting", "Automotive"])),

    (r"grooved pin|knurled pin|shear pin|hinge pin|wire lock", dict(
        standards=["ISO 8739", "ISO 8740", "ISO 8744", "DIN 1471", "DIN 1473", "DIN 1475"],
        crossRef=["ISO 8739 ≡ DIN 1471", "ISO 8740 ≡ DIN 1473"],
        drive="Press fit", head="Grooved / Knurled / Headed",
        threadType="N/A", grades=["Case hardened", "A1 stainless"],
        materials=["Case-hardened steel", "AISI 303 / 304"],
        finishes=["Plain", "Trivalent zinc", "Phosphate"],
        sizeRange="1.5 – 25 mm dia", sectors=S_GEN + ["Automotive", "Appliance"])),

    # ---- THREADED ROD -------------------------------------------------------
    (r"threaded rod|weld stud|reduced shank|tapered end rod", dict(
        standards=["DIN 975", "DIN 976", "ISO 898-1", "ASTM A193 B7", "ISO 13918 (weld studs)"],
        crossRef=["DIN 975 ≡ DIN 976-1", "ASTM A193 B7", "ISO 898-1"],
        drive="None (fully threaded bar)", head="None",
        threadType="Metric coarse, rolled or cut; RH & LH",
        grades=["4.6", "4.8", "8.8", "10.9", "B7", "B16", "L7", "A2-70", "A4-80"],
        materials=["Low carbon", "42CrMo4 / AISI 4140", "AISI 304 / 316 / 316L"],
        finishes=["Trivalent zinc", "Hot dip galvanised", "Black oxide", "PTFE", "Plain"],
        sizeRange="M4 – M64  |  1 m / 2 m / 3 m or cut to length",
        sectors=["Construction", "HVAC", "Petrochemical", "Seismic bracing"])),

    # ---- BUSHES / PLUGS -----------------------------------------------------
    (r"bush|bushing", dict(
        standards=["DIN 1850", "ISO 3547", "ISO 4379", "DIN 1494"],
        crossRef=["ISO 3547 ≡ DIN 1494", "ISO 4379"],
        drive="Press fit", head="Plain / Flanged / Split",
        threadType="N/A", grades=["Bi-metal", "Sintered", "Solid bronze", "PTFE-lined"],
        materials=["CuSn8 bronze", "Sintered iron-bronze", "Steel-backed PTFE", "PA66 / Nylon"],
        finishes=["Machined", "Oil-impregnated", "Plain"],
        sizeRange="3 – 200 mm bore",
        sectors=["Automotive", "Earthmoving", "Machine building", "Electrical isolation"])),

    (r"plug", dict(
        standards=["DIN 906", "DIN 908", "DIN 910", "DIN 7604", "ISO 6149", "BSP / NPT"],
        crossRef=["DIN 908 ≡ ISO 6149 (metric)", "DIN 910", "ASME B1.20.1 (NPT)"],
        drive="Hex socket / External hex / Slotted / Square",
        head="Flush / Hex head / Tapered", threadType="Metric, BSP, BSPT, NPT",
        grades=["5.8", "8.8", "A2-70", "A4-80"],
        materials=["Carbon steel", "AISI 304 / 316", "Brass", "Aluminium"],
        finishes=["Trivalent zinc", "Black oxide", "Phosphate", "Plain"],
        sizeRange="M5 – M48  |  1/8\" – 2\" BSP/NPT",
        sectors=["Hydraulics", "Automotive", "Oil & gas", "Machine building"])),

    # ---- STAINLESS-SPECIFIC -------------------------------------------------
    (r"duplex 2205|super duplex|2507", dict(
        standards=["ASTM A276", "ASTM A182 F51/F53", "EN 10088-3", "NORSOK M-650"],
        crossRef=["UNS S31803 / S32205", "UNS S32750", "EN 1.4462 / 1.4410"],
        grades=["Duplex 2205", "Super Duplex 2507"],
        materials=["Duplex UNS S32205", "Super duplex UNS S32750"],
        finishes=["Pickled & passivated", "Electropolished", "PTFE"],
        sizeRange="M8 – M64",
        sectors=["Offshore oil & gas", "Desalination", "Chemical process", "Marine"],
        tests=["Ferrite content", "PREN verification", "Impact at −46 °C", "PMI"])),

    (r"17-4ph|904l", dict(
        standards=["ASTM A564 Gr630", "ASTM B649 (904L)", "AMS 5643"],
        crossRef=["UNS S17400", "UNS N08904", "AMS 5643"],
        grades=["17-4PH H900/H1025", "904L"],
        materials=["17-4PH precipitation hardening", "AISI 904L super austenitic"],
        finishes=["Passivated", "Electropolished", "Plain"],
        sizeRange="M4 – M36",
        sectors=["Aerospace", "Chemical process", "Marine", "Medical equipment"],
        tests=["Hardness after ageing", "PMI", "Intergranular corrosion"])),

    (r"^a2-70|^a4-80|^a2 |^a4 |^316l|^316 |^410 |^420 ", dict(
        standards=["ISO 3506-1", "ISO 3506-2", "ASTM F593", "ASTM F594", "EN 10088"],
        crossRef=["ISO 3506-1 A2-70 ≡ ASTM F593 Gr1", "ISO 3506-1 A4-80 ≡ ASTM F593 Gr2"],
        grades=["A2-70", "A2-80", "A4-70", "A4-80", "410", "420"],
        materials=M_SS + ["AISI 316L", "AISI 420"],
        finishes=F_SS, sizeRange="M2 – M64",
        sectors=S_MARINE + ["Food & pharma", "Architectural"])),
]

FAMILY_FALLBACK_ORDER = ["screws", "bolts", "nuts", "washers", "threaded-rods",
                         "studs", "rivets", "pins", "bushes", "plugs",
                         "stainless-steel", "high-tensile"]

ATTRS = ["standards", "crossRef", "drive", "head", "threadType", "grades",
         "materials", "finishes", "sizeRange", "sectors", "tests"]


# =============================================================================
#  SUB-TYPE CLASSIFIER  (powers facets and the high-tensile matrix)
# =============================================================================

SUBTYPE_RULES = [
    (r"\bwashers?\b", "Washers"),
    (r"\bnuts?\b", "Nuts"),
    (r"\brivets?\b", "Rivets"),
    (r"\bpins?\b|\bcotters?\b|\br-clips?\b|\bhairpins?\b|\blinch\b", "Pins"),
    (r"\bbush(es|ings?)?\b", "Bushes"),
    (r"\bplugs?\b", "Plugs"),
    (r"\bthreaded rods?\b|\brods?\b|\bweld studs?\b", "Threaded Rods"),
    (r"\bstuds?\b", "Studs"),
    (r"\bscrews?\b", "Screws"),
    (r"\bbolts?\b", "Bolts"),
]

FAMILY_DEFAULT_SUBTYPE = {
    "screws": "Screws", "bolts": "Bolts", "nuts": "Nuts",
    "washers": "Washers", "rivets": "Rivets", "pins": "Pins",
    "bushes": "Bushes", "plugs": "Plugs", "studs": "Studs",
    "threaded-rods": "Threaded Rods",
}


def subtype_of(name, family_slug):
    """
    Classify a product by what it IS, not by whichever type-word happens to
    appear first in its name.

    Rule-order matching alone produced three wrong answers:
        "Screws with Washer Assemblies"          -> Washers   (it is a screw)
        "Self Drilling Screws with EPDM Washers" -> Washers   (it is a screw)
        "Square Head Bolt with Pin Hole"         -> Pins      (it is a bolt)
    and a fourth from a missing word boundary, where "linch" matched inside
    "Clinch Screws" and filed it under Pins.

    Two-step fix:

    1. If the family's own type-word appears anywhere in the name, that wins.
       A product sitting in the Screws family and called "... Screws ..." is a
       screw, whatever else the name mentions. This also correctly keeps
       "Rivet Nuts" in the Nuts family as a Nut rather than a Rivet.

    2. Otherwise take the EARLIEST match by position, because English compounds
       put the qualifier first and the head noun last, but the product's own
       identity word normally leads: "Stud Bolts" are studs, "Socket Head Cap
       Screws" sitting in the Bolts family really are screws.
    """
    # Everything after a preposition is a MODIFIER, not the product's identity.
    # "Torx with Pin" is a screw that happens to have a pin, not a pin; the same
    # logic keeps "Hex Bolt with Collar" a bolt, "Screws with Washer Assemblies"
    # a screw, and "Square Head Bolt with Pin Hole" a bolt.
    head = re.split(r"\s+(?:with|and|for|incl\.?|including)\s+", name.lower())[0]
    low = head if head.strip() else name.lower()

    family_default = FAMILY_DEFAULT_SUBTYPE.get(family_slug)
    if family_default:
        for pattern, label in SUBTYPE_RULES:
            if label == family_default and re.search(pattern, low):
                return label

    best = None
    for pattern, label in SUBTYPE_RULES:
        match = re.search(pattern, low)
        if match and (best is None or match.start() < best[0]):
            best = (match.start(), label)

    if best:
        return best[1]

    return family_default or "Fasteners"


# =============================================================================
#  ENGINEERING TOOL LINKS
# =============================================================================

def tools_for(attrs, subtype):
    """Deep links into the standalone engineering tools, pre-filled."""
    out = []
    grades = attrs.get("grades", [])
    torque_grades = [g for g in grades if re.match(r"^(4|5|8|9|10|12|14)\.\d", g)]

    if subtype in ("Bolts", "Screws", "Studs", "Threaded Rods") and torque_grades:
        out.append({
            "id": "vdi2230",
            "label": "Torque & preload",
            "url": "tools/vdi-2230-calculator.html?grade=" + torque_grades[0]
        })
    if subtype in ("Bolts", "Screws", "Nuts", "Washers", "Studs", "Threaded Rods"):
        out.append({"id": "weight", "label": "Weight calculator", "url": "tools/weight-calculator.html"})
        out.append({"id": "thread", "label": "Thread & tap drill", "url": "tools/thread-pitch-reference.html"})
    if attrs.get("finishes"):
        out.append({"id": "galvanic", "label": "Galvanic compatibility", "url": "tools/galvanic-matrix.html"})
    out.append({"id": "container", "label": "Container / pallet load", "url": "tools/container-load-calculator.html"})
    return out


# =============================================================================
#  BUILD
# =============================================================================

def derive(name, family_slug, family_meta):
    """Match name against the rules table, then fill gaps from family defaults."""
    low = name.lower()
    attrs = {}
    matched = []

    for pattern, payload in RULES:
        if re.search(pattern, low):
            matched.append(pattern)
            for key, value in payload.items():
                attrs.setdefault(key, value)

    # Family-level fallback for anything still missing.
    for key in ATTRS:
        if key in attrs:
            continue
        if key == "standards":
            attrs[key] = family_meta.get("standards", [])[:6]
        elif key == "crossRef":
            attrs[key] = family_meta.get("standards", [])[:4]
        elif key == "grades":
            attrs[key] = family_meta.get("grades", [])
        elif key == "materials":
            attrs[key] = family_meta.get("materials", [])
        elif key == "finishes":
            attrs[key] = family_meta.get("finishes", [])
        elif key == "sizeRange":
            attrs[key] = family_meta.get("sizeRange", "On request")
        elif key == "sectors":
            attrs[key] = family_meta.get("sectors", [])
        elif key == "drive":
            attrs[key] = (family_meta.get("drives") or ["On request"])[0]
        elif key == "head":
            attrs[key] = "On request"
        elif key == "threadType":
            attrs[key] = "Metric coarse"
        elif key == "tests":
            attrs[key] = ["Dimensional", "Mechanical", "Salt spray"]

    return attrs, matched


def main():
    report_only = "--report" in sys.argv

    source_path = os.path.join(HERE, "catalog.source.json")
    overrides_path = os.path.join(HERE, "overrides.json")
    meta_path = os.path.join(HERE, "family_meta.json")

    with open(source_path, encoding="utf-8") as fh:
        catalog = json.load(fh)
    with open(meta_path, encoding="utf-8") as fh:
        family_meta_all = json.load(fh)

    overrides = {}
    if os.path.exists(overrides_path):
        with open(overrides_path, encoding="utf-8") as fh:
            overrides = json.load(fh)

    stats = OrderedDict()
    total = 0
    verified_total = 0

    for family in catalog:
        slug = family["slug"]
        fmeta = family_meta_all.get(slug, {})
        fam_verified = 0
        fam_count = 0

        for group in family["groups"]:
            for product in group["productItems"]:
                name = product["name"]
                pid = "%s-%s-%s" % (
                    slug,
                    re.sub(r"[^a-z0-9]+", "-", group["type"].lower()).strip("-"),
                    re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"),
                )
                product["id"] = pid
                product["subType"] = subtype_of(name, slug)
                # partNo is assigned by tools/build_part_numbers.py and is
                # permanent; this build only carries it through.
                product.setdefault("partNo", "")

                attrs, matched = derive(name, slug, fmeta)

                ov = overrides.get(pid, {})
                if ov:
                    attrs.update(ov)
                    fam_verified += 1
                    verified_total += 1

                product["attributes"] = attrs
                product["source"] = "verified" if ov else ("derived" if matched else "family-default")
                product["tools"] = tools_for(attrs, product["subType"])
                product["url"] = "products/%s.html" % pid

                fam_count += 1
                total += 1

        stats[slug] = (fam_count, fam_verified)

    if report_only:
        print("%-20s %8s %10s %10s" % ("FAMILY", "PRODUCTS", "VERIFIED", "DERIVED"))
        for slug, (count, ver) in stats.items():
            print("%-20s %8d %10d %10d" % (slug, count, ver, count - ver))
        print("%-20s %8d %10d %10d" % ("TOTAL", total, verified_total, total - verified_total))
        return

    header = '''/* ==========================================================================
   PRADAKO — CUSTOMISED PRODUCTS CATALOGUE  (GENERATED FILE — DO NOT HAND EDIT)
   --------------------------------------------------------------------------
   Generated by  tools/build_catalog.py
   Source of truth : tools/catalog.source.json   (names, images, grouping)
   Verified data   : tools/overrides.json        (works-approved attributes)
   Family defaults : tools/family_meta.json

   Regenerate with:   python3 tools/build_catalog.py
   Coverage report:   python3 tools/build_catalog.py --report

   Each product now carries per-product engineering attributes rather than
   inheriting one identical set from its family. The "source" field records
   where each product's data came from:

       verified        signed off by the works, listed in overrides.json
       derived         matched a rule in build_catalog.py
       family-default  no rule matched; fell back to family-level data

   %d products, %d verified, %d awaiting verification.
   ========================================================================== */

window.PMEW_CUSTOM_PRODUCT_CATALOG = ''' % (total, verified_total, total - verified_total)

    out_path = os.path.join(ROOT, "js", "customised-products-data.js")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(header + json.dumps(catalog, indent=1, ensure_ascii=False) + ";\n")

    print("Wrote %s" % out_path)
    print("%d products  |  %d verified  |  %d derived/default"
          % (total, verified_total, total - verified_total))


if __name__ == "__main__":
    main()
