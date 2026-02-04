# 🎉 NapEvents

Sistema completo de gestión de eventos con venta de entradas, control de acceso mediante códigos QR y administración de equipos.

![NapEvents](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Características

- 🎫 **Gestión de Entradas**: Crea entradas FREE, VIP y personalizadas
- 📱 **Códigos QR**: Genera códigos QR únicos para cada entrada
- 👥 **Equipos y Roles**: Sistema completo de permisos (Super Admin, Admin, Promotor, Staff, Usuario)
- 🔗 **Enlaces Compartibles**: Genera enlaces para registro gratuito
- 📊 **Reportes en Tiempo Real**: Estadísticas y métricas de tus eventos
- 🔐 **Control de Acceso**: Check-in rápido con validación de tickets
- 🔒 **Autenticación JWT**: Sistema seguro de autenticación

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- pnpm
- Docker y Docker Compose

### Instalación

1. **Instalar dependencias**
```bash
pnpm install
```

2. **Iniciar MongoDB con Docker**
```bash
docker-compose up -d
```

Esto levantará:
- MongoDB en `localhost:27020`
- Mongo Express (GUI) en `http://localhost:8081`

3. **Crear super admin inicial**
```bash
pnpm seed
```

**Credenciales del admin:**
- Email: `admin@napevents.com`
- Password: `admin123`

4. **Iniciar el servidor de desarrollo**
```bash
pnpm dev
```

La aplicación estará disponible en **http://localhost:3000**

## 📱 Páginas Disponibles

### Públicas
- **/** - Página principal increíble y llamativa
- **/auth/login** - Inicio de sesión
- **/auth/register** - Registro de usuarios

### Privadas (requieren autenticación)
- **/dashboard** - Panel de control
- **/dashboard/events** - Lista de eventos (próximamente)
- **/dashboard/tickets** - Gestión de entradas (próximamente)

## 🔐 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Super Admin** | Acceso total a todas las funciones |
| **Admin** | Gestión de eventos, entradas y usuarios |
| **Promoter** | Crear tickets y ver reportes |
| **Staff** | Check-in de entradas |
| **User** | Acceso básico |

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/register          - Registrar usuario
POST   /api/auth/login             - Iniciar sesión
GET    /api/auth/me                - Obtener usuario actual
```

### Eventos
```
GET    /api/events                 - Listar eventos
POST   /api/events                 - Crear evento
GET    /api/events/[id]            - Obtener evento
PUT    /api/events/[id]            - Actualizar evento
DELETE /api/events/[id]            - Eliminar evento
```

### Entradas
```
GET    /api/events/[id]/tickets    - Listar tickets
POST   /api/events/[id]/tickets    - Crear ticket
POST   /api/tickets/[id]/checkin   - Check-in
GET    /api/tickets/verify/[qrCode] - Verificar ticket
```

### Asignaciones
```
GET    /api/events/[id]/assignments - Listar asignaciones
POST   /api/events/[id]/assignments - Asignar usuario a evento
```

### Enlaces de Registro
```
GET    /api/events/[id]/registration-links - Listar enlaces
POST   /api/events/[id]/registration-links - Crear enlace
GET    /api/register/[code]                - Ver info del enlace
POST   /api/register/[code]                - Registrarse con enlace
```

### Usuarios
```
GET    /api/users                  - Listar usuarios
POST   /api/users                  - Crear usuario
```

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB 7.0
- **ODM**: Mongoose 9
- **Authentication**: JWT (jsonwebtoken)
- **Language**: TypeScript 5
- **QR Codes**: qrcode
- **Password**: bcryptjs

## 📦 Estructura del Proyecto

```
nap-events/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── events/       # Eventos
│   │   ├── tickets/      # Entradas
│   │   ├── users/        # Usuarios
│   │   └── register/     # Registro público
│   ├── auth/              # Páginas de autenticación
│   │   ├── login/        # Login
│   │   └── register/     # Registro
│   ├── dashboard/         # Panel de control
│   └── page.tsx           # Página principal
├── lib/                   # Utilidades
│   ├── db.ts             # Conexión MongoDB
│   ├── auth.ts           # JWT helpers
│   ├── middleware.ts     # Auth middleware
│   └── utils.ts          # Utilidades
├── models/               # Modelos Mongoose
│   ├── User.ts
│   ├── Event.ts
│   ├── Ticket.ts
│   ├── EventAssignment.ts
│   └── RegistrationLink.ts
├── types/                # TypeScript types
│   └── index.ts
├── scripts/              # Scripts de utilidad
│   └── seed.ts           # Crear super admin
└── docker-compose.yml    # Docker config
```

## 🐳 Docker

### Servicios Disponibles

**MongoDB**
- Puerto: 27020
- Usuario: admin
- Contraseña: admin123
- Base de datos: nap_events_db

**Mongo Express** (GUI Web)
- Puerto: 8081
- URL: http://localhost:8081
- Usuario: admin
- Contraseña: admin123

### Comandos Útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f mongodb

# Detener servicios
docker-compose down

# Limpiar volúmenes (¡elimina todos los datos!)
docker-compose down -v
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar en producción
pnpm start

# Linting
pnpm lint

# Crear super admin
pnpm seed
```

## 🎨 Diseño

La aplicación cuenta con un diseño moderno y atractivo:

- ✨ Gradientes animados de fondo
- 🌊 Animaciones suaves de "blob"
- 📱 Diseño 100% responsive
- 🌙 Tema oscuro elegante
- 💎 Efectos glassmorphism
- 🎭 Transiciones fluidas
- 🎨 Paleta de colores purple-pink

## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Passwords hasheados con bcryptjs
- Validación de permisos por rol
- Middleware de autenticación
- Sanitización de inputs
- MongoDB con autenticación habilitada

## 📝 Variables de Entorno

El archivo `.env.local` contiene:

```env
# MongoDB
MONGODB_URI=mongodb://admin:admin123@localhost:27020/nap_events_db?authSource=admin

# JWT
JWT_SECRET=napevents-dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NapEvents
```

⚠️ **Importante**: Cambia el `JWT_SECRET` en producción.

## 🚧 Próximas Funcionalidades

- [ ] CRUD completo de eventos
- [ ] Generación y descarga de QR codes
- [ ] Escaneo de QR en tiempo real
- [ ] Dashboard con gráficos
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Notificaciones por email
- [ ] Pasarela de pagos
- [ ] Multi-idioma

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado.

## 👨‍💻 Autor

**NetApp Peru**

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.

Desarrollado con ❤️ y ☕ por el equipo de NetApp Peru
