import axiosInstance from "@/api";

const uploadApi = async (url, data, config) => {
  return await axiosInstance.post(url, data, config);
};

export { uploadApi };
