# Guía de Despliegue en Producción - DentalHub

Esta guía explica cómo desplegar DentalHub en un servidor (VPS) usando Docker Compose.

## 🧱 Arquitectura

```
Internet ──► Caddy (80/443, HTTPS automático)
               ├── /v1/*, /documentation*  ──► backend  (NestJS, :3001)
               └── resto                   ──► frontend (Angular + nginx, :80)
                                               backend ──► mongo (:27017)
             mongo-backup ──► mongodump diario en ./backups
```

- **Solo Caddy publica puertos** (80 y 443). Mongo, backend y frontend viven en la
  red interna de Docker y no son accesibles desde internet.
- Frontend y API comparten dominio (`https://tudominio.com` y `https://tudominio.com/v1`),
  así que no hay problemas de CORS.
- Las imágenes se **construyen en el propio servidor**, por lo que funciona igual en
  amd64 y en ARM (p. ej. Oracle Cloud Ampere A1).

## 📋 Requisitos Previos

- Docker 20.10+ con el plugin Docker Compose v2
- Acceso SSH al servidor
- Un dominio con un registro DNS **A** apuntando a la IP pública del servidor
  (Caddy lo necesita para emitir el certificado HTTPS)
- Puertos **80 y 443** abiertos en el firewall del proveedor y del sistema.
  **No abras el 27017.**

## 🔐 Variables de entorno

```bash
cp .env.production.example .env.production
```

Completa `.env.production` con tus valores reales (dominio, contraseña de Mongo,
`JWT_SECRET`, Cloudinary, Resend). El backend recibe todo el archivo vía `env_file`.

- `MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`, `JWT_SECRET` y `DOMAIN` son
  **obligatorias**: el compose se niega a arrancar si faltan (ya no hay
  contraseñas por defecto).
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` crean el primer usuario SUPER_ADMIN al arrancar,
  **solo si la base no tiene ninguno**. Con una base nueva son imprescindibles: sin
  ellas el sistema arranca pero nadie puede iniciar sesión (el backend lo avisa en
  sus logs). Una vez creado, cambiarlas no tiene efecto.
- Usa contraseñas fuertes (mín. 16 caracteres). Evita `@ : / ? #` en la contraseña
  de Mongo porque va dentro de la URI de conexión.
- Sin `RESEND_API_KEY` el link de recuperación de contraseña solo queda en los logs
  del backend; en producción es obligatoria.

**⚠️ NUNCA** subas `.env.production` al repositorio (está en `.gitignore`).

## 🚀 Despliegue

```bash
git clone https://github.com/samirjhb/DentalHub.git && cd DentalHub
cp .env.production.example .env.production   # y edítalo
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml ps
```

En el primer arranque Caddy solicita el certificado a Let's Encrypt; revisa
`docker compose -f docker-compose.prod.yml logs caddy` si el HTTPS no responde.

## 📊 Verificación Post-Despliegue

```bash
# Estado y salud de los contenedores
docker compose -f docker-compose.prod.yml ps

# Frontend y API a través de Caddy
curl -I https://tudominio.com
curl -I https://tudominio.com/documentation

# Mongo NO debe responder desde fuera del servidor (debe fallar / timeout):
#   nc -vz <IP_PUBLICA> 27017
```

## 🔄 Actualización de la Aplicación

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker image prune -f
```

## 💾 Respaldos de MongoDB

El servicio `mongo-backup` ejecuta `mongodump` al arrancar y luego cada
`BACKUP_INTERVAL_HOURS` horas (24 por defecto), guardando archivos
`backups/dentalhub-AAAAMMDD-HHMMSS.archive.gz` y borrando los de más de
`BACKUP_RETENTION_DAYS` días (14 por defecto).

```bash
# Ver el resultado de los respaldos
docker compose -f docker-compose.prod.yml logs mongo-backup
ls -lh backups/
```

**Copia los respaldos fuera del servidor.** Si el servidor se pierde, los respaldos
locales se pierden con él. Ejemplo con `rclone` (Object Storage, S3, Google Drive…)
en el crontab del host (`crontab -e`):

```cron
30 3 * * * rclone copy /home/ubuntu/DentalHub/backups remoto:dentalhub-backups
```

### Restaurar un respaldo

```bash
docker compose -f docker-compose.prod.yml exec -T mongo-backup \
  bash -c 'mongorestore --uri="$MONGO_URI" --gzip --drop --archive' \
  < backups/dentalhub-AAAAMMDD-HHMMSS.archive.gz
```

`--drop` reemplaza las colecciones existentes por las del respaldo.

## 🔒 Seguridad Adicional

### Firewall

```bash
# Ubuntu/Debian con ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

En Oracle Cloud además hay que abrir 80/443 en la Security List de la VCN y en las
reglas `iptables` que trae su imagen de Ubuntu.

## 📈 Monitoreo

```bash
docker stats
docker compose -f docker-compose.prod.yml logs -f
```

## 🐛 Troubleshooting

### Los contenedores se reinician constantemente

```bash
docker compose -f docker-compose.prod.yml logs --tail=100
docker stats
```

### MongoDB no se conecta

```bash
docker compose -f docker-compose.prod.yml ps mongo
docker compose -f docker-compose.prod.yml logs mongo
docker exec dental-backend-prod node -e "console.log(process.env.MONGO_CONNECTION_TEST)"
```

### HTTPS no funciona

1. Verifica que el registro DNS A apunte a la IP del servidor (`dig +short tudominio.com`)
2. Verifica que los puertos 80 y 443 estén abiertos
3. Revisa `docker compose -f docker-compose.prod.yml logs caddy`

### Frontend no muestra datos

1. Verifica `DOMAIN` en `.env.production` (el frontend se compila con `https://$DOMAIN/v1`)
2. Si cambiaste `DOMAIN`, reconstruye: `up -d --build frontend`
3. Revisa la consola del navegador

## 🔄 Rollback

```bash
git checkout <commit-hash>
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## 📝 Checklist Pre-Producción

- [ ] `.env.production` completo, con contraseñas fuertes
- [ ] `ADMIN_EMAIL`/`ADMIN_PASSWORD` definidos y primer ingreso como SUPER_ADMIN probado
- [ ] `RESEND_API_KEY` configurada y `FRONTEND_URL` apuntando al dominio real
- [ ] DNS del dominio apuntando al servidor; HTTPS respondiendo
- [ ] Puerto 27017 cerrado desde internet
- [ ] Firewall solo con 22, 80 y 443
- [ ] `mongo-backup` generando archivos en `backups/`
- [ ] Respaldos copiados fuera del servidor (rclone/cron) y restauración probada
