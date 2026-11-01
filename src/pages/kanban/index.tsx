// @ts-nocheck
import { useState, useCallback } from "react";
import Taro, { useDidShow } from "@tarojs/taro";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtInput } from "rtaro-ui";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  kanbanActions,
  loadKanbanTasksAsync,
  saveKanbanTasksAsync,
} from "../../store/kanbanSlice";
import { Task, createTask } from "../../models/taskModel";
import { KANBAN_COLUMNS, getWipLimit } from "../../config/kanbanConfig";
import "./index.css";

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  wipLimit: number | null;
  onTaskTap: (task: Task) => void;
  onAddTask: (column: string) => void;
  onTaskMoved: (taskId: string, targetColumn: string, isDone: boolean) => void;
  onTaskDeleted: (taskId: string) => void;
  onTaskPriorityChanged: (taskId: string, isHighPriority: boolean) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  wipLimit,
  onTaskTap,
  onAddTask,
  onTaskMoved,
  onTaskDeleted,
  onTaskPriorityChanged,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const columnColors: Record<string, string> = {
    "To Do": "#2196F3",
    "In Progress": "#FF9800",
    Done: "#4CAF50",
  };
  const color = columnColors[title] || "#9E9E9E";

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const handleDragOver = () => {
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = () => {
    setIsDragOver(false);
  };

  return (
    <View
      className={`kanban-column ${isDragOver ? "drag-over" : ""}`}
      onTouchEnd={handleDrop}
    >
      <View className="column-header" style={{ backgroundColor: color }}>
        <View className="column-title-row">
          <Text className="column-title-text">{title}</Text>
          <Text className="column-count">
            {incompleteTasks.length}
            {wipLimit != null ? `/${wipLimit}` : ""}
          </Text>
        </View>
        {title === "To Do" && (
          <View className="add-btn" onClick={() => onAddTask(title)}>
            <Text className="add-btn-text">+</Text>
          </View>
        )}
      </View>

      <ScrollView scrollY className="column-content">
        {incompleteTasks.map((task) => (
          <View
            key={task.id}
            className="task-item"
            onClick={() => onTaskTap(task)}
          >
            <View className="task-content">
              {task.isHighPriority && <Text className="priority-flag">⚑</Text>}
              <Text className="task-title">{task.title}</Text>
            </View>
            <View className="task-buttons">
              <View
                className="task-btn priority-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskPriorityChanged(task.id, !task.isHighPriority);
                }}
              >
                <Text
                  className={`task-btn-icon ${task.isHighPriority ? "active" : ""}`}
                >
                  ★
                </Text>
              </View>
              <View
                className="task-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskTap(task);
                }}
              >
                <Text className="task-btn-icon">✎</Text>
              </View>
              <View
                className="task-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskDeleted(task.id);
                }}
              >
                <Text className="task-btn-icon">✕</Text>
              </View>
            </View>
          </View>
        ))}

        {completedTasks.length > 0 && (
          <View className="completed-section">
            <Text className="completed-header">
              Completed ({completedTasks.length})
            </Text>
            {completedTasks.map((task) => (
              <View
                key={task.id}
                className="task-item completed-task"
                onClick={() => onTaskTap(task)}
              >
                <Text className="task-title strikethrough">{task.title}</Text>
                <View
                  className="task-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskDeleted(task.id);
                  }}
                >
                  <Text className="task-btn-icon">✕</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tasks.length === 0 && (
          <View className="empty-column">
            <Text className="empty-text">No tasks</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const KanbanScreen: React.FC = () => {
  const kanbanState = useAppSelector((state) => state.kanban);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit">("add");
  const [dialogColumn, setDialogColumn] = useState<string>("To Do");
  const [taskTitle, setTaskTitle] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useDidShow(() => {
    loadTasks();
  });

  const loadTasks = useCallback(() => {
    setIsLoading(true);
    dispatch(loadKanbanTasksAsync());
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, [dispatch]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleTaskTap = (task: Task) => {
    if (task.isCompleted) {
      return;
    }
    setSelectedTask(task);
    setDialogType("edit");
    setTaskTitle(task.title);
    setShowDialog(true);
  };

  const handleTaskMoved = (
    taskId: string,
    targetColumn: string,
    isDone: boolean,
  ) => {
    dispatch(
      kanbanActions.moveTask({ taskId, targetColumn: targetColumn as any }),
    );
    if (isDone) {
      dispatch(kanbanActions.markTaskCompleted(taskId));
    }
    dispatch(saveKanbanTasksAsync());
  };

  const handleTaskDeleted = (taskId: string) => {
    dispatch(kanbanActions.deleteTask(taskId));
    dispatch(saveKanbanTasksAsync());
  };

  const handleTaskPriorityChanged = (
    taskId: string,
    isHighPriority: boolean,
  ) => {
    dispatch(kanbanActions.setTaskPriority({ taskId, isHighPriority }));
    dispatch(saveKanbanTasksAsync());
  };

  const handleAddTask = (column: string) => {
    setDialogColumn(column);
    setDialogType("add");
    setTaskTitle("");
    setShowDialog(true);
  };

  const handleSaveTask = () => {
    const title = taskTitle.trim();
    if (title) {
      if (dialogType === "add") {
        const newTask = createTask({ title, column: dialogColumn as any });
        dispatch(kanbanActions.addTask(newTask));
        dispatch(saveKanbanTasksAsync());
        showToast("Task added!");
      } else if (selectedTask) {
        const updatedTask = { ...selectedTask, title };
        dispatch(kanbanActions.updateTask(updatedTask));
        dispatch(saveKanbanTasksAsync());
        showToast("Task updated!");
      }
    }
    setShowDialog(false);
    setTaskTitle("");
    setSelectedTask(null);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setTaskTitle("");
    setSelectedTask(null);
  };

  const tasksByColumn = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col] = kanbanState.tasks.filter((t) => t.column === col);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  return (
    <View className="kanban-screen">
      <View className="kanban-header">
        <Text className="kanban-title">Kanban Board</Text>
        <Text className="kanban-subtitle">
          {kanbanState.tasks.length} tasks
        </Text>
      </View>

      {isLoading ? (
        <View className="loading-container">
          <Text className="loading-text">Loading...</Text>
        </View>
      ) : (
        <ScrollView scrollX className="kanban-board">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column}
              title={column}
              tasks={tasksByColumn[column] || []}
              wipLimit={getWipLimit(column)}
              onTaskTap={handleTaskTap}
              onAddTask={handleAddTask}
              onTaskMoved={handleTaskMoved}
              onTaskDeleted={handleTaskDeleted}
              onTaskPriorityChanged={handleTaskPriorityChanged}
            />
          ))}
        </ScrollView>
      )}

      {showDialog && (
        <View className="dialog-overlay" onClick={handleCloseDialog}>
          <View className="dialog" onClick={(e) => e.stopPropagation()}>
            <Text className="dialog-title">
              {dialogType === "add" ? "Add Task" : "Edit Task"}
            </Text>
            <View className="dialog-input-wrapper">
              <AtInput
                name="taskTitle"
                type="text"
                value={taskTitle}
                onChange={(value) => setTaskTitle(String(value))}
                placeholder="Task name"
              />
            </View>
            <View className="dialog-buttons">
              <View
                className="dialog-btn cancel-btn"
                onClick={handleCloseDialog}
              >
                <Text className="dialog-btn-text">Cancel</Text>
              </View>
              <View className="dialog-btn save-btn" onClick={handleSaveTask}>
                <Text className="dialog-btn-text">Save</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {toastMessage && (
        <View className="toast">
          <Text className="toast-text">{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

export default KanbanScreen;
