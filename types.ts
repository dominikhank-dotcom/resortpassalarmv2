export enum UserRole {
  GUEST = 'GUEST',
  CUSTOMER = 'CUSTOMER',
  AFFILIATE = 'AFFILIATE',
  ADMIN = 'ADMIN'
}

export interface AffiliateStats {
  clicks: number;
  conversions: number;
  earnings: number;
  history: { date: string; clicks: number; conversions: number }[];
}

export interface MonitorStatus {
  isActive: boolean;
  lastChecked: string;
  isAvailable: boolean;
  url: string;
}

export interface NotificationConfig {
  email: string;
  sms: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'CUSTOMER' | 'PARTNER';
  subject: string;
  body: string; // HTML content
  variables: string[]; // e.g. ['{name}', '{link}']
  isEnabled: boolean;
}