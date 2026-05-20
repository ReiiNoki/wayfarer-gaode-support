# Wayfarer Gaode Map Layer

给国内 Pokémon GO 玩家使用 Wayfarer 地图时准备的地图增强脚本。

Niantic Wayfarer 的地图页默认使用 Google 地图。在国内查看候选点、周边环境和卫星图时，Google 底图有时不够方便，也容易和本地常用地图产生坐标观感差异。这个脚本会在 Wayfarer 地图页加入高德地图和高德卫星图，并对中国大陆地区的坐标偏移做瓦片层校正，让 POI 和底图更容易对照。

脚本只替换底图，不会修改 Wayfarer 的提名、审核、POI 数据或游戏内结果。

## 安装

推荐通过 Greasy Fork 安装：

```text
https://greasyfork.org/zh-CN/scripts/替换为发布后的脚本ID-wayfarer-gaode-map-layer
```

安装前需要先安装一个用户脚本管理器，例如：

- [Tampermonkey](https://www.tampermonkey.net/)
- [Violentmonkey](https://violentmonkey.github.io/)

## 使用

安装后打开 Wayfarer 地图页：

```text
https://wayfarer.nianticlabs.com/new/mapview
```

左下角地图类型按钮会变成：

```text
预设 / 卫星 / 高德 / 高德卫星
```

选择 `高德` 或 `高德卫星` 即可切换到底图；选择 `预设` 或 `卫星` 可以切回 Wayfarer 原本的 Google 图层。

## 说明

- 这个脚本不是 Niantic、Google 或高德/AMap 的官方插件。
- 主要面向中国大陆地区 Pokémon GO 玩家查看 Wayfarer 地图时的体验。
- 脚本依赖 Wayfarer 当前页面结构。如果 Niantic 更新前端，脚本可能需要维护。
- 高德瓦片服务由高德/AMap 提供，可用性取决于对应服务。

## 许可证

MIT
