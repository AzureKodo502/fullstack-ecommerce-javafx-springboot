import { IconButton, Tooltip } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

/** Alterna tema chiaro/scuro. Se la scelta è "sistema", parte da quello che il sistema sta usando. */
export default function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();

  // Prima del montaggio MUI non conosce ancora la modalità: non si mostra un'icona sbagliata.
  if (!mode) return null;

  const inUso = mode === "system" ? systemMode : mode;
  const etichetta = inUso === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro";

  return (
    <Tooltip title={etichetta}>
      <IconButton color="inherit" onClick={() => setMode(inUso === "dark" ? "light" : "dark")} aria-label={etichetta}>
        {inUso === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
