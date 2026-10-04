# 🍷 Le Gourmet — Sistema de Reservas

Template de sistema de reservas para restaurante con identidad visual **Fine Dining** (Negro + Dorado). Construido 100% con HTML, CSS, **Tailwind CSS** y JavaScript nativo. Sin frameworks, sin backend, todo funciona con LocalStorage.

---

## 🚀 Características

- ✅ 15 pantallas funcionales completamente enlazadas
- ✅ Autenticación completa (Login, Registro, Recuperación de contraseña)
- ✅ Flujo de reserva en 3 pasos con indicadores de progreso
- ✅ Múltiples métodos de pago (Tarjeta, Yape/Plin, Efectivo)
- ✅ Perfil de usuario con estadísticas y edición
- ✅ Historial de reservas con filtros y búsqueda
- ✅ Detalle de reserva con modal de anulación
- ✅ Datos demo precargados (1 usuario + 6 reservas)
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Toasts, modales y validaciones
- ✅ Identidad visual Fine Dining coherente

---

## 📁 Estructura

```
restaurante-01/
├── index.html                       # 🏠 Pantalla de inicio
├── README.md
├── pages/
│   ├── login.html                  # 🔐 Iniciar sesión
│   ├── registro.html              # 📝 Registro
│   ├── recuperar-password.html    # 🔑 Recuperar contraseña
│   ├── servicios.html             # ⭐ Nuestros servicios
│   ├── contacto.html              # 📞 Contacto
│   ├── reservar.html              # 📅 Reservar (Paso 1)
│   ├── confirmacion-reserva.html  # ✓ Confirmación reserva (Paso 2)
│   ├── pago.html                  # 💳 Pago (Paso 3)
│   ├── confirmacion-pago.html     # ✓ Pago confirmado
│   ├── perfil.html                # 👤 Mi perfil
│   ├── historial-reservas.html    # 📋 Mis reservas
│   ├── detalle-reserva.html       # 🔍 Detalle + anular
│   ├── terminos-condiciones.html  # ⚖ Términos
│   └── politica-privacidad.html   # 🔒 Privacidad
└── assets/
    ├── css/
    │   └── styles.css             # Estilos custom + variables
    └── js/
        ├── storage.js             # Helpers LocalStorage + Seed
        ├── ui.js                  # Toasts, modales, header/footer
        ├── auth.js                # Login, registro, recovery
        └── reservas.js            # CRUD de reservas
```

---

## 🎨 Stack Técnico

- **HTML5** semántico
- **Tailwind CSS** vía CDN
- **JavaScript** vanilla (ES6+)
- **LocalStorage** para persistencia
- **Google Fonts** (Playfair Display + Inter)

### Paleta de colores

| Color | HEX | Variable |
|-------|-----|----------|
| Negro carbón | `#1a1a1a` | `--color-noir` |
| Dorado | `#d4af37` | `--color-gold` |
| Crema | `#faf7f2` | `--color-cream` |
| Vino | `#8b0000` | `--color-wine` |

### Moneda

Todos los precios se muestran en **CLP$** (Pesos Chilenos), con formato `CLP$ 15.000` (separador de miles con punto, sin decimales). El IVA chileno (19%) está incluido en los precios mostrados.

---

## 🛠️ Cómo usar

### 1. Instalación
No requiere instalación. Solo abre `index.html` en cualquier navegador moderno.

> 💡 Recomendado: usar un servidor local como **Live Server** (VS Code) para evitar restricciones del navegador con LocalStorage en protocolo `file://`.

### 2. Cuenta demo
- **Email:** `demo@restaurante.com`
- **Contraseña:** `123456`

La cuenta ya tiene 6 reservas con distintos estados precargadas.

### 3. Flujo de prueba sugerido
1. Ingresa con la cuenta demo desde **Iniciar sesión**
2. Ve a **Mis reservas** para ver el historial
3. Entra al detalle de cualquier reserva
4. Crea una nueva reserva desde el botón "+ Nueva reserva"
5. Continúa al pago (Tarjeta: `4111 1111 1111 1111`, expiry `12/30`, CVV `123`)
6. Ve a **Mi perfil** para editar tus datos
7. Cierra sesión y prueba registrarte con un nuevo usuario

---

## 📦 Datos de prueba

### Tarjeta de crédito (mock)
| Campo | Valor |
|--------|-------|
| Número | `4111 1111 1111 1111` |
| Vencimiento | `12/30` |
| CVV | `123` |
| Nombre | cualquiera |

> ⚠ El sistema NO valida el algoritmo Luhn completo, solo verifica formato (13-19 dígitos, MM/AA, CVV 3-4 dígitos).

### Reservas demo
| Estado | Reserva |
|--------|---------|
| ✅ Completada | `RES-100001` (hace 7 días) |
| 📅 Confirmada | `RES-100002` (mañana) |
| ⏳ Pendiente | `RES-100003` (en 3 días) |
| 🍽️ En curso | `RES-100004` (hoy) |
| ❌ Anulada | `RES-100005` (hace 3 días) |
| ✅ Completada | `RES-100006` (hace 15 días) |

---

## 💾 Namespace de LocalStorage

Todas las claves usan el prefijo `restaurante_`:

| Clave | Contenido |
|-------|-----------|
| `restaurante_users` | Array de usuarios registrados |
| `restaurante_session` | Sesión activa del usuario |
| `restaurante_reservas` | Array de reservas |
| `restaurante_config` | Configuración del restaurante |
| `restaurante_recovery_tokens` | Tokens de recuperación |

Para limpiar todo: abre la consola y ejecuta `Storage.clear()`.

---

## ✨ Funcionalidades Destacadas

### Persistencia
- Sesión, reservas y pagos se conservan al cerrar y reabrir el navegador
- Generador automático de IDs correlativos (`RES-100001`, `RES-100002`, ...)

### UI/UX
- Toasts para feedback inmediato
- Modales para confirmaciones
- Validación inline en formularios
- Avatar seleccionable en registro y perfil
- Estados de reserva representados con badges de color
- Timeline visual del progreso de la reserva
- QR generado dinámicamente en comprobante

### Responsive
- Menú hamburguesa en mobile
- Grid adaptativo en cards
- Formularios que se apilan en mobile
- Tablas reemplazadas por cards en listas

---

## 🔒 Notas de seguridad

⚠ **Este template es solo para demo**. No usar en producción sin:

- Hash real de contraseñas (bcrypt/argon2)
- Backend con base de datos real
- HTTPS obligatorio
- CSRF tokens
- Rate limiting
- Validación server-side
- PCI DSS para pagos reales (usar pasarela como Stripe/Culqi)

---

## 📄 Licencia

Template libre para uso comercial. Personaliza según tus necesidades.

---

## 🎯 Próximos pasos sugeridos

- [ ] Integrar con backend real (Node.js, PHP, Python, etc.)
- [ ] Agregar pasarela de pago real (Stripe, Culqi, Izipay)
- [ ] Sistema de notificaciones por email (SendGrid, Mailgun)
- [ ] Dashboard de administración
- [ ] Sistema de reseñas
- [ ] Notificaciones push
- [ ] Integración con Google Calendar
- [ ] Multi-idioma (EN/PT)