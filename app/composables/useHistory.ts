import { ref } from 'vue'

// 定义历史记录项的类型
export interface HistoryItem {
  id: string
  name: string
  content: string
  timestamp: number
}

// 历史记录管理
export function useHistory() {
  const historyItems = ref<HistoryItem[]>([])
  const STORAGE_KEY = 'charTypeWriter_history'
  const MAX_HISTORY_ITEMS = 100 // 最多保存100条历史记录

  // 生成唯一ID
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 从localStorage加载历史记录
  function loadHistory(): HistoryItem[] {
    try {
      if (typeof window === 'undefined') return []
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('加载历史记录失败:', error)
      return []
    }
  }

  // 保存历史记录到localStorage
  function saveHistory(items: HistoryItem[]): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }

  // 添加历史记录项
  function addHistoryItem(name: string, content: string): void {
    const newItem: HistoryItem = {
      id: generateId(),
      name,
      content,
      timestamp: Date.now()
    }

    // 加载现有历史记录
    const existingHistory = loadHistory()

    // 添加新项到开头
    const updatedHistory = [newItem, ...existingHistory]

    // 限制历史记录数量
    if (updatedHistory.length > MAX_HISTORY_ITEMS) {
      updatedHistory.splice(MAX_HISTORY_ITEMS)
    }

    // 保存更新后的历史记录
    saveHistory(updatedHistory)

    // 更新响应式数据
    historyItems.value = updatedHistory
  }

  // 清空历史记录
  function clearHistory(): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(STORAGE_KEY)
      historyItems.value = []
    } catch (error) {
      console.error('清空历史记录失败:', error)
    }
  }

  // 初始化时加载历史记录
  function initHistory(): void {
    historyItems.value = loadHistory()
  }

  // 获取历史记录数量
  function getHistoryCount(): number {
    return historyItems.value.length
  }

  return {
    historyItems: readonly(historyItems),
    addHistoryItem,
    clearHistory,
    loadHistory,
    initHistory,
    getHistoryCount
  }
}