import { getScarpa } from "../api/products.js";
import { useAsync } from "./useAsync.js";

export function useScarpa(id) {
  return useAsync(() => getScarpa(id), String(id));
}
