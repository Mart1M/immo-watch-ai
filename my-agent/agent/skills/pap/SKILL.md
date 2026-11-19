---
description: Fetch listings from pap.fr (particulier à particulier) by browsing it. Use for the source "pap".
---

PAP has no API and sits behind Cloudflare: use the `browser_*` tools, with `session: "pap"`. Verified working.

## 1. Resolve the location

`browser_goto` on `https://www.pap.fr/json/ac-geo?q=<city>`: JSON text like `[{"id":43627,"name":"Lille (59)"}]`.
The `id` goes in the URL as `g<id>` (Lille = `g43627`). Pick the entry whose name matches the location.

## 2. Open the results

`https://www.pap.fr/annonce/<vente|location>-<appartements|maisons|appartements-maisons>-<city-slug>-<dept>-g<id>`
e.g. `https://www.pap.fr/annonce/vente-appartements-lille-59-g43627`. If the slug is wrong PAP redirects to a
wrong city: check the title of the result. Filters such as `?prix-max=200000` may be ignored: read the prices and drop
yourself the ads above the budget (or click the filters in the page). Handle a cookie banner with `browser_click`.

## 3. Extract

`browser_eval` with:

```js
[...document.querySelectorAll('.search-list-item-alt')].map(c => ({
  href: c.querySelector('a[href*="/annonces/"]')?.href,
  text: c.innerText.replace(/\s+/g,' ').slice(0,300),
  img: c.querySelector('img')?.src }))
```

Text looks like `270.000 € Lille (59000) 3 pièces 2 chambres 62 m² <description>`. `externalId` = the `r<digits>` at the end of the href.
For more results, `browser_read` with `scroll: true` or click "Suivant", then eval again. Two pages are enough.
Verify the selector on the first run: if it returns nothing, inspect with `browser_read mode=html` and adapt.
