import { useCallback, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { createTheme } from '@tarojs/taro'

export enum EisenhowerQuadrant {
  UrgentImportant = 'urgentImportant',
  NotUrgentImportant = 'notUrgentImportant',
  UrgentNotImportant = 'urgentNotImportant',
  NotUrgentNotImportant = 'notUrgentNotImportant'
}

export const quadrantNames: Record<EisenhowerQuadrant, string> = {
  [EisenhowerQuadrant.UrgentImportant]: 'Do First',
  [EisenhowerQuadrant.NotUrgentImportant]: 'Schedule',
  [EisenhowerQuadrant.UrgentNotImportant]: 'Delegate',
  [EisenhowerQuadrant.NotUrgentNotImportant]: 'Eliminate'
}

export const quadrantDescriptions: Record<EisenhowerQuadrant, string> = {
  [EisenhowerQuadrant.UrgentImportant]: 'Urgent & Important',
  [EisenhowerQuadrant.NotUrgentImportant]: 'Not Urgent & Important',
  [EisenhowerQuadrant.UrgentNotImportant]: 'Urgent & Not Important',
  [EisenhowerQuadrant.NotUrgentNotImportant]: 'Not Urgent & Not Important'
}

export const quadrantChartColors: Record<EisenhowerQuadrant, string> = {
  [EisenhowerQuadrant.UrgentImportant]: '#FF6B6B',
  [EisenhowerQuadrant.NotUrgentImportant]: '#4ECDC4',
  [EisenhowerQuadrant.UrgentNotImportant]: '#FFE66D',
  [EisenhowerQuadrant.NotUrgentNotImportant]: '#95E1D3'
}

export function getQuadrantName(quadrant: EisenhowerQuadrant): string {
  return quadrantNames[quadrant] ?? 'Unknown'
}

export function getQuadrantDescription(quadrant: EisenhowerQuadrant): string {
  return quadrantDescriptions[quadrant] ?? 'Unknown'
}

export function getQuadrantColor(quadrant: EisenhowerQuadrant, isDarkMode: boolean): string {
  if (isDarkMode) {
    switch (quadrant) {
      case EisenhowerQuadrant.UrgentImportant: return '#C62828'
      case EisenhowerQuadrant.NotUrgentImportant: return '#2E7D32'
      case EisenhowerQuadrant.UrgentNotImportant: return '#EF6C00'
      case EisenhowerQuadrant.NotUrgentNotImportant: return '#424242'
    }
  } else {
    switch (quadrant) {
      case EisenhowerQuadrant.UrgentImportant: return '#FFCDD2'
      case EisenhowerQuadrant.NotUrgentImportant: return '#C8E6C9'
      case EisenhowerQuadrant.UrgentNotImportant: return '#FFE0B2'
      case EisenhowerQuadrant.NotUrgentNotImportant: return '#E0E0E0'
    }
  }
  return '#9E9E9E'
}

export function getQuadrantChartColor(quadrant: EisenhowerQuadrant): string {
  return quadrantChartColors[quadrant] ?? '#9E9E9E'
}

export function getQuadrantFromFlags(isUrgent: boolean, isImportant: boolean): EisenhowerQuadrant {
  if (isUrgent && isImportant) return EisenhowerQuadrant.UrgentImportant
  if (!isUrgent && isImportant) return EisenhowerQuadrant.NotUrgentImportant
  if (isUrgent && !isImportant) return EisenhowerQuadrant.UrgentNotImportant
  return EisenhowerQuadrant.NotUrgentNotImportant
}

export function getFlagsFromQuadrant(quadrant: EisenhowerQuadrant): [boolean, boolean] {
  switch (quadrant) {
    case EisenhowerQuadrant.UrgentImportant: return [true, true]
    case EisenhowerQuadrant.NotUrgentImportant: return [false, true]
    case EisenhowerQuadrant.UrgentNotImportant: return [true, false]
    case EisenhowerQuadrant.NotUrgentNotImportant: return [false, false]
  }
}

export function useTheme() {
  const systemInfo = Taro.getSystemInfoSync()
  const isDarkMode = systemInfo.theme === 'dark'

  const colors = useMemo(() => {
    if (isDarkMode) {
      return {
        primary: '#BB86FC',
        secondary: '#03DAC6',
        background: '#121212',
        surface: '#1E1E1E',
        error: '#CF6679',
        onPrimary: '#000000',
        onSecondary: '#000000',
        onBackground: '#FFFFFF',
        onSurface: '#FFFFFF',
        kanbanTodo: '#1976D2',
        kanbanInProgress: '#F57C00',
        kanbanDone: '#388E3C'
      }
    } else {
      return {
        primary: '#6200EE',
        secondary: '#03DAC6',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        error: '#B00020',
        onPrimary: '#FFFFFF',
        onSecondary: '#000000',
        onBackground: '#000000',
        onSurface: '#000000',
        kanbanTodo: '#2196F3',
        kanbanInProgress: '#FF9800',
        kanbanDone: '#4CAF50'
      }
    }
  }, [isDarkMode])

  return { isDarkMode, colors }
}
