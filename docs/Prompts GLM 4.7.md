# Prompts GLM 4.7

## Clonación Photoshop (con QWEN)

Desarrolla un **clon de Photoshop en el navegador** (web app) enfocado en **edición por capas** con UI profesional, atajos de teclado y rendimiento fluido. El objetivo es que el usuario pueda cargar una imagen, editarla con herramientas básicas y, sobre todo, usar una **integración de IA** para **separar la imagen en capas RGBA físicamente aisladas**, editables como capas nativas.

### **1\) Interfaz y UX tipo Photoshop**

* Layout con 4 zonas:  
  1. **Barra superior**: Archivo, Editar, Imagen, Capa, Selección, Filtro, Vista, Ayuda.  
  2. **Barra de herramientas izquierda**: mover, selección rectangular/lazo, pincel, borrador, texto, recortar, cuentagotas, zoom/mano.  
  3. **Lienzo central** con zoom, pan, reglas y guías.  
  4. **Panel derecho** con pestañas: **Capas**, Propiedades, Historial, Ajustes.  
* Estilo visual tipo app pro (oscuro/neutral), iconografía clara, tooltips, estados hover/active.  
* Atajos: Ctrl/Cmd+Z (undo), Ctrl/Cmd+Shift+Z (redo), Ctrl/Cmd+S (export), V (move), B (brush), E (eraser), T (text), Z (zoom), Space (pan).

### **2\) Motor de documento y edición**

* Estructura de documento: tamaño, fondo, modo color, y lista de **capas**.  
* Cada **capa** debe soportar:  
  * Bitmap RGBA (con alpha real).  
  * Transformaciones: posición, escala, rotación.  
  * Visibilidad, opacidad, bloqueo.  
  * Modo de fusión básico (normal, multiplicar, pantalla).  
  * Máscara (opcional MVP).  
* Render en tiempo real (Canvas/WebGL) con compositing correcto.  
* Historial (undo/redo) basado en acciones.

### **3\) Panel de capas (clave del producto)**

* Lista de capas con miniaturas, reordenar por drag-and-drop, agrupar en carpetas, renombrar.  
* Botones: nueva capa vacía, duplicar, fusionar, exportar capa, eliminar.  
* Soporta **capas dentro de capas** (grupos anidados) para “decomposición infinita”.

### **4\) Integración IA para separación en capas con QWEN (OpenRouter)**

* Añade un módulo “**IA: Separar en capas**” con:  
  * Campo “**Número de capas (3–10)**”.  
  * Campo “**Instrucciones de estructura**” (ej.: “separa persona, pelo, ropa, fondo, sombras…”).  
  * Toggle “**Decomposición infinita**”: permitir al usuario seleccionar una capa y volver a separarla en subcapas.  
* La IA debe devolver **capas RGBA físicamente aisladas** (una imagen por capa con transparencia real) y metadatos.  
* El resultado debe insertarse como:  
  * Un **grupo** con N capas (o subcapas si es refinamiento).  
  * Cada capa con nombre sugerido, bounding box si aplica, y orden correcto.

### **4\) Flujo de usuario (end-to-end)**

1. Usuario carga imagen.  
2. En panel IA: elige **N capas (2–10)** y describe qué quiere separar.  
   Se llama a tu endpoint (proxy)  
   Se crea un grupo “IA Layers (N)” con las capas RGBA.  
3. Usuario selecciona una capa concreta y pulsa “Refinar capa” para generar **subcapas** de esa capa.  
4. Usuario edita capas con herramientas básicas (mover, borrar, pincel, texto).  
5. Exportación: PNG final, PSD-like JSON (propio), o ZIP con capas PNG.

### **5\) Seguridad y arquitectura obligatoria**

* **Nunca** pongas claves API en el frontend.  
* Implementa un **backend proxy** (Node/Express o serverless) que:  
  * Inyecta la clave desde variables de entorno.  
  * Aplica rate limiting y validación.  
  * Registra coste/latencia/errores.  
* En el frontend solo se llama a tu endpoint: /api/layers/decompose.

### **6\) Requisitos de calidad**

* Debe funcionar sin errores de consola.  
* Rendimiento fluido (60fps en operaciones normales).  
* Fallback: si IA falla, el editor sigue operando sin bloquear.  
* Incluye datos demo y un documento de ejemplo.  
* Toda y cada una de las herramientas y funciones debes ser totalmente funcionales  
* Consulta al usuario por la API

## De mapa mental a nodos interacitvos

A partir de este mapa mental, crea un gráfico de nodos interactivo en un solo HTML, al clicar se debe poder ver  
más información, como una plataforma de aprendizajel

## Simulador de iPhone

Desarrolla un simulador de iPhone con iOS con una interfaz fluida y realista.  
Pantalla de bloqueo (Lock Screen):  
	•	Al iniciar, muestra una pantalla de bloqueo en alta resolución con fondo tipo “wallpaper” iOS.  
	•	Incluye un reloj digital grande y centrado (formato 24h o 12h).  
	•	Añade elementos típicos: fecha arriba, e indicadores de señal/Wi-Fi/batería en la esquina superior derecha.  
	•	Implementa el gesto deslizar hacia arriba para desbloquear (swipe up). Debe sentirse nativo, con animación suave.

Desbloqueo y Home Screen:  
	•	Tras desbloquear, navega a la pantalla de inicio (Home Screen) con una cuadrícula de 8 apps (4x2), con iconos cuadrados con esquinas redondeadas (estilo iOS, no circulares).  
	•	Incluye como mínimo estas apps: Safari, App Store, Fotos, Cámara (puedes añadir: Mensajes, Ajustes, Música, Mapas).  
	•	En la parte inferior, muestra un Dock persistente con 4 iconos (ej.: Teléfono, Safari, Mensajes, Música) y el indicador de inicio (Home Indicator).

Navegación iOS (sin barra Android):  
	•	No uses barra de navegación con botones Back/Home/Recents.  
	•	Implementa navegación iOS:  
	•	Home Indicator (deslizar arriba para ir a inicio).  
	•	Switcher de apps: deslizar hacia arriba y mantener para mostrar apps recientes.  
	•	Gesto de volver dentro de apps: swipe desde el borde izquierdo (si aplica).

Centro de notificaciones y Centro de control:  
	•	Implementa un Centro de notificaciones:  
	•	Se abre con deslizar hacia abajo desde la parte superior central/izquierda.  
	•	Muestra tarjetas de notificación apiladas (mock), con animación y scroll.  
	•	Implementa un Centro de control (Control Center):  
	•	Se abre con deslizar hacia abajo desde la esquina superior derecha.  
	•	Incluye toggles conmutables para: Wi-Fi, Bluetooth y Linterna (Flashlight), con estado ON/OFF visible.  
	•	Añade sliders tipo iOS para brillo y volumen (aunque sea mock funcional visualmente).

Interacción y requisitos:  
	•	Todos los gestos deben ser funcionales, con transiciones suaves (spring/ease).  
	•	Mantén consistencia visual iOS: tipografía tipo San Francisco, sombras sutiles, blur/transparencias (glassmorphism) en paneles.  
	•	El simulador debe ser autocontenido, sin depender de assets con copyright (usa iconos genéricos “estilo iOS” o equivalentes libres).

Si lo quieres para una herramienta concreta (p. ej., “genera un único archivo HTML/CSS/JS” o “para una app en React”), dime cuál y te lo dejo listo en ese formato.

## Juego conocido

Crea un **juego 3D endless runner estilo “Subway Surfers” (clon inspirado, no copia exacta)**. Debe ser **100% funcional**.

**Objetivo y estilo**

* Runner en **tercera persona** con cámara detrás del personaje.  
* Ambientación **urbana moderna** (calles, túneles, trenes/obstáculos urbanos, vallas, señales).  
* Ritmo arcade: velocidad creciente, sensación “mobile”.

**Controles (que funcionen sí o sí)**

* **Flechas izquierda/derecha**: cambiar de carril (3 carriles).  
* **Flecha arriba**: saltar.  
* **Flecha abajo**: deslizar/rodar (agacharse) para pasar por debajo de obstáculos.  
* **ESC** pausa.  
* Asegúrate de que **las flechas mueven algo desde el segundo 1** (no puede pasar lo de “the arrow keys don’t move anything”).

**Mecánicas core**

* Movimiento automático hacia delante (endless).  
* **Generación procedural** del escenario por “chunks” para que nunca se acabe.  
* **Monedas/coleccionables** en línea y en patrones (arcos, zigzag, carriles).  
* **Power-ups**:  
  * **Imán** (atrae monedas durante X segundos).  
  * **Multiplicador de puntuación** (x2/x3 por X segundos).  
  * **Turbo/Speed boost** (subida de velocidad con efecto visual).  
  * (Opcional) **Escudo** para aguantar 1 choque.  
* **Puntuación** por distancia \+ monedas \+ multiplicadores.  
* **UI**: score, coins, mejor récord (localStorage), estado de power-up (barra/tiempo).  
* **Pantallas**: inicio (“Pulsa Enter”), game over (“R para reiniciar”), pausa.

**Físicas y colisiones**

* Implementa **colisión real** con obstáculos y trenes (hitboxes)  
* Saltar y deslizar deben afectar al collider del jugador.  
* Si choca sin escudo: **Game Over** con animación/efecto (cámara shake, sonido opcional)

**Assets y recursos (sin romper el standalone)**

* Usa **assets públicos** (CC0/royalty-free) y enlázalos por CDN o incrústalos si son ligeros.  
* Si un asset falla, el juego debe seguir funcionando con **fallback** (formas básicas: cajas/cilindros).  
* Incluye:  
  * Personaje 3D (si no hay modelo fiable, usa cápsula estilizada).  
  * Obstáculos (vallas, barreras, trenes simplificados).  
  * Monedas (discos dorados).  
  * Efectos: partículas simples para turbo/monedas, bloom ligero si es posible.

**Tecnología recomendada**

* Usa **Three.js** (CDN) para 3D.  
* (Opcional) Usa una librería de física ligera (p. ej. Cannon-es) si no complica; si no, colisiones AABB manuales bien hechas.  
* Optimiza rendimiento: instancing o pooling de obstáculos/monedas.

**Cámara y “feel” Subway Surfers**

* Cámara con **follow suave** (lerp), ligera inclinación.  
* Carriles muy claros (3 lanes), cambios con “snap” y easing.  
* Feedback: shake al choque, flash al recoger, estelas en turbo.

**Requisitos de calidad**

* Debe abrirse en el navegador y **jugarse sin configuración extra**.  
* Incluye comentarios mínimos para entender estructura.  
* “Make sure everything works”: sin errores de consola, controles operativos, reinicio correcto, generación infinita estable.