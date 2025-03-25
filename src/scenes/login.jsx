import React, { useContext, useEffect } from "react";
import { TextField, Button, Container, Box, Typography, Paper, IconButton, useTheme } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too Short!").required("Required"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const isAuthenticated = localStorage.getItem("authToken");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    !isAuthenticated && (
      <Container component="main" maxWidth="xs">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <IconButton onClick={colorMode.toggleColorMode} sx={{ position: "absolute", top: 16, right: 16 }}>
            {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          </IconButton>
          <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, textAlign: "center", width: "100%" }}>
            <Typography variant="h4" gutterBottom>
              Login
            </Typography>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={(values) => {
                console.log("Login Values", values);
                localStorage.setItem("authToken", "dummyToken");
                navigate("/dashboard");
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  <Box mb={2}>
                    <Field
                      as={TextField}
                      label="Email"
                      name="email"
                      fullWidth
                      error={errors.email && touched.email}
                      helperText={errors.email && touched.email ? errors.email : ""}
                    />
                  </Box>
                  <Box mb={2}>
                    <Field
                      as={TextField}
                      label="Password"
                      name="password"
                      type="password"
                      fullWidth
                      error={errors.password && touched.password}
                      helperText={errors.password && touched.password ? errors.password : ""}
                    />
                  </Box>
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    Login
                  </Button>
                </Form>
              )}
            </Formik>
          </Paper>
        </Box>
      </Container>
    )
  );
};

export default LoginPage;