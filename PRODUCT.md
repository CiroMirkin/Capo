# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Usuario principal: **desarrolladores y profesionales técnicos** (programadores,
freelancers técnicos y perfiles similares) que gestionan su propia semana de
trabajo, de forma **individual — nunca en equipo**, en entornos de alta carga
mental. El trabajo que hacen con Capo: capturar tareas, priorizarlas,
moverlas por un flujo de columnas, dejar notas de contexto y revisar cuánto
tiempo dedicaron.

El producto se usa desde el navegador de escritorio como pestaña de apoyo
durante la jornada (el registro de tiempo se pausa al cerrar la pestaña, lo
que confirma el patrón de uso "abierta mientras trabajo").

## Product Purpose

Capo centraliza en una sola interfaz cohesiva tres cosas que normalmente
viven en herramientas separadas:

- **el flujo de trabajo** — un tablero de tareas con columnas, etiquetas de
  prioridad y recordatorios;
- **la memoria de contexto** — una nota larga por tablero (hasta 10 000
  caracteres) más notas cortas por tarea;
- **la auditoría de rendimiento** — registro de tiempo de uso por sesiones y
  archivo histórico de tareas (60 días), exportable a PDF/JSON.

Éxito = el usuario mantiene su trabajo claro, priorizado y accesible sin
saltar entre apps, y puede mirar atrás para entender cómo usó su tiempo.

## Positioning

Capo **funciona con o sin cuenta, y sin cuenta funciona entero**: sin sesión
toda la persistencia cae en `localStorage` del navegador; con sesión persiste
en PostgreSQL vía server actions + Prisma y habilita hasta 5 tableros
independientes. El modo invitado no es una demo ni un fallback: es una forma
de uso de primera clase e indefinida. Ninguna funcionalidad central puede
exigir cuenta ni servidor.

El segundo eje de posición es la unión tablero + notas + auditoría de tiempo
en un producto deliberadamente para una sola persona, no un Trello/Jira
recortado para equipos.

## Operating Context

- Navegador de escritorio, una pestaña abierta durante la jornada laboral.
- Idioma de la interfaz según el idioma del sistema operativo (ES / EN).
- Tema claro / oscuro / sistema, elegible por el usuario.
- Login opcional por email + contraseña (bcrypt) o GitHub OAuth.
- Rutas del producto: dashboard multi-tablero (`/`), tablero (`/board/[id]`)
  con vistas LIST / BOARD / NOTE-LIST, archivo (`/archive/[id]`), registro de
  uso (`/time/[id]`), preferencias (`/settings`, `/settings/[id]`), auth
  (`/auth`), ayuda (`/help`).

## Capabilities and Constraints

Reglas de negocio confirmadas (fuente: `docs/casos-de-uso.md`, README):

- **Tableros:** hasta 5 por usuario registrado; nombre obligatorio. (El
  límite del nombre difiere entre docs: ≤30 caracteres en un sitio, 2–15 en
  otro — sin resolver.)
- **Columnas:** mínimo 2, máximo 6 por tablero (Ley de Miller, anti
  sobrecarga cognitiva); nombre obligatorio ≤30 caracteres.
- **Tareas:** se crean solo en la primera columna; descripción obligatoria
  ≤200 caracteres; límite de 10 tareas por columna; se ordenan por prioridad
  de etiqueta. Nota corta por tarea ≤5000 caracteres (docs internas dicen
  5000; README dice "comentarios cortos" — 5000 es el valor de las historias
  de usuario). Fecha límite opcional (`YYYY-MM-DD`, sin hora), solo al crear,
  no anterior a hoy; la tarjeta avisa la proximidad del vencimiento.
- **Etiquetas:** grupos de etiquetas activables; una etiqueta = número de
  prioridad (1 = más alta); solo se usan las del grupo habilitado; sin límite
  por tarea.
- **Recordatorios:** descripción + columna objetivo; se muestran cada vez que
  una tarea entra en esa columna.
- **Notas de tablero:** una sola por tablero, ≤10 000 caracteres; archivables
  con fecha; lista de notas archivadas.
- **Archivo de tareas:** diario, hasta 30 tareas/día, retención 60 días;
  registro de cambios de estado con fecha y hora; exportación PDF o JSON.
- **Registro de uso:** tiempo diario en formato `HH:MM:SS`, se actualiza cada
  minuto, se pausa al cerrar la pestaña; nueva sesión tras 25 min de
  inactividad; cada sesión con inicio, fin y duración.
- **Aislamiento por cuenta:** cada server action valida sesión y pertenencia
  del recurso en el servidor antes de leer o escribir; ninguna cuenta accede
  a datos de otra.
- **Modo invitado:** sin sesión el middleware lleva a `/board/guest` y todo se
  guarda en `localStorage` bajo claves `board-capo`, `taskListInEachColumn`,
  `tasks-archive`, `tags-capo`, `capo-reminder`, `capo-notes`,
  `capo-archived-notes`, `capo-usage-history`.

Terminología: "tablero", "columna", "tarea", "etiqueta", "recordatorio",
"nota", "archivo", "registro de uso", "modo invitado".

Decisión abierta: límite real del nombre de tablero (30 vs 15 caracteres).

## Brand Commitments

- **Nombre:** Capo. No re-brandear.
- **Licencia:** MIT.
- **Assets existentes:** `web-app/public/Capo_OG.png` (imagen OG), demo
  pública en Netlify (`cm-boar.netlify.app`), repo `github.com/CiroMirkin/Capo`.
- **Autor:** Ciro Mirkin.
- **Bilingüe obligatorio:** toda la UI existe en español e inglés (i18next),
  seleccionada por el idioma del SO. Ninguna cadena visible puede quedar sin
  su par ES/EN.
- **Minimalismo como principio, no solo estética:** interfaz sobria, sin
  distracciones, pensada para reducir la fatiga visual; temas claro / oscuro
  / sistema son parte de ese compromiso.

## Evidence on Hand

- `README.md` — problemática, impacto, stack, tabla de KPIs técnicos.
- `docs/casos-de-uso.md` — historias de usuario implementadas, con límites.
- `docs/arquitectura.md` + `docs/diagramas/` — modelo C4, patrón de feature
  con repositorio dual, rutas.
- `docs/modelo-datos.md` — esquema Prisma y diagrama ER.
- Design system atómico ya implementado en `web-app/src/shared/ui/`
  (`atoms` → `molecules` → `organisms`), sobre Radix UI + Tailwind +
  `class-variance-authority`, iconos `lucide-react`, editor Tiptap.
- No hay testimonios, métricas de usuarios reales, casos de estudio, pricing
  ni clientes: **no inventar ninguno**. La demo es de vista previa, no un
  producto comercial con base de usuarios documentada.

## Product Principles

1. **Sin cuenta también es Capo entero.** Toda feature central funciona en el
   navegador sin backend; el login añade multi-tablero y sincronización, no
   desbloquea lo básico.
2. **Una persona, no un equipo.** Cada decisión asume un único usuario
   gestionando su propio trabajo; nada de colaboración, asignación ni roles.
3. **Menos es foco.** Los límites duros (6 columnas, 10 tareas/columna, 1
   nota de tablero) son deliberados: previenen la sobrecarga cognitiva. No
   ampliarlos "porque se puede".
4. **El tiempo es dato.** El registro de uso y el archivo histórico existen
   para que el usuario audite su propio rendimiento; tratarlos como
   funcionalidad de primer nivel, no como accesorio.
5. **Bilingüe siempre.** ES y EN son ciudadanos iguales; el diseño se valida
   en ambos idiomas.

## Accessibility & Inclusion

No se estableció un estándar formal (WCAG AA/AAA) como requisito de producto.
Compromiso confirmado y vinculante: **reducción de la fatiga visual** —
contraste cómodo, tipografía legible, y soporte real de tema oscuro y de la
preferencia del sistema. Registrar aquí un objetivo WCAG concreto si el
usuario lo fija más adelante.
