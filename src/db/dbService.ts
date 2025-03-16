import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyTodoData, Project, Task, SubTask, Priority } from '../types';

const STORAGE_KEY = '@mytodo_data';

const initialData: MyTodoData = {
  projects: [],
  tasks: [],
  subTasks: []
};

async function loadAllData(): Promise<MyTodoData> {
  try {
    const jsonStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonStr) {
      return JSON.parse(jsonStr);
    }
    return initialData;
  } catch (error) {
    console.error('Error loading data:', error);
    return initialData;
  }
}

async function saveAllData(data: MyTodoData): Promise<void> {
  try {
    const jsonStr = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonStr);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export async function initDB(): Promise<void> {
  const data = await loadAllData();
  if (!data.projects) {
    await saveAllData(initialData);
  }
}

export async function createProject(name: string): Promise<void> {
  const data = await loadAllData();
  const newProject: Project = {
    id: Date.now().toString(),
    name,
    createdAt: Date.now()
  };
  data.projects.push(newProject);
  await saveAllData(data);
}

export async function getAllProjects(): Promise<Project[]> {
  const data = await loadAllData();
  const list = data.projects.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

export async function createTask(
  projectId: string,
  title: string,
  priority: string,
  dueDate?: string
): Promise<void> {
  const data = await loadAllData();
  const newTask: Task = {
    id: Date.now().toString(),
    projectId,
    title,
    completed: false,
    priority: priority as Priority,
    dueDate,
    createdAt: Date.now()
  };
  data.tasks.push(newTask);
  await saveAllData(data);
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const data = await loadAllData();
  const tasks = data.tasks.filter(t => t.projectId === projectId);
  return tasks.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteTask(taskId: string): Promise<void> {
  const data = await loadAllData();
  data.tasks = data.tasks.filter(t => t.id !== taskId);
  data.subTasks = data.subTasks.filter(st => st.taskId !== taskId);
  await saveAllData(data);
}

export async function toggleTaskCompleted(taskId: string, newCompleted: boolean): Promise<void> {
  const data = await loadAllData();
  const idx = data.tasks.findIndex(t => t.id === taskId);
  if (idx >= 0) {
    data.tasks[idx].completed = newCompleted;
  }
  await saveAllData(data);
}

export async function createSubTask(taskId: string, title: string): Promise<void> {
  const data = await loadAllData();
  const newSubTask: SubTask = {
    id: Date.now().toString(),
    taskId,
    title,
    completed: false,
    createdAt: Date.now()
  };
  data.subTasks.push(newSubTask);
  await saveAllData(data);
}

export async function getSubTasks(taskId: string): Promise<SubTask[]> {
  const data = await loadAllData();
  return data.subTasks
    .filter(st => st.taskId === taskId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function toggleSubTaskCompleted(subtaskId: string, newCompleted: boolean): Promise<void> {
  const data = await loadAllData();
  const idx = data.subTasks.findIndex(st => st.id === subtaskId);
  if (idx >= 0) {
    data.subTasks[idx].completed = newCompleted;
  }
  await saveAllData(data);
}

export async function getTaskStats(): Promise<{ total: number; completed: number }> {
  const data = await loadAllData();
  const allTasks = data.tasks;
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.completed).length;
  return { total, completed };
}

export async function getTaskById(taskId: string): Promise<Task | undefined> {
  const data = await loadAllData();
  return data.tasks.find(t => t.id === taskId);
}