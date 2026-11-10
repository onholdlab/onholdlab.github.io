# onholdlab.github.io

onholdlab 等候空間：一個人用 AI 把想法做成遊戲、工具與實驗作品的地方。作品集部署在 Cloudflare 的 https://onholdlab.com/，首頁支援繁體中文、English、日本語、한국어、Español、Deutsch、Français。

可以按服務鈴看最新作品，點舞台上的仿廣告讓貓打掉，留下的線條會成為一幅作品。舞台廣告是互動遊戲內容。

| 檔案 | 內容 |
|---|---|
| `index.html` | 整個首頁：窗口與鈴、打廣告舞台、最新資訊列表、提問與回饋表單、線條展示框。樣式和程式都在這一頁裡。 |
| `works.json` | 手動維護已部署的作品、順序、網址與語言限制；首頁直接讀取。 |
| `works-i18n.json` | 依 repo 名設定日、韓、西、德、法五語的作品名稱與介紹；手動更新工作流程時會帶入 `works.json`。 |
| `js/feedback.js` | 所有作品共用的玩家回饋，寫進 Cloudflare Worker `ohl-api` 的 D1 資料庫（`feedback` 表，程式在 onholdlab/ohl-api）。其他遊戲也可以載入 `https://onholdlab.com/js/feedback.js`，用 `OHLFeedback.send({source, kind, message, contact})` 送出。 |

## 新增與更新作品

先把作品部署到 onholdlab.com，再手動加入 `works.json`；陣列第一件會顯示在「最新完成」。移除作品也直接編輯這份清單，是否開啟 GitHub Pages 不影響本站是否收錄。

GitHub Action（`.github/workflows/works.yml`）只保留手動 Run workflow，沒有排程或 push 觸發。它只更新既有清單作品的 GitHub 名稱、介紹、類型與翻譯，保留清單順序、部署網址與 `lang_only`；不會加入其他 repo，也不會因 GitHub 查不到作品而把它移除。

- **類型**：在 repo 頁面右側 About 加 topic。`game` → 遊戲，`tool` → 工具，都沒有 → 作品。
- **名稱與介紹**：到各作品 repo 的 About → Edit，description 寫成 `中文名稱｜中文介紹｜English name｜English blurb`，例如 `十字路口｜去撞人來被撞｜Crossroad｜Bump into people, or get bumped.`。仍相容舊格式 `中文名稱｜一句話介紹`；沒有 `｜` 的話，名稱用 repo 名。GitHub description 本身是一段文字，切換首頁語言不會改變 GitHub 上顯示的內容。
- **其他五語**：編輯本站 `works-i18n.json`，以 repo 名為鍵，每語填 `title` 和 `blurb`。例如 `"crossroad": {"ja": {"title": "交差点", "blurb": "ぶつけるか、ぶつけられるか。"}}`，其餘語言代碼是 `ko`、`es`、`de`、`fr`。編輯後手動執行工作流程，或同步修改 `works.json` 的 `translations`。
- **顯示規則**：優先使用所選語言的翻譯；未翻譯的新作品暫用英文，沒有英文才用中文。
- **連結與語言限制**：在 `works.json` 填已部署的 `https://onholdlab.com/<repo>/`；只有中文的作品加 `"lang_only": "zh"`。

`works.json` 讀不到時，首頁會改用 `index.html` 裡 `const NEWS=[` 的備用清單；新增或調整最新作品時也要同步更新備用清單及 `i18n/` 的作品文字。

執行 `node --test scripts/build-works.test.mjs` 與 `node i18n/check.mjs` 可檢查清單更新與語言邏輯。

## 語言與手機版面

首次開啟依瀏覽器語言選擇；手動選擇會儲存在目前瀏覽器，下次開啟沿用。舊 `?lang=ja` 連結仍可指定語言，切換後會移除 `lang` 參數，保留其他參數與錨點。

語言選單使用站內的薄荷綠、深綠框線與硬陰影，支援鍵盤、Escape 及點外部關閉。遊戲提示和計數放在舞台外，文字換行不會蓋住廣告；廣告會隨翻譯長度增高並重新排位。

## 回饋

送出的內容在 Cloudflare 後台 → Storage & Databases → D1 → `ohl-db` → `feedback` 表查看。`feedback.js` 只寫了 Worker 網址，沒有任何金鑰；Worker 只開放新增回饋，網頁讀不到別人的回饋。

2026-11-06 以前的回饋還留在 Supabase 的 `feedback` 表，沒有搬過來。

`DESIGN.md` 是舊版等候室頁面的設計紀錄，目前首頁不再使用。
