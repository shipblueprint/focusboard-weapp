import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  EisenhowerTask,
  eisenhowerTaskToJSON,
  eisenhowerTaskFromJSON,
  EisenhowerTaskJSON
} from '../models/eisenhowerTaskModel'
import { EisenhowerQuadrant } from '../config/eisenhowerConfig'
import { saveEisenhowerTasks, loadEisenhowerTasks } from '../services/storageService'

export interface EisenhowerStoreState {
  tasks: EisenhowerTask[]
  loading: boolean
  error: string | null
}

const initialState: EisenhowerStoreState = {
  tasks: [],
  loading: false,
  error: null
}

const eisenhowerSlice = createSlice({
  name: 'eisenhower',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<EisenhowerTask[]>) => {
      state.tasks = action.payload
    },
    addTask: (state, action: PayloadAction<EisenhowerTask>) => {
      state.tasks.push(action.payload)
    },
    addBulkTasks: (state, action: PayloadAction<EisenhowerTask[]>) => {
      state.tasks.push(...action.payload)
    },
    updateTask: (state, action: PayloadAction<EisenhowerTask>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },
    removeTasksByQuadrant: (state, action: PayloadAction<EisenhowerQuadrant>) => {
      const quadrant = action.payload
      state.tasks = state.tasks.filter(task => {
        const isUrgent = task.isUrgent
        const isImportant = task.isImportant
        if (quadrant === EisenhowerQuadrant.UrgentImportant) return !(isUrgent && isImportant)
        if (quadrant === EisenhowerQuadrant.NotUrgentImportant) return !(!isUrgent && isImportant)
        if (quadrant === EisenhowerQuadrant.UrgentNotImportant) return !(isUrgent && !isImportant)
        return !(!isUrgent && !isImportant)
      })
    },
    moveTaskToQuadrant: (state, action: PayloadAction<{ taskId: string; quadrant: EisenhowerQuadrant }>) => {
      const { taskId, quadrant } = action.payload
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        if (quadrant === EisenhowerQuadrant.UrgentImportant) {
          task.isUrgent = true
          task.isImportant = true
        } else if (quadrant === EisenhowerQuadrant.NotUrgentImportant) {
          task.isUrgent = false
          task.isImportant = true
        } else if (quadrant === EisenhowerQuadrant.UrgentNotImportant) {
          task.isUrgent = true
          task.isImportant = false
        } else {
          task.isUrgent = false
          task.isImportant = false
        }
      }
    },
    markTaskCompleted: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(t => t.id === action.payload)
      if (task) {
        task.isCompleted = !task.isCompleted
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const eisenhowerActions = eisenhowerSlice.actions

export const loadEisenhowerTasksAsync = createAsyncThunk(
  'eisenhower/loadTasks',
  async (_, { dispatch }) => {
    dispatch(eisenhowerActions.setLoading(true))
    try {
      const jsonString = loadEisenhowerTasks()
      if (jsonString) {
        const tasksJson = JSON.parse(jsonString) as EisenhowerTaskJSON[]
        const tasks = tasksJson.map(eisenhowerTaskFromJSON)
        dispatch(eisenhowerActions.setTasks(tasks))
      }
    } catch (error) {
      dispatch(eisenhowerActions.setError(`Failed to load tasks: ${error}`))
    }
    dispatch(eisenhowerActions.setLoading(false))
  }
)

export const saveEisenhowerTasksAsync = createAsyncThunk(
  'eisenhower/saveTasks',
  async (_, { dispatch, getState }) => {
    try {
      const tasks = (getState() as RootState).eisenhower.tasks
      const tasksJson = tasks.map(eisenhowerTaskToJSON)
      saveEisenhowerTasks(JSON.stringify(tasksJson))
    } catch (error) {
      dispatch(eisenhowerActions.setError(`Failed to save tasks: ${error}`))
    }
  }
)

import { RootState } from './index'
export default eisenhowerSlice.reducer
