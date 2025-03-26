import axiosInstance from "../config";

const role_base_api = "api/role";

const getAllRole = async () => {
  try {
    const response = await axiosInstance.get(`${role_base_api}`);
    console.log("Get All Role successful!");
    return response.data;
  } catch (error) {
    console.error("Error during login:", error.response?.data || error.message);
    return null;
  }
};

export { getAllRole };
