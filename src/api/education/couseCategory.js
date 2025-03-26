import axiosInstance from "../config";

const API_URL = "api/course_category";

export const fetchCourseCategory = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    console.log("Get All CourseCategory successful!");
    return response.data;
  } catch (error) {
    console.error("Error fetching Course Category:", error);
    return [];
  }
};

export const createCourseCategory = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating Course Category:", error);
    return error;
  }
};

export const updateCourseCategory = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    console.log(id);
    return response.data;
  } catch (error) {
    console.error("Error updating Course Category:", error);
    throw error;
  }
};

export const deleteCourseCategory = async (id) => {
  try {
    if (!id) throw new Error("Course Category ID is undefined");
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting Course Category:", error);
    throw error;
  }
};
