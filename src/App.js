import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";

// Education
import Department from "./scenes/education/department";
import CourseCategory from "./scenes/education/courseCategory";
import Course from "./scenes/education/course";

// Role
import Role from "./scenes/role/role";
import Permission from "./scenes/role/permission";

import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";

// User
import LoginPage from "./scenes/login/login";
import RegisterPage from "./scenes/login/register";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();
  const accessToken = localStorage.getItem("access_token");

  // Check if user is on public routes
  const isLoginPage = location.pathname === "/";
  const searchParams = new URLSearchParams(location.search);
  const registerToken = searchParams.get("token");
  const isRegisterPage = location.pathname === "/register" && registerToken;

  // Redirect users without access
  if (!accessToken && !isLoginPage && !isRegisterPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isLoginPage ? (
          <LoginPage />
        ) : isRegisterPage ? (
          <RegisterPage
            email="user@example.com"
            type="Student"
            token={registerToken}
          />
        ) : (
          <div className="app">
            <Sidebar isSidebar={isSidebar} />
            <main className="content">
              <Topbar setIsSidebar={setIsSidebar} />
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/team" element={<Team />} />
                <Route path="/contacts" element={<Contacts />} />

                {/* Education */}
                <Route path="/department" element={<Department />} />
                <Route path="/courseCategory" element={<CourseCategory />} />
                <Route path="/course" element={<Course />} />

                {/* Role */}
                <Route path="/role" element={<Role />} />
                <Route path="/permission" element={<Permission />} />

                <Route path="/invoices" element={<Invoices />} />
                <Route path="/form" element={<Form />} />
                <Route path="/bar" element={<Bar />} />
                <Route path="/pie" element={<Pie />} />
                <Route path="/line" element={<Line />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/geography" element={<Geography />} />
              </Routes>
            </main>
          </div>
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
