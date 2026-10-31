import Taro from '@tarojs/taro'

const KANBAN_TASKS_KEY = 'kanban_tasks'
const EISENHOWER_TASKS_KEY = 'eisenhower_tasks'

export function save(key: string, value: string): void {
  try {
    Taro.setStorageSync(key, value)
  } catch (error) {
    console.error(`Error saving to storage [${key}]:`, error)
    throw new Error(`Failed to save data: ${error}`)
  }
}

export function load(key: string): string | null {
  try {
    return Taro.getStorageSync(key) as string | null
  } catch (error) {
    console.error(`Error loading from storage [${key}]:`, error)
    return null
  }
}

export function saveKanbanTasks(jsonString: string): void {
  save(KANBAN_TASKS_KEY, jsonString)
}

export function loadKanbanTasks(): string | null {
  return load(KANBAN_TASKS_KEY)
}

export function saveEisenhowerTasks(jsonString: string): void {
  save(EISENHOWER_TASKS_KEY, jsonString)
}

export function loadEisenhowerTasks(): string | null {
  return load(EISENHOWER_TASKS_KEY)
}

export function clearAll(): void {
  try {
    Taro.removeStorageSync(KANBAN_TASKS_KEY)
    Taro.removeStorageSync(EISENHOWER_TASKS_KEY)
  } catch (error) {
    console.error('Error clearing storage:', error)
  }
}

export function getStorageInfo(): { keys: string[]; currentSize: number; limitSize: number } {
  try {
    const info = Taro.getStorageInfoSync()
    return {
      keys: info.keys,
      currentSize: info.currentSize,
      limitSize: info.limitSize
    }
  } catch (error) {
    console.error('Error getting storage info:', error)
    return { keys: [], currentSize: 0, limitSize: 0 }
  }
}
