# Set de iconos Launchly — linea flat minimalista

15 iconos SVG para reemplazar los emojis nativos del sitio. Todos comparten:
- viewBox 24x24
- stroke="currentColor" (heredan el color de texto del elemento padre via CSS)
- stroke-width 1.75, sin relleno
- Sin dependencias externas, listos para insertar como <img> o inline <svg>

## Mapeo — que reemplaza a que

| Archivo | Reemplaza | Nombre de seccion | Donde se usa en el sitio |
|---|---|---|---|
| store.svg | Reemplaza 🏪 | Locales y comercios | Tarjeta de segmento B2B |
| briefcase.svg | Reemplaza 💼 | Profesionales independientes | Tarjeta de segmento profesional |
| shopping-bag.svg | Reemplaza 🛍️ | Tiendas en redes sociales | Tarjeta de segmento B2C |
| shield-check.svg | Reemplaza 🔒 | Entrega garantizada | Badge de confianza |
| phone.svg | Reemplaza 📞 | Siempre disponibles | Badge de confianza |
| bolt.svg | Reemplaza ⚡ | Sin tecnicismos | Badge de confianza |
| coin.svg | Reemplaza 💰 | Precio de fundador | Early Access - beneficio |
| star.svg | Reemplaza ⭐ | Atencion prioritaria | Early Access - beneficio |
| snowflake.svg | Reemplaza 🧊 | Precio congelado | Early Access - beneficio |
| refresh.svg | Reemplaza 🔁 | Revisiones extra | Early Access - beneficio |
| globe.svg | Reemplaza 🌐 | Pagina web | Chatbot Bolty - opcion de necesidad |
| search.svg | Reemplaza 🔍 | Aparecer en Google | Chatbot Bolty - opcion de necesidad |
| chat.svg | Reemplaza 💬 | WhatsApp automatizado | Chatbot Bolty - opcion de necesidad |
| rocket.svg | Reemplaza 🚀 | Todo | Chatbot Bolty - opcion de necesidad |
| sparkle.svg | Reemplaza ✨ | Otro | Chatbot Bolty - tipo de negocio |

## Como aplicarlos (dos formas)

**Opcion A — como <img> (mas simple, no hereda color de texto):**
```html
<img src="assets/icons/store.svg" alt="" width="32" height="32">
```
Para forzar un color especifico con <img>, hay que aplicar un filtro CSS o usar la Opcion B.

**Opcion B — inline en el HTML (recomendado, hereda color con CSS):**
Copia el contenido del .svg directo en el HTML donde estaba el emoji, y controla el color con:
```css
.icon { color: #1E2A4A; width: 32px; height: 32px; }
```

## Nota sobre color

Los iconos no llevan color fijo — heredan el `color` CSS del elemento contenedor via `currentColor`.
Esto permite usar el mismo icono en distintos contextos (fondo oscuro, fondo claro, hover) sin duplicar archivos.
