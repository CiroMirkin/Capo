---
name: Capo
description: Un taller de trabajo silencioso donde la tarea es lo único que brilla.
colors:
  ink: "hsl(222.2 84% 4.9%)"
  paper: "hsl(0 0% 100%)"
  primary: "hsl(222.2 47.4% 11.2%)"
  primary-foreground: "hsl(210 40% 98%)"
  muted: "hsl(210 40% 96.1%)"
  muted-foreground: "hsl(215.4 16.3% 46.9%)"
  border: "hsl(214.3 31.8% 91.4%)"
  destructive: "hsl(0 84.2% 60.2%)"
  destructive-foreground: "hsl(210 40% 98%)"
  ring: "hsl(222.2 84% 4.9%)"
  tag-default: "#171717"
  retro-bg: "#DE6536"
  retro-column: "#EFE8D2"
  retro-task: "#F5B46C"
  prado-bg: "#001D21"
  prado-column: "#DFE1CB"
  prado-task: "#AEB17E"
  prado-foreground: "#FAE9CF"
typography:
  display:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.2em"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.025em"
  headline:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.025em"
  task:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.025em"
  body:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.025em"
  label:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "44px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-column:
    backgroundColor: "{colors.retro-column}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-task:
    backgroundColor: "{colors.retro-task}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    typography: "{typography.task}"
  badge-tag:
    backgroundColor: "{colors.tag-default}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
    typography: "{typography.label}"
---

# Design System: Capo

## Overview

**Creative North Star: "El taller con luz propia"**

Capo es una superficie de trabajo, no un producto que se mira. Todo el
armazón de la aplicación —el encabezado, el menú, los diálogos, la pantalla
de ajustes— está hecho de un gris pizarra casi neutro sobre papel blanco,
con la tipografía Satoshi como único gesto de carácter. Ese armazón está
deliberadamente apagado para que no compita con nada. Encima de él, el
usuario elige un tema de tablero de un catálogo de más de veinte —barro
cocido, oliva, salvia, un verde BMO, gradientes— y ese color es la única voz
alta de la pantalla. La marca no impone un ambiente; presta una mesa limpia
y deja que cada persona encienda su propia luz.

Dentro del tablero, **la tarea es el centro y nada más compite con ella.**
Las acciones de cada tarea están ocultas hasta que hacés clic; el nombre de
la columna vive al 70% de opacidad; no hay contadores, insignias de estado
ni métricas de adorno. El único elemento que se comporta como un objeto
físico es la tarjeta de tarea: descansa con una sombra mínima y se levanta
cuando la apuntás. Todo lo demás es plano.

La actitud es sobria y casi brutalista: rectángulos netos, un solo peso de
borde, cero sombra decorativa, cero relleno de más. Rechaza explícitamente
dos cosas: el look SaaS de equipo (Jira, Linear —sidebars densas, estados
por todos lados, dashboards de métricas) y el pulido skeumórfico o glass
(desenfoques, degradados de fondo, brillos). Los gradientes solo existen
donde un tema de tablero los pide.

**Key Characteristics:**
- Dos capas: chrome pizarra apagado + tablero cromático elegido por el usuario.
- La tarjeta de tarea es la única pieza con peso físico; el resto es plano.
- Jerarquía por sustracción: se oculta o se atenúa todo lo que no es la tarea.
- Profundidad por tono, no por sombra: fondo saturado → columna clara → tarea media.
- Sin adorno: nada de streaks, medallas, confeti, contadores decorativos.
- Bilingüe ES/EN; el diseño se valida en ambos idiomas.

## Colors

Dos paletas que nunca se mezclan: el chrome es monocromo frío; el tablero es
pigmento cálido y terroso que elige el usuario.

### Primary
- **Pizarra Tinta** (`hsl(222.2 47.4% 11.2%)`, casi `#1e293b`): color de acción
  del chrome —botón primario, texto de máxima jerarquía, anillo de foco. En
  tema oscuro del chrome se invierte a casi blanco (`hsl(210 40% 98%)`).

### Neutral
- **Papel** (`hsl(0 0% 100%)`, `#ffffff`): fondo del chrome y de los campos de
  formulario. Los inputs están fijados a papel blanco incluso cuando el
  tablero de fondo es oscuro.
- **Tinta** (`hsl(222.2 84% 4.9%)`, casi `#020817`): texto primario del chrome.
- **Gris Apagado** (`hsl(210 40% 96.1%)`): superficie de `muted` / `secondary`
  / `accent` —fondos de hover, chips neutros, separadores suaves.
- **Gris Medio** (`hsl(215.4 16.3% 46.9%)`): texto secundario, descripciones,
  placeholders.
- **Borde** (`hsl(214.3 31.8% 91.4%)`): el único trazo del chrome —bordes de
  input, de diálogo, de la Card base. Un solo peso, 1px.

### Tablero: temas por defecto
El tablero no tiene una paleta fija; se pinta con el tema activo. Los dos
defaults definen el carácter cromático — **"cerámica y pradera"**: barro
cocido más verdes vegetales apagados, superficies mate, saturación media-baja,
contraste suave pensado para baja fatiga visual.

- **Retro** (claro): fondo terracota `#DE6536`, columnas crema `#EFE8D2`,
  tareas ocre `#F5B46C`. Es el `lightTheme`.
- **Prado Oscuro** (oscuro): fondo casi negro verdoso `#001D21`, superficies
  salvia `#DFE1CB` y oliva `#AEB17E`, texto crema `#FAE9CF`. Es "tinta sobre
  lino", no "modo noche": las superficies siguen siendo claras y cálidas.

### Destructive
- **Rojo Alerta** (`hsl(0 84.2% 60.2%)`, casi `#ef4444`): solo acciones
  irreversibles —eliminar tablero, eliminar columna, resetear. En tema oscuro
  del chrome baja a `hsl(0 62.8% 30.6%)`.

### Etiquetas (sistema aparte)
Las etiquetas de tarea usan un sistema de color propio estilo Vercel: ocho
tonos (gris, azul, violeta, ámbar, rojo, rosa, verde, teal), cada uno con
variante sólida y variante `subtle` con par claro/oscuro, más `inverted`
(el default) y dos gradientes (`trial`, `turbo`). Los valores exactos viven
en `.impeccable/design.json` y en `src/shared/ui/atoms/badge.tsx`.

### Named Rules
**La Regla de la Voz Prestada.** El chrome nunca introduce color propio más
allá de pizarra, rojo destructivo y los grises. Todo color con personalidad
en pantalla viene del tema de tablero que eligió el usuario. Si un elemento
nuevo del chrome "necesita" color, está mal resuelto.

**La Regla de los Inputs de Papel.** Los campos de texto son siempre blancos
con texto negro, sin importar el tema de fondo. La entrada de datos es un
acto neutro; no se tiñe.

## Typography

**Display / Body Font:** Satoshi (con fallback `ui-sans-serif, system-ui, sans-serif`)

**Character:** Satoshi es una grotesca geométrica con un ligero calor humanista
—la única declaración de identidad tipográfica del sistema. El cuerpo lleva
`letter-spacing: 0.025em` global, un tracking apenas abierto que hace el texto
más tranquilo de leer en sesiones largas.

**Restricción real:** solo se cargan dos pesos vía `@font-face` —Medium (500)
y Bold (700). Cualquier `font-semibold` (600) en el código lo sintetiza el
navegador o cae a 500/700. Diseñar con 500 y 700 como los únicos pesos reales.

### Hierarchy
- **Display** (700, `2.2em`, lh 1.1): títulos de contenido largo —`/help`,
  prosa del editor Tiptap.
- **Headline** (700, `1.875rem` / text-3xl, tracking-tight): nombre de columna.
  **Se renderiza siempre al 70% de opacidad** (ver Regla de la Columna Callada).
- **Title** (500, `1.5rem` / text-2xl): título del encabezado de página y
  títulos de sección en Ajustes. Peso medio, sin grito.
- **Task** (700, `1.25rem` / text-xl, lh 1.15): el texto de la tarjeta de
  tarea. Es el tamaño de cuerpo más grande del producto a propósito: la tarea
  pesa más que su contexto.
- **Body** (500, `0.875rem` / text-sm): texto por defecto del chrome —ítems de
  menú, botones, etiquetas de formulario.
- **Label** (700, `0.75rem`, `tabular-nums`): texto de badges/etiquetas.
  `capitalize` por defecto.

### Named Rules
**La Regla de la Columna Callada.** El nombre de la columna se muestra grande
(text-3xl) pero atenuado al 70% de opacidad. Es una etiqueta de orientación,
no un encabezado que reclame atención. Nunca subir esa opacidad ni ponerlo en
color pleno.

## Layout

Modelo de una sola columna de contenido centrada; el tablero es la excepción
que se expande a lo ancho.

- **Contenedor:** centrado, padding `2rem`, tope de ancho `1400px` en `2xl`.
- **Encabezado:** `px-6 md:px-11 pt-6 pb-4`, flex con título a la izquierda y
  el acceso a Notas a la derecha. En móvil (y en las rutas sin tablero) suma el
  disparador del menú desplegable; en escritorio, dentro de una ruta con
  tablero, ese botón se oculta (`md:hidden`) y la navegación pasa al NavRail.
- **NavRail (solo escritorio, rutas con tablero):** rail vertical de iconos
  fijado al borde izquierdo o derecho del viewport (elegible en Ajustes,
  default izquierda), centrado en vertical. `bg-transparent` en reposo — son
  glifos monocromos sueltos sobre el tablero, sin panel, borde ni sombra.
  Tres estados: reposo (iconos a `scale-.55`), cursor dentro de los ~140px del
  borde (`scale-1`, solo escala), hover/foco sobre el rail (aparecen las
  etiquetas —tras una pausa de ~200ms— y un respaldo temporal con el `column`
  del tema y `shadow-sm` para separarlo de la columna; el tablero nunca se
  corre, el rail es overlay). Es la única excepción a la Regla de la Tarjeta
  Tomable, y solo en el estado abierto. Lleva toda la
  navegación del dropdown más el registro de uso en vivo; el ítem de la
  sección actual va atenuado. Colapsa al dropdown del encabezado por debajo de
  `md` y en las rutas sin tablero.
- **Página:** wrapper `${bg} ${text}` del tema; `<main>` con
  `min-h-[calc(100vh-5rem)]`.
- **Tablero:** columnas en fila flex, cada una `flex-1 min-w-48`, con gap. El
  cuerpo de columna tiene `min-h-64` (`md:min-h-[60vh]`); las tareas se apilan
  con `gap-y-2` (8px).
- **Ajustes / lectura:** secciones a `max-w-2xl`, `px-6 md:px-11`.
- **Ritmo de espaciado:** escala Tailwind de 4px. Valores recurrentes: 6px
  entre badges, 8px entre tareas, 16px de padding de tarjeta, 24px de padding
  horizontal móvil, 44px en desktop.
- **Breakpoints:** `sm` 640, `md` 768 (el salto principal), `2xl` 1400.

## Elevation & Depth

**Plano por defecto; la tarjeta de tarea es la única pieza con peso físico.**
Las columnas no tienen sombra ni borde —flotan sobre el fondo solo por
contraste de tono. Los diálogos y dropdowns del chrome llevan la sombra de
shadcn (`shadow-lg`) porque se despegan de la página, pero eso es todo.

La profundidad del tablero es tonal, no proyectada: el fondo del tema es el
tono más saturado, la columna es el más claro, la tarea queda en el medio.
Tres capas de color, cero elevación falsa.

### Shadow Vocabulary
- **Reposo de tarea** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)` — `shadow-sm`):
  la tarjeta descansa apenas despegada.
- **Tarea apuntada** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` — `shadow-lg`):
  al hover, la tarjeta se levanta. Transición de `box-shadow` en 200ms. Es el
  único cambio de elevación por estado en todo el producto.
- **Capa flotante** (`shadow-lg`): diálogos y menús desplegables.

### Named Rules
**La Regla de la Tarjeta Tomable.** Solo la tarea cambia de elevación, y solo
al apuntarla. Ninguna columna, panel, sección ni botón proyecta sombra en
reposo ni la gana al hover. Si algo nuevo "pide" una sombra, plantéalo plano
primero.

## Shapes

Lenguaje de esquina discreto y consistente, derivado de `--radius: 0.5rem`.

- **Radio:** `lg` 8px (columnas, secciones de ajustes, diálogo en desktop),
  `md` 6px (tareas, botones, inputs, diálogo en móvil), `sm` 4px (cierres,
  detalles), `full` 9999px (solo badges de etiqueta).
- **Bordes:** ausentes en el tablero (`border-none` explícito en columnas y
  tareas). Presentes solo en el chrome: input, diálogo y la Card base, siempre
  1px del color Borde.
- **Silueta:** rectángulos de esquina suave. Nada de recortes diagonales,
  biseles, ni formas orgánicas. La única forma redonda pura es el badge de
  etiqueta.

## Components

### Buttons
- **Shape:** esquina suave (`rounded-md`, 6px). Altura fija 40px (`h-10`),
  padding `8px 16px`; variantes `sm` 36px y `lg` 44px.
- **Primary:** fondo Pizarra Tinta, texto casi blanco. Hover: `primary/90`.
- **Destructive:** fondo Rojo Alerta, texto casi blanco. Hover: `destructive/90`.
  Reservado a acciones irreversibles.
- **Outline / Secondary / Ghost:** outline = borde 1px + fondo papel, hover a
  `accent`; secondary = fondo Gris Apagado; ghost = sin fondo, hover a `accent`.
- **destructiveGhost:** variante propia —transparente en reposo, fondo rojo al
  hover. Para acciones de borrado dentro de listas densas.
- **Estados:** transición solo de color (`transition-colors`). Foco: anillo de
  2px (`ring-ring`) con offset de 2px. `disabled`: opacidad 50%, sin eventos.

### Inputs / Fields
- **Style:** altura 40px, `rounded-md`, borde 1px del color Borde, **fondo
  siempre blanco con texto negro** (fijo, ignora el tema).
- **Focus:** anillo de 2px con offset (inputs) o de 1px (textarea).
- **Disabled:** cursor bloqueado, opacidad 50%.
- **Textarea:** arranca en 40px de alto y crece; `shadow-sm` sutil.

### Cards / Containers
- **Card base:** contenedor mínimo —`border` 1px, `bg-card`, `px-4`. Sin radio
  propio, sin sombra. Es un primitivo, no un panel decorado.
- **Columna:** Card con `rounded-lg`, `border-none`, fondo `column` del tema.
  Cabecera con el nombre de columna atenuado. Al arrastrar una tarea encima,
  la columna toma el color `task` del tema como feedback de drop.
- **Tarjeta de tarea:** `rounded-md`, `border-none`, fondo `task` del tema,
  `shadow-sm` → `shadow-lg` al hover. Texto a `text-xl font-semibold`. Al
  hacer clic, expande hacia abajo (`CollapseTransition`, 300ms) revelando la
  fila de acciones: mover, copiar, notas, archivar, eliminar.
- **Padding interno:** tarea `px-3 py-2`; columna `px-4`; sección de ajustes
  `p-4` sobre `md:px-11`.

### Chips / Badges (etiquetas)
- **Shape:** píldora completa (`rounded-full`), altura 24px (`md`), `px-2.5`.
- **Style:** `font-bold`, `tabular-nums`, `capitalize`. Variante por defecto
  `inverted` (fondo casi negro / texto casi blanco, se invierte en oscuro).
- **Sistema:** 8 hues × {sólido, subtle} + `inverted` + gradientes `trial` /
  `turbo`. La prioridad numérica de la etiqueta ordena las tareas, no el color.

### Navigation
- **Dos superficies, nunca al mismo tiempo.** El mismo conjunto de destinos
  —inicio, tablero / archivo / ajustes del tablero, idioma, ayuda, GitHub,
  tiempo de uso, login/logout— se muestra según el contexto:
  - **Dropdown del encabezado** (icono `Menu`, 40×40, ghost). Es la superficie
    en móvil y en las rutas sin tablero (dashboard, ayuda, auth). Ítems a
    `text-sm`, `px-2 py-1.5`, icono lucide 16–20px a la izquierda con `mr-2`.
  - **NavRail** (ver Layout). Es la superficie en escritorio dentro de una
    ruta con tablero. Iconos lucide a 20px, etiqueta al lado que solo aparece
    en hover/foco. En reposo toma el `text` del tema; con el respaldo abierto,
    `column` de fondo y `columnText` de texto.
- El ítem de la sección actual va `disabled` / atenuado en ambas superficies.
- **Sin breadcrumbs.** Nunca hay dropdown y rail visibles a la vez.

### Iconografía
- **lucide-react**, trazo por defecto, tamaño 20px en el chrome (16px en
  contextos densos como el menú). Nunca rellenos, nunca multicolor.

## Do's and Don'ts

### Do:
- **Do** mantener el chrome en pizarra + grises + rojo destructivo. El color
  con personalidad lo aporta el tema del tablero, no vos.
- **Do** dejar planas todas las superficies salvo la tarjeta de tarea; esa es
  la única que gana `shadow-lg` al hover.
- **Do** ocultar las acciones secundarias detrás de un clic o un hover. En el
  tablero, en reposo solo se ve: nombre de columna atenuado + texto de tareas.
- **Do** usar Satoshi 500 y 700 como los únicos pesos; tratar 600 como no
  disponible.
- **Do** renderizar el nombre de columna a `opacity: .70`, grande pero callado.
- **Do** probar cada pantalla en español y en inglés (los strings EN suelen
  ser más cortos; los ES desbordan antes).
- **Do** fijar los inputs a fondo blanco / texto negro aunque el tema sea oscuro.

### Don't:
- **Don't** agregar sombras decorativas, `backdrop-blur`, glassmorphism o
  degradados de fondo al chrome. Los gradientes solo existen dentro de temas
  de tablero concretos.
- **Don't** introducir contadores, medallas, streaks, barras de progreso,
  confeti ni ninguna gamificación. Capo audita el tiempo, no premia.
- **Don't** poner el nombre de columna en color pleno o al 100% de opacidad.
- **Don't** darle al NavRail cuerpo de panel: nada de fondo permanente, borde
  o sombra en reposo, ni ancho reservado que corra el tablero. En reposo es
  `bg-transparent` y overlay; el respaldo (`column` del tema) aparece solo
  mientras el rail está en hover/foco. Tampoco un ripple por icono tipo dock:
  todos los iconos escalan a la vez.
- **Don't** mostrar el NavRail y el dropdown del encabezado a la vez, ni sacar
  el rail de las rutas con tablero en escritorio. Fuera de ese caso (móvil,
  dashboard, ayuda, auth) la navegación es el dropdown. Sin breadcrumbs.
- **Don't** mostrar las acciones de una tarea sin que el usuario la abra; nada
  debe competir con el texto de la tarea en reposo.
- **Don't** meter un color de acento nuevo en el chrome "para destacar algo".
  Si algo necesita jerarquía, resolvela con tamaño, peso u opacidad.
- **Don't** usar `border` en columnas o tarjetas de tarea; el lenguaje del
  tablero es sin borde.
