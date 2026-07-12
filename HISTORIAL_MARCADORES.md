# Historial de marcadores y cierre de año

Este documento explica las tres funcionalidades principales relacionadas con el seguimiento histórico de los marcadores del mapa: el **historial automático**, la **edición con guardado automático** y el **cierre de año**.

---

## 1. Historial de marcadores

### ¿Qué es?

El historial es un registro que guarda el estado de cada marcador a lo largo del tiempo. Cada marcador del mapa tiene su propio historial, donde se acumulan las versiones anteriores año a año.

### ¿Para qué sirve?

Sirve para que puedas consultar cómo estaba un marcador en cualquier año pasado: qué programas tenía asignados, qué notas había cargadas, y cualquier otro dato registrado en esa época. Esto es útil para comparar, auditar o simplemente recordar lo que se hizo en años anteriores.

### ¿Cómo se accede?

Desde la vista de cualquier marcador, encontrás una sección de **historial**. Ahí se listan todos los años registrados para ese marcador. Al seleccionar un año, podés ver el estado completo tal como estaba en ese momento.

### ¿Quién lo actualiza?

El historial se actualiza **automáticamente**. No necesitás hacer nada para que los datos se guarden: el sistema lo hace solo cuando corresponde.

### ¿Cómo usarlo?

1. Abrí cualquier marcador del mapa haciendo clic sobre él.
2. Dentro de la vista del marcador, buscá la sección o pestaña **Historial**.
3. Se mostrará una lista de los años registrados para ese marcador.
4. Seleccioná el año que querés consultar para ver el estado completo de ese período.

---

## 2. Edición con guardado automático del año anterior

### ¿Qué es?

Es el mecanismo que protege los datos históricos cada vez que editás un marcador. Antes de aplicar cualquier cambio, el sistema verifica si ya se guardó el historial del año anterior y, si no se hizo, lo guarda automáticamente.

### ¿Para qué sirve?

Evita que al editar un marcador se pierdan los datos del año pasado. Garantiza que siempre haya una copia del estado anterior disponible en el historial, sin que el usuario tenga que preocuparse por hacerlo manualmente.

### ¿Cómo funciona en la práctica?

Cuando editás un marcador **por primera vez en el año**, el sistema realiza los siguientes pasos antes de guardar tus cambios:

1. Detecta que es la primera edición del año para ese marcador.
2. Guarda automáticamente una copia completa del estado actual como registro del año anterior.
3. Aplica los cambios nuevos sobre el marcador.

> **Ejemplo:** Si en marzo de 2026 editás un marcador por primera vez ese año, el sistema guarda automáticamente cómo estaba ese marcador durante el 2025 antes de aplicar tus cambios. Así, el historial de 2025 queda preservado.

### ¿Cuándo ocurre?

Solo en la **primera edición del año** para cada marcador. Las ediciones siguientes dentro del mismo año no vuelven a guardar el historial, ya que el snapshot de ese año ya fue creado.

### ¿Cómo usarlo?

Esta funcionalidad es completamente transparente: **no requiere ninguna acción de tu parte**. Solo editá el marcador como lo hacés normalmente:

1. Abrí el marcador que querés modificar.
2. Realizá los cambios que necesites (programas, notas, etc.).
3. Guardá los cambios.

El sistema se encarga solo de preservar el historial antes de aplicar tus modificaciones. No vas a ver ningún mensaje ni aviso: simplemente funciona en segundo plano.

---

## 3. Cierre de año

### ¿Qué es?

El cierre de año es una acción administrativa que se realiza **una sola vez al finalizar cada año**. Solo puede ejecutarla el administrador del sistema.

### ¿Para qué sirve?

Tiene dos propósitos principales:

- **Preservar**: congela el estado actual de todos los marcadores como registro definitivo del año que termina. Es una "foto final" de cómo quedaron todos los marcadores al cierre del período.
- **Reiniciar**: limpia los marcadores para que el equipo pueda empezar a cargar datos del año nuevo sin información desactualizada del año anterior.

### ¿Qué pasa con los datos al hacer el cierre?

**No se pierde nada.** Todos los datos del año cerrado quedan guardados en el historial de cada marcador y pueden consultarse en cualquier momento. Lo único que se elimina es el estado "activo" del marcador, es decir, lo que se ve y se edita en el día a día.

### ¿Qué queda en blanco después del cierre?

Al finalizar el cierre de año, cada marcador queda sin programas asignados y sin notas, listo para que el equipo comience a cargar la información correspondiente al nuevo año.

### ¿Cómo usarlo? *(solo administradores)*

1. Ingresá al sistema con tu cuenta de administrador.
2. Dirigite al panel de administración o configuración del sistema.
3. Buscá la opción **Cierre de año**.
4. Confirmá la acción cuando el sistema te lo solicite. Antes de hacerlo, asegurate de que todos los datos del año actual estén cargados y correctos.
5. El sistema procesará todos los marcadores y los dejará listos para el nuevo año.

> **Recomendación:** realizá el cierre de año una vez que el equipo haya terminado de cargar todos los datos del período. Una vez ejecutado, los marcadores quedan en blanco y el equipo puede comenzar a trabajar en el nuevo año.

---

## Resumen rápido

| Funcionalidad | ¿Qué hace? | ¿Se pierden datos? |
|---|---|---|
| Historial | Almacena el estado del marcador en cada año registrado | No |
| Edición con guardado automático | Guarda el año anterior automáticamente antes de aplicar cambios | No |
| Cierre de año | Congela todos los marcadores y los deja en blanco para el año nuevo | No (quedan en el historial) |

---

## ⚠️ Importante: limitación actual

Por el momento, la **eliminación automática de programas y observaciones durante el cierre de año aún no está implementada**. Esto significa que, al hacer el cierre de año, los usuarios deben eliminar manualmente los programas asignados y las observaciones de cada marcador antes de comenzar a cargar datos nuevos.

Esta limitación será resuelta en una próxima actualización del sistema.
