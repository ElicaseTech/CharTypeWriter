<template>
  <div class="w-screen h-screen text-white flex flex-col">

    <!-- 标题 -->
    <!-- <div class="text-center py-6">
      <h1 class="text-3xl font-bold">历史记录</h1>
    </div> -->

    <!-- 历史记录容器 -->
    <div class="flex-1 overflow-hidden relative">
      <div
        ref="historyContainer"
        class="history-container h-full overflow-hidden"
        @scroll="handleScroll"
      >
        <!-- 底部占位，用于实现从下往上滚动的效果 -->
        <div class="h-4"></div>

        <div class="p-4 space-y-4 min-h-full flex flex-col justify-end">
          <!-- 历史记录项 -->
          <TransitionGroup name="slide-up" tag="div" class="space-y-4">
            <div
              v-for="(item, index) in reversedHistoryItems"
              :key="item.id"
              class="history-item"
            >
              <div class=" rounded-lg p-4  ">
                <!-- 时间戳 -->
                <div class="text-xs text-gray-500 mb-2">
                  {{ formatTime(item.timestamp) }}
                </div>

                <!-- 用户名 -->
                <div class="text-sm text-blue-400 font-semibold mb-2">
                  {{ item.name }}
                </div>

                <!-- 消息内容 -->
                <div class="text-white whitespace-pre-line">
                  {{ item.content }}
                </div>
              </div>
            </div>
          </TransitionGroup>

          <!-- 空状态 -->
          <!-- <div v-if="historyItems.length === 0" class="text-center py-12">
            <div class="text-gray-500 text-lg">暂无历史记录</div>
            <div class="text-gray-600 text-sm mt-2">当主页面的消息消失后，会在这里显示</div>
          </div> -->
        </div>
      </div>
    </div>

    <!-- 底部统计信息 -->
    <!-- <div class="p-4 border-t border-gray-700">
      <div class="text-center text-sm text-gray-400">
        共 {{ historyItems.length }} 条历史记录
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'

// 定义历史记录项的类型
interface HistoryItem {
  id: string
  name: string
  content: string
  timestamp: number
}

// 获取历史记录数据
const historyItems = ref<HistoryItem[]>([])
const historyContainer = ref<HTMLElement>()
const isAutoScrolling = ref(false)

// 反转历史记录顺序，实现从下往上的效果
const reversedHistoryItems = computed(() => {
  return [...historyItems.value].reverse()
})

// 格式化时间戳
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 从localStorage加载历史记录
function loadHistory(): void {
  try {
    const stored = localStorage.getItem('charTypeWriter_history')
    if (stored) {
      historyItems.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 滚动到底部（最新消息）
function scrollToBottom(): void {
  if (historyContainer.value) {
    isAutoScrolling.value = true
    historyContainer.value.scrollTop = historyContainer.value.scrollHeight

    // 重置自动滚动标志
    setTimeout(() => {
      isAutoScrolling.value = false
    }, 100)
  }
}

// 处理滚动事件
function handleScroll(): void {
  if (isAutoScrolling.value) return

  const container = historyContainer.value
  if (!container) return

  const { scrollTop, scrollHeight, clientHeight } = container
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight

  // 如果用户滚动到接近底部，自动滚动到底部
  if (distanceFromBottom < 50) {
    scrollToBottom()
  }
}

// 页面挂载时加载历史记录
onMounted(() => {
  loadHistory()

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
})

// 监听历史记录变化，自动滚动到底部
watch(historyItems, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 监听来自其他页面的历史记录更新
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'charTypeWriter_history') {
      loadHistory()
    }
  })
}

// 设置页面标题
useHead({
  title: '历史记录 - CharTypeWriter'
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 4px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 从下往上的进入动画 */
.slide-up-enter-active {
  transition: all 0.6s ease-out;
}

.slide-up-leave-active {
  transition: all 0.3s ease-in;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.slide-up-move {
  transition: transform 0.6s ease-out;
}

/* 历史记录项动画延迟 */
.history-item:nth-child(1) {
  transition-delay: 0s;
}

.history-item:nth-child(2) {
  transition-delay: 0.1s;
}

.history-item:nth-child(3) {
  transition-delay: 0.2s;
}

.history-item:nth-child(4) {
  transition-delay: 0.3s;
}

.history-item:nth-child(5) {
  transition-delay: 0.4s;
}

/* 容器样式优化 */
.history-container {
  scroll-behavior: smooth;
}

/* 新消息高亮动画 */
@keyframes highlight-new {
  0% {
    background-color: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
  }
  100% {
    background-color: rgba(31, 41, 55, 0.6);
    border-color: rgba(75, 85, 99, 1);
  }
}

.new-message {
  animation: highlight-new 2s ease-out forwards;
}
</style>