import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import EditIcon from "@mui/icons-material/Edit";
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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_deleted: false,
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await fetchDepartments();
      setDepartments(
        data.map((dept, index) => ({
          ...dept,
          id: dept._id,
          No: index + 1,
          status: dept.is_deleted ? "Deleted" : "Active",
        }))
      );
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
    setLoading(false);
  };

  const handleOpenDialog = (dept = null) => {
    setSelectedDepartment(dept);
    setFormData(
      dept
        ? { name: dept.name, description: dept.description, is_deleted: dept.is_deleted }
        : { name: "", description: "", is_deleted: false }
    );
    setErrorMessage("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepartment(null);
    setErrorMessage("");
  };

  

  const handleSubmit = async () => {
    try {
      setErrorMessage("");
      if (selectedDepartment) {
        await updateDepartment(selectedDepartment.id, formData);
      } else {    
        await createDepartment(formData);
      }
      loadDepartments();
      handleCloseDialog();
    } catch (error) {
      console.log("in catch");
      
      console.error("Error submitting department:", error);
      const errorMsg = error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại!";
      setErrorDialogMessage(errorMsg);
      setOpenErrorDialog(true);
    }
  };

  const handleOpenDeleteDialog = (dept) => {
    setSelectedDepartment(dept);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedDepartment(null);
  };

  const handleDelete = async () => {
    if (selectedDepartment) {
      try {
        await deleteDepartment(selectedDepartment.id);
        loadDepartments();
      } catch (error) {
        console.error("Error deleting department:", error);
      }
    }
    handleCloseDeleteDialog();
  };

  const columns = [
    { field: "No", headerName: "No", flex: 0.3 },
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
      field: "update",
      headerName: "Update",
      flex: 0.5,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenDialog(params.row)}>
          <EditIcon style={{ color: colors.blueAccent[400] }} />
        </IconButton>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      flex: 0.5,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenDeleteDialog(params.row)}>
          <DeleteForeverOutlinedIcon style={{ color: colors.redAccent[400] }} />
        </IconButton>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="Department" subtitle="List of Departments" />

      <Button
        variant="contained"
        color="success"
        onClick={() => handleOpenDialog()}
        style={{ marginBottom: 16 }}
      >
        Create New Department
      </Button>

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={departments}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row.id}
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedDepartment ? "Update Department" : "Create New Department"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Department Name"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_deleted}
                onChange={(e) => setFormData({ ...formData, is_deleted: e.target.checked })}
                color="error"
              />
            }
            label={formData.is_deleted ? "Deleted" : "Active"}
          />

          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedDepartment ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the department "{selectedDepartment?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary">Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography color="error">{errorDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenErrorDialog(false)} color="primary">OK</Button>
        </DialogActions>
      </Dialog>
                
    </Box>
  );
};

export default Department;
