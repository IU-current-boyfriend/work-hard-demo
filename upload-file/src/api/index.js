import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 0,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default axiosInstance;
