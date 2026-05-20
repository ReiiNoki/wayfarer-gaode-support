# 代码讲解版

这份文档用来解释 `wayfarer-gaode-map.user.js` 的主要逻辑。发布给用户安装时只需要 `.user.js` 文件；这份文档主要方便以后自己维护。

## 整体思路

脚本做了三件事：

1. 抓到 Wayfarer 页面里的 Google Maps 实例。
2. 往这个 Google Maps 实例里注册两个新的地图类型：高德、高德卫星。
3. 接管左下角地图类型按钮，让用户可以在 `预设 / 卫星 / 高德 / 高德卫星` 之间切换。

比较关键的一点是：脚本没有重写 Wayfarer 的地图，也没有自己重新画 POI。它只是把 Google Maps 原本支持的 `mapTypes` 扩展了一下，所以 Wayfarer 自己的点位、点击、缩放、详情面板还能继续工作。

## 脚本头

```js
// ==UserScript==
// @name         Wayfarer Gaode Map Layer
// @match        https://wayfarer.nianticlabs.com/new/mapview*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==
```

这里是用户脚本管理器读取的元信息。

- `@match`：决定脚本在哪些页面运行。
- `@run-at document-start`：尽量早运行，因为我们要赶在 Wayfarer 初始化地图前安装 hook。
- `@grant unsafeWindow`：让脚本能访问页面真实的 `window`，这对 hook Google Maps 很重要。

## 基础常量

```js
const TILE_SIZE = 256;

const MAPTYPE_GAODE = 'wayfarer_gaode_road';
const MAPTYPE_GAODE_SAT = 'wayfarer_gaode_sat';
const MAPTYPE_GOOGLE = 'roadmap';
const MAPTYPE_GOOGLE_SAT = 'satellite';
```

Google Maps 的普通瓦片大小是 `256x256`。

后面四个常量就是地图类型 ID：

- `roadmap` 和 `satellite` 是 Google Maps 自带的。
- `wayfarer_gaode_road` 和 `wayfarer_gaode_sat` 是我们自己加进去的。

## 为什么要注入 page hook

用户脚本通常运行在一个“隔离环境”里。直接在脚本里改 `window.google.maps.Map`，有时改到的是脚本环境里的对象，不一定能影响页面真实运行的代码。

所以脚本用了：

```js
injectPageMapHook();
```

它会把 `pageMapHook` 这个函数注入到页面真实上下文里运行。

简单理解：  
我们不是站在 Tampermonkey 的房间里喊 Google Maps，而是走进 Wayfarer 页面自己的房间里装监听器。

## 如何抓 Google Maps 实例

Wayfarer 创建地图时，内部会用到 Google Maps API。我们需要拿到那个 `map` 对象，因为后面切换底图都要调用它：

```js
map.setMapTypeId(...)
map.mapTypes.set(...)
map.overlayMapTypes.push(...)
```

脚本用了几种方式抓它：

### 1. hook `google.maps.Map`

```js
const OriginalMap = maps.Map;

function WrappedMap(...args) {
  const instance = Reflect.construct(OriginalMap, args, new.target || OriginalMap);
  capture(instance);
  return instance;
}

maps.Map = WrappedMap;
```

这相当于把 Google Maps 的地图构造函数包了一层。  
以后页面执行 `new google.maps.Map(...)` 时，我们就能顺手拿到创建出来的地图实例。

### 2. hook `Map.prototype`

如果地图已经比我们更早创建了，第一种方式可能抓不到。于是脚本又 hook 了地图对象常用的方法：

```js
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
]
```

这些方法被调用时，`this` 就是地图实例。  
所以只要 Wayfarer 后续缩放、移动或设置地图，我们也能从 `this` 抓到 map。

### 3. hook `google.maps.Marker`

Wayfarer 创建 POI 标记时，通常会传入：

```js
new google.maps.Marker({ map: someMap, position: ... })
```

所以脚本还包了一层 `Marker` 构造函数，从参数里的 `map` 反向抓地图实例。

这就是为什么代码里有：

```js
maybeCaptureFromArgs(args);
```

## 高德瓦片 URL

普通高德地图：

```js
https://webrd0{server}.is.autonavi.com/appmaptile
```

高德卫星图：

```js
https://webst0{server}.is.autonavi.com/appmaptile?style=6
```

卫星图文字标注：

```js
https://webst0{server}.is.autonavi.com/appmaptile?style=8
```

代码里对应三个函数：

```js
gaodeRoadUrl()
gaodeSatUrl()
gaodeSatLabelUrl()
```

其中 `server` 是 1 到 4 之间的数字，用来分散瓦片请求。

## 为什么要做坐标偏移

Google Maps 和 Wayfarer 的经纬度一般按 WGS84 理解。  
高德地图在中国大陆使用 GCJ-02 坐标体系。

如果直接把高德瓦片塞进 Google Maps，POI 和底图会错开。

所以脚本里有：

```js
wgs84ToGcj02(lat, lng)
```

这段就是常见的 WGS84 到 GCJ-02 转换公式。

## 为什么修正的是“瓦片”，不是 POI

一开始试过移动 marker，但 Wayfarer 的 POI 不一定全部是 `google.maps.Marker`，也可能是 Overlay、DOM 或其他方式画出来的。

更稳定的做法是：  
不要动 Wayfarer 的点，改高德底图瓦片本身。

这样无论 Wayfarer 用什么方式画 POI，只要它在 Google Maps 坐标体系里，高德底图都会主动对齐过去。

关键函数是：

```js
tileOffset(coord, zoom)
```

它做的事情是：

1. 找到当前 Google 瓦片中心点。
2. 把这个中心点从 WGS84 转成 GCJ-02。
3. 再把转换后的经纬度换算回像素坐标。
4. 得到高德瓦片应该移动多少像素。

## 自定义瓦片怎么画

Google Maps 的自定义地图类型可以提供一个 `getTile()` 方法：

```js
getTile(coord, zoom, ownerDocument) {
  return createShiftedTile(coord, zoom, ownerDocument, urlForCoord);
}
```

`createShiftedTile()` 会创建一个 `256x256` 的 `div`，然后在里面放多张高德瓦片图片。

为什么不是只放一张？

因为坐标偏移后，当前 Google 瓦片可能会用到旁边高德瓦片的一部分。  
所以代码取了周围 `3x3` 的瓦片，再用 CSS 的 `left/top` 把它们摆到正确位置。

这就是这段循环：

```js
for (let dx = -1; dx <= 1; dx += 1) {
  for (let dy = -1; dy <= 1; dy += 1) {
    ...
  }
}
```

## 注册高德地图类型

```js
targetMap.mapTypes.set(MAPTYPE_GAODE, createGaodeMapType(...));
targetMap.mapTypes.set(MAPTYPE_GAODE_SAT, createGaodeMapType(...));
```

这相当于告诉 Google Maps：

现在除了 `roadmap` 和 `satellite`，你还认识 `wayfarer_gaode_road` 和 `wayfarer_gaode_sat`。

之后切换底图时只要：

```js
map.setMapTypeId(MAPTYPE_GAODE);
```

就能切到高德图层。

## 高德卫星为什么还要 overlay

高德卫星图分成两层：

- `style=6`：卫星影像
- `style=8`：道路和文字标注

所以切到高德卫星时，脚本先设置卫星底图：

```js
map.setMapTypeId(MAPTYPE_GAODE_SAT);
```

再把文字标注作为覆盖层加上去：

```js
map.overlayMapTypes.push(createGaodeMapType(...gaodeSatLabelUrl));
```

## 左下角四个按钮

Wayfarer 原本左下角只有：

```text
预设 / 卫星
```

脚本会找到这个容器：

```js
document.querySelector('.map-legend-maptype')
```

然后替换成四个按钮：

```text
预设 / 卫星 / 高德 / 高德卫星
```

点击按钮时调用：

```js
applyMode(button.dataset.mode);
```

`applyMode()` 负责真正切换地图类型。

## 为什么要用 MutationObserver

Wayfarer 是前端应用，页面组件可能会重新渲染。  
如果它把左下角按钮区域重画了一次，我们之前插进去的按钮就会消失。

所以脚本用了：

```js
new MutationObserver(...)
```

它会持续观察页面 DOM。如果发现按钮区域被重建，就重新安装四按钮控件。

## 运行顺序

大致流程是：

1. 脚本在 `document-start` 运行。
2. 注入 page hook，准备抓 Google Maps 实例。
3. 等页面 DOM 出现左下角地图类型控件。
4. 把控件替换成四个按钮。
5. 一旦抓到 map 实例，就注册高德地图类型。
6. 默认切到高德地图。
7. 用户点击按钮时，在 Google / 高德 / 卫星之间切换。

## 以后维护时最常改的地方

### 1. Greasy Fork / GitHub 链接

在脚本头里：

```js
// @homepageURL
// @supportURL
// @updateURL
// @downloadURL
```

### 2. Wayfarer 页面结构变化

如果左下角按钮不见了，优先检查：

```js
.map-legend-maptype
.map-legend-maptype-button
```

### 3. 高德瓦片接口变化

如果高德底图不加载，优先检查：

```js
gaodeRoadUrl()
gaodeSatUrl()
gaodeSatLabelUrl()
```

### 4. 坐标偏移不准

优先看：

```js
wgs84ToGcj02()
tileOffset()
createShiftedTile()
```

这三块决定高德瓦片如何对齐 Google/Wayfarer 的坐标体系。
