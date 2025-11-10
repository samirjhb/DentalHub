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

