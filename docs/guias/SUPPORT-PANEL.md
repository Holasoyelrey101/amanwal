# 🎧 GUÍA: Panel de Soporte - Cómo Usar

## ¿Qué es el Panel de Soporte?

Es una nueva característica que permite a usuarios crear tickets de soporte y al equipo de soporte (admin y soporte) gestionar y resolver problemas.

---

## 👤 Roles y Permisos

### Usuario Normal (Sin Rol Especial)
- ✅ Crear nuevos tickets de soporte
- ✅ Ver sus propios tickets
- ✅ Agregar mensajes/comentarios en sus tickets
- ❌ No puede ver tickets de otros usuarios

### Staff de Soporte (Rol: `soporte`)
- ✅ Ver TODOS los tickets del sistema
- ✅ Filtrar tickets por estado y prioridad
- ✅ Agregar mensajes en cualquier ticket
- ✅ Buscar tickets
- ✅ Responder a usuarios
- ❌ No puede cambiar estado de tickets
- ❌ No puede asignar tickets

### Administrador (Rol: `admin`)
- ✅ Todo lo que puede soporte +
- ✅ Cambiar estado de tickets (Abierto → En progreso → Cerrado)
- ✅ Asignar tickets a personal de soporte
- ✅ Control total del sistema

---

## 🚀 Cómo Acceder al Panel de Soporte

### Para Usuario Normal:
1. **Iniciar sesión** en la aplicación
2. **No verá** "Panel de Soporte" en el menú (es normal)
3. Puede crear tickets mediante el botón "✚ Nuevo Ticket"

### Para Staff (Admin/Soporte):
1. **Iniciar sesión** con cuenta admin o soporte
2. **Clic en el avatar** (esquina superior derecha)
3. **Seleccionar** "Panel de Soporte" 🎧
4. Se abrirá el panel con todos los tickets

---

## 📝 Crear un Nuevo Ticket

### Paso 1: Abrir formulario
- Clic en botón **"✚ Nuevo Ticket"** en la parte superior

### Paso 2: Completar información
- **Título**: Resumen breve del problema
  - Ejemplo: "No puedo ver mis reservas"
  - Ejemplo: "Error en el pago"

- **Descripción**: Detalles completos
  - Ejemplo: "Cuando intento acceder a mis reservas, la página no carga"
  - Incluye: ¿Qué hiciste? ¿Qué pasó? ¿Qué esperabas?

- **Prioridad** (opcional, por defecto: Normal):
  - 🟢 **Baja**: No es urgente, puede esperar
  - 🔵 **Normal**: Problema común, respuesta en 24-48h
  - 🟡 **Alta**: Necesita atención pronto
  - 🔴 **Urgente**: Problema crítico, atención inmediata

- **Categoría** (opcional, por defecto: General):
  - General: Preguntas varias
  - Técnico: Errores, bugs
  - Facturación: Problemas de pago
  - Reserva: Problemas con reservas

### Paso 3: Enviar
- Clic en **"Crear Ticket"**
- Se generará un número único (TK-1234567890)
- El ticket aparecerá en la lista

---

## 🔍 Buscar y Filtrar Tickets

### Buscar por:
- **Número de ticket**: "TK-123"
- **Título**: "pago"
- **Descripción**: "error"

### Filtrar por Estado:
- **Todos**: Mostrar todos los tickets
- **Abierto**: Nuevos tickets sin atender
- **En progreso**: Alguien está trabajando en ello
- **Cerrado**: Problema resuelto

---

## 💬 Agregar Mensajes/Comentarios

### Proceso:
1. **Haz clic en un ticket** de la lista (lado izquierdo)
2. Se abrirá **detalles del ticket** (lado derecho)
3. Desplázate hacia abajo hasta **"Mensajes"**
4. **Escribe tu respuesta** en el campo de texto
5. Clic en **"📤 Enviar Mensaje"**

### Casos de uso:
- **Usuario**: "¿Cómo resuelvo mi problema?"
- **Soporte**: "Intentamos esto... ¿funcionó?"
- **Usuario**: "Sí, ¡gracias!"
- **Soporte**: Cambiar estado a "Resuelto"

---

## 🔧 Gestionar Tickets (Solo Admin/Soporte)

### Ver Detalles de un Ticket:
1. Clic en ticket de la lista
2. Verás:
   - Número único (TK-xxx)
   - Prioridad (color codificado)
   - Categoría
   - Usuario que reportó
   - Si está asignado a alguien
   - Thread completo de mensajes

### Cambiar Estado (Solo Admin):
1. Abre el ticket
2. En la parte superior derecha, selecciona nuevo estado:
   - **Abierto**: Nuevo problema sin atender
   - **En progreso**: Alguien está trabajando
   - **Cerrado**: Temporalmente cerrado
   - **Resuelto**: Problema solucionado

### Asignar Ticket a un Staff (Solo Admin):
(Funcionalidad disponible en interfaz del panel)

---

## 🎨 Colores y Significados

### Prioridad (lado derecho del número):
- 🟢 **BAJA** (Verde): Puede esperar
- 🔵 **NORMAL** (Azul): Prioridad normal
- 🟡 **ALTA** (Amarillo): Importante
- 🔴 **URGENTE** (Rojo): Crítico, ¡ya!

### Estado (en la tarjeta):
- Abierto
- En progreso
- Cerrado
- Resuelto

---

## 💡 Mejores Prácticas

### Para Usuarios:
✅ Sea específico en la descripción
✅ Incluya mensaje de error si tiene
✅ Mencione qué navegador/dispositivo usa
✅ Espere respuesta del equipo de soporte

### Para Staff:
✅ Asigne tickets rápidamente
✅ Actualice estado regularmente
✅ Sea profesional y amable
✅ Resuelva o documente el problema
✅ Marque como resuelto cuando termine

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde veo el número de mi ticket?**
R: Se muestra en formato "TK-123456" en la esquina superior izquierda de la tarjeta

**P: ¿Cuánto tarda en responder el soporte?**
R: Depende de la prioridad:
- Urgente: Menos de 1 hora
- Alta: 4-8 horas
- Normal: 24-48 horas
- Baja: 3-5 días

**P: ¿Puedo cambiar la prioridad después de crear el ticket?**
R: Solo el staff (admin/soporte) puede cambiar la prioridad

**P: ¿Se pierden los mensajes si cierro el navegador?**
R: No, se guardan en la base de datos. Podrás ver el historial completo

**P: ¿Qué pasa si otros usuarios ven mis problema?**
R: No, cada usuario solo ve SUS propios tickets (excepto admin/soporte que ven todos)

---

## 📞 Soporte de Emergencia

Si tienes un problema **crítico** que necesita atención inmediata:
1. Crea un ticket con **Prioridad: URGENTE**
2. **Contacta directamente** al equipo de soporte
3. Incluye el **número de ticket** (TK-xxx)

---

## ¿Necesitas más ayuda?

Contacta al equipo de soporte a través de:
- Panel de Soporte (este sistema)
- Email: support@amanwal.com
- Teléfono: +56 9 XXXX XXXX
