import { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";import {
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
  fetchCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/education/course";
import {fetchCourseCategory} from "../../api/education/couseCategory"

const Course = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [course, setCourse] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code:"",
    course_category_id:"",
    description: "",
    is_deleted: false,
  });

  useEffect(() => {
    loadCourse();
    loadCourseCategories();
  }, []);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const data = await fetchCourse();
      console.log(data);
      
      setCourse(
        data.map((cat, index) => ({
          ...cat,
          id: cat._id,
          No: index + 1,
          course_category_name: cat.course_category_id?.name,
          status: cat.is_deleted ? "Deleted" : "Active",
        }))
      );
      
    } catch (error) {
      console.error("Error fetching Course :", error);
    }
    setLoading(false);
  };

  const loadCourseCategories = async () => {
    try {
      const data = await fetchCourseCategory();
      const filteredCategories = data.filter((cat) => !cat.is_deleted); // Filter out deleted categories
      setCourseCategories(filteredCategories);
    } catch (error) {
      console.error("Error fetching Course Categories:", error);
    }
  };

  const handleOpenDialog = (cat = null) => {
    setSelectedCourse(cat);
    console.log(cat);
    
    setFormData(
      cat
        ? { 
            name: cat.name, 
            code: cat.code, 
            course_category_id: cat.course_category_id?._id || "",  // Use ID instead of name
            description: cat.description, 
            is_deleted: cat.is_deleted 
          }
        : { name: "", code: "", course_category_id: "", description: "", is_deleted: false }
    );
    console.log("f",formData);
    
    setErrorMessage("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
      // Delay resetting selectedCourse to avoid flickering title issue
    setTimeout(() => {
    setSelectedCourse(null);
    setErrorMessage("");
    }, 300); 
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage("");
  
      const updatedFormData = { 
        ...formData,
        course_category_id: formData.course_category_id || null, // Ensure valid ID
      };
  
      if (selectedCourse) {
        await updateCourse(selectedCourse.id, updatedFormData);
      } else {    
        await createCourse(updatedFormData);
      }
  
      loadCourse();
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting Course:", error);
      const errorMsg = error.response?.data?.error || "An error occurred, please try again.";
      setErrorDialogMessage(errorMsg);
      setOpenErrorDialog(true);
    }
  };

  const handleOpenDeleteDialog = (cat) => {
    setSelectedCourse(cat);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCourse(null);
  };

  const handleDelete = async () => {
    if (selectedCourse) {
      try {
        await deleteCourse(selectedCourse.id);
        loadCourse();
      } catch (error) {
        console.error("Error deleting Course :", error);
      }
    }
    handleCloseDeleteDialog();
  };

  const columns = [
    { field: "No", headerName: "No", flex: 0.3 },
    { field: "code", headerName: "code", flex: 0.3 },
    { field: "name", headerName: "Course Name", flex: 1 },
    { field: "course_category_name", headerName: "Course Category Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
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
      <Header title="Course " subtitle="List of Course " />

      <Button
        variant="contained"
        color="success"
        onClick={() => handleOpenDialog()}
        style={{ marginBottom: 16 }}
      >
        Create New Course 
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
            rows={course}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row.id}
          />
        )}
      </Box>

      {/* Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedCourse ? "Update Course" : "Create New Course"}</DialogTitle>
        <DialogContent>
          <TextField label="Course Name" fullWidth margin="dense" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <TextField label="Code" fullWidth margin="dense" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
          <TextField label="Description" fullWidth margin="dense" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

          {/* Course Category Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Course Category</InputLabel>
            <Select label="Course Category" value={formData.course_category_id} onChange={(e) => setFormData({ ...formData, course_category_id: e.target.value })}>
              {courseCategories.map((cat) => (
                <MenuItem value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel control={<Switch checked={formData.is_deleted} onChange={(e) => setFormData({ ...formData, is_deleted: e.target.checked })} />} label={formData.is_deleted ? "Deleted" : "Active"} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{selectedCourse ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the Course  "{selectedCourse?.name}"?
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

export default Course;
