import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
  Modal,
  Slider,
  useTheme,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropImage";
import { emailVerificationApi } from "../../api/user/pending";
import { registerUserApi } from "../../api/user/user";

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required("Required"),
  password: Yup.string().min(6, "Too Short!").required("Required"),
});

const RegisterPage = ({ email, type, token }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);


  // Image Cropping States
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [userData, setUserData] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCropArea(croppedAreaPixels);
  }, []);

  const handleFileChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setOpenCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async (setFieldValue) => {
    if (imageSrc && cropArea) {
      const croppedImageBlob = await getCroppedImg(imageSrc, cropArea);
      setCroppedImage(URL.createObjectURL(croppedImageBlob));
      setFieldValue("avatar", croppedImageBlob);
      setOpenCropper(false);
    }
  };

  // Fetch email verification data
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await emailVerificationApi(token);
        setUserData(response); // Store user data from API response
      } catch (error) {
        console.error("Error verifying email:", error);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  const [open, setOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (values) => {
    console.log("Form Submitted Data:", values);
  
    const formData = new FormData();
    formData.append("first_name", values.first_name);
    formData.append("last_name", values.last_name);
    formData.append("username", values.username);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("phone_number", values.phone_number);
  
    if (values.avatar) {
      
      formData.append("avatar", values.avatar);
    }
    
    try {
      
      const response = await registerUserApi(formData);
      console.log(response);
      
      if (response && response.status === 201) {  // Check for HTTP 201 status    
        console.log("Registration successful!");

      setModalMessage("Registration successful! Click OK to continue.");
      setOpen(true);
      setIsSuccess(true); // Set success flag
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (error) {
      setModalMessage(error.message || "An error occurred during registration.");
      setOpen(true);
    }
  };

  // Function to handle modal close
const handleModalClose = () => {
  setOpen(false);
  if (isSuccess) {
    navigate("/"); // Only navigate if success
  }
};

const [showPassword, setShowPassword] = useState(false);

const togglePasswordVisibility = () => {
  setShowPassword((prev) => !prev);
};

  return (
    <Box
      sx={{
        backgroundImage: 'url("/assets/image/harvard.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton
            onClick={colorMode.toggleColorMode}
            sx={{ position: "absolute", top: 16, right: 16 }}
          >
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              borderRadius: 2,
              textAlign: "center",
              width: "100%",
              backgroundColor: "#333",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "#fff", fontWeight: "bold" }}
            >
              Register
            </Typography>
            <Formik
              enableReinitialize
              initialValues={{
                email: userData?.email || "",
                first_name: userData?.first_name || "",
                last_name: userData?.last_name || "",
                username: userData?.username || "",
                phone_number: userData?.phone_number || "",
                password: "",
                avatar: null,
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, setFieldValue }) => (
                <Form>
                  {/* EMail */}
                  <Box mb={2}>
                    <Field as={TextField} label="Email" name="email" fullWidth InputProps={{
                        readOnly: true,
                        style: { color: "#fff" },
                      }}
                      InputLabelProps={{ style: { color: "#fff" } }}
                      sx={{
                        input: {
                          color: "#fff",
                          backgroundColor: "transparent !important",
                          WebkitBoxShadow: "0 0 0px 1000px #333 inset !important",
                          WebkitTextFillColor: "#fff !important",
                        },
                        fieldset: { borderColor: "#fff" },
                        label: { color: "#fff" },
                      
                      }}/>
                  </Box>

                  {/* First Name */}
                  <Box mb={2}>
                    <Field as={TextField} label="First Name" name="first_name" fullWidth InputProps={{
                        readOnly: true,
                        style: { color: "#fff" },
                      }}
                      InputLabelProps={{ style: { color: "#fff" } }}
                      sx={{
                        input: {
                          color: "#fff",
                          backgroundColor: "transparent !important",
                          WebkitBoxShadow: "0 0 0px 1000px #333 inset !important",
                          WebkitTextFillColor: "#fff !important",
                        },
                        fieldset: { borderColor: "#fff" },
                        label: { color: "#fff" },
                      }}/>
                  </Box>

                  {/* Last Name */}
                  <Box mb={2}>
                    <Field as={TextField} label="Last Name" name="last_name" fullWidth InputProps={{
                        readOnly: true,
                        style: { color: "#fff" },
                      }}
                      InputLabelProps={{ style: { color: "#fff" } }}
                      sx={{
                        input: {
                          color: "#fff",
                          backgroundColor: "transparent !important",
                          WebkitBoxShadow: "0 0 0px 1000px #333 inset !important",
                          WebkitTextFillColor: "#fff !important",
                        },
                        fieldset: { borderColor: "#fff" },
                        label: { color: "#fff" },
                      }}/>
                  </Box>

                  {/* Phone Number */}
                  <Box mb={2}>
                    <Field as={TextField} label="Phone Number" name="phone_number" fullWidth InputProps={{
                        readOnly: true,
                        style: { color: "#fff" },
                      }}
                      InputLabelProps={{ style: { color: "#fff" } }}
                      sx={{
                        input: {
                          color: "#fff",
                          backgroundColor: "transparent !important",
                          WebkitBoxShadow: "0 0 0px 1000px #333 inset !important",
                          WebkitTextFillColor: "#fff !important",
                        },
                        fieldset: { borderColor: "#fff" },
                        label: { color: "#fff" },
                      }}/>
                  </Box>

                  {/* Username */}
                  <Box mb={2}>
                    <Field
                      as={TextField}
                      label="Username"
                      name="username"
                      fullWidth
                      InputLabelProps={{ style: { color: "#fff" } }}
                      sx={{
                        input: {
                          color: "#fff",
                          backgroundColor: "transparent !important",
                          WebkitBoxShadow: "0 0 0px 1000px #333 inset !important",
                          WebkitTextFillColor: "#fff !important",
                        },
                        fieldset: { borderColor: "#fff" },
                        label: { color: "#fff" },
                      }}
                      error={errors.username && touched.username}
                      helperText={errors.username && touched.username ? errors.username : ""}
                    />
                  </Box>
                    
                  {/* Password */}
                  <Box mb={2}>
                    <Field
                      as={TextField}
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      InputLabelProps={{ style: { color: "#fff" } }}
                      sx={{
                        input: {
                          color: "#fff",
                          backgroundColor: "transparent !important",
                          WebkitBoxShadow: "0 0 0px 1000px #333 inset !important",
                          WebkitTextFillColor: "#fff !important",
                        },
                        fieldset: { borderColor: "#fff" },
                        label: { color: "#fff" },
                      }}
                      error={errors.password && touched.password}
                      helperText={errors.password && touched.password ? errors.password : ""}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={togglePasswordVisibility} edge="end">
                              {showPassword ? <VisibilityOff sx={{ color: "#fff" }} /> : <Visibility sx={{ color: "#fff" }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>


                  {/* Avatar Upload Section */}
                  <Box
                    mb={2}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      border: "1px solid #fff",
                      borderRadius: 1,
                      p: 1.5,
                    }}
                  >
                    <Typography variant="body1" sx={{ color: "#fff" }}>
                      Upload Avatar
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ color: "#fff", borderColor: "#fff", textTransform: "none", mt: 1 }}
                    >
                      Choose File
                      <input type="file" hidden accept="image/*" onChange={(event) => handleFileChange(event, setFieldValue)} />
                    </Button>
                    {croppedImage && <img src={croppedImage} alt="Cropped Avatar" style={{ width: 100, height: 100, borderRadius: "50%", marginTop: 10 }} />}
                  </Box>

                  {/* Cropper Modal */}
                  <Modal open={openCropper} onClose={() => setOpenCropper(false)}>
                    <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "400px", maxWidth: "600px", height: "450px", backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", flexDirection: "column", alignItems: "center", padding: 2, borderRadius: 2 }}>
                      <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                      <Slider value={zoom} min={1} max={3} step={0.1} onChange={(e, val) => setZoom(val)} />
                      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: 2 }}>
                        <Button onClick={() => handleCropConfirm(setFieldValue)} variant="contained" sx={{ backgroundColor: "white", color: "black", fontWeight: "bold", "&:hover": { backgroundColor: "#f0f0f0" } }}>
                          Crop & Save
                        </Button>
                      </Box>
                    </Box>
                  </Modal>

                  <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: "white", color: "black", fontWeight: "bold", "&:hover": { backgroundColor: "#f0f0f0" } }}>
                    Register
                  </Button>
                </Form>
              )}
            </Formik>
          </Paper>
        </Box>
      </Container>
      {/* Modal Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{modalMessage.includes("successful") ? "Success" : "Error"}</DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="primary">OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisterPage;
