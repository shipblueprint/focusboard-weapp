export const KANBAN_COLUMNS = ['To Do', 'In Progress', 'Done'] as const
export type KanbanColumn = typeof KANBAN_COLUMNS[number]

export const wipLimits: Record<KanbanColumn, number | null> = {
  'To Do': 5,
  'In Progress': 3,
  'Done': null
}

export const columnColors: Record<KanbanColumn, string> = {
  'To Do': '#2196F3',
  'In Progress': '#FF9800',
  'Done': '#4CAF50'
}

export const columnIcons: Record<KanbanColumn, string> = {
  'To Do': 'list',
  'In Progress': 'pending_actions',
  'Done': 'check_circle'
}

export function getColumnColor(column: KanbanColumn): string {
  return columnColors[column] ?? '#9E9E9E'
}

export function getWipLimit(column: KanbanColumn): number | null {
  return wipLimits[column]
}

export function isValidColumn(column: string): column is KanbanColumn {
  return KANBAN_COLUMNS.includes(column as KanbanColumn)
}

export function getDefaultColumn(): KanbanColumn {
  return 'To Do'
}

export enum KanbanActions {
  Complete = 'complete',
  SetPriority = 'set_priority',
  RemovePriority = 'remove_priority',
  Edit = 'edit',
  Delete = 'delete',
  Restore = 'restore'
}

export const activeTaskActions: KanbanActions[] = [
  KanbanActions.Complete,
  KanbanActions.SetPriority,
  KanbanActions.Edit,
  KanbanActions.Delete
]

export const doneTaskActions: KanbanActions[] = [
  KanbanActions.Restore,
  KanbanActions.Delete
]

export function getAvailableActions(isCompleted: boolean): KanbanActions[] {
  return isCompleted ? doneTaskActions : activeTaskActions
}

export function getActionLabel(action: KanbanActions, isHighPriority: boolean = false): string {
  switch (action) {
    case KanbanActions.Complete:
      return 'Mark as Completed'
    case KanbanActions.SetPriority:
      return isHighPriority ? 'Remove High Priority' : 'Set High Priority'
    case KanbanActions.RemovePriority:
      return 'Remove High Priority'
    case KanbanActions.Edit:
      return 'Edit Task'
    case KanbanActions.Delete:
      return 'Delete Task'
    case KanbanActions.Restore:
      return 'Move to To Do'
    default:
      return action
  }
}
