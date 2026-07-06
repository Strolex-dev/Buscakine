# Buscakine — Plataforma Web

Plataforma que conecta pacientes con kinesiólogos a domicilio en Chile.

🌐 **Sitio en producción:** [buscakine.cl](https://buscakine.cl)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 + TypeScript |
| Build tool | Vite |
| UI | Quasar Framework |
| Autenticación | Firebase (Google OAuth) + JWT |
| Pagos | MercadoPago |
| Editor de contenido | Vue Quill |
| Backend | Node.js + Express |
| Base de datos | MySQL |
| Deploy | VPS Linux + PM2 + Nginx |

---

## Funcionalidades principales

### Para pacientes
- Búsqueda de kinesiólogos por comuna y especialidad
- Perfil detallado con fotos, certificados y reseñas
- Agendamiento de sesiones a domicilio
- Pago en línea via MercadoPago
- Sistema de calificaciones y comentarios

### Para kinesiólogos
- Registro con email/contraseña o Google OAuth
- Perfil profesional editable (foto, descripción, servicios, comunas)
- Subida de certificados y credenciales profesionales
- Gestión de agenda y disponibilidad
- Sistema de planes (básico / preferente)

### Panel de administración
- Gestión de kinesiólogos y aprobación de registros
- Editor de blog con soporte de imágenes y banners
- Sistema de banners y sliders publicitarios
- Gestión de empresas y distintivos
- Mensajería interna y notificaciones

---

## Arquitectura

```
Frontend (Vue 3)  →  API REST (Express)  →  MySQL
                  →  Firebase Auth
                  →  MercadoPago
                  →  Subida de archivos (local/VPS)
```

- SPA desplegada vía Nginx
- API gestionada con PM2
- Autenticación dual: JWT propio + Google OAuth via Firebase
- Variables de entorno via Vite (`VITE_API_URL`, etc.)

---

## Autor

Desarrollado por **Matías Mancilla** — Desarrollador Full Stack  
📧 smancillae@gmail.com
