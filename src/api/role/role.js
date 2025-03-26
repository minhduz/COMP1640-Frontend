import axiosInstance from "../config";

const role_base_api = "api/role";

// Get all roles
const getAllRole = async () => {
  try {
    const response = await axiosInstance.get(`${role_base_api}`);
    console.log("Get All Roles successful!");
    return response.data;
  } catch (error) {
    console.error(
      "Error getting roles:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Get role by ID
const getRoleById = async (id) => {
  try {
    const response = await axiosInstance.get(`${role_base_api}/${id}`);
    console.log("Get Role by ID successful!");
    return response.data;
  } catch (error) {
    console.error(
      "Error getting role by ID:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Get permissions by role ID
const getPermissionsByRoleId = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${role_base_api}/permission/${id}`
    );
    console.log("Get Permissions by Role ID successful!");
    return response.data;
  } catch (error) {
    console.error(
      "Error getting permissions by role ID:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Create a new role
const createRole = async (roleData) => {
  try {
    const response = await axiosInstance.post(`${role_base_api}`, roleData);
    console.log("Role created successfully!");
    return response.data;
  } catch (error) {
    console.error(
      "Error creating role:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Update an existing role
const updateRole = async (id, roleData) => {
  try {
    const response = await axiosInstance.patch(
      `${role_base_api}/${id}`,
      roleData
    );
    console.log("Role updated successfully!");
    return response.data;
  } catch (error) {
    console.error(
      "Error updating role:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Delete a role
const deleteRole = async (id) => {
  try {
    await axiosInstance.delete(`${role_base_api}/${id}`);
    console.log("Role deleted successfully!");
    return true;
  } catch (error) {
    console.error(
      "Error deleting role:",
      error.response?.data || error.message
    );
    return false;
  }
};

export {
  getAllRole,
  getRoleById,
  getPermissionsByRoleId,
  createRole,
  updateRole,
  deleteRole,
};
