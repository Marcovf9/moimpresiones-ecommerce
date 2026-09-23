# MO Impresiones — Sitio institucional y catálogo

> Documentación técnica en español. La presentación del proyecto, en inglés, está en el
> [README principal](../README.md).

Sitio web de MO Impresiones, empresa gráfica familiar de Córdoba, Argentina, con más de
30 años de trayectoria.

## Stack

| Capa       | Tecnología                                            |
|------------|-------------------------------------------------------|
| Backend    | Java 21 · Spring Boot 3.5 · Spring Data JPA · Security |
| Base datos | PostgreSQL 16 · migraciones con Flyway                 |
| Frontend   | React 19 · TypeScript · Vite · Tailwind CSS 4          |

## Estructura

```
backend/    API REST de catálogo, cotizaciones y panel de administración
frontend/   Sitio público en React + panel admin
docker-compose.yml   PostgreSQL para desarrollo local
```

## Puesta en marcha

1. Levantar la base de datos:

   ```bash
   docker compose up -d
   ```

2. Backend (arranca en `http://localhost:8080`, aplica las migraciones Flyway solo):

   ```bash
   cd backend && ./mvnw spring-boot:run
   ```

3. Frontend (arranca en `http://localhost:5173`, con proxy a `/api`):

   ```bash
   cd frontend && npm install && npm run dev
   ```

## Variables de entorno

| Variable         | Default                                        | Descripción                          |
|------------------|------------------------------------------------|--------------------------------------|
| `DB_URL`         | `jdbc:postgresql://localhost:5432/moimpresiones` | Conexión a PostgreSQL              |
| `DB_USER`        | `moimpresiones`                                | Usuario de base de datos             |
| `DB_PASSWORD`    | `moimpresiones`                                | Contraseña de base de datos          |
| `CORS_ORIGINS`   | `http://localhost:5173`                        | Orígenes permitidos, separados por coma |
| `MEDIA_PATH`     | `./uploads`                                    | Carpeta de imágenes subidas          |
| `JWT_SECRET`     | valor de desarrollo                            | **Obligatorio en producción** (mín. 32 caracteres) |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | vacío | SMTP para avisar cotizaciones nuevas. Sin `MAIL_HOST`, apagado |
| `NOTIFICACIONES_DESTINO` | `contacto@moimpresiones.com` | Quién recibe el aviso |
| `MEDIA_PROVIDER` | `local`                                        | `local` (disco) o `cloudinary` |
| `CLOUDINARY_URL` | vacío                                          | `cloudinary://<key>:<secret>@wadqifnu`. Obligatorio si `MEDIA_PROVIDER=cloudinary` |
| `ADMIN_USERNAME` | `admin`                                        | Usuario inicial del panel            |
| `ADMIN_PASSWORD` | se genera al azar                              | Contraseña inicial del panel         |
| `WHATSAPP_NUMBER`| vacío                                          | Número internacional sin signos (ej. `5493511234567`) |
| `INSTAGRAM_URL`  | vacío                                          | Perfil de Instagram                  |
| `CONTACT_EMAIL`  | vacío                                          | Mail de contacto                     |
| `SITE_URL`       | vacío                                          | Dominio del sitio, sin barra final. Sin esto `/sitemap.xml` devuelve 404 |

## Panel de administración

La primera vez que arranca el backend, si la tabla `admin_users` está vacía se crea
un usuario inicial. Si no definiste `ADMIN_PASSWORD`, la contraseña se genera al azar
y se imprime **una sola vez** en el log de arranque.

Todo lo que escribe vive bajo `/api/admin/**` y exige el token que devuelve
`POST /api/auth/login`, enviado como `Authorization: Bearer <token>`.

## Fotos: disco local o Cloudinary

El backend guarda las imágenes del panel donde diga `app.media-provider`:

- **`local`** (por defecto) — disco del servidor. Sirve para desarrollar.
  **No usar en producción**: en Railway, Render o Fly el disco es efímero y
  cada despliegue borraría todas las fotos que subió el cliente.
- **`cloudinary`** — CDN, con las imágenes optimizadas según el dispositivo.

Para usar Cloudinary, copiá `.env.ejemplo` como `.env`, completá `CLOUDINARY_URL`
y arrancá el backend pasándole el archivo:

```bash
docker run -d --name moimpresiones-api \
  --network moimpresiones-ecommerce_default -p 8080:8080 \
  --env-file .env \
  -v "$PWD/backend":/app -v moimpresiones-m2:/root/.m2 -w /app \
  -e DB_URL=jdbc:postgresql://db:5432/moimpresiones \
  maven:3.9-eclipse-temurin-21 mvn -B spring-boot:run
```

Para migrar las fotos que ya están en disco, con Cloudinary activo:

```bash
python3 scripts/importar_fotos.py ~/Downloads/moimpresiones-fotos
```

El script reemplaza las imágenes de cada producto en vez de sumarlas, así que
se puede correr las veces que haga falta sin duplicar nada.

## Antes de publicar

Hay datos que el código deja explícitamente en blanco en lugar de inventarlos:

1. **`frontend/src/config/empresa.ts`** — razón social, CUIT, domicilio, horario y
   dominio. Mientras falten razón social y CUIT, las páginas legales muestran un
   aviso visible de que están incompletas.
2. **Variables de entorno** — `WHATSAPP_NUMBER`, `INSTAGRAM_URL`, `CONTACT_EMAIL`,
   `SITE_URL`, y un `JWT_SECRET` propio de al menos 32 caracteres.
3. **Fotos** de productos y terminaciones: las actuales vienen en la migración
   `V11__fotos_del_catalogo.sql`; las nuevas se cargan desde el panel.

Los términos y condiciones y la política de privacidad los revisó y aprobó el
cliente el 22/09/2026, y esa es la fecha que muestran las dos páginas. Si
cambia algo del servicio (formas de pago, envíos, plazos), hay que actualizar
el texto y esa fecha.

## Despliegue

Backend y base en **Render**, frontend en **Netlify**. La base es PostgreSQL
en Render y no TiDB: el backend usa funciones propias de PostgreSQL (búsqueda
sin acentos con `unaccent`, similitud con `pg_trgm`, triggers en plpgsql) que
TiDB, compatible con MySQL, no tiene.

Producción sale de `main`: antes del primer despliegue hay que llevar `develop`
a `main`.

### 1. Render (backend + base)

1. En Render: **New → Blueprint** y elegir este repositorio. Lee `render.yaml`
   y crea el servicio `moimpresiones-api`, la base `moimpresiones-db` y un disco
   de 1 GB para los adjuntos, ya conectados entre sí. `JWT_SECRET` lo genera
   Render solo.
2. Completar las variables que pide:
   - `ADMIN_PASSWORD` — la clave del panel. Larga y que no se use en otro lado.
   - `CLOUDINARY_URL` — la misma del `.env` local.
   - `CORS_ORIGINS` — la dirección de Netlify y el dominio propio, separados
     por coma: `https://moimpresiones.netlify.app,https://moimpresiones.com`.
   - `SITE_URL` — el dominio público, sin barra final.
   - `MAIL_*` y `NOTIFICACIONES_REMITENTE` — opcionales; sin `MAIL_HOST` no
     se mandan avisos por mail y el resto funciona igual.
3. Al arrancar, Flyway crea las tablas y carga el catálogo con sus fotos (que
   ya están en Cloudinary). El usuario del panel se crea con `ADMIN_PASSWORD`
   la primera vez: cambiar esa variable después no cambia la clave, para eso
   está la opción del panel.

> **Al publicar el frontend** se genera un HTML por dirección
> (`scripts/prerender.mjs`), con el título, la descripción y el canonical de
> cada pantalla. Para eso consulta la API: si no responde, se generan solo las
> pantallas fijas y el build no falla. Los textos salen de
> `src/config/paginas.json`, que es el mismo que usan las páginas.

### 2. Netlify (frontend)

1. Si Render asignó una dirección distinta de `moimpresiones-api.onrender.com`,
   reemplazarla en `netlify.toml` (aparece tres veces).
2. En Netlify: **Add new site → Import an existing project** con este
   repositorio y la rama `main`. El resto lo toma de `netlify.toml`: la carpeta
   `frontend`, el build, la vuelta a `index.html` en cada ruta y el sitemap y
   robots servidos desde el backend.

> **Cortes al publicar:** el servicio tiene un disco persistente para los
> adjuntos, así que Render apaga la versión vieja antes de levantar la nueva:
> cada despliegue del backend deja la API sin responder unos minutos. Por eso
> `render.yaml` limita los despliegues a los cambios de `backend/**`; un cambio
> del frontend solo republica Netlify, que no corta nada.

> **Recordatorio de cotizaciones sin responder:** si un pedido lleva 24 horas
> en «sin responder», el backend manda un mail con todos los pendientes, una
> sola vez por pedido. Se ajusta con `NOTIFICACIONES_RECORDATORIO_HORAS` (en 0
> se apaga) y necesita el correo configurado.

### 3. Monitoreo

El backend publica `/actuator/health`, que es lo que consulta Render para saber
si el servicio está sano (revisa también la base). Para enterarse de una caída
sin estar mirando, conviene un chequeo externo gratuito —por ejemplo
[UptimeRobot](https://uptimerobot.com)— apuntando a:

```
https://api.moimpresiones.com/actuator/health
```

Cada 5 minutos, con aviso por mail a `contacto@moimpresiones.com`.

### 4. Dominio

Apuntar el dominio a Netlify (Domain management) y agregarlo a `CORS_ORIGINS`
en Render.

## Flujo de trabajo con Git

- `main` — producción. Nunca se pushea directo.
- `develop` — rama de integración. Todo llega acá vía merge.
- `feature/<tarea>` — una rama por tarea, sale de `develop` y vuelve a `develop`.
