# Voice Filter Tab 交互优化

交付对照：`delivery/02-ve-tab/index.html`  
Figma：Voice Filter · VE-Tab `24346:30253` · Filter List `24346:30262`  
画板：375 × 812

本文只写动效与跟手规则。视觉尺寸以稿和 HTML 为准。

---

## 1. 全局参数

Tab 与 Filter **共用**下面这套参数，原生侧不要拆成两套 ease。

| 项 | 值 |
|---|---|
| 时长 | **560ms** |
| 曲线 | **`cubic-bezier(0.25, 0.72, 0.22, 1)`** |
| 用途 | Tab 切换、文案展开/收起、灰底平移改宽、Filter 松手吸附、`--k` 过渡 |

拖拽过程中 Filter **没有**过渡：位移和大小都跟手，松手后才用上面这套参数吸附。

Toast **不走 560ms**，见 §5。

---

## 2. VE-Tab

### 2.1 结构

- 容器：335 × 36，圆角胶囊，内边距 **3px**，内容区宽 **329px**
- 项高 **30px**，间距 **4px**
- 未选中：宽 **40px**，左右 padding **8px**，图标 `#808080`
- 选中 pill：`#3d3d3d`，左右 padding **12px**，图标+文案白色、水平居中
- 选中宽度：**hug 文案**，夹在 **min 110 / max 140**
- 文案：Nunito Bold 16 / 行高 130% / tracking 1%（日文 tracking 0，Noto Sans JP）
- 图标与文案间距：选中时 **6px**（随展开动画出现）

### 2.2 同时发生的动画

点击 Tab（或 Filter 拖进另一分组）时，下列属性 **同时** 走 560ms + 上述曲线：

| 元素 | 属性 | 未选中 → 选中 |
|---|---|---|
| 灰色 pill | `x` + `width` | 跟到目标项的 hug 框 |
| 整行 | `translateX` | 仅当选中项（或倒数第二 + 最后一项）会被裁切时平移 |
| 目标项 | 文案轨道 `0fr → 1fr`、`margin-left 0 → 6`、`opacity 0 → 1` | 展开 |
| 离开项 | 反向 | 收起 |
| 项 | `padding 8 ↔ 12`、`min-width 40 ↔ 110` | |
| 图标 / 文案 | 颜色 `#808080` ↔ `#fff` | |

实现注意：

- 文案宽度必须用可插值轨道（`0fr ↔ 1fr`）。`max-content` 多数引擎插不了，会看起来像瞬切。
- 先打开过渡，再切选中态；否则文案会跳。
- 连点时，灰底从 **当前在播的位置和宽度** 接到新目标，不要跳回起点。

### 2.3 行平移规则

默认左对齐，不要为了填空把最后一项顶到右边。

1. 选中项必须完整露在 329 内容区内。
2. 选中 **倒数第二个** 时，尽量把最后一个未选中 Tab（40px + 4px gap）也露出来。
3. 两者不能同时放下时，优先保住当前选中 pill。

### 2.4 多语言宽度

pill 宽度按 **当前语言** 的图标 + 文案 hug，再夹 110–140。

不要沿用英文宽度去撑日文短标签。西语长词（如 Tendencias）可以长到约 135，仍不超过 140。

无 Recents 内容时，Recents Tab **仍占位、不可选**。点击只出 Toast（§5），不要播 Tab / Filter 切换。

---

## 3. Filter List

### 3.1 尺寸

| 状态 | 按钮 | 内圆 | 表情字号 | 透明度 | 内边距 |
|---|---|---|---|---|---|
| 未选中 `k=0` | 60 × 60 | 48 | 24 | 0.5 | 6 |
| 选中 `k=1` | 116 × 116 | 100 | 32 | 1 | 0 |

标签：未选中在按钮上方（`top: -58`），选中下移到 `top: -30` 并带 `#3d3d3d` 底。

列表可视宽 **375**。选中项视觉中心对齐屏幕水平中心。

无分割槽时，相邻 snap 在位移上相距 **60px**（未选中槽宽）。有分割槽时，跨过该槽的相邻两项相距 **120px**（60 item + 60 槽）。

### 3.2 分割槽（只改几何，无自身动画）

分割槽占位 **60 × 60**，插在 Filter **分组之间**，不计入 `index` / `N`。线本身不跟手、不缓动。

三种摆法（交付默认：**Recents 后**）：

| 模式 | 插槽位置 |
|---|---|
| 无 | 不插 |
| Recents 后 | 仅 Recents 组最后一项之后（无 Recents 内容时不插） |
| 各组之间 | 每个 Tab 组之后都插，**最后一组除外** |

`p`、吸附、跟手都必须按插槽后的 anchor 算，不能再假设格距恒为 60。

### 3.3 拖拽中（跟手，无缓动）

第 `index` 项的中心 anchor：

```
anchor(index) = index * 60 + 58 + slickWidthBefore(index)
```

`58` = 116/2。`slickWidthBefore` = 该 index **之前** 的分割槽个数 × 60。

屏幕中心 `focus = 187.5 - translateX`（`187.5` = 375/2）。在相邻 anchor 之间线性插 `p`：

```
若 focus <= anchor(0)           → p = 0
若 focus >= anchor(N-1)         → p = N-1
若 anchor(i) <= focus <= anchor(i+1)
  → p = i + (focus - anchor(i)) / (anchor(i+1) - anchor(i))
```

无分割槽时，格距为 60，上式等价于：

```
p = (187.5 - 58 - translateX) / 60
```

令 `i = floor(p)`，`t = p - i`：

- 第 `i` 项：`k = 1 - t`（缩小）
- 第 `i+1` 项：`k = t`（放大）
- 其余：`k = 0`

**拖过一格的多少，大小就变多少。** 不要等松手才改尺寸。跨分割槽时，「一格」是 120px，`k` 摊在这段位移上。

由 `k` 线性插值：

```
width/height     = 60 + 56k
dot              = 48 + 52k
emoji            = 24 + 8k
opacity          = 0.5 + 0.5k
padding          = 6 × (1-k)
tag.top          = -58 + 28k
```

轨道 `translateX` 与手指 1:1（端点外橡胶系数 **0.32**）。

拖过分组边界时，上方 Tab 同步切换（同一套 560ms 动画）。

### 3.4 松手吸附

1. 用松手时位移 + 速度估算：`projectedX = x + v * 160`（`v` 单位 px/ms）。
2. `index = round(p(projectedX))`，夹在合法范围。这里的 `p` 必须用 §3.3 的 anchor，不能用匀速 `/60`。
3. 轨道吸附到该 index 的 snap 点（`translateX = 187.5 - anchor(index)`）；该项 `k → 1`，其余 `k → 0`。
4. 时长 560ms，曲线与 Tab 相同。

点击 Tab：Filter 吸附到该分组内 **上次停留** 的项（默认分组第一项），同样带动画。不可选的 Recents 不走这条。

---

## 4. Tab ↔ Filter 对应

一条连续列表，不是每个 Tab 一份独立数据。

有 Recents 内容时：

| Tab | Filter index |
|---|---|
| Recents | 0–2 |
| Trending | 3–5 |
| Singing | 6–7 |
| Roles | 8–10 |
| Effects | 11–12 |
| Languages | 13–15 |

无 Recents 内容时：Recents 组从列表拿掉，后面分组 index 整体 **-3**。Recents Tab 仍在且不可选，默认落在 Trending。

| Tab | Filter index |
|---|---|
| Recents | （无，不可选） |
| Trending | 0–2 |
| Singing | 3–4 |
| Roles | 5–7 |
| Effects | 8–9 |
| Languages | 10–12 |

---

## 5. Toast（无 Recents 内容）

点击不可选的 Recents Tab 时出现。位置：375 × 812 画板正中。

| 项 | 值 |
|---|---|
| 时长 | **220ms** |
| 曲线 | 与全局相同 `cubic-bezier(0.25, 0.72, 0.22, 1)` |
| 停留 | 约 **2.2s** 后自动消失 |

| 状态 | 变化 |
|---|---|
| 出现 | `opacity 0 → 1`，从中心下方 **8px** 回到正中 |
| 消失 | 反向 |

不要用 560ms，也不要带动 Tab / Filter。

---

## 6. 原生实现要点

- Tab 灰底与文案展开必须同一拍；不要 pill 在动、字已经切完。
- Filter 拖拽用 `k`（或等价 scale）驱动尺寸，**关闭** size 过渡；松手再打开。
- 相邻两项可以同时处于中间尺寸（一个缩、一个长）。
- 两端橡胶只作用在位移上，`p` 仍夹在 `[0, N-1]`，避免第一/最后一项被拖瘦。
- 分割槽计入 anchor，不计入 `N`；跨槽时格距是 120，不是 60。
- 预览页 `prototypes/ve_tab.html` 已内嵌 buz iconfont；Nunito / Noto Sans JP 走 Google Fonts。

---

## 7. 预览

打开 `prototypes/ve_tab.html`。左侧胶囊可切 EN / ES / 日本語，用来核对不同文案长度下的 pill hug 与动画。
