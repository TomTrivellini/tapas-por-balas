# Balas por Tapas - E-commerce + Juego

SPA de e-commerce hecha con React + Vite. Incluye catálogo, detalle, carrito con checkout y un mini juego táctico, todo con estado global vía Context.

## Funcionalidades
- Listado y detalle de productos con React Router.
- Carrito con cantidades, subtotales y total.
- Checkout con generación de orden en Firestore.
- Widget de carrito con contador de unidades.
- Renderizado condicional: loaders, carrito vacío y producto sin stock.

## Stack
- React + Vite
- React Router
- Firebase Firestore

## Configuración local
1) Instalar dependencias
```
npm install
```

2) Crear `.env` desde `.env.example` con tus credenciales de Firebase.

3) Iniciar el proyecto
```
npm run dev
```

## Firestore
Se utilizan dos colecciones:
- `products`: catálogo de productos.
- `orders`: órdenes generadas desde el checkout.

Para poblar la colección `products`, podés usar los datos locales en `src/data/shopItems.js` y llamar a:
```
seedProducts(getShopItems())
```
desde un componente temporal o desde la consola del navegador.

La función `seedProducts` vive en `src/data/shopService.js`.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
