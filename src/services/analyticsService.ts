import { Task } from '../models/taskModel'
import { EisenhowerTask, getEisenhowerQuadrant } from '../models/eisenhowerTaskModel'
import { EisenhowerQuadrant, getQuadrantName, getQuadrantChartColor } from '../config/eisenhowerConfig'
import { KANBAN_COLUMNS } from '../config/kanbanConfig'

export interface ChartData {
  label: string
  value: number
  color: string
}

export interface KanbanAnalytics {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  highPriorityTasks: number
  columnDistribution: Record<string, number>
  completionRate: number
}

export interface EisenhowerAnalytics {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  highPriorityTasks: number
  quadrantDistribution: Record<string, number>
  completionRate: number
}

export interface CombinedAnalytics {
  kanban: KanbanAnalytics
  eisenhower: EisenhowerAnalytics
  totalTasks: number
  totalCompleted: number
  overallCompletionRate: number
}

export function getKanbanAnalytics(tasks: Task[]): KanbanAnalytics {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.isCompleted).length
  const pendingTasks = totalTasks - completedTasks
  const highPriorityTasks = tasks.filter(t => t.isHighPriority).length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const columnDistribution: Record<string, number> = {}
  for (const column of KANBAN_COLUMNS) {
    columnDistribution[column] = tasks.filter(t => t.column === column).length
  }

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    columnDistribution,
    completionRate
  }
}

export function getEisenhowerAnalytics(tasks: EisenhowerTask[]): EisenhowerAnalytics {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.isCompleted).length
  const pendingTasks = totalTasks - completedTasks
  const highPriorityTasks = tasks.filter(t => t.isHighPriority).length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const quadrantDistribution: Record<string, number> = {}
  for (const quadrant of Object.values(EisenhowerQuadrant)) {
    quadrantDistribution[getQuadrantName(quadrant)] =
      tasks.filter(t => getEisenhowerQuadrant(t) === quadrant).length
  }

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    quadrantDistribution,
    completionRate
  }
}

export function getCombinedAnalytics(
  kanbanTasks: Task[],
  eisenhowerTasks: EisenhowerTask[]
): CombinedAnalytics {
  const kanban = getKanbanAnalytics(kanbanTasks)
  const eisenhower = getEisenhowerAnalytics(eisenhowerTasks)

  const totalTasks = kanban.totalTasks + eisenhower.totalTasks
  const totalCompleted = kanban.completedTasks + eisenhower.completedTasks
  const overallCompletionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0

  return {
    kanban,
    eisenhower,
    totalTasks,
    totalCompleted,
    overallCompletionRate
  }
}

export function getQuadrantChartData(tasks: EisenhowerTask[]): ChartData[] {
  const data: ChartData[] = []

  for (const quadrant of Object.values(EisenhowerQuadrant)) {
    const count = tasks.filter(t => getEisenhowerQuadrant(t) === quadrant).length
    const name = getQuadrantName(quadrant)
    const color = getQuadrantChartColor(quadrant)

    data.push({
      label: name,
      value: count,
      color
    })
  }

  return data
}
