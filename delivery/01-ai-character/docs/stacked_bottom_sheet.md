# 叠层 Bottom Sheet

交付对照：`delivery/01-ai-character/index.html`  
Figma：ALoHa · Edit Profile `1757:5184` · Card Top `1681:17469`  
画板：375 × 812

第二层 sheet 盖在第一层上面时，第一层是**同一张卡缩小、上推、被盖住**，不是换成一条空色块，也不是只把宽度挤窄。

---

## 1. 终态（第二层打开后）

画板顶安全区按 **44px** 计。

| 层 | 位置 / 尺寸 | 外观 |
|---|---|---|
| 背后遮罩 | 全屏 | `rgba(0, 0, 0, 0.7)`，第一层打开时就已经在 |
| 第一层 | 原 `top: 44`，再 `translateY(-10px) scale(335/375)`，`transform-origin: 50% 0` | 等比缩到宽 **335**；顶角 **20px**（比默认 30px **更小**，不是更圆）；底 `#141414` |
| 露出 | 第一层顶边到第二层顶边 | **10px**。点这条边关闭第二层 |
| 第二层 | `top: 44`，满宽 375，高 768 | 实色 `#1a1a1a`，顶角 **30px**，不透明、不模糊 |

视觉结果：第一层顶在大约 **y = 34**，第二层从 **y = 44** 盖住，中间露出 10px。

第一层**内容还在**，只是大部分被第二层挡住。不要用整张纯色 `::after` 盖掉内容。

第二层打开后，第一层还要：

- **Handle 隐藏**（`opacity: 0`，占位可留）
- **内容约 65% 不透明**（`opacity: 0.65`）
- 不要在第一层**下半截**单独盖 70% 黑。第二层圆角会透出下半，和 10px 顶边颜色不一致，看起来像被切成两截。

70% 黑只用于卡片**外面**的背景（第一层打开时那层 scrim），不要切在第一层卡片上。

---

## 2. 打开顺序

1. 第一层立刻：缩小 + 上推 + 顶角 20px + 底改 `#141414` + handle 隐 + 内容变透。  
   时长 **420ms**，曲线 **`cubic-bezier(0.32, 0.72, 0, 1)`**，**无 delay**。
2. **80ms** 后，第二层从下方 `translateY(100%) → 0`，同一套 420ms 曲线。

不要两层同时到位。不要只做 `scaleX`（内容会被压扁）。

---

## 3. 关闭顺序

两层一起动，不要让第一层晚 80ms（打开的错开只留给进场）。

1. 第二层立刻向下滑出（`translateY(100%)`），**无 delay**。
2. 第一层也立刻放大回满宽、顶角 30px、底 `#1a1a1a`、handle 和内容透明度恢复。

关闭时父层不要立刻 `visibility: hidden`，否则下滑看不到。用：

```css
.edit-layer {
  visibility: hidden;
  transition: visibility 0s linear 0.42s;
}
.edit-layer.is-open {
  visibility: visible;
  transition: visibility 0s;
}
```

点 X / Save / 10px 顶边 / 下拉超过阈值，都走这套下滑，不要瞬切。

标题若绝对定位铺满导航条，会挡住 X：标题 `pointer-events: none`，X 和 Save `z-index: 1`。

---

## 4. 层级（z-index）

| 元素 | z |
|---|---|
| 第一层 sheet | 2 |
| 第二层容器 | 10 |
| 10px 点击热区 | 11 |
| 第二层 sheet | 12 |

第一层不要抬到第二层容器之上，否则第二层会被整张挡住。

10px 热区：`top: 34px`，高 10px。热区可以铺满 375，实际可见顶边宽 335。

---

## 5. 实现要点

```css
.sheet {
  top: 44px;
  width: 375px;
  transform-origin: 50% 0;
  transform: translateY(0) scale(1);
  border-radius: 30px 30px 0 0;
  background: #1a1a1a;
  transition:
    transform 0.42s cubic-bezier(0.32, 0.72, 0, 1),
    background-color 0.42s cubic-bezier(0.32, 0.72, 0, 1),
    border-radius 0.42s cubic-bezier(0.32, 0.72, 0, 1);
}

.phone.is-editing .sheet {
  background: #141414;
  border-radius: 20px 20px 0 0;
  transform: translateY(-10px) scale(calc(335 / 375));
}

.edit-sheet {
  top: 44px;
  transform: translateY(100%);
  transition: transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
}
.edit-layer.is-open .edit-sheet {
  transform: translateY(0);
  transition-delay: 0.08s;
}
.edit-layer:not(.is-open) .edit-sheet {
  transition-delay: 0s;
}
```

跟手拖第二层时关掉 transition；松手超过约 **90px** 则关闭并下滑，否则弹回。

---

## 6. 不要做的

- 不要把第一层收成 335×20 的空条再假装是「缩小」。
- 不要只用 `scaleX` 变窄。
- 不要让 10px 顶边和圆角后的第一层一个有 70% 遮罩、一个没有。
- 不要用遮罩层的不透明区域盖住 10px 顶边（顶边要能点、颜色要和第一层其余可见部分一致）。
- 关闭时不要先藏第二层再播动画。
