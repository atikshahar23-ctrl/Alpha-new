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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));

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

window.addEventListener("message", async (e) => {
  if (!e.data || e.data.source !== "alpha-ai") return;
  const { action, payload } = e.data;

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
    window.parent.postMessage({ source: "heavyguard", action: "taskAdded", payload: newTask }, "*");
  }

  if (action === "getTasks") {
    const tasks = await loadArr("hg2:tasks");
    window.parent.postMessage({ source: "heavyguard", action: "tasksData", payload: tasks }, "*");
  }

  if (action === "getCustomers") {
    const customers = await loadArr("hg2:customers");
    window.parent.postMessage({ source: "heavyguard", action: "customersData", payload: customers }, "*");
  }
});

window.parent.postMessage({ source: "heavyguard", action: "ready" }, "*");
