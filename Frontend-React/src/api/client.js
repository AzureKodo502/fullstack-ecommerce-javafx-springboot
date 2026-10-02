const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Legge il token JWT salvato dopo il login (lo scriverà AuthContext in Fase 2).
 * Isolato in una funzione a sé perché è l'unico punto che tocca localStorage
 * direttamente: se in futuro cambia lo storage, cambia solo qui.
 */
function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    // localStorage può non essere disponibile (es. modalità privata restrittiva).
    return null;
  }
}

/**
 * Client HTTP minimale verso il Backend: stesso ruolo di ApiClient.java nel
 * client JavaFX — un solo punto che costruisce l'URL, allega il token quando
 * presente e normalizza gli errori, così le pagine non ripetono questa logica.
 */
async function request(path, { method = "GET", body } = {}) {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    const error = new Error(message || `Errore HTTP ${response.status}`);
    error.status = response.status; // permette a chi chiama di distinguere es. 404 da 500
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
};
