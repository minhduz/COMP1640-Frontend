import { Box, CircularProgress, Modal, Switch, Typography, Button, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import { useTheme } from "@mui/material";
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { useEffect, useState } from "react";
import { getAllRole, getPermissionsByRoleId } from "../../api/role/role";

const Permission = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  const role_categories = ["Role", "Permission"];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roleData = await getAllRole();
        setRoles(roleData || []);
      } catch (error) {
        console.error("Failed to fetch roles", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleRoleClick = async (role) => {
    setSelectedRole(role);
    setModalOpen(true);
    setExpandedAccordion(null); // Close all accordions when modal opens

    try {
      const permissionsData = await getPermissionsByRoleId(role._id);
      const categorizedPermissions = { Role: [], Permission: [], Other: [] };

      permissionsData.forEach((perm) => {
        const category = role_categories.find(cat =>
          perm.permission_id.name.toLowerCase().includes(cat.toLowerCase())
        ) || "Other";

        categorizedPermissions[category].push(perm);
      });

      setPermissions(categorizedPermissions);
    } catch (error) {
      console.error("Failed to fetch permissions", error);
      setPermissions({});
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

  return (
    <Box m="20px">
      <Header title="PERMISSIONS" subtitle="Manage user permissions" />
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="140px" gap="20px" mt="40px">
        {loading ? (
          <Box gridColumn="span 12" display="flex" justifyContent="center" alignItems="center">
            <CircularProgress color="secondary" />
          </Box>
        ) : roles.length > 0 ? (
          roles.map((role, index) => (
            <Box
              key={role._id || index}
              gridColumn="span 4"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={() => handleRoleClick(role)}
              sx={{ cursor: "pointer", p: 2, borderRadius: 2, transition: "0.3s", "&:hover": { backgroundColor: colors.primary[500] } }}
            >
              <StatBox
                title={role.name}
                subtitle="Permissions"
                icon={<ManageAccountsOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              />
            </Box>
          ))
        ) : (
          <Box gridColumn="span 12" textAlign="center" color={colors.grey[100]}>No roles available.</Box>
        )}
      </Box>

      {/* Modal for role permissions */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 450, maxHeight: "80vh", overflowY: "auto", bgcolor: "background.paper", boxShadow: 24, p: 4, borderRadius: 2 }}>
          <Typography variant="h6" mb={2}>Role Permissions: {selectedRole?.name}</Typography>
          {Object.keys(permissions).length > 0 ? (
            Object.entries(permissions).map(([category, perms]) => (
              <Accordion key={category} expanded={expandedAccordion === category} onChange={() => setExpandedAccordion(expandedAccordion === category ? null : category)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">{category.toUpperCase()} PERMISSIONS</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {perms.map((perm, index) => (
                    <Box key={perm._id} display="flex" justifyContent="space-between" alignItems="center" mb={1} pl={2}>
                      <Typography>{perm.permission_id.name}</Typography>
                      <Switch checked={perm.is_permitted} color="primary" onChange={() => handleTogglePermission(category, index)} />
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography>No permissions available.</Typography>
          )}
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => setModalOpen(false)}>Close</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Permission;
