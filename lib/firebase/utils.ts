// lib/firebase/utils.ts
import { 
    doc, 
    collection, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    query, 
    orderBy, 
    limit, 
    where,
    writeBatch,
    serverTimestamp,
    Timestamp,
    QueryDocumentSnapshot,
    DocumentData
  } from 'firebase/firestore';
  import { db } from './config';
  import { UserData } from '../types';
  
  // ランキングアイテムの型定義
  interface RankingItem {
    rank: number;
    storeName: string;
    chefName: string;
    money: number;
    totalSales?: number;  // オプショナル
    level: number;
    lastUpdated?: any;    // オプショナル
  }
  
  // ゲーム統計の型定義
  interface GameStatistics {
    totalUsers: number;
    totalMoney: number;
    totalSales: number;
    averageLevel: number;
  }
  
  // ユーザーデータをFirestoreに保存
  export async function saveUserDataToFirestore(userId: string, userData: UserData): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        lastPlayed: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
  
      // ランキング更新もトリガー
      await updateRanking(userId, userData);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }
  
  // ユーザーデータをFirestoreから読み込み
  export async function loadUserDataFromFirestore(userId: string): Promise<UserData | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Timestampを文字列に変換
        return {
          ...data,
          lastPlayed: data.lastPlayed?.toDate?.()?.toISOString() || new Date().toISOString()
        } as UserData;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }
  
  // ユーザーの存在確認
  export async function checkUserExists(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }
  
  // ランキング更新（バッチ処理）
  async function updateRanking(userId: string, userData: UserData): Promise<void> {
    try {
      const rankingRef = doc(db, 'rankings', userId);
      
      await setDoc(rankingRef, {
        userId: userId,
        storeName: userData.storeName,
        chefName: userData.chefName,
        level: userData.level,
        money: Math.floor(userData.money),
        totalSales: Math.floor(userData.totalSales),
        rank: userData.rank,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating ranking:', error);
      // ランキング更新のエラーはユーザーデータ保存を妨げない
    }
  }
  
  // 資本金ランキングTOP30を取得
  export async function getMoneyRanking(): Promise<RankingItem[]> {
    try {
      const rankingRef = collection(db, 'rankings');
      const q = query(
        rankingRef,
        orderBy('money', 'desc'),
        limit(30)
      );
      
      const querySnapshot = await getDocs(q);
      const rankings: RankingItem[] = [];
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        rankings.push({
          rank: rankings.length + 1,
          storeName: data.storeName || '',
          chefName: data.chefName || '',
          money: data.money || 0,           // 必須プロパティ
          totalSales: data.totalSales || 0,  // オプショナルだが値を設定
          level: data.level || 1,
          lastUpdated: data.lastUpdated
        });
      });
      
      return rankings;
    } catch (error) {
      console.error('Error fetching rankings:', error);
      return [];
    }
  }
  
  // 総売上ランキングTOP30を取得
  export async function getSalesRanking(): Promise<RankingItem[]> {
    try {
      const rankingRef = collection(db, 'rankings');
      const q = query(
        rankingRef,
        orderBy('totalSales', 'desc'),
        limit(30)
      );
      
      const querySnapshot = await getDocs(q);
      const rankings: RankingItem[] = [];
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        rankings.push({
          rank: rankings.length + 1,
          storeName: data.storeName || '',
          chefName: data.chefName || '',
          money: data.money || 0,           // 必須プロパティ
          totalSales: data.totalSales || 0,
          level: data.level || 1,
          lastUpdated: data.lastUpdated
        });
      });
      
      return rankings;
    } catch (error) {
      console.error('Error fetching sales rankings:', error);
      return [];
    }
  }
  
  // 統計情報を取得
  export async function getGameStatistics(): Promise<GameStatistics> {
    try {
      const rankingRef = collection(db, 'rankings');
      const querySnapshot = await getDocs(rankingRef); // querySnapshot取得を修正
      
      let totalUsers = 0;
      let totalMoney = 0;
      let totalSales = 0;
      let totalLevel = 0;
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        totalUsers++;
        totalMoney += data.money || 0;
        totalSales += data.totalSales || 0;
        totalLevel += data.level || 1;
      });
      
      return {
        totalUsers,
        totalMoney: Math.floor(totalMoney),
        totalSales: Math.floor(totalSales),
        averageLevel: totalUsers > 0 ? Math.round(totalLevel / totalUsers * 10) / 10 : 1
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalUsers: 0,
        totalMoney: 0,
        totalSales: 0,
        averageLevel: 1
      };
    }
  }
  
  // ユーザーIDを生成（store名 + chef名のハッシュ）
  export function generateUserId(storeName: string, chefName: string): string {
    // シンプルなハッシュ生成（本番環境ではより強力なハッシュを推奨）
    const combined = `${storeName.trim()}_${chefName.trim()}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash).toString(16);
  }
  
  // クリーンアップ関数（開発時用）
  export async function cleanupTestData(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Cleanup is only allowed in development environment');
      return;
    }
    
    try {
      const batch = writeBatch(db);
      
      // テストユーザーのクリーンアップ
      const usersRef = collection(db, 'users');
      const testQuery = query(usersRef, where('storeName', '==', 'Test Store'));
      const testUsers = await getDocs(testQuery);
      
      testUsers.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('Test data cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }
  