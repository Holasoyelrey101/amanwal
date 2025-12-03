# 🚀 Testing el Sistema de Tickets de Soporte

## Requisitos Previos

- Node.js 18+ instalado
- Base de datos SQLite sincronizada (migraciones ejecutadas)
- Frontend y backend en desarrollo o compilados

---

## Paso 1: Iniciar el Backend

```bash
cd backend
npm install  # Si no lo has hecho
npm start    # Inicia en puerto 3000
```

**Verificar:**
```
✅ Server running on http://localhost:3000
```

---

## Paso 2: Iniciar el Frontend

En otra terminal:
```bash
cd frontend
npm install  # Si no lo has hecho
npm run dev  # Inicia en puerto 5173
```

**Verificar:**
```
VITE v5.4.21  ready in XX ms

➜  Local:   http://localhost:5173/
```

---

## Paso 3: Acceder a la Aplicación

1. Abre http://localhost:5173 en tu navegador
2. **Inicia sesión** con una cuenta admin o soporte

---

## 📋 Casos de Prueba

### Test 1: Crear Ticket (Usuario Normal)

**Objetivo:** Verificar que un usuario puede crear un ticket

**Pasos:**
1. Inicia sesión con cuenta normal (no admin)
2. Busca botón "✚ Nuevo Ticket" en la página principal
3. Completa el formulario:
   - Título: "Test: No puedo acceder"
   - Descripción: "La aplicación no carga"
   - Prioridad: Normal
   - Categoría: Técnico
4. Clic en "Crear Ticket"

**Resultado esperado:**
- ✅ Mensaje: "Ticket creado exitosamente"
- ✅ Nuevo ticket aparece en lista
- ✅ Se genera número único (TK-xxx)

---

### Test 2: Acceder Panel de Soporte (Solo Admin/Soporte)

**Objetivo:** Verificar que solo admin/soporte ven panel

**Pasos (Usuario Normal):**
1. Inicia sesión con usuario normal
2. Clic en avatar → Dropdown
3. Verifica que NO aparece "Panel de Soporte"

**Pasos (Usuario Admin):**
1. Inicia sesión con admin
2. Clic en avatar → Dropdown
3. Debe aparecer "Panel de Soporte" 🎧
4. Clic en "Panel de Soporte"

**Resultado esperado:**
- ✅ Redirige a `/support`
- ✅ Se carga el panel con tickets

---

### Test 3: Filtrar y Buscar Tickets

**Objetivo:** Verificar filtrado y búsqueda

**Pasos:**
1. En Panel de Soporte, accede como admin
2. **Prueba Búsqueda:**
   - Escribe "pago" en search bar
   - Verifica que filtra tickets que contengan "pago"
3. **Prueba Filtros de Estado:**
   - Clic en "Abierto"
   - Verifica que solo muestra tickets abiertos
   - Prueba "En progreso", "Cerrado", "Todos"

**Resultado esperado:**
- ✅ La búsqueda filtra correctamente
- ✅ Los botones de estado funcionan
- ✅ La lista se actualiza en tiempo real

---

### Test 4: Ver Detalles del Ticket

**Objetivo:** Verificar que se muestran todos los detalles

**Pasos:**
1. En Panel de Soporte, haz clic en un ticket
2. Verifica información mostrada:
   - [ ] Número de ticket (TK-xxx)
   - [ ] Prioridad (con color)
   - [ ] Categoría
   - [ ] Usuario que reportó
   - [ ] Descripción completa
   - [ ] Thread de mensajes (si los hay)

**Resultado esperado:**
- ✅ Todo se muestra correctamente
- ✅ Los colores de prioridad son correctos

---

### Test 5: Agregar Mensaje

**Objetivo:** Verificar que se pueden agregar mensajes

**Pasos:**
1. Abre un ticket
2. Ve a sección "Mensajes"
3. Escribe: "Probando nuevo mensaje"
4. Clic en "📤 Enviar Mensaje"

**Resultado esperado:**
- ✅ El mensaje aparece en el thread
- ✅ Muestra tu nombre y timestamp
- ✅ El campo se limpia después de enviar

---

### Test 6: Cambiar Estado (Solo Admin)

**Objetivo:** Verificar que admin puede cambiar estado

**Pasos (Admin):**
1. Abre un ticket
2. En esquina superior derecha, donde dice el estado actual
3. Selecciona dropdown con nuevo estado
4. Elige "En progreso"

**Pasos (Soporte):**
1. Abre el mismo ticket como soporte
2. Verifica que el campo de estado es solo lectura

**Resultado esperado:**
- ✅ Admin ve dropdown para cambiar estado
- ✅ Soporte ve estado en modo solo lectura
- ✅ Estado se actualiza en tiempo real

---

### Test 7: Crear Ticket con Diferentes Prioridades

**Objetivo:** Verificar que las prioridades se muestran con colores correctos

**Pasos:**
1. Crea 4 tickets con diferentes prioridades:
   - Baja (verde)
   - Normal (azul)
   - Alta (amarillo)
   - Urgente (rojo)

**Resultado esperado:**
- ✅ Cada ticket muestra su color correcto
- ✅ Los colores están codificados correctamente

---

## 🐛 Debugging

### Si no ves "Panel de Soporte":
1. Verifica que estés logueado como admin o soporte
2. Comprueba en DevTools → Console si hay errores
3. Verifica que el usuario tiene rol asignado en BD

### Si los tickets no cargan:
1. Abre DevTools → Network
2. Busca request a `/api/support/tickets`
3. Verifica que retorna 200 (no 401 o 403)
4. Comprueba que el token JWT es válido

### Si hay error 401:
- Token expirado. Recarga la página o inicia sesión nuevamente

### Si hay error 403:
- No tienes permisos. Verifica tu rol en la BD

---

## 🔍 Verificar Base de Datos

Abrir SQLite para verificar que las tablas existen:

```bash
# Desde carpeta backend/prisma
sqlite3 dev.db

# Dentro de SQLite:
.tables

# Deberías ver: Ticket, Message, User, Cabin, Booking, Review
```

---

## 📊 Puntos de Verificación Finales

- [ ] Backend compila sin errores (`npm run build`)
- [ ] Frontend compila sin errores
- [ ] Puedes crear tickets como usuario normal
- [ ] Admin/soporte ven el Panel de Soporte
- [ ] Los filtros de búsqueda funcionan
- [ ] Los cambios de estado funcionan (admin)
- [ ] Los mensajes se guardan y muestran
- [ ] Los colores de prioridad son correctos
- [ ] Los timestamps se muestran correctamente
- [ ] No hay errores en la consola (DevTools)

---

## 🎯 Comandos Útiles

### Verificar que las migraciones se aplicaron:
```bash
cd backend
npx prisma migrate status
```

### Regenerar cliente Prisma (si hay cambios en schema):
```bash
cd backend
npx prisma generate
```

### Ver datos en la BD (interfaz gráfica):
```bash
cd backend
npx prisma studio
```

---

## ⚡ Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Error 400 en crear ticket | Verifica que title y description no estén vacíos |
| Error 401 | Inicia sesión nuevamente |
| Error 403 | No tienes rol admin/soporte |
| Tickets no cargan | Verifica que Backend está corriendo |
| Página en blanco | Abre DevTools, busca errores en Console |
| "Panel de Soporte" no aparece | Recarga la página o abre en incógnito |

---

## 📈 Próximas Características (Futuro)

- [ ] Notificaciones en tiempo real
- [ ] Asignación automática de tickets
- [ ] SLA (tiempo de respuesta esperado)
- [ ] Categorización automática por IA
- [ ] Integración con email
- [ ] Dashboard de métricas

---

¡Listo! Ahora puedes probar el sistema de tickets completo. 🎉
