# 交接 · AI Character

给产品：在标注壳里补 **PRD**。设计和动效按当前原型冻结。

打开原型：`delivery/01-ai-character/index.html`  
起点：`delivery/index.html`

进页就是 PRD。左侧可切「交互与动效标注」。关总开关只剩手机。左上角「设计与产品交付」回落地页。

---

## 已定（不要当草稿改）

| | |
| --- | --- |
| 机内流程 | 资料页 → 编辑叠层 → Refine / Save / Delete |
| 交互与动效 | 角标 **1** 打开叠层、**5** Show more、**6** Refine 进出、**7** 润色后框高 |
| 打开叠层 | 下层立刻缩小上移，上层晚 80ms 滑入，露 10px |
| 关闭叠层 | 上层下滑、下层立刻还原（不要晚 80ms）。不打角标，写在 motion.md 历史 |
| Toast / 确认框 | 系统组件，本期不改样式。文案由产品定 |
| 设计探索 V2–V4 | 内部，不进主交付 |

动效原文：`docs/motion.md`（右栏也可展开）。壳：`delivery/docs/annot_shell.md`。叠层：`docs/stacked_bottom_sheet.md`。PRD：`docs/prd.md`。

---

## 请补（PRD）

右栏卡片和 `prd.md` 是同一份草稿。改结构时请保留 `## 1`；没有标题时用 `1.` `2.` `3.` `4.`，角标才能对上复制。

请补：

1. **入口与权限** — 从哪进、谁能编辑/删除、编辑中为何不能删  
2. **未保存** — 关掉编辑层改动是否丢弃  
3. **AI Refine** — 要不要确认、失败/取消、Hold original 是否进主路径（现在只在探索 V3/V4）  
4. **Avatar** — 本迭代是否可换（原型是占位）  
5. **空态 / 超字数 / 失败文案**  
6. **Toast 与弹窗文案** 是否定稿（Working / Refined successfully / Character deleted / Delete confirm）

字段现状（原型）：Name 必填；Description 必填最多 1000；Speaking style 必填最多 600；空字段隐藏 AI Refine；任一会空或正在 Refine 则 Save 置灰。

---

## 角标

| # | PRD（改这里） | 交互与动效 |
| --- | --- | --- |
| 1 | Edit Character | 打开叠层 |
| 2 | AI Refine | — Toast 不标 |
| 3 | Save | — 关闭不标 |
| 4 | Delete | — 确认框不标 |
| 5 | — | Show more |
| 6 | — | Refine 按钮进出 |
| 7 | — | 润色后框高 |

悬停机内或右栏会互相同步。钉住只点右栏条目。

---

## 不要改

- 手机 375×812 居中，不要为右栏挪机身  
- 壳色和动效（柠檬只作标注强调）  
- 把动效毫秒写进 PRD 正文  
