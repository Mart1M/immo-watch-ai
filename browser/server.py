"""Browser service: a stealth Chromium (Scrapling/Patchright) the agent drives over HTTP.

One worker thread owns the browser (Playwright's sync API is thread-bound); HTTP handlers queue jobs to it.
Pages are kept per session id and closed after SESSION_TTL seconds of inactivity.
"""
import os
import queue
import threading
import time
from concurrent.futures import Future

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from scrapling.fetchers import StealthySession

TOKEN = os.environ.get("BROWSER_TOKEN", "")
TTL = int(os.environ.get("SESSION_TTL", "600"))
jobs: "queue.Queue[tuple]" = queue.Queue()
pages: dict = {}  # session id -> (page, last_used)


def worker():
    opts = {}
    if os.environ.get("BROWSER_PROXY"):  # e.g. http://user:pass@host:port, a residential proxy helps against DataDome
        opts["proxy"] = os.environ["BROWSER_PROXY"]
    session = StealthySession(
        headless=os.environ.get("HEADLESS", "0") == "1",  # default: a real window under Xvfb, it passes anti-bot checks that block headless
        solve_cloudflare=True, locale="fr-FR", timezone_id="Europe/Paris", **opts,
    )
    session.start()
    ctx = session.context
    while True:
        try:
            fn, fut = jobs.get(timeout=30)
        except queue.Empty:
            for sid, (p, last) in list(pages.items()):
                if time.time() - last > TTL:
                    p.close()
                    del pages[sid]
            continue
        try:
            fut.set_result(fn(ctx))
        except Exception as e:  # reported to the caller, the worker keeps running
            fut.set_exception(e)


threading.Thread(target=worker, daemon=True).start()


def run(fn):
    fut: Future = Future()
    jobs.put((fn, fut))
    try:
        return fut.result(timeout=120)
    except Exception as e:
        raise HTTPException(500, f"{type(e).__name__}: {str(e)[:300]}")


def page_of(ctx, sid):
    entry = pages.get(sid)
    if entry and not entry[0].is_closed():
        page = entry[0]
    else:
        page = ctx.new_page()
        page.set_default_timeout(30000)
    pages[sid] = (page, time.time())
    return page


def snapshot(page, max_chars, status=None):
    # Wait out a Cloudflare / bot-check interstitial (it usually clears by itself in a real browser).
    for _ in range(20):
        title = page.title().lower()
        if "just a moment" not in title and "un instant" not in title:
            break
        page.wait_for_timeout(1500)
    text = page.evaluate("() => document.body ? document.body.innerText : ''")
    return {
        "url": page.url,
        "title": page.title(),
        "status": status,
        "text": text[:max_chars],
        "truncated": len(text) > max_chars,
        "blocked": (status in (403, 429) and len(text) < 200) or any(k in (page.title() + text[:2000]).lower() for k in ("captcha", "datadome", "just a moment", "access denied")),
    }


app = FastAPI()


def auth(authorization: str | None):
    if TOKEN and authorization != f"Bearer {TOKEN}":
        raise HTTPException(401)


class Goto(BaseModel):
    url: str
    session: str = "default"
    wait_for: str | None = None
    max_chars: int = 8000


class Act(BaseModel):
    session: str = "default"
    selector: str | None = None
    text: str | None = None
    value: str | None = None
    submit: bool = False
    y: int | None = None
    max_chars: int = 8000


class Read(BaseModel):
    session: str = "default"
    mode: str = "text"  # text | html | links
    selector: str | None = None
    max_chars: int = 8000


class Eval(BaseModel):
    session: str = "default"
    js: str
    max_chars: int = 20000


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/goto")
def goto(b: Goto, authorization: str | None = Header(None)):
    auth(authorization)

    def job(ctx):
        page = page_of(ctx, b.session)
        resp = page.goto(b.url, wait_until="domcontentloaded")
        try:
            page.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            pass
        if b.wait_for:
            page.wait_for_selector(b.wait_for, timeout=15000)
        return snapshot(page, b.max_chars, resp.status if resp else None)

    return run(job)


@app.post("/click")
def click(b: Act, authorization: str | None = Header(None)):
    auth(authorization)

    def job(ctx):
        page = page_of(ctx, b.session)
        target = page.get_by_text(b.text, exact=False).first if b.text else page.locator(b.selector).first
        target.click()
        try:
            page.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            pass
        return snapshot(page, b.max_chars)

    return run(job)


@app.post("/fill")
def fill(b: Act, authorization: str | None = Header(None)):
    auth(authorization)

    def job(ctx):
        page = page_of(ctx, b.session)
        loc = page.locator(b.selector).first
        loc.click()
        loc.press_sequentially(b.value or "", delay=40)
        if b.submit:
            loc.press("Enter")
        page.wait_for_timeout(1500)
        return snapshot(page, b.max_chars)

    return run(job)


@app.post("/scroll")
def scroll(b: Act, authorization: str | None = Header(None)):
    auth(authorization)

    def job(ctx):
        page = page_of(ctx, b.session)
        page.mouse.wheel(0, b.y or 1500)
        page.wait_for_timeout(1000)
        return snapshot(page, b.max_chars)

    return run(job)


@app.post("/read")
def read(b: Read, authorization: str | None = Header(None)):
    auth(authorization)

    def job(ctx):
        page = page_of(ctx, b.session)
        if b.mode == "links":
            links = page.evaluate(
                "(s) => [...document.querySelectorAll((s||'')+' a[href]')].map(a => ({text: a.innerText.trim().slice(0,80), href: a.href}))",
                b.selector or "",
            )
            return {"links": links[:200]}
        if b.mode == "html":
            html = page.locator(b.selector).first.inner_html() if b.selector else page.content()
            return {"html": html[: b.max_chars], "truncated": len(html) > b.max_chars}
        text = page.locator(b.selector).first.inner_text() if b.selector else page.evaluate("() => document.body.innerText")
        return {"text": text[: b.max_chars], "truncated": len(text) > b.max_chars}

    return run(job)


@app.post("/eval")
def evaluate(b: Eval, authorization: str | None = Header(None)):
    auth(authorization)

    def job(ctx):
        import json

        out = json.dumps(page_of(ctx, b.session).evaluate(b.js), ensure_ascii=False)
        return {"result": out[: b.max_chars], "truncated": len(out) > b.max_chars}

    return run(job)
