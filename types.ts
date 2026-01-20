export enum VaultStatus {
  UNINITIALIZED = 'UNINITIALIZED', // 未初始化
  ACTIVE_EDITING = 'ACTIVE_EDITING', // 编辑中
  FROZEN = 'FROZEN', // 已冻结（正常存储状态）
  ACTIVE_PENDING = 'ACTIVE_PENDING', // 待激活（触发条件满足）
  ACTIVE = 'ACTIVE' // 已激活（可被访问）
}

export type ThemeType = 'obsidian' | 'ethereal' | 'warm' | 'cyber';

export type AccessLevel = 'public' | 'family' | 'friend' | 'classmate';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  imageUrl?: string; // 新增：支持图片
  type: 'text' | 'image' | 'video' | 'audio';
  accessLevel: AccessLevel; // 更新：分级权限
}

export interface RoleKeys {
  family: string;
  friend: string;
  classmate: string;
}

export interface DigitalLegacy {
  ownerId: string;
  ownerName: string;
  theme: ThemeType;
  chapters: Chapter[];
  roleKeys: RoleKeys; // 新增：分级密钥配置
  triggerCondition: {
    type: 'inactivity' | 'consensus' | 'date';
    param: string | number; 
  };
  createdAt: number;
}

export interface EncryptedPacket {
  version: number;
  iv: string; 
  ciphertext: string; 
  salt: string; 
  shards: string[]; // 这里的 shards 在底层逻辑中将存储我们的 RoleKeys 密文
}

export interface DeploymentConfig {
  region: string;
  node: string;
  status: string;
}

// --- Interaction Types ---

export interface VisitLog {
  timestamp: number;
  group: AccessLevel | 'owner';
}

export interface Tribute {
  id: string;
  type: 'candle' | 'flower';
  message?: string;
  visitorName?: string; // 新增：访客署名
  timestamp: number;
  fromGroup: AccessLevel | 'owner';
}

export interface InteractionData {
  logs: VisitLog[];
  tributes: Tribute[];
}