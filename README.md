# Niantic Wayfarer 高德地图支持插件

使中国内地的Pokémon GO（宝可梦 GO）玩家更加便利，支持高德地图的 Niantic Wayfarer。

去年 Niantic 旗下的自有IP游戏 Ingress 和其他第三方IP游戏 Pokémon GO 等分家为北美猩猩和中东猩猩。原来的 Portal（能量塔）/ PokéStop（宝可补给站）申请平台Niantic Wayfarer 也分给了中东猩猩，现在成为了宝可补给站专属的申请平台。中东猩猩为了方便非 Ingress 玩家的补给站申请，将缺席多年的补给站地图上线了。

通过这个补给站地图，我们可以概览一个地区的补给站分布。虽然中国内地绝大部分地区都属于不可玩的状态，但是也有一小部分的漏网之鱼。

因为谷歌地图在内地已经不再更新，地图数据和坐标信息不准确，得以使我产生了开发这个插件的想法。

这个插件给 Niantic Wayfarer 补给站地图加上了高德地图层支持，并且做了坐标修正，可以使内地还坚持游玩的玩家更加便利。

## 安装

从 Greasy Fork 安装：

[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-安装脚本-670000?logo=greasyfork&logoColor=white)](https://greasyfork.org/zh-CN/scripts/579012-ninatic-wayfarer-%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%94%AF%E6%8C%81%E6%8F%92%E4%BB%B6)

需要先安装用户脚本管理器，比如：

[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-安装脚本管理器-00485B?logo=tampermonkey&logoColor=white)](https://www.tampermonkey.net/)
[![Violentmonkey](https://img.shields.io/badge/Violentmonkey-安装脚本管理器-2C7BE5?logo=violentmonkey&logoColor=white)](https://violentmonkey.github.io/)

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
- `预设` / `卫星`：切回 Wayfarer 原来的 Google 街道或卫星图层。

## 对比

![高德谷歌街道对比](https://reiinoki.github.io/ingress/2026-05-23/vsroad.png)

高德街道 vs 谷歌街道

![高德谷歌卫星对比](https://reiinoki.github.io/ingress/2026-05-23/vssat.png)

高德卫星 vs 谷歌卫星

## 感谢

感谢田尻智和您一手创办的 GAME FREAK，将宝可梦这个伟大的系列带给我们。

感谢任天堂，任天堂是世界的主宰！

感谢原 Niantic Lab 参与到宝可梦 GO游戏开发和运营的成员们。

## 其他

本插件由Codex协助的Vibe Coding完成。


