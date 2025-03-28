import axiosInstance from "../config";

const API_URL = "api/department";

export const fetchDepartments = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    console.log("Get All Department successful!");
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

export const createDepartment = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating department:", error);
    return error;
  }
};

export const updateDepartment = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    console.log(id);

    return response.data;
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    if (!id) throw new Error("Department ID is undefined");
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};
