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

export { emailVerificationApi };
