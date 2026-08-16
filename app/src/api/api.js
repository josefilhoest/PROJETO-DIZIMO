import axios from "axios";

const api = axios.create({
  baseURL: "https://projeto-dizimo.onrender.com/api",
});

export default api;