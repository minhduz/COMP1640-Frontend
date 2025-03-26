import axiosInstance from "../config";

const API_URL = "api/course";

export const fetchCourse = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    console.log("Get All Course successful!");
    return response.data;
  } catch (error) {
    console.error("Error fetching Course :", error);
    return [];
  }
};

export const createCourse = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating Course :", error);
    return error;
  }
};

export const updateCourse = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    console.log(id);
    return response.data;
  } catch (error) {
    console.error("Error updating Course :", error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    if (!id) throw new Error("Course  ID is undefined");
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting Course :", error);
    throw error;
  }
};
