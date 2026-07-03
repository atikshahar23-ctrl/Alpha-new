import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { DeviceProfileProvider } from "./deviceProfiler.js";

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    React.createElement(DeviceProfileProvider, null, React.createElement(App))
  );
}
