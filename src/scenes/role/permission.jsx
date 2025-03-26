import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Modal,
  Switch,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import { getAllRole, getPermissionsByRoleId } from "../../api/role/role";
import { setPermissionStatus } from "../../api/role/permission";

const Permission = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const roleCategories = ["Role", "Permission"];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roleData = await getAllRole();
        setRoles(roleData || []);
      } catch (error) {
        console.error("Failed to fetch roles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleRoleClick = async (role) => {
    setSelectedRole(role);
    setModalOpen(true);
    setExpandedAccordion(null);

    try {
      const permissionsData = await getPermissionsByRoleId(role._id);
      const categorizedPermissions = { Role: [], Permission: [], Other: [] };

      permissionsData.forEach((perm) => {
        const category =
          roleCategories.find((cat) =>
            perm.permission_id.name.toLowerCase().includes(cat.toLowerCase())
          ) || "Other";
        categorizedPermissions[category].push(perm);
      });

      setPermissions(categorizedPermissions);
    } catch (error) {
      console.error("Failed to fetch permissions", error);
    }
  };

  const handleTogglePermission = (category, index) => {
    setPermissions((prevPermissions) => {
      const updatedCategory = [...prevPermissions[category]];
      updatedCategory[index] = {
        ...updatedCategory[index],
        is_permitted: !updatedCategory[index].is_permitted,
      };
      return { ...prevPermissions, [category]: updatedCategory };
    });
  };

  const handleToggleAllPermissions = (category) => {
    setPermissions((prevPermissions) => {
      const allEnabled = prevPermissions[category].every(
        (perm) => perm.is_permitted
      );
      const updatedCategory = prevPermissions[category].map((perm) => ({
        ...perm,
        is_permitted: !allEnabled,
      }));
      return { ...prevPermissions, [category]: updatedCategory };
    });
  };

  const handleApplyPermissions = async () => {
    if (!selectedRole) return;
    setIsApplying(true);

    const grantedPermissions = [];
    const revokedPermissions = [];

    Object.values(permissions).forEach((category) => {
      category.forEach((perm) => {
        if (perm.is_permitted) {
          grantedPermissions.push(perm.permission_id._id);
        } else {
          revokedPermissions.push(perm.permission_id._id);
        }
      });
    });

    try {
      if (grantedPermissions.length > 0) {
        await setPermissionStatus(selectedRole._id, grantedPermissions, true);
      }
      if (revokedPermissions.length > 0) {
        await setPermissionStatus(selectedRole._id, revokedPermissions, false);
      }
      console.log("Permissions successfully updated.");
    } catch (error) {
      console.error("Error updating permissions", error);
    } finally {
      setIsApplying(false);
      setModalOpen(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="PERMISSIONS" subtitle="Manage user permissions" />

      {/* Responsive grid for roles */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",    // 1 column on extra-small screens
            sm: "repeat(2, 1fr)", // 2 columns on small screens
            md: "repeat(3, 1fr)", // 3 columns on medium+ screens
          },
          gap: 2,
          mt: 4,
        }}
      >
        {loading ? (
          <Box
            gridColumn="span 3"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress color="secondary" />
          </Box>
        ) : roles.length > 0 ? (
          roles.map((role) => (
            <Box
              key={role._id}
              bgcolor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={() => handleRoleClick(role)}
              sx={{
                cursor: "pointer",
                p: 2,
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { bgcolor: colors.primary[500] },
              }}
            >
              <StatBox
                title={role.name}
                subtitle="Permissions"
                icon={
                  <ManageAccountsOutlinedIcon
                    sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                  />
                }
              />
            </Box>
          ))
        ) : (
          <Box textAlign="center" color={colors.grey[100]}>
            No roles available.
          </Box>
        )}
      </Box>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 450 },
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Role Permissions: {selectedRole?.name}
          </Typography>

          {Object.keys(permissions).length > 0 ? (
            Object.entries(permissions).map(([category, perms]) => (
              <Accordion
                key={category}
                expanded={expandedAccordion === category}
                onChange={() =>
                  setExpandedAccordion(
                    expandedAccordion === category ? null : category
                  )
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                  >
                    {category.toUpperCase()} PERMISSIONS
                  </Typography>
                  <Switch
                    checked={perms.every((perm) => perm.is_permitted)}
                    onChange={() => handleToggleAllPermissions(category)}
                    color="primary"
                    sx={{ marginLeft: "auto" }}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  {perms.map((perm, index) => (
                    <Box
                      key={perm._id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                      pl={2}
                    >
                      <Typography>{perm.permission_id.name}</Typography>
                      <Switch
                        checked={perm.is_permitted}
                        onChange={() =>
                          handleTogglePermission(category, index)
                        }
                        color="primary"
                      />
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography>No permissions available.</Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, bgcolor: "primary.main" }}
            onClick={handleApplyPermissions}
            disabled={isApplying}
          >
            {isApplying ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Apply"
            )}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Permission;
