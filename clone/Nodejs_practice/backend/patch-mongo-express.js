#!/usr/bin/env node
/**
 * Patch script for Mongo Express:
 * 1. Enables manual column resizing with cursor for all collections.
 * 2. Adds "Reset Column Width" button.
 * 3. Adds Light and Dark mode toggle button in the navbar with full persistence.
 */

const fs = require('fs');
const path = require('path');

const npxBase = path.join(process.env.HOME || '/home/cdot', '.npm', '_npx');
let mongoExpressDirs = [];

if (fs.existsSync(npxBase)) {
  const dirs = fs.readdirSync(npxBase);
  dirs.forEach(d => {
    const candidate = path.join(npxBase, d, 'node_modules', 'mongo-express');
    if (fs.existsSync(candidate)) {
      mongoExpressDirs.push(candidate);
    }
  });
}

console.log(`Found ${mongoExpressDirs.length} mongo-express directories.`);

// ==========================================
// 1. Dark Mode Styles & Scripts for layout.html
// ==========================================

const earlyThemeScript = `
  <script type="text/javascript">
    (function() {
      try {
        var savedTheme = localStorage.getItem('mongo_express_theme');
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
          document.documentElement.classList.add('dark-theme');
        }
      } catch (e) {}
    })();
  </script>`;

const darkModeStyles = `
  /* ========================================================= */
  /* Mongo Express - Sleek Dark Mode Theme & Navbar Toggle UI  */
  /* ========================================================= */
  
  /* --- Smooth Dark Theme Scrollbars --- */
  html.dark-theme ::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }
  html.dark-theme ::-webkit-scrollbar-track {
    background: #0b1120;
  }
  html.dark-theme ::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
    border: 2px solid #0b1120;
  }
  html.dark-theme ::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
  html.dark-theme * {
    scrollbar-color: #334155 #0b1120;
    scrollbar-width: thin;
  }

  /* --- Navbar Theme Toggle Button --- */
  .navbar-theme-toggle-item {
    display: flex !important;
    align-items: center;
    height: 50px;
    padding: 0 15px;
  }

  .theme-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 20px;
    padding: 4px 11px 4px 5px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: #334155;
    outline: none !important;
    transition: all 0.2s ease;
    user-select: none;
    line-height: 1.2;
  }

  .theme-toggle-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
    border-color: #94a3b8;
  }

  .theme-toggle-track {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    transition: all 0.2s ease;
  }

  .theme-toggle-icon {
    font-size: 12px;
    line-height: 1;
  }

  .theme-toggle-icon.icon-sun {
    display: inline-block;
  }

  .theme-toggle-icon.icon-moon {
    display: none;
  }

  .theme-toggle-label {
    font-size: 12px;
    font-weight: 600;
  }

  /* ========================================================= */
  /* --- Dark Theme Activated Styles --- */
  /* ========================================================= */
  html.dark-theme,
  html.dark-theme body {
    background-color: #0b1120 !important;
    background: #0b1120 !important;
    color: #ffffff !important;
  }

  /* --- Strip ALL Bootstrap Gradients & Filters That Cause White Blocks --- */
  html.dark-theme,
  html.dark-theme body,
  html.dark-theme .navbar,
  html.dark-theme .navbar-default,
  html.dark-theme .navbar-collapse,
  html.dark-theme .navbar-header,
  html.dark-theme .well,
  html.dark-theme form.well,
  html.dark-theme .tab-content,
  html.dark-theme .tab-pane,
  html.dark-theme .panel,
  html.dark-theme .panel-default,
  html.dark-theme .panel-heading,
  html.dark-theme .panel-body,
  html.dark-theme .panel-footer,
  html.dark-theme .btn,
  html.dark-theme .btn-default,
  html.dark-theme .btn-primary,
  html.dark-theme .btn-success,
  html.dark-theme .btn-info,
  html.dark-theme .btn-warning,
  html.dark-theme .btn-danger,
  html.dark-theme .dropdown-menu,
  html.dark-theme .dropdown-menu > li > a,
  html.dark-theme .modal,
  html.dark-theme .modal-dialog,
  html.dark-theme .modal-content,
  html.dark-theme .modal-header,
  html.dark-theme .modal-body,
  html.dark-theme .modal-footer,
  html.dark-theme .popover,
  html.dark-theme .popover-title,
  html.dark-theme .popover-content,
  html.dark-theme .thumbnail,
  html.dark-theme .jumbotron,
  html.dark-theme .progress,
  html.dark-theme .progress-bar,
  html.dark-theme .alert,
  html.dark-theme .table,
  html.dark-theme table,
  html.dark-theme thead,
  html.dark-theme tbody,
  html.dark-theme tfoot,
  html.dark-theme tr,
  html.dark-theme th,
  html.dark-theme td,
  html.dark-theme .pagination > li > a,
  html.dark-theme .pagination > li > span,
  html.dark-theme .pager > li > a,
  html.dark-theme .pager > li > span,
  html.dark-theme .nav-tabs > li > a,
  html.dark-theme .nav-pills > li > a,
  html.dark-theme input,
  html.dark-theme textarea,
  html.dark-theme select,
  html.dark-theme .form-control,
  html.dark-theme .input-group-addon,
  html.dark-theme .input-group-btn,
  html.dark-theme #btnResetColSizes {
    background-image: none !important;
    filter: none !important;
  }

  /* --- Pure White Typography For Maximum Readability --- */
  html.dark-theme,
  html.dark-theme body,
  html.dark-theme h1,
  html.dark-theme h2,
  html.dark-theme h3,
  html.dark-theme h4,
  html.dark-theme h5,
  html.dark-theme h6,
  html.dark-theme p,
  html.dark-theme span,
  html.dark-theme div,
  html.dark-theme td,
  html.dark-theme th,
  html.dark-theme li,
  html.dark-theme label,
  html.dark-theme input,
  html.dark-theme textarea,
  html.dark-theme select,
  html.dark-theme button,
  html.dark-theme b,
  html.dark-theme strong,
  html.dark-theme .tableContent,
  html.dark-theme .col-title-text,
  html.dark-theme .main-title > h1,
  html.dark-theme #pageTitle,
  html.dark-theme .navbar-brand,
  html.dark-theme .navbar-nav > li > a,
  html.dark-theme .dropdown-menu > li > a,
  html.dark-theme .modal-title,
  html.dark-theme .input-group-addon {
    color: #ffffff !important;
  }

  /* Secondary / Muted Text - Clearly Legible Light Gray */
  html.dark-theme .text-muted,
  html.dark-theme small,
  html.dark-theme .help-block {
    color: #e2e8f0 !important;
  }

  /* Links */
  html.dark-theme a {
    color: #ffffff !important;
    text-decoration: underline;
    transition: color 0.15s ease;
  }

  html.dark-theme a:hover,
  html.dark-theme a:focus {
    color: #93c5fd !important;
  }

  html.dark-theme a.btn,
  html.dark-theme .btn,
  html.dark-theme .navbar-brand,
  html.dark-theme .navbar-default .navbar-nav > li > a,
  html.dark-theme .dropdown-menu > li > a,
  html.dark-theme .pagination > li > a,
  html.dark-theme .nav-tabs > li > a,
  html.dark-theme .nav-pills > li > a,
  html.dark-theme .sorting-button {
    text-decoration: none !important;
    color: #ffffff !important;
  }

  /* Headings with links (Databases, Collections list) */
  html.dark-theme h1 a,
  html.dark-theme h2 a,
  html.dark-theme h3 a,
  html.dark-theme h4 a,
  html.dark-theme h5 a,
  html.dark-theme h6 a {
    color: #ffffff !important;
    text-decoration: underline;
  }

  html.dark-theme h1 a:hover,
  html.dark-theme h2 a:hover,
  html.dark-theme h3 a:hover,
  html.dark-theme h4 a:hover {
    color: #93c5fd !important;
  }

  /* Navbar */
  html.dark-theme .navbar-default {
    background-color: #111a28 !important;
    background: #111a28 !important;
    border-color: #1e293b !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45) !important;
  }

  html.dark-theme .navbar-default .navbar-brand {
    color: #ffffff !important;
    text-shadow: none !important;
    font-weight: 600;
  }

  html.dark-theme .navbar-default .navbar-brand:hover {
    color: #93c5fd !important;
  }

  /* Navbar Links & Dropdowns */
  html.dark-theme .navbar-default .navbar-nav > li > a {
    color: #ffffff !important;
    text-shadow: none !important;
    background-image: none !important;
    border-radius: 4px;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  html.dark-theme .navbar-default .navbar-nav > li > a:hover,
  html.dark-theme .navbar-default .navbar-nav > li > a:focus,
  html.dark-theme .navbar-default .navbar-nav > .active > a,
  html.dark-theme .navbar-default .navbar-nav > .active > a:hover,
  html.dark-theme .navbar-default .navbar-nav > .active > a:focus,
  html.dark-theme .navbar-default .navbar-nav > .open > a,
  html.dark-theme .navbar-default .navbar-nav > .open > a:hover,
  html.dark-theme .navbar-default .navbar-nav > .open > a:focus,
  html.dark-theme .navbar-default .navbar-nav > li.dropdown.open > a,
  html.dark-theme .navbar-default .navbar-nav > li.dropdown.open > a:hover,
  html.dark-theme .navbar-default .navbar-nav > li.dropdown.open > a:focus,
  html.dark-theme .navbar-nav > .open > a,
  html.dark-theme .navbar-nav > .open > a:hover,
  html.dark-theme .navbar-nav > .open > a:focus,
  html.dark-theme .dropdown.open > a,
  html.dark-theme .dropdown.open > a:hover,
  html.dark-theme .dropdown.open > a:focus {
    color: #ffffff !important;
    background-color: #1e2e48 !important;
    background: #1e2e48 !important;
    background-image: none !important;
    filter: none !important;
    box-shadow: none !important;
  }

  /* Dropdown caret arrow */
  html.dark-theme .navbar-nav .caret,
  html.dark-theme .navbar-nav > .open > a .caret,
  html.dark-theme .navbar-nav > .open > a:hover .caret,
  html.dark-theme .navbar-nav > .open > a:focus .caret,
  html.dark-theme .caret {
    border-top-color: #ffffff !important;
    border-bottom-color: #ffffff !important;
  }

  html.dark-theme .navbar-nav .glyphicon-chevron-right {
    color: #cbd5e1 !important;
  }

  /* Navbar Theme Toggle Button */
  html.dark-theme .theme-toggle-btn {
    background: #162234 !important;
    border-color: #28394f !important;
    color: #ffffff !important;
  }

  html.dark-theme .theme-toggle-btn:hover {
    background: #1e293b !important;
    border-color: #38bdf8 !important;
    color: #ffffff !important;
  }

  html.dark-theme .theme-toggle-track {
    background: #080d1a !important;
    border: 1px solid #28394f !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }

  html.dark-theme .theme-toggle-icon.icon-sun {
    display: none;
  }

  html.dark-theme .theme-toggle-icon.icon-moon {
    display: inline-block;
  }

  html.dark-theme .theme-toggle-label {
    color: #ffffff !important;
  }

  /* Dropdown Menus */
  html.dark-theme .dropdown-menu {
    background-color: #111a28 !important;
    background: #111a28 !important;
    background-image: none !important;
    filter: none !important;
    border: 1px solid #28394f !important;
    box-shadow: 0 10px 28px rgba(0,0,0,0.7) !important;
    border-radius: 6px !important;
    padding: 6px 0 !important;
    margin-top: 2px !important;
  }

  html.dark-theme .dropdown-menu > li > a {
    color: #ffffff !important;
    background-color: transparent !important;
    background: transparent !important;
    background-image: none !important;
    filter: none !important;
    padding: 8px 18px !important;
    font-size: 13px !important;
    line-height: 1.4 !important;
    transition: background-color 0.15s ease, color 0.15s ease !important;
  }

  html.dark-theme .dropdown-menu > li > a:hover,
  html.dark-theme .dropdown-menu > li > a:focus {
    background-color: #1e293b !important;
    background: #1e293b !important;
    background-image: none !important;
    filter: none !important;
    color: #ffffff !important;
  }

  html.dark-theme .dropdown-menu > .active > a,
  html.dark-theme .dropdown-menu > .active > a:hover,
  html.dark-theme .dropdown-menu > .active > a:focus {
    background-color: #142848 !important;
    background: #142848 !important;
    background-image: none !important;
    filter: none !important;
    color: #ffffff !important;
  }

  html.dark-theme .dropdown-menu .divider {
    background-color: #1e293b !important;
    margin: 6px 0 !important;
  }

  /* Responsive Dropdown Menus (Mobile / Narrow View) */
  @media (max-width: 767px) {
    html.dark-theme .navbar-default .navbar-nav .open .dropdown-menu {
      background-color: #111a28 !important;
      background: #111a28 !important;
      border: 1px solid #28394f !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
    }
    html.dark-theme .navbar-default .navbar-nav .open .dropdown-menu > li > a {
      color: #ffffff !important;
      background: transparent !important;
    }
    html.dark-theme .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover,
    html.dark-theme .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus {
      background-color: #1e293b !important;
      background: #1e293b !important;
      color: #ffffff !important;
    }
  }

  /* Page Headers */
  html.dark-theme .page-header {
    border-bottom: 1px solid #1e293b !important;
  }

  /* ========================================================= */
  /* COMPLETE REMOVAL OF ALL WHITE BLOCKS (PANELS, WELLS, MODALS)*/
  /* ========================================================= */
  html.dark-theme .container,
  html.dark-theme .container-fluid,
  html.dark-theme .row,
  html.dark-theme div[class*="col-"] {
    background-color: transparent !important;
    background: transparent !important;
  }

  /* Panels, Wells, Thumbnails, Jumbotrons - All made dark slate */
  html.dark-theme .panel,
  html.dark-theme .panel-default,
  html.dark-theme .panel-body,
  html.dark-theme .panel-footer,
  html.dark-theme .well,
  html.dark-theme form.well,
  html.dark-theme .tab-content,
  html.dark-theme .tab-pane,
  html.dark-theme .jumbotron,
  html.dark-theme .list-group,
  html.dark-theme .list-group-item,
  html.dark-theme .thumbnail {
    background-color: #111a28 !important;
    background: #111a28 !important;
    border-color: #1e293b !important;
    color: #ffffff !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25) !important;
    border-radius: 6px !important;
  }

  html.dark-theme .panel-default > .panel-heading,
  html.dark-theme .panel-heading {
    background-color: #162234 !important;
    background: #162234 !important;
    border-bottom: 1px solid #1e293b !important;
    color: #ffffff !important;
    font-weight: 600;
  }

  html.dark-theme .panel-footer {
    background-color: #162234 !important;
    background: #162234 !important;
    border-top: 1px solid #1e293b !important;
    color: #ffffff !important;
  }

  /* Tables & Nested Tables - Entirely Dark */
  html.dark-theme table,
  html.dark-theme .table,
  html.dark-theme .table .table,
  html.dark-theme .table td,
  html.dark-theme .table th,
  html.dark-theme .table-bordered,
  html.dark-theme .table-responsive,
  html.dark-theme .tableWrapper,
  html.dark-theme .tableWrapper table,
  html.dark-theme .tableWrapper table td,
  html.dark-theme .tableWrapper table th {
    background-color: #0b1120 !important;
    background: #0b1120 !important;
    border-color: #1e293b !important;
    color: #ffffff !important;
  }

  html.dark-theme .table > thead > tr > th,
  html.dark-theme .tableWrapper table th,
  html.dark-theme th {
    background-color: #141f33 !important;
    background: #141f33 !important;
    color: #ffffff !important;
    border-bottom: 2px solid #28394f !important;
    border-top: 1px solid #1e293b !important;
    font-weight: 600;
  }

  html.dark-theme .table > tbody > tr > td {
    border-top: 1px solid #1e293b !important;
    border-bottom: 1px solid #1e293b !important;
    color: #ffffff !important;
  }

  /* Alternating Zebra Rows */
  html.dark-theme .table-striped > tbody > tr:nth-of-type(odd),
  html.dark-theme .table-striped > tbody > tr:nth-of-type(odd) > td,
  html.dark-theme .table-striped > tbody > tr:nth-of-type(odd) > th {
    background-color: #111a2a !important;
    background: #111a2a !important;
  }

  html.dark-theme .table-striped > tbody > tr:nth-of-type(even),
  html.dark-theme .table-striped > tbody > tr:nth-of-type(even) > td,
  html.dark-theme .table-striped > tbody > tr:nth-of-type(even) > th {
    background-color: #0b1120 !important;
    background: #0b1120 !important;
  }

  html.dark-theme .table-striped > tbody > tr:hover,
  html.dark-theme .table-striped > tbody > tr:hover > td,
  html.dark-theme .table-striped > tbody > tr:hover > th {
    background-color: #1a273d !important;
    background: #1a273d !important;
    cursor: pointer;
  }

  html.dark-theme .tableHeaderFooterBars {
    border-top: 1px solid #28394f !important;
    border-bottom: 1px solid #28394f !important;
  }

  html.dark-theme .sorting-button .glyphicon-triangle-top,
  html.dark-theme .sorting-button .glyphicon-triangle-bottom {
    color: #ffffff !important;
  }

  /* Completely Eliminate White Fade Overlay */
  html.dark-theme #fadeToWhiteID,
  html.dark-theme .fadeToWhite {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    opacity: 0 !important;
    background: transparent !important;
    pointer-events: none !important;
  }

  /* Document list item hover */
  html.dark-theme .documentlist:hover,
  html.dark-theme .tooDamnBig {
    background-color: #131d2e !important;
    background: #131d2e !important;
    color: #ffffff !important;
  }

  /* ========================================================= */
  /* FORM INPUTS & TEXTAREAS - NO WHITE BLOCKS                 */
  /* ========================================================= */
  html.dark-theme .form-control,
  html.dark-theme input[type="text"],
  html.dark-theme input[type="password"],
  html.dark-theme input[type="search"],
  html.dark-theme input[type="file"],
  html.dark-theme input[type="email"],
  html.dark-theme input[type="number"],
  html.dark-theme input,
  html.dark-theme textarea,
  html.dark-theme select {
    background-color: #080d1a !important;
    background: #080d1a !important;
    border: 1px solid #28394f !important;
    color: #ffffff !important;
    border-radius: 4px;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.3) !important;
  }

  html.dark-theme .form-control:focus,
  html.dark-theme input:focus,
  html.dark-theme textarea:focus,
  html.dark-theme select:focus {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25), inset 0 1px 2px rgba(0,0,0,0.3) !important;
    color: #ffffff !important;
  }

  html.dark-theme #key,
  html.dark-theme #value,
  html.dark-theme input#key,
  html.dark-theme input#value,
  html.dark-theme #key::placeholder,
  html.dark-theme #value::placeholder,
  html.dark-theme input#key::placeholder,
  html.dark-theme input#value::placeholder,
  html.dark-theme .form-control::placeholder,
  html.dark-theme input::placeholder,
  html.dark-theme textarea::placeholder {
    color: #ffffff !important;
    opacity: 1 !important;
  }

  html.dark-theme select.form-control option {
    background-color: #111a28 !important;
    background: #111a28 !important;
    color: #ffffff !important;
  }

  html.dark-theme .input-group-addon {
    background-color: #162234 !important;
    background: #162234 !important;
    border: 1px solid #28394f !important;
    color: #ffffff !important;
  }

  /* Disabled inputs and disabled buttons - Prevent white blocks */
  html.dark-theme .form-control[disabled],
  html.dark-theme .form-control[readonly],
  html.dark-theme fieldset[disabled] .form-control,
  html.dark-theme input[disabled],
  html.dark-theme textarea[disabled],
  html.dark-theme select[disabled],
  html.dark-theme .btn.disabled,
  html.dark-theme .btn[disabled],
  html.dark-theme fieldset[disabled] .btn,
  html.dark-theme .btn-default.disabled,
  html.dark-theme .btn-default[disabled],
  html.dark-theme #btnResetColSizes.disabled,
  html.dark-theme #btnResetColSizes[disabled] {
    background-color: #0d1524 !important;
    background: #0d1524 !important;
    border-color: #1e293b !important;
    color: #64748b !important;
    box-shadow: none !important;
  }

  /* ========================================================= */
  /* BUTTONS - DARK TONED WITH CRISP WHITE WRITING             */
  /* ========================================================= */
  html.dark-theme .btn {
    background-image: none !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
    text-shadow: none !important;
    transition: all 0.15s ease !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn * {
    color: #ffffff !important;
  }

  /* Default / Neutral Buttons */
  html.dark-theme .btn-default {
    background-color: #131d2e !important;
    background: #131d2e !important;
    border: 1px solid #223249 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-default:hover,
  html.dark-theme .btn-default:focus {
    background-color: #1e293b !important;
    background: #1e293b !important;
    border-color: #334155 !important;
    color: #ffffff !important;
  }

  /* Primary Button (Dark Sapphire Blue - Create DB, Create Coll, Submit) */
  html.dark-theme .btn-primary {
    background-color: #0f1f38 !important;
    background: #0f1f38 !important;
    border: 1px solid #1d4ed8 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-primary:hover,
  html.dark-theme .btn-primary:focus {
    background-color: #172e54 !important;
    background: #172e54 !important;
    border-color: #3b82f6 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-primary:active {
    background-color: #0a1526 !important;
    background: #0a1526 !important;
  }

  /* Success Button (Dark Forest Green - View, New Document, Add Index) */
  html.dark-theme .btn-success {
    background-color: #0d281e !important;
    background: #0d281e !important;
    border: 1px solid #165b3c !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-success:hover,
  html.dark-theme .btn-success:focus {
    background-color: #133c2d !important;
    background: #133c2d !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-success:active {
    background-color: #091d16 !important;
    background: #091d16 !important;
  }

  /* Info Button (Dark Cyan / Petrol) */
  html.dark-theme .btn-info {
    background-color: #092030 !important;
    background: #092030 !important;
    border: 1px solid #0369a1 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-info:hover,
  html.dark-theme .btn-info:focus {
    background-color: #0f3047 !important;
    background: #0f3047 !important;
    border-color: #0ea5e9 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-info:active {
    background-color: #061622 !important;
    background: #061622 !important;
  }

  /* Warning Button (Dark Roasted Amber - Export, [JSON], Import, ReIndex) */
  html.dark-theme .btn-warning {
    background-color: #2a1b08 !important;
    background: #2a1b08 !important;
    border: 1px solid #5a380e !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-warning:hover,
  html.dark-theme .btn-warning:focus {
    background-color: #3d270c !important;
    background: #3d270c !important;
    border-color: #f59e0b !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-warning:active {
    background-color: #1f1406 !important;
    background: #1f1406 !important;
  }

  /* Danger Button (Dark Wine / Crimson - Del, Drop, Compact, Trash) */
  html.dark-theme .btn-danger {
    background-color: #2a0c10 !important;
    background: #2a0c10 !important;
    border: 1px solid #5c1822 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-danger:hover,
  html.dark-theme .btn-danger:focus {
    background-color: #3d1218 !important;
    background: #3d1218 !important;
    border-color: #ef4444 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-danger:active {
    background-color: #1e090c !important;
    background: #1e090c !important;
  }

  /* Modal Close / Error Button */
  html.dark-theme .btn-error {
    background-color: #131d2e !important;
    background: #131d2e !important;
    border: 1px solid #223249 !important;
    color: #ffffff !important;
  }

  html.dark-theme .btn-error:hover,
  html.dark-theme .btn-error:focus {
    background-color: #1e293b !important;
    background: #1e293b !important;
    border-color: #334155 !important;
    color: #ffffff !important;
  }

  /* Pagination & Pager */
  html.dark-theme .pagination > li > a,
  html.dark-theme .pagination > li > span,
  html.dark-theme .pager > li > a,
  html.dark-theme .pager > li > span {
    background-color: #111a28 !important;
    background: #111a28 !important;
    border-color: #1e293b !important;
    color: #ffffff !important;
  }

  html.dark-theme .pagination > li > a:hover,
  html.dark-theme .pagination > li > span:hover,
  html.dark-theme .pager > li > a:hover,
  html.dark-theme .pager > li > span:hover {
    background-color: #1c2b42 !important;
    background: #1c2b42 !important;
    border-color: #28394f !important;
    color: #ffffff !important;
  }

  html.dark-theme .pagination > .active > a,
  html.dark-theme .pagination > .active > span {
    background-color: #12233f !important;
    background: #12233f !important;
    border-color: #1d4ed8 !important;
    color: #ffffff !important;
  }

  html.dark-theme .pagination > .disabled > a,
  html.dark-theme .pagination > .disabled > span,
  html.dark-theme .pager > .disabled > a,
  html.dark-theme .pager > .disabled > span {
    background-color: #080d1a !important;
    background: #080d1a !important;
    border-color: #1e293b !important;
    color: #475569 !important;
  }

  /* Nav Pills & Tabs (Simple / Advanced Query Selector) */
  html.dark-theme .nav-tabs,
  html.dark-theme .nav-pills {
    border-color: #1e293b !important;
  }

  html.dark-theme .nav-pills > li > a,
  html.dark-theme .nav-tabs > li > a {
    background-color: #0e1726 !important;
    background: #0e1726 !important;
    border: 1px solid #1e293b !important;
    color: #ffffff !important;
    font-weight: 500;
  }

  html.dark-theme .nav-pills > li > a:hover,
  html.dark-theme .nav-tabs > li > a:hover {
    background-color: #162438 !important;
    background: #162438 !important;
    border-color: #28394f !important;
    color: #ffffff !important;
  }

  html.dark-theme .nav-pills > li.active > a,
  html.dark-theme .nav-pills > li.active > a:hover,
  html.dark-theme .nav-pills > li.active > a:focus,
  html.dark-theme .nav-tabs > li.active > a,
  html.dark-theme .nav-tabs > li.active > a:hover,
  html.dark-theme .nav-tabs > li.active > a:focus {
    background-color: #12233f !important;
    background: #12233f !important;
    border-color: #1d4ed8 !important;
    color: #ffffff !important;
    box-shadow: none !important;
  }

  /* Modals */
  html.dark-theme .modal-content,
  html.dark-theme .modal-body,
  html.dark-theme .modal-header,
  html.dark-theme .modal-footer {
    background-color: #111a28 !important;
    background: #111a28 !important;
    border: 1px solid #28394f !important;
    color: #ffffff !important;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7) !important;
  }

  html.dark-theme .modal-header {
    background-color: #162234 !important;
    background: #162234 !important;
    border-bottom: 1px solid #1e293b !important;
    border-top-left-radius: 7px !important;
    border-top-right-radius: 7px !important;
  }

  html.dark-theme .modal-footer {
    background-color: #162234 !important;
    background: #162234 !important;
    border-top: 1px solid #1e293b !important;
    border-bottom-left-radius: 7px !important;
    border-bottom-right-radius: 7px !important;
  }

  html.dark-theme .modal-header .close {
    color: #ffffff !important;
    opacity: 0.8;
    text-shadow: none;
    transition: opacity 0.15s ease;
  }

  html.dark-theme .modal-header .close:hover {
    color: #ffffff !important;
    opacity: 1;
  }

  /* Alerts - Dark Toned */
  html.dark-theme .alert {
    border-radius: 6px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    color: #ffffff !important;
  }

  html.dark-theme .alert-info {
    background-color: #071826 !important;
    background: #071826 !important;
    border: 1px solid #0a3350 !important;
    color: #ffffff !important;
  }

  html.dark-theme .alert-success {
    background-color: #081c15 !important;
    background: #081c15 !important;
    border: 1px solid #0e442d !important;
    color: #ffffff !important;
  }

  html.dark-theme .alert-warning {
    background-color: #1f1406 !important;
    background: #1f1406 !important;
    border: 1px solid #482907 !important;
    color: #ffffff !important;
  }

  html.dark-theme .alert-danger {
    background-color: #20080c !important;
    background: #20080c !important;
    border: 1px solid #4a1017 !important;
    color: #ffffff !important;
  }

  /* Badges & Labels - Dark Toned */
  html.dark-theme .badge {
    background-color: #162234 !important;
    background: #162234 !important;
    border: 1px solid #223249 !important;
    color: #ffffff !important;
    font-weight: 600;
  }

  html.dark-theme .label-default {
    background-color: #162234 !important;
    background: #162234 !important;
    border: 1px solid #223249 !important;
    color: #ffffff !important;
  }

  html.dark-theme .label-primary {
    background-color: #0f1f38 !important;
    background: #0f1f38 !important;
    border: 1px solid #1d4ed8 !important;
    color: #ffffff !important;
  }

  html.dark-theme .label-success {
    background-color: #0d281e !important;
    background: #0d281e !important;
    border: 1px solid #165b3c !important;
    color: #ffffff !important;
  }

  html.dark-theme .label-info {
    background-color: #092030 !important;
    background: #092030 !important;
    border: 1px solid #0369a1 !important;
    color: #ffffff !important;
  }

  html.dark-theme .label-warning {
    background-color: #2a1b08 !important;
    background: #2a1b08 !important;
    border: 1px solid #5a380e !important;
    color: #ffffff !important;
  }

  html.dark-theme .label-danger {
    background-color: #2a0c10 !important;
    background: #2a0c10 !important;
    border: 1px solid #5c1822 !important;
    color: #ffffff !important;
  }

  /* Tooltips & Popovers */
  html.dark-theme .tooltip-inner {
    background-color: #0f172a !important;
    background: #0f172a !important;
    color: #ffffff !important;
    border: 1px solid #334155 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
  }

  html.dark-theme .tooltip.top .tooltip-arrow { border-top-color: #334155 !important; }
  html.dark-theme .tooltip.bottom .tooltip-arrow { border-bottom-color: #334155 !important; }
  html.dark-theme .tooltip.left .tooltip-arrow { border-left-color: #334155 !important; }
  html.dark-theme .tooltip.right .tooltip-arrow { border-right-color: #334155 !important; }

  /* Code & Pre */
  html.dark-theme pre,
  html.dark-theme code {
    background-color: #080d1a !important;
    background: #080d1a !important;
    color: #ffffff !important;
    border: 1px solid #1e293b !important;
  }

  /* ========================================================= */
  /* CodeMirror JSON Editor - Subdued Dark Syntax Highlighting */
  /* ========================================================= */
  html.dark-theme .CodeMirror,
  html.dark-theme .CodeMirror-scroll,
  html.dark-theme .CodeMirror-sizer,
  html.dark-theme .cm-s-default.CodeMirror,
  html.dark-theme .cm-s-rubyblue.CodeMirror {
    background-color: #080d1a !important;
    background: #080d1a !important;
    color: #ffffff !important;
    border: 1px solid #28394f !important;
    border-radius: 4px;
    font-size: 13px !important;
    line-height: 1.5 !important;
  }

  html.dark-theme .CodeMirror pre,
  html.dark-theme .CodeMirror-line {
    color: #ffffff !important;
    background: transparent !important;
  }

  html.dark-theme .CodeMirror-gutters {
    background-color: #0d1527 !important;
    background: #0d1527 !important;
    border-right: 1px solid #1e293b !important;
  }

  html.dark-theme .CodeMirror-linenumber {
    color: #94a3b8 !important;
  }

  html.dark-theme .CodeMirror-cursor {
    border-left: 2px solid #60a5fa !important;
  }

  html.dark-theme .CodeMirror-selected,
  html.dark-theme .CodeMirror-focused .CodeMirror-selected {
    background: #182b46 !important;
  }

  /* --- CodeMirror JSON Editor - Bright White Keys and Values --- */
  html.dark-theme .CodeMirror,
  html.dark-theme .CodeMirror span,
  html.dark-theme .CodeMirror pre,
  html.dark-theme .CodeMirror-line,
  html.dark-theme .CodeMirror-line span,
  html.dark-theme .CodeMirror .cm-property,
  html.dark-theme .CodeMirror span.cm-property,
  html.dark-theme .CodeMirror .cm-string,
  html.dark-theme .CodeMirror span.cm-string,
  html.dark-theme .CodeMirror .cm-string-2,
  html.dark-theme .CodeMirror span.cm-string-2,
  html.dark-theme .CodeMirror .cm-number,
  html.dark-theme .CodeMirror span.cm-number,
  html.dark-theme .CodeMirror .cm-atom,
  html.dark-theme .CodeMirror span.cm-atom,
  html.dark-theme .CodeMirror .cm-keyword,
  html.dark-theme .CodeMirror span.cm-keyword,
  html.dark-theme .CodeMirror .cm-variable,
  html.dark-theme .CodeMirror span.cm-variable,
  html.dark-theme .CodeMirror .cm-variable-2,
  html.dark-theme .CodeMirror span.cm-variable-2,
  html.dark-theme .CodeMirror .cm-variable-3,
  html.dark-theme .CodeMirror span.cm-variable-3,
  html.dark-theme .CodeMirror .cm-def,
  html.dark-theme .CodeMirror span.cm-def,
  html.dark-theme .CodeMirror .cm-attribute,
  html.dark-theme .CodeMirror span.cm-attribute,
  html.dark-theme .CodeMirror .cm-punctuation,
  html.dark-theme .CodeMirror span.cm-punctuation,
  html.dark-theme .CodeMirror .cm-bracket,
  html.dark-theme .CodeMirror span.cm-bracket,
  html.dark-theme .cm-s-default span,
  html.dark-theme .cm-s-default .cm-property,
  html.dark-theme .cm-s-default .cm-string,
  html.dark-theme .cm-s-default .cm-number,
  html.dark-theme .cm-s-default .cm-atom,
  html.dark-theme .cm-s-default .cm-keyword,
  html.dark-theme .cm-s-rubyblue span,
  html.dark-theme .cm-s-rubyblue span.cm-property,
  html.dark-theme .cm-s-rubyblue span.cm-string,
  html.dark-theme .cm-s-rubyblue span.cm-number,
  html.dark-theme .cm-s-rubyblue span.cm-atom,
  html.dark-theme .cm-s-rubyblue span.cm-keyword,
  html.dark-theme .cm-s-rubyblue span.cm-variable,
  html.dark-theme .cm-s-rubyblue span.cm-variable-2,
  html.dark-theme .cm-s-rubyblue span.cm-variable-3,
  html.dark-theme .cm-s-rubyblue span.cm-def,
  html.dark-theme .cm-s-rubyblue span.cm-attribute {
    color: #ffffff !important;
  }

  html.dark-theme .CodeMirror .cm-comment,
  html.dark-theme .CodeMirror span.cm-comment,
  html.dark-theme .cm-s-default .cm-comment,
  html.dark-theme .cm-s-rubyblue span.cm-comment {
    color: #cbd5e1 !important;
    font-style: italic;
  }

  /* Resizer Handles & Reset Button in Dark Mode */
  html.dark-theme .col-resizer-grip::after {
    background-color: #334155 !important;
  }

  html.dark-theme .col-resizer-grip:hover::after,
  html.dark-theme .col-resizer-grip.is-resizing::after {
    background-color: #3b82f6 !important;
  }

  html.dark-theme #btnResetColSizes {
    background-color: #131d2e !important;
    background: #131d2e !important;
    background-image: none !important;
    border: 1px solid #223249 !important;
    color: #ffffff !important;
  }

  html.dark-theme #btnResetColSizes:hover:not(.disabled):not(:disabled) {
    background-color: #1e293b !important;
    background: #1e293b !important;
    color: #ffffff !important;
    border-color: #38bdf8 !important;
  }

  html.dark-theme #btnResetColSizes .glyphicon {
    color: #ffffff !important;
  }
`;

const navbarToggleHtml = `
      <ul class="nav navbar-nav navbar-right">
        <li class="navbar-theme-toggle-item">
          <button type="button" id="theme-toggle-btn" class="theme-toggle-btn" title="Toggle Light / Dark Mode">
            <span class="theme-toggle-track">
              <span class="theme-toggle-icon icon-sun">☀️</span>
              <span class="theme-toggle-icon icon-moon">🌙</span>
            </span>
            <span class="theme-toggle-label" id="theme-toggle-label">Dark</span>
          </button>
        </li>
      </ul>`;

const layoutThemeScript = `
<script type="text/javascript">
(function () {
  function initTheme() {
    var $btn = $('#theme-toggle-btn');
    var $label = $('#theme-toggle-label');
    if (!$btn.length) return;

    function applyThemeUI(isDark) {
      if (isDark) {
        $('html').addClass('dark-theme');
        $label.text('Light');
        $btn.attr('title', 'Switch to Light Mode');
        try { localStorage.setItem('mongo_express_theme', 'dark'); } catch (e) {}
      } else {
        $('html').removeClass('dark-theme');
        $label.text('Dark');
        $btn.attr('title', 'Switch to Dark Mode');
        try { localStorage.setItem('mongo_express_theme', 'light'); } catch (e) {}
      }
    }

    var currentDark = $('html').hasClass('dark-theme');
    applyThemeUI(currentDark);

    $btn.on('click', function (e) {
      e.preventDefault();
      var nextDark = !$('html').hasClass('dark-theme');
      applyThemeUI(nextDark);
    });
  }

  if (window.jQuery) {
    $(initTheme);
  } else {
    document.addEventListener('DOMContentLoaded', initTheme);
  }
})();
</script>`;

// ==========================================
// 2. Column Resizer Styles & Scripts for collection.html
// ==========================================

const customStyles = `
  /* --- Interactive Column Resizing System --- */
  #btnResetColSizes {
    font-size: 12px;
    font-weight: 500;
    color: #334155;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 3px 10px;
    margin-bottom: 6px;
    transition: all 0.15s ease;
  }

  #btnResetColSizes:hover:not(.disabled):not(:disabled) {
    background: #e2e8f0;
    color: #0f172a;
    border-color: #94a3b8;
  }

  #btnResetColSizes .glyphicon {
    margin-right: 4px;
    color: #64748b;
  }

  html.dark-theme #btnResetColSizes,
  html.dark-theme #btnResetColSizes.disabled,
  html.dark-theme #btnResetColSizes[disabled] {
    background: #131d2e !important;
    background-color: #131d2e !important;
    background-image: none !important;
    border: 1px solid #223249 !important;
    color: #ffffff !important;
    box-shadow: none !important;
  }

  html.dark-theme #btnResetColSizes:hover:not(.disabled):not(:disabled) {
    background: #1e293b !important;
    background-color: #1e293b !important;
    border-color: #38bdf8 !important;
    color: #ffffff !important;
  }

  html.dark-theme #btnResetColSizes .glyphicon {
    color: #ffffff !important;
  }

  .tableHeaderFooterBars th.sorting-button {
    position: relative !important;
    user-select: none;
    -webkit-user-select: none;
    padding-right: 18px !important;
    box-sizing: border-box !important;
  }

  /* Interactive Resizer Grip */
  .col-resizer-grip {
    position: absolute;
    top: 0;
    right: 0;
    width: 12px;
    height: 100%;
    cursor: col-resize !important;
    z-index: 35;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .col-resizer-grip::after {
    content: '';
    position: absolute;
    top: 3px;
    bottom: 3px;
    right: 0;
    width: 2px;
    background-color: #cbd5e1;
    border-radius: 1px;
    transition: background-color 0.15s ease, width 0.15s ease;
  }

  .col-resizer-grip:hover::after,
  .col-resizer-grip.is-resizing::after {
    background-color: #2563eb;
    width: 4px;
  }

  body.is-col-resizing,
  body.is-col-resizing * {
    cursor: col-resize !important;
    user-select: none !important;
    -webkit-user-select: none !important;
  }

  /* Full-height vertical guideline during active dragging */
  .col-resize-guide-line {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #2563eb;
    z-index: 99999;
    pointer-events: none;
    display: none;
    box-shadow: 0 0 6px rgba(37, 99, 235, 0.65);
  }
`;

const resizerScript = `
<script type="text/javascript">
(function ($) {
  $(function () {
    var $table = $('.collection-table-{{ collectionName }}');
    if (!$table.length) return;

    var dbName = (window.ME_SETTINGS && window.ME_SETTINGS.dbName) || '{{ dbName }}';
    var collectionName = (window.ME_SETTINGS && window.ME_SETTINGS.collectionName) || '{{ collectionName }}';
    var storageKey = 'mongo_express_col_widths_' + encodeURIComponent(dbName) + '_' + encodeURIComponent(collectionName);
    var $styleTag = $('<style id="me-col-widths-dynamic"></style>').appendTo('head');
    var $resetBtn = $('#btnResetColSizes');

    var $guide = $('.col-resize-guide-line');
    if (!$guide.length) {
      $guide = $('<div class="col-resize-guide-line"></div>').appendTo('body');
    }

    var savedWidths = {};
    try {
      var raw = localStorage.getItem(storageKey);
      if (raw) savedWidths = JSON.parse(raw);
    } catch (e) {
      savedWidths = {};
    }

    function applyColumnWidths() {
      var cols = Object.keys(savedWidths);
      if (cols.length > 0) {
        var css = '';
        cols.forEach(function (c) {
          var w = savedWidths[c];
          if (w && w >= 35) {
            css += 'table.tableHeaderFooterBars th.col-' + c + ',\\n' +
                   'table.tableHeaderFooterBars td.col-' + c + ' {\\n' +
                   '  width: ' + w + 'px !important;\\n' +
                   '  min-width: ' + w + 'px !important;\\n' +
                   '  max-width: ' + w + 'px !important;\\n' +
                   '  box-sizing: border-box !important;\\n' +
                   '}\\n' +
                   'table.tableHeaderFooterBars td.col-' + c + ' .tableContent {\\n' +
                   '  max-width: 100% !important;\\n' +
                   '  overflow: hidden !important;\\n' +
                   '  text-overflow: ellipsis !important;\\n' +
                   '  word-break: break-word !important;\\n' +
                   '  overflow-wrap: anywhere !important;\\n' +
                   '  box-sizing: border-box !important;\\n' +
                   '}\\n';
          }
        });
        $styleTag.html(css);
        $table.addClass('has-custom-col-widths');
        $resetBtn.removeClass('disabled').prop('disabled', false).css('opacity', '1');
      } else {
        $styleTag.html('');
        $table.removeClass('has-custom-col-widths');
        $resetBtn.addClass('disabled').prop('disabled', true).css('opacity', '0.6');
      }

      // Check fadeToWhite indicator
      var $wrapper = $('.tableWrapper');
      if ($wrapper.length) {
        if ($('.tableHeaderFooterBars').width() <= $wrapper.width()) {
          $('#fadeToWhiteID').hide();
        } else {
          $('#fadeToWhiteID').show().height($wrapper.height());
        }
      }
    }

    // Apply any initial saved widths
    applyColumnWidths();

    // Reset button
    $resetBtn.on('click', function (e) {
      e.preventDefault();
      localStorage.removeItem(storageKey);
      savedWidths = {};
      applyColumnWidths();
    });

    // Suppress sort clicks during/after resize
    var suppressSortUntil = 0;
    $(document).on('click', '.sorting-button', function (e) {
      if (Date.now() < suppressSortUntil || $(e.target).closest('.col-resizer-grip').length) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    });

    var isDragging = false;
    var currentCol = null;
    var $currentTh = null;
    var startX = 0;
    var startWidth = 0;
    var lastWidth = 0;
    var thLeft = 0;

    $table.on('mousedown', '.col-resizer-grip', function (e) {
      if (e.which !== 1) return; // Only left-click

      e.preventDefault();
      e.stopPropagation();

      $currentTh = $(this).closest('th');
      currentCol = $currentTh.data('column') || $(this).data('column');
      if (!currentCol) return;

      startX = e.pageX;
      startWidth = $currentTh.outerWidth();
      lastWidth = startWidth;
      isDragging = true;
      suppressSortUntil = Date.now() + 500;

      var offset = $currentTh.offset();
      thLeft = offset.left;
      var guideX = thLeft + startWidth - $(window).scrollLeft();

      $('body').addClass('is-col-resizing');
      $(this).addClass('is-resizing');
      $guide.css({ left: guideX + 'px', display: 'block' });

      $(document).on('mousemove.colresizer', function (moveEvent) {
        if (!isDragging) return;
        moveEvent.preventDefault();

        var delta = moveEvent.pageX - startX;
        var newWidth = Math.max(40, Math.round(startWidth + delta));
        lastWidth = newWidth;

        var currentGuideX = thLeft + newWidth - $(window).scrollLeft();
        $guide.css('left', currentGuideX + 'px');

        // Real-time responsive live preview
        savedWidths[currentCol] = newWidth;
        applyColumnWidths();
      });

      $(document).on('mouseup.colresizer', function () {
        if (!isDragging) return;
        isDragging = false;
        suppressSortUntil = Date.now() + 500;

        $(document).off('mousemove.colresizer mouseup.colresizer');
        $('body').removeClass('is-col-resizing');
        $('.col-resizer-grip').removeClass('is-resizing');
        $guide.hide();

        if (lastWidth >= 40) {
          savedWidths[currentCol] = lastWidth;
          try {
            localStorage.setItem(storageKey, JSON.stringify(savedWidths));
          } catch (err) {}
          applyColumnWidths();
        }

        $currentTh = null;
        currentCol = null;
      });
    });

    // Double-click to auto-fit / reset single column
    $table.on('dblclick', '.col-resizer-grip', function (e) {
      e.preventDefault();
      e.stopPropagation();
      suppressSortUntil = Date.now() + 500;

      var col = $(this).closest('th').data('column') || $(this).data('column');
      if (col && savedWidths[col]) {
        delete savedWidths[col];
        try {
          localStorage.setItem(storageKey, JSON.stringify(savedWidths));
        } catch (err) {}
        applyColumnWidths();
      }
    });

    // Touch support for touchpads / mobile
    $table.on('touchstart', '.col-resizer-grip', function (e) {
      var touch = e.originalEvent.touches[0];
      if (!touch) return;
      e.preventDefault();
      e.stopPropagation();

      $currentTh = $(this).closest('th');
      currentCol = $currentTh.data('column') || $(this).data('column');
      startX = touch.pageX;
      startWidth = $currentTh.outerWidth();
      lastWidth = startWidth;
      isDragging = true;
      suppressSortUntil = Date.now() + 500;

      var offset = $currentTh.offset();
      thLeft = offset.left;
      var guideX = thLeft + startWidth - $(window).scrollLeft();

      $('body').addClass('is-col-resizing');
      $(this).addClass('is-resizing');
      $guide.css({ left: guideX + 'px', display: 'block' });

      $(document).on('touchmove.colresizer', function (tmEvent) {
        if (!isDragging) return;
        var t = tmEvent.originalEvent.touches[0];
        if (!t) return;
        var delta = t.pageX - startX;
        var newWidth = Math.max(40, Math.round(startWidth + delta));
        lastWidth = newWidth;
        var currentGuideX = thLeft + newWidth - $(window).scrollLeft();
        $guide.css('left', currentGuideX + 'px');
        savedWidths[currentCol] = newWidth;
        applyColumnWidths();
      });

      $(document).on('touchend.colresizer', function () {
        if (!isDragging) return;
        isDragging = false;
        suppressSortUntil = Date.now() + 500;
        $(document).off('touchmove.colresizer touchend.colresizer');
        $('body').removeClass('is-col-resizing');
        $('.col-resizer-grip').removeClass('is-resizing');
        $guide.hide();
        if (lastWidth >= 40) {
          savedWidths[currentCol] = lastWidth;
          try {
            localStorage.setItem(storageKey, JSON.stringify(savedWidths));
          } catch (err) {}
          applyColumnWidths();
        }
      });
    });
  });
})(jQuery);
</script>
`;

const buttonHtml = `
  <div class="clearfix" style="margin-bottom: 8px;">
    <button type="button" class="btn btn-default btn-sm pull-right disabled" id="btnResetColSizes" disabled="disabled" style="opacity: 0.6;" title="Reset all column widths to default">
      <span class="glyphicon glyphicon-refresh"></span> Reset Column Width
    </button>
  </div>`;

mongoExpressDirs.forEach(dir => {
  // ==========================================
  // Patch layout.html
  // ==========================================
  const layoutHtmlPath = path.join(dir, 'lib', 'views', 'layout.html');
  if (fs.existsSync(layoutHtmlPath)) {
    let layout = fs.readFileSync(layoutHtmlPath, 'utf8');

    // 1. Inject early theme script into <head>
    if (!layout.includes('mongo_express_theme')) {
      layout = layout.replace('<head>', '<head>' + earlyThemeScript);
    }

    // 2. Inject dark mode styles into <style type="text/css">
    const darkStyleRegex = /\/\* ========================================================= \*\/[\s\S]*?\/\* Mongo Express - Sleek Dark Mode Theme & Navbar Toggle UI  \*\/[\s\S]*?(?=<\/style>)/;
    if (darkStyleRegex.test(layout)) {
      layout = layout.replace(darkStyleRegex, darkModeStyles.trim() + '\n  ');
    } else if (!layout.includes('/* Mongo Express - Sleek Dark Mode Theme & Navbar Toggle UI  */')) {
      const styleCloseIdx = layout.indexOf('</style>');
      if (styleCloseIdx !== -1) {
        layout = layout.slice(0, styleCloseIdx) + darkModeStyles + '\n  ' + layout.slice(styleCloseIdx);
      }
    }

    // 3. Inject toggle button in navbar
    if (!layout.includes('id="theme-toggle-btn"')) {
      const breadcrumbBlockRegex = /\{%\s*block\s+breadcrumb\s*%\}\s*\{%\s*endblock\s*%\}\s*<\/ul>/;
      if (breadcrumbBlockRegex.test(layout)) {
        layout = layout.replace(breadcrumbBlockRegex, '{% block breadcrumb %}\n        {% endblock %}\n      </ul>' + navbarToggleHtml);
      }
    }

    // 4. Inject theme toggle script before {% block scripts %}
    if (!layout.includes('initTheme()')) {
      const blockScriptsIdx = layout.indexOf('{% block scripts %}');
      if (blockScriptsIdx !== -1) {
        layout = layout.slice(0, blockScriptsIdx) + layoutThemeScript + '\n' + layout.slice(blockScriptsIdx);
      }
    }

    fs.writeFileSync(layoutHtmlPath, layout, 'utf8');
    console.log(`Successfully patched layout: ${layoutHtmlPath}`);
  }

  // ==========================================
  // Patch collection.html
  // ==========================================
  const collectionHtmlPath = path.join(dir, 'lib', 'views', 'collection.html');
  if (fs.existsSync(collectionHtmlPath)) {
    let content = fs.readFileSync(collectionHtmlPath, 'utf8');

    // 1. Update customStyles
    const styleRegex = /\/\* --- Interactive Column Resizing System --- \*\/[\s\S]*?(?=<\/style>)/;
    if (styleRegex.test(content)) {
      content = content.replace(styleRegex, customStyles.trim());
    } else if (!content.includes('col-resizer-grip')) {
      if (content.includes('</style>\n{% endblock %}')) {
        content = content.replace('</style>\n{% endblock %}', customStyles + '\n</style>\n{% endblock %}');
      } else if (content.includes('{% endblock %}\n\n\n{% block breadcrumb %}')) {
        content = content.replace('{% endblock %}\n\n\n{% block breadcrumb %}', '<style>' + customStyles + '</style>\n{% endblock %}\n\n\n{% block breadcrumb %}');
      }
    }

    // 2. Button for reset column width
    const oldToolbarRegex = /<div class="table-column-controls clearfix">[\s\S]*?<\/div>\s*<\/div>/;
    if (oldToolbarRegex.test(content)) {
      content = content.replace(oldToolbarRegex, buttonHtml.trim());
    } else if (!content.includes('id="btnResetColSizes"') && content.includes('<div class="table-responsive tableWrapper')) {
      content = content.replace('<div class="table-responsive tableWrapper', buttonHtml + '\n  <div class="table-responsive tableWrapper');
    }

    content = content.replace(/Reset Column Widths/g, 'Reset Column Width');

    // 3. Update thead handles
    const oldTheadRegex = /<thead>\s*\{%\s*for\s+column\s+in\s+columns\s*%\}\s*<th\s+class="sorting-button\s+col-\{\{column\}\}"\s+data-column="\{\{column\}\}"\s+data-direction="\{\{sort\[column\]\}\}"\s+title="Sort\s+by\s+\{\{column\}\}">([\s\S]*?)<\/th>\s*\{%\s*endfor\s*%\}\s*<\/thead>/;

    if (oldTheadRegex.test(content) && !content.includes('class="col-resizer-grip"')) {
      const newThead = `<thead>
        {% for column in columns %}
          <th class="sorting-button col-{{column}}" data-column="{{column}}" data-direction="{{sort[column]}}" title="Sort by {{column}} (Drag border to resize, double-click to reset)">
            <span class="col-title-text">{{column}}</span>
            {% if sort[column] == 1 %}
              <span class="glyphicon glyphicon-triangle-top"></span>
            {% elseif sort[column] == -1 %}
              <span class="glyphicon glyphicon-triangle-bottom"></span>
            {% endif %}
            <div class="col-resizer-grip" data-column="{{column}}" title="Drag cursor left/right to shrink or expand. Double-click to reset."></div>
          </th>
        {% endfor %}
      </thead>`;

      content = content.replace(oldTheadRegex, newThead);
    }

    // 4. Update client script
    const scriptRegex = /<script type="text\/javascript">\s*\(function\s*\(\$\)\s*\{[\s\S]*?mongo_express_col_widths_[\s\S]*?<\/script>/;
    if (scriptRegex.test(content)) {
      content = content.replace(scriptRegex, resizerScript.trim());
    } else if (!content.includes('me-col-widths-dynamic')) {
      if (content.includes('{% endblock %}\n')) {
        const lastIdx = content.lastIndexOf('{% endblock %}');
        content = content.slice(0, lastIdx) + resizerScript + '\n{% endblock %}' + content.slice(lastIdx + 14);
      }
    }

    fs.writeFileSync(collectionHtmlPath, content, 'utf8');
    console.log(`Successfully patched collection: ${collectionHtmlPath}`);
  }

  // ==========================================
  // Patch routes/collection.js (Compute todos_performed)
  // ==========================================
  const collectionRoutePath = path.join(dir, 'lib', 'routes', 'collection.js');
  if (fs.existsSync(collectionRoutePath)) {
    let routeContent = fs.readFileSync(collectionRoutePath, 'utf8');
    if (!routeContent.includes('todos_performed')) {
      const targetStr = 'const docs = [];\n      let columns = [];\n\n      for (const i in items) {';
      const replacementStr = `const docs = [];
      let columns = [];

      if (req.collectionName === 'users') {
        try {
          const todosCol = req.db.collection('todos');
          for (const i in items) {
            const uId = items[i]._id;
            const uName = items[i].username;
            const c = await todosCol.countDocuments({
              $or: [
                { userId: uId },
                { userId: (uId && uId.toString) ? uId.toString() : String(uId) },
                { createdBy: uName }
              ]
            });
            items[i].todos_performed = c;
          }
        } catch (e) {}
      }

      for (const i in items) {`;
      if (routeContent.includes(targetStr)) {
        routeContent = routeContent.replace(targetStr, replacementStr);
        fs.writeFileSync(collectionRoutePath, routeContent, 'utf8');
        console.log(`Successfully patched collection route: ${collectionRoutePath}`);
      }
    }
  }

  // ==========================================
  // Patch css files
  // ==========================================
  const cssPaths = [
    path.join(dir, 'build', 'css', 'style.css'),
    path.join(dir, 'public', 'stylesheets', 'style.css')
  ];

  const usersTableStyles = `
/* users dedicated column spacing */
.collection-users table,
.collection-table-users {
  width: max-content !important;
  min-width: 100% !important;
}

.collection-users th,
.collection-users td {
  padding: 12px 20px !important;
}

.collection-users .col-todos_performed {
  min-width: 160px;
  text-align: center;
  font-weight: 600;
}

.collection-users .col-todos_performed .tableContent {
  text-align: center;
}
`;

  cssPaths.forEach(cssPath => {
    if (fs.existsSync(cssPath)) {
      let css = fs.readFileSync(cssPath, 'utf8');
      let updatedCss = css.replace(/(min-width:\s*\d+px)\s*!important/g, '$1');
      updatedCss = updatedCss.replace(/background:\s*(-webkit-|-moz-)?linear-gradient\([^;]+rgba\(255,\s*255,\s*255[^;]+;/g, 'background: transparent;');
      if (!updatedCss.includes('.collection-users')) {
        updatedCss += usersTableStyles;
      }
      if (updatedCss !== css) {
        fs.writeFileSync(cssPath, updatedCss, 'utf8');
        console.log(`Updated styles in: ${cssPath}`);
      }
    }
  });
});

console.log('Mongo Express patch complete (Column Resizing + Dark Mode + User Todos Count)!');
