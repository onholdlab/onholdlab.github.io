# devlog

開發日誌頁。筆記是手寫圖，圖上有顏色的句子可以點，會顯示它和別句的「反應」或「矛盾」。

## 加一張新筆記
1. 圖片轉成 webp 放進 `img/`（寬度 1200px 以內）。
2. 在 `index.html` 加一個 `<article>`，裡面的 `<figure class="note" data-note="代號">` 放圖，`<details>` 放打字版和英文。
3. 在頁尾 script 的 `PHRASES` 加句子：`note` 填上面的代號，`r` 是句子在圖上的位置 `[x, y, 寬, 高]`（圖片的百分比），跨行就放兩個框。
4. 在 `REACTIONS` 加反應：`a`、`b` 是兩句的代號，`kind` 用 `react` 或 `clash`，`zh`、`en` 各一兩句。
5. 新筆記至少要和一張舊筆記有反應；找不到就先不加框，只放筆記。

## 規則
- 反應的文字要經過 onholdlab 本人確認才上線。
- Steam 專案的核心玩法不能出現在筆記或反應裡（規則見 onholdlab/rules 的 `marketing/devlog-post-rules.md`，要一起檢查已發過的內容）。
- 沒有邊框；文字盡量少。
