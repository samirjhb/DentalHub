# Docker Compose - DentalHub

Este archivo docker-compose permite levantar de forma integrada el frontend (Angular), backend (NestJS) y la base de datos MongoDB.

## Requisitos Previos

- Docker instalado
- Docker Compose instalado

## Estructura del Proyecto

```
dental/
├── docker-compose.yml          # Archivo principal de Docker Compose
├── DentalHUB_Backend/          # Backend NestJS
│   └── Dockerfile
└── FRONT_HADEBOT/              # Frontend Angular
    └── Dockerfile
```

## Servicios Incluidos

1. **MongoDB** (Puerto 27017)
   - Base de datos principal
   - Volumen persistente para los datos

2. **Mongo Express** (Puerto 8081)
   - Interfaz web para gestionar MongoDB
   - Usuario: `admin` / Contraseña: `admin`

3. **Backend NestJS** (Puerto 3001)
   - API REST en NestJS
   - Documentación Swagger: `http://localhost:3001/documentation`

4. **Frontend Angular** (Puerto 4200)
   - Aplicación Angular servida con Nginx
   - Accesible en `http://localhost:4200`

## Instalación y Uso

### 1. Levantar todos los servicios

```bash
docker-compose up -d
```

### 2. Ver los logs de los servicios

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### 3. Detener los servicios

```bash
docker-compose down
```

### 4. Detener y eliminar volúmenes (elimina datos de MongoDB)

```bash
docker-compose down -v
```

### 5. Reconstruir las imágenes

```bash
docker-compose up -d --build
```

## Acceso a los Servicios

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3001
- **Swagger Documentation**: http://localhost:3001/documentation
- **MongoDB Express**: http://localhost:8081
- **MongoDB**: localhost:27017

## Configuración de Variables de Entorno

Las variables de entorno se pueden configurar directamente en el archivo `docker-compose.yml` o crear un archivo `.env` en la raíz del proyecto.

### Variables principales:

- `PORT`: Puerto del backend (por defecto: 3001)
- `MONGO_CONNECTION_TEST`: Cadena de conexión a MongoDB (por defecto: mongodb://mongo:27017/dentalhub)
- `NODE_ENV`: Entorno de ejecución (production/development)
- `JWT_SECRET`: Secreto para firmar los JWT (mínimo 32 caracteres)
- `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN_DAYS`: expiración del access token y del refresh token
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: credenciales del primer `SUPER_ADMIN`, creado automáticamente al arrancar si no existe ninguno
- `RESEND_API_KEY`: API key de [Resend](https://resend.com/api-keys) para enviar el email de recuperación de contraseña. Sin esto, el link se registra en el log del backend en vez de enviarse (útil para desarrollo local)
- `RESEND_FROM`: remitente del email de recuperación (por defecto `DentalHub <onboarding@resend.dev>`)
- `FRONTEND_URL`: URL pública del frontend, usada para armar el link de "recuperar contraseña" (por defecto `http://localhost:4200`)
- `PASSWORD_RESET_EXPIRES_IN_MINUTES`: minutos de validez del link de recuperación (por defecto 30)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: credenciales de [Cloudinary](https://cloudinary.com/) (cuenta gratis) para subir los adjuntos de la ficha clínica (radiografías, fotos, PDFs de laboratorio). Sin esto configurado, subir un adjunto responde error 500
- `AI_PROVIDER`: proveedor del chat con IA — `gemini` (por defecto, tiene capa gratuita), `anthropic` o `ollama`
- `GEMINI_API_KEY`: API key de [Google AI Studio](https://aistudio.google.com/apikey) (gratis, sin tarjeta) — requerida si `AI_PROVIDER=gemini`
- `GEMINI_MODEL`: modelo de Gemini a usar (por defecto `gemini-flash-lite-latest` — cuota gratuita mucho más alta que los modelos flagship, que en el tier free están limitados a ~20 solicitudes/día)
- `ANTHROPIC_API_KEY`: API key de [Anthropic](https://console.anthropic.com/settings/keys) — requerida si `AI_PROVIDER=anthropic` (de pago, sin créditos gratis)
- `ANTHROPIC_MODEL`: modelo de Claude a usar (por defecto `claude-sonnet-5`)
- Sin la API key del proveedor activo configurada, el chat responde con error 503

## Desarrollo

Para desarrollo con hot-reload, es recomendable ejecutar los servicios individualmente fuera de Docker, pero utilizando MongoDB desde Docker:

```bash
# Levantar solo MongoDB
docker-compose up -d mongo

# Ejecutar backend localmente
cd DentalHUB_Backend
npm install
npm run start:dev

# Ejecutar frontend localmente
cd FRONT_HADEBOT
npm install
npm start
```

## Tests y CI

Cada push y pull request contra `main` corre automáticamente vía GitHub Actions
(`.github/workflows/tests.yml`): tests unitarios del backend (Jest) y del
frontend (Karma + ChromeHeadless). Para correrlos en local:

```bash
# Backend
cd DentalHUB_Backend
npm test

# Frontend
cd FRONT_HADEBOT
npx ng test --no-watch --browsers=ChromeHeadless
```

## Troubleshooting

### El backend no se conecta a MongoDB

1. Verifica que MongoDB esté corriendo:
   ```bash
   docker-compose ps
   ```

2. Verifica los logs:
   ```bash
   docker-compose logs mongo
   docker-compose logs backend
   ```

3. Verifica la variable de entorno `MONGO_CONNECTION_TEST` en el docker-compose.yml

### El frontend no se conecta al backend

1. Verifica que el backend esté corriendo:
   ```bash
   curl http://localhost:3001/documentation
   ```

2. Verifica la configuración de CORS en `DentalHUB_Backend/src/main.ts`

3. Verifica que la URL de la API en el frontend apunte a `http://localhost:3001/v1`

### Reconstruir desde cero

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker rmi dental-backend dental-frontend

# Reconstruir todo
docker-compose up -d --build
```

## Notas Importantes

- Los datos de MongoDB se almacenan en un volumen Docker persistente
- El frontend se construye en modo producción con Nginx
- El backend se ejecuta en modo producción
- Todos los servicios están en la misma red Docker para comunicación interna

