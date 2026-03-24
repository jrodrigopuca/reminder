# Reminder

Aplicacion web para crear eventos de calendario (.ics) con soporte para recurrencia. Permite generar y descargar archivos ICS compatibles con Google Calendar, Apple Calendar, Outlook y otros clientes de calendario.

## Funcionalidades

- Crear eventos con titulo, descripcion, ubicacion, fecha/hora y duracion
- Soporte para eventos recurrentes con las siguientes frecuencias:
  - **Diario** - se repite todos los dias
  - **Semanal** - se repite cada semana
  - **Parte de la semana** - se repite en dias especificos (L, M, X, J, V, S, D)
  - **Mensual** - se repite cada mes
- Configurar cantidad de repeticiones
- Descarga automatica del archivo `.ics` listo para importar en cualquier calendario

## Tech Stack

| Tecnologia | Version | Uso |
|---|---|---|
| React | 19.2 | UI library |
| Vite | 8.0 | Bundler y dev server |
| CSS Modules | - | Estilos con scope local |
| ics | 3.6.3 | Generacion de archivos ICS |
| file-saver | 2.0.5 | Descarga de archivos desde el navegador |
| Vitest + Testing Library | 4.1 / 16.3 | Testing unitario |

## Requisitos previos

- Node.js >= 18
- npm

## Instalacion

```bash
# Clonar el repositorio
git clone <repo-url>
cd reminder

# Instalar dependencias
npm install
```

## Scripts disponibles

```bash
# Iniciar servidor de desarrollo (http://localhost:3000)
npm run dev

# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar build de produccion
npm run build

# Preview del build de produccion
npm run preview
```

## Estructura del proyecto

```
reminder/
├── index.html              # HTML entry point (Vite)
├── vite.config.js          # Configuracion de Vite + Vitest
├── public/
│   ├── manifest.json       # PWA manifest
│   └── ...                 # Iconos y assets estaticos
├── src/
│   ├── App.jsx             # Componente principal (formulario + logica de negocio)
│   ├── App.module.css      # Estilos del formulario (CSS Module)
│   ├── App.test.jsx        # Tests unitarios
│   ├── index.jsx           # Entry point (React root)
│   ├── index.css           # Estilos globales
│   └── setupTests.js       # Configuracion de Vitest
├── package.json
└── README.md
```

## Como funciona

1. El usuario completa el formulario con los datos del evento
2. Si marca "Evento recurrente", aparecen opciones adicionales de frecuencia
3. Al hacer clic en "Crear evento":
   - Se transforma la fecha al formato requerido por la libreria `ics`
   - Se genera la regla de recurrencia (RRULE) si corresponde
   - Se crea el archivo `.ics` y se descarga automaticamente

## Licencia

MIT
