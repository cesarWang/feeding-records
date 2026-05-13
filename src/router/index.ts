import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import BreastFeeding from '@/pages/BreastFeeding.vue';
import Login from '@/pages/Login.vue';
import { supabase } from '@/utils/supabase';

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/breast-feeding',
    name: 'breast-feeding',
    component: BreastFeeding,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (to.meta.requiresAuth && !session) {
    next('/login');
  } else if (to.name === 'login' && session) {
    next('/');
  } else {
    next();
  }
});

export default router;
