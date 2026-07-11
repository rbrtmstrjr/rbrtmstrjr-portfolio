/**
 * Renders sample "product screenshot" mockups for each portfolio project.
 * Each mockup is an HTML scene in the site's palette, screenshotted to
 * public/projects/<slug>/cover.png at 1600x1000 (16:10, matches the cards).
 */
const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

const EXE = path.join(
  process.env.LOCALAPPDATA,
  "ms-playwright",
  "chromium-1228",
  "chrome-win64",
  "chrome.exe"
);
const OUT_ROOT = "c:/Users/rober/OneDrive/Pictures/portfolio-2026/public/projects";

/* ------------------------------ design tokens ------------------------------ */
const css = `
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',system-ui,sans-serif; }
  :root{
    --paper:#f2f6fb; --ink:#131b2e; --muted:#8a8d98; --line:#e1e7f2;
    --card:#ffffff; --accent:#0c4eff; --accent-soft:#e3ecff;
    --green:#2f9e64; --green-soft:#e3f3ea; --amber:#c77d0a; --amber-soft:#faf0dc;
    --red:#c94436; --red-soft:#f9e7e4;
  }
  body{ width:1600px; height:1000px; background:var(--paper); overflow:hidden;
    background-image:radial-gradient(rgba(19,27,46,.06) 1.5px, transparent 1.5px);
    background-size:26px 26px; display:flex; align-items:center; justify-content:center; }
  .window{ width:1320px; height:840px; background:var(--card); border-radius:18px;
    box-shadow:0 40px 80px -20px rgba(19,27,46,.25), 0 0 0 1px var(--line);
    display:flex; flex-direction:column; overflow:hidden; }
  .titlebar{ height:52px; border-bottom:1px solid var(--line); display:flex; align-items:center;
    gap:10px; padding:0 20px; flex:none; }
  .dot{ width:12px; height:12px; border-radius:50%; background:#dfe6f0; }
  .urlbar{ margin-left:14px; height:30px; flex:1; max-width:440px; background:var(--paper);
    border-radius:15px; display:flex; align-items:center; padding:0 16px; font-size:13px; color:var(--muted); }
  .app{ flex:1; display:flex; min-height:0; }
  .sidebar{ width:230px; border-right:1px solid var(--line); padding:24px 16px; flex:none; }
  .brand{ font-weight:600; font-size:15px; color:var(--ink); padding:0 10px 18px; }
  .nav{ display:flex; flex-direction:column; gap:4px; }
  .nav div{ padding:10px 12px; border-radius:8px; font-size:13.5px; color:var(--muted); }
  .nav .on{ background:var(--accent-soft); color:var(--accent); font-weight:600; }
  .main{ flex:1; padding:28px 32px; overflow:hidden; min-width:0; }
  h1{ font-size:22px; color:var(--ink); font-weight:650; }
  .sub{ font-size:13px; color:var(--muted); margin-top:4px; }
  .row{ display:flex; gap:16px; margin-top:22px; }
  .stat{ flex:1; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:18px 20px; }
  .stat .lb{ font-size:11.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
  .stat .v{ font-size:26px; font-weight:700; color:var(--ink); margin-top:6px; }
  .stat .v.acc{ color:var(--accent); }
  .panel{ background:var(--card); border:1px solid var(--line); border-radius:12px; padding:20px; margin-top:16px; }
  .bar{ height:11px; border-radius:6px; background:#e8edf5; }
  .bar.w40{width:40%} .bar.w55{width:55%} .bar.w70{width:70%} .bar.w85{width:85%}
  .pill{ display:inline-block; padding:5px 12px; border-radius:999px; font-size:12px; font-weight:600; }
  .pill.g{ background:var(--green-soft); color:var(--green); }
  .pill.a{ background:var(--amber-soft); color:var(--amber); }
  .pill.b{ background:var(--accent-soft); color:var(--accent); }
  .pill.r{ background:var(--red-soft); color:var(--red); }
  .trow{ display:flex; align-items:center; gap:18px; padding:15px 4px; border-bottom:1px solid var(--line); }
  .trow:last-child{ border-bottom:none; }
  .btn{ background:var(--accent); color:#fff; border-radius:10px; padding:12px 22px; font-size:14px;
    font-weight:600; display:inline-block; }
  .btn.ghost{ background:transparent; color:var(--ink); border:1px solid var(--line); }
  /* phone */
  .phone{ width:400px; height:820px; background:var(--ink); border-radius:48px; padding:14px;
    box-shadow:0 40px 80px -20px rgba(19,27,46,.35); }
  .screen{ width:100%; height:100%; border-radius:36px; background:var(--card); overflow:hidden;
    display:flex; flex-direction:column; position:relative; }
  .duo{ display:flex; gap:56px; align-items:center; }
`;

/* ------------------------------ scene helpers ------------------------------ */
const chrome = (url, inner) => `
  <div class="window">
    <div class="titlebar">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      <div class="urlbar">${url}</div>
    </div>
    ${inner}
  </div>`;

const sidebar = (brand, items, activeIdx = 0) => `
  <div class="sidebar">
    <div class="brand">${brand}</div>
    <div class="nav">${items
      .map((it, i) => `<div class="${i === activeIdx ? "on" : ""}">${it}</div>`)
      .join("")}</div>
  </div>`;

const stat = (lb, v, acc = "") => `
  <div class="stat"><div class="lb">${lb}</div><div class="v ${acc}">${v}</div></div>`;

/* --------------------------------- scenes ---------------------------------- */
const scenes = {
  /* FishPin — phone app, map with pins */
  fishpin: `
    <div class="duo">
      <div class="phone"><div class="screen">
        <div style="flex:1; position:relative; background:linear-gradient(160deg,#dfe9dd 0%,#cfdfe6 55%,#c2d4e2 100%);">
          <div style="position:absolute;inset:0;opacity:.5;background-image:radial-gradient(rgba(19,27,46,.10) 1.5px,transparent 1.5px);background-size:22px 22px;"></div>
          <div style="position:absolute;top:24px;left:20px;right:20px;height:46px;background:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(19,27,46,.12);display:flex;align-items:center;padding:0 18px;color:#8a8d98;font-size:14px;">Search your spots…</div>
          ${[
            [140, 90], [230, 200], [90, 300], [280, 380], [170, 480],
          ]
            .map(
              ([t, l]) => `<div style="position:absolute;top:${t + 60}px;left:${l}px;width:26px;height:26px;border-radius:50% 50% 50% 4px;background:#0c4eff;transform:rotate(-45deg);box-shadow:0 6px 14px rgba(12,78,255,.35);"></div>`
            )
            .join("")}
          <div style="position:absolute;top:238px;left:198px;width:56px;height:56px;border-radius:50% 50% 50% 6px;background:#c94436;transform:rotate(-45deg);box-shadow:0 10px 24px rgba(201,68,54,.45);border:4px solid #fff;"></div>
        </div>
        <div style="flex:none;padding:20px;border-top:1px solid #e1e7f2;background:#fff;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:700;font-size:17px;color:#131b2e;">Rocky Point East</div>
              <div style="font-size:13px;color:#8a8d98;margin-top:3px;">12 catches · best at dawn</div>
            </div>
            <div class="btn" style="padding:10px 18px;">Log catch</div>
          </div>
        </div>
      </div></div>
      <div style="width:420px;">
        <div style="font-size:44px;font-weight:300;color:#131b2e;font-family:Georgia,serif;">FishPin</div>
        <div style="font-size:17px;color:#8a8d98;margin-top:10px;line-height:1.6;">Pin the spot. Log the catch.<br/>Never lose good water again.</div>
        <div style="margin-top:26px;display:flex;gap:12px;">
          <div class="pill b">GPS pinning</div><div class="pill g">Offline maps</div>
        </div>
      </div>
    </div>`,

  /* POS — register with quick keys + cart */
  "retail-pos": chrome(
    "pos.local — Register 1",
    `<div class="app">
      <div class="main" style="display:flex;gap:24px;">
        <div style="flex:1.4;">
          <h1>Quick keys</h1>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px;">
            ${["Rice 25kg", "Cooking oil", "Detergent", "Soft drinks", "Canned goods", "Noodles", "Coffee", "Sugar 1kg", "Eggs / tray", "Bread", "Snacks", "Load / e-wallet"]
              .map(
                (n, i) => `<div style="height:96px;border:1px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;${i === 1 ? "background:var(--accent-soft);border-color:var(--accent);" : ""}">
                  <div style="font-size:13.5px;font-weight:600;color:var(--ink);">${n}</div>
                  <div style="font-size:12px;color:var(--muted);">tap to add</div>
                </div>`
              )
              .join("")}
          </div>
        </div>
        <div style="flex:1;border:1px solid var(--line);border-radius:14px;padding:22px;display:flex;flex-direction:column;">
          <h1 style="font-size:18px;">Current sale</h1>
          <div style="margin-top:10px;flex:1;">
            ${[["Cooking oil 1L", "2", "₱ 310"], ["Rice 25kg", "1", "₱ 1,250"], ["Eggs / tray", "1", "₱ 210"], ["Coffee twin pack", "3", "₱ 54"]]
              .map(
                ([n, q, p]) => `<div class="trow" style="padding:13px 0;">
                  <div style="flex:1;font-size:14px;color:var(--ink);">${n}</div>
                  <div style="font-size:13px;color:var(--muted);">×${q}</div>
                  <div style="font-size:14px;font-weight:600;color:var(--ink);">${p}</div>
                </div>`
              )
              .join("")}
          </div>
          <div style="border-top:1px solid var(--line);padding-top:16px;">
            <div style="display:flex;justify-content:space-between;font-size:15px;color:var(--muted);">Total <span style="font-size:24px;font-weight:700;color:var(--ink);">₱ 1,824</span></div>
            <div class="btn" style="width:100%;text-align:center;margin-top:14px;">Charge — cash</div>
          </div>
        </div>
      </div>
    </div>`
  ),

  /* Kamote inventory — production dashboard */
  "mr-kamote-chips-inventory": chrome(
    "app.mrkamote.ph/production",
    `<div class="app">
      ${sidebar("Mr. Kamote Chips", ["Production", "Stock", "Supplies", "Dispatch", "Reports"], 0)}
      <div class="main">
        <h1>Today's production</h1>
        <div class="sub">Friday — Batch window 2 of 3</div>
        <div class="row">
          ${stat("Raw kamote in", "480 kg")}
          ${stat("Batches done", "14", "acc")}
          ${stat("Packed SKUs", "1,120 packs")}
          ${stat("Waste", "2.1%")}
        </div>
        <div class="panel">
          ${[["Batch #B-2107", "Classic 60g", "Packed · 82 packs", "g", "Done"], ["Batch #B-2108", "Spicy 60g", "Frying — 12 min left", "a", "In progress"], ["Batch #B-2109", "Classic 150g", "Queued after B-2108", "b", "Queued"], ["Batch #B-2110", "BBQ 60g", "Awaiting raw supply", "r", "Blocked"]]
            .map(
              ([id, sku, note, tone, label]) => `<div class="trow">
                <div style="width:130px;font-size:14px;font-weight:600;color:var(--ink);">${id}</div>
                <div style="width:130px;font-size:13.5px;color:var(--muted);">${sku}</div>
                <div style="flex:1;font-size:13.5px;color:var(--muted);">${note}</div>
                <div class="pill ${tone}">${label}</div>
              </div>`
            )
            .join("")}
        </div>
      </div>
    </div>`
  ),

  /* Delivery tracker — dispatch board */
  "delivery-tracker": chrome(
    "dispatch.local/board",
    `<div class="app">
      ${sidebar("Dispatch", ["Live board", "Drivers", "Customers", "History"], 0)}
      <div class="main">
        <h1>Live deliveries — 32 today</h1>
        <div class="row">
          ${stat("Delivered", "21", "acc")}${stat("On the road", "8")}${stat("Delayed", "2")}${stat("Unassigned", "1")}
        </div>
        <div class="panel">
          ${[["DR-1042", "Mang Tomas Sari-sari", "Rey — Truck 2", "g", "Delivered 10:41"], ["DR-1043", "Golden Harvest Mart", "Rey — Truck 2", "b", "Next stop · 12 min"], ["DR-1044", "Nueva Café", "Jun — Truck 1", "a", "Delayed · traffic"], ["DR-1045", "Villa Grocery", "Jun — Truck 1", "b", "En route"], ["DR-1046", "San Roque Bakery", "—", "r", "Unassigned"]]
            .map(
              ([id, cust, drv, tone, label]) => `<div class="trow">
                <div style="width:90px;font-size:13.5px;font-weight:600;color:var(--ink);">${id}</div>
                <div style="flex:1.2;font-size:14px;color:var(--ink);">${cust}</div>
                <div style="flex:1;font-size:13.5px;color:var(--muted);">${drv}</div>
                <div class="pill ${tone}">${label}</div>
              </div>`
            )
            .join("")}
        </div>
      </div>
    </div>`
  ),

  /* AI document automation — review queue */
  "ai-document-automation": chrome(
    "backoffice.local/review",
    `<div class="app">
      ${sidebar("Back Office AI", ["Review queue", "Processed", "Rules", "Audit log"], 0)}
      <div class="main">
        <h1>Review queue</h1>
        <div class="sub">AI processed 143 documents today — 6 need a human eye</div>
        <div class="row">
          ${stat("Auto-filed", "137", "acc")}${stat("Needs review", "6")}${stat("Avg. handling", "22 sec")}
        </div>
        <div class="panel">
          ${[["Supplier invoice — MegaFoods", "₱ 44,120 · 12 line items", "g", "Filed"], ["Purchase order — scan (photo)", "Total unclear — low confidence", "a", "Review"], ["Delivery receipt — Truck 2", "Matched to DR-1043", "g", "Filed"], ["Customer order — email", "New customer — confirm details", "a", "Review"]]
            .map(
              ([t, note, tone, label]) => `<div class="trow">
                <div style="width:44px;height:44px;border-radius:10px;background:var(--paper);border:1px solid var(--line);"></div>
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:600;color:var(--ink);">${t}</div>
                  <div style="font-size:12.5px;color:var(--muted);margin-top:3px;">${note}</div>
                </div>
                <div class="pill ${tone}">${label}</div>
              </div>`
            )
            .join("")}
        </div>
      </div>
    </div>`
  ),

  /* AI inquiry assistant — chat with handoff */
  "ai-inquiry-assistant": chrome(
    "chat.shop.ph — assistant",
    `<div class="app">
      <div class="main" style="display:flex;gap:24px;">
        <div style="flex:1.5;border:1px solid var(--line);border-radius:14px;display:flex;flex-direction:column;overflow:hidden;">
          <div style="padding:16px 20px;border-bottom:1px solid var(--line);font-weight:600;color:var(--ink);">Maria S. <span class="pill g" style="margin-left:10px;">AI answering</span></div>
          <div style="flex:1;padding:22px;display:flex;flex-direction:column;gap:14px;background:var(--paper);">
            <div style="align-self:flex-start;max-width:70%;background:#fff;border:1px solid var(--line);border-radius:14px 14px 14px 4px;padding:12px 16px;font-size:14px;color:var(--ink);">Hi! Magkano po ang shipping to Cebu? In stock pa ba yung tumbler na blue?</div>
            <div style="align-self:flex-end;max-width:70%;background:var(--accent);color:#fff;border-radius:14px 14px 4px 14px;padding:12px 16px;font-size:14px;">Yes po! Blue tumbler — 27 in stock. Shipping to Cebu is ₱85, arrives in 2–3 days. Want me to reserve one? 🛒</div>
            <div style="align-self:flex-start;max-width:70%;background:#fff;border:1px solid var(--line);border-radius:14px 14px 14px 4px;padding:12px 16px;font-size:14px;color:var(--ink);">Sige, 2 pcs please! Pwede COD?</div>
            <div style="align-self:center;font-size:12px;color:var(--muted);background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 14px;">Buying intent detected → handed to Ana (sales)</div>
          </div>
          <div style="padding:14px 20px;border-top:1px solid var(--line);color:var(--muted);font-size:14px;">Type a reply…</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:16px;">
          ${stat("Answered instantly", "81%", "acc")}
          ${stat("Avg. first reply", "4 sec")}
          ${stat("Handed to team", "19 chats")}
          <div class="panel" style="margin-top:0;">
            <div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:12px;">Top questions today</div>
            <div class="bar w85"></div><div class="bar w70" style="margin-top:10px;"></div><div class="bar w55" style="margin-top:10px;"></div><div class="bar w40" style="margin-top:10px;"></div>
          </div>
        </div>
      </div>
    </div>`
  ),

  /* AI branch reports — Monday report */
  "ai-branch-reports": chrome(
    "reports.local/weekly",
    `<div class="app">
      ${sidebar("HQ Reports", ["Weekly report", "Branches", "Flags", "Archive"], 0)}
      <div class="main">
        <h1>Weekly report — drafted Sun 11:04 PM</h1>
        <div class="sub">5 branches merged automatically · 2 anomalies flagged</div>
        <div class="row">
          ${stat("Total sales", "₱ 1.42M", "acc")}${stat("vs last week", "+6.8%")}${stat("Best branch", "Batangas")}
        </div>
        <div class="panel" style="display:flex;gap:24px;align-items:flex-end;height:210px;padding:26px;">
          ${[62, 78, 55, 90, 70, 84, 96]
            .map(
              (h, i) => `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;gap:8px;">
                <div style="height:${h}%;border-radius:8px 8px 4px 4px;background:${i === 6 ? "var(--accent)" : "#d7deeb"};"></div>
              </div>`
            )
            .join("")}
        </div>
        <div class="panel">
          <div class="trow"><div class="pill a">Flag</div><div style="flex:1;font-size:13.5px;color:var(--ink);">Lipa branch down 34% — cross-check stockouts on weekend</div></div>
          <div class="trow"><div class="pill a">Flag</div><div style="flex:1;font-size:13.5px;color:var(--ink);">Duplicate entry suspected — San Pablo, Saturday PM batch</div></div>
        </div>
      </div>
    </div>`
  ),

  /* Investor site — landing hero */
  "mr-kamote-chips-investor-site": chrome(
    "mrkamotechips.ph/investors",
    `<div style="flex:1;display:flex;flex-direction:column;background:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:22px 48px;border-bottom:1px solid var(--line);">
        <div style="font-weight:700;color:var(--ink);">Mr. Kamote Chips</div>
        <div style="display:flex;gap:26px;font-size:13.5px;color:var(--muted);align-items:center;">
          <span>Story</span><span>Traction</span><span>Distribution</span>
          <span class="btn" style="padding:9px 18px;font-size:13px;">Talk to Joshua</span>
        </div>
      </div>
      <div style="flex:1;display:flex;align-items:center;padding:0 48px;gap:48px;">
        <div style="flex:1.2;">
          <div style="font-family:Georgia,serif;font-size:52px;line-height:1.1;color:var(--ink);">A snack brand growing faster than its shelves.</div>
          <div style="font-size:16px;color:var(--muted);margin-top:18px;max-width:460px;line-height:1.6;">From one fryer to province-wide distribution — now raising to scale production.</div>
          <div style="display:flex;gap:14px;margin-top:28px;">
            <div class="btn">Investor deck</div><div class="btn ghost">The numbers</div>
          </div>
        </div>
        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          ${stat("Monthly output", "38k packs", "acc")}${stat("YoY growth", "+112%")}${stat("Retail partners", "140+")}${stat("Provinces", "6")}
        </div>
      </div>
    </div>`
  ),

  /* Clinic booking */
  "clinic-booking-site": chrome(
    "smiledental.ph/book",
    `<div class="app">
      <div class="main" style="display:flex;gap:28px;">
        <div style="flex:1;">
          <h1 style="font-family:Georgia,serif;font-size:30px;">Book your visit</h1>
          <div class="sub">Pick a service and a time — takes under a minute.</div>
          <div style="margin-top:22px;display:flex;flex-direction:column;gap:10px;">
            ${["Cleaning & check-up", "Tooth extraction", "Braces adjustment", "Whitening"]
              .map(
                (s, i) => `<div style="border:1px solid ${i === 0 ? "var(--accent)" : "var(--line)"};${i === 0 ? "background:var(--accent-soft);" : ""}border-radius:12px;padding:16px 18px;font-size:14.5px;font-weight:600;color:var(--ink);display:flex;justify-content:space-between;">
                  ${s}<span style="color:var(--muted);font-weight:400;">${["45 min", "30 min", "20 min", "60 min"][i]}</span>
                </div>`
              )
              .join("")}
          </div>
          <div class="btn" style="margin-top:22px;width:100%;text-align:center;">Confirm — Tue 10:30 AM</div>
        </div>
        <div style="flex:1.2;border:1px solid var(--line);border-radius:14px;padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:650;color:var(--ink);">July 2026</div>
            <div style="color:var(--muted);font-size:13px;">Tue 14 selected</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:18px;">
            ${Array.from({ length: 28 }, (_, i) => {
              const d = i + 1;
              const sel = d === 14;
              const dim = [4, 5, 11, 12, 18, 19, 25, 26].includes(d);
              return `<div style="height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;${
                sel
                  ? "background:var(--accent);color:#fff;font-weight:700;"
                  : dim
                    ? "color:#c3cddd;"
                    : "border:1px solid var(--line);color:var(--ink);"
              }">${d}</div>`;
            }).join("")}
          </div>
          <div style="display:flex;gap:10px;margin-top:18px;">
            ${["9:00", "10:30", "1:00", "3:30"].map((t, i) => `<div class="pill ${i === 1 ? "b" : ""}" style="${i !== 1 ? "border:1px solid var(--line);color:var(--muted);background:#fff;" : ""}padding:9px 16px;">${t}</div>`).join("")}
          </div>
        </div>
      </div>
    </div>`
  ),

  /* Restaurant site */
  "restaurant-site": chrome(
    "kusinaninanay.ph",
    `<div style="flex:1;display:flex;background:#fff;">
      <div style="flex:1.1;padding:56px 48px;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);font-weight:700;">Kusina ni Nanay</div>
        <div style="font-family:Georgia,serif;font-size:50px;line-height:1.12;color:var(--ink);margin-top:14px;">Lutong bahay,<br/>ready when you are.</div>
        <div style="font-size:15.5px;color:var(--muted);margin-top:16px;line-height:1.6;">Open 10am–9pm daily · Order ahead and skip the line.</div>
        <div style="display:flex;gap:14px;margin-top:28px;">
          <div class="btn">Order ahead</div><div class="btn ghost">See the menu</div>
        </div>
      </div>
      <div style="flex:1;background:var(--paper);border-left:1px solid var(--line);padding:40px 36px;">
        <div style="font-weight:700;color:var(--ink);font-size:17px;">Today's menu</div>
        ${[["Kare-kare", "₱ 280", "bestseller"], ["Sinigang na baboy", "₱ 240", ""], ["Crispy pata", "₱ 520", "for sharing"], ["Halo-halo", "₱ 120", "new"]]
          .map(
            ([n, p, tag]) => `<div style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-top:12px;display:flex;align-items:center;gap:14px;">
              <div style="width:52px;height:52px;border-radius:10px;background:linear-gradient(140deg,#e8d9c3,#d9b98c);"></div>
              <div style="flex:1;">
                <div style="font-weight:650;font-size:14.5px;color:var(--ink);">${n} ${tag ? `<span class="pill b" style="font-size:10.5px;padding:3px 9px;margin-left:6px;">${tag}</span>` : ""}</div>
                <div class="bar w55" style="margin-top:8px;"></div>
              </div>
              <div style="font-weight:700;color:var(--ink);font-size:14.5px;">${p}</div>
            </div>`
          )
          .join("")}
      </div>
    </div>`
  ),
};

/* ----------------------------------- run ----------------------------------- */
(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  for (const [slug, body] of Object.entries(scenes)) {
    const dir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(dir, { recursive: true });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${body}</body></html>`,
      { waitUntil: "networkidle" }
    );
    await page.screenshot({ path: path.join(dir, "cover.png") });
    console.log("rendered", slug);
  }
  await browser.close();
})();
