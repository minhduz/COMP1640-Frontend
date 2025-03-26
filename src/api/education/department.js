import axiosInstance from "../config";

const API_URL = "/api/department";

// Lấy danh sách phòng ban
export const fetchDepartments = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data.map((dept, index) => ({
      id: dept.id || index + 1,
      name: dept.name,
      description: dept.description,
      status: dept.is_deleted ? "Inactive" : "Active",
    }));
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

// Tạo mới phòng ban
export const createDepartment = async (data) => {
  try {
    await axiosInstance.post(API_URL, data);
  } catch (error) {
    console.error("Error creating department:", error);
  }
};

// Cập nhật phòng ban (cả trạng thái Active/Inactive)
export const updateDepartment = async (id, data) => {
  try {
    console.log(data);
    
    await axiosInstance.put(`${API_URL}/${id}`, data);
  } catch (error) {
    console.error("Error updating department:", error);
  }
};
