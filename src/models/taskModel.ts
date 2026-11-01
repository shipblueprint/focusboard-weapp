import {
  KanbanColumn,
  isValidColumn,
  getDefaultColumn,
} from "../config/kanbanConfig";

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  isHighPriority: boolean;
  column: KanbanColumn;
}

export interface TaskJSON {
  id: string;
  title: string;
  isCompleted: boolean;
  isHighPriority: boolean;
  column: string;
}

export function createTask(params: {
  id?: string;
  title: string;
  isCompleted?: boolean;
  isHighPriority?: boolean;
  column?: KanbanColumn;
}): Task {
  return {
    id: params.id ?? Date.now().toString(),
    title: params.title,
    isCompleted: params.isCompleted ?? false,
    isHighPriority: params.isHighPriority ?? false,
    column: params.column ?? getDefaultColumn(),
  };
}

export function taskToJSON(task: Task): TaskJSON {
  return {
    id: task.id,
    title: task.title,
    isCompleted: task.isCompleted,
    isHighPriority: task.isHighPriority,
    column: task.column,
  };
}

export function taskFromJSON(json: TaskJSON): Task {
  if (!json.id || json.id.toString().trim().length === 0) {
    throw new Error("Task ID cannot be null or empty");
  }

  if (!json.title || json.title.toString().trim().length === 0) {
    throw new Error("Task title cannot be null or empty");
  }

  let sanitizedTitle = json.title.toString().trim();
  sanitizedTitle = sanitizedTitle.replace(/<[^>]*>/g, "");
  if (sanitizedTitle.length > 200) {
    sanitizedTitle = `${sanitizedTitle.substring(0, 197)}...`;
  }

  let column: KanbanColumn = getDefaultColumn();
  if (json.column && isValidColumn(json.column)) {
    column = json.column;
  }

  return {
    id: json.id.toString(),
    title: sanitizedTitle,
    isCompleted: json.isCompleted === true,
    isHighPriority: json.isHighPriority === true,
    column,
  };
}

export function taskCopyWith(
  task: Task,
  updates: Partial<Omit<Task, "id">>,
): Task {
  return {
    id: task.id,
    title: updates.title ?? task.title,
    isCompleted: updates.isCompleted ?? task.isCompleted,
    isHighPriority: updates.isHighPriority ?? task.isHighPriority,
    column: updates.column ?? task.column,
  };
}

export function taskToString(task: Task): string {
  const parts: string[] = [];
  if (task.isCompleted) parts.push("[Completed]");
  if (task.isHighPriority) parts.push("[High Priority]");
  parts.push(task.title);
  return parts.join(" ");
}
