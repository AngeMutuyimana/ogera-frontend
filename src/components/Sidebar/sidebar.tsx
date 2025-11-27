import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  XMarkIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const role = useSelector((state: any) => state.auth.role);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          h-screen w-64 bg-[#0F172A] text-gray-300 flex flex-col fixed left-0 top-0 
          overflow-y-auto scrollbar-hide shadow-lg z-50 transition-transform duration-300
          lg:translate-x-0 lg:rounded-tr-3xl lg:rounded-br-3xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
              O
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Ogera</h2>
              <p className="text-xs text-gray-400 uppercase">{role}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* ========================= ROLE-BASED MENU ========================= */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard - All Users */}
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 cursor-pointer transition-colors"
            onClick={() => handleNavigation("/dashboard")}
          >
            <HomeIcon className="h-5 w-5" />
            <span>Dashboard</span>
          </div>

          {/* User - Only Admin/SuperAdmin */}
          {(role === "admin" || role === "superadmin") && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => toggleMenu("users")}
              >
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5" />
                  <span>User</span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openMenu === "users" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openMenu === "users" && (
                <ul className="pl-11 space-y-1 text-sm text-gray-400 mt-2">
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() => handleNavigation("/dashboard/users/all")}
                  >
                    All Users
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/users/students")
                    }
                  >
                    Students
                  </li>
                  <li
                    className="hover:text-purple-400 cursor-pointer py-1.5 transition-colors text-purple-400"
                    onClick={() =>
                      handleNavigation("/dashboard/users/employers")
                    }
                  >
                    Employers
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() => handleNavigation("/dashboard/users/pending")}
                  >
                    Pending Approval
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/users/suspended")
                    }
                  >
                    Suspended
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Academic Verification - Student, Employer, Admin */}
          {(role === "student" ||
            role === "employer" ||
            role === "admin" ||
            role === "superadmin") && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => toggleMenu("academic")}
              >
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="h-5 w-5" />
                  <span>Academic Verification</span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openMenu === "academic" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openMenu === "academic" && (
                <ul className="pl-11 space-y-1 text-sm text-gray-400 mt-2">
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/pending")
                    }
                  >
                    Pending Reviews
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/approved")
                    }
                  >
                    Approved
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/rejected")
                    }
                  >
                    Rejected
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/performance")
                    }
                  >
                    Performance Track
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/locks")
                    }
                  >
                    Account Locks
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Jobs - Student, Employer, Admin */}
          {(role === "student" ||
            role === "employer" ||
            role === "admin" ||
            role === "superadmin") && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => toggleMenu("jobs")}
              >
                <div className="flex items-center gap-3">
                  <BriefcaseIcon className="h-5 w-5" />
                  <span>Jobs</span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openMenu === "jobs" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openMenu === "jobs" && (
                <ul className="pl-11 space-y-1 text-sm text-gray-400 mt-2">
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() => handleNavigation("/dashboard/jobs/all")}
                  >
                    All Jobs
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() => handleNavigation("/dashboard/jobs/active")}
                  >
                    Active Jobs
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/jobs/completed")
                    }
                  >
                    Completed
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() => handleNavigation("/dashboard/jobs/pending")}
                  >
                    Pending Approval
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/jobs/categories")
                    }
                  >
                    Job Categories
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Disputes - Student, Admin */}
          {(role === "student" ||
            role === "admin" ||
            role === "superadmin") && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => toggleMenu("disputes")}
              >
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span>Disputes</span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openMenu === "disputes" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openMenu === "disputes" && (
                <ul className="pl-11 space-y-1 text-sm text-gray-400 mt-2">
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() => handleNavigation("/dashboard/disputes/open")}
                  >
                    Open Disputes
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/disputes/in-progress")
                    }
                  >
                    In Progress
                  </li>
                  <li
                    className="hover:text-white cursor-pointer py-1.5 transition-colors"
                    onClick={() =>
                      handleNavigation("/dashboard/disputes/resolved")
                    }
                  >
                    Resolved
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Analytics - Employer, Admin */}
          {(role === "employer" ||
            role === "admin" ||
            role === "superadmin") && (
            <div
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-gray-800 cursor-pointer transition-colors group"
              onClick={() => handleNavigation("/dashboard/analytics")}
            >
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-5 w-5" />
                <span>Analytics</span>
              </div>
              <ChevronDownIcon className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>
          )}

          {/* Transaction - Employer, Admin */}
          {(role === "employer" ||
            role === "admin" ||
            role === "superadmin") && (
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => handleNavigation("/dashboard/transactions")}
            >
              <CreditCardIcon className="h-5 w-5" />
              <span>Transaction</span>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
