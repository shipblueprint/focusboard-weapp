import {
  Task,
  TaskJSON,
  taskFromJSON,
  taskCopyWith,
  taskToJSON,
} from "./taskModel";
import {
  EisenhowerQuadrant,
  getQuadrantFromFlags,
  getQuadrantName,
  getQuadrantColor,
} from "../config/eisenhowerConfig";

export interface EisenhowerTask extends Task {
  isUrgent: boolean;
  isImportant: boolean;
}

export interface EisenhowerTaskJSON extends TaskJSON {
  isUrgent: boolean;
  isImportant: boolean;
  type: "eisenhower";
}

export function createEisenhowerTask(params: {
  id?: string;
  title: string;
  isCompleted?: boolean;
  isHighPriority?: boolean;
  isUrgent?: boolean;
  isImportant?: boolean;
}): EisenhowerTask {
  return {
    id: params.id ?? Date.now().toString(),
    title: params.title,
    isCompleted: params.isCompleted ?? false,
    isHighPriority: params.isHighPriority ?? false,
    column: "Eisenhower" as any,
    isUrgent: params.isUrgent ?? false,
    isImportant: params.isImportant ?? false,
  };
}

export function eisenhowerTaskFromTask(
  task: Task,
  isUrgent: boolean = false,
  isImportant: boolean = false,
): EisenhowerTask {
  return {
    ...task,
    column: "Eisenhower" as any,
    isUrgent,
    isImportant,
  };
}

export function eisenhowerTaskToJSON(task: EisenhowerTask): EisenhowerTaskJSON {
  return {
    ...taskToJSON(task),
    isUrgent: task.isUrgent,
    isImportant: task.isImportant,
    type: "eisenhower",
  };
}

export function eisenhowerTaskFromJSON(
  json: EisenhowerTaskJSON,
): EisenhowerTask {
  if (!json.id || json.id.toString().trim().length === 0) {
    throw new Error("EisenhowerTask ID cannot be null or empty");
  }

  if (!json.title || json.title.toString().trim().length === 0) {
    throw new Error("EisenhowerTask title cannot be null or empty");
  }

  let sanitizedTitle = json.title.toString().trim();
  sanitizedTitle = sanitizedTitle.replace(/<[^>]*>/g, "");
  if (sanitizedTitle.length > 200) {
    sanitizedTitle = `${sanitizedTitle.substring(0, 197)}...`;
  }

  return {
    id: json.id.toString(),
    title: sanitizedTitle,
    isCompleted: json.isCompleted === true,
    isHighPriority: json.isHighPriority === true,
    column: "Eisenhower" as any,
    isUrgent: json.isUrgent === true,
    isImportant: json.isImportant === true,
  };
}

export function eisenhowerTaskCopyWith(
  task: EisenhowerTask,
  updates: Partial<Omit<EisenhowerTask, "id">>,
): EisenhowerTask {
  return {
    ...task,
    ...updates,
    title: updates.title ?? task.title,
    isCompleted: updates.isCompleted ?? task.isCompleted,
    isHighPriority: updates.isHighPriority ?? task.isHighPriority,
    isUrgent: updates.isUrgent ?? task.isUrgent,
    isImportant: updates.isImportant ?? task.isImportant,
  };
}

export function getEisenhowerQuadrant(
  task: EisenhowerTask,
): EisenhowerQuadrant {
  return getQuadrantFromFlags(task.isUrgent, task.isImportant);
}

export function getEisenhowerQuadrantName(task: EisenhowerTask): string {
  return getQuadrantName(getEisenhowerQuadrant(task));
}

export function getEisenhowerQuadrantColor(
  task: EisenhowerTask,
  isDarkMode: boolean,
): string {
  return getQuadrantColor(getEisenhowerQuadrant(task), isDarkMode);
}
