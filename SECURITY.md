# Seguridad

Capo es un proyecto open source (licencia MIT) mantenido por un desarrollador independiente. No hay un
programa formal de bug bounty, pero los reportes de vulnerabilidades se toman en serio y se atienden con
prioridad.

## Reportar una vulnerabilidad

**No abras un issue público para vulnerabilidades de seguridad.**

Reportala de forma privada a **ciromirkin@gmail.com** con:

- Una descripción del problema y su impacto potencial.
- Pasos para reproducirlo (o una prueba de concepto, si es posible).
- La versión o el commit donde lo encontraste.

Vas a recibir una respuesta en un plazo razonable. Los problemas críticos se priorizan; los de menor
severidad se agendan como cualquier otro trabajo del proyecto.

## Alcance

Cubre el código de este repositorio: la app web (`web-app/`) y su infraestructura de autenticación,
autorización y manejo de datos. No cubre servicios de terceros de los que Capo depende (GitHub OAuth,
Vercel, Netlify, Prisma Postgres, Sentry) — esos reportes van directamente al proveedor correspondiente.

## Qué esperar de la respuesta

Los controles vigentes están descritos en detalle en la [Política de Seguridad](https://cappo.vercel.app/security)
de la app: autenticación con better-auth, aislamiento de datos por cuenta a nivel de servidor, hash de
contraseñas con bcrypt y rate limiting en el login. Al reportar, indicá si tu hallazgo evade alguno de esos
controles puntuales — ayuda a priorizar.

## Divulgación responsable

Pedimos no publicar detalles de la vulnerabilidad (issue, redes sociales, etc.) hasta que haya un fix
disponible o se acuerde un plazo de divulgación. A cambio, se te va a acreditar en el changelog o en el
commit de la corrección, si así lo preferís.
