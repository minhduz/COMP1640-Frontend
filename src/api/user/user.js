import axiosInstance from "../config";

const loginApi = async (email, password) => {
  try {
    const response = await axiosInstance.post("/api/user/login", {
      email,
      password,
    });

    const { access_token, refresh_token } = response.data;

    // Store tokens in local storage
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    console.log("Login successful!");
    return response.data;
  } catch (error) {
    console.error("Error during login:", error.response?.data || error.message);
    return null;
  }
};

const getUserInfoApi = async () => {
  try {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      throw new Error("Access token not found");
    }

    const response = await axiosInstance.get(`/api/user/info`, {
      params: { access_token },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user info:",
      error.response?.data || error.message
    );
    return null;
  }
};

export { loginApi, getUserInfoApi };
