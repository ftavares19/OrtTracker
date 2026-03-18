# Degree Tracker

Degree Tracker es una aplicacion web para seguir el progreso de una carrera universitaria.

En terminos generales, la solucion permite:

- Ver la carrera y sus materias.
- Consultar requisitos por materia (correlativas y condiciones).
- Actualizar el estado de cada materia.
- Saber que materias estan habilitadas para cursar.

La solucion esta compuesta por:

- API backend en ASP.NET Core (.NET 10) con base de datos SQLite.
- Frontend en React + TypeScript + Vite.

## Requisitos previos

Antes de ejecutar el proyecto, necesitas tener instalado:

- .NET SDK 10.0
- Node.js 20 o superior
- npm (incluido con Node.js)

## Tutorial de uso local (paso a paso)

## 1) Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd IngTracker2.0
```

## 2) Ejecutar la API

En una terminal, parate en la carpeta de la API:

```bash
cd src/DegreeTracker.API
```

Luego ejecuta:

```bash
dotnet restore
dotnet run
```

La API queda disponible en:

- http://localhost:5055

## 3) Ejecutar el frontend

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

## 4) Probar la aplicacion

- Asegurate de tener API y frontend corriendo al mismo tiempo.
- Abre en el navegador la URL del frontend que aparece en la consola de Vite.
- Desde ahi ya podes consultar materias y actualizar estados.

## Endpoints principales de la API

- GET /api/degrees/{id}
- GET /api/degrees/{degreeId}/subjects
- GET /api/subjects/{id}
- GET /api/degrees/{degreeId}/subjects/eligible
- GET /api/degrees/{degreeId}/subjects/strategic
- PUT /api/subjects/{id}/status

## Notas utiles

- El frontend consume la API en http://localhost:5055/api.
- El plan de estudios se define en src/DegreeTracker.API/curriculum.json.
- Si cambias curriculum.json y quieres reinicializar datos, elimina la base local y vuelve a levantar la API.
