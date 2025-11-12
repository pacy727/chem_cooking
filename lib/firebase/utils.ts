// lib/firebase/utils.ts
import { 
  doc, 
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  orderBy, 
  limit,
  where,  // ← これを追加
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';
import { UserData } from '../types';

// ランキングアイテムの型定義
interface RankingItem {
  rank: number;
  storeName: string;
  money: number;
  totalSales: number;
  level: number;
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

    // ★ rankings コレクションへの保存を削除
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

// ★ 資本金ランキングTOP30を取得（usersコレクションから直接取得）
export async function getMoneyRanking(): Promise<RankingItem[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
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
        money: data.money || 0,
        totalSales: data.totalSales || 0,
        level: data.level || 1
      });
    });
    
    return rankings;
  } catch (error) {
    console.error('Error fetching money rankings:', error);
    return [];
  }
}

// ★ 総売上ランキングTOP30を取得（usersコレクションから直接取得）
export async function getSalesRanking(): Promise<RankingItem[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
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
        money: data.money || 0,
        totalSales: data.totalSales || 0,
        level: data.level || 1
      });
    });
    
    return rankings;
  } catch (error) {
    console.error('Error fetching sales rankings:', error);
    return [];
  }
}

// ★ 統計情報を取得（usersコレクションから集計）
export async function getGameStatistics(): Promise<GameStatistics> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
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

// Store名の重複チェック関数を追加
export async function checkStoreNameExists(storeName: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('storeName', '==', storeName),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking store name existence:', error);
    // エラー時はローカルストレージで確認
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('chemKitchenUsers') || '{}');
      return Object.values(users).some((user: any) => user.storeName === storeName);
    }
    return false;
  }
}

// ユーザーIDを生成（store名 + chef名のハッシュ）
export function generateUserId(storeName: string, chefName: string): string {
  const combined = `${storeName.trim()}_${chefName.trim()}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}