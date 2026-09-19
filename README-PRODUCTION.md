# Guía de Despliegue en Producción - DentalHub

Esta guía explica cómo desplegar la aplicación DentalHub en producción usando Docker Compose.

## 📋 Requisitos Previos

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)
- Acceso SSH al servidor de producción
- Dominio configurado (opcional pero recomendado)

## 🔐 Configuración de Seguridad

### 1. Crear archivo de variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.production.example .env.production
```

Edita `.env.production` con tus valores reales:

```env
# MongoDB - Usa contraseñas seguras
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=tu_password_super_seguro_minimo_16_caracteres

# Backend
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro

# URLs - Cambia por tu dominio real
API_URL=https://api.tudominio.com/v1

# Recuperación de contraseña (email vía Resend — https://resend.com/api-keys)
RESEND_API_KEY=tu_api_key_de_resend
RESEND_FROM=DentalHub <notificaciones@tudominio.com>
FRONTEND_URL=https://tudominio.com
PASSWORD_RESET_EXPIRES_IN_MINUTES=30
```

**Nota**: sin `RESEND_API_KEY` configurada, el link de recuperación de
contraseña no se envía por correo — solo queda registrado en los logs del
backend. En producción es obligatorio configurarla para que el flujo de
"olvidé mi contraseña" funcione de verdad.

**⚠️ IMPORTANTE**: 
- **NUNCA** subas el archivo `.env.production` al repositorio
- Usa contraseñas fuertes (mínimo 16 caracteres)
- Usa un JWT_SECRET aleatorio y largo

### 2. Configurar CORS en el Backend

Si usas un dominio diferente para el frontend, actualiza el CORS en `DentalHUB_Backend/src/main.ts`:

```typescript
app.enableCors({
  origin: ['https://tudominio.com', 'https://www.tudominio.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
});
```

## 🚀 Despliegue

### Opción 1: Despliegue Directo

```bash
# 1. Construir y levantar los servicios
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 2. Verificar que todos los servicios estén corriendo
docker-compose -f docker-compose.prod.yml ps

# 3. Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Opción 2: Despliegue por Etapas

```bash
# 1. Construir las imágenes
docker-compose -f docker-compose.prod.yml --env-file .env.production build

# 2. Levantar los servicios
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 3. Verificar estado
docker-compose -f docker-compose.prod.yml ps
```

## 📊 Verificación Post-Despliegue

### Verificar que los servicios estén corriendo:

```bash
# Ver estado de los contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Probar los endpoints:

```bash
# Backend Health Check
curl http://localhost:3001/documentation

# Frontend
curl http://localhost:4200
```

## 🔄 Actualización de la Aplicación

Para actualizar la aplicación después de hacer cambios:

```bash
# 1. Detener los servicios
docker-compose -f docker-compose.prod.yml down

# 2. Reconstruir las imágenes
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

# 3. Levantar los servicios
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. Verificar
docker-compose -f docker-compose.prod.yml ps
```

## 🛡️ Configuración con Nginx Reverse Proxy (Recomendado)

Para producción, es recomendable usar Nginx como reverse proxy delante de los contenedores:

```nginx
# /etc/nginx/sites-available/dentalhub
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:4200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Seguridad Adicional

### 1. Firewall

Configura el firewall para permitir solo los puertos necesarios:

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

### 2. MongoDB sin exposición pública

En producción, MongoDB no debería estar expuesto públicamente. Modifica `docker-compose.prod.yml`:

```yaml
mongo:
  # ... otras configuraciones
  ports:
    # Comentar o eliminar esta línea para no exponer MongoDB
    # - "${MONGO_PORT:-27017}:27017"
```

### 3. Backups de MongoDB

Implementa backups regulares:

```bash
# Script de backup
#!/bin/bash
docker exec dental-mongo-prod mongodump --out=/data/backup/$(date +%Y%m%d_%H%M%S)
```

## 📈 Monitoreo

### Ver uso de recursos:

```bash
docker stats
```

### Ver logs en tiempo real:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## 🐛 Troubleshooting

### Problema: Los contenedores se reinician constantemente

```bash
# Ver logs de errores
docker-compose -f docker-compose.prod.yml logs --tail=100

# Verificar recursos del sistema
docker stats
```

### Problema: MongoDB no se conecta

```bash
# Verificar que MongoDB esté corriendo
docker-compose -f docker-compose.prod.yml ps mongo

# Ver logs de MongoDB
docker-compose -f docker-compose.prod.yml logs mongo

# Verificar la conexión desde el backend
docker exec dental-backend-prod node -e "console.log(process.env.MONGO_CONNECTION_TEST)"
```

### Problema: Frontend no muestra datos

1. Verifica que la URL de la API en `.env.production` sea correcta
2. Verifica CORS en el backend
3. Revisa la consola del navegador para errores

## 🔄 Rollback

Si necesitas revertir a una versión anterior:

```bash
# 1. Detener servicios actuales
docker-compose -f docker-compose.prod.yml down

# 2. Si usas Git, volver a un commit anterior
git checkout <commit-hash>

# 3. Reconstruir y levantar
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## 📝 Checklist Pre-Producción

- [ ] Variables de entorno configuradas en `.env.production`
- [ ] Contraseñas seguras configuradas
- [ ] `RESEND_API_KEY` configurada y `FRONTEND_URL` apuntando al dominio real (recuperación de contraseña)
- [ ] CORS configurado con los dominios correctos
- [ ] MongoDB no expuesto públicamente
- [ ] SSL/HTTPS configurado (si usas dominio)
- [ ] Firewall configurado
- [ ] Backups de MongoDB configurados
- [ ] Monitoreo configurado
- [ ] Logs configurados y rotando correctamente

## 📞 Soporte

Si encuentras problemas, revisa los logs:

```bash
docker-compose -f docker-compose.prod.yml logs --tail=200
```


