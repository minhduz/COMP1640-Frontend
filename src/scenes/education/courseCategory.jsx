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
  fetchCourseCategory,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
} from "../../api/education/couseCategory";

const CourseCategory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [coursecategory, setCourseCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCourseCategory, setSelectedCourseCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_deleted: false,
  });

  useEffect(() => {
    loadCourseCategory();
  }, []);

  const loadCourseCategory = async () => {
    setLoading(true);
    try {
      const data = await fetchCourseCategory();
      setCourseCategory(
        data.map((cat, index) => ({
          ...cat,
          id: cat._id,
          No: index + 1,
          status: cat.is_deleted ? "Deleted" : "Active",
        }))
      );
    } catch (error) {
      console.error("Error fetching Course Category:", error);
    }
    setLoading(false);
  };

  const handleOpenDialog = (cat = null) => {
    setSelectedCourseCategory(cat);
    setFormData(
      cat
        ? { name: cat.name, description: cat.description, is_deleted: cat.is_deleted }
        : { name: "", description: "", is_deleted: false }
    );
    setErrorMessage("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourseCategory(null);
    setErrorMessage("");
  };

  

  const handleSubmit = async () => {
    try {
      setErrorMessage("");
      if (selectedCourseCategory) {
        await updateCourseCategory(selectedCourseCategory.id, formData);
      } else {    
        await createCourseCategory(formData);
      }
      loadCourseCategory();
      handleCloseDialog();
    } catch (error) {
      console.log("in catch");
      
      console.error("Error submitting Course Category:", error);
      const errorMsg = error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại!";
      setErrorDialogMessage(errorMsg);
      setOpenErrorDialog(true);
    }
  };

  const handleOpenDeleteDialog = (cat) => {
    setSelectedCourseCategory(cat);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCourseCategory(null);
  };

  const handleDelete = async () => {
    if (selectedCourseCategory) {
      try {
        await deleteCourseCategory(selectedCourseCategory.id);
        loadCourseCategory();
      } catch (error) {
        console.error("Error deleting Course Category:", error);
      }
    }
    handleCloseDeleteDialog();
  };

  const columns = [
    { field: "No", headerName: "No", flex: 0.3 },
    { field: "name", headerName: "CourseCategory Name", flex: 1 },
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
      <Header title="Course Category" subtitle="List of Course Category" />

      <Button
        variant="contained"
        color="success"
        onClick={() => handleOpenDialog()}
        style={{ marginBottom: 16 }}
      >
        Create New Course Category
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
            rows={coursecategory}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row.id}
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedCourseCategory ? "Update Course Category" : "Create New Course Category"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Course Category Name"
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
            {selectedCourseCategory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the Course Category "{selectedCourseCategory?.name}"?
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

export default CourseCategory;
