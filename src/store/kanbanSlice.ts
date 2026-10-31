import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Task, taskToJSON, taskFromJSON, TaskJSON } from '../models/taskModel'
import { KanbanColumn } from '../config/kanbanConfig'
import { saveKanbanTasks, loadKanbanTasks } from '../services/storageService'

export interface KanbanStoreState {
  tasks: Task[]
  loading: boolean
  error: string | null
}

const initialState: KanbanStoreState = {
  tasks: [],
  loading: false,
  error: null
}

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload)
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },
    moveTask: (state, action: PayloadAction<{ taskId: string; targetColumn: KanbanColumn }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        task.column = action.payload.targetColumn
      }
    },
    markTaskCompleted: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(t => t.id === action.payload)
      if (task) {
        task.isCompleted = true
        task.column = 'Done'
      }
    },
    setTaskPriority: (state, action: PayloadAction<{ taskId: string; isHighPriority: boolean }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        task.isHighPriority = action.payload.isHighPriority
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

export const kanbanActions = kanbanSlice.actions

export const loadKanbanTasksAsync = createAsyncThunk(
  'kanban/loadTasks',
  async (_, { dispatch }) => {
    dispatch(kanbanActions.setLoading(true))
    try {
      const jsonString = loadKanbanTasks()
      if (jsonString) {
        const tasksJson = JSON.parse(jsonString) as TaskJSON[]
        const tasks = tasksJson.map(taskFromJSON)
        dispatch(kanbanActions.setTasks(tasks))
      }
    } catch (error) {
      dispatch(kanbanActions.setError(`Failed to load tasks: ${error}`))
    }
    dispatch(kanbanActions.setLoading(false))
  }
)

export const saveKanbanTasksAsync = createAsyncThunk(
  'kanban/saveTasks',
  async (_, { dispatch, getState }) => {
    try {
      const tasks = (getState() as RootState).kanban.tasks
      const tasksJson = tasks.map(taskToJSON)
      saveKanbanTasks(JSON.stringify(tasksJson))
    } catch (error) {
      dispatch(kanbanActions.setError(`Failed to save tasks: ${error}`))
    }
  }
)

import { RootState } from './index'
export default kanbanSlice.reducer
