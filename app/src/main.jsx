import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

// ========================================
// INICIAR APLICAÇÃO REACT
// ========================================

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ========================================
// REGISTRAR SERVICE WORKER DO PWA
// ========================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registro) => {
        console.log(
          "Service Worker registrado com sucesso:",
          registro.scope
        );
      })
      .catch((erro) => {
        console.error(
          "Erro ao registrar Service Worker:",
          erro
        );
      });
  });
}