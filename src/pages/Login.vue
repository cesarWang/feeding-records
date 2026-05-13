<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/utils/supabase';

const router = useRouter();
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const isRegistering = ref(false);

const handleAuth = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '请输入邮箱和密码';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    if (isRegistering.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;
      errorMessage.value = '注册成功，请确认登录';
      isRegistering.value = false;
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;

      // 登录成功，跳转到首页
      router.push('/');
    }
  } catch (error: any) {
    errorMessage.value = error.message || '操作失败，请检查账号密码';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 relative max-w-md mx-auto shadow-xl"
  >
    <div class="w-full bg-white rounded-[32px] p-8 shadow-sm flex flex-col items-center">
      <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-8 h-8 text-pink-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2v20"></path>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </div>

      <h1 class="text-2xl font-medium text-gray-900 mb-2">{{ isRegistering ? '注册家庭账号' : '登录家庭账号' }}</h1>
      <p class="text-gray-500 text-sm mb-8 text-center">
        {{ isRegistering ? '创建一个家庭共享账号，宝爸宝妈一起记录' : '登录家庭共享账号，多端数据实时同步' }}
      </p>

      <form @submit.prevent="handleAuth" class="w-full flex flex-col gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1 ml-1">邮箱</label>
          <input
            v-model="email"
            type="email"
            placeholder="family@example.com"
            class="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1 ml-1">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all outline-none"
            required
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-red-500 text-center mt-2">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-4 mt-4 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium text-lg shadow-lg shadow-pink-200 transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
        >
          {{ isLoading ? '处理中...' : isRegistering ? '注册' : '登录' }}
        </button>
      </form>

      <button
        @click="
          isRegistering = !isRegistering;
          errorMessage = '';
        "
        class="mt-6 text-sm text-pink-400 font-medium"
      >
        {{ isRegistering ? '已有账号？去登录' : '没有账号？去注册' }}
      </button>
    </div>
  </div>
</template>
