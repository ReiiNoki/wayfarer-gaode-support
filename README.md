# Wayfarer Gaode Map Layer

给国内 Pokémon GO 训练家准备的 Wayfarer 地图小帮手。

Wayfarer 默认用 Google 地图。在国内看候选点、补给站周边、道路和卫星图时，经常会有点“不在一个频道上”的感觉。这个脚本会给 Wayfarer 地图加上高德地图和高德卫星图，并处理中国大陆地区常见的坐标偏移，让 POI 和底图更容易对上。

简单说：看点、看路、看卫星图，少一点猜，多一点准。

## 安装

推荐从 Greasy Fork 安装：

```text
https://greasyfork.org/zh-CN/scripts/替换为发布后的脚本ID-wayfarer-gaode-map-layer
```

安装前需要先有一个用户脚本管理器：

- [Tampermonkey](https://www.tampermonkey.net/)
- [Violentmonkey](https://violentmonkey.github.io/)

## 使用

装好脚本后，打开 Wayfarer 地图页：

```text
https://wayfarer.nianticlabs.com/new/mapview
```

左下角会出现四个地图选项：

```text
预设 / 卫星 / 高德 / 高德卫星
```

想看国内常用地图，点 `高德`。

想看候选点周边环境，点 `高德卫星`。

想切回原来的 Google 图层，点 `预设` 或 `卫星`。

## 小提醒

- 这个脚本只换底图，不会修改提名、审核、POI 数据，也不会影响游戏结果。
- 这不是 Niantic、Google 或高德的官方插件。
- 如果 Wayfarer 页面以后改版，脚本可能也要跟着升级。
- 高德瓦片来自高德/AMap，能否稳定访问取决于对应服务。

## 许可证

MIT
