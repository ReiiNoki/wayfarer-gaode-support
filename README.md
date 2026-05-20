# Wayfarer Gaode Map Layer

A Tampermonkey userscript that adds GCJ-02 corrected Gaode/AMap base layers to the Niantic Wayfarer map view.

The script keeps Wayfarer's original Google Maps instance and adds two extra map types:

- Gaode
- Gaode Satellite

It also replaces the map type control with a four-button group:

- Default
- Satellite
- Gaode
- Gaode Satellite

## Install

Install a userscript manager first:

- [Tampermonkey](https://www.tampermonkey.net/)
- [Violentmonkey](https://violentmonkey.github.io/)

Then install the script from GitHub:

```text
https://github.com/ReiiNoki/wayfarer-gaode-map-layer/raw/main/wayfarer-gaode-map.user.js
```

If the userscript manager does not open the install page automatically, create a new userscript manually and paste the contents of `wayfarer-gaode-map.user.js`.

## Supported Site

```text
https://wayfarer.nianticlabs.com/new/mapview*
https://wayfarer.nianticlabs.com/new/*
```

## What It Does

- Captures the Google Maps instance used by Wayfarer.
- Registers custom Gaode road and satellite map types.
- Applies WGS84 to GCJ-02 tile alignment so Wayfarer POIs line up with Gaode map imagery in mainland China.
- Adds Gaode map buttons into Wayfarer's existing map legend control.
- Leaves Wayfarer's POI markers and interaction model intact.

## Known Limitations

- This is not an official Niantic, Google, or Gaode/AMap project.
- The script depends on Wayfarer's current page structure and Google Maps usage. It may need updates if Wayfarer changes its frontend.
- Gaode tile availability and access are controlled by Gaode/AMap.
- The GCJ-02 correction is intended for mainland China map alignment. Areas outside China fall back to unshifted tiles.

## Development

This repository is intentionally small:

```text
wayfarer-gaode-map.user.js
README.md
LICENSE
```

For a quick syntax check:

```bash
node --check wayfarer-gaode-map.user.js
```

## License

MIT
