import axiosInstance from "../config";

const emailVerificationApi = async (token) => {
  try {
    const response = await axiosInstance.get(
      `/api/pending/email_verify?token=${token}`
    );
    return response.data; // This should return the pending user details
  } catch (error) {
    console.error(
      "Error during email verification:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ Create a pending user
const createPendingUserApi = async (userData) => {
  try {
    const response = await axiosInstance.post("/api/pending", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating pending user:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ Update a pending user by ID
const updatePendingUserApi = async (id, updatedData) => {
  try {
    const response = await axiosInstance.patch(
      `/api/pending/${id}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating pending user:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ Delete a pending user by ID
const deletePendingUserApi = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/pending/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting pending user:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ Get all pending users
const getAllPendingUsersApi = async () => {
  try {
    const response = await axiosInstance.get("/api/pending");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching pending users:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ Read file (upload file to backend)
const readFileExcelApi = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/api/pending/read", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("File upload response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Send email
const sendEmailApi = async (emailData) => {
  try {
    const response = await axiosInstance.post("/api/pending/send", emailData);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    return null;
  }
};

export {
  emailVerificationApi,
  getAllPendingUsersApi,
  createPendingUserApi,
  updatePendingUserApi,
  deletePendingUserApi,
  readFileExcelApi,
  sendEmailApi,
};
