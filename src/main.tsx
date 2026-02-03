import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// ============================================
// CONFIGURACIÓN DE SEGURIDAD - ACCESO INICIAL
// ============================================
const ACCESS_KEY = "cenitho-jeans";
const STORAGE_KEY = "cj_access_granted";

/**
 * Verifica si el usuario tiene acceso.
 * - Si viene con ?access=cenitho-jeans → guarda en localStorage y permite acceso
 * - Si ya tiene el valor en localStorage → permite acceso
 * - Si no tiene acceso → redirige a Google
 */
const checkAccess = (): boolean => {
  // Verificar si viene el parámetro en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const accessParam = urlParams.get("access");

  if (accessParam === ACCESS_KEY) {
    // Guardar en localStorage y limpiar la URL
    localStorage.setItem(STORAGE_KEY, "true");
    // Limpiar el parámetro de la URL sin recargar
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }

  // Verificar si ya tiene acceso guardado
  if (localStorage.getItem(STORAGE_KEY) === "true") {
    return true;
  }

  return false;
};

// Verificar acceso antes de renderizar
if (!checkAccess()) {
  // Sin acceso → redirigir a Google
  window.location.href = "https://www.google.com";
} else {
  // Con acceso → renderizar la app
  const container = document.getElementById("root");
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
