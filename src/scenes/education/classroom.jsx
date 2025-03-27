import { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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
  fetchClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from "../../api/education/classroom";
import { fetchCourse } from "../../api/education/course";

// Hàm chuyển đổi ngày từ định dạng "dd/MM/yyyy" sang "yyyy-MM-dd"
const convertDisplayDateToInputFormat = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const Classroom = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [classroom, setClassroom] = useState([]);
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  // formData ban đầu, start_date, end_date lưu theo định dạng "yyyy-MM-dd"
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    course_id: "",
    semester: "",
    year: "",
    max_students: "",
    status: "",
    start_date: "",
    end_date: "",
    is_deleted: false,
  });

  useEffect(() => {
    loadClassroom();
    loadCourse();
  }, []);

  const loadClassroom = async () => {
    setLoading(true);
    try {
      const data = await fetchClassroom();
      console.log(data);
      // Nếu API trả về ngày dưới dạng ISO, hãy chuyển sang chuỗi hiển thị "dd/MM/yyyy" cho DataGrid.
      // Đồng thời, lưu giá trị raw (định dạng yyyy-MM-dd) cho form.
      const mapped = data.map((cla, index) => {
        const startDateObj = cla.start_date ? new Date(cla.start_date) : null;
        const endDateObj = cla.end_date ? new Date(cla.end_date) : null;
        // Chuỗi hiển thị cho DataGrid
        const start_date_display = startDateObj
          ? startDateObj.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "";
        const end_date_display = endDateObj
          ? endDateObj.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "";
        // Giá trị raw cho form (yyyy-MM-dd)
        const start_date_input = startDateObj
          ? startDateObj.toISOString().slice(0, 10)
          : "";
        const end_date_input = endDateObj
          ? endDateObj.toISOString().slice(0, 10)
          : "";
        return {
          ...cla,
          id: cla._id,
          No: index + 1,
          course_name: cla.course_id?.name || "",
          start_date: start_date_input,
          end_date: end_date_input,
          start_date_display,
          end_date_display,
          isDeleted: cla.is_deleted ? "Deleted" : "Active",
        };
      });
      setClassroom(mapped);
    } catch (error) {
      console.error("Error fetching Classroom :", error);
    }
    setLoading(false);
  };

  const loadCourse = async () => {
    try {
      const data = await fetchCourse();
      const filtered = data.filter((cla) => !cla.is_deleted);
      setCourse(filtered);
    } catch (error) {
      console.error("Error fetching Course :", error);
    }
  };

  const handleOpenDialog = (cla = null) => {
    setSelectedClassroom(cla);
    if (cla) {
      // Khi edit, nếu trường start_date và end_date không có giá trị raw (yyyy-MM-dd)
      // thì chuyển đổi từ định dạng hiển thị "dd/MM/yyyy" sang "yyyy-MM-dd"
      setFormData({
        name: cla.name,
        code: cla.code,
        course_id: cla.course_id?._id || "",
        semester: cla.semester,
        year: cla.year,
        max_students: cla.max_students,
        status: cla.status,
        start_date: cla.start_date || convertDisplayDateToInputFormat(cla.start_date_display),
        end_date: cla.end_date || convertDisplayDateToInputFormat(cla.end_date_display),
        is_deleted: cla.is_deleted,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        course_id: "",
        semester: "",
        year: "",
        max_students: "",
        status: "",
        start_date: "",
        end_date: "",
        is_deleted: false,
      });
    }
    setErrorMessage("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedClassroom(null);
      setErrorMessage("");
    }, 300);
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage("");
      const updatedFormData = {
        ...formData,
        course_id: formData.course_id || null,
      };
      if (selectedClassroom) {
        await updateClassroom(selectedClassroom.id, updatedFormData);
      } else {
        await createClassroom(updatedFormData);
      }
      loadClassroom();
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting Classroom:", error);
      const errorMsg =
        error.response?.data?.error || "An error occurred, please try again.";
      setErrorDialogMessage(errorMsg);
      setOpenErrorDialog(true);
    }
  };

  const handleOpenDeleteDialog = (cla) => {
    setSelectedClassroom(cla);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedClassroom(null);
  };

  const handleDelete = async () => {
    if (selectedClassroom) {
      try {
        await deleteClassroom(selectedClassroom.id);
        loadClassroom();
      } catch (error) {
        console.error("Error deleting Classroom :", error);
      }
    }
    handleCloseDeleteDialog();
  };

  const columns = [
    { field: "No", headerName: "No", flex: 0.3 },
    { field: "code", headerName: "Code", flex: 1 },
    { field: "name", headerName: "Classroom Name", flex: 1 },
    { field: "course_name", headerName: "Course Name", flex: 1 },
    { field: "semester", headerName: "Semester", flex: 1 },
    { field: "year", headerName: "Year", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "start_date_display", headerName: "Start Date", flex: 1 },
    { field: "end_date_display", headerName: "End Date", flex: 1 },
    {
      field: "isDeleted",
      headerName: "IsDeleted",
      flex: 0.5,
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
      <Header title="Classroom" subtitle="List of Classroom" />
      <Button
        variant="contained"
        color="success"
        onClick={() => handleOpenDialog()}
        style={{ marginBottom: 16 }}
      >
        Create New Classroom
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
            rows={classroom}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row.id}
          />
        )}
      </Box>

      {/* Dialog tạo/sửa Classroom */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedClassroom ? "Update Classroom" : "Create New Classroom"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Classroom Name"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <TextField
            label="Code"
            fullWidth
            margin="dense"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
          />
          <TextField
            label="Semester"
            fullWidth
            margin="dense"
            value={formData.semester}
            onChange={(e) =>
              setFormData({ ...formData, semester: e.target.value })
            }
          />
          <TextField
            label="Year"
            fullWidth
            margin="dense"
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: e.target.value })
            }
          />
          <TextField
            label="Status"
            fullWidth
            margin="dense"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          />

          {/* Input Start Date dạng yyyy-MM-dd */}
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            margin="dense"
            value={formData.start_date || ""}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />

          {/* Input End Date dạng yyyy-MM-dd */}
          <TextField
            label="End Date"
            type="date"
            fullWidth
            margin="dense"
            value={formData.end_date || ""}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />

          {/* Dropdown Course */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Course</InputLabel>
            <Select
              label="Course"
              value={formData.course_id}
              onChange={(e) =>
                setFormData({ ...formData, course_id: e.target.value })
              }
            >
              {course.map((cla) => (
                <MenuItem key={cla._id} value={cla._id}>
                  {cla.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_deleted}
                onChange={(e) =>
                  setFormData({ ...formData, is_deleted: e.target.checked })
                }
              />
            }
            label={formData.is_deleted ? "Deleted" : "Active"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedClassroom ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog xóa Classroom */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the Classroom "{selectedClassroom?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog báo lỗi */}
      <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography color="error">{errorDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenErrorDialog(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Classroom;
