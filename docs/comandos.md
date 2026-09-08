# Comandos

Todos los comandos se corren desde `web-app/`.

## Servidor de desarrollo

Para correr el servidor de desarrollo:

```bash
npm run dev
```

El comando `npm run dev` levanta la app en [http://localhost:3000/](http://localhost:3000/).

## Despliegue

Para compilar la aplicación:

```
npm run build
```

El comando `npm run build` genera la carpeta `.next` con el build de producción. Para servir ese build en local:

```bash
npm run start
```

## Base de datos (Prisma)

El esquema está en `prisma/schema.prisma` y la configuración en `prisma7.config.ts` (Prisma la carga sola).

Para explorar y editar los datos con una interfaz web:

```bash
npx prisma studio
```

El comando `npx prisma studio` abre un panel en [http://localhost:5555/](http://localhost:5555/) para ver y modificar las filas de cada tabla.

Para regenerar el cliente de Prisma después de tocar el esquema (no modifica la base):

```bash
npx prisma generate
```

Para validar o dar formato al esquema:

```bash
npx prisma validate
npx prisma format
```

Para crear y aplicar una migración en desarrollo:

```bash
npx prisma migrate dev --name <nombre>
```

Para aplicar las migraciones pendientes (CI / producción):

```bash
npx prisma migrate deploy
```

Para cargar datos de ejemplo desde `prisma/seed.ts`:

```bash
npm run seed
```

> [!WARNING]
> `prisma migrate`, `prisma db push`, `npm run seed` y editar filas en Studio **escriben sobre la base de datos real**. Usalos solo contra una base local o de prueba.

## Linting

Para correr el linter:

```bash
npm run lint
```
> [!NOTE]
> ESLint se ejecuta automáticamente antes de realizar un _commit_.

Si se realizan cambios en la configuración de eslint, asi se puede verificar que no haya conflictos entre eslint y prettier:  

```bash 
npx eslint-config-prettier ./app/layout.tsx 
```

## Formato (Prettier)

Para darle formato a todo el código:  

```bash 
npm run format 
```   
> [!NOTE]
> Prettier se ejecuta automáticamente antes de realizar un _commit_.


Si se realizan cambios en la configuración de Prettier, asi se puede verificar que no haya conflictos entre eslint y prettier:  

```bash 
npx eslint-config-prettier ./app/layout.tsx 
```

## Pruebas

Para correr todas las pruebas unitarias por consola: 

```bash
npm test
```

Para correr las pruebas unitarias en modo _watch_:

```bash
npm run test:watch
```

Para correr solo las pruebas de un archivo:

```bash
npm test addTask.test.ts
```
```bash
npm test src/features/tasks/useCase/addTask.test.ts
```

> [!WARNING]
> **No olvide** agregar la extension `.test` al escribir el nombre del archivo.

Para correr las pruebas unitarias con entorno gráfico: 

```bash
npm run test-ui
```

El comando `npm run test-ui` creara un **sitio local** donde poder ver el estado de las pruebas en: [http://localhost:51204/__vitest__/#/](http://localhost:51204/__vitest__/#/).

Para correr las pruebas _end to end_ (Playwright, Chromium + Firefox):

```bash
npm run test:e2e
```

> [!TIP]
> Workaround inmediato sin esperar: dejá `npm run dev` corriendo en otra terminal y después `npm run test:e2e` — con `reuseExistingServer` local, Playwright usa ese server ya caliente y arranca al toque.

Para correrlas con entorno gráfico:

```bash
npm run test:e2e-ui
```

> [!NOTE]
> Las pruebas se ejecutan automáticamente antes de realizar un _push_.
