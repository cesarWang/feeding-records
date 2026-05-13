<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/utils/supabase';

const router = useRouter();
const recentRecords = ref<any[]>([]);

const logout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};

const goToBreastFeeding = () => {
  router.push('/breast-feeding');
};

const fetchRecords = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('feeding_records')
    .select('*')
    .eq('user_id', user.id)
    .order('feeding_time', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Fetch error:', error);
  }

  if (data) {
    recentRecords.value = data;
  }
};

// 订阅实时变化
const subscribeToRecords = () => {
  supabase
    .channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'feeding_records' }, () => {
      fetchRecords();
    })
    .subscribe();
};

onMounted(() => {
  fetchRecords();
  subscribeToRecords();
});

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatType = (type: string) => {
  const map: Record<string, string> = {
    breast_milk_left: '母乳 (左)',
    breast_milk_right: '母乳 (右)',
    formula: '配方奶',
    complementary_food: '辅食',
  };
  return map[type] || type;
};
</script>

<template>
  <div class="min-h-screen bg-pink-50 flex flex-col items-center p-6 relative max-w-md mx-auto shadow-xl">
    <header class="w-full flex justify-between items-center pt-8 mb-8">
      <h1 class="text-2xl font-medium text-gray-900">喂养记录</h1>
      <button @click="logout" class="text-sm text-gray-500 hover:text-gray-800">退出登录</button>
    </header>

    <div class="w-full grid grid-cols-2 gap-4 mb-8">
      <!-- 母乳喂养入口 -->
      <button
        @click="goToBreastFeeding"
        class="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 border border-pink-100"
      >
        <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
          <span class="text-2xl">🤱</span>
        </div>
        <span class="font-medium text-gray-800">母乳喂养</span>
      </button>

      <!-- 配方奶入口 (Mock) -->
      <button
        class="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 border border-blue-50"
      >
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <span class="text-2xl">🍼</span>
        </div>
        <span class="font-medium text-gray-800">配方奶</span>
      </button>
    </div>

    <!-- 最近记录 -->
    <div class="w-full bg-white rounded-3xl p-6 shadow-sm">
      <h2 class="text-lg font-medium text-gray-900 mb-4">最近记录 (云端同步)</h2>

      <div v-if="recentRecords.length === 0" class="text-center text-gray-400 py-4">暂无记录，快去添加吧</div>

      <div v-else class="flex flex-col gap-3">
        <div
          v-for="record in recentRecords"
          :key="record.id"
          class="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0"
        >
          <div class="flex flex-col">
            <span class="text-gray-800 font-medium">{{ formatType(record.feeding_type) }}</span>
            <span class="text-xs text-gray-400">{{ formatTime(record.feeding_time) }}</span>
          </div>
          <div class="text-pink-500 font-medium">
            {{ record.duration ? `${record.duration} ${record.unit}` : `${record.amount} ${record.unit}` }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
