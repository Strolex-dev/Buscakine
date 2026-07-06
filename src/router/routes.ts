import type { RouteRecordRaw } from 'vue-router'

// role_id convention (mirrors the React app's AppRoutes.tsx): 1 = patient, 2 = kinesiólogo, 100 = admin
declare module 'vue-router' {
  interface RouteMeta {
    roles?: number[]
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/pages/HomePage.vue') },
      { path: 'login', name: 'login', component: () => import('@/pages/LoginPage.vue') },
      { path: 'kinesiologos', name: 'nurses-list', component: () => import('@/pages/NursesListPage.vue') },
      { path: 'kinesiologos/:user_id', name: 'nurses-detail', component: () => import('@/pages/NursesDetailPage.vue') },
      { path: 'terminos', name: 'terms', component: () => import('@/pages/TermsPage.vue') },
      { path: 'quienes-somos', name: 'about-us', component: () => import('@/pages/AboutUsPage.vue') },
      { path: 'blog', name: 'blog', component: () => import('@/pages/BlogPage.vue') },
      { path: 'blog/:alias', name: 'blog-details', component: () => import('@/pages/BlogDetailsPage.vue') },
      { path: 'resultado-pago', name: 'payment-result', component: () => import('@/pages/PaymentResultPage.vue') },
      { path: 'empresas/:company_id', name: 'company-details', component: () => import('@/pages/CompanyDetailsPage.vue') },

      // Authenticated: patient (1), kinesiólogo (2)
      {
        path: 'cuenta',
        name: 'account',
        component: () => import('@/pages/AccountPage.vue'),
        meta: { roles: [1, 2] },
      },
      {
        path: 'cuenta/editar',
        name: 'account-editor',
        component: () => import('@/pages/AccountEditorPage.vue'),
        meta: { roles: [1, 2] },
      },
      {
        path: 'mensajes',
        name: 'messages',
        component: () => import('@/pages/MessagesPage.vue'),
        meta: { roles: [1, 2, 100] },
      },
      {
        path: 'mensajes/:conversation_id',
        name: 'conversation',
        component: () => import('@/pages/MessagesPage.vue'),
        meta: { roles: [1, 2, 100] },
      },

      // Admin only (100)
      { path: 'banners', name: 'admin-banners', component: () => import('@/pages/admin/BannersPage.vue'), meta: { roles: [100] } },
      { path: 'usuarios', name: 'admin-users', component: () => import('@/pages/admin/UsersPage.vue'), meta: { roles: [100] } },
      { path: 'reporte-usuarios', name: 'admin-users-report', component: () => import('@/pages/admin/UsersReportPage.vue'), meta: { roles: [100] } },
      { path: 'admin-blog', name: 'admin-blog', component: () => import('@/pages/admin/BlogAdminPage.vue'), meta: { roles: [100] } },
      { path: 'admin-mensajes', name: 'admin-messages', component: () => import('@/pages/admin/MessagesAdminPage.vue'), meta: { roles: [100] } },
      { path: 'admin-contratos', name: 'admin-orders', component: () => import('@/pages/admin/OrdersPage.vue'), meta: { roles: [100] } },
      { path: 'configuracion', name: 'admin-settings', component: () => import('@/pages/admin/SettingsPage.vue'), meta: { roles: [100] } },
      { path: 'distintivos', name: 'admin-badges', component: () => import('@/pages/admin/BadgesPage.vue'), meta: { roles: [100] } },
      { path: 'planes', name: 'admin-plans', component: () => import('@/pages/admin/PlansPage.vue'), meta: { roles: [100] } },
      { path: 'empresas', name: 'admin-companies', component: () => import('@/pages/admin/CompaniesPage.vue'), meta: { roles: [100] } },

      // Catch-all: resolves arbitrary slugs via /alias/getURL (see AliasController on the API),
      // mapping to either a blog article or a nurse detail page depending on alias type.
      { path: ':pathMatch(.*)*', name: 'alias-resolver', component: () => import('@/pages/AliasResolverPage.vue') },
    ],
  },
]
