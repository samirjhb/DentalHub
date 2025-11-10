# Etapa 1: Construcción
FROM node:18-alpine AS build

WORKDIR /app

# Argumento para la URL de la API
ARG API_URL=http://localhost:3001/v1

# Copiar archivos de dependencias y configuración npm
COPY package*.json ./
COPY .npmrc ./

# Instalar dependencias (usa .npmrc con legacy-peer-deps=true)
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Crear archivo de environment con la URL de la API
RUN echo "export const environment = { production: true, apiUrl: '${API_URL}' };" > src/environments/environment.prod.ts

# Construir la aplicación Angular para producción
RUN npm run build -- --configuration production

# Etapa 2: Servidor web
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa de build
COPY --from=build /app/dist/Modernize /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

