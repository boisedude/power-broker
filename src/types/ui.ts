export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface StatChangeProps {
  value: number;
  prefix?: string;
  suffix?: string;
  animated?: boolean;
}
