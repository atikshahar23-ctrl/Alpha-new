# -*- coding: utf-8 -*-
"""
Knowledge Bridge — unified zero-cost middleware for the 12 Alpha agents.

WHAT THIS IS
    A single local Python service that routes every agent's data needs
    through free sources only:
      • yfinance                 → live market/financial data (free)
      • DuckDuckGo (ddgs)        → real-time web/strategic search (free)
      • local business data      → the same JSON records the web app keeps
                                   (exported localStorage / Heavy Guard files)

IMPORTANT — HOW THIS RELATES TO THE LIVE SITE
    Alpha is a static GitHub Pages app with NO server, so the production
    Knowledge Bridge already runs *inside the browser* (see domainContext()
    in agents/App.jsx: live fleet record, pipeline, drafts, dev tasks and
    markets are injected into every agent prompt, plus a free DuckDuckGo
    lookup when you ask an agent to check the web). That path costs nothing
    and needs no infrastructure.

    THIS script is the optional desktop twin: run it on your own machine
    when you want richer sources (full yfinance history, deeper web search)
    without ever paying for infrastructure. It serves the same JSON shape
    the app understands.

USAGE
    pip install yfinance ddgs flask
    python tools/knowledge_bridge.py            # http://localhost:8787
    GET /bridge?domain=finance                  # per-agent live context
    GET /bridge?domain=ops
    GET /search?q=מחיר+מיגון+צמה                # DuckDuckGo results
    GET /quote?symbols=BTC-USD,^GSPC,TSLA       # yfinance quotes

    No keys, no accounts, no cost. Real-money trading is out of scope by
    design — market data here is read-only observation.
"""
import json
import os
import sys

try:
    from flask import Flask, jsonify, request
except ImportError:
    sys.exit("pip install flask yfinance ddgs")

app = Flask(__name__)

# Local business data: point this at an export of the app's localStorage
# (Settings → cloud sync keeps these keys) or Heavy Guard JSON files.
DATA_DIR = os.environ.get("ALPHA_DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))


def read_local(key, default):
    path = os.path.join(DATA_DIR, key.replace(":", "_") + ".json")
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return default


def quotes(symbols):
    import yfinance as yf
    out = {}
    for sym in symbols:
        try:
            info = yf.Ticker(sym).fast_info
            out[sym] = {
                "price": round(float(info["last_price"]), 2),
                "prev_close": round(float(info["previous_close"]), 2),
            }
            prev = out[sym]["prev_close"] or 1
            out[sym]["chg_pct"] = round((out[sym]["price"] - prev) / prev * 100, 2)
        except Exception:
            out[sym] = {"error": "live data unavailable"}
    return out


def web_search(query, n=4):
    try:
        from ddgs import DDGS
        with DDGS() as ddg:
            return [
                {"title": r.get("title"), "body": r.get("body"), "url": r.get("href")}
                for r in ddg.text(query, max_results=n)
            ]
    except Exception:
        return [{"error": "live search unavailable - reconnecting..."}]


# Per-agent routing: which sources feed which specialist.
DOMAIN_SOURCES = {
    "finance":  lambda: {"markets": quotes(["BTC-USD", "ETH-USD", "^GSPC", "^IXIC"]),
                          "books": read_local("books", {}), "pipeline": read_local("itai_deals", [])},
    "ops":      lambda: {"vehicle": read_local("hg2_vehicle", {}), "odometer": read_local("hg2_odometer", {}),
                          "trips": read_local("hg2_trips", []), "gps": read_local("hg_trips_v1", [])},
    "sales":    lambda: {"deals": read_local("itai_deals", []), "customers": read_local("itai_customers", [])},
    "cs":       lambda: {"customers": read_local("itai_customers", [])},
    "data":     lambda: {"deals": read_local("itai_deals", []), "installs": read_local("hg2_index", {})},
    "cmo":      lambda: {"drafts": read_local("alpha_social_drafts", []),
                          "trends": web_search("טרנדים שיווק אבטחת רכב ישראל", 3)},
    "dev":      lambda: {"tasks": read_local("alpha_agents_devtasks", [])},
    "auto":     lambda: {"ideas": read_local("alpha_agents_ideas", [])},
    "procure":  lambda: {"pricelist": read_local("hg2_index", {})},
    "legal":    lambda: {"customers": read_local("itai_customers", [])},
    "growth":   lambda: {"deals": read_local("itai_deals", []),
                          "competitors": web_search("מיגון כלי צמה חברות ישראל", 3)},
    "ceo":      lambda: {"deals": read_local("itai_deals", []), "books": read_local("books", {})},
}


@app.get("/bridge")
def bridge():
    domain = request.args.get("domain", "ceo")
    src = DOMAIN_SOURCES.get(domain)
    if not src:
        return jsonify({"error": f"unknown domain '{domain}'"}), 404
    return jsonify({"domain": domain, "data": src()})


@app.get("/search")
def search():
    q = request.args.get("q", "")
    return jsonify(web_search(q) if q else [])


@app.get("/quote")
def quote():
    syms = [s for s in request.args.get("symbols", "").split(",") if s]
    return jsonify(quotes(syms) if syms else {})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8787)
