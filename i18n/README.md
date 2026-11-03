# i18n

本次只搬移現有繁體中文與英文，不新增翻譯。JSON 使用有意義的英文 key；同一句話在兩個語言原本有不同用途或空白時分開保存。

## 新增語言

只需新增一個 `i18n/<語言代碼>.json`（UTF-8、平面 key/value），沿用 `en.json` 的 key 與參數名稱；未填的 key 會退回英文。不需要新增另一份 JS 字典或修改遊戲程式。可選填 `language.name` 作為該語言在既有選單中的名稱，否則使用語言代碼。

透過既有語言偏好指定新代碼後重新載入即可使用；例如在瀏覽器主控台執行 `OHLi18n.setLanguage('xx'); location.reload()`，載入器會讀取 `i18n/xx.json`，既有選單會保留該選項。這是新增語言的開發說明，本次沒有加入 xx 或其他新語言。

## 選擇與 fallback

1. 優先使用玩家選過並存入 localStorage 的語言。相容舊代碼 `zh`，對應檔案 `zh-Hant.json`。語言偏好的讀取和寫入皆在 try/catch 內；瀏覽器拒絕儲存時仍可運作。
2. 沒有有效偏好時，navigator.language 以 zh 開頭使用 zh-Hant，其他使用 en。
3. `OHLi18n.t(key, params)` 先查目前語言，再查 en；英文也缺少時顯示 key。空字串是有效內容，不會被當成缺少。
4. 載入 JSON 失敗視為該語言缺少 key，套用相同 fallback。先等待 `OHLi18n.ready` 才啟動依賴文字的介面。請透過 HTTP 服務開啟，與 GitHub Pages 一樣；不要用 file:// 開啟。
5. 原本的日、韓、西、德、法文與選單保留。既有字典仍提供這些語言，缺少的文字沿用既有英文 fallback；沒有新增它們的 JSON 或翻譯。

插值使用 `{valueA}`、`{valueB}` 或 `{days}` 等具名參數。數字、分數與遊戲條件仍由原程式計算，不放進翻譯邏輯。

## 檢查

執行 `node i18n/check.mjs`，只用 Node.js 內建模組，涵蓋 key 一致性、語言選擇、localStorage 被拒、英文/key fallback、JSON 載入失敗、插值及頁面內 JS 語法。

本次另以本機瀏覽器比對七種既有語言、360/1000px 的文字與標籤；中英文 360px 頁面截圖逐位元一致。繪圖工具或 FAQ、隱私權語言切換亦有改前／改後比較。驗證未送出正式資料。

## 本 repo 範圍

抽出 104 個 key，涵蓋首頁與隱私權頁、FAQ、回饋訊息、placeholder、無障礙標籤、頁面標題、description 與 JS 內備用作品名稱/介紹。原始頁面沒有 og 描述或 og:image，本次不新增 metadata。

首頁與隱私權頁原有的明確 ?lang= URL 指定保留；已有儲存偏好時優先使用玩家選擇，沒有有效儲存偏好才使用連結的語言。localStorage 沿用 ohl_lang 的 JSON 字串格式。

隱私權文字按段落分 key，原有標籤、段落與連結逐字保留；包含連結的文字段落保留既有 HTML，只能放可信任、隨程式部署的內容。作品列表原有 works.json / works-i18n.json 已在 JSON 中，繼續使用原本資料流程，不重複搬移。

仍保留的內容：既有其他語言翻譯、資料類型識別碼、使用者輸入、執行時作品資料及組字用標點；沒有另行翻譯或遺漏已識別的中英文靜態介面句子。

Supabase / GoatCounter 設定、inapp-keep1 樣式與腳本、其他樣式及字型均未改。
