const puppeteer = require('puppeteer');
const { marpCli } = require('@marp-team/marp-cli');
const path = require('path');
const fs = require('fs').promises;
const Kuroshiro = require('kuroshiro').default;
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');
const crypto = require('crypto');

// Kuroshiroの初期化
let kuroshiroPromise = null;
async function initializeKuroshiro() {
  if (!kuroshiroPromise) {
    kuroshiroPromise = (async () => {
      const kuroshiro = new Kuroshiro();
      await kuroshiro.init(new KuromojiAnalyzer());
      return kuroshiro;
    })();
  }
  return kuroshiroPromise;
}

async function toRomaji(text) {
  const kuroshiro = await initializeKuroshiro();
  const result = await kuroshiro.convert(text, {
    to: 'romaji',
    mode: 'spaced',
    romajiSystem: 'passport'
  });
  // スペースを削除し、小文字に変換
  return result.toLowerCase().replace(/\s+/g, '');
}

// 一意の一時ファイル名を生成
function generateTempFilename(prefix) {
  const randomStr = crypto.randomBytes(8).toString('hex');
  return `${prefix}-${randomStr}`;
}

async function createMarkdownFile(title, outputPath) {
  const content = `---
marp: true
theme: custom
paginate: false
header: ""
footer: ""
size: 16:9
---

# ${title}`;

  await fs.writeFile(outputPath, content, 'utf-8');
}

async function generateThumbnail(markdownPath, outputPath) {
  const tempId = generateTempFilename('output');
  const tempHtmlPath = path.join(__dirname, '../temp', `${tempId}.html`);
  const tempDir = path.dirname(tempHtmlPath);

  try {
    // 一時ディレクトリの作成
    await fs.mkdir(tempDir, { recursive: true });

    // MarpでマークダウンをHTMLに変換
    await marpCli([
      markdownPath,
      '--html',
      '--theme', path.join(__dirname, '../theme/custom.css'),
      '--output', tempHtmlPath
    ]);

    // Puppeteerでスクリーンショット撮影
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    const page = await browser.newPage();
    
    // ビューポートサイズの設定（16:9のアスペクト比）
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 2
    });

    await page.goto(`file://${tempHtmlPath}`);

    // ページ数表示要素を非表示にする
    await page.addStyleTag({
      content: `
        .bespoke-marp-osc,
        .bespoke-marp-progress,
        #bespoke-progress {
          display: none !important;
        }
      `
    });
    
    // 出力ディレクトリの作成
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // スクリーンショットの撮影
    await page.screenshot({
      path: outputPath,
      type: 'png'
    });

    await browser.close();

    // 一時ファイルの削除
    await fs.unlink(tempHtmlPath).catch(() => {});
    
    console.log(`サムネイルを生成しました: ${outputPath}`);
  } catch (error) {
    // エラーが発生した場合も一時ファイルを削除
    await fs.unlink(tempHtmlPath).catch(() => {});
    console.error('サムネイル生成中にエラーが発生しました:', error);
    throw error;
  }
}

async function processTitle(title, { markdownDir, outputDir }) {
  const tempId = generateTempFilename('md');
  const tempMarkdownPath = path.join(markdownDir, `${tempId}.md`);

  try {
    // タイトルをローマ字に変換
    const romajiTitle = await toRomaji(title);
    // ファイル名に使えない文字を置換し、アルファベットと数字のみに
    const sanitizedTitle = romajiTitle.replace(/[^a-z0-9]/g, '');
    const outputPath = path.join(outputDir, `${sanitizedTitle}.png`);

    // マークダウンファイルの生成
    await createMarkdownFile(title, tempMarkdownPath);

    // サムネイル生成
    await generateThumbnail(tempMarkdownPath, outputPath);

    // 一時的なマークダウンファイルを削除
    await fs.unlink(tempMarkdownPath).catch(() => {});

    console.log(`"${title}" → "${sanitizedTitle}"`);
  } catch (error) {
    // エラーが発生した場合も一時ファイルを削除
    await fs.unlink(tempMarkdownPath).catch(() => {});
    console.error(`"${title}" の処理中にエラーが発生しました:`, error);
  }
}

// メイン処理
async function main() {
  const titles = process.argv.slice(2);
  
  if (titles.length === 0) {
    console.error('使用方法: npm run generate "タイトル1" "タイトル2" "タイトル3" ...');
    process.exit(1);
  }

  const markdownDir = path.join(__dirname, '../articles');
  const outputDir = path.join(__dirname, '../thumbnails');

  try {
    // Kuroshiroを事前に初期化
    await initializeKuroshiro();

    // ディレクトリの作成
    await fs.mkdir(markdownDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.join(__dirname, '../temp'), { recursive: true });

    // 全てのタイトルを並行処理
    await Promise.all(
      titles.map(title => 
        processTitle(title, { markdownDir, outputDir })
      )
    );

    console.log('全ての処理が完了しました！');
  } catch (error) {
    console.error('処理中にエラーが発生しました:', error);
    process.exit(1);
  }
}

main(); 