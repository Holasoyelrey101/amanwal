# Amanwal Frontend

Frontend en React 19 para la plataforma de alojamiento de cabañas.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/      # Componentes reutilizables
├── pages/          # Páginas de la aplicación
├── api/            # Funciones para llamadas API
├── context/        # Contextos de React
├── App.tsx         # Componente principal
└── main.tsx        # Punto de entrada
```

## Características

- ✅ Autenticación (Registro e Inicio de Sesión)
- ✅ Navbar con menú de navegación
- ✅ Listado de cabañas
- ✅ Detalles de cabañas con reseñas
- ✅ Sistema de rutas protegidas
- ✅ Persistencia de sesión con localStorage
- ✅ Diseño responsivo con Bootstrap 5

## API Base

Por defecto, la aplicación se conecta a `http://localhost:3000/api`

Para cambiar la URL, edita la variable en `src/api/client.ts`
