<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { X, Play, Pause } from 'lucide-vue-next'
import { supabase } from '@/utils/supabase'

const router = useRouter()

// 模式切换：'timer' | 'manual'
const mode = ref<'timer' | 'manual'>('timer')

// 左右侧状态
const leftTime = ref(0)
const rightTime = ref(0)
const activeSide = ref<'left' | 'right' | null>(null)
const isSaving = ref(false)

let timer: number | null = null

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const toggleTimer = (side: 'left' | 'right') => {
  if (activeSide.value === side) {
    // 暂停当前
    activeSide.value = null
    if (timer) clearInterval(timer)
  } else {
    // 切换到这一侧
    activeSide.value = side
    if (timer) clearInterval(timer)
    timer = window.setInterval(() => {
      if (activeSide.value === 'left') {
        leftTime.value++
      } else if (activeSide.value === 'right') {
        rightTime.value++
      }
    }, 1000)
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const close = () => {
  router.back()
}

const save = async () => {
  // 停止计时
  if (timer) clearInterval(timer)
  activeSide.value = null
  
  // 对于计时模式，leftTime 是秒；手动模式下，leftTime/rightTime 是分钟
  let leftMinutes = mode.value === 'timer' ? Math.round(leftTime.value / 60) : leftTime.value
  let rightMinutes = mode.value === 'timer' ? Math.round(rightTime.value / 60) : rightTime.value
  
  if (leftMinutes === 0 && rightMinutes === 0) {
    alert('时长不能为0')
    return
  }

  isSaving.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const records = []
    
    // 如果左侧有记录
    if (leftMinutes > 0) {
      records.push({
        user_id: user.id,
        feeding_time: new Date().toISOString(),
        feeding_type: 'breast_milk_left',
        duration: leftMinutes,
        unit: 'min',
        note: mode.value === 'manual' ? '手动记录' : '计时记录'
      })
    }

    // 如果右侧有记录
    if (rightMinutes > 0) {
      records.push({
        user_id: user.id,
        feeding_time: new Date().toISOString(),
        feeding_type: 'breast_milk_right',
        duration: rightMinutes,
        unit: 'min',
        note: mode.value === 'manual' ? '手动记录' : '计时记录'
      })
    }

    const { error } = await supabase.from('feeding_records').insert(records)
    if (error) throw error

    // 保存成功后返回首页
    router.back()
  } catch (error: any) {
    console.error('保存失败:', error)
    alert('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

</script>

<template>
  <div class="min-h-screen bg-pink-50 flex flex-col relative max-w-md mx-auto shadow-xl">
    <!-- Header -->
    <header class="flex items-center px-4 pt-12 pb-4 relative">
      <button @click="close" class="p-2 -ml-2 text-gray-800 z-10">
        <X class="w-6 h-6" />
      </button>
      <div class="absolute inset-0 flex flex-col items-center justify-center pt-10 pointer-events-none">
        <h1 class="text-lg font-medium text-gray-900">母乳</h1>
        <p class="text-sm text-gray-500 mt-1">上次：4分钟前</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-4 mt-6 flex flex-col">
      <div class="bg-white rounded-[32px] p-6 shadow-sm flex-1 flex flex-col items-center">
        
        <!-- Segmented Control -->
        <div class="bg-gray-100 p-1 rounded-full flex w-56 mb-12">
          <button 
            @click="mode = 'timer'"
            class="flex-1 py-2 text-sm rounded-full transition-colors"
            :class="mode === 'timer' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'"
          >
            计时
          </button>
          <button 
            @click="mode = 'manual'"
            class="flex-1 py-2 text-sm rounded-full transition-colors"
            :class="mode === 'manual' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'"
          >
            手动输入
          </button>
        </div>

        <div v-if="mode === 'timer'" class="flex-1 flex items-center justify-center w-full gap-10">
          <!-- Left Button -->
          <div class="flex flex-col items-center gap-6">
            <span class="text-pink-400 font-medium text-lg">左</span>
            <button 
              @click="toggleTimer('left')"
              class="w-28 h-28 rounded-full bg-white shadow-[0_8px_30px_rgb(255,182,193,0.4)] flex items-center justify-center transition-all active:scale-95 relative"
              :class="{ 'ring-4 ring-pink-100 scale-105': activeSide === 'left' }"
            >
              <Pause v-if="activeSide === 'left'" class="w-10 h-10 text-pink-400 fill-pink-400" />
              <Play v-else class="w-10 h-10 text-pink-400 fill-pink-400 ml-1" />
            </button>
            <span class="text-gray-400 font-medium text-xl tracking-wider" :class="{ 'text-pink-400': activeSide === 'left' }">
              {{ formatTime(leftTime) }}
            </span>
          </div>

          <!-- Right Button -->
          <div class="flex flex-col items-center gap-6">
            <span class="text-pink-400 font-medium text-lg">右</span>
            <button 
              @click="toggleTimer('right')"
              class="w-28 h-28 rounded-full bg-white shadow-[0_8px_30px_rgb(255,182,193,0.4)] flex items-center justify-center transition-all active:scale-95 relative"
              :class="{ 'ring-4 ring-pink-100 scale-105': activeSide === 'right' }"
            >
              <Pause v-if="activeSide === 'right'" class="w-10 h-10 text-pink-400 fill-pink-400" />
              <Play v-else class="w-10 h-10 text-pink-400 fill-pink-400 ml-1" />
            </button>
            <span class="text-gray-400 font-medium text-xl tracking-wider" :class="{ 'text-pink-400': activeSide === 'right' }">
              {{ formatTime(rightTime) }}
            </span>
          </div>
        </div>
        
        <div v-else class="flex-1 flex flex-col items-center justify-center w-full">
           <!-- Manual input implementation will go here -->
           <div class="text-center w-full px-4">
             <div class="flex justify-between items-center mb-8">
               <span class="text-gray-600 text-lg">左侧时长</span>
               <div class="flex items-center gap-2">
                 <input type="number" v-model.number="leftTime" class="w-20 text-center text-xl border-b-2 border-pink-200 focus:border-pink-400 outline-none pb-1" />
                 <span class="text-gray-400">分钟</span>
               </div>
             </div>
             <div class="flex justify-between items-center">
               <span class="text-gray-600 text-lg">右侧时长</span>
               <div class="flex items-center gap-2">
                 <input type="number" v-model.number="rightTime" class="w-20 text-center text-xl border-b-2 border-pink-200 focus:border-pink-400 outline-none pb-1" />
                 <span class="text-gray-400">分钟</span>
               </div>
             </div>
           </div>
        </div>

      </div>
    </main>

    <!-- Bottom Button -->
    <div class="p-6 pb-10">
      <button 
        @click="save"
        :disabled="isSaving"
        class="w-full py-4 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium text-lg shadow-lg shadow-pink-200 transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
      >
        {{ isSaving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>
