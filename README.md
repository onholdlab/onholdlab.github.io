# onholdlab.github.io

onholdlab 等候空間：一個人用 AI 把想法做成遊戲、工具與實驗作品的地方。作品集放在 GitHub Pages，首頁支援繁體中文、English、日本語、한국어、Español、Deutsch、Français。

可以按服務鈴看最新作品，點舞台上的仿廣告讓貓打掉，留下的線條會成為一幅作品。舞台廣告是互動遊戲內容。

| 檔案 | 內容 |
|---|---|
| `index.html` | 整個首頁：窗口與鈴、打廣告舞台、最新資訊列表、提問與回饋表單、線條展示框。樣式和程式都在這一頁裡。 |
| `works-i18n.json` | 依 repo 名設定日、韓、西、德、法五語的作品名稱與介紹；中文與英文從各 repo 的 GitHub description 讀入。 |
| `js/feedback.js` | 所有作品共用的玩家回饋，寫進 Supabase 的 `feedback` 表。其他遊戲也可以載入 `https://onholdlab.github.io/js/feedback.js`，用 `OHLFeedback.send({source, kind, message, contact})` 送出。 |

## 新增作品（自動）

開了 GitHub Pages 的公開 repo 都會自動出現在「最新資訊」，越新的越前面。GitHub Action（`.github/workflows/works.yml`）每 6 小時更新一次 `works.json`；想馬上更新，到 repo 的 Actions →「更新作品清單」→ Run workflow。

- **類型**：在 repo 頁面右側 About 加 topic。`game` → 遊戲，`tool` → 工具，都沒有 → 作品。
- **名稱與介紹**：到各作品 repo 的 About → Edit，description 寫成 `中文名稱｜中文介紹｜English name｜English blurb`，例如 `十字路口｜去撞人來被撞｜Crossroad｜Bump into people, or get bumped.`。仍相容舊格式 `中文名稱｜一句話介紹`；沒有 `｜` 的話，名稱用 repo 名。GitHub description 本身是一段文字，切換首頁語言不會改變 GitHub 上顯示的內容。
- **其他五語**：編輯本站 `works-i18n.json`，以 repo 名為鍵，每語填 `title` 和 `blurb`。例如 `"crossroad": {"ja": {"title": "交差点", "blurb": "ぶつけるか、ぶつけられるか。"}}`，其餘語言代碼是 `ko`、`es`、`de`、`fr`。更新此檔會自動觸發作品清單更新，定時更新也會保留翻譯。
- **顯示規則**：優先使用所選語言的翻譯；未翻譯的新作品暫用英文，沒有英文才用中文。五件現有作品已補齊七語名稱與介紹。
- **連結**：預設是 `https://onholdlab.github.io/<repo>/`；repo 的 Website 欄位有填網址就用那個。
- 不想出現在首頁：關掉那個 repo 的 Pages，或把 repo 封存（archive）。

`works.json` 讀不到時，首頁會改用 `index.html` 裡 `const NEWS=[` 的備用清單。

## 語言與手機版面

首次開啟依瀏覽器語言選擇；手動選擇會儲存在目前瀏覽器，下次開啟沿用。舊 `?lang=ja` 連結仍可指定語言，切換後會移除 `lang` 參數，保留其他參數與錨點。

語言選單使用站內的薄荷綠、深綠框線與硬陰影，支援鍵盤、Escape 及點外部關閉。遊戲提示和計數放在舞台外，文字換行不會蓋住廣告；廣告會隨翻譯長度增高並重新排位。

## 回饋

送出的內容在 Supabase 後台的 Table Editor → `feedback` 表查看。`feedback.js` 裡的金鑰是 publishable 公開金鑰，只能新增、不能讀，放在網頁裡沒有問題；不要換成 service_role 或 secret 金鑰。

免費的 Supabase 專案一週沒有任何請求會被暫停，要到後台手動恢復。

`DESIGN.md` 是舊版等候室頁面的設計紀錄，目前首頁不再使用。
