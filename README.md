# Wayfarer Gaode Map Layer

给国内 Pokémon GO 训练家的 Wayfarer 地图补丁。

打开 Wayfarer 看候选点时，如果 Google 底图看着不顺手、道路不好对、卫星图不够贴近国内常用地图，可以试试这个脚本。它会在 Wayfarer 的地图里加上 `高德` 和 `高德卫星` 两个底图，并处理中国大陆地区的坐标偏移。

一句话：在 Wayfarer 里，用更熟悉的地图看候选点。

## 安装

从 Greasy Fork 安装：

```text
https://greasyfork.org/zh-CN/scripts/替换为发布后的脚本ID-wayfarer-gaode-map-layer
```

需要先安装用户脚本管理器，比如 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。

## 用法

安装后打开：

```text
https://wayfarer.nianticlabs.com/new/mapview
```

地图左下角会出现四个按钮：

```text
预设 / 卫星 / 高德 / 高德卫星
```

- `高德`：看道路、位置和周边环境。
- `高德卫星`：看候选点附近的实际地貌。
- `预设` / `卫星`：切回 Wayfarer 原来的 Google 图层。

## 注意

- 只换地图底图，不改提名、审核、POI 数据，也不会影响游戏结果。
- 不是 Niantic、Google 或高德的官方插件。
- 如果 Wayfarer 页面改版，脚本可能需要更新。

## License

MIT
