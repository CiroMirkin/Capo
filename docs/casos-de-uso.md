# Casos de uso

Capo es una herramienta visual para gestionar tareas de forma sencilla y efectiva diseñado para mantener tu trabajo claro, priorizado y accesible.

* **Tablero flexible**: Visualízalo vertical u horizontalmente, con notas adjuntas, y personaliza su nombre.
* **Tareas organizadas**: Crea, mueve y prioriza tareas con etiquetas, añade notas y elimina lo que ya no necesites.
* **Recordatorios automáticos**: Recibe alertas cuando las tareas lleguen a columnas clave.
* **Etiquetas y prioridades**: Ordena tareas por importancia y usa grupos de etiquetas personalizables.
* **Notas y archivo**: Guarda una nota por tablero, archiva tareas diarias (hasta 30 por día) y exporta el historial en PDF.
* **Columnas adaptables**: Crea, renombra o elimina columnas (máximo 6, mínimo 2).

Detalle de las historias de usuario implementadas actualmente:

## Tablero

* Como usuario, debo poder visualizar el tablero de dos formas: verticalmente, horizontalmente y verticalmente con las notas al lado.

* Como usuario, puedo cambiar el nombre del tablero.
  * El nombre del tablero no puede sobrepasar los 30 caracteres.

* Como usuario registrado, puedo tener varios tableros independientes.
   * 5 tableros por usuario.
   * Es obligatorio que cada tablero tenga un nombre, el nombre debe tener mas de 2 caracteres y menos de 15.

* Como usuario registrado, puedo eliminar mis tableros.

## Tareas

* Como usuario, puedo crear tareas.
  * Puede crear tareas solo en la primer columna.
  * Puede crear tareas dentro del limite del limite de tareas por columna.
  * No puede crear tareas vacías, deben tener una descripción.
  * La longitud de una tarea no debe exceder los 200 caracteres.
  * La tarea se posiciona según la prioridad de su etiqueta, si no contiene una etiqueta se agrega al final. 

* Como usuario, puedo eliminar las tareas que quiera.

* Como usuario, puedo agregar una nota o comentarios (Un texto corto) a cada tarea ya creada.
  * La nota tiene no debe exceder los 5000 caracteres.

* Como usuario, puedo mover las tareas entre columnas.
  * Puede mover tareas solo si la columna tiene espacio. Las columnas tienen un limite de 10 tareas.

* Como usuario, puedo ponerle una fecha límite a una tarea al momento de crearla.
  * Es opcional y solo se puede setear al crear la tarea.
  * Es una fecha sin hora y no puede ser anterior a hoy.
  * La tarjeta avisa la proximidad del vencimiento según la prioridad de sus etiquetas: sin etiquetas avisa a 1 día, con alguna etiqueta a 2 días, con la etiqueta de máxima prioridad a 3 días.
  * El aviso se suprime en la última columna y en el archivo.
  * Al abrir la tarjeta se muestra la fecha y cuánto falta (o hace cuánto venció).

### Recordatorios

* Como usuario, puedo crear un recordatorio.
  * El recordatorio se mostrará al usuario cada vez que una tarea entre en la columna indicada.
  * El recordatorio debe tener una descripción.
  * El recordatorio debe tener una columna especificada por el usuario.

* Como usuario, puedo ver el recordatorio creado.

* Como usuario, puedo eliminar un recordatorio.

### Etiquetas

* Al iniciar sesión como usuario, el grupo de etiquetas habilitado se guarda en mi cuenta.

* Como usuario, puedo habilitar y deshabilitar el uso de un grupo de etiquetas.

* Como usuario, puedo agregar etiquetas a una tarea al momento de crearla.
  * No hay limite en la cantidad de etiquetas que puedo agregar a una tarea.
  * Cada etiqueta consta de un número de prioridad (1 es el mas alto), esta prioridad permite ordenar las tareas.
  * Solo puedo usar las etiquetas dentro del grupo que esta habilitado.

## Notas

* Como usuario, puedo escribir notas relacionadas con el tablero.
  * Es una sola nota por tablero.
  * La nota no puede sobrepasar los 10000 caracteres.

* Como usuario, puedo archivar las notas.
  * El archivo tiene capacidad para 30 notas.
  * Al llegar al tope, archivar pide confirmación para descartar la nota más antigua (FIFO). Si se rechaza, la nota no se archiva.
* Como usuario, puedo ver las notas archivadas.
  * Una lista con todas las notas que se han archivado y su respectiva fecha de archivado.

## Columnas

* Como usuario, puedo crear nuevas columnas.
  * No pude haber mas de 6 columnas
* Como usuario, puede cambiar el nombre de las columnas.
  * Las columnas deben tener un nombre.
  * El nombre de las columnas no puede sobrepasar los 30 caracteres.
* Como usuario, puedo eliminar columnas.
  * No puede haber menos de dos columnas.

## Archivo

* Como usuario, puedo archivar tareas.
  * Puede archivar todas las tareas de la ultima columna.
  * Puede archivar tareas individuales en la última columna.
  * No se puede archivar una lista de tareas vacía.
  * El archivo es diario. Si se archivan varias tareas el mismo dia, estas deberían archivarse juntas.
  * El archivo diario tiene capacidad para 30 tareas.
  * El archivo tiene capacidad para 60 días.

* Como usuario, puedo ver las tareas archivadas.
  * Puede ver las tareas archivadas.
  * El archivo es una lista con las tareas archivadas y la fecha en que se archivaron.

* Como usuario, puedo ver un registro de los cambios de estado de una tarea.
   * Puedo ver fecha y hora en que cada tarea se creo y cambio de columna.
   * Puedo ver fecha y hora en que cada tarea se archivo o regreso al tablero.

* Como usuario, puedo exportar el archivo.
  * Se puede exportar el formato entre PDF y JSON.

## Registro de uso

* Como usuario, puedo visualizar el tiempo de uso actual del tablero.
  * Formato `HH:MM:SS`.
  * El registro de tiempo se pausa al cerrar la pestaña.
  * El registro de tiempo se actualiza cada 1 minuto.

* El tiempo de uso es diario y se divide en sesiones.
  * Para que se cree una nueva sesión deben haber pasado 25 minutos desde la última sesión.
  * Cada sesión tiene una hora de inicio y una hora de finalización.
  * Cada sesión tiene una duración expresada en `HH:MM:SS`.

