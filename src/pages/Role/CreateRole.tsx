import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useCreateRoleMutation } from "../../services/api/adminApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import Button from "../../components/button";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import * as Yup from "yup";

interface CreateRoleFormValues {
  roleName: string;
  roleType: "student" | "employer" | "superAdmin" | "admin";
  permission_json: Array<{
    route: string;
    permission: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  }>;
}

const validationSchema = Yup.object({
  roleName: Yup.string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must not exceed 50 characters")
    .required("Role name is required")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Role name can only contain letters, numbers, and underscores"
    ),
  roleType: Yup.string()
    .oneOf(["student", "employer", "superAdmin", "admin"], "Invalid role type")
    .required("Role type is required"),
  permission_json: Yup.array()
    .of(
      Yup.object({
        route: Yup.string().required("Route is required"),
        permission: Yup.object({
          view: Yup.boolean().required(),
          create: Yup.boolean().required(),
          edit: Yup.boolean().required(),
          delete: Yup.boolean().required(),
        }).required(),
      })
    )
    .optional(),
});

// Common routes available in the system
const COMMON_ROUTES = [
  "/academic-verifications",
  "/jobs",
  "/roles",
  "/auth/subadmins",
  "/auth/users",
  "/disputes",
  "/analytics",
  "/transactions",
];

const CreateRole: React.FC = () => {
  const navigate = useNavigate();

  const [createRole, { isLoading, isError, error, isSuccess, data }] =
    useCreateRoleMutation();

  const addPermission = () => {
    const newPermissions = [
      ...formik.values.permission_json,
      {
        route: "",
        permission: {
          view: false,
          create: false,
          edit: false,
          delete: false,
        },
      },
    ];
    formik.setFieldValue("permission_json", newPermissions);
  };

  const removePermission = (index: number) => {
    const newPermissions = formik.values.permission_json.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("permission_json", newPermissions);
  };

  const updatePermissionRoute = (index: number, route: string) => {
    const newPermissions = [...formik.values.permission_json];
    newPermissions[index].route = route;
    formik.setFieldValue("permission_json", newPermissions);
  };

  const updatePermission = (
    index: number,
    permissionType: "view" | "create" | "edit" | "delete",
    value: boolean
  ) => {
    const newPermissions = [...formik.values.permission_json];
    newPermissions[index].permission[permissionType] = value;
    formik.setFieldValue("permission_json", newPermissions);
  };

  const initialValues: CreateRoleFormValues = {
    roleName: "",
    roleType: "admin",
    permission_json: [],
  };

  const formik = useFormik<CreateRoleFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          roleName: values.roleName.trim(),
          roleType: values.roleType,
          permission_json: values.permission_json || [],
        };
        await createRole(payload).unwrap();
      } catch (err) {
        console.error("Create role error:", err);
      }
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (isError && error) {
      const err = error as FetchBaseQueryError & {
        data?: { error?: string; message?: string };
      };
      toast.error(
        err?.data?.error || err?.data?.message || "Failed to create role"
      );
    }

    if (data && isSuccess) {
      toast.success(data?.message || "Role created successfully!");
      resetForm();
      navigate("/dashboard/role/view");
    }
  }, [isError, error, data, isSuccess, resetForm, navigate]);

  return (
    <Container>
      <FormContainer onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
          </IconWrapper>
          <Title>Create Role</Title>
          <Subtitle>
            Create a new role. Only superadmin can create roles.
          </Subtitle>
        </Header>

        {/* Role Name */}
        <FormGroup>
          <Label htmlFor="roleName">Role Name *</Label>
          <Input
            id="roleName"
            name="roleName"
            placeholder="Enter role name (e.g., xyz, admin, verifyDocAdmin)"
            value={formik.values.roleName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.roleName && formik.errors.roleName && (
            <ErrorText>{formik.errors.roleName}</ErrorText>
          )}
          <HelperText>
            Role name can only contain letters, numbers, and underscores
          </HelperText>
        </FormGroup>

        {/* Role Type */}
        <FormGroup>
          <Label htmlFor="roleType">Role Type *</Label>
          <Select
            id="roleType"
            name="roleType"
            value={formik.values.roleType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="admin">Admin</option>
            <option value="superAdmin">Super Admin</option>
            <option value="student">Student</option>
            <option value="employer">Employer</option>
          </Select>
          {formik.touched.roleType && formik.errors.roleType && (
            <ErrorText>{formik.errors.roleType}</ErrorText>
          )}
        </FormGroup>

        {/* Permissions */}
        <FormGroup>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <Label>Permissions (Optional)</Label>
            <AddPermissionButton type="button" onClick={addPermission}>
              <PlusIcon className="h-4 w-4" />
              Add Permission
            </AddPermissionButton>
          </div>

          {formik.values.permission_json.length === 0 && (
            <HelperText>
              No permissions added. Click "Add Permission" to grant access to
              specific routes.
            </HelperText>
          )}

          {formik.values.permission_json.map((permission, index) => (
            <PermissionCard key={index}>
              <PermissionHeader>
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  Permission {index + 1}
                </span>
                <RemoveButton
                  type="button"
                  onClick={() => removePermission(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </RemoveButton>
              </PermissionHeader>

              <FormGroup style={{ marginBottom: "12px" }}>
                <Label>Route *</Label>
                <Input
                  type="text"
                  list={`route-list-${index}`}
                  placeholder="Enter route (e.g., /academic-verifications)"
                  value={permission.route}
                  onChange={(e) => updatePermissionRoute(index, e.target.value)}
                />
                <datalist id={`route-list-${index}`}>
                  {COMMON_ROUTES.map((route) => (
                    <option key={route} value={route} />
                  ))}
                </datalist>
                <HelperText style={{ marginTop: "4px" }}>
                  Common routes: {COMMON_ROUTES.join(", ")}
                </HelperText>
              </FormGroup>

              <PermissionCheckboxes>
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={permission.permission.view}
                      onChange={(e) =>
                        updatePermission(index, "view", e.target.checked)
                      }
                    />
                    <span>View</span>
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={permission.permission.create}
                      onChange={(e) =>
                        updatePermission(index, "create", e.target.checked)
                      }
                    />
                    <span>Create</span>
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={permission.permission.edit}
                      onChange={(e) =>
                        updatePermission(index, "edit", e.target.checked)
                      }
                    />
                    <span>Edit</span>
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={permission.permission.delete}
                      onChange={(e) =>
                        updatePermission(index, "delete", e.target.checked)
                      }
                    />
                    <span>Delete</span>
                  </CheckboxLabel>
                </CheckboxGroup>
              </PermissionCheckboxes>
            </PermissionCard>
          ))}
        </FormGroup>

        <Button
          backgroundcolor="#7f56d9"
          type="submit"
          text={isLoading ? "Creating..." : "Create Role"}
          disabled={isLoading}
        />
      </FormContainer>
    </Container>
  );
};

export default CreateRole;

const Container = styled("div")`
  width: 100%;
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background: #f9fafb;
`;

const FormContainer = styled("form")`
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled("div")`
  text-align: center;
  margin-bottom: 32px;
`;

const IconWrapper = styled("div")`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const Title = styled("h1")`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const Subtitle = styled("p")`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled("label")`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled("input")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #7f56d9;
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const HelperText = styled("div")`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const Select = styled("select")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #7f56d9;
  }

  option {
    padding: 8px;
  }
`;

const AddPermissionButton = styled("button")`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #7f56d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #6d47c7;
  }

  &:active {
    background: #5b3ba5;
  }
`;

const PermissionCard = styled("div")`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
`;

const PermissionHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const RemoveButton = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #fecaca;
  }
`;

const PermissionCheckboxes = styled("div")`
  margin-top: 12px;
`;

const CheckboxGroup = styled("div")`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CheckboxLabel = styled("label")`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #7f56d9;
  }

  span {
    user-select: none;
  }
`;
