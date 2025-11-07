# Firebase設定手順

このドキュメントでは、化学反応キッチンゲームでFirebaseを設定する手順を説明します。

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `chem-kitchen-game`）
4. Google Analyticsを有効にするかを選択（推奨：有効）
5. プロジェクトを作成

## 2. Webアプリの登録

1. Firebase Consoleでプロジェクトを開く
2. 「Web」アイコン（</>）をクリック
3. アプリのニックネームを入力（例: `Chemical Kitchen Web`）
4. 「Firebase Hostingも設定する」をチェック
5. アプリを登録
6. 設定オブジェクトをコピー

## 3. 環境変数の設定

1. プロジェクトルートに `.env.local` ファイルを作成
2. Firebase設定を追加：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 4. Firestoreの設定

1. Firebase Consoleで「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. セキュリティルールの設定：
   - 本番モードで開始を選択
   - 提供された `firestore.rules` ファイルをルールタブにコピー

## 5. セキュリティルールの適用

以下のルールをFirestore Databaseのルールタブに設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーデータ: 自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ランキングデータ: 認証済みユーザーは読み取りのみ可能
    match /rankings/{document} {
      allow read: if request.auth != null;
      allow write: if false; // サーバー側でのみ更新
    }
    
    // 公開統計データ: 認証済みユーザーは読み取りのみ可能
    match /statistics/{document} {
      allow read: if request.auth != null;
      allow write: if false; // サーバー側でのみ更新
    }
    
    // その他のドキュメントは拒否
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 6. Firebase CLIのインストールと設定

```bash
# Firebase CLIをインストール
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトを初期化
firebase init

# 以下を選択：
# - Firestore: Configure security rules and indexes files
# - Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys

# プロジェクトの選択：作成したFirebaseプロジェクトを選択
# Firestoreルールファイル：firestore.rules (既存)
# Firestoreインデックスファイル：firestore.indexes.json (既存)
# Hostingの公開ディレクトリ：out
# SPA設定：No
```

## 7. 依存関係のインストール

```bash
npm install firebase@^10.7.1
```

## 8. ビルドとデプロイ

```bash
# アプリケーションをビルド
npm run build

# Firebaseにデプロイ
firebase deploy
```

## 9. 初期データの設定（オプション）

初回デプロイ後、Firebase Consoleからサンプルデータを追加できます：

### ランキングコレクション例：
```javascript
// ドキュメントID: sample-user-1
{
  userId: "sample-user-1",
  storeName: "サンプル店舗",
  chefName: "サンプルシェフ",
  level: 5,
  money: 10000,
  totalSales: 15000,
  rank: "intermediate",
  lastUpdated: new Date()
}
```

## 10. セキュリティ設定の確認

### Firestoreのセキュリティ：
- ✅ 認証なしではデータアクセス不可
- ✅ ユーザーは自分のデータのみアクセス可能
- ✅ ランキングデータは読み取り専用
- ✅ サーバー処理のみがランキングを更新可能

### Firebase Hosting：
- ✅ HTTPS強制
- ✅ CDN配信
- ✅ 静的ファイルのキャッシュ設定

## 11. 運用時の注意事項

1. **定期的なバックアップ**: Firestoreデータの定期バックアップを設定
2. **ログ監視**: Firebase Consoleでアクセスログとエラーログを確認
3. **使用量監視**: 無料枠の使用量を定期的に確認
4. **セキュリティルールの更新**: 機能追加時にセキュリティルールも更新

## 12. トラブルシューティング

### よくあるエラーと対処法：

**Permission denied**: 
- セキュリティルールを確認
- 環境変数が正しく設定されているか確認

**ネットワークエラー**:
- Firebase設定が正しいか確認
- インターネット接続を確認

**ランキングが表示されない**:
- Firestoreインデックスが作成されているか確認
- データが正しく保存されているか Firebase Console で確認

## 13. パフォーマンス最適化

1. **Firestoreクエリの最適化**:
   - 必要なフィールドのみ取得
   - 適切なインデックスの設定

2. **キャッシュの活用**:
   - ランキングデータのローカルキャッシュ
   - 静的ファイルの効率的なキャッシュ

3. **バッチ処理**:
   - 複数のデータ更新をバッチで処理
   - トランザクションの適切な使用

---

この設定により、セキュアで高パフォーマンスな化学反応キッチンゲームが構築できます。
