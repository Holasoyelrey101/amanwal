# 👥 PANEL DE ADMINISTRADOR

Guía para usar el panel de administrador.

---

## 🔐 Acceso al Panel

### 1. Login como Admin

1. En app, click en **"Inicia Sesión"**
2. Usa cuenta admin:
   - Email: `admin@amanwal.com`
   - Contraseña: (la que estableciste)
3. Click en **"Inicia Sesión"**

### 2. Ir al Panel

1. En navbar, verás opción **"Admin"**
2. Click en **"Admin"**
3. Ves dashboard con opciones

---

## 📊 Secciones del Admin

### 1. Dashboard

Resumen general:
- Total de usuarios
- Total de cabañas
- Total de reservas
- Ingresos totales
- Reservas recientes

### 2. Usuarios

Gestión de usuarios:
- **Listar**: Ve todos los usuarios
- **Buscar**: Filtra por email o nombre
- **Editar**: Cambia nombre, email, rol
- **Rol**: Usuario o Admin
- **Eliminar**: Borra usuario

#### Cambiar Rol

```
Usuario Normal → Admin: click en botón "Hacer Admin"
Admin → Usuario: click en botón "Revocar Admin"
```

### 3. Cabañas

Gestión de cabañas:
- **Listar**: Todas las cabañas
- **Crear**: Nueva cabaña
- **Editar**: Cambiar detalles
- **Eliminar**: Borrar cabaña

#### Crear Cabaña

```
Título: Nombre de la cabaña
Descripción: Detalle completo
Ubicación: Ciudad/Región
Precio: Por noche
Capacidad: Personas
Bedrooms: Cantidad
Bathrooms: Cantidad
Amenidades: WiFi, Cocina, etc.
Imágenes: URLs de fotos
```

### 4. Reservas

Gestión de reservas con búsqueda y filtrado:

#### Buscar/Filtrar

Puedes buscar por:
- **Número de Reserva**: RES-XXXXXX
- **Nombre del Usuario**: Juan, María, etc.
- **Cabaña**: Nombre de cabaña
- **Fecha**: Check-in o Check-out

Filtra por estado:
- **Todas**: Todos los estados
- **Pending**: No pagadas
- **Confirmed**: Pagadas y confirmadas
- **Cancelled**: Canceladas

#### Paginación

- Muestra 10 reservas por página
- Ordena por más recientes primero
- Navegación: Primera, Anterior, Siguiente, Última

#### Acciones

**Botón: Confirmar** (solo si status = pending)
- Confirma pago manualmente
- Útil si pago no se confirmó automáticamente
- Envía email de confirmación

**Botón: Cancelar** (si status != cancelled)
- Cancela la reserva
- Solo admin puede cancelar reserva de otro usuario
- Usuario normal solo puede cancelar sus propias

**Botón: Eliminar** (solo si status = cancelled)
- Borra reserva de la BD
- Solo funciona si está cancelada
- Acción permanente

### 5. Reseñas

Gestión de reseñas:
- **Listar**: Todas las reseñas
- **Aprobar**: Mostrar en app
- **Rechazar**: Ocultar de usuarios
- **Eliminar**: Borrar reseña
- **Filtrar**: Por cabaña o usuario

---

## 📈 Casos de Uso

### Caso 1: Usuario Reporta Pago No Procesado

1. Ve a **Reservas**
2. Busca por número de reserva o nombre
3. Verifica status: ¿está "pending"?
4. Click en **"Confirmar"**
5. Envía email confirmando al usuario

### Caso 2: Usuario Solicita Cancelación

1. Ve a **Reservas**
2. Busca la reserva
3. Verifica que no esté ya cancelada
4. Click en **"Cancelar"**
5. Email automático al usuario

### Caso 3: Usuario Quiere Ser Admin

1. Ve a **Usuarios**
2. Busca al usuario
3. Click en **"Hacer Admin"**
4. Ahora tiene acceso al panel

### Caso 4: Crear Nueva Cabaña

1. Ve a **Cabañas**
2. Click en **"Nueva Cabaña"**
3. Completa formulario:
   - Título
   - Descripción
   - Ubicación
   - Precio
   - Capacidad
   - Rooms/Baths
   - Amenidades
   - Imágenes
4. Click en **"Crear"**

### Caso 5: Revisar Reseña Ofensiva

1. Ve a **Reseñas**
2. Ve la reseña problemática
3. Click en **"Rechazar"**
4. Se oculta de usuarios públicos
5. Puedes eliminarla después

---

## 🔒 Permisos por Rol

| Acción | Usuario | Admin |
|--------|---------|-------|
| Ver sus reservas | ✅ | ✅ |
| Cancelar sus reservas | ✅ | ✅ |
| Cancelar otras reservas | ❌ | ✅ |
| Confirmar pago | ✅* | ✅ |
| Acceso al panel | ❌ | ✅ |
| Crear cabañas | ❌ | ✅ |
| Ver reportes | ❌ | ✅ |

*Usuario puede confirmar sus propias reservas después de pagar

---

## 💡 Tips Útiles

### Búsqueda Eficiente

- Busca por número de reserva para resultados exactos
- Busca por fecha para período específico
- Filtra por estado para casos específicos

### Exportar Reportes

Flow tiene reportes de pagos en su dashboard.

Para Amanwal:
- Click derecho en tabla → Copiar
- Pega en Excel para análisis

### Resetear Datos

Para desarrollo:
```bash
cd backend
rm dev.db
npm run prisma:migrate
```

### Crear Admin de Prueba

1. Registra usuario normal
2. Login como admin
3. Ve a Usuarios
4. Haz "Admin" al usuario de prueba

---

## 🚨 Operaciones Peligrosas

⚠️ **Cuidado con:**

- **Eliminar usuarios**: No se puede deshacer
- **Eliminar cabañas**: Afecta a reservas futuras
- **Confirmar pago falso**: Credibilidad

---

## 📚 Más Información

- Endpoint de reservas: Ver `../api/ARQUITECTURA.md`
- Modelo de datos: Ver `../api/MODELOS.md`
- Desarrollo: Ver `../desarrollo/GUIA-CODIGO.md`

---

**Happy Administrating! 👨‍💼**

---

**Última actualización**: Noviembre 2025
