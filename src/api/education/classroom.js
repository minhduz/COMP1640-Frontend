import axiosInstance from "../config";

const API_URL = "api/Classroom";

export const fetchClassroom = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    console.log("Get All Classroom successful!");
    return response.data;
  } catch (error) {
    console.error("Error fetching Classroom :", error);
    return [];
  }
};

export const createClassroom = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating Classroom :", error);
    return error;
  }
};

export const updateClassroom = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`${API_URL}/${id}`, data);
    console.log(id);
    return response.data;
  } catch (error) {
    console.error("Error updating Classroom :", error);
    throw error;
  }
};

export const deleteClassroom = async (id) => {
  try {
    if (!id) throw new Error("Classroom  ID is undefined");
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting Classroom :", error);
    throw error;
  }
};
