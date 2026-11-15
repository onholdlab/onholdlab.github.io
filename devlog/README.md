# devlog

開發日誌頁。只有文字的筆記用打字呈現；自己畫的圖（草稿）才放手寫圖片。
「句子反應」功能已在 2026-11-16 拿掉（反應文案留在 git 歷史 `e10c030`），之後要重做再另外設計。

## 加一張新筆記
- **只有文字**：在 `index.html` 加 `<article>`，裡面放 `<div class="note text" data-note="代號"><p>…</p></div>`；`<details><summary>English</summary>` 放英文。
- **畫的圖**：圖片轉成 webp 放進 `img/`（寬度 1200px 以內），用 `<figure class="note" data-note="代號">` 放圖，圖上不疊任何東西。

## 規則
- Steam 專案的核心玩法不能出現在筆記裡（規則見 onholdlab/rules 的 `marketing/devlog-post-rules.md`，要一起檢查已發過的內容）。
- 照 repo 根目錄 `AGENTS.md` 的設計規則：沒有任何框、沒有任何底線；鍵盤焦點用變色表示。
- 文字盡量少。
