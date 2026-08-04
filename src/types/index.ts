// FLOODED - Core Data Types

export type HealthStatus = 'ok' | 'injured' | 'critical' | 'unconscious';
export type SyncStatus = 'pending' | 'synced' | 'failed';
export type ScenarioType = 
  | 'house_flooding'
  | 'person_injured'
  | 'person_unconscious'
  | 'trapped_vehicle'
  | 'building_collapse'
  | 'power_outage'
  | 'water_contamination'
  | 'medical_emergency';

export interface Device {
  id: string;
  createdAt: number;
  lastSeen: number;
  name?: string;
}

export interface MedicalProfile {
  bloodType?: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

// Enhanced Emergency Profile for F1
export interface EmergencyProfile {
  id: string;
  fullName: string;
  birthYear?: number;
  phone?: string;
  address?: string; // Địa chỉ
  province?: string; // Tỉnh/thành
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  conditions: string[]; // Bệnh nền
  allergies: string[];
  medications: string[];
  specialNotes?: string; // max 120 chars
  medicalNote?: string; // Ghi chú y tế ngắn, max 80 chars
  location?: {
    latitude: number;
    longitude: number;
    address?: string; // Reverse geocode when online
    updatedAt?: number;
  };
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
}

export interface SOSReport {
  id: string;
  deviceId: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  peopleCount: number;
  healthStatus: HealthStatus;
  scenarioType?: ScenarioType;
  description?: string;
  medicalProfile?: MedicalProfile;
  needTags?: string[]; // Quick need tags
  syncStatus: SyncStatus;
  syncedAt?: number;
  pickedUpBy?: string; // Data mule device ID
  pickedUpAt?: number;
  // F6: Remote SOS
  isRemoteSOS?: boolean;
  remotePersonName?: string;
  remotePersonPhone?: string;
  remotePersonAddress?: string;
}

export interface SurvivalScenario {
  id: ScenarioType;
  titleVi: string;
  titleEn: string;
  iconName: string;
  steps: SurvivalStep[];
  doNot: string[];
}

export interface SurvivalStep {
  timeframe: string;
  actionVi: string;
  actionEn: string;
  critical?: boolean;
}

export interface NearbyDevice {
  id: string;
  name: string;
  distance: number; // meters (simulated)
  lastSeen: number;
  sosCount: number;
  status: 'active' | 'inactive';
}

export interface SyncLog {
  id: string;
  timestamp: number;
  action: 'push' | 'receive' | 'pickup';
  reportIds: string[];
  success: boolean;
  error?: string;
}

export interface AppSettings {
  lowPowerMode: boolean;
  language: 'vi' | 'en';
  syncIntervalMs: number;
  lastSyncAt?: number;
  rescueMode?: boolean; // Enable rescue dashboard
  senderLabel?: string; // For community posts "Nhà 1", "Nhà 10"
  ttsEnabled?: boolean; // Text-to-speech
  accentColor?: string; // User-selected accent color hex
}

// F5: Community Bulletin Board
export type CommunityPostType = 'checkin' | 'need' | 'offer';

export interface CommunityPostReply {
  id: string;
  parentId: string;
  senderLabel: string;
  items: string[];
  note: string; // max 60 chars
  createdAt: number;
  ttlMinutes: number;
}

export interface CommunityPost {
  id: string;
  type: CommunityPostType;
  senderLabel: string;
  items: string[];
  note: string; // max 60 chars
  createdAt: number;
  ttlMinutes: number; // default 180
  hops: number; // mesh propagation count
  isExpired?: boolean;
  replies?: CommunityPostReply[];
}

// F6: Remote SOS (from safe zone)
export interface RemoteSOSReport {
  id: string;
  personName: string;
  personPhone?: string;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  needTags: string[];
  note: string; // max 120 chars
  createdAt: number;
  syncStatus: SyncStatus;
}

// Missing Person Request (Dashboard)
export interface MissingPersonRequest {
  id: string;
  personName: string;
  province: string; // required
  areaDescription?: string;
  contactPhone: string;
  note: string; // max 120 chars
  status: 'new' | 'processing' | 'contacted' | 'closed';
  createdAt: number;
}
