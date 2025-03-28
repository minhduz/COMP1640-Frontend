import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SchoolIcon from '@mui/icons-material/School';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import { getUserInfoApi } from "../../api/user/user";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Detect mobile devices
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for collapsing the sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Automatically collapse if on mobile, expand otherwise
    setIsCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    // Fetch user data on mount
    const fetchUser = async () => {
      const userData = await getUserInfoApi();
      setUser(userData); 
    };
    fetchUser();
  }, []);

  return (
    <Box
      sx={{
        height: "1200px", // Full height of the viewport
        display: "flex",
        flexDirection: "column",
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
          height: "100%", // Ensure the sidebar fills its container
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {/* Only show title and close icon when not collapsed */}
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  E - TUTORING
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* USER INFO */}
          {!isCollapsed && user && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={user.avatar_path 
                    ? `${process.env.REACT_APP_API_BASE_URL}/${user.avatar_path}` 
                    : "../../assets/user.png"} 
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user.username}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {user.first_name + " " + user.last_name}
                </Typography>
              </Box>
            </Box>
          )}

          {/* MENU ITEMS */}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* Show the Permission heading only if not on mobile */}
            {user &&
              user.permissions &&
              (user.permissions.includes("view_roles") ||
                user.permissions.includes("view_permissions")) &&
              !isMobile && (
                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{ m: "15px 0 5px 20px" }}
                >
                  Permission
                </Typography>
              )}

            {/* Conditionally render Role & Permission items */}
            {user && user.permissions && user.permissions.includes("view_roles") && (
              <Item
                title="Role"
                to="/role"
                icon={<ManageAccountsOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}
            {user && user.permissions && user.permissions.includes("view_permissions") && (
              <Item
                title="Permission"
                to="/permission"
                icon={<KeyOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            {/* Show the Data heading only if not on mobile */}
            {!isMobile && (
              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Education
              </Typography>
            )}
            <Item
              title="Department"
              to="/department"
              icon={<ApartmentIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="course Category"
              to="/courseCategory"
              icon={<LibraryBooksIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Course"
              to="/Course"
              icon={<MenuBookIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Classroom"
              to="/Classroom"
              icon={<SchoolIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Calendar"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Invoices Balances"
              to="/invoices"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            {/* Show the Pages heading only if not on mobile */}
            {!isMobile && (
              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                User
              </Typography>
            )}
            <Item
              title="Pending User"
              to="/pending"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
