import React from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Avatar, Box, Typography } from "@mui/material";
import { Visibility as ViewIcon, Edit as EditIcon } from "@mui/icons-material";

interface Student {
  id: number;
  name: string;
  email: string;
  university: string;
  gpa: string;
  status: "Active" | "Pending";
  verified: boolean;
}

const Students: React.FC = () => {
  const students: Student[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      university: "MIT",
      gpa: "3.8",
      status: "Active",
      verified: true,
    },
    {
      id: 2,
      name: "Mike Johnson",
      email: "mike@example.com",
      university: "Stanford",
      gpa: "3.9",
      status: "Active",
      verified: true,
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily@example.com",
      university: "Harvard",
      gpa: "3.7",
      status: "Pending",
      verified: false,
    },
    {
      id: 4,
      name: "Chris Wilson",
      email: "chris@example.com",
      university: "Yale",
      gpa: "3.6",
      status: "Active",
      verified: true,
    },
  ];

  const columns: Column<Student>[] = [
    {
      id: "name",
      label: "Student",
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#3b82f6",
              width: 40,
              height: 40,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Typography sx={{ fontWeight: 500, color: "#111827" }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "email",
      label: "Email",
      minWidth: 200,
    },
    {
      id: "university",
      label: "University",
      minWidth: 150,
    },
    {
      id: "gpa",
      label: "GPA",
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: "#f3e8ff",
            color: "#7c3aed",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "verified",
      label: "Verified",
      minWidth: 120,
      format: (value) =>
        value ? (
          <Chip
            label="✓ Verified"
            size="small"
            sx={{
              bgcolor: "#d1fae5",
              color: "#065f46",
              fontWeight: 600,
            }}
          />
        ) : (
          <Chip
            label="Pending"
            size="small"
            sx={{
              bgcolor: "#fed7aa",
              color: "#9a3412",
              fontWeight: 600,
            }}
          />
        ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: value === "Active" ? "#d1fae5" : "#fed7aa",
            color: value === "Active" ? "#065f46" : "#9a3412",
            fontWeight: 600,
          }}
        />
      ),
    },
  ];

  const actions: TableAction<Student>[] = [
    {
      label: "View Profile",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View student:", row);
      },
      color: "primary",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Edit student:", row);
      },
      color: "primary",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <AcademicCapIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            Students
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Manage all student accounts and their academic information
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Students</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">8,120</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200">
          <p className="text-sm text-green-700 font-medium">
            Verified Students
          </p>
          <p className="text-3xl font-bold text-green-900 mt-2">7,845</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-md border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">
            Pending Verification
          </p>
          <p className="text-3xl font-bold text-orange-900 mt-2">275</p>
        </div>
      </div>

      {/* Students Table */}
      <CustomTable
        columns={columns}
        data={students}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search students..."
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default Students;
