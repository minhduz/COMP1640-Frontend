import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  useMediaQuery
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import {
  getAllPendingUsersApi,
  createPendingUserApi,
  updatePendingUserApi,
  deletePendingUserApi,
  readFileExcelApi,
  sendEmailApi
} from "../../api/user/pending";

import { fetchDepartments } from "../../api/education/department";

const PendingUser = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", phone_number: "", department_id: "", user_type: "" });
  const [action, setAction] = useState("")
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const [uploadResultDialog, setUploadResultDialog] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    fetchPendingUsers();
    fetchAllDepartments();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllPendingUsersApi();
      setPendingUsers(
        data.map((user, index) => ({
          id: index + 1, // Temporary ID
          ...user,
        }))
      );
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
    setLoading(false);
  };

  // Add this function to fetch departments
const fetchAllDepartments = async () => {
  try {
    const data = await fetchDepartments();
    setDepartments(data);
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    setFormData(user ? { ...user } : { first_name: "", last_name: "", email: "", phone_number: "", department_id: "", user_type: "" });
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    if (selectedUser) {
      await updatePendingUserApi(selectedUser._id, formData);
    } else {
      await createPendingUserApi(formData);
    }
    fetchPendingUsers();
    handleCloseDialog();
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    if (selectedUser) {
      await deletePendingUserApi(selectedUser._id);
      fetchPendingUsers();
    }
    handleCloseDeleteDialog();
  };

  const handleAction = (event) => {
    setAction(event.target.value);
  };

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  const handleSelectionChange = (selection) => {
    setSelectedUserIds(selection);
  };

  const handleGoAction = async () => {
    if (action === "send_email") {
      // Get the selected emails from the pendingUsers array
      const selectedEmails = pendingUsers
        .filter((user) => selectedUserIds.includes(user._id))
        .map((user) => user.email);
      
      if (selectedEmails.length === 0) {
        // Show an alert or notification if no emails are selected
        alert("Please select at least one user to send emails to");
        return;
      }
      
      try {
        // Call the sendEmailApi with the selected emails
        const emailData = {
          to: selectedEmails
        };
        
        const result = await sendEmailApi(emailData);
        
        if (result) {
          // Show success message
          alert(`Emails successfully sent to ${selectedEmails.length} users`);
          // Refresh the pending users list to update the is_sended status
          fetchPendingUsers();
        } else {
          // Show error message
          alert("Failed to send emails. Please try again.");
        }
      } catch (error) {
        console.error("Error sending emails:", error);
        alert("An error occurred while sending emails");
      }
    }
  };

  // File upload handlers
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setFileError("");
    // Check if file is Excel (.xlsx or .xls)
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }
    setFile(selectedFile);
  };

  const handleUploadFile = async () => {
    if (!file) {
      setFileError("Please select a file first");
      return;
    }
  
    setFileLoading(true);
    try {
      const result = await readFileExcelApi(file);
      console.log("Upload result:", result); // Add this line to inspect the result
      if (result) {
        // Store the result for displaying in dialog
        setUploadResult(result);
        // Open the result dialog
        setUploadResultDialog(true);
        // Refresh the pending users list after upload
        fetchPendingUsers();
        // Reset file state
        setFile(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileError("Failed to upload file. Please try again.");
    } finally {
      setFileLoading(false);
    }
  };

  const handleCloseUploadResultDialog = () => {
    setUploadResultDialog(false);
    setUploadResult(null);
  };

  

  const columns = [
    { field: "id", headerName: "ID", flex: 0.1 },
    { field: "first_name", headerName: "First Name", flex: 0.4 },
    { field: "last_name", headerName: "Last Name", flex: 0. },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "user_type", headerName: "User Type", flex: 0.3 },
    {
      field: "is_sent",
      headerName: "Sent",
      flex: 0.2,
      renderCell: (params) => (
        <span style={{ color: params.value ? "green" : "red" }}>
          {params.value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      field: "invitation_sent_at",
      headerName: "Sent At",
      flex: 0.5,
      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleString("vi-VN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: "Asia/Ho_Chi_Minh",
            })
          : "N/A",
    },
    {
      field: "invitation_expires_at",
      headerName: "Expires At",
      flex: 0.5,
      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleString("vi-VN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: "Asia/Ho_Chi_Minh",
            })
          : "N/A",
    },
    {
      field: "is_created",
      headerName: "Created",
      flex: 0.2,
      renderCell: (params) => (
        <span style={{ color: params.value ? "green" : "red" }}>
          {params.value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      field: "update",
      headerName: "Edit",
      flex: 0.2,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenDialog(params.row)}>
          <EditIcon style={{ color: colors.blueAccent[400] }} />
        </IconButton>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      flex: 0.2,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenDeleteDialog(params.row)}>
          <DeleteForeverOutlinedIcon style={{ color: colors.redAccent[400] }} />
        </IconButton>
      ),
    },
  ];

  return (
    <Box m="20px" >
        <Header title="Pending User" subtitle="List of Pending  User in the application" />
        {/* File Upload Section */}
        <Box 
          sx={{ 
            marginBottom: "20px",
            display: "flex", 
            flexDirection: isNonMobile ? "row" : "column",
            gap: 2,
            alignItems: isNonMobile ? "center" : "stretch"
          }}
        >
          <Paper
            sx={{
              flex: 1,
              padding: "20px",
              border: `2px dashed ${colors.grey[300]}`,
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backgroundColor: colors.primary[400],
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: colors.primary[900],
              },
              minHeight: "120px",
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".xlsx,.xls"
            />
            <CloudUploadIcon sx={{ fontSize: 40, color: colors.greenAccent[400], mb: 1 }} />
            <Typography variant="body1" align="center">
              {file ? file.name : "Drag & drop an Excel file here or click to browse"}
            </Typography>
            {fileError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {fileError}
              </Typography>
            )}
          </Paper>
          
          <Button
            variant="contained"
            color="primary"
            disabled={!file || fileLoading}
            onClick={handleUploadFile}
            sx={{ 
              height: isNonMobile ? "50px" : "auto",
              minWidth: isNonMobile ? "150px" : "100%",
              py: 1
            }}
          >
            {fileLoading ? <CircularProgress size={24} /> : "Upload File"}
          </Button>
        </Box>

        <Box display="flex" justifyContent="center" gap={2} width="500px">
           <Button
            variant="contained"
            color="success"
            onClick={() => handleOpenDialog()}
          >
            Create New Pending User
          </Button>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Choose Action</InputLabel>
            <Select value={action} label="Choose Action" labelId="demo-simple-select-label" onChange={handleAction}>
                <MenuItem value="nothing">Choose one action</MenuItem>
                <MenuItem value="send_email">Send Emails</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleGoAction}>Go</Button>
        </Box>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            checkboxSelection
            rows={pendingUsers}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row._id}
            onSelectionModelChange={handleSelectionChange}
          />
        )}
      </Box>

      {/* Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedUser ? "Update Pending User" : "Create New Pending User"}</DialogTitle>
        <DialogContent>
          <TextField label="First Name" fullWidth margin="dense" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
          <TextField label="Last Name" fullWidth margin="dense" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
          <TextField label="Email" fullWidth margin="dense" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <TextField label="Phone Number" fullWidth margin="dense" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} /> 
          
          {/* Department Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Department</InputLabel>
            <Select label="Course Category" value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}>
              {departments.map((dep) => (
                <MenuItem value={dep._id}>{dep.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* User Type Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>User Type</InputLabel>
            <Select label="User Type" value={formData.user_type} onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}>
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Tutor">Tutor</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{selectedUser ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
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

      {/* Upload Result Dialog */}
      <Dialog 
        open={uploadResultDialog} 
        onClose={handleCloseUploadResultDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">File Upload Results</Typography>
            {uploadResult?.summary && (
              <Typography variant="subtitle1" color={colors.greenAccent[500]}>
                Total: {uploadResult.summary.total} | Success: {uploadResult.summary.successful} | 
                Duplicates: {uploadResult.summary.duplicates} | Errors: {uploadResult.summary.errors}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {!uploadResult ? (
            <Typography>No data available</Typography>
          ) : (
            <Box>              
              {/* Successful Uploads */}
              {uploadResult.createdPendingUsers && uploadResult.createdPendingUsers.length > 0 ? (
                <Box mb={3}>
                  <Typography variant="h6" color={colors.greenAccent[500]} gutterBottom>
                    Successfully Created Users ({uploadResult.createdPendingUsers.length})
                  </Typography>
                  <Box sx={{ maxHeight: "200px", overflow: "auto", bgcolor: colors.greenAccent[600], p: 2, borderRadius: 1 }}>
                    {uploadResult.createdPendingUsers.map((user, index) => (
                      <Box key={index} mb={1} p={1} bgcolor={colors.primary[900]} borderRadius={1}>
                        <Typography>
                          <strong>{user.first_name} {user.last_name}</strong> - {user.email} ({user.user_type})
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography>No successful uploads</Typography>
              )}
              
              {/* Duplicates */}
              {uploadResult.duplicates && uploadResult.duplicates.length > 0 ? (
                <Box mb={3}>
                  <Typography variant="h6" color={colors.redAccent[500]} gutterBottom>
                    Duplicates ({uploadResult.duplicates.length})
                  </Typography>
                  <Box sx={{ maxHeight: "200px", overflow: "auto", bgcolor: colors.primary[400], p: 2, borderRadius: 1 }}>
                    {uploadResult.duplicates.map((item, index) => (
                      <Box key={index} mb={1} p={1} bgcolor={colors.primary[900]} borderRadius={1}>
                        <Typography>
                          <strong>Row {item.row}: {item.user.first_name} {item.user.last_name}</strong> - {item.user.email}
                        </Typography>
                        <Typography variant="body2" color={colors.redAccent[400]}>
                          Reason: {item.reason}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography>No duplicates found</Typography>
              )}
              
              {/* Errors */}
              {uploadResult.errors && uploadResult.errors.length > 0 ? (
                <Box>
                  <Typography variant="h6" color={colors.redAccent[500]} gutterBottom>
                    Errors ({uploadResult.errors.length})
                  </Typography>
                  <Box sx={{ maxHeight: "200px", overflow: "auto", bgcolor: colors.primary[900], p: 2, borderRadius: 1 }}>
                    {uploadResult.errors.map((item, index) => (
                      <Box key={index} mb={1} p={1} bgcolor={colors.primary[900]} borderRadius={1}>
                        <Typography>
                          <strong>Row {item.row}: {item.user.first_name} {item.user.last_name}</strong> - {item.user.email}
                        </Typography>
                        <Typography variant="body2" color={colors.redAccent[400]}>
                          Reason: {item.reason}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography>No errors found</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadResultDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingUser;
