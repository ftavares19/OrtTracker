# Degree Tracker

Degree Tracker es una aplicacion web para seguir el progreso de una carrera universitaria.

En terminos generales, la solucion permite:

- Ver la carrera y sus materias.
- Consultar requisitos por materia (correlativas y condiciones).
- Actualizar el estado de cada materia.
- Saber que materias estan habilitadas para cursar.

La solucion esta compuesta por:

- Frontend en React + TypeScript + Vite (modo principal para GitHub Pages).
- API backend en ASP.NET Core (.NET 10) con base de datos SQLite (opcional para entorno backend).

## Requisitos previos

Antes de ejecutar el proyecto, necesitas tener instalado:

- Node.js 20 o superior
- npm (incluido con Node.js)

## Tutorial de uso local (paso a paso)

## 1) Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd IngTracker2.0
```

## 2) Ejecutar el frontend

En otra terminal, desde la raiz del repo, parate en la carpeta frontend:

```bash
cd frontend
```

Instala dependencias:

```bash
npm install
```

Inicia el entorno de desarrollo:

```bash
npm run dev
```

Vite mostrara la URL para abrir en el navegador (generalmente http://localhost:5173).

## 3) Probar la aplicacion

- Abre en el navegador la URL del frontend que aparece en la consola de Vite.
- Desde ahi ya podes consultar materias y actualizar estados.

## Persistencia en navegador

- La app guarda el estado de materias en localStorage del navegador.
- Si una persona cierra y vuelve a abrir el link en el mismo navegador/dispositivo, mantiene sus materias guardadas.
- Si borra datos del navegador o entra desde otro dispositivo, ese progreso no se comparte automaticamente.

## GitHub Pages

- Esta branch esta preparada para publicar el frontend en GitHub Pages sin depender de la API.
- La configuracion de Vite usa base /DegreeTracker/ para el repo actual.
- Incluye workflow en .github/workflows/deploy-pages.yml para build y deploy automatico.

Pasos para activarlo en GitHub:

1. Ir a Settings > Pages.
2. En Build and deployment, elegir Source: GitHub Actions.
3. Hacer push a main para publicar en Pages.
4. Esperar que termine el workflow Deploy Frontend to GitHub Pages.
5. La app quedara publicada en https://ftavares19.github.io/DegreeTracker/.

Nota: en la branch feat/frontend-offline-github-pages el workflow corre el build para validacion, pero el deploy queda omitido por proteccion del entorno github-pages.

## Notas utiles

- El plan de estudios que usa el frontend se carga desde frontend/src/data/curriculum.json.
- La API puede mantenerse para desarrollo backend, pero no es requerida para usar la app publicada en Pages.
