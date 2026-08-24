<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Technical Information | Pradako Mechanical & Engineering Works</title>

  <!-- GOOGLE FONTS -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- FONT AWESOME - KEEP ONLY ONE -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

  <!-- CSS FILES -->
  <link rel="stylesheet" href="/CSS/design_system.css">
  <link rel="stylesheet" href="/CSS/page_style.css">
  <link rel="stylesheet" href="/CSS/responsive.css">

  <style>
    :root {
      --pmew-tech-white: #ffffff;
      --pmew-tech-ink: #081f3a;
      --pmew-tech-ink-soft: #173b63;
      --pmew-tech-muted: #637083;

      --pmew-tech-blue: #1f7891;
      --pmew-tech-blue-dark: #0e5266;
      --pmew-tech-blue-soft: #eaf7fa;

      --pmew-tech-teal: #1f7891;
      --pmew-tech-teal-dark: #0e5266;
      --pmew-tech-teal-soft: #eaf7fa;

      --pmew-tech-red: #dc2626;
      --pmew-tech-red-dark: #991b1b;
      --pmew-tech-red-soft: #fff1f2;

      --pmew-tech-green: #16a34a;
      --pmew-tech-green-soft: #ecfdf3;

      --pmew-tech-orange: #f97316;
      --pmew-tech-orange-soft: #fff4eb;

      --pmew-tech-purple: #6d5dfc;
      --pmew-tech-purple-soft: #f1f0ff;

      --pmew-tech-surface: #f7fbfc;
      --pmew-tech-line: #d7e8ee;
      --pmew-tech-line-dark: #a9cbd5;

      --pmew-tech-radius-xl: 34px;
      --pmew-tech-radius-lg: 24px;
      --pmew-tech-radius-md: 18px;

      --pmew-tech-shadow: 0 24px 70px rgba(31, 120, 145, 0.12);
      --pmew-tech-shadow-soft: 0 14px 36px rgba(31, 120, 145, 0.09);

      --pmew-tech-container: 1180px;
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      font-family: "Montserrat", sans-serif;
      color: var(--pmew-tech-ink);
      background: var(--pmew-tech-white);
      overflow-x: hidden;
    }

    .pmew-tech-page {
      background: var(--pmew-tech-white);
      width: 100%;
    }

    .pmew-tech-container {
      width: min(var(--pmew-tech-container), calc(100% - 40px));
      margin: 0 auto;
    }

    .pmew-tech-section {
      padding: 96px 0;
      background: var(--pmew-tech-white);
      position: relative;
    }

    .pmew-tech-section + .pmew-tech-section {
      border-top: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-kicker {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--pmew-tech-blue);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    .pmew-tech-kicker::before {
      content: "";
      width: 38px;
      height: 2px;
      border-radius: 999px;
      background: currentColor;
    }

    .pmew-tech-title {
      font-family: "Playfair Display", serif;
      font-size: clamp(38px, 5vw, 78px);
      line-height: 0.96;
      font-weight: 500;
      letter-spacing: -0.05em;
      margin: 0;
      color: var(--pmew-tech-ink);
    }

    .pmew-tech-section-title {
      font-family: "Playfair Display", serif;
      font-size: clamp(34px, 4vw, 58px);
      line-height: 1;
      font-weight: 500;
      letter-spacing: -0.04em;
      margin: 0;
      color: var(--pmew-tech-ink);
    }

    .pmew-tech-lead {
      color: var(--pmew-tech-muted);
      font-size: 16px;
      line-height: 1.85;
      font-weight: 400;
      margin: 24px 0 0;
      max-width: 760px;
    }

    .pmew-tech-section-head {
      display: grid;
      grid-template-columns: 0.78fr 1fr;
      gap: 54px;
      align-items: end;
      margin-bottom: 54px;
    }

    .pmew-tech-section-head p {
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 15px;
      line-height: 1.85;
      max-width: 760px;
    }

    .pmew-tech-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 48px;
      padding: 13px 20px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: 1px solid transparent;
      transition: 0.25s ease;
      cursor: pointer;
    }

    .pmew-tech-btn-primary {
      background: var(--pmew-tech-blue);
      color: #ffffff;
    }

    .pmew-tech-btn-primary:hover {
      background: var(--pmew-tech-blue-dark);
      transform: translateY(-3px);
      box-shadow: var(--pmew-tech-shadow-soft);
    }

    .pmew-tech-btn-secondary {
      background: #ffffff;
      color: var(--pmew-tech-ink);
      border-color: var(--pmew-tech-line);
    }

    .pmew-tech-btn-secondary:hover {
      border-color: var(--pmew-tech-blue);
      color: var(--pmew-tech-blue);
      transform: translateY(-3px);
    }

    /* HERO */
    .pmew-tech-hero {
      min-height: 92vh;
      padding: 150px 0 90px;
      background: #ffffff;
      position: relative;
      overflow: hidden;
    }

    .pmew-tech-hero::before {
      content: "";
      position: absolute;
      left: 24px;
      right: 24px;
      bottom: 24px;
      top: 24px;
      border: 1px solid var(--pmew-tech-line);
      border-radius: 42px;
      pointer-events: none;
    }

    .pmew-tech-hero-grid {
      display: grid;
      grid-template-columns: 1.04fr 0.96fr;
      gap: 56px;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .pmew-tech-hero-copy {
      max-width: 760px;
    }

    .pmew-tech-hero-label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 15px;
      border-radius: 999px;
      background: var(--pmew-tech-blue-soft);
      border: 1px solid var(--pmew-tech-line);
      color: var(--pmew-tech-blue-dark);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      margin-bottom: 22px;
    }

    .pmew-tech-hero-label i {
      color: var(--pmew-tech-blue);
    }

    .pmew-tech-hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 34px;
    }

    .pmew-tech-hero-visual {
      background: #ffffff;
      border: 1px solid var(--pmew-tech-line);
      border-radius: var(--pmew-tech-radius-xl);
      padding: 30px;
      box-shadow: var(--pmew-tech-shadow);
    }

    .pmew-tech-ppm-display {
      padding: 34px;
      border-radius: 28px;
      background: var(--pmew-tech-blue-dark);
      color: #ffffff;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
    }

    .pmew-tech-ppm-display::after {
      content: "";
      position: absolute;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      right: -80px;
      top: -70px;
    }

    .pmew-tech-ppm-display small {
      position: relative;
      z-index: 2;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      opacity: 0.9;
    }

    .pmew-tech-ppm-display h2 {
      position: relative;
      z-index: 2;
      font-family: "Playfair Display", serif;
      font-size: clamp(76px, 11vw, 140px);
      line-height: 0.82;
      font-weight: 500;
      color: #ffffff !important;
      letter-spacing: -0.08em;
      margin: 24px 0;
    }

    .pmew-tech-ppm-display p {
      position: relative;
      z-index: 2;
      margin: 0;
      max-width: 390px;
      color: rgba(255,255,255,0.82);
      font-size: 14px;
      line-height: 1.75;
    }

    .pmew-tech-hero-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
      border: 1px solid var(--pmew-tech-line);
      border-radius: 24px;
      overflow: hidden;
      margin-top: 16px;
      background: #ffffff;
    }

    .pmew-tech-hero-strip-item {
      padding: 20px;
      border-right: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-hero-strip-item:last-child {
      border-right: 0;
    }

    .pmew-tech-hero-strip-item i {
      color: var(--pmew-tech-teal);
      font-size: 20px;
      margin-bottom: 14px;
      display: inline-flex;
    }

    .pmew-tech-hero-strip-item strong {
      display: block;
      color: var(--pmew-tech-ink);
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 6px;
      line-height: 1.35;
    }

    .pmew-tech-hero-strip-item span {
      display: block;
      color: var(--pmew-tech-muted);
      font-size: 12px;
      line-height: 1.55;
    }

    /* SUBNAV */
    .pmew-tech-subnav {
      position: sticky;
      top: 0;
      z-index: 40;
      background: rgba(255,255,255,0.94);
      backdrop-filter: blur(14px);
      border-top: 1px solid var(--pmew-tech-line);
      border-bottom: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-subnav-scroll {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow-x: auto;
      padding: 14px 0;
      scrollbar-width: none;
    }

    .pmew-tech-subnav-scroll::-webkit-scrollbar {
      display: none;
    }

    .pmew-tech-subnav a {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--pmew-tech-muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 15px;
      border: 1px solid var(--pmew-tech-line);
      border-radius: 999px;
      background: #ffffff;
      transition: 0.25s ease;
    }

    .pmew-tech-subnav a:hover,
    .pmew-tech-subnav a.is-active {
      background: var(--pmew-tech-blue-dark);
      color: #ffffff;
      border-color: var(--pmew-tech-blue-dark);
    }

    /* OVERVIEW */
    .pmew-tech-overview {
      display: grid;
      grid-template-columns: 0.78fr 1.22fr;
      gap: 60px;
      align-items: start;
    }

    .pmew-tech-overview-note {
      position: sticky;
      top: 92px;
      border-left: 4px solid var(--pmew-tech-blue);
      padding-left: 24px;
    }

    .pmew-tech-overview-note h3 {
      margin: 0 0 14px;
      font-size: 22px;
      line-height: 1.35;
      font-weight: 600;
      color: var(--pmew-tech-ink);
    }

    .pmew-tech-overview-note p {
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 14px;
      line-height: 1.8;
    }

    .pmew-tech-overview-list {
      display: grid;
      border-top: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-overview-row {
      display: grid;
      grid-template-columns: 54px 1fr;
      gap: 20px;
      padding: 28px 0;
      border-bottom: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-overview-row i {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      background: var(--pmew-tech-blue-soft);
      color: var(--pmew-tech-blue);
      font-size: 20px;
    }

    .pmew-tech-overview-row h4 {
      margin: 0 0 8px;
      color: var(--pmew-tech-ink);
      font-size: 18px;
      font-weight: 600;
    }

    .pmew-tech-overview-row p {
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 14px;
      line-height: 1.8;
    }

    /* 0 PPM */
    .pmew-tech-ppm-layout {
      display: grid;
      grid-template-columns: 0.88fr 1.12fr;
      gap: 60px;
      align-items: start;
    }

    .pmew-tech-ppm-statement {
      padding: 34px;
      border-radius: var(--pmew-tech-radius-xl);
      background: var(--pmew-tech-blue-dark);
      color: #ffffff;
      position: sticky;
      top: 92px;
    }

    .pmew-tech-ppm-statement h3 {
      font-family: "Playfair Display", serif;
      font-size: clamp(32px, 4vw, 52px);
      line-height: 1;
      letter-spacing: -0.04em;
      font-weight: 500;
      color: #ffffff !important;
      margin: 0 0 20px;
    }

    .pmew-tech-ppm-statement p {
      margin: 0 0 18px;
      color: rgba(255,255,255,0.82);
      font-size: 14px;
      line-height: 1.85;
    }

    .pmew-tech-ppm-checks {
      list-style: none;
      margin: 28px 0 0;
      padding: 0;
      display: grid;
      gap: 12px;
    }

    .pmew-tech-ppm-checks li {
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 11px;
      align-items: start;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255,255,255,0.9);
    }

    .pmew-tech-ppm-checks i {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,0.14);
      color: #ffffff;
      font-size: 12px;
      margin-top: 1px;
    }

    .pmew-tech-timeline {
      border-top: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-timeline-row {
      display: grid;
      grid-template-columns: 88px 1fr;
      gap: 24px;
      padding: 28px 0;
      border-bottom: 1px solid var(--pmew-tech-line);
      position: relative;
    }

    .pmew-tech-timeline-no {
      color: var(--pmew-tech-blue);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding-top: 3px;
    }

    .pmew-tech-timeline-content h4 {
      margin: 0 0 8px;
      color: var(--pmew-tech-ink);
      font-size: 19px;
      font-weight: 600;
      line-height: 1.35;
    }

    .pmew-tech-timeline-content p {
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 14px;
      line-height: 1.82;
    }

    /* CORE TABS */
    .pmew-tech-tabs-layout {
      display: grid;
      grid-template-columns: 330px 1fr;
      gap: 38px;
      align-items: start;
    }

    .pmew-tech-tabs {
      display: grid;
      gap: 10px;
      position: sticky;
      top: 92px;
    }

    .pmew-tech-tab-btn {
      width: 100%;
      border: 1px solid var(--pmew-tech-line);
      background: #ffffff;
      color: var(--pmew-tech-muted);
      border-radius: 18px;
      padding: 18px 20px;
      font-family: "Montserrat", sans-serif;
      font-size: 14px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      transition: 0.25s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .pmew-tech-tab-btn i {
      color: var(--pmew-tech-blue);
    }

    .pmew-tech-tab-btn.is-active,
    .pmew-tech-tab-btn:hover {
      background: var(--pmew-tech-blue-dark);
      border-color: var(--pmew-tech-blue-dark);
      color: #ffffff;
    }

    .pmew-tech-tab-btn.is-active i,
    .pmew-tech-tab-btn:hover i {
      color: #ffffff;
    }

    .pmew-tech-tab-panel {
      display: none;
      border: 1px solid var(--pmew-tech-line);
      border-radius: var(--pmew-tech-radius-xl);
      padding: 36px;
      background: #ffffff;
      box-shadow: var(--pmew-tech-shadow-soft);
    }

    .pmew-tech-tab-panel.is-active {
      display: block;
    }

    .pmew-tech-tab-panel h3 {
      font-family: "Playfair Display", serif;
      font-size: clamp(32px, 4vw, 48px);
      line-height: 1;
      letter-spacing: -0.04em;
      margin: 0 0 18px;
      font-weight: 500;
      color: var(--pmew-tech-ink);
    }

    .pmew-tech-tab-panel > p {
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 15px;
      line-height: 1.85;
      max-width: 820px;
    }

    .pmew-tech-capability-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
      margin-top: 34px;
      border-top: 1px solid var(--pmew-tech-line);
      padding-top: 28px;
    }

    .pmew-tech-capability h4 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 10px;
      font-size: 17px;
      font-weight: 700;
      color: var(--pmew-tech-ink);
    }

    .pmew-tech-capability h4 i {
      color: var(--pmew-tech-teal);
    }

    .pmew-tech-capability p {
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 14px;
      line-height: 1.75;
    }

    .pmew-tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
    }

    .pmew-tech-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 7px 10px;
      border-radius: 999px;
      background: var(--pmew-tech-surface);
      border: 1px solid var(--pmew-tech-line);
      color: var(--pmew-tech-muted);
      font-size: 11px;
      font-weight: 700;
    }

    /* IMPROVED MYTHS VS FACTS */
    .pmew-tech-mvf-section {
      background: #ffffff;
    }

    .pmew-tech-mvf-hero {
      display: grid;
      grid-template-columns: 0.82fr 1.18fr;
      gap: 44px;
      align-items: stretch;
      margin-bottom: 54px;
    }

    .pmew-tech-mvf-explain {
      border-radius: var(--pmew-tech-radius-xl);
      padding: 34px;
      background: var(--pmew-tech-blue-dark);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 280px;
      overflow: hidden;
      position: relative;
    }

    .pmew-tech-mvf-explain::after {
      content: "VS";
      position: absolute;
      right: -12px;
      bottom: -26px;
      font-family: "Playfair Display", serif;
      font-size: 130px;
      line-height: 1;
      color: rgba(255,255,255,0.08);
      letter-spacing: -0.08em;
    }

    .pmew-tech-mvf-explain h3 {
      position: relative;
      z-index: 2;
      margin: 0 0 16px;
      font-family: "Playfair Display", serif;
      font-size: clamp(34px, 4vw, 56px);
      line-height: 0.98;
      font-weight: 500;
      color: #ffffff !important;
      letter-spacing: -0.045em;
    }

    .pmew-tech-mvf-explain p {
      position: relative;
      z-index: 2;
      margin: 0;
      color: rgba(255,255,255,0.78);
      font-size: 14px;
      line-height: 1.8;
    }

    .pmew-tech-mvf-legend {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid var(--pmew-tech-line);
      border-radius: var(--pmew-tech-radius-xl);
      overflow: hidden;
      background: #ffffff;
      box-shadow: var(--pmew-tech-shadow-soft);
    }

    .pmew-tech-mvf-legend-box {
      padding: 34px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 280px;
      position: relative;
      overflow: hidden;
    }

    .pmew-tech-mvf-legend-box:first-child {
      background: var(--pmew-tech-red-soft);
      border-right: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-mvf-legend-box:last-child {
      background: var(--pmew-tech-teal-soft);
    }

    .pmew-tech-mvf-legend-box::after {
      position: absolute;
      right: 22px;
      bottom: -20px;
      font-size: 120px;
      line-height: 1;
      font-weight: 800;
      opacity: 0.08;
    }

    .pmew-tech-mvf-legend-box:first-child::after {
      content: "×";
      color: var(--pmew-tech-red);
    }

    .pmew-tech-mvf-legend-box:last-child::after {
      content: "✓";
      color: var(--pmew-tech-teal);
    }

    .pmew-tech-mvf-legend-label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      width: fit-content;
      padding: 9px 13px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 20px;
      position: relative;
      z-index: 2;
    }

    .pmew-tech-mvf-legend-box:first-child .pmew-tech-mvf-legend-label {
      background: #ffffff;
      color: var(--pmew-tech-red);
      border: 1px solid rgba(220,38,38,0.18);
    }

    .pmew-tech-mvf-legend-box:last-child .pmew-tech-mvf-legend-label {
      background: #ffffff;
      color: var(--pmew-tech-teal-dark);
      border: 1px solid rgba(0,155,155,0.18);
    }

    .pmew-tech-mvf-legend-box h4 {
      position: relative;
      z-index: 2;
      margin: 0 0 10px;
      color: var(--pmew-tech-ink);
      font-size: 22px;
      line-height: 1.28;
      font-weight: 700;
    }

    .pmew-tech-mvf-legend-box p {
      position: relative;
      z-index: 2;
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 14px;
      line-height: 1.75;
    }

    .pmew-tech-mvf-list {
      display: grid;
      gap: 24px;
    }

    .pmew-tech-mvf-item {
      border: 1px solid var(--pmew-tech-line);
      border-radius: 30px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 14px 40px rgba(8, 31, 58, 0.055);
    }

    .pmew-tech-mvf-item-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 18px 22px;
      border-bottom: 1px solid var(--pmew-tech-line);
      background: var(--pmew-tech-surface);
    }

    .pmew-tech-mvf-number {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--pmew-tech-blue-dark);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .pmew-tech-mvf-number span {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--pmew-tech-blue-soft);
      color: var(--pmew-tech-blue);
      letter-spacing: 0;
    }

    .pmew-tech-mvf-sector {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 7px;
    }

    .pmew-tech-mvf-sector span {
      display: inline-flex;
      padding: 6px 9px;
      border-radius: 999px;
      background: #ffffff;
      border: 1px solid var(--pmew-tech-line);
      color: var(--pmew-tech-muted);
      font-size: 11px;
      font-weight: 700;
    }

    .pmew-tech-mvf-split {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) 64px minmax(0, 1.1fr);
      align-items: stretch;
      min-height: 230px;
    }

    .pmew-tech-mvf-side {
      padding: 30px;
      position: relative;
      overflow: hidden;
    }

    .pmew-tech-mvf-side::after {
      position: absolute;
      right: 22px;
      bottom: -24px;
      font-size: 120px;
      line-height: 1;
      font-weight: 800;
      opacity: 0.07;
    }

    .pmew-tech-mvf-side.is-myth {
      background: var(--pmew-tech-red-soft);
    }

    .pmew-tech-mvf-side.is-myth::after {
      content: "×";
      color: var(--pmew-tech-red);
    }

    .pmew-tech-mvf-side.is-fact {
      background: var(--pmew-tech-teal-soft);
    }

    .pmew-tech-mvf-side.is-fact::after {
      content: "✓";
      color: var(--pmew-tech-teal);
    }

    .pmew-tech-mvf-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      padding: 8px 11px;
      border-radius: 999px;
      background: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 18px;
      position: relative;
      z-index: 2;
    }

    .pmew-tech-mvf-side.is-myth .pmew-tech-mvf-label {
      color: var(--pmew-tech-red);
      border: 1px solid rgba(220,38,38,0.18);
    }

    .pmew-tech-mvf-side.is-fact .pmew-tech-mvf-label {
      color: var(--pmew-tech-teal-dark);
      border: 1px solid rgba(0,155,155,0.18);
    }

    .pmew-tech-mvf-side h3 {
      position: relative;
      z-index: 2;
      margin: 0;
      color: var(--pmew-tech-ink);
      font-family: "Playfair Display", serif;
      font-size: clamp(24px, 2.6vw, 34px);
      line-height: 1.08;
      font-weight: 600;
      letter-spacing: -0.035em;
    }

    .pmew-tech-mvf-side p {
      position: relative;
      z-index: 2;
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 14px;
      line-height: 1.85;
    }

    .pmew-tech-mvf-vs {
      display: grid;
      place-items: center;
      background: #ffffff;
      border-left: 1px solid var(--pmew-tech-line);
      border-right: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-mvf-vs span {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--pmew-tech-ink);
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      box-shadow: 0 12px 28px rgba(8,31,58,0.18);
    }

    /* FAQ */
    .pmew-tech-faq-layout {
      display: grid;
      grid-template-columns: 0.74fr 1.26fr;
      gap: 44px;
      align-items: start;
    }

    .pmew-tech-faq-aside {
      position: sticky;
      top: 92px;
      border-left: 4px solid var(--pmew-tech-blue);
      padding-left: 24px;
    }

    .pmew-tech-faq-aside h2 {
      font-family: "Playfair Display", serif;
      font-size: clamp(34px, 4vw, 54px);
      line-height: 1;
      font-weight: 500;
      letter-spacing: -0.04em;
      margin: 0 0 18px;
      color: var(--pmew-tech-ink);
    }

    .pmew-tech-faq-aside p {
      margin: 0;
      color: var(--pmew-tech-muted);
      font-size: 14px;
      line-height: 1.8;
    }

    .pmew-tech-faq-list {
      border-top: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-faq-item {
      border-bottom: 1px solid var(--pmew-tech-line);
    }

    .pmew-tech-faq-question {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 23px 0;
      border: 0;
      background: transparent;
      color: var(--pmew-tech-ink);
      font-family: "Montserrat", sans-serif;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.5;
      text-align: left;
      cursor: pointer;
    }

    .pmew-tech-faq-question i {
      flex: 0 0 auto;
      width: 31px;
      height: 31px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: var(--pmew-tech-blue);
      background: var(--pmew-tech-blue-soft);
      font-size: 12px;
      transition: 0.25s ease;
    }

    .pmew-tech-faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.32s ease;
    }

    .pmew-tech-faq-answer-inner {
      padding: 0 0 24px;
      color: var(--pmew-tech-muted);
      font-size: 14px;
      line-height: 1.85;
      max-width: 880px;
    }

    .pmew-tech-faq-item.is-open .pmew-tech-faq-answer {
      max-height: 500px;
    }

    .pmew-tech-faq-item.is-open .pmew-tech-faq-question i {
      transform: rotate(45deg);
      background: var(--pmew-tech-blue-dark);
      color: #ffffff;
    }

    /* CTA */
    .pmew-tech-cta {
      padding: 90px 0;
      background: #ffffff;
    }

    .pmew-tech-cta-box {
      background: var(--pmew-tech-blue-dark);
      color: #ffffff;
      border-radius: 38px;
      padding: 58px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 34px;
      align-items: center;
      box-shadow: var(--pmew-tech-shadow);
    }

    .pmew-tech-cta-box h2 {
      font-family: "Playfair Display", serif;
      font-size: clamp(36px, 5vw, 64px);
      line-height: 1;
      letter-spacing: -0.05em;
      font-weight: 500;
      color: #ffffff !important;
      margin: 0;
      max-width: 790px;
    }

    .pmew-tech-cta-box p {
      margin: 18px 0 0;
      color: rgba(255,255,255,0.82);
      font-size: 15px;
      line-height: 1.8;
      max-width: 720px;
    }

    .pmew-tech-cta-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pmew-tech-cta .pmew-tech-btn {
      background: #ffffff;
      color: var(--pmew-tech-blue-dark);
      border-color: #ffffff;
      white-space: nowrap;
    }

    .pmew-tech-cta .pmew-tech-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 30px rgba(0,0,0,0.16);
    }

    /* RESPONSIVE */
    @media (max-width: 1120px) {
      .pmew-tech-hero-grid,
      .pmew-tech-section-head,
      .pmew-tech-overview,
      .pmew-tech-ppm-layout,
      .pmew-tech-tabs-layout,
      .pmew-tech-mvf-hero,
      .pmew-tech-faq-layout,
      .pmew-tech-cta-box {
        grid-template-columns: 1fr;
      }

      .pmew-tech-hero {
        min-height: auto;
        padding-top: 130px;
      }

      .pmew-tech-overview-note,
      .pmew-tech-ppm-statement,
      .pmew-tech-tabs,
      .pmew-tech-faq-aside {
        position: relative;
        top: auto;
      }

      .pmew-tech-tabs {
        display: flex;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .pmew-tech-tabs::-webkit-scrollbar {
        display: none;
      }

      .pmew-tech-tab-btn {
        flex: 0 0 auto;
        width: auto;
        min-width: 210px;
      }

      .pmew-tech-cta-actions {
        flex-direction: row;
        flex-wrap: wrap;
      }
    }

    @media (max-width: 900px) {
      .pmew-tech-mvf-legend {
        grid-template-columns: 1fr;
      }

      .pmew-tech-mvf-legend-box:first-child {
        border-right: 0;
        border-bottom: 1px solid var(--pmew-tech-line);
      }

      .pmew-tech-mvf-split {
        grid-template-columns: 1fr;
      }

      .pmew-tech-mvf-vs {
        padding: 12px;
        border-left: 0;
        border-right: 0;
        border-top: 1px solid var(--pmew-tech-line);
        border-bottom: 1px solid var(--pmew-tech-line);
      }
    }

    @media (max-width: 760px) {
      .pmew-tech-container {
        width: min(100% - 28px, var(--pmew-tech-container));
      }

      .pmew-tech-section {
        padding: 68px 0;
      }

      .pmew-tech-section-head {
        gap: 24px;
        margin-bottom: 38px;
      }

      .pmew-tech-hero {
        padding: 112px 0 64px;
      }

      .pmew-tech-hero::before {
        inset: 12px;
        border-radius: 28px;
      }

      .pmew-tech-title {
        font-size: clamp(42px, 14vw, 60px);
      }

      .pmew-tech-lead,
      .pmew-tech-section-head p {
        font-size: 14px;
        line-height: 1.8;
      }

      .pmew-tech-hero-visual,
      .pmew-tech-ppm-statement,
      .pmew-tech-tab-panel,
      .pmew-tech-mvf-explain,
      .pmew-tech-mvf-legend,
      .pmew-tech-mvf-item,
      .pmew-tech-cta-box {
        border-radius: 26px;
      }

      .pmew-tech-hero-visual,
      .pmew-tech-ppm-statement,
      .pmew-tech-tab-panel,
      .pmew-tech-mvf-explain,
      .pmew-tech-mvf-legend-box,
      .pmew-tech-mvf-side {
        padding: 24px;
      }

      .pmew-tech-ppm-display {
        min-height: 240px;
        padding: 26px;
        border-radius: 22px;
      }

      .pmew-tech-hero-strip {
        grid-template-columns: 1fr;
      }

      .pmew-tech-hero-strip-item {
        border-right: 0;
        border-bottom: 1px solid var(--pmew-tech-line);
      }

      .pmew-tech-hero-strip-item:last-child {
        border-bottom: 0;
      }

      .pmew-tech-overview-row,
      .pmew-tech-timeline-row {
        grid-template-columns: 1fr;
        gap: 14px;
      }

      .pmew-tech-capability-grid {
        grid-template-columns: 1fr;
      }

      .pmew-tech-mvf-item-head {
        align-items: flex-start;
        flex-direction: column;
      }

      .pmew-tech-mvf-sector {
        justify-content: flex-start;
      }

      .pmew-tech-mvf-side h3 {
        font-size: 27px;
      }

      .pmew-tech-faq-question {
        font-size: 14px;
        padding: 21px 0;
      }

      .pmew-tech-cta-box {
        padding: 34px 24px;
      }

      .pmew-tech-cta-actions {
        flex-direction: column;
      }

      .pmew-tech-btn {
        width: 100%;
      }
    }
  </style>
</head>

<body>

  <!-- NAVBAR -->
  <div id="navbar-container"></div>

  <main class="pmew-tech-page">

    <!-- HERO -->
    <section class="pmew-tech-hero" id="top">
      <div class="pmew-tech-container">
        <div class="pmew-tech-hero-grid">

          <div class="pmew-tech-hero-copy">
            <div class="pmew-tech-hero-label">
              <i class="fa-solid fa-microchip"></i>
              Technical Intelligence
            </div>

            <h1 class="pmew-tech-title">
              Fastener knowledge built for quality, reliability and performance.
            </h1>

            <p class="pmew-tech-lead">
              Explore PMEW’s technical approach to zero-defect manufacturing, core production capabilities,
              practical fastener knowledge, and frequently asked questions for customers, engineers,
              sourcing teams and quality departments.
            </p>

            <div class="pmew-tech-hero-actions">
              <a href="#zero-ppm" class="pmew-tech-btn pmew-tech-btn-primary">
                Explore 0 PPM
                <i class="fa-solid fa-arrow-right"></i>
              </a>
              <a href="#myths-facts" class="pmew-tech-btn pmew-tech-btn-secondary">
                View Myths vs Facts
                <i class="fa-solid fa-scale-balanced"></i>
              </a>
            </div>
          </div>

          <div class="pmew-tech-hero-visual">
            <div class="pmew-tech-ppm-display">
              <div>
                <small>Quality Commitment</small>
                <h2>0 PPM</h2>
              </div>
              <p>
                A disciplined target to reduce externally reported defects through prevention,
                traceability, process control and continuous improvement.
              </p>
            </div>

            <div class="pmew-tech-hero-strip">
              <div class="pmew-tech-hero-strip-item">
                <i class="fa-solid fa-route"></i>
                <strong>Traceability</strong>
                <span>Material, process route, inspection and dispatch control.</span>
              </div>

              <div class="pmew-tech-hero-strip-item">
                <i class="fa-solid fa-shield-halved"></i>
                <strong>Prevention</strong>
                <span>Quality built into production, not checked only at the end.</span>
              </div>

              <div class="pmew-tech-hero-strip-item">
                <i class="fa-solid fa-vial-circle-check"></i>
                <strong>Verification</strong>
                <span>Testing, reports and customer-specific documentation.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>



    <!-- OVERVIEW -->
    <section class="pmew-tech-section" id="overview">
      <div class="pmew-tech-container">
        <div class="pmew-tech-section-head">
          <div>
            <div class="pmew-tech-kicker">Overview</div>
            <h2 class="pmew-tech-section-title">
              A practical technical section for serious fastener buyers.
            </h2>
          </div>

          <p>
            This section helps customers understand how PMEW approaches quality, manufacturing,
            coating selection, heat treatment, customization, traceability and fastener performance
            in real applications.
          </p>
        </div>

        <div class="pmew-tech-overview">
          <div class="pmew-tech-overview-note">
            <h3>Designed for engineers, purchase teams and quality departments.</h3>
            <p>
              The content is structured for fast scanning, technical clarity and buyer confidence across
              standard, customized and application-critical fastener requirements.
            </p>
          </div>

          <div class="pmew-tech-overview-list">

            <div class="pmew-tech-overview-row">
              <i class="fa-solid fa-bullseye"></i>
              <div>
                <h4>0 PPM Commitment</h4>
                <p>
                  PMEW’s zero-defect mindset focuses on preventing defects at each stage of production,
                  from raw material verification and batch numbering to final inspection and dispatch control.
                </p>
              </div>
            </div>

            <div class="pmew-tech-overview-row">
              <i class="fa-solid fa-industry"></i>
              <div>
                <h4>Core Competencies</h4>
                <p>
                  Our strengths cover cold forging, hot forging, threading, tapping, heat treatment,
                  coatings, testing, customized development, documentation and supply reliability.
                </p>
              </div>
            </div>

            <div class="pmew-tech-overview-row">
              <i class="fa-solid fa-lightbulb"></i>
              <div>
                <h4>Myths vs Facts</h4>
                <p>
                  Fasteners may look simple, but the right selection depends on strength class,
                  material, coating, thread quality, joint design, environment, documentation and installation method.
                </p>
              </div>
            </div>

            <div class="pmew-tech-overview-row">
              <i class="fa-solid fa-comments"></i>
              <div>
                <h4>FAQs</h4>
                <p>
                  Practical answers to help customers understand fastener materials, coatings, testing,
                  property classes, traceability and customization requirements.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- 0 PPM -->
    <section class="pmew-tech-section" id="zero-ppm">
      <div class="pmew-tech-container">

        <div class="pmew-tech-section-head">
          <div>
            <div class="pmew-tech-kicker">0 PPM Commitment</div>
            <h2 class="pmew-tech-section-title">
              Zero defects is not a slogan. It is a manufacturing discipline.
            </h2>
          </div>

          <p>
            At PMEW, 0 PPM represents our commitment to reducing externally reported defects to zero through
            disciplined manufacturing, controlled processes, preventive quality planning and continuous improvement.
          </p>
        </div>

        <div class="pmew-tech-ppm-layout">

          <div class="pmew-tech-ppm-statement">
            <h3>What 0 PPM means</h3>

            <p>
              PPM stands for Parts Per Million. It is a quality measurement used to calculate how many
              defective parts are found in one million supplied parts.
            </p>

            <p>
              For PMEW, 0 PPM means preventing defects instead of only detecting them. It means building
              quality into every stage of production and controlling the risks that can affect customer assembly lines.
            </p>

            <ul class="pmew-tech-ppm-checks">
              <li>
                <i class="fa-solid fa-check"></i>
                Preventing defects before dispatch.
              </li>
              <li>
                <i class="fa-solid fa-check"></i>
                Monitoring dimensions, hardness, threads, coating and packaging.
              </li>
              <li>
                <i class="fa-solid fa-check"></i>
                Using traceability to identify, isolate and control risk.
              </li>
              <li>
                <i class="fa-solid fa-check"></i>
                Reducing customer complaints, sorting issues and assembly failures.
              </li>
            </ul>
          </div>

          <div class="pmew-tech-timeline">

            <div class="pmew-tech-timeline-row">
              <div class="pmew-tech-timeline-no">01</div>
              <div class="pmew-tech-timeline-content">
                <h4>Raw Material Control</h4>
                <p>
                  Every fastener begins with verified input material. Wire rod, steel, stainless steel,
                  brass or alloy material is checked for suitability before production.
                </p>
              </div>
            </div>

            <div class="pmew-tech-timeline-row">
              <div class="pmew-tech-timeline-no">02</div>
              <div class="pmew-tech-timeline-content">
                <h4>Batch Numbering & Traceability</h4>
                <p>
                  Each lot is controlled with batch identification so material, process route, inspection,
                  heat treatment, coating and dispatch details can be traced.
                </p>
              </div>
            </div>

            <div class="pmew-tech-timeline-row">
              <div class="pmew-tech-timeline-no">03</div>
              <div class="pmew-tech-timeline-content">
                <h4>First Piece Approval</h4>
                <p>
                  Before full production begins, first-off inspection confirms dimensional accuracy,
                  thread quality, head formation, drive type and product conformance.
                </p>
              </div>
            </div>

            <div class="pmew-tech-timeline-row">
              <div class="pmew-tech-timeline-no">04</div>
              <div class="pmew-tech-timeline-content">
                <h4>In-Process Quality Checks</h4>
                <p>
                  During forging, thread rolling, tapping, machining, heat treatment and coating,
                  critical parameters are monitored to reduce variation.
                </p>
              </div>
            </div>

            <div class="pmew-tech-timeline-row">
              <div class="pmew-tech-timeline-no">05</div>
              <div class="pmew-tech-timeline-content">
                <h4>Final Inspection & Dispatch Control</h4>
                <p>
                  Before dispatch, products are checked for quantity, packing, labeling, identification,
                  finish, visual quality and customer-specific requirements.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- CORE COMPETENCIES -->
    <section class="pmew-tech-section" id="core-competencies">
      <div class="pmew-tech-container">

        <div class="pmew-tech-section-head">
          <div>
            <div class="pmew-tech-kicker">Core Competencies</div>
            <h2 class="pmew-tech-section-title">
              Engineering strength across the complete fastener value chain.
            </h2>
          </div>

          <p>
            PMEW’s strength lies not only in making fasteners, but in understanding how fasteners perform
            in real-world assemblies across industries, environments and customer applications.
          </p>
        </div>

        <div class="pmew-tech-tabs-layout">

          <div class="pmew-tech-tabs" role="tablist" aria-label="Core competencies tabs">
            <button class="pmew-tech-tab-btn is-active" type="button" data-tab="manufacturing">
              Manufacturing
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button class="pmew-tech-tab-btn" type="button" data-tab="threading">
              Threading & Heat Treatment
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button class="pmew-tech-tab-btn" type="button" data-tab="coating">
              Coating & Finishing
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button class="pmew-tech-tab-btn" type="button" data-tab="quality">
              Quality & Testing
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button class="pmew-tech-tab-btn" type="button" data-tab="development">
              Development & Supply
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div class="pmew-tech-tab-content">

            <div class="pmew-tech-tab-panel is-active" id="tab-manufacturing">
              <h3>Fastener Manufacturing Expertise</h3>
              <p>
                PMEW manufactures standard and customized fasteners across product families, sizes,
                materials, property classes, head styles, drive types and surface finishes.
              </p>

              <div class="pmew-tech-capability-grid">
                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-screwdriver-wrench"></i> Product Range</h4>
                  <p>
                    PMEW manufactures bolts, screws, nuts, washers, studs, threaded rods, rivets,
                    pins, socket products, structural fasteners and special engineered fasteners.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">Bolts</span>
                    <span class="pmew-tech-tag">Screws</span>
                    <span class="pmew-tech-tag">Nuts</span>
                    <span class="pmew-tech-tag">Washers</span>
                  </div>
                </div>

                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-hammer"></i> Cold, Warm & Hot Forging</h4>
                  <p>
                    Forging capability gives PMEW flexibility to produce high-volume precision fasteners,
                    larger fasteners, heavy-duty products and special shapes.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">Cold Forging</span>
                    <span class="pmew-tech-tag">Warm Forging</span>
                    <span class="pmew-tech-tag">Hot Forging</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pmew-tech-tab-panel" id="tab-threading">
              <h3>Threading, Tapping & Heat Treatment</h3>
              <p>
                Thread quality and heat treatment directly affect assembly performance, load capacity,
                joint reliability and product safety.
              </p>

              <div class="pmew-tech-capability-grid">
                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-circle-nodes"></i> Threading & Tapping Capability</h4>
                  <p>
                    Thread rolling, nut tapping, internal threading and external threading are controlled for
                    pitch accuracy, thread fitment and assembly performance.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">Metric</span>
                    <span class="pmew-tech-tag">Inch</span>
                    <span class="pmew-tech-tag">Fine Thread</span>
                  </div>
                </div>

                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-temperature-high"></i> Heat Treatment Knowledge</h4>
                  <p>
                    Controlled heat treatment supports hardness, tensile strength, proof load, ductility,
                    case depth and performance for high-strength fasteners.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">8.8</span>
                    <span class="pmew-tech-tag">10.9</span>
                    <span class="pmew-tech-tag">12.9</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pmew-tech-tab-panel" id="tab-coating">
              <h3>Surface Finishing & Coating Capability</h3>
              <p>
                Surface treatment selection depends on corrosion requirement, assembly torque,
                material, strength class, application environment and industry standard.
              </p>

              <div class="pmew-tech-capability-grid">
                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-droplet"></i> Coating Systems</h4>
                  <p>
                    PMEW supports zinc plating, zinc nickel, zinc flake, hot dip galvanizing, phosphating,
                    PTFE, nickel coating, passivation and customer-specific coating systems.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">Zn</span>
                    <span class="pmew-tech-tag">Zn-Ni</span>
                    <span class="pmew-tech-tag">PTFE</span>
                    <span class="pmew-tech-tag">HDG</span>
                  </div>
                </div>

                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-shield-halved"></i> Application-Based Selection</h4>
                  <p>
                    Coating is selected based on friction, corrosion protection, hydrogen embrittlement risk,
                    thread fit, environmental exposure and customer specification.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">Corrosion</span>
                    <span class="pmew-tech-tag">Friction</span>
                    <span class="pmew-tech-tag">Performance</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pmew-tech-tab-panel" id="tab-quality">
              <h3>Quality Assurance & Testing</h3>
              <p>
                PMEW’s quality system focuses on product consistency, defect prevention, batch traceability
                and customer-specific inspection requirements.
              </p>

              <div class="pmew-tech-capability-grid">
                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-vial-circle-check"></i> Inspection & Testing</h4>
                  <p>
                    Inspection and testing includes dimensional checks, thread gauges, hardness, tensile,
                    proof load, torque, coating thickness, salt spray and final dispatch inspection.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">Testing</span>
                    <span class="pmew-tech-tag">Traceability</span>
                    <span class="pmew-tech-tag">Inspection</span>
                  </div>
                </div>

                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-file-shield"></i> Documentation Support</h4>
                  <p>
                    PMEW can support material certificates, inspection reports, coating reports,
                    heat treatment reports, batch traceability details and customer-specific documentation.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">MTC</span>
                    <span class="pmew-tech-tag">Reports</span>
                    <span class="pmew-tech-tag">Compliance</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pmew-tech-tab-panel" id="tab-development">
              <h3>Product Development & Supply Reliability</h3>
              <p>
                PMEW supports both international standard fasteners and customer-specific special fasteners
                through application understanding, development support and reliable supply planning.
              </p>

              <div class="pmew-tech-capability-grid">
                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-pen-ruler"></i> Standard & Customized Development</h4>
                  <p>
                    PMEW supports customer drawings, samples, special geometry, material selection, tooling,
                    sampling, inspection and production development.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">Drawings</span>
                    <span class="pmew-tech-tag">Samples</span>
                    <span class="pmew-tech-tag">Custom Parts</span>
                  </div>
                </div>

                <div class="pmew-tech-capability">
                  <h4><i class="fa-solid fa-chart-line"></i> Industry Application Understanding</h4>
                  <p>
                    Fastener performance varies by industry. PMEW supports automotive, aerospace, railway,
                    construction, renewable energy, electrical, infrastructure and heavy engineering sectors.
                  </p>
                  <div class="pmew-tech-tags">
                    <span class="pmew-tech-tag">Automotive</span>
                    <span class="pmew-tech-tag">Railway</span>
                    <span class="pmew-tech-tag">Construction</span>
                    <span class="pmew-tech-tag">Aerospace</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- MYTHS VS FACTS -->
    <section class="pmew-tech-section pmew-tech-mvf-section" id="myths-facts">
      <div class="pmew-tech-container">

        <div class="pmew-tech-section-head">
          <div>
            <div class="pmew-tech-kicker">Myths vs Facts</div>
            <h2 class="pmew-tech-section-title">
              Fastener myths corrected with engineering facts.
            </h2>
          </div>

          <p>
            This section instantly separates common assumptions from technical reality for American and European
            customers across aerospace, structural steel, oil & gas, construction, automotive, railway,
            renewable energy and heavy engineering.
          </p>
        </div>

        <div class="pmew-tech-mvf-hero">

          <div class="pmew-tech-mvf-explain">
            <div>
              <h3>Myth on the left. Fact on the right.</h3>
              <p>
                Each comparison is designed to help engineers, quality teams and buyers quickly identify
                where fastener selection mistakes usually happen.
              </p>
            </div>
          </div>

          <div class="pmew-tech-mvf-legend">
            <div class="pmew-tech-mvf-legend-box">
              <div class="pmew-tech-mvf-legend-label">
                <i class="fa-solid fa-xmark"></i>
                Myth
              </div>
              <h4>Common assumption</h4>
              <p>
                What many buyers or users may believe when judging fasteners only by appearance, fitment or price.
              </p>
            </div>

            <div class="pmew-tech-mvf-legend-box">
              <div class="pmew-tech-mvf-legend-label">
                <i class="fa-solid fa-check"></i>
                Fact
              </div>
              <h4>Technical reality</h4>
              <p>
                What engineers and quality teams must consider: standards, material, coating, traceability,
                documentation, testing and application risk.
              </p>
            </div>
          </div>

        </div>

        <div class="pmew-tech-mvf-list">

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>01</span> Fastener Selection</div>
              <div class="pmew-tech-mvf-sector">
                <span>Aerospace</span>
                <span>Construction</span>
                <span>Automotive</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>All fasteners are the same.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Fasteners may look similar, but they are not the same. A fastener used in aerospace,
                  structural steel, oil & gas, construction, railway or automotive applications may require
                  different material, property class, thread tolerance, coating, inspection level, traceability
                  and documentation. A standard commercial bolt is not automatically suitable for a bridge,
                  aircraft assembly, pressure equipment, wind tower or safety-critical automotive joint.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>02</span> Strength Class</div>
              <div class="pmew-tech-mvf-sector">
                <span>High Strength</span>
                <span>Structural</span>
                <span>Assembly</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>A higher strength fastener is always better.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Higher strength does not always mean better performance. A 12.9 or high-strength structural
                  fastener may need special control of tightening, coating, lubrication, hydrogen embrittlement
                  risk, mating nut compatibility and service environment. The right fastener is selected by
                  application load, joint design, standard, coating and installation method — not strength alone.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>03</span> Stainless Steel</div>
              <div class="pmew-tech-mvf-sector">
                <span>Marine</span>
                <span>Coastal</span>
                <span>Oil & Gas</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Stainless steel fasteners never rust.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Stainless steel fasteners are corrosion-resistant, not corrosion-proof. Performance depends
                  on stainless grade, environment, chloride exposure, temperature, surface finish, passivation,
                  cleaning and maintenance. A2 stainless steel may work for general environments, while A4 or
                  higher corrosion-resistant grades may be required for marine, chemical, coastal, food-processing
                  or oil & gas exposure.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>04</span> Coating Selection</div>
              <div class="pmew-tech-mvf-sector">
                <span>Corrosion</span>
                <span>Friction</span>
                <span>HE Risk</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Any coating can be used on any fastener.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Coating selection must match the fastener strength, application, corrosion requirement and
                  assembly condition. Electroplated coatings may require hydrogen embrittlement risk control
                  on high-strength fasteners, while zinc flake, zinc nickel, hot dip galvanizing, PTFE or other
                  coatings may be selected for specific corrosion, friction or environmental requirements.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>05</span> Fitment</div>
              <div class="pmew-tech-mvf-sector">
                <span>Drawing</span>
                <span>Standard</span>
                <span>Certification</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>If the fastener fits, it is correct.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Fitment alone does not confirm correctness. The fastener must match the drawing, standard,
                  material grade, property class, thread pitch, tolerance, coating thickness, head style, drive type,
                  nut compatibility, washer compatibility and tightening method. A visually similar fastener can
                  fail if its mechanical property, coating, thread tolerance or certification is wrong.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>06</span> Structural Bolting</div>
              <div class="pmew-tech-mvf-sector">
                <span>ASTM F3125</span>
                <span>EN 14399</span>
                <span>EN 15048</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Structural bolts are just normal bolts.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Structural bolting is a separate technical category. In the American market, ASTM F3125 covers
                  high-strength structural bolts. In the European market, EN 14399 applies to high-strength structural
                  bolting assemblies suitable for preloading, while EN 15048 applies to non-preloaded structural bolting
                  assemblies for structural metallic works. This is critical for bridges, buildings, towers, railway
                  structures, industrial sheds, infrastructure and heavy construction projects.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>07</span> Aerospace</div>
              <div class="pmew-tech-mvf-sector">
                <span>Traceability</span>
                <span>Documentation</span>
                <span>Safety</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Aerospace fasteners are only about high strength.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Aerospace fasteners are about much more than strength. They require control of material,
                  traceability, process discipline, documentation, counterfeit prevention, product safety,
                  dimensional accuracy and risk management. For aerospace and defense supply chains, documentation,
                  inspection history and process control are as important as the fastener itself.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>08</span> Oil & Gas</div>
              <div class="pmew-tech-mvf-sector">
                <span>Material</span>
                <span>Severe Service</span>
                <span>Reliability</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Oil & gas fasteners only need corrosion resistance.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Oil & gas fasteners need corrosion resistance, but they also require mechanical strength,
                  material qualification, traceability, testing, documentation and reliability under severe service
                  conditions. For oil & gas applications, the wrong bolting material or poor traceability can become
                  a safety, shutdown and liability issue.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>09</span> Threading</div>
              <div class="pmew-tech-mvf-sector">
                <span>Rolling</span>
                <span>Cutting</span>
                <span>Fatigue</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Thread rolling and thread cutting are the same.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Thread rolling and thread cutting are different manufacturing processes. Rolled threads are
                  formed by material displacement, while cut threads are produced by material removal. Rolled
                  threads generally provide better grain flow, surface finish and fatigue performance, which can be
                  important in automotive, aerospace, machinery, railway and high-cycle loading applications.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>10</span> Salt Spray</div>
              <div class="pmew-tech-mvf-sector">
                <span>Coating</span>
                <span>Corrosion</span>
                <span>Service Life</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Salt spray hours alone prove coating quality.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Salt spray testing is useful, but it does not fully represent real-world service life. Actual
                  corrosion performance depends on coating type, base material, installation damage, humidity,
                  chemicals, temperature, design exposure, handling and maintenance. Salt spray results should be
                  supported by coating specification, thickness control, friction requirement, adhesion and application suitability.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>11</span> Assembly Compatibility</div>
              <div class="pmew-tech-mvf-sector">
                <span>Bolt</span>
                <span>Nut</span>
                <span>Washer</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>A nut, bolt and washer can be mixed from different sources without risk.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Bolting assemblies must be compatible. The bolt, nut and washer should match in standard,
                  strength level, coating, thread fit, hardness and intended assembly method. This is especially
                  important in structural steel, wind energy, railway, heavy equipment and construction applications
                  where joint integrity depends on the complete bolting assembly, not only the bolt.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>12</span> Technical Review</div>
              <div class="pmew-tech-mvf-sector">
                <span>Load</span>
                <span>Vibration</span>
                <span>Temperature</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Standard fasteners do not need technical review.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Even standard fasteners need technical review when used in critical applications. The same
                  fastener can behave differently depending on load, vibration, temperature, corrosion exposure,
                  tightening method, mating material and safety requirement. Correct fastener selection reduces
                  rejection, downtime, safety risk and field failure.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>13</span> Documentation</div>
              <div class="pmew-tech-mvf-sector">
                <span>MTC</span>
                <span>Reports</span>
                <span>Compliance</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Documentation is only paperwork.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  Documentation is part of product quality. Material test certificates, inspection reports,
                  coating reports, heat treatment records, batch traceability, PPAP files, compliance declarations
                  and customer-specific reports help prove that the fastener was manufactured and inspected correctly.
                  For American and European customers, documentation often decides whether a fastener is acceptable
                  for critical use.
                </p>
              </div>
            </div>
          </article>

          <article class="pmew-tech-mvf-item">
            <div class="pmew-tech-mvf-item-head">
              <div class="pmew-tech-mvf-number"><span>14</span> Total Cost</div>
              <div class="pmew-tech-mvf-sector">
                <span>Rework</span>
                <span>Warranty</span>
                <span>Safety</span>
              </div>
            </div>

            <div class="pmew-tech-mvf-split">
              <div class="pmew-tech-mvf-side is-myth">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-xmark"></i>
                  Myth
                </div>
                <h3>Cheaper fasteners reduce total cost.</h3>
              </div>

              <div class="pmew-tech-mvf-vs">
                <span>VS</span>
              </div>

              <div class="pmew-tech-mvf-side is-fact">
                <div class="pmew-tech-mvf-label">
                  <i class="fa-solid fa-check"></i>
                  Fact
                </div>
                <p>
                  A cheaper fastener may increase total cost if it causes assembly rejection, rework, sorting,
                  downtime, warranty claims, corrosion failure or safety issues. The correct fastener should be
                  selected based on application risk, not only purchase price. In critical sectors, the cost of
                  failure is far higher than the cost difference between a low-grade and properly specified fastener.
                </p>
              </div>
            </div>
          </article>

        </div>

      </div>
    </section>

    <!-- FAQS -->
    <section class="pmew-tech-section" id="faqs">
      <div class="pmew-tech-container">

        <div class="pmew-tech-faq-layout">

          <aside class="pmew-tech-faq-aside">
            <h2>Frequently Asked Questions</h2>
            <p>
              Practical answers for customers, engineers, purchase teams and quality departments
              who want clarity before selecting, sourcing or developing fasteners.
            </p>
          </aside>

          <div class="pmew-tech-faq-list">

            <div class="pmew-tech-faq-item is-open">
              <button class="pmew-tech-faq-question" type="button">
                What does PMEW manufacture?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  PMEW manufactures standard and customized fasteners including bolts, screws, nuts,
                  washers, studs, threaded rods, rivets, pins, socket products, structural fasteners
                  and special engineered fasteners for multiple industries.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What does 0 PPM mean?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  0 PPM means zero defective parts per million supplied. It represents PMEW’s commitment
                  to reducing customer-side defects through preventive quality planning, process control,
                  traceability, inspection, testing and continuous improvement.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Is 0 PPM a guarantee?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  0 PPM is a quality commitment and operating target. It is achieved through disciplined
                  systems, not by claim alone. PMEW works to prevent defects at every manufacturing stage
                  and continuously improves processes to reduce variation and customer rejection.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What industries does PMEW serve?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  PMEW supports automotive, aerospace, railway, construction, solar, renewable energy,
                  heavy engineering, agriculture, electrical, infrastructure, industrial equipment,
                  aftermarket and export markets.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What materials are used for fasteners?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Fasteners can be manufactured from carbon steel, alloy steel, stainless steel, mild steel,
                  brass and other customer-specified materials depending on strength, corrosion resistance,
                  conductivity, weight and application requirement.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What are property classes in fasteners?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Property classes define the mechanical strength of fasteners. Carbon steel and alloy steel
                  bolts commonly use classes such as 4.6, 5.8, 8.8, 10.9 and 12.9. The correct property class
                  depends on load, safety factor, joint design and application.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What is the difference between 8.8, 10.9 and 12.9 fasteners?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  These are different strength classes. In general, 10.9 is stronger than 8.8, and 12.9 is
                  stronger than 10.9. However, higher strength is not automatically better. The right selection
                  depends on application load, tightening method, coating, environment and mating components.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Can PMEW manufacture customized fasteners?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Yes. PMEW supports customized fasteners based on customer drawings, samples, specifications,
                  standards, materials, coatings, dimensions and application requirements.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What details are needed to develop a customized fastener?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Useful details include drawing or sample, material requirement, size, thread details, head style,
                  drive type, length, diameter, coating requirement, strength class, quantity, application details,
                  testing requirement, packaging requirement and applicable standard.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What is the difference between zinc plating and zinc flake coating?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Zinc plating is an electroplated coating commonly used for corrosion protection and appearance.
                  Zinc flake coating is a non-electrolytic coating system often used where higher corrosion resistance
                  and reduced hydrogen embrittlement risk are important.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What is hot dip galvanizing?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Hot dip galvanizing is a coating process where steel fasteners are coated with zinc by dipping them
                  into molten zinc. It is commonly used for outdoor, infrastructure, structural and heavy-duty corrosion
                  protection applications.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What is hydrogen embrittlement?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Hydrogen embrittlement is a risk where hydrogen enters high-strength steel and can make the fastener
                  brittle, leading to delayed cracking or failure. Proper material selection, process control, baking,
                  coating choice and testing help reduce this risk.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Why is heat treatment important?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Heat treatment improves mechanical properties such as hardness, tensile strength, toughness and
                  load-bearing capacity. Incorrect heat treatment can cause low strength, excessive brittleness,
                  distortion, cracking or inconsistent performance.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Why is thread quality important?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Thread quality affects fitment, tightening, load distribution, torque performance and assembly
                  reliability. Poor thread quality can cause jamming, stripping, loosening or improper clamping.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What is the difference between rolled thread and cut thread?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Rolled threads are formed by pressing the material into shape without removing material. Cut threads
                  are made by removing material. Rolled threads are generally preferred for high-volume fasteners because
                  they offer better strength, surface finish and fatigue performance.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What is salt spray testing?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Salt spray testing is a laboratory corrosion test used to evaluate coating resistance in a controlled
                  salt mist environment. It helps compare coating performance, but real-world corrosion life also depends
                  on installation, environment, handling and design exposure.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What is coating thickness?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Coating thickness is the measured thickness of surface coating on the fastener. It affects corrosion
                  resistance, thread fit, appearance and assembly performance. Excessive coating can create thread fitment
                  issues, while insufficient coating may reduce corrosion protection.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Why is batch traceability important?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Batch traceability helps track the product from raw material to dispatch. It allows PMEW and customers
                  to identify material source, process route, heat treatment, coating, inspection and dispatch details
                  for a particular lot.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Can PMEW provide inspection reports?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Yes. PMEW can provide inspection reports, material test certificates, coating reports, heat treatment
                  reports, dimensional reports and customer-specific documentation where required.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Can fasteners be supplied with special packaging?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Yes. Packaging can be customized based on customer requirement, export needs, part identification,
                  barcode labeling, batch number, quantity per box, corrosion protection and assembly-line handling.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Which coating should I choose for my fastener?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  The coating depends on corrosion requirement, indoor or outdoor use, strength class, material,
                  assembly torque, friction requirement, temperature, chemical exposure, industry standard, cost target
                  and customer specification.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Do all fasteners require testing?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Testing depends on product type, customer requirement, application criticality and applicable standard.
                  Critical fasteners may require dimensional inspection, hardness testing, tensile testing, proof load
                  testing, coating thickness measurement, salt spray testing and other checks.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What are standard fasteners?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Standard fasteners are manufactured according to recognized standards such as ISO, DIN, IS, ASTM,
                  ASME, EN, BS, JIS and others. These standards define dimensions, mechanical properties, tolerances,
                  materials and testing requirements.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                What are special fasteners?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Special fasteners are customized products that may not be available as standard catalogue items.
                  They are manufactured based on customer drawings, application requirements, unique geometry, material,
                  coating or performance needs.
                </div>
              </div>
            </div>

            <div class="pmew-tech-faq-item">
              <button class="pmew-tech-faq-question" type="button">
                Why should customers choose PMEW?
                <i class="fa-solid fa-plus"></i>
              </button>
              <div class="pmew-tech-faq-answer">
                <div class="pmew-tech-faq-answer-inner">
                  Customers choose PMEW for wide product capability, manufacturing experience, customized development,
                  quality control, traceability, coating options, testing support, documentation and long-term supply
                  reliability.
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="pmew-tech-cta">
      <div class="pmew-tech-container">
        <div class="pmew-tech-cta-box">
          <div>
            <h2>Need technical support for fastener selection or development?</h2>
            <p>
              Share your drawing, sample, application details, coating requirement or quality documentation need.
              PMEW can support standard, customized and application-specific fastener requirements.
            </p>
          </div>

          <div class="pmew-tech-cta-actions">
            <a href="/contact.html" class="pmew-tech-btn">
              Contact PMEW
              <i class="fa-solid fa-arrow-right"></i>
            </a>
            <a href="/products.html" class="pmew-tech-btn">
              View Products
              <i class="fa-solid fa-boxes-stacked"></i>
            </a>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER -->
  <div id="footer-container"></div>

  <!-- GLOBAL SCRIPTS -->
  <script src="/js/script.js"></script>

  <script>
    document.addEventListener("DOMContentLoaded", function () {
      const faqItems = document.querySelectorAll(".pmew-tech-faq-item");

      faqItems.forEach((item) => {
        const button = item.querySelector(".pmew-tech-faq-question");

        button.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");

          faqItems.forEach((faq) => {
            faq.classList.remove("is-open");
          });

          if (!isOpen) {
            item.classList.add("is-open");
          }
        });
      });

      const tabButtons = document.querySelectorAll(".pmew-tech-tab-btn");
      const tabPanels = document.querySelectorAll(".pmew-tech-tab-panel");

      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const target = button.getAttribute("data-tab");

          tabButtons.forEach((btn) => btn.classList.remove("is-active"));
          tabPanels.forEach((panel) => panel.classList.remove("is-active"));

          button.classList.add("is-active");

          const activePanel = document.querySelector("#tab-" + target);
          if (activePanel) {
            activePanel.classList.add("is-active");
          }
        });
      });

      const navLinks = document.querySelectorAll(".pmew-tech-subnav a");
      const sections = document.querySelectorAll("#overview, #zero-ppm, #core-competencies, #myths-facts, #faqs");

      const updateActiveLink = () => {
        let currentSection = "";

        sections.forEach((section) => {
          const sectionTop = section.offsetTop - 150;
          const sectionHeight = section.offsetHeight;

          if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute("id");
          }
        });

        navLinks.forEach((link) => {
          link.classList.remove("is-active");
          if (link.getAttribute("href") === "#" + currentSection) {
            link.classList.add("is-active");
          }
        });
      };

      window.addEventListener("scroll", updateActiveLink);
      updateActiveLink();
    });
  </script>

</body>
</html>