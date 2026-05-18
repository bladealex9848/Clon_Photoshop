# Editor 100% funcional — menús, herramientas y paneles — 2026-05-17

Auditoría y cableado de **cada** control del editor
(`https://photoshop.cedula360.tech/editor`). Antes, gran parte de la UI
era cosmética (botones sin handler, menús sin acción).

## Bug raíz encontrado

`Toolbar.tsx` usaba `useState` local para la herramienta activa en vez de
`useToolStore`. **Hacer clic en cualquier herramienta no hacía nada** —
el `CanvasContainer` lee `useToolStore` y nunca recibía el cambio. Mismo
patrón en los selectores de color (sin `onClick`) y el botón de swap.

## Arquitectura añadida

| Pieza | Propósito |
|---|---|
| `stores/useEngineStore.ts` | Puente UI↔motor: expone `CompositeRenderer`, ejecuta ops de píxeles sobre la capa activa y regenera miniatura + recompone |
| `stores/useDocumentStore.ts` | Tamaño/nombre del documento (lo consumen Canvas, reglas, status, export, Propiedades) |
| `stores/useSelectionStore.ts` | Selección rectangular (bbox) que respetan filtros/borrado |
| `lib/canvas/ops.ts` | Filtros y transformaciones de píxeles (invert, grayscale, blur, sharpen, rotate90, flip, scale, clear) |
| `lib/history.ts` | Registro de snapshots de estructura de capas + undo/redo/jump reales |

`CanvasContainer` ahora registra el motor en `useEngineStore`, lee el
tamaño del `useDocumentStore` (con **preservación de píxeles** al
redimensionar vía snapshot/restore) y respeta reglas/guías/cuadrícula.

## Controles cableados (antes muertos)

- **Toolbar**: 10 herramientas → `useToolStore`; selectores de color
  (input `color` nativo) FG/BG; intercambио de colores.
- **TopBar**: botón **Exportar** con menú (PNG / ZIP / .photoclone);
  indicador de zoom **en vivo** y clicable (reset 100%).
- **Menú Archivo**: Nuevo (con confirmación + limpia historial), Abrir,
  Guardar/Guardar como, Exportar PNG/ZIP.
- **Menú Editar**: Deshacer/Rehacer (historial real), Cortar/Copiar/Pegar
  (portapapeles de `ImageData`), Transformar Libre (→ herramienta mover).
- **Menú Imagen**: Tamaño de Imagen (escala %), Tamaño del Lienzo,
  Rotar 90° H/AH, Voltear H/V (ops reales de píxeles).
- **Menú Capa**: Nueva, Duplicar, Eliminar, Agrupar, Desagrupar,
  Fusionar Hacia Abajo, Aplanar Imagen.
- **Menú Selección**: Todo, Deseleccionar, Invertir, Calar (radio).
- **Menú Filtro**: Desenfocar, Enfocar, Escala de Grises, Invertir
  Colores (respetan la selección si está activa).
- **Menú Vista**: zoom in/out/ajustar/real + toggles Reglas/Guías/
  Cuadrícula (con overlay de grid y guías reales sobre el lienzo, marca ✓).
- **Menú Ayuda**: modales Atajos de Teclado / Documentación / Acerca de.
- **Panel Capas**: "Crear grupo" cableado + **reordenar drag & drop**.
- **Panel Propiedades**: X/Y de la capa, Ancho/Alto del documento y
  opacidad **enlazados en vivo** al store.
- **Panel Historial**: refleja el historial real; clic = `jumpToAction`.

## Validación end-to-end (Playwright, build de producción)

**22/22 verificaciones funcionales OK · 0 errores de consola.**

Herramienta activa, swap de colores, Nueva/Duplicar/Agrupar/Aplanar capa,
Copiar+Pegar (capa nueva), Filtro Invertir/Grayscale, Imagen Voltear,
Selección Todo, toggle Cuadrícula (marca ✓), modal Ayuda, panel Historial
poblado, panel Propiedades (Documento), dropdown Exportar, indicador de
zoom en vivo (125% → reset 100%).

## Limitaciones conocidas (documentadas, no regresiones)

- **Historial**: captura estructura de capas (orden/opacidad/blend/alta/
  baja), no píxeles de pincel/filtro. Era el comportamiento previo de
  undo/redo; ahora al menos es navegable y real.
- **Selección**: modelo *bbox* rectangular, no máscara freeform. Filtros
  y borrado la respetan; "Invertir" alterna selección↔todo.
- **Redimensionar lienzo**: preserva píxeles por snapshot; si se reduce,
  se recorta (semántica de "tamaño de lienzo").

## Navegación y sesión en el editor (v0.3.1, 2026-05-18)

Faltaba volver a la landing y saber quién había iniciado sesión:

- **Logo del TopBar** → `Link` a `/` (landing).
- **Indicador de cuenta** (derecha del TopBar) vía `useAuth`:
  - Sin sesión → botón "Iniciar sesión" (`/login`).
  - Con sesión → avatar + nombre + menú (nombre/email/rol, enlace
    **Panel administrativo** `/admin`, "Cerrar sesión" → `signOut`).

Validado Playwright (anónimo + autenticado): logo→landing, "Iniciar
sesión" sin sesión, panel de cuenta con `/admin` + logout con sesión.

## Estado

Build EXIT=0 (editor 58.1 kB), `clon-photoshop.service` activo,
`/editor` 200. Probado con Playwright headless contra `127.0.0.1:3024`.
