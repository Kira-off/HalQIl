export const ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    me: '/auth/users/me/',
  },
  orders: {
    list: '/orders/',
    create: '/orders/',
    getById: (id: number | string) => `/orders/${id}/`,
    updateStatus: (id: number | string) => `/orders/${id}/`,
  },
  provider: {
    apply: '/provider/apply/',
    schedule: '/provider/schedule/',
    services: '/provider/skills/',
  },
  admin: {
    users: '/admin/users/',
    applications: '/admin/applications/',
    disputes: '/admin/orders/disputed/',
    notify: '/admin/notifications/broadcast/',
  },
} as const;
