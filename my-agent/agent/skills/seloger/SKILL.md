---
description: Fetch listings from seloger.com by browsing it. Use for the source "seloger".
---

SeLoger is protected by DataDome. The `browser_*` tools use a real (headed) stealth browser which usually gets through
from a normal connection; some IPs (datacenters) are still refused. Use `session: "seloger"`. If a result says
`blocked: true`, try once more (reload the search URL), then `record_run` with status `blocked`.

## 1. Find the location id

The id format is opaque (`AD08FR…`, `POCOFR…`). Get it from the site itself:
`browser_goto` on `https://www.seloger.com/classified-search?distributionTypes=Buy&estateTypes=Apartment`
(`Rent` for rentals, `Apartment,House` for both), then use the location box: `browser_read mode=html` to find the
input, `browser_fill` the city, `browser_click` the first suggestion. The `url` of the returned page now contains
`locations=<id>`: reuse it for the next runs and for the other filters.

(Autocomplete helper, usable via `browser_eval` once a seloger page is open:
`fetch("https://autocomplete.svc.groupe-seloger.com/api/v2.0/auto/complete/fra/63/10/8/SeLoger?text=lille").then(r=>r.json())`
returns insee codes `Params.ci`, not the URL ids.)

## 2. Filters

Append to the search URL: `&priceMax=200000&spaceMin=40&roomsMin=2` (verify they show in the page's filter bar; else set them in the UI).
Sort by newest with the sort control if present.

## 3. Extract

Dismiss the cookie banner (`browser_click` text "Tout accepter"). Then `browser_eval`:

```js
[...document.querySelectorAll('[data-testid*="serp-core-classified-card"], article')].map(c => ({
  href: c.querySelector('a[href*="/annonces/"]')?.href,
  text: c.innerText.replace(/\s+/g,' ').slice(0,300),
  img: c.querySelector('img')?.src })).filter(x => x.href)
```

`externalId` = the numeric id in the href (`.../<id>.htm`). Verify the selector on the first run and adapt.
