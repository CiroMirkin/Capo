# Archivo

## Resumen

Guarda las tareas que salieron de la última columna del tablero (o que el
usuario mandó a mano), agrupadas por **día de archivado**. Permite ver notas e
historial de cada tarea archivada, devolverla al tablero, borrarla, o vaciar
todo el archivo. También exporta el archivo completo a PDF o JSON.

- **Código:** `web-app/src/features/archived-tasks/` + `app/archive/[id]/`
  (o ruta equivalente que monta `<ArchivedTasks>`), `BlankTask` (`context='archive'`).
- **Alcance:** archivar una tarea o toda la última columna, listar por día, ver
  notas/historial, devolver al tablero, borrar una tarea o vaciar el archivo,
  exportar a PDF/JSON.
- **Fuera de alcance:** editar una tarea archivada (solo lectura + devolver al
  tablero), reordenar el archivo, archivar desde una columna que no sea la
  última.

## Diagrama C4 — código

<!-- Pendiente: se documentó la feature en base al código existente sin generar
el diagrama todavía (`diagram-design`, tipo "UML class"), para no inflar un
cambio que era arreglar un bug de layout + agregar un dropdown. Generarlo la
próxima vez que se toque la estructura de componentes. -->

Flujo, en texto:

- `ArchivedTasks` — lee `useArchive()`; si está vacío muestra `EmptySpaceText`,
  si no monta `Content` + `Footer`.
- `Content` — mapea el `Archive` (un `taskListArchived { date, tasklist }` por
  día) a un `TaskListArchived` por día.
- `TaskListArchived` — una `Card` por día (título = fecha) con un `BlankTask`
  (`context='archive'`) por tarea archivada. Cada `BlankTask.ContentCollapse`
  muestra `ArchivedTaskDetails` (notas/historial) + una fila
  (`ReturnTaskToBoardButton` + `DeleteArchivedTaskButton`).
- `ArchivedTaskDetails` — hasta dos botones (`variant='secondary'`,
  `archive.notes_option` con `SquareTextIcon` / `archive.history_option` con
  `HistoryIcon`, solo los que la tarea tiene datos), cada uno con un
  `ChevronDownIcon` que rota 180° cuando su sección está abierta (mismo
  patrón que `AccordionTrigger`) y abre su propio `CollapseTransition` (el
  átomo que usa `BlankTask` para la card entera). Un solo estado
  `open: 'notes' | 'history' | null` — abrir uno cierra el otro — así que
  como máximo un bloque (nota o timeline) está expandido a la vez. Los dos
  arrancan cerrados.
- `ReturnTaskToBoardButton` (`ArchiveRestoreIcon` + texto) y
  `DeleteArchivedTaskButton` (solo `TrashIcon`, sin texto — el label vive en
  el `title` del botón, ídem `DeleteTaskButton` del tablero).
- `ArchiveTaskButton` (en `TaskInBoardActions` del tablero) — archiva una tarea
  suelta: `archiveThisTask` + `deleteThisTask` del tablero, en una sola
  actualización optimista de las dos queries.
- `ArchiveTaskListButton` — archiva toda la última columna de una:
  `archiveTaskListInTheLastColumn` + `cleanLastTaskList`.
- `Footer` — exportar a PDF (`downloadArchiveLikePDF`, jsPDF) o JSON
  (`useExportJson`), y vaciar el archivo entero (confirmación en
  `toast.warning`). Fila `flex flex-wrap` (no `flex-col`) para que los tres
  botones no apilen en columnas angostas.
- `useArchivedTasksQuery` — fachada TanStack Query, optimista, key
  `['archived-tasks', userId, boardId]`. `useArchive()` es un atajo de solo
  lectura sobre ella.

## Modelo / lógica

Tipos y funciones puras en `model/`; transformaciones de estado en `useCase/`.

### `model/archive.ts`

- `Archive = taskListArchived[]`, `taskListArchived = { date: string, tasklist: TaskList }`.
  `date` es la clave de agrupación (`getFullDate()`, formato de día calendario).
- `archiveLimit = 60` (días distintos) y `dailyArchiveLimit = 30` (tareas por
  día). `isItWithinTheArchiveLimit` / `isItWithinTheDailyArchiveLimit` lanzan
  `BusinessError` si se pasan.
- `getDateOfTheFirstTaskListArchived(archive)` — fecha del día más reciente
  (`archive[0]`; el archivo se guarda con el día nuevo al frente).

### `useCase/archiveTask.ts` — `archiveThisTask({ task, archive })`

Archiva una tarea suelta. Si el día de hoy ya es `archive[0].date`, la
inserta al principio de ese `tasklist` (respetando `dailyArchiveLimit`, si se
pasa abre un día nuevo igual); si no, crea una entrada de día nueva al frente
del array.

### `useCase/archiveTaskList.ts` — `archiveTaskListInTheLastColumn({ taskListInEachColumn, archive })`

Archiva toda la última columna de un saque. Tira `BusinessError` si esa
columna está vacía. Si hoy ya tiene entrada, mergea (`[...nueva, ...vieja]`,
las nuevas quedan arriba); si el merge se pasa del límite diario, no llega a
archivar nada (early return silencioso — ver Tips/historia). Si no hay entrada
de hoy, crea una nueva siempre que archivo y día quepan en los límites.

### `useCase/deleteArchivedTask.ts` / `useCase/cleanArchive.ts`

`deleteThisArchivedTask({ task, archive })` — filtra esa tarea de todos los
días (pura, no rompe si el día queda con `tasklist: []`, no se limpia el día
vacío). `cleanTheWholeArchive()` → `[]`.

### `model/taskDurationBoundaries.ts` — `getTaskDurationBoundaries({ timelineHistory, columnNames })`

Pura, deriva 3 fechas del `timelineHistory` de una tarea (test:
`model/taskDurationBoundaries.test.ts`):

- `start` — cuándo la tarea **salió de la 1ª columna**, no cuándo se creó. Es
  el entry siguiente al primero que sea una columna real del tablero
  (`columnNames`, de `useColumnList()`). Para una tarea creada directo en el
  tablero, `timelineHistory[0]` ya es la 1ª columna → `start = entry[1]`.
  Para una que viene del limbo, `timelineHistory[0]` es la etiqueta
  `t('limbo.moved_from_limbo')` ("Desde el limbo", no una columna real) →
  `start = entry[2]`. No se hardcodea "1" ni "2": se busca el primer entry
  cuyo `columnName` está en `columnNames`, y se toma el siguiente.
- `untilLastColumn` — la **última** vez que entró a la columna que hoy es la
  última del tablero (`columnNames.at(-1)`, derivado adentro de la función),
  o `null` si nunca llegó. Última
  ocurrencia y no la primera: cubre el caso de ir y volver a esa columna
  antes de archivar (en el caso común, sin idas y vueltas, da lo mismo).
- `untilArchived` — la última entrada de `timelineHistory`. Para una tarea
  que está actualmente en el archivo, archivar es siempre lo último que le
  pasó (si se hubiera devuelto al tablero, ya no estaría en esta vista).

### `ui/TaskDurationSummary.tsx`

Componente propio (mismo patrón que `TaskTimeline.tsx`: default export, un
solo render site). Lo monta `ArchivedTaskDetails` arriba de `TaskTimeline`,
dentro del mismo `CollapseTransition` de "Historial". Llama
`useTaskDurationEstimate` y muestra las dos duraciones + el disclaimer de
aproximación (siempre visible, no en tooltip). Cada línea se valida y se
oculta por separado (`untilLastColumn === null` o `=== 0`, `untilArchived
=== 0` — sin tiempo activo detectado en `usageHistory`), en vez de mostrar
"—" o "0h 0m"; si ninguna de las dos tiene algo útil, el componente entero
no renderiza nada (ni el disclaimer).

### `hooks/useTaskDurationEstimate.ts`

Wiring fino: pide `usageHistory` (`useUsageHistoryQuery`, de `usage-history`)
y `useColumnList()` (de `tasks`), arma los boundaries de arriba y llama
`estimateActiveDuration` (de `usage-history`, ver ese doc) dos veces — una
por métrica. Devuelve `{ untilLastColumn: number | null, untilArchived: number }`
en milisegundos. Es una **aproximación**: si en la misma ventana de tiempo
activo se trabajó más de una tarea, todas "duran" lo mismo que esa ventana.
Sin test propio — delegación fina sobre `getTaskDurationBoundaries` y
`estimateActiveDuration`, que ya están testeadas.

### `model/formatTaskDuration.ts` — `formatTaskDuration(ms) → "Xd Xh Xm"`

No reusa `parseDuration` de `usage-history` (`new Date(ms)` en UTC, se rompe
a partir de 24h) — la suma acumulada de varios días de una tarea supera eso
fácil en la práctica. Test: `model/formatTaskDuration.test.ts`.

### `model/downloadArchiveLikePDF.ts`

`downloadArchiveLikePDF({ archive, config? })` — arma un PDF con `jsPDF`
("brutalista": header negro, tipografía monoespaciada para el historial),
un bloque por tarea con notas (HTML de Tiptap pasado por `stripHtmlTags`) y
timeline si existen. Pagina sola cuando el contenido no entra
(`calculateTaskHeight` estima el alto antes de dibujar). Sin test unitario —
es todo dibujo imperativo sobre el `doc` de jsPDF.

## Persistencia y modelo

- **Tipos:** `Archive = taskListArchived[]` (`model/archive.ts`).
- **Prisma:** `model Archive` — `boardId String @unique`, `taskList Json`,
  `onDelete: Cascade`; `archive Archive?` en `Board`. Las migraciones las
  corre el usuario.
- **Server actions** (`api/actions/`): `getArchive({ boardId })` →
  `prisma.archive.findUnique`, `[]` si no existe; `saveArchive({ boardId, taskList })`
  → `prisma.archive.upsert`. Ambas validan con `requireBoardAccess(boardId)`.
  Full-sync del snapshot completo (mismo molde que `Limbo`).
- **Repositorio dual** (`api/repository/`): interfaz `ArchiveRepository` +
  `NextjsArchiveRepository` (import dinámico de las actions) y
  `LocalStorageArchiveRepository`. Modo invitado = `localStorage`, key **única**
  `tasks-archive` (a diferencia del limbo, que es por board). `index.ts` expone
  `fetchArchivedTasks` / `saveArchivedTasks` + selector por `session`.
- **Query hook:** `useArchivedTasksQuery` — key `['archived-tasks', userId, boardId]`,
  optimista (`onMutate` / `onError` / `onSettled`). `useArchive()` es el
  selector de solo lectura que usan `Content`, `Footer`, etc.
- **`BlankTask`:** `context='archive'` no cambia el ancho de la card (a
  diferencia de `'limbo'`); sí cambia el cálculo de `dueDate` (pasa
  `archivedDate` a `getDueDateDisplay` para mostrar el veredicto "a tiempo /
  tarde" contra la fecha de archivado en vez de "hoy").

## i18next

Namespace **`archive.*`** + `menu.archive` + `task_buttons.archive*`, en
`src/shared/i18n/es.json` y `en.json`:

| clave                          | ES                                    | EN                              |
| ------------------------------ | -------------------------------------- | -------------------------------- |
| `menu.archive`                 | Archivo                                | Archive                          |
| `archive.empty_archive`        | Aún no hay tareas archivadas.          | There are no archived tasks yet. |
| `archive.return_task_to_board_btn` | Restaurar                          | Restore                          |
| `archive.delete_task_btn`      | Eliminar                               | Delete                           |
| `archive.clean_archive_btn`    | Vaciar archivo                         | Clean archive                    |
| `archive.archive_to_pdf_btn`   | Descargar archivo como pdf             | Download file as pdf             |
| `archive.archive_to_json_btn`  | Descargar archivo como json            | Download file as json            |
| `archive.archived`             | Archivado                              | Archived                         |
| `archive.unarchived`           | Desarchivado                           | Unarchived                       |
| `archive.notes_option`         | Notas                                  | Notes                            |
| `archive.history_option`       | Historial                              | History                          |
| `task_buttons.archive`         | Archivar                               | Archive                          |
| `task_buttons.archive_toast`   | La tarea se guardo en el archivo.      | The task was saved in the file.  |

`archive.archived` / `archive.unarchived` no son textos de UI sueltos: son el
`columnName` que `addChangeToTaskTimelineHistory` graba en el timeline al
archivar / devolver al tablero, y lo que `TaskTimeline` termina mostrando.

**Namespace muerto:** `archive_page.{notes,tasks}` existe en ambos JSON pero
no lo usa ningún componente (quedó de un diseño anterior).

## Tips / historia

- **2026-09-13 — doc creada + notas/historial dejan de mostrarse juntas.**
- **2026-09-13 — flake preexistente en `e2e/task-archive.spec.ts`.**
  `navigateToMenuItem` no espera a que `next dev` termine de compilar
  `/archive/[id]` (compila cada ruta on-demand, ver `docs/e2e.md`); el
  `expect().toBeVisible()` con el timeout default (5 s) justo después de
  navegar a "Archivo" a veces no le alcanzaba a la primera visita y el test
  fallaba viendo todavía el tablero. No lo causó ningún cambio de código —se
  reprodujo igual con el archive UI de antes del dropdown/collapsible—; se
  subió el timeout a 15 s en esas tres aserciones puntuales.
- **Rama silenciosa — `archiveTaskListInTheLastColumn`.** Si el día de hoy ya
  existe y el merge (`[...nueva, ...vieja]`) se pasa de `dailyArchiveLimit`, la
  función no lanza `BusinessError` ahí: cae al segundo `if`, que vuelve a
  chequear `isItWithinTheArchiveLimit` **y** `isItWithinTheDailyArchiveLimit`
  sobre la lista nueva sola (no el merge) — si esa combinación tampoco
  alcanza, devuelve el `archive` sin cambios y sin avisar al usuario. Caso de
  borde raro (archivar una columna llena justo el mismo día que ya se llenó el
  archivo diario) pero existe.
- **Decisión — `localStorage` con bucket único (`tasks-archive`).** A
  diferencia del `Limbo` (clave por board), el modo invitado tiene un solo
  archivo para todos los tableros. No documentado como decisión consciente en
  el código; queda registrado acá para quien lo toque.
- **Límite conocido — el día vacío no se limpia.** `deleteThisArchivedTask` no
  saca la entrada del día si `tasklist` queda en `[]`; ese día sigue
  ocupando lugar en el array (contra `archiveLimit`) mostrando una `Card` con
  el título de la fecha y nada abajo. No se ve en la práctica porque hace
  falta borrar manualmente todas las tareas de un día para pegarle.
