import { AdminRole, AdminRolePermissions } from '../data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// Central permission checker
// ─────────────────────────────────────────────────────────────────────────────

export const can = (
  role: AdminRole | null,
  action: keyof AdminRolePermissions
): boolean => {
  if (!role) return false;
  return role.permissions[action] === true;
};

// Convenience helpers
export const canCreate   = (role: AdminRole | null) => can(role, 'create');
export const canReview   = (role: AdminRole | null) => can(role, 'review');
export const canUpdate   = (role: AdminRole | null) => can(role, 'update');
export const canDelete   = (role: AdminRole | null) => can(role, 'delete');
export const canLockSettings = (role: AdminRole | null) => can(role, 'lockSettings');
export const canLockHistory  = (role: AdminRole | null) => can(role, 'lockHistory');
export const canEmail       = (role: AdminRole | null) => can(role, 'email');
export const canWhatsapp    = (role: AdminRole | null) => can(role, 'whatsapp');

// Sidebar menu visibility per permission
export const getVisibleMenus = (role: AdminRole | null): string[] => {
  if (!role) return ['portal'];
  
  const menus = ['portal', 'dashboard'];
  
  if (can(role, 'review') || can(role, 'create') || can(role, 'update') || can(role, 'delete')) {
    menus.push('jobs');
    menus.push('candidates');
    menus.push('schedule');
  }
  
  if (!can(role, 'lockHistory')) {
    menus.push('history');
  }
  
  if (can(role, 'lockSettings')) {
    menus.push('settings');
  }
  
  return menus;
};

// Show a permission-denied toast or alert
export const permissionDenied = (action: string = 'melakukan tindakan ini') => {
  const msg = `⛔ Akses Ditolak\n\nRole Anda tidak memiliki izin untuk ${action}.\nHubungi administrator jika Anda memerlukan akses ini.`;
  alert(msg);
};
