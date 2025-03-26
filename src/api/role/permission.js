import axiosInstance from "../config";

const permission_base_api = "api/permission";

// Set multiple permission statuses for a role
const setPermissionStatus = async (role_id, permission_ids, is_permitted) => {
  try {
    const response = await axiosInstance.post(
      `${permission_base_api}/is_permitted`,
      { role_id, permission_ids, is_permitted }
    );
    console.log("Permission statuses updated successfully!");
    return response.data;
  } catch (error) {
    console.error(
      "Error updating permission statuses:",
      error.response?.data || error.message
    );
    return null;
  }
};

export { setPermissionStatus };
