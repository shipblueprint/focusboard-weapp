import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import thunk from 'redux-thunk'
import kanbanReducer, { KanbanStoreState } from './kanbanSlice'
import eisenhowerReducer, { EisenhowerStoreState } from './eisenhowerSlice'

export interface RootState {
  kanban: KanbanStoreState
  eisenhower: EisenhowerStoreState
}

const store = configureStore({
  reducer: {
    kanban: kanbanReducer,
    eisenhower: eisenhowerReducer
  },
  middleware: [thunk]
})

export default store
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
