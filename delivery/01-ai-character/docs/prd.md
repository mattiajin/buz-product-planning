# AI Character 资料与编辑

原型：`delivery/01-ai-character/index.html`  
默认打开本 PRD。交互与动效在左侧切到「交互与动效标注」。

本文是按当前原型整理的草稿。产品补全边界、文案和未做规则；动效数字不要写进这里。

## 待产品补

- 入口：从哪里进、谁能看/编辑/删除
- 编辑中为何不可删除；退出编辑未保存是否丢改动
- AI Refine：要不要二次确认、失败/取消、是否进主路径 Hold original
- Avatar 本迭代是否可换
- 空态、超字数、网络失败的文案
- Toast / 确认框文案是否定稿（系统组件，设计侧不改样式）

## 触发条件

从会话列表点开某个 AI 角色，进入本资料页。资料以 bottom sheet 盖在会话之上。

- 编辑中不可删除
- 删除仅资料页可点

## 字段定义

| 字段 | 规则 |
| --- | --- |
| Name | 必填。空则 Save 不可点。 |
| Description | 必填，最多 1000。空则隐藏 AI Refine。 |
| Speaking style | 必填，最多 600。规则同 Description。 |
| Avatar | 本原型不换图。Change Avatar 为占位。 |

## 交互规则

1. **Edit Character** — 打开编辑层。
2. **AI Refine** — 字段有字才显示。确认后出 Working toast，完成后替换当前字段并出成功 toast。
3. **Save** — Name / Description / Style 任一为空，或正在 Refine，Save 置灰。成功则写回资料页并收起编辑层。
4. **Delete** — 二次确认后资料 sheet 下滑离场，toast「Character deleted.」

## 分支状态

- Working toast
- Save disabled
- Delete confirm
- Empty field
