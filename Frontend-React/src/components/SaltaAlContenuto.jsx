import { Link } from "@mui/material";

/**
 * Primo elemento raggiungibile col tasto Tab: permette a chi naviga da
 * tastiera o con uno screen reader di saltare la barra di navigazione e
 * andare dritto al contenuto. Invisibile finché non riceve il focus.
 * Si gestisce col click (e non con un semplice #ancora) per non toccare
 * l'URL: il router lo interpreterebbe come una navigazione.
 */
export default function SaltaAlContenuto() {
  function handleClick(event) {
    event.preventDefault();
    document.getElementById("contenuto")?.focus();
  }

  return (
    <Link
      href="#contenuto"
      onClick={handleClick}
      sx={{
        position: "absolute",
        left: 8,
        top: -48,
        zIndex: (theme) => theme.zIndex.tooltip,
        px: 2,
        py: 1,
        borderRadius: 1,
        bgcolor: "background.paper",
        "&:focus": { top: 8 },
      }}
    >
      Salta al contenuto
    </Link>
  );
}
