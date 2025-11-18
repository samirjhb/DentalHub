# Multi-stage build: backend (NestJS) + frontend (Angular)

# ===== Backend build stage =====
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

# Instalar dependencias del backend
COPY DentalHUB_Backend/package*.json ./
RUN npm install

# Copiar código del backend y construir
COPY DentalHUB_Backend/. ./
RUN npm run build

# ===== Frontend build stage =====
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

ARG API_URL=https://dentalhub-backend.onrender.com/v1

# Instalar dependencias del frontend
COPY FRONT_HADEBOT/package*.json ./
COPY FRONT_HADEBOT/.npmrc ./
RUN npm install

# Copiar código del frontend y construir para producción
COPY FRONT_HADEBOT/. ./

# Generar environment.prod.ts con la API_URL proporcionada
RUN echo "export const environment = { production: true, apiUrl: '${API_URL}' };" > src/environments/environment.prod.ts

RUN npm run build -- --configuration production

# ===== Runtime stage (solo Node) =====
FROM node:20-alpine AS production

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Dependencias en modo producción para el backend
COPY DentalHUB_Backend/package*.json ./
RUN npm install --only=production

# Copiar dist del backend
COPY --from=backend-build /app/backend/dist ./dist

# Copiar build del frontend a carpeta pública
COPY --from=frontend-build /app/frontend/dist/Modernize ./public

EXPOSE 3001

CMD ["node", "dist/main.js"]
