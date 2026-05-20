# Wayfarer Gaode Map Layer

给国内 Pokémon GO 玩家看 Wayfarer 地图用的小脚本。

Wayfarer 地图页默认用 Google 地图。在国内看候选点、周边道路、卫星图的时候，有时候不太顺手。这个脚本会给地图加上高德地图和高德卫星图，并顺手处理中国大陆地区常见的坐标偏移问题，让 POI 和底图更容易对上。

它只换底图，不会改你的提名、审核、POI 数据，也不会影响游戏结果。

## 安装

推荐从 Greasy Fork 安装：

```text
https://greasyfork.org/zh-CN/scripts/替换为发布后的脚本ID-wayfarer-gaode-map-layer
```

需要先装一个用户脚本管理器，比如：

- [Tampermonkey](https://www.tampermonkey.net/)
- [Violentmonkey](https://violentmonkey.github.io/)

## 怎么用

装好后打开 Wayfarer 地图页：

```text
https://wayfarer.nianticlabs.com/new/mapview
```

左下角会多出一组地图按钮：

```text
预设 / 卫星 / 高德 / 高德卫星
```

想看国内地图就点 `高德`，想看卫星图就点 `高德卫星`。需要切回原来的 Google 图层时，点 `预设` 或 `卫星` 就行。

## 小提醒

- 这不是 Niantic、Google 或高德的官方插件。
- 主要是为中国大陆地区看 Wayfarer 地图准备的。
- 如果 Wayfarer 以后改版，脚本可能也要跟着修。
- 高德瓦片来自高德/AMap，能不能稳定访问取决于它们自己的服务。

## 许可证

MIT
