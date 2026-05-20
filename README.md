# Wayfarer Gaode Map Layer

一个给 [Niantic Wayfarer](https://wayfarer.nianticlabs.com/) 使用的篡改猴脚本，用高德地图/高德卫星图替换 Wayfarer 地图页里的底图，并对中国大陆地区的 GCJ-02 坐标偏移做了瓦片层校正。

脚本不会重写 Wayfarer 的 POI、交互和详情面板，而是保留原本的 Google Maps 实例，只额外加入高德底图图层。

## 功能

- 在 Wayfarer 地图页添加高德地图底图。
- 添加高德卫星图底图。
- 对高德瓦片做 WGS84/GCJ-02 偏移校正，让 Wayfarer 的 POI 和中国大陆地图内容更好对齐。
- 把原来的地图类型按钮替换成四个选项：
  - 预设
  - 卫星
  - 高德
  - 高德卫星

## 安装

先安装一个用户脚本管理器：

- [Tampermonkey](https://www.tampermonkey.net/)
- [Violentmonkey](https://violentmonkey.github.io/)

然后打开下面的安装链接：

```text
https://github.com/ReiiNoki/wayfarer-gaode-map-layer/raw/main/wayfarer-gaode-map.user.js
```

如果脚本管理器没有自动弹出安装页面，也可以手动新建脚本，然后复制 `wayfarer-gaode-map.user.js` 的内容进去。

## 适用页面

```text
https://wayfarer.nianticlabs.com/new/mapview*
https://wayfarer.nianticlabs.com/new/*
```

## 使用方法

安装脚本后打开 Wayfarer 地图页。左下角地图图例区域会出现四个地图类型按钮：

```text
预设 / 卫星 / 高德 / 高德卫星
```

选择 `高德` 或 `高德卫星` 即可切换到高德底图；选择 `预设` 或 `卫星` 可以切回 Wayfarer 原本的 Google 地图图层。

## 已知限制

- 这不是 Niantic、Google 或高德/AMap 的官方插件。
- 脚本依赖 Wayfarer 当前的前端结构和 Google Maps 接入方式。如果 Wayfarer 更新页面实现，脚本可能需要跟着维护。
- 高德瓦片服务由高德/AMap 提供，可用性和访问限制取决于对应服务。
- 坐标偏移校正主要面向中国大陆地区。中国大陆以外区域会使用未偏移的瓦片。

## 开发

项目结构很简单：

```text
wayfarer-gaode-map.user.js
README.md
LICENSE
```

语法检查：

```bash
node --check wayfarer-gaode-map.user.js
```

## 许可证

MIT
