import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
} from "../../api/education/department";

const Department = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Lấy dữ liệu từ API
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    const data = await fetchDepartments();
    setDepartments(data);
    setLoading(false);
  };

  // Mở dialog (Edit hoặc Create)
  const handleOpenDialog = (dept = null) => {
    setSelectedDepartment(dept);
    setFormData(dept ? { name: dept.name, description: dept.description } : { name: "", description: "" });
    setOpenDialog(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepartment(null);
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    if (selectedDepartment) {
      await updateDepartment(selectedDepartment.id, formData);
    } else {
      await createDepartment(formData);
    }
    loadDepartments();
    handleCloseDialog();
  };

  // Thay đổi trạng thái Active/Inactive
  const handleChangeStatus = async (id, currentStatus) => {
    await updateDepartment(id, { is_deleted: currentStatus === "Active" });
    loadDepartments();
  };

  // Cấu hình cột DataGrid
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Department Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: params.value === "Active" ? "green" : "red" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button variant="contained" color="primary" size="small" onClick={() => handleOpenDialog(params.row)}>
            Edit
          </Button>
          <Button
            variant="contained"
            color={params.row.status === "Active" ? "warning" : "success"}
            size="small"
            onClick={() => handleChangeStatus(params.row.id, params.row.status)}
            style={{ marginLeft: 8 }}
          >
            {params.row.status === "Active" ? "Set Inactive" : "Set Active"}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="Department" subtitle="List of Departments" />

      {/* Button Create */}
      <Button variant="contained" color="success" onClick={() => handleOpenDialog()} style={{ marginBottom: 16 }}>
        Create New Department
      </Button>

      <Box
        m="20px 0"
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
        }}
      >
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DataGrid
            rows={departments}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
          />
        )}
      </Box>

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedDepartment ? "Update Department" : "Create New Department"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{selectedDepartment ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Department;
