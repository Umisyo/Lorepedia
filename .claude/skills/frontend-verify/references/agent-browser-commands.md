# agent-browser コマンドリファレンス

## ナビゲーション

```bash
open <url>              # ページへ移動
back                    # 戻る
forward                 # 進む
reload                  # リロード
```

## スナップショット（推奨ワークフロー）

```bash
snapshot                # 完全なアクセシビリティツリー（ref付き）
snapshot -i             # インタラクティブ要素のみ（推奨）
snapshot -c             # コンパクト表示
snapshot -d 3           # 深さ3レベルに限定
snapshot -s "#main"     # CSSセレクタでスコープ指定
snapshot -i --json      # JSON形式で出力（スクリプト処理用）
```

**スナップショットの出力例:**
```
@e1 button "ログイン"
@e2 input[type="email"] placeholder="メールアドレス"
@e3 input[type="password"] placeholder="パスワード"
@e4 link "パスワードを忘れた場合"
```

ref（@e1, @e2...）を使って要素を操作する。

## インタラクション

### クリック・マウス操作
```bash
click <selector>        # クリック
dblclick <selector>     # ダブルクリック
hover <selector>        # ホバー
drag <source> <target>  # ドラッグ&ドロップ
```

### 入力操作
```bash
fill <selector> <text>  # クリア後入力（フォーム用）
type <selector> <text>  # 追記入力
press <key>             # キー押下（Enter, Tab, Control+a等）
```

### フォーム操作
```bash
check <selector>        # チェックボックスON
uncheck <selector>      # チェックボックスOFF
select <selector> <value>  # ドロップダウン選択
focus <selector>        # フォーカス
```

### スクロール
```bash
scroll down [px]        # 下スクロール
scroll up [px]          # 上スクロール
scroll left [px]        # 左スクロール
scroll right [px]       # 右スクロール
```

### ファイル
```bash
upload <selector> <files>  # ファイルアップロード
```

## 情報取得（get）

```bash
get text <selector>     # テキスト取得
get html <selector>     # HTML取得
get value <selector>    # value属性取得
get attr <sel> <attr>   # 任意属性取得
get title               # ページタイトル
get url                 # 現在のURL
get count <selector>    # マッチ数
get box <selector>      # 境界ボックス（位置・サイズ）
```

## 状態確認（is）

```bash
is visible <selector>   # 表示されているか
is enabled <selector>   # 有効か（disabled=false）
is checked <selector>   # チェックされているか
```

## 待機（wait）

```bash
wait <selector>                # セレクタ出現まで待機
wait <milliseconds>            # 指定ミリ秒待機
wait --text "テキスト"         # テキスト出現まで待機
wait --url "**/pattern"        # URL変更まで待機
wait --load networkidle        # ネットワーク静止まで待機
wait --fn "window.x === true"  # JS条件成立まで待機
```

## キャプチャ

```bash
screenshot [path]       # スクリーンショット保存
screenshot --full       # フルページスクリーンショット
pdf <path>              # PDF保存
```

## セッション管理

```bash
--session <name>        # セッション名指定
# または環境変数: AGENT_BROWSER_SESSION=<name>
```

セッションを使うと、同じブラウザインスタンスを維持できる。

## タブ・ウィンドウ

```bash
tab                     # 現在のタブ情報
tab new [url]           # 新しいタブを開く
tab <n>                 # n番目のタブに切り替え
tab close [n]           # タブを閉じる
window new              # 新しいウィンドウを開く
```

## フレーム（iframe）

```bash
frame <selector>        # iframe内に切り替え
frame main              # メインフレームに戻る
```

## ダイアログ

```bash
dialog accept [text]    # ダイアログを承認（promptの場合テキスト入力）
dialog dismiss          # ダイアログをキャンセル
```

## Cookie・ストレージ

```bash
cookies                 # Cookie一覧
cookies set <name> <value>  # Cookie設定
cookies clear           # Cookie削除
storage local [key]     # localStorage取得
storage session [key]   # sessionStorage取得
```

## ネットワーク

```bash
set headers '{"key":"value"}'     # ヘッダー設定
set credentials <user> <password> # Basic認証設定
network route <url>               # リクエスト傍受
network route <url> --abort       # リクエスト遮断
network route <url> --body <json> # レスポンスモック
```

## 高度な機能

```bash
eval <javascript>       # JavaScript実行
trace start [path]      # トレース開始
trace stop [path]       # トレース終了
state save <path>       # 認証状態保存
state load <path>       # 認証状態復元
```

## セレクタの種類

| 種類 | 例 | 説明 |
|------|------|------|
| ref | `@e1`, `@e2` | スナップショットから取得（推奨） |
| CSS | `#id`, `.class`, `button` | 標準CSSセレクタ |
| セマンティック | `role button --name "Submit"` | 意味ベース選択 |

## CLIオプション

```bash
--session <name>        # セッション名
--json                  # JSON出力
--headed                # ブラウザ表示（デバッグ用）
--full (-f)             # フルページ
--name (-n)             # 名前で検索
--exact                 # 完全一致
--executable-path <path> # ブラウザパス指定
--cdp <port>            # CDP接続
--debug                 # デバッグモード
```
