# Text to Thumbnail

記事タイトルから自動的にサイバーパンク風のサムネイル画像を生成するツールです。
日本語のタイトルを自動的にローマ字に変換し、ファイル名として使用します。

![サンプル画像](./docs/sample.png)

## 特徴

- 🎨 サイバーパンク風のデザイン（ネオングリーンのテキスト）
- 🔄 日本語タイトルの自動ローマ字変換
- 📦 複数タイトルの一括処理
- 📺 16:9のアスペクト比（1280x720px）
- 🚀 シンプルなコマンドライン操作

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/saku-1031/text-to-thumbnail.git
cd text-to-thumbnail

# 依存パッケージのインストール
npm install
```

## 使い方

### 基本的な使い方

```bash
# 単一のタイトルからサムネイル生成
npm run generate "メカオロワーチを倒そう"
# 生成結果: thumbnails/mekaorowachiotaoso.png

# 複数のタイトルを一括処理
npm run generate "タイトル1" "タイトル2" "タイトル3"
```

### 出力ファイル

- 生成されたサムネイルは `thumbnails/` ディレクトリに保存されます
- ファイル名は自動的にローマ字に変換されます
  - 例：「メカオロワーチを倒そう」→ `mekaorowachiotaoso.png`

## 必要要件

- Node.js 16以上
- npm

## カスタマイズ

テーマのカスタマイズは `theme/custom.css` で行えます：

```css
/* 背景色の変更 */
section {
  background: #0A0E17;  /* 濃い紺色 */
}

/* テキストカラーの変更 */
h1 {
  color: #2DFFA9;  /* ネオングリーン */
  text-shadow: 0 0 10px rgba(45, 255, 169, 0.5);  /* 発光エフェクト */
}
```

## ライセンス

MIT

## 作者

saku-1031

## マークダウンファイルの書き方

```markdown
---
marp: true
theme: default
paginate: true
size: 16:9
---

# タイトル
## サブタイトル

最初のスライドがサムネイルとして使用されます
```

## 注意事項

- マークダウンファイルは必ずMarpの設定（`marp: true`）を含める必要があります
- 最初のスライドがサムネイルとして使用されます
- 生成されるサムネイルは1280x720px（16:9）のPNG形式です 