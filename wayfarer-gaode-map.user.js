// ==UserScript==
// @name         Wayfarer Gaode Map Layer
// @namespace    https://wayfarer.nianticlabs.com/
// @version      0.5.0
// @description  Add GCJ-02 corrected Gaode/AMap base layers to Niantic Wayfarer.
// @author       ReiiNoki
// @license      MIT
// @homepageURL  https://github.com/ReiiNoki/wayfarer-gaode-map-layer
// @supportURL   https://github.com/ReiiNoki/wayfarer-gaode-map-layer/issues
// @updateURL    https://github.com/ReiiNoki/wayfarer-gaode-map-layer/raw/main/wayfarer-gaode-map.user.js
// @downloadURL  https://github.com/ReiiNoki/wayfarer-gaode-map-layer/raw/main/wayfarer-gaode-map.user.js
// @match        https://wayfarer.nianticlabs.com/new/mapview*
// @match        https://wayfarer.nianticlabs.com/new/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict';

  const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const LOG_PREFIX = '[Wayfarer Gaode]';
  const TILE_SIZE = 256;

  const MAPTYPE_GAODE = 'wayfarer_gaode_road';
  const MAPTYPE_GAODE_SAT = 'wayfarer_gaode_sat';
  const MAPTYPE_GOOGLE = 'roadmap';
  const MAPTYPE_GOOGLE_SAT = 'satellite';

  let map = null;
  let currentMode = MAPTYPE_GAODE;
  let controlEl = null;
  let controlObserver = null;

  injectPageMapHook();

  function log(...args) {
    console.log(LOG_PREFIX, ...args);
  }

  function warn(...args) {
    console.warn(LOG_PREFIX, ...args);
  }

  function injectPageMapHook() {
    if (win.__wayfarerGaodePageHookInstalled) return;

    const source = `(${pageMapHook.toString()})();`;
    try {
      win.eval(source);
      return;
    } catch (_) {
      // Some userscript managers disallow unsafeWindow.eval; script injection runs
      // the hook in the page realm where Google Maps constructors live.
    }

    const script = document.createElement('script');
    script.textContent = source;
    (document.documentElement || document.head).appendChild(script);
    script.remove();
  }

  function pageMapHook() {
    const LOG_PREFIX = '[Wayfarer Gaode/Page]';
    let mapCtorHooked = false;
    let markerCtorHooked = false;
    let prototypeHooked = false;
    let mapsWatcherInstalled = false;
    let mapCtorWatcherInstalled = false;

    window.__wayfarerGaodePageHookInstalled = true;

    function log(...args) {
      console.log(LOG_PREFIX, ...args);
    }

    function capture(candidate) {
      if (!candidate || !candidate.mapTypes || typeof candidate.setMapTypeId !== 'function') return;
      window.__wayfarerGaodeMap = candidate;
      log('captured Google map instance:', candidate);
      window.dispatchEvent(new CustomEvent('wayfarer-gaode-map-captured'));
    }

    function maybeCaptureFromArgs(args) {
      for (const arg of args) {
        if (arg && arg.map) capture(arg.map);
        if (arg && typeof arg.getMap === 'function') capture(arg.getMap());
      }
    }

    function hookMapPrototype() {
      const proto = window.google && window.google.maps && window.google.maps.Map && window.google.maps.Map.prototype;
      if (prototypeHooked || !proto) return;
      prototypeHooked = true;

      [
        'addListener',
        'fitBounds',
        'getCenter',
        'getZoom',
        'panTo',
        'setCenter',
        'setMapTypeId',
        'setOptions',
        'setZoom',
      ].forEach((name) => {
        const original = proto[name];
        if (typeof original !== 'function') return;
        proto[name] = function (...args) {
          capture(this);
          return original.apply(this, args);
        };
      });
    }

    function hookMapConstructor() {
      const maps = window.google && window.google.maps;
      if (mapCtorHooked || !maps || !maps.Map || !maps.Map.prototype) return false;

      const OriginalMap = maps.Map;
      function WrappedMap(...args) {
        const instance = Reflect.construct(OriginalMap, args, new.target || OriginalMap);
        capture(instance);
        return instance;
      }

      Object.setPrototypeOf(WrappedMap, OriginalMap);
      WrappedMap.prototype = OriginalMap.prototype;
      maps.Map = WrappedMap;
      mapCtorHooked = true;
      hookMapPrototype();
      log('Google Maps constructor hooked.');
      return true;
    }

    function hookMarkerConstructor() {
      const maps = window.google && window.google.maps;
      if (markerCtorHooked || !maps || typeof maps.Marker !== 'function') return;

      const OriginalMarker = maps.Marker;
      function WrappedMarker(...args) {
        maybeCaptureFromArgs(args);
        const marker = Reflect.construct(OriginalMarker, args, new.target || OriginalMarker);
        if (marker && typeof marker.getMap === 'function') capture(marker.getMap());
        return marker;
      }

      Object.setPrototypeOf(WrappedMarker, OriginalMarker);
      WrappedMarker.prototype = OriginalMarker.prototype;
      maps.Marker = WrappedMarker;
      markerCtorHooked = true;
      log('Google Maps Marker constructor hooked.');
    }

    function installMapCtorWatcher(mapsObj) {
      if (mapCtorWatcherInstalled || !mapsObj || typeof mapsObj !== 'object') return;
      mapCtorWatcherInstalled = true;

      let mapCtorValue = mapsObj.Map;
      Object.defineProperty(mapsObj, 'Map', {
        configurable: true,
        enumerable: true,
        get() {
          return mapCtorValue;
        },
        set(value) {
          mapCtorValue = value;
          scheduleHooks();
        },
      });

      scheduleHooks();
    }

    function installMapsWatcher(googleObj) {
      if (mapsWatcherInstalled || !googleObj || typeof googleObj !== 'object') return;
      mapsWatcherInstalled = true;

      let mapsValue = googleObj.maps;
      Object.defineProperty(googleObj, 'maps', {
        configurable: true,
        enumerable: true,
        get() {
          return mapsValue;
        },
        set(value) {
          mapsValue = value;
          installMapCtorWatcher(value);
          scheduleHooks();
        },
      });

      installMapCtorWatcher(mapsValue);
      scheduleHooks();
    }

    function scheduleHooks() {
      setTimeout(() => {
        hookMapConstructor();
        hookMapPrototype();
        hookMarkerConstructor();
      }, 0);
    }

    function installGoogleWatcher() {
      let googleValue = window.google;

      try {
        Object.defineProperty(window, 'google', {
          configurable: true,
          get() {
            return googleValue;
          },
          set(value) {
            googleValue = value;
            installMapsWatcher(value);
            scheduleHooks();
          },
        });
      } catch (error) {
        console.warn(LOG_PREFIX, 'Could not install google watcher:', error);
      }

      installMapsWatcher(googleValue);

      const startedAt = Date.now();
      const timer = setInterval(() => {
        scheduleHooks();
        if (mapCtorHooked && prototypeHooked) clearInterval(timer);
        if (Date.now() - startedAt > 30000) clearInterval(timer);
      }, 50);
    }

    installGoogleWatcher();
  }

  function wrapTileX(x, zoom) {
    const tileCount = 1 << zoom;
    return ((x % tileCount) + tileCount) % tileCount;
  }

  function isValidTileY(y, zoom) {
    const tileCount = 1 << zoom;
    return y >= 0 && y < tileCount;
  }

  function gaodeRoadUrl(coord, zoom) {
    if (!isValidTileY(coord.y, zoom)) return '';
    const x = wrapTileX(coord.x, zoom);
    const server = ((x + coord.y) % 4) + 1;
    return `https://webrd0${server}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${coord.y}&z=${zoom}`;
  }

  function gaodeSatUrl(coord, zoom) {
    if (!isValidTileY(coord.y, zoom)) return '';
    const x = wrapTileX(coord.x, zoom);
    const server = ((x + coord.y) % 4) + 1;
    return `https://webst0${server}.is.autonavi.com/appmaptile?style=6&x=${x}&y=${coord.y}&z=${zoom}`;
  }

  function gaodeSatLabelUrl(coord, zoom) {
    if (!isValidTileY(coord.y, zoom)) return '';
    const x = wrapTileX(coord.x, zoom);
    const server = ((x + coord.y) % 4) + 1;
    return `https://webst0${server}.is.autonavi.com/appmaptile?style=8&x=${x}&y=${coord.y}&z=${zoom}`;
  }

  function outOfChina(lat, lng) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }

  function transformLat(x, y) {
    let ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    ret += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
    ret += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
    return ret;
  }

  function transformLng(x, y) {
    let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    ret += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
    ret += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
    return ret;
  }

  function wgs84ToGcj02(lat, lng) {
    if (outOfChina(lat, lng)) return { lat, lng };

    const a = 6378245.0;
    const ee = 0.00669342162296594323;
    let dLat = transformLat(lng - 105, lat - 35);
    let dLng = transformLng(lng - 105, lat - 35);
    const radLat = lat / 180 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    return { lat: lat + dLat, lng: lng + dLng };
  }

  function pixelToLatLng(x, y, zoom) {
    const scale = TILE_SIZE * (1 << zoom);
    const lng = x / scale * 360 - 180;
    const n = Math.PI - 2 * Math.PI * y / scale;
    const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return { lat, lng };
  }

  function latLngToPixel(lat, lng, zoom) {
    const scale = TILE_SIZE * (1 << zoom);
    const sinLat = Math.sin(lat * Math.PI / 180);
    const boundedSinLat = Math.min(Math.max(sinLat, -0.9999), 0.9999);
    return {
      x: (lng + 180) / 360 * scale,
      y: (0.5 - Math.log((1 + boundedSinLat) / (1 - boundedSinLat)) / (4 * Math.PI)) * scale,
    };
  }

  function tileOffset(coord, zoom) {
    const originX = wrapTileX(coord.x, zoom) * TILE_SIZE;
    const originY = coord.y * TILE_SIZE;
    const centerX = originX + TILE_SIZE / 2;
    const centerY = originY + TILE_SIZE / 2;
    const center = pixelToLatLng(centerX, centerY, zoom);

    if (outOfChina(center.lat, center.lng)) return { x: 0, y: 0 };

    const gcj = wgs84ToGcj02(center.lat, center.lng);
    const gcjPixel = latLngToPixel(gcj.lat, gcj.lng, zoom);
    return {
      x: gcjPixel.x - centerX,
      y: gcjPixel.y - centerY,
    };
  }

  function createShiftedTile(coord, zoom, ownerDocument, urlForCoord) {
    const doc = ownerDocument || document;
    const tile = doc.createElement('div');
    tile.style.cssText = `width:${TILE_SIZE}px;height:${TILE_SIZE}px;overflow:hidden;position:relative;background:#f3f1ec;`;

    if (!isValidTileY(coord.y, zoom)) return tile;

    const originX = wrapTileX(coord.x, zoom) * TILE_SIZE;
    const originY = coord.y * TILE_SIZE;
    const offset = tileOffset(coord, zoom);
    const sourceOriginX = originX + offset.x;
    const sourceOriginY = originY + offset.y;
    const startTileX = Math.floor(sourceOriginX / TILE_SIZE);
    const startTileY = Math.floor(sourceOriginY / TILE_SIZE);

    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        const sourceCoord = { x: startTileX + dx, y: startTileY + dy };
        if (!isValidTileY(sourceCoord.y, zoom)) continue;

        const img = doc.createElement('img');
        img.draggable = false;
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        img.src = urlForCoord(sourceCoord, zoom);
        img.style.cssText = [
          'position:absolute',
          `width:${TILE_SIZE}px`,
          `height:${TILE_SIZE}px`,
          `left:${sourceCoord.x * TILE_SIZE - sourceOriginX}px`,
          `top:${sourceCoord.y * TILE_SIZE - sourceOriginY}px`,
          'user-select:none',
          'border:0',
        ].join(';');
        tile.appendChild(img);
      }
    }

    return tile;
  }

  function createGaodeMapType(name, alt, urlForCoord) {
    return {
      name,
      alt,
      tileSize: new win.google.maps.Size(TILE_SIZE, TILE_SIZE),
      minZoom: 3,
      maxZoom: 20,
      getTile(coord, zoom, ownerDocument) {
        return createShiftedTile(coord, zoom, ownerDocument, urlForCoord);
      },
      releaseTile(tile) {
        if (tile && tile.replaceChildren) tile.replaceChildren();
      },
    };
  }

  function ensureGaodeMapTypes(targetMap) {
    const maps = win.google && win.google.maps;
    if (!maps || !maps.Size || !targetMap || !targetMap.mapTypes) return false;

    if (!targetMap.mapTypes.get(MAPTYPE_GAODE)) {
      targetMap.mapTypes.set(MAPTYPE_GAODE, createGaodeMapType('Gaode', 'Gaode road map', gaodeRoadUrl));
    }
    if (!targetMap.mapTypes.get(MAPTYPE_GAODE_SAT)) {
      targetMap.mapTypes.set(MAPTYPE_GAODE_SAT, createGaodeMapType('Gaode Satellite', 'Gaode satellite imagery', gaodeSatUrl));
    }

    return true;
  }

  function applyMode(mode) {
    currentMode = mode;
    updateControl();

    if (!map && win.__wayfarerGaodeMap) captureMap(win.__wayfarerGaodeMap);
    if (!map) {
      warn('No Google map instance captured yet.');
      return;
    }
    if (!ensureGaodeMapTypes(map)) {
      warn('Google Maps is not ready yet.');
      return;
    }

    map.overlayMapTypes.clear();
    if (mode === MAPTYPE_GAODE_SAT) {
      map.setMapTypeId(MAPTYPE_GAODE_SAT);
      map.overlayMapTypes.push(createGaodeMapType('Gaode Labels', 'Gaode satellite labels', gaodeSatLabelUrl));
    } else {
      map.setMapTypeId(mode);
    }

    log('map type set:', mode);
  }

  function captureMap(candidate) {
    if (!candidate || !candidate.mapTypes || typeof candidate.setMapTypeId !== 'function') return;
    if (candidate === map) return;

    map = candidate;
    win.__wayfarerGaodeMap = candidate;
    log('using Google map instance:', candidate);
    setTimeout(() => applyMode(currentMode), 0);
  }

  function installControlStyle() {
    if (document.getElementById('wayfarer-gaode-maptype-style')) return;

    const style = document.createElement('style');
    style.id = 'wayfarer-gaode-maptype-style';
    style.textContent = `
      .map-legend-maptype {
        display: grid !important;
        grid-template-columns: repeat(4, max-content);
        gap: 0 !important;
        align-items: stretch;
        overflow: hidden;
        border: 1px solid #d6d6d6;
        border-radius: 6px;
        background: #fff;
      }
      .map-legend-maptype-button {
        min-width: 44px;
        height: 30px;
        margin: 0 !important;
        padding: 0 9px !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: #fff !important;
        color: #6b6870 !important;
        font: 13px/30px Arial, "Microsoft YaHei", sans-serif !important;
        white-space: nowrap !important;
        cursor: pointer;
        box-shadow: none !important;
      }
      .map-legend-maptype-button + .map-legend-maptype-button {
        border-left: 1px solid #e3e3e3 !important;
      }
      .map-legend-maptype-button.selected {
        background: #f1f1f1 !important;
        color: #181718 !important;
        font-weight: 600 !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  function createButton(label, mode) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.mode = mode;
    button.className = 'map-legend-maptype-button wayfarer-gaode-maptype-button';
    return button;
  }

  function installControlClickHandler(container) {
    if (container.__wayfarerGaodeClickHandlerInstalled) return;
    container.__wayfarerGaodeClickHandlerInstalled = true;

    container.addEventListener('click', (event) => {
      const button = event.target && event.target.closest
        ? event.target.closest('button.map-legend-maptype-button')
        : null;
      if (!button || !container.contains(button) || !button.dataset.mode) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      applyMode(button.dataset.mode);
    }, true);
  }

  function installMapTypeControl() {
    const container = document.querySelector('.map-legend-maptype');
    if (!container) return false;

    controlEl = container;
    installControlStyle();
    installControlClickHandler(container);

    if (container.querySelectorAll('.wayfarer-gaode-maptype-button').length !== 4) {
      container.replaceChildren(
        createButton('\u9884\u8bbe', MAPTYPE_GOOGLE),
        createButton('\u536b\u661f', MAPTYPE_GOOGLE_SAT),
        createButton('\u9ad8\u5fb7', MAPTYPE_GAODE),
        createButton('\u9ad8\u5fb7\u536b\u661f', MAPTYPE_GAODE_SAT),
      );
    }

    updateControl();
    return true;
  }

  function watchMapTypeControl() {
    installMapTypeControl();
    if (controlObserver) return;

    controlObserver = new MutationObserver(() => {
      const container = document.querySelector('.map-legend-maptype');
      if (
        container
        && (container !== controlEl || container.querySelectorAll('.wayfarer-gaode-maptype-button').length !== 4)
      ) {
        installMapTypeControl();
      }
    });

    controlObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  function updateControl() {
    if (!controlEl) return;
    controlEl.querySelectorAll('button.map-legend-maptype-button').forEach((button) => {
      button.classList.toggle('selected', button.dataset.mode === currentMode);
    });
  }

  win.addEventListener('wayfarer-gaode-map-captured', () => captureMap(win.__wayfarerGaodeMap));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchMapTypeControl, { once: true });
  } else {
    watchMapTypeControl();
  }
})();
