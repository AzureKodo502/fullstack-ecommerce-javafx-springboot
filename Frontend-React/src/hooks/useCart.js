import { useContext } from "react";
import { CartContext } from "../context/CartContext.js";

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve essere usato dentro <CartProvider>");
  }
  return context;
}
