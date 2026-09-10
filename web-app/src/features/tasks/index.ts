// API pública de la feature tasks (el board Kanban: columnas + tareas en columnas).
// Nadie importa un archivo interno de esta feature directamente.

// modelo
export type { taskModel } from './model/task'
export { emptyTask, getNewTask } from './model/task'
export type { TaskList } from './model/TaskList'
export type { TaskBoard } from './model/taskBoard'
export { emptyTaskBoard, isDefaultTaskBoard, joinTaskListsAndTaskBoard } from './model/taskBoard'
export type { TaskTimelineHistory } from './ui/taskList/models/taskTimelineHistory'
export { sortListOfTasksInColumnsByPriority } from './ui/taskList/models/sortListOfTasksInColumnsByPriority'
export type { NotesAndComments } from './ui/taskList/models/NotesAndComments'
export { checkMaxLengthOfNotesAndComments } from './ui/taskList/models/NotesAndComments'
export { addTaskInFirstColumn } from './ui/taskList/useCase/addTask'

// casos de uso reutilizados por otras features (archived-tasks)
export { cleanLastTaskList } from './useCase/deleteTaskList'
export { deleteThisTask } from './ui/taskList/useCase/deleteTask'
export { addTaskInTheLastColumn } from './ui/taskList/useCase/addTask'
export { addChangeToEachTaskInList } from './ui/taskList/useCase/addChangeToEachTaskInList'
export { addChangeToTaskTimelineHistory } from './ui/taskList/useCase/addChangeToTaskTimelineHistory'

// hooks
export { useTaskBoardQuery } from './hooks/useTaskBoardQuery'
export { useTaskListInEachColumn } from './ui/taskList/hooks/useTaskListInEachColumn'
export { useDataOfTheTask } from './ui/taskList/hooks/useDataOfTheTask'
export { useCheckForTasksInLastColumn } from './ui/Columns/hooks/useCheckForTasksInLastColumn'

// ui
export { BlankTask, TaskContext } from './ui/BlankTask'
export { TaskListInEachColumn } from './ui/taskList/TaskListInEachColumn'
export { AddNewTaskInput } from './ui/taskList/components/AddNewTaskInput'
export { ListView } from './ui/ListView'
export { TableView } from './ui/TableView'
export { ConfigColumns } from './ui/Columns/components/ConfigColumns'
export { ColumnsFooterContentProvider } from './ui/Columns/context/ColumnsFooter/ColumnsFooterContentProvider'
export type { ColumnsFooterContent } from './ui/Columns/context/ColumnsFooter/columnsFooterContent'
