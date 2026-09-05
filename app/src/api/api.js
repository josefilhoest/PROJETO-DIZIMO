import axios from "axios";

const api = axios.create({
  baseURL: "https://projeto-dizimo.onrender.com/api",
  //baseURL: "http://localhost:8080/api",
});



// Adiciona o token automaticamente em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;