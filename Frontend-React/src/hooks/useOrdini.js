import { getOrdini } from "../api/orders.js";
import { useAsync } from "./useAsync.js";
import { useAuth } from "./useAuth.js";

export function useOrdini() {
  const { user } = useAuth();
  return useAsync(() => getOrdini(user.id), String(user.id));
}
