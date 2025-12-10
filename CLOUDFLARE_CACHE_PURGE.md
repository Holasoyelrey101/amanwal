# Purgar Caché de Cloudflare

## Opción 1: Dashboard Manual (MÁS RÁPIDO)

1. Ve a https://dash.cloudflare.com
2. Selecciona tu dominio **amanwal.com**
3. En el menú de la izquierda, ve a **Caching** → **Cache Control**
4. Haz clic en **Purge Everything** 
5. Confirma la acción
6. Espera 5-10 segundos a que se procese

## Opción 2: API de Cloudflare

Necesitarás tu **Zone ID** y **API Token**. Puedes encontrarlos aquí:
- Ve a https://dash.cloudflare.com/profile/api-tokens
- Copia tu **Global API Key** o crea un **API Token**

### Encontrar Zone ID:
1. Ve a https://dash.cloudflare.com
2. Selecciona amanwal.com
3. En la esquina inferior derecha de la página, ve **Zone ID**

### Ejecutar desde Terminal (Linux/Mac/PowerShell):

```bash
# Reemplaza estos valores
ZONE_ID="YOUR_ZONE_ID"
API_TOKEN="YOUR_API_TOKEN"
EMAIL="YOUR_CLOUDFLARE_EMAIL"

# Opción A: Usar API Token
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Opción B: Usar Global API Key (legacy)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "X-Auth-Email: $EMAIL" \
  -H "X-Auth-Key: $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Opción 3: PowerShell (Windows)

```powershell
$ZoneId = "YOUR_ZONE_ID"
$ApiToken = "YOUR_API_TOKEN"
$Email = "YOUR_CLOUDFLARE_EMAIL"

# Opción A: Con API Token
$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

$body = @{
    purge_everything = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/purge_cache" `
    -Method POST `
    -Headers $headers `
    -Body $body

# Opción B: Con Global API Key
$headers = @{
    "X-Auth-Email" = $Email
    "X-Auth-Key" = $ApiToken
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/purge_cache" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

## Resultado Esperado

Después de purgar la caché, deberías ver:

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "..."
  }
}
```

Luego, cuando vayas a https://amanwal.com, deberías ver:
- **Gradiente azul/morado** (#0a0e27 a #1a1a3e)
- **Título**: "Enseguida volvemos" en blanco con gradiente azul
- **Ícono**: Engranaje animado (⚙️)
- **Subtítulo**: "Estamos realizando tareas de mantenimiento"
- **Loader**: 3 puntos pulsantes
- **Pie de página**: "© 2025 Amanwal"

## Verificar que Funciona

Desde terminal, ejecuta:
```bash
curl -I https://amanwal.com/
```

Deberías ver en los headers:
```
Cache-Control: no-store, no-cache, must-revalidate, max-age=0, private
CF-Cache-Status: BYPASS  # ← Esto significa que Cloudflare NO cachea la página
```

## Notas Importantes

- La purga completa elimina TODA la caché de tu sitio
- Los archivos estáticos (CSS, JS, imágenes) pueden tardar un poco en recachear
- Los cambios de la página de mantenimiento se verán inmediatamente después
- Con los headers actuales, futuras páginas de mantenimiento NO se cachearan en Cloudflare

## Acceso Autorizado en Mantenimiento

Si necesitas ver el sitio MIENTRAS está en mantenimiento, ve a:
```
https://amanwal.com/?token=amanwal_maintenance_token_secreto_2025
```

O usa la panel admin:
```
https://amanwal.com/maintenance-panel.html?token=amanwal_maintenance_token_secreto_2025
```
