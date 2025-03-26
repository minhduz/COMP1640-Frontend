import React, { useContext, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
  useTheme,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import TwitterIcon from "@mui/icons-material/Twitter";
import {loginApi} from "../../api/user/user";  // Import the login API function

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too Short!").required("Required"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isAuthenticated = localStorage.getItem("access_token");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

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
            sx={{ padding: 4, borderRadius: 2, textAlign: "center", width: "100%", backgroundColor: "#333" }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: "#f5f5f5", fontWeight: "bold" }}>
              Login
            </Typography>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={async (values, { setSubmitting }) => {
                console.log("Login Values", values);
                const response = await loginApi(values.email, values.password);
                
                if (response) {
                  navigate("/dashboard");  // Redirect on successful login
                } else {
                  alert("Login failed. Please check your credentials.");
                }
                
                setSubmitting(false);
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Box mb={2} sx={{ position: "relative" }}>
                    <Field
                      as={TextField}
                      label="Email"
                      name="email"
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
                      error={errors.email && touched.email}
                      helperText={errors.email && touched.email ? errors.email : ""}
                    />
                  </Box>
                  <Box mb={2} sx={{ position: "relative" }}>
                    <Field
                      as={TextField}
                      label="Password"
                      name="password"
                      type="password"
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
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: 2,
                      fontWeight: "bold",
                      backgroundColor: "#fff",
                      color: "#000",
                      '&:hover': {
                        boxShadow: "0px 9px 10px -2px rgba(0, 0, 0, 0.55)",
                      },
                    }}
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                    sx={{ marginTop: 2, color: "#f5f5f5" }}
                  >
                    or login with
                  </Typography>
                  <Box display="flex" justifyContent="center" gap={1} sx={{ marginTop: 1 }}>
                    <IconButton sx={{ backgroundColor: "#4866a8", color: "#fff" }}>
                      <FacebookIcon />
                    </IconButton>
                    <IconButton sx={{ backgroundColor: "#da3f34", color: "#fff" }}>
                      <GoogleIcon />
                    </IconButton>
                    <IconButton sx={{ backgroundColor: "#33ccff", color: "#fff" }}>
                      <TwitterIcon />
                    </IconButton>
                  </Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                    sx={{ marginTop: 2, color: "#f5f5f5" }}
                  >
                    Don't have an account? <a href="/register" style={{ color: "#f5f5f5", fontWeight: "bold" }}>Register here</a>
                  </Typography>
                </Form>
              )}
            </Formik>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
