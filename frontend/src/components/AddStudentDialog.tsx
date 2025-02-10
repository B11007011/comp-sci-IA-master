import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  points: number;
}

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (students: StudentFormData[]) => void;
  classId: number;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  classId,
}) => {
  const [students, setStudents] = useState<StudentFormData[]>([
    { firstName: '', lastName: '', email: '', points: 0 },
  ]);

  const handleAddStudent = () => {
    setStudents([...students, { firstName: '', lastName: '', email: '', points: 0 }]);
  };

  const handleRemoveStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleStudentChange = (index: number, field: keyof StudentFormData, value: string | number) => {
    const newStudents = [...students];
    newStudents[index] = {
      ...newStudents[index],
      [field]: value,
    };
    setStudents(newStudents);
  };

  const handleSubmit = () => {
    onSubmit(students);
  };

  const isValid = () => {
    return students.every(
      (student) =>
        student.firstName.trim() !== '' &&
        student.lastName.trim() !== '' &&
        student.email.trim() !== ''
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Students to Class</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Add one or more students to the class. All fields are required.
          </Typography>
        </Box>
        {students.map((student, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              alignItems: 'center',
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          >
            <TextField
              label="First Name"
              value={student.firstName}
              onChange={(e) => handleStudentChange(index, 'firstName', e.target.value)}
              required
              size="small"
            />
            <TextField
              label="Last Name"
              value={student.lastName}
              onChange={(e) => handleStudentChange(index, 'lastName', e.target.value)}
              required
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={student.email}
              onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
              required
              size="small"
            />
            <TextField
              label="Initial Points"
              type="number"
              value={student.points}
              onChange={(e) => handleStudentChange(index, 'points', parseInt(e.target.value) || 0)}
              size="small"
              sx={{ width: '120px' }}
            />
            {students.length > 1 && (
              <IconButton
                onClick={() => handleRemoveStudent(index)}
                color="error"
                size="small"
              >
                <RemoveIcon />
              </IconButton>
            )}
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddStudent}
          sx={{ mt: 1 }}
        >
          Add Another Student
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid()}
        >
          Add Students
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStudentDialog; 