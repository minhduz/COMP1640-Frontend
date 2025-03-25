import React, { useState, useContext, useCallback } from "react";
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
  useTheme
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropImage";

const RegisterSchema = Yup.object().shape({
  first_name: Yup.string().required("Required"),
  last_name: Yup.string().required("Required"),
  phone_number: Yup.string().required("Required"),
  username: Yup.string().required("Required"),
  password: Yup.string().min(6, "Too Short!").required("Required"),
  avatar: Yup.mixed().required("Required"),
});

const RegisterPage = ({ email, type }) => {
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

  const handleSubmit = (values) => {
    console.log("Form Submitted Data:", values);
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
              initialValues={{
                first_name: "",
                last_name: "",
                username: "",
                phone_number: "",
                password: "",
                avatar: null,
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, setFieldValue }) => (
                <Form>
                  <Box mb={2}>
                    <TextField
                      label="Email"
                      value={email}
                      name="email"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        style: { color: "#fff" },
                      }}
                      sx={{
                        input: { color: "#fff" },
                        fieldset: { borderColor: "#fff" },
                        label: { color: "#fff" },
                      }}
                    />
                  </Box>

                  {["first_name", "last_name", "phone_number", "username", "password"].map((field) => (
                    <Box key={field} mb={2}>
                      <Field
                        as={TextField}
                        label={field.replace("_", " ").toUpperCase()}
                        name={field}
                        fullWidth
                        type={field === "password" ? "password" : "text"}
                        autoComplete="off"
                        error={errors[field] && touched[field]}
                        helperText={errors[field] && touched[field] ? errors[field] : ""}
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
                      />
                    </Box>
                  ))}

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
    </Box>
  );
};

export default RegisterPage;
