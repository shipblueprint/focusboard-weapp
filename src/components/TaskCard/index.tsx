import { View, Text } from '@tarojs/components'
import { Task } from '../../models/taskModel'
import './index.css'

interface TaskCardProps {
  task: Task
  onTap: () => void
  onLongPress: () => void
  onEdit: () => void
  onDelete: () => void
  onTogglePriority: () => void
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTap,
  onLongPress,
  onEdit,
  onDelete,
  onTogglePriority
}) => {
  const getCardClass = () => {
    let className = 'task-card'
    if (task.isCompleted) className += ' completed'
    if (task.isHighPriority) className += ' high-priority'
    return className
  }

  const getCardStyle = () => {
    if (task.isCompleted) return { backgroundColor: '#C8E6C9' }
    if (task.isHighPriority) return { backgroundColor: '#FFCDD2', borderColor: '#EF5350' }
    return { backgroundColor: '#FFFFFF' }
  }

  return (
    <View
      className={getCardClass()}
      style={getCardStyle()}
      onClick={onTap}
      onLongPress={onLongPress}
    >
      {(task.isCompleted || task.isHighPriority) && (
        <View className='badges'>
          {task.isCompleted && (
            <View className='badge completed-badge'>
              <Text className='badge-text'>Completed</Text>
            </View>
          )}
          {task.isHighPriority && (
            <View className='badge priority-badge'>
              <Text className='badge-text'>High Priority</Text>
            </View>
          )}
        </View>
      )}

      <Text
        className={`task-title ${task.isCompleted ? 'strikethrough' : ''}`}
        style={{ color: task.isHighPriority ? '#D32F2F' : '#212121' }}
      >
        {task.title}
      </Text>

      <View className='task-actions'>
        {!task.isCompleted && (
          <View className='action-btn' onClick={onTogglePriority}>
            <Text
              className='action-icon'
              style={{ color: task.isHighPriority ? '#EF5350' : '#9E9E9E' }}
            >
              ★
            </Text>
          </View>
        )}
        <View className='action-btn' onClick={onEdit}>
          <Text className='action-icon' style={{ color: '#2196F3' }}>✎</Text>
        </View>
        <View className='action-btn' onClick={onDelete}>
          <Text className='action-icon' style={{ color: '#EF5350' }}>✕</Text>
        </View>
      </View>
    </View>
  )
}

export default TaskCard
