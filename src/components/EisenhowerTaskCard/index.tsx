import { View, Text, Input, Button, Checkbox } from '@tarojs/components'
import { EisenhowerTask } from '../../models/eisenhowerTaskModel'
import { EisenhowerQuadrant } from '../../config/eisenhowerConfig'
import './index.css'

interface EisenhowerTaskCardProps {
  task: EisenhowerTask
  quadrant: EisenhowerQuadrant
  onTaskDeleted: () => void
  onTaskToggled: () => void
  onTaskEdited: (newTitle: string) => void
}

const EisenhowerTaskCard: React.FC<EisenhowerTaskCardProps> = ({
  task,
  quadrant,
  onTaskDeleted,
  onTaskToggled,
  onTaskEdited
}) => {
  const handleEdit = () => {
    const newTitle = task.title
    onTaskEdited(newTitle)
  }

  const getPriorityIndicator = () => {
    if (quadrant === EisenhowerQuadrant.UrgentImportant) {
      return { text: '⚡ DO FIRST', color: '#C62828' }
    }
    if (quadrant === EisenhowerQuadrant.NotUrgentImportant) {
      return { text: '📅 SCHEDULE', color: '#2E7D32' }
    }
    if (quadrant === EisenhowerQuadrant.UrgentNotImportant) {
      return { text: '👥 DELEGATE', color: '#EF6C00' }
    }
    return { text: '🗑️ ELIMINATE', color: '#424242' }
  }

  const indicator = getPriorityIndicator()

  return (
    <View
      className={`eisenhower-task-card ${task.isCompleted ? 'completed' : ''}`}
      onClick={onTaskToggled}
    >
      <View className='card-header'>
        <View className='priority-indicator' style={{ backgroundColor: indicator.color }}>
          <Text className='priority-text'>{indicator.text}</Text>
        </View>
      </View>

      <Text
        className={`task-title ${task.isCompleted ? 'strikethrough' : ''}`}
      >
        {task.title}
      </Text>

      <View className='task-actions'>
        <View className='action-btn' onClick={handleEdit}>
          <Text className='action-icon'>✎</Text>
        </View>
        <View className='action-btn' onClick={onTaskDeleted}>
          <Text className='action-icon delete'>✕</Text>
        </View>
      </View>
    </View>
  )
}

export default EisenhowerTaskCard
