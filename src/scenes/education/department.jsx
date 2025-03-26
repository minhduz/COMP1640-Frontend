import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/education/department";

const Department = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", status: "Active" });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    const data = await fetchDepartments();
    setDepartments(data);
    setLoading(false);
  };

  const handleOpenDialog = (dept = null) => {
    setSelectedDepartment(dept);
    setFormData(
      dept
        ? { name: dept.name, description: dept.description, status: dept.status }
        : { name: "", description: "", status: "Active" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepartment(null);
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      is_deleted: formData.status === "Inactive",
    };

    if (selectedDepartment) {
      await updateDepartment(selectedDepartment.id, payload);
    } else {
      await createDepartment(payload);
    }
    loadDepartments();
    handleCloseDialog();
  };

  const handleConfirmDelete = (id) => {
    setSelectedDepartment(id);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    await deleteDepartment(selectedDepartment);
    setDeleteDialog(false);
    loadDepartments();
  };

  const columns = [
    { field: "No", headerName: "No", flex: 0.3 }, // Số thứ tự
    { field: "id", headerName: "ID", flex: 0.5 }, // ID từ database
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
            variant="text"
            color="error"
            size="small"
            onClick={() => handleConfirmDelete(params.row.id)}
            style={{ marginLeft: 8 }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="Department" subtitle="List of Departments" />

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
            getRowId={(row) => row.id || `dept_${row.No}`} // Đảm bảo mỗi hàng có ID duy nhất
          />
        )}
      </Box>

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
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{selectedDepartment ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>

      {/* Xác nhận xóa */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this department?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Department;
