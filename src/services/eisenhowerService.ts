import {
  EisenhowerTask,
  eisenhowerTaskToJSON,
  eisenhowerTaskFromJSON,
  EisenhowerTaskJSON,
  eisenhowerTaskCopyWith,
  getEisenhowerQuadrant
} from '../models/eisenhowerTaskModel'
import { EisenhowerQuadrant, getFlagsFromQuadrant } from '../config/eisenhowerConfig'
import { saveEisenhowerTasks, loadEisenhowerTasks } from './storageService'

export interface EisenhowerState {
  tasks: EisenhowerTask[]
  loading: boolean
  error: string | null
}

const initialState: EisenhowerState = {
  tasks: [],
  loading: false,
  error: null
}

export function eisenhowerReducer(state: EisenhowerState = initialState, action: any): EisenhowerState {
  switch (action.type) {
    case 'eisenhower/loadTasks':
      return { ...state, loading: true, error: null }
    case 'eisenhower/loadTasksSuccess':
      return { ...state, tasks: action.payload, loading: false }
    case 'eisenhower/loadTasksFailure':
      return { ...state, tasks: [], loading: false, error: action.payload }
    case 'eisenhower/addTask':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'eisenhower/updateTask':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
      }
    case 'eisenhower/deleteTask':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload)
      }
    case 'eisenhower/setTasks':
      return { ...state, tasks: action.payload }
    default:
      return state
  }
}

export function loadEisenhowerTasksFromStorage(): EisenhowerState {
  try {
    const jsonString = loadEisenhowerTasks()
    if (jsonString) {
      const tasksJson = JSON.parse(jsonString) as EisenhowerTaskJSON[]
      const tasks = tasksJson.map(eisenhowerTaskFromJSON)
      return { tasks, loading: false, error: null }
    }
    return { tasks: [], loading: false, error: null }
  } catch (error) {
    console.error('Error loading Eisenhower tasks:', error)
    return { tasks: [], loading: false, error: `Failed to load tasks: ${error}` }
  }
}

export function saveEisenhowerTasksToStorage(tasks: EisenhowerTask[]): void {
  try {
    const tasksJson = tasks.map(eisenhowerTaskToJSON)
    const jsonString = JSON.stringify(tasksJson)
    saveEisenhowerTasks(jsonString)
  } catch (error) {
    console.error('Error saving Eisenhower tasks:', error)
    throw new Error(`Failed to save tasks: ${error}`)
  }
}

export function getTasksByQuadrant(tasks: EisenhowerTask[], quadrant: EisenhowerQuadrant): EisenhowerTask[] {
  return tasks.filter(task => getEisenhowerQuadrant(task) === quadrant)
}

export function getUrgentImportantTasks(tasks: EisenhowerTask[]): EisenhowerTask[] {
  return getTasksByQuadrant(tasks, EisenhowerQuadrant.UrgentImportant)
}

export function getNotUrgentImportantTasks(tasks: EisenhowerTask[]): EisenhowerTask[] {
  return getTasksByQuadrant(tasks, EisenhowerQuadrant.NotUrgentImportant)
}

export function getUrgentNotImportantTasks(tasks: EisenhowerTask[]): EisenhowerTask[] {
  return getTasksByQuadrant(tasks, EisenhowerQuadrant.UrgentNotImportant)
}

export function getNotUrgentNotImportantTasks(tasks: EisenhowerTask[]): EisenhowerTask[] {
  return getTasksByQuadrant(tasks, EisenhowerQuadrant.NotUrgentNotImportant)
}

export function addEisenhowerTask(tasks: EisenhowerTask[], task: EisenhowerTask): EisenhowerTask[] {
  return [...tasks, task]
}

export function deleteEisenhowerTask(tasks: EisenhowerTask[], taskId: string): EisenhowerTask[] {
  return tasks.filter(t => t.id !== taskId)
}

export function updateEisenhowerTask(tasks: EisenhowerTask[], updatedTask: EisenhowerTask): EisenhowerTask[] {
  return tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
}

export function markEisenhowerTaskCompleted(tasks: EisenhowerTask[], taskId: string): EisenhowerTask[] {
  return tasks.map(t =>
    t.id === taskId ? eisenhowerTaskCopyWith(t, { isCompleted: true }) : t
  )
}

export function setEisenhowerTaskPriority(tasks: EisenhowerTask[], taskId: string, isHighPriority: boolean): EisenhowerTask[] {
  return tasks.map(t =>
    t.id === taskId ? eisenhowerTaskCopyWith(t, { isHighPriority }) : t
  )
}

export function moveTaskToQuadrant(tasks: EisenhowerTask[], taskId: string, newQuadrant: EisenhowerQuadrant): EisenhowerTask[] {
  const [isUrgent, isImportant] = getFlagsFromQuadrant(newQuadrant)
  return tasks.map(t =>
    t.id === taskId ? eisenhowerTaskCopyWith(t, { isUrgent, isImportant }) : t
  )
}

export function getQuadrantCounts(tasks: EisenhowerTask[]): Record<EisenhowerQuadrant, number> {
  const counts: Record<EisenhowerQuadrant, number> = {
    [EisenhowerQuadrant.UrgentImportant]: 0,
    [EisenhowerQuadrant.NotUrgentImportant]: 0,
    [EisenhowerQuadrant.UrgentNotImportant]: 0,
    [EisenhowerQuadrant.NotUrgentNotImportant]: 0
  }

  for (const task of tasks) {
    const quadrant = getEisenhowerQuadrant(task)
    counts[quadrant]++
  }

  return counts
}

export function getTotalTaskCount(tasks: EisenhowerTask[]): number {
  return tasks.length
}

export function getCompletedTaskCount(tasks: EisenhowerTask[]): number {
  return tasks.filter(t => t.isCompleted).length
}

export function findTaskById(tasks: EisenhowerTask[], id: string): EisenhowerTask | undefined {
  return tasks.find(t => t.id === id)
}
