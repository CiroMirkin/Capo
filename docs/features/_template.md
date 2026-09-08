# <Nombre de la feature>

> Plantilla para `docs/features/<slug>.md`. Una feature = un archivo. Borrar
> este bloque y los comentarios `<!-- … -->` al instanciarla. Mantener el
> orden de las secciones.

## Resumen

<!-- 2–4 líneas: qué hace, para qué usuario, qué problema resuelve. Sin código. -->

- **Código:** `web-app/src/features/<slug>/` (+ shared que toca)
- **Alcance / fuera de alcance:** una línea cada uno.

## Diagrama C4 — código

<!--
Nivel 4 de C4: los componentes React y las funciones de dominio como "clases"
(estilo UML class). Cada caja: tag de capa + nombre + props / params / retorno.
Flechas con verbo (usa · llama · computa · renderiza). Solo lo que hace falta
para seguir el flujo, no el árbol entero. Presupuesto: 7 cajas, 8 flechas,
2 elementos en color de acento.

Se dibuja con la skill `diagram-design` (tipo "UML class"), NO con mermaid:
- Fuente + export siguen `docs/diagramas/` (ver `docs/arquitectura.md`).
- Archivos: `docs/diagramas/<slug>-c4.html` (editable) y `<slug>-c4.svg` (export).
- El `.svg` es el bloque `<svg>` del `.html` con el `@import` de fuentes inyectado.
- Se embebe acá con la ruta relativa de abajo.
-->

![Diagrama C4 (código) de la feature](../diagramas/<slug>-c4.svg)

<!--
Opcional: bajo el diagrama, un párrafo por componente/función clave con su
propósito y objetivo a alto nivel — para qué existe, qué resuelve. Nada de
detalle de implementación (clases CSS, params de animación, firmas exactas):
eso vive en el código, en Modelo/lógica o en Tips/historia.
-->


## Modelo / lógica

<!--
Funciones puras de dominio: firma, qué devuelven, dónde viven
(`model/` = tipos + funciones; `useCase/` = transformaciones de estado).
Reglas de negocio, validaciones, casos borde. Dónde está el test unitario.
-->

## Persistencia y modelo

<!--
- Forma del dato: tipo TS (`model/`), campos nuevos.
- Prisma: campo en `schema.prisma` + archivo de migración
  (`prisma/migrations/<ts>_<slug>/`). La migración la corre el usuario.
- Modo invitado / `localStorage`: qué cambia (normalmente nada, viaja en el JSON).
- Repositorio dual / server actions: mapeo en `get*.ts` y `save*.ts`
  (bloques `create` y `update`).
-->

## i18next

<!--
- Namespace y claves nuevas (`<ns>.*`).
- Archivos: `src/shared/i18n/es.json` y `en.json`. Ninguna cadena sin par ES/EN.
- Plurales (`_one` / `_other`), interpolación, notas de locale.
-->

## Tips / historia

<!--
Bitácora en viñetas, con fecha (AAAA-MM-DD) cuando aplique:
- Decisiones de diseño y por qué (alternativas descartadas).
- Bugs pasados y su causa raíz.
- Migraciones o cambios de esquema importantes.
- Límites conocidos / deuda aceptada.
- Recursos: skills usadas, ADRs, PRs, issues de `.scratch/`.
-->
