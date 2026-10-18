# Rutina

App personal de entrenamiento: rutina Upper/Lower + PPL de 5 días, registro de pesos y recomendaciones de progresión.

**En vivo:** https://adielin1mx-coder.github.io/rutina/

| Día | Sesión |
| --- | --- |
| Lunes | Empuje |
| Martes | Jalón |
| Miércoles | Pierna hipertrofia |
| Jueves | Torso fuerza |
| Viernes | Pierna fuerza |
| Sábado y domingo | Descanso |

## Qué hace

- **Hoy:** el botón central del dock muestra la letra del día y un anillo con lo que llevas registrado. La vista detecta el día de la semana y abre la sesión que toca, o el descanso y la próxima sesión.
- **Registrar:** en cada ejercicio anotas el peso, las reps y el RIR (opcional) por serie, en kg o lb. Los campos se precargan con el peso recomendado.
- **Progresión (doble progresión):** cuando completas todas las series en el tope del rango, la app sugiere subir entre 2.5 y 5%, redondeado al disco o la mancuerna real. Si fallas el mínimo dos sesiones seguidas, sugiere bajar.
- **Bloques:** semanas 1–2 de arranque (RIR 1–2), descarga cada 6 semanas y una recomendación de FST-7 por bloque.
- **Recomendaciones opcionales:** ejercicios extra al final de algunos días (rueda abdominal, curl inverso, laterales, talones el miércoles como alternativa, curl de muñeca y Pallof press), en su propio color. Si las registras, cuentan como hechas: Progreso muestra cuántas hiciste esta semana y las últimas 6 semanas de cada una. Se ocultan desde Ajustes.
- **Comidas:** un checklist diario de tus comidas (sin indicaciones de qué comer) con racha, promedio semanal y los últimos 7 días. Puedes renombrar, agregar o quitar comidas.
- **Bienvenida y colores:** al abrir la app aparece un saludo animado (anime.js) con la frase del día. En Ajustes › Apariencia eliges el color de los días de hipertrofia (L–X) y de fuerza (J–V) y tu nombre.
- **Sincronización:** los datos se guardan en el navegador y, opcionalmente, en una Google Sheet de tu Drive.

## Conectar Google Sheets

1. Crea una Google Sheet en tu Drive.
2. Entra a **Extensiones › Apps Script** y pega el contenido de [`apps-script/Code.gs`](apps-script/Code.gs).
3. En **Configuración del proyecto** (engrane), hasta abajo en **Propiedades de las secuencias de comandos**, pulsa **Agregar propiedad**: nombre `TOKEN`, valor una frase secreta, y **Guardar**.
4. En **Implementar › Nueva implementación › Aplicación web**, elige *Ejecutar como: Yo* y *Acceso: Cualquier persona*.
5. Copia la URL que termina en `/exec`. En la app, ve a **Ajustes**, pega la URL y el token y pulsa **Conectar**.

**Al actualizar `Code.gs`:** pega el código nuevo, guarda y ve a **Implementar › Gestionar implementaciones › (lápiz) Editar › Versión: Nueva versión › Implementar**. Sin una versión nueva, la URL `/exec` sigue ejecutando el código anterior (la app avisa en Ajustes si detecta un script desactualizado).

El script guarda las series en la hoja "Registro" y las comidas en la hoja "Comidas". La URL y el token se guardan solo en tu navegador; no están en este repositorio. Hay que conectarlos una vez en cada dispositivo.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173/rutina/
npm test         # pruebas de la lógica de progresión
npm run deploy   # build + publicar en la rama gh-pages
```

Parámetros útiles para revisar: `?dia=lunes` simula otro día, `?vista=progreso` abre una vista y `?registrar=press-banca` abre el registrador y `?bienvenida` fuerza la pantalla de bienvenida.

Stack: Vite, React, TypeScript, Tailwind v4, shadcn/ui, Motion, anime.js y componentes de Magic UI y Motion Primitives (los mismos que publica 21st.dev).

---

Rutina construida con los principios públicos de Jeff Nippard; no es copia de un programa pagado suyo. La sección FST-7 se basa en el método de Hany Rambod.
