import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (producto) => {

    setCarrito((carritoAnterior) => {

      // El backend FastAPI devuelve `id` (no `_id`)
      const idProducto = producto.id ?? producto._id;

      const productoExistente = carritoAnterior.find(
        (item) => item.id === idProducto
      );

      if (productoExistente) {

        return carritoAnterior.map((item) =>
          item.id === idProducto
            ? {
                ...item,
                cantidad: item.cantidad + 1
              }
            : item
        );

      }

      return [
        ...carritoAnterior,
        {
          ...producto,
          id: idProducto,
          cantidad: 1
        }
      ];

    });

  };

  const aumentarCantidad = (id) => {

    setCarrito((carritoAnterior) =>
      carritoAnterior.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: item.cantidad + 1
            }
          : item
      )
    );

  };

  const disminuirCantidad = (id) => {

    setCarrito((carritoAnterior) =>
      carritoAnterior
        .map((item) =>
          item.id === id
            ? {
                ...item,
                cantidad: item.cantidad - 1
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );

  };

  const eliminarProducto = (id) => {

    setCarrito((carritoAnterior) =>
      carritoAnterior.filter(
        (item) => item.id !== id
      )
    );

  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const cantidadTotal = carrito.reduce(
    (total, producto) =>
      total + producto.cantidad,
    0
  );

  const precioTotal = carrito.reduce(
    (total, producto) =>
      total + producto.precio * producto.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        aumentarCantidad,
        disminuirCantidad,
        eliminarProducto,
        vaciarCarrito,
        cantidadTotal,
        precioTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CartContext);
}