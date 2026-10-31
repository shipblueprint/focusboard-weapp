import { Task, createTask } from '../models/taskModel'
import { EisenhowerTask, getEisenhowerQuadrant } from '../models/eisenhowerTaskModel'
import { EisenhowerQuadrant, getFlagsFromQuadrant } from '../config/eisenhowerConfig'
import { getDefaultColumn } from '../config/kanbanConfig'

export interface TransferResult {
  success: boolean
  transferredCount: number
  error?: string
}

export function transferDoFirstTasksToKanban(
  eisenhowerTasks: EisenhowerTask[],
  kanbanTasks: Task[]
): { eisenhowerTasks: EisenhowerTask[], kanbanTasks: Task[] } {
  const doFirstTasks = eisenhowerTasks.filter(
    task => getEisenhowerQuadrant(task) === EisenhowerQuadrant.UrgentImportant
  )

  if (doFirstTasks.length === 0) {
    return { eisenhowerTasks, kanbanTasks }
  }

  const newKanbanTasks: Task[] = doFirstTasks.map(eisenhowerTask => {
    const isHighPriority = eisenhowerTask.isHighPriority ||
                          (eisenhowerTask.isUrgent && eisenhowerTask.isImportant)
    return createTask({
      id: eisenhowerTask.id,
      title: eisenhowerTask.title,
      isCompleted: eisenhowerTask.isCompleted,
      isHighPriority,
      column: getDefaultColumn()
    })
  })

  const remainingEisenhowerTasks = eisenhowerTasks.filter(
    task => getEisenhowerQuadrant(task) !== EisenhowerQuadrant.UrgentImportant
  )

  return {
    eisenhowerTasks: remainingEisenhowerTasks,
    kanbanTasks: [...kanbanTasks, ...newKanbanTasks]
  }
}

export function getDoFirstTasksCount(tasks: EisenhowerTask[]): number {
  return tasks.filter(task => getEisenhowerQuadrant(task) === EisenhowerQuadrant.UrgentImportant).length
}

export function bulkCreateEisenhowerTasks(
  texts: string[],
  isUrgent: boolean,
  isImportant: boolean
): EisenhowerTask[] {
  const [baseIsUrgent, baseIsImportant] = getFlagsFromQuadrant(
    isUrgent && isImportant
      ? EisenhowerQuadrant.UrgentImportant
      : !isUrgent && isImportant
        ? EisenhowerQuadrant.NotUrgentImportant
        : isUrgent && !isImportant
          ? EisenhowerQuadrant.UrgentNotImportant
          : EisenhowerQuadrant.NotUrgentNotImportant
  )

  return texts.map((text, index) => ({
    id: `${Date.now()}_${index}_${text.hashCode}`,
    title: text.trim(),
    isCompleted: false,
    isHighPriority: false,
    column: 'Eisenhower' as any,
    isUrgent: baseIsUrgent,
    isImportant: baseIsImportant
  }))
}
