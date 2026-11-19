---
description: Fetch listings from bienici.com through its public JSON API. Use for the source "bienici".
---

Bien'ici exposes a JSON API that needs no key and is not blocked. Verified working.

## 1. Resolve each location to zone ids

`fetch_url` on `https://res.bienici.com/suggest.json?q=<city or postal code>` (URL-encoded).
Take `zoneIds[0]` of the best match (usually the first item, `type: "city"`). Collect one id per location.

## 2. Search

`fetch_url` on `https://www.bienici.com/realEstateAds.json?filters=<URL-encoded JSON>` with
`jsonPath: "realEstateAds"` and these `fields`:
`id, title, price, surfaceArea, roomsQuantity, bedroomsQuantity, propertyType, city, postalCode, description, photos, publicationDate`.

Filters JSON:

```json
{"size":50,"from":0,"filterType":"buy","propertyType":["flat","house"],
 "minPrice":0,"maxPrice":200000,"minArea":40,"minRooms":2,"minBedrooms":1,
 "zoneIdsByTypes":{"zoneIds":["-58404"]},"sortBy":"publicationDate","sortOrder":"desc","onTheMarket":[true]}
```

- `filterType`: `buy` or `rent`. `propertyType`: `flat`, `house`, `parking`, `loft`, `castle`... Omit unused filters.
- One page of 50 is enough; this runs often and only new ads matter.

## 3. Map to `save_listings`

| save_listings | Bien'ici |
|---|---|
| title | `title` (often empty: build one like "T3 75 m² Lille") |
| externalId | `id` |
| url | `https://www.bienici.com/annonce/<id>` |
| price, surface, rooms, bedrooms | `price`, `surfaceArea`, `roomsQuantity`, `bedroomsQuantity` |
| imageUrl | `photos[0].url_photo` (or `photos[0].photo`) |
| publishedAt | `publicationDate` |
