import { Task, taskToJSON, taskFromJSON, TaskJSON, taskCopyWith } from '../models/taskModel'
import { KanbanColumn, KANBAN_COLUMNS, getWipLimit, getDefaultColumn } from '../config/kanbanConfig'
import { saveKanbanTasks, loadKanbanTasks } from './storageService'

export interface KanbanState {
  tasks: Task[]
  loading: boolean
  error: string | null
}

const initialState: KanbanState = {
  tasks: [],
  loading: false,
  error: null
}

export function kanbanReducer(state: KanbanState = initialState, action: any): KanbanState {
  switch (action.type) {
    case 'kanban/loadTasks':
      return { ...state, loading: true, error: null }
    case 'kanban/loadTasksSuccess':
      return { ...state, tasks: action.payload, loading: false }
    case 'kanban/loadTasksFailure':
      return { ...state, tasks: [], loading: false, error: action.payload }
    case 'kanban/addTask':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'kanban/updateTask':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
      }
    case 'kanban/deleteTask':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload)
      }
    case 'kanban/setTasks':
      return { ...state, tasks: action.payload }
    default:
      return state
  }
}

export function loadTasks(): KanbanState {
  try {
    const jsonString = loadKanbanTasks()
    if (jsonString) {
      const tasksJson = JSON.parse(jsonString) as TaskJSON[]
      const tasks = tasksJson.map(taskFromJSON)
      return { tasks, loading: false, error: null }
    }
    return { tasks: [], loading: false, error: null }
  } catch (error) {
    console.error('Error loading tasks:', error)
    return { tasks: [], loading: false, error: `Failed to load tasks: ${error}` }
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    const tasksJson = tasks.map(taskToJSON)
    const jsonString = JSON.stringify(tasksJson)
    saveKanbanTasks(jsonString)
  } catch (error) {
    console.error('Error saving tasks:', error)
    throw new Error(`Failed to save tasks: ${error}`)
  }
}

export function getTasksByColumn(tasks: Task[], column: KanbanColumn): Task[] {
  return tasks.filter(task => task.column === column)
}

export function getPendingTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => !task.isCompleted)
}

export function getCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.isCompleted)
}

export function getHighPriorityTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.isHighPriority && !task.isCompleted)
}

export function getWipCount(tasks: Task[], column: KanbanColumn): number {
  return getTasksByColumn(tasks, column).filter(t => !t.isCompleted).length
}

export function isWipLimitReached(tasks: Task[], column: KanbanColumn): boolean {
  const limit = getWipLimit(column)
  if (limit === null) return false
  return getWipCount(tasks, column) >= limit
}

export function addTask(tasks: Task[], task: Task): Task[] {
  return [...tasks, task]
}

export function deleteTask(tasks: Task[], taskId: string): Task[] {
  return tasks.filter(t => t.id !== taskId)
}

export function updateTask(tasks: Task[], updatedTask: Task): Task[] {
  return tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
}

export function markTaskCompleted(tasks: Task[], taskId: string): Task[] {
  return tasks.map(t =>
    t.id === taskId ? taskCopyWith(t, { isCompleted: true, column: 'Done' }) : t
  )
}

export function setTaskPriority(tasks: Task[], taskId: string, isHighPriority: boolean): Task[] {
  return tasks.map(t =>
    t.id === taskId ? taskCopyWith(t, { isHighPriority }) : t
  )
}

export function moveTask(tasks: Task[], taskId: string, newColumn: KanbanColumn): Task[] {
  return tasks.map(t =>
    t.id === taskId ? taskCopyWith(t, { column: newColumn }) : t
  )
}

export function restoreTask(tasks: Task[], taskId: string): Task[] {
  return tasks.map(t =>
    t.id === taskId ? taskCopyWith(t, { isCompleted: false, column: getDefaultColumn() }) : t
  )
}

export function reorderTasks(
  tasks: Task[],
  column: KanbanColumn,
  oldIndex: number,
  newIndex: number
): Task[] {
  const columnTasks = getTasksByColumn(tasks, column)
  if (oldIndex < 0 || oldIndex >= columnTasks.length ||
      newIndex < 0 || newIndex >= columnTasks.length) {
    return tasks
  }

  const task = columnTasks[oldIndex]
  const otherTasks = tasks.filter(t => t.column !== column)
  const reorderedColumnTasks = [...columnTasks]
  reorderedColumnTasks.splice(oldIndex, 1)
  reorderedColumnTasks.splice(newIndex, 0, task)

  return [...otherTasks, ...reorderedColumnTasks]
}
