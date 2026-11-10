# Mobile destination globe

- Land geometry: Natural Earth 1:110m land, public domain. Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson (retrieved 10 November 2026). Feature properties removed; geometry retained.
- Projection: D3 Geo 3.1.1, ISC, https://github.com/d3/d3-geo; D3 Array 3.2.4, ISC, https://github.com/d3/d3-array. Vendored distributions retain their author headers. See adjacent license files.
- Destination points are approximate country centres, not departure locations or border claims. Journeys come from the existing local catalogue, with the existing destination URLs retained where no local itinerary exists.
- Loaded on mobile only. The original directory remains the fallback if loading fails.
