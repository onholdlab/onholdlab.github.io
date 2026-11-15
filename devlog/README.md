# devlog

開發日誌頁。只有文字的筆記用打字呈現；自己畫的圖（草稿）才放手寫圖片。有顏色的句子可以點，會顯示它和別句的「反應」或「矛盾」。

## 加一張新筆記
- **只有文字**：在 `index.html` 加 `<article>`，裡面放 `<div class="note text" data-note="代號"><p>…</p></div>`，要能點的句子包成 `<mark class="ph tx" role="button" tabindex="0" data-id="句子代號">句子</mark>`；`<details><summary>English</summary>` 放英文。`PHRASES` 只填 `note` 和 `label`（和按鈕文字一字不差），不放 `r`。
- **畫的圖**：圖片轉成 webp 放進 `img/`（寬度 1200px 以內），用 `<figure class="note" data-note="代號">` 放圖，圖下方用 `<p class="sk">` 列出圖上可點的句子（同樣用 `<mark class="ph tx">`）；`PHRASES` 的 `r` 是句子在圖上的位置 `[x, y, 寬, 高]`（圖片的百分比），只用來在反應裡剪出手寫字，跨行就放兩組。
4. 在 `REACTIONS` 加反應：`a`、`b` 是兩句的代號，`kind` 用 `react` 或 `clash`，`zh`、`en` 各一兩句。
5. 新筆記至少要和一張舊筆記有反應；找不到就先不加框，只放筆記。

## 規則
- 反應的文字要經過 onholdlab 本人確認才上線。
- Steam 專案的核心玩法不能出現在筆記或反應裡（規則見 onholdlab/rules 的 `marketing/devlog-post-rules.md`，要一起檢查已發過的內容）。
- 沒有任何框：不用底色色塊、邊線、陰影、圓角面板，連鍵盤焦點也用底線不用外框。可點的句子只換文字顏色；反應直接展開在筆記下方。手繪圖上不疊色塊，圖上的句子列在圖下方。文字盡量少。
