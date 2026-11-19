#!/bin/sh
# Virtual display for HEADLESS=0 (a headed browser is harder to detect than a headless one).
Xvfb :99 -screen 0 1366x900x24 -nolisten tcp >/dev/null 2>&1 &
export DISPLAY=:99
exec uvicorn server:app --host 0.0.0.0 --port 9000
