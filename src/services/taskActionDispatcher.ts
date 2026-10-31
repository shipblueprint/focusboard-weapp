import { Task } from '../models/taskModel'
import { KanbanActions, getAvailableActions } from '../config/kanbanConfig'

export interface TaskActionHandler {
  (tasks: Task[], taskId: string): Task[]
}

export const actionHandlers: Record<KanbanActions, TaskActionHandler | null> = {
  [KanbanActions.Complete]: (tasks, taskId) =>
    tasks.map(t => t.id === taskId ? { ...t, isCompleted: true, column: 'Done' as const } : t),
  [KanbanActions.SetPriority]: (tasks, taskId) =>
    tasks.map(t => t.id === taskId ? { ...t, isHighPriority: true } : t),
  [KanbanActions.RemovePriority]: (tasks, taskId) =>
    tasks.map(t => t.id === taskId ? { ...t, isHighPriority: false } : t),
  [KanbanActions.Edit]: null,
  [KanbanActions.Delete]: (tasks, taskId) => tasks.filter(t => t.id !== taskId),
  [KanbanActions.Restore]: (tasks, taskId) =>
    tasks.map(t => t.id === taskId ? { ...t, isCompleted: false, column: 'To Do' as const } : t)
}

export function dispatchAction(
  action: KanbanActions,
  tasks: Task[],
  taskId: string
): Task[] {
  const handler = actionHandlers[action]
  if (handler) {
    return handler(tasks, taskId)
  }
  return tasks
}

export function hasAction(action: string): action is KanbanActions {
  return Object.values(KanbanActions).includes(action as KanbanActions)
}

export function getTaskAvailableActions(isCompleted: boolean): KanbanActions[] {
  return getAvailableActions(isCompleted)
}

export function getActionMessage(action: KanbanActions): string {
  switch (action) {
    case KanbanActions.Complete:
      return 'Task moved to Done!'
    case KanbanActions.SetPriority:
      return 'Task marked as high priority!'
    case KanbanActions.RemovePriority:
      return 'High priority removed!'
    case KanbanActions.Edit:
      return ''
    case KanbanActions.Delete:
      return 'Task deleted!'
    case KanbanActions.Restore:
      return 'Task restored to To Do!'
    default:
      return 'Action completed'
  }
}
