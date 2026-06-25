import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// localStorage-based polyfill for window.storage API
if (!window.storage) {
  window.storage = {
    async get(k) {
      const v = localStorage.getItem(k);
      if (v !== null) return { value: v };
      throw new Error("nf");
    },
    async set(k, v) {
      localStorage.setItem(k, v);
      return { value: v };
    },
    async delete(k) {
      localStorage.removeItem(k);
    }
  };
}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(React.createElement(App));
}

// Alpha AI integration via postMessage
async function loadArr(key) {
  try {
    const r = await window.storage.get(key);
    return r && r.value ? JSON.parse(r.value) : [];
  } catch {
    return [];
  }
}
const saveArr = (key, arr) => window.storage.set(key, JSON.stringify(arr)).catch(() => {});
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const todayISO = () => new Date().toISOString().slice(0, 10);

const CONTRACTORS = [
  { id: "kobi", name: "קובי" },
  { id: "asi", name: "אסי" },
  { id: "sagi", name: "שגיא מערכות" },
  { id: "mb", name: "m.b מערכות" },
  { id: "sd", name: "ס.ד מיגונים" },
  { id: "hg", name: "Heavy Guard", master: true },
];
const cName = (id) => (CONTRACTORS.find((c) => c.id === id) || {}).name || id;

window.addEventListener("message", async (e) => {
  if (!e.data || e.data.source !== "alpha-ai") return;
  const { action, payload } = e.data;
  const reply = (act, data) => window.parent.postMessage({ source: "heavyguard", action: act, payload: data }, "*");

  if (action === "addTask") {
    const tasks = await loadArr("hg2:tasks");
    const newTask = {
      id: uid(),
      title: payload.title,
      date: payload.date || todayISO(),
      done: false,
      ts: Date.now()
    };
    const updated = [newTask, ...tasks];
    await saveArr("hg2:tasks", updated);
    reply("taskAdded", newTask);
  }

  if (action === "getTasks") {
    reply("tasksData", await loadArr("hg2:tasks"));
  }

  if (action === "getCustomers") {
    reply("customersData", await loadArr("hg2:customers"));
  }

  if (action === "searchLicense") {
    const q = (payload.query || "").replace(/[-\s]/g, "").toLowerCase();
    const index = await loadArr("hg2:index");
    const results = index.filter(r => {
      const id = (r.idNumber || "").replace(/[-\s]/g, "").toLowerCase();
      return id.includes(q) || q.includes(id);
    });
    reply("searchResults", results.map(r => ({
      id: r.id, idNumber: r.idNumber, idType: r.idType,
      contractor: cName(r.contractor), contractorId: r.contractor,
      date: r.date, price: r.price, vehicleType: r.vehicleType,
      manufacturer: r.manufacturer, installType: r.installType,
      location: r.location, customer: r.customer, phone: r.phone,
    })));
  }

  if (action === "getEarnings") {
    const { contractor, month } = payload || {};
    const index = await loadArr("hg2:index");
    let filtered = index;
    if (contractor) {
      const cLow = contractor.toLowerCase();
      filtered = filtered.filter(r => {
        const cid = (r.contractor || "").toLowerCase();
        const cn = cName(r.contractor).toLowerCase();
        return cid.includes(cLow) || cn.includes(cLow) || cLow.includes(cid) || cLow.includes(cn);
      });
    }
    if (month) {
      filtered = filtered.filter(r => (r.date || "").startsWith(month));
    }
    const byContractor = {};
    for (const r of filtered) {
      const cn = cName(r.contractor);
      if (!byContractor[cn]) byContractor[cn] = { total: 0, count: 0, jobs: [] };
      byContractor[cn].total += r.price || 0;
      byContractor[cn].count++;
      byContractor[cn].jobs.push({ date: r.date, price: r.price, type: r.installType, vehicle: r.vehicleType });
    }
    const grandTotal = filtered.reduce((s, r) => s + (r.price || 0), 0);
    reply("earningsData", { byContractor, grandTotal, totalJobs: filtered.length, month: month || "all" });
  }

  if (action === "addQuote") {
    const quotes = await loadArr("hg2:quotes");
    const newQuote = {
      id: uid(),
      customer: payload.customer || "",
      phone: payload.phone || "",
      items: payload.items || [],
      total: (payload.items || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0),
      date: todayISO(),
      status: "draft",
      ts: Date.now(),
    };
    await saveArr("hg2:quotes", [newQuote, ...quotes]);
    reply("quoteAdded", newQuote);
  }

  if (action === "getIndex") {
    const index = await loadArr("hg2:index");
    reply("indexData", index.map(r => ({
      id: r.id, idNumber: r.idNumber, idType: r.idType,
      contractor: cName(r.contractor), contractorId: r.contractor,
      date: r.date, price: r.price, vehicleType: r.vehicleType,
      manufacturer: r.manufacturer, installType: r.installType,
      location: r.location, customer: r.customer, phone: r.phone,
    })));
  }

  if (action === "getQuotes") {
    reply("quotesData", await loadArr("hg2:quotes"));
  }
});

window.parent.postMessage({ source: "heavyguard", action: "ready" }, "*");
