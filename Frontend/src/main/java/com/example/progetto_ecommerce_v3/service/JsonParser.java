package com.example.progetto_ecommerce_v3.service;

import com.example.progetto_ecommerce_v3.Model.Scarpe;
import com.example.progetto_ecommerce_v3.Model.Utente;

import java.util.ArrayList;
import java.util.List;

public class JsonParser {

    public static List<Scarpe> parseScarpeList(String json) {
        List<Scarpe> lista = new ArrayList<>();
        if (json == null || json.isEmpty() || json.equals("[]")) return lista;

        if (json.startsWith("[")) json = json.substring(1, json.length() - 1);
        String[] oggetti = json.split("},\\{");

        for (String obj : oggetti) {
            obj = obj.replace("{", "").replace("}", "");

            String id = extractValue(obj, "id");
            String nome = extractValue(obj, "nome");
            String prezzo = extractValue(obj, "prezzo");
            String descrizione = extractValue(obj, "descrizione");
            String marchio = extractValue(obj, "marchio");
            String taglia = extractValue(obj, "tagliaDisponibile");
            String modello = extractValue(obj, "modello");

            // Leggiamo l'URL dell'immagine reale
            String imageUrl = extractValue(obj, "imageUrl");

            // Usiamo il Costruttore NUOVO
            lista.add(new Scarpe(id, nome, prezzo, descrizione, marchio, taglia, modello, imageUrl));
        }
        return lista;
    }

    public static Utente parseUtente(String json) {
        if (json == null || json.isEmpty() || json.contains("\"status\":401")) return null;

        json = json.replace("{", "").replace("}", "");

        // Estrai i campi. Da quando il backend risponde con {"token":...,"user":{...}}
        // invece dell'utente nudo, questi campi vivono dentro "user": ma dato che le
        // graffe sono già state rimosse la ricerca per chiave funziona comunque,
        // la struttura non è più annidata a livello di stringa.
        String id = extractValue(json, "id");
        String nome = extractValue(json, "nome");
        String cognome = extractValue(json, "cognome");
        String email = extractValue(json, "email");

        // Se l'ID è nullo o vuoto, qualcosa è andato storto
        if (id.equals("N/A") || email.equals("N/A")) return null;

        return new Utente(id, nome, cognome, email);
    }

    /**
     * Estrae il token JWT dalla risposta di {@code /api/auth/login} e
     * {@code /api/auth/register}, che dal backend arriva come
     * {@code {"token":"...","user":{...}}}.
     * @return il token, oppure {@code null} se la risposta non ne contiene uno
     * (es. risposta d'errore).
     */
    public static String parseToken(String json) {
        if (json == null || json.isEmpty()) return null;
        String token = extractValue(json.replace("{", "").replace("}", ""), "token");
        return token.equals("N/A") ? null : token;
    }

    // Metodo specifico per estrarre le scarpe dalla risposta del Carrello del Backend
    public static List<Scarpe> parseCarrello(String json) {
        List<Scarpe> lista = new ArrayList<>();
        if (json == null || json.isEmpty() || json.equals("[]")) return lista;

        if (json.startsWith("[")) json = json.substring(1, json.length() - 1);
        String[] items = json.split("},\\{"); // Divide i CartItem

        for (String item : items) {
            int startScarpa = item.indexOf("\"scarpa\":");
            if (startScarpa == -1) continue;

            // Prendiamo il contenuto della graffa della scarpa
            String scarpaJson = item.substring(startScarpa + "\"scarpa\":".length());
            // Pulizia di eventuali graffe di chiusura esterne
            if (scarpaJson.endsWith("}")) scarpaJson = scarpaJson.substring(0, scarpaJson.length()-1);

            // Parsing dei dati della scarpa
            String id = extractValue(scarpaJson, "id");
            String nome = extractValue(scarpaJson, "nome");
            String prezzo = extractValue(scarpaJson, "prezzo");
            String descrizione = extractValue(scarpaJson, "descrizione");
            String marchio = extractValue(scarpaJson, "marchio");
            String taglia = extractValue(scarpaJson, "tagliaDisponibile");
            String modello = extractValue(scarpaJson, "modello");
            String imageUrl = extractValue(scarpaJson, "imageUrl");

            lista.add(new Scarpe(id, nome, prezzo, descrizione, marchio, taglia, modello, imageUrl));
        }
        return lista;
    }

    private static String extractValue(String jsonObject, String key) {
        String searchKey = "\"" + key + "\":";
        int start = jsonObject.indexOf(searchKey);
        if (start == -1) return "N/A";
        start += searchKey.length();
        boolean isString = jsonObject.charAt(start) == '"';
        if (isString) start++;
        int end;
        if (isString) {
            end = jsonObject.indexOf("\"", start);
        } else {
            int commaIndex = jsonObject.indexOf(",", start);
            end = (commaIndex == -1) ? jsonObject.length() : commaIndex;
        }
        return jsonObject.substring(start, end);
    }
}