# Guardado del tablero

Cómo se leen y se persisten las columnas y tareas de un tablero. Con sesión, el
cliente calcula qué cambió respecto del tablero anterior y el server aplica
solo esos cambios en una transacción. Sin sesión, el tablero entero vive en
`localStorage`.

Código: `web-app/src/features/tasks/`.

## Componentes

| Módulo | Archivo | Responsabilidad |
| --- | --- | --- |
| `useTaskBoardQuery` | `hooks/useTaskBoardQuery.tsx` | Lee el tablero (React Query), expone `updateTaskBoard`, hace el update optimista y serializa los guardados. |
| Repositorio | `api/repository/index.ts` | `fetchTaskBoard` / `saveTaskBoard`: elige la implementación según haya sesión. |
| `NextjsTaskListInEachColumnRepository` | `api/repository/nextjsTaskListRepository.ts` | Con sesión: calcula el diff y llama a la server action. |
| `LocalStorageTaskListInEachColumnRepository` | `api/repository/localStorageTaskListsRepository.ts` | Sin sesión: guarda el tablero entero en la clave `taskListInEachColumn`. |
| `diffTaskBoard` | `model/taskBoardDiff.ts` | Función pura: cambios mínimos entre dos tableros. |
| `applyTaskBoardChanges` | `api/actions/applyTaskBoardChanges.ts` | Server action: valida y aplica los cambios en una transacción. |
| `getTaskBoard` / `readTaskBoard` | `api/actions/getTaskBoard.ts`, `api/readTaskBoard.ts` | Server action de lectura y la consulta Prisma que arma el `TaskBoard`. |

## Modelo

Un `TaskBoard` es un array de columnas; cada columna tiene `id`, `status` (su
nombre) y `tasks`. El índice de la columna en el array es su posición, y el
índice de la tarea dentro de `tasks` es su `order`.

En la DB (Prisma), `Column` tiene `name`, `order` y `boardId`; `Task` tiene
`columnId`, `order`, `parentId` (self-relation, `onDelete: Cascade`) y los
campos de contenido (`descriptionText`, `dueDate`, `tags`, `notesAndComments`,
`timelineHistory`). Borrar una columna borra sus tareas por cascade; borrar una
tarea padre borra sus hijas.

`emptyTaskBoard` usa ids placeholder (`DEFAULT_COLUMN_IDS`: `todo`,
`in_progress`, `done`) que no existen en la DB. Es el valor por defecto cuando
la cache todavía no tiene el tablero.

## Lectura

`useQuery` con key `['taskBoard', userId, boardId]`:

- `queryFn`: `fetchTaskBoard(session, boardId)`. Con sesión llama a
  `getTaskBoard`, que chequea `requireBoardAccess` y devuelve columnas por
  `order` y tareas por `order`, luego `createdAt`.
- `refetchInterval: 5000`: polling cada 5 s para sincronizar pestañas y PCs.
- `staleTime: 30000`.
- `enabled: !!boardId`: no pega al server mientras el store todavía tiene el
  `boardId` por defecto.
- `select`: si el tablero es el `emptyTaskBoard`, traduce los nombres de las
  columnas por defecto con i18next. La cache guarda el dato crudo.

## Flujo de un guardado

Todos los componentes guardan con `updateTaskBoard(tablero, options?)`. Aceptan
un `TaskBoard` completo o un `TaskListInEachColumn` (solo las listas de tareas
por columna).

1. `updateTaskBoard` lee `previous` de la cache (`emptyTaskBoard` si no hay).
2. Arma `next`: si llegaron listas, las une al tablero con
   `joinTaskListsAndTaskBoard(listas, previous)`.
3. Escribe `next` en la cache (update optimista) y llama a
   `mutate({ next, previous })`, todo sincrónico.
4. `onMutate` cancela los fetch en curso y devuelve `previous` como contexto.
5. `mutationFn` llama a `saveTaskBoard({ taskBoard: next, previous, session, boardId })`.
6. Con sesión, el repositorio calcula `diffTaskBoard(previous, next)`. Si da
   `[]`, no llama al server. Si no, llama a `applyTaskBoardChanges`.
7. `onError` restaura `previous` en la cache. `onSettled` invalida la query y
   el siguiente fetch trae el estado real.

**Guard de tablero vacío.** Si llega un `TaskBoard` completo que deja en cero un
tablero que tenía tareas, `updateTaskBoard` no guarda: muestra un
`toast.warning` con un botón de confirmación. Al confirmar, `previous` se relee
de la cache en ese momento. Las listas por columna no pasan por este guard:
borrar o archivar la última tarea es una acción intencional.

## diffTaskBoard

```ts
export type TaskBoardChange =
	| { type: 'upsertColumn'; column: { id: string; name: string; order: number } }
	| { type: 'deleteColumn'; columnId: string }
	| { type: 'upsertTask'; task: taskModel; columnId: string; order: number }
	| { type: 'deleteTask'; taskId: string }
```

| Cambio | Cuándo se emite |
| --- | --- |
| `upsertColumn` | La columna es nueva, cambió su nombre o su índice. |
| `deleteTask` | La tarea está en `prev` y no en `next`. |
| `upsertTask` | La tarea es nueva o cambió su columna, su índice, `descriptionText`, `dueDate`, `tags`, `notesAndComments`, `timelineHistory` o `parentId`. Lleva la tarea completa. |
| `deleteColumn` | La columna está en `prev` y no en `next`. |

El resultado sale en orden de aplicación:

1. `upsertColumn`: una tarea puede moverse a una columna nueva.
2. `deleteTask`.
3. `upsertTask`, en orden topológico por `parentId`: un padre va antes que sus
   hijas si ambos están en el batch. No asume un solo nivel de anidamiento.
4. `deleteColumn`: las tareas que salieron de esa columna ya se movieron en el
   paso 3; el cascade borra el resto.

Las tareas se comparan con `JSON.stringify` de los campos persistidos. Alcanza
porque son datos planos que arma siempre el mismo código.

Ejemplos: mover una tarea de columna = un `upsertTask` con el `columnId` nuevo.
Reordenar por prioridad = un `upsertTask` por cada tarea que cambió de índice.

## applyTaskBoardChanges

Server action `applyTaskBoardChanges({ boardId, changes })`. Es un endpoint
público: no confía en lo que manda el cliente.

1. **Validación de forma**, antes de todo. `changes` es un array de hasta
   1000 elementos. Cada uno tiene un `type` conocido; ids, nombre de columna y
   descripción de tarea son strings no vacíos; `order` es entero ≥ 0;
   `parentId` es ausente o no vacío. Si algo falla: `Error('Cambios inválidos')`.
2. **Acceso**: `requireBoardAccess(boardId)`. `changes` vacío → return.
3. **Transacción** (`prisma.$transaction`). Primero rechaza con
   `'No autorizado'` si:
   - algún id de `upsertColumn` existe en otro board;
   - algún id de tarea o `parentId` está en una columna de otro board;
   - algún `columnId` de `upsertTask` que no es placeholder ni se crea en el
     mismo batch no pertenece al board.
4. **Placeholders**: un id de `DEFAULT_COLUMN_IDS` se resuelve a la columna
   real con `order = DEFAULT_COLUMN_IDS.indexOf(id)`, creándola si no existe.
   El mapeo se usa para `upsertColumn` y para el `columnId` de las tareas. Con
   sesión solo llegan si la cache estaba vacía o el tablero no tiene columnas
   (`createBoard` ya crea columnas reales).
5. **Aplicación en fases**:
   - upserts de columnas;
   - un `task.deleteMany` con `column: { boardId }`;
   - upserts de tareas uno por uno, en el orden recibido (el FK de `parentId`
     exige que el padre exista antes);
   - un `column.deleteMany` con `boardId`.

   Los deletes siempre van acotados al board. Borrar algo que ya no existe es
   no-op.
6. **Tope de columnas**: cuenta columnas antes y después de aplicar. Si el
   total supera `MAX_COLUMNS` (5) y creció, tira y la transacción hace
   rollback. Un tablero viejo que ya tenía más de 5 se sigue guardando.

## Concurrencia

- **`previous` y el update optimista, sincrónicos en `updateTaskBoard`.**
  React Query hace un `await` interno antes de `onMutate`. Si la cache se
  escribiera en `onMutate`, dos guardados seguidos leerían la misma cache como
  `previous` y el segundo diff se calcularía contra un tablero sin los cambios
  del primero.
- **`cancelQueries` después del `setQueryData`.** Un `setQueryData` manual
  actualiza el estado al que revierte la query, así que un fetch cancelado
  vuelve al tablero nuevo y no a lo que traía el server.
- **Guardados en serie.** `useMutation` usa `scope: { id: taskBoard-<boardId> }`:
  los guardados de un mismo tablero corren uno detrás del otro, y cada diff
  parte del estado optimista del anterior (por ejemplo, crear un padre y
  enseguida una hija).
- **Varias pestañas o PCs.** Cada pestaña solo manda lo que cambió en ella; no
  borra lo que otra pestaña creó y todavía no le llegó. El polling de 5 s
  reconcilia. Si dos pestañas editan la misma tarea, gana el último guardado.
- **Falla con guardados encolados.** Si falla un guardado y el siguiente ya
  estaba en cola, el siguiente igual aplica sus cambios. `onSettled` invalida
  y el polling trae el estado real.

## Modo invitado

`LocalStorageTaskListInEachColumnRepository` ignora `previous` y guarda el
tablero entero en `localStorage`, clave `taskListInEachColumn`. Si la clave no
existe, `getAll` guarda y devuelve `emptyTaskBoard`.

## Límites conocidos

- Reordenar por prioridad manda un `upsertTask` por cada tarea que cambió de
  índice. Si pesa, se puede agregar un cambio liviano tipo `setTaskOrder`.
- Sobre un tablero sin columnas, solo se crean las columnas placeholder que el
  diff referencia, no las tres. Solo pasa antes de la primera carga.
- `getAll` del repositorio de `localStorage` hace `JSON.parse` sin `try` y
  escribe al leer.
- La sincronización entre pestañas es por polling, no por push.

## Tests

| Archivo | Qué cubre |
| --- | --- |
| `model/taskBoardDiff.test.ts` | Tableros iguales, tarea nueva, edición de cada campo, borrar tarea y padre con hijas, mover y reordenar, columnas nuevas/renombradas/reordenadas/borradas, orden de aplicación, padre antes que hija, placeholders. |
| `api/actions/applyTaskBoardChanges.test.ts` | Acceso, ids de otro board, deletes acotados al board, placeholders, tope de columnas, orden padre → hija, payloads inválidos. Usa un `tx` falso de Prisma: no hay DB real. |
| `hooks/useTaskBoardQuery.test.tsx` | `previous` = cache antes del update optimista, camino de listas por columna, guard de tablero vacío, dos guardados seguidos en serie. |

Los e2e de Playwright corren en modo invitado y no cubren el camino con sesión.
