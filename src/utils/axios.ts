import axios from "axios";

// ============================================
// CONFIGURACIÓN DE AXIOS CON SEGURIDAD
// ============================================

// URL del backend - usa variable de entorno en producción
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:30040";

// Token de API - usa variable de entorno en producción
const API_KEY = import.meta.env.VITE_API_KEY || "cj_sk_2024_x7k9m2p4q5r6s8t9";

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token en CADA request
instance.interceptors.request.use(
  (config) => {
    config.headers["X-API-Key"] = API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("API Key inválida o no proporcionada");
      // Opcional: limpiar localStorage y redirigir
      // localStorage.removeItem("cj_access_granted");
      // window.location.href = "https://www.google.com";
    }
    return Promise.reject(error);
  }
);

const Axios = {
  instance,
};

export default Axios;
