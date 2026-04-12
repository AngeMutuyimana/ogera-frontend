import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";

const MyApplications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentApplicationsQuery();
  const location = useLocation();

  // Detect filter from URL path (e.g. /accepted, /rejected)
  const getInitialFilter = () => {
    if (location.pathname.endsWith("/accepted")) return "Accepted";
    if (location.pathname.endsWith("/rejected")) return "Rejected";
    return "all";
  };
  const [activeFilter, setActiveFilter] = useState<string>(getInitialFilter());

  // Sync filter when URL changes
  useEffect(() => {
    const newFilter = getInitialFilter();
    if (newFilter !== activeFilter) {
      setActiveFilter(newFilter);
    }
  }, [location.pathname]);

  const handleFilterChange = (status: string) => {
    setActiveFilter(status);
    if (status === "Accepted") {
      navigate("/dashboard/jobs/my-applications/accepted");
    } else if (status === "Rejected") {
      navigate("/dashboard/jobs/my-applications/rejected");
    } else {
      navigate("/dashboard/jobs/my-applications");
    }
  };

  const applications = data?.data || [];

  const pendingCount = applications.filter((app) => app.status === "Pending").length;
  const acceptedCount = applications.filter((app) => app.status === "Accepted").length;
  const rejectedCount = applications.filter((app) => app.status === "Rejected").length;

  const filteredApplications = activeFilter === "all"
    ? applications
    : applications.filter((app) => app.status === activeFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">Accepted</span>;
      case "Rejected":
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">Rejected</span>;
      case "Pending":
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700">Pending</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
          <p className="text-red-600 text-sm">{t("pages.myApplications.failedToLoad")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fadeIn p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-[#7f56d9]" />
            {t("pages.myApplications.title")}
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">{t("pages.myApplications.subtitle")}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/all")}
          className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#7f56d9] hover:bg-[#5b3ba5] text-white rounded-lg font-medium transition text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          {t("pages.myApplications.browseJobs")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => handleFilterChange("all")}
          className={`cursor-pointer rounded-lg px-4 py-3 border-2 transition-all text-left flex items-center gap-3 hover:shadow-md hover:scale-105 active:scale-95 ${activeFilter === "all" ? "bg-[#f5f3ff] border-[#7f56d9] shadow-md" : "bg-white border-gray-200 hover:bg-[#f5f3ff] hover:border-[#7f56d9] hover:shadow-md"}`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${activeFilter === "all" ? "bg-[#7f56d9]" : "bg-[#f5f3ff]"}`}>
            <BriefcaseIcon className={`w-5 h-5 ${activeFilter === "all" ? "text-white" : "text-[#7f56d9]"}`} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#7f56d9] font-semibold">{t("pages.myApplications.totalApplications")}</p>
            <p className="text-xl font-bold text-gray-900">{applications.length}</p>
          </div>
        </button>

        <button onClick={() => handleFilterChange("Pending")}
          className={`cursor-pointer rounded-lg px-4 py-3 border-2 transition-all text-left flex items-center gap-3 hover:shadow-md hover:scale-105 active:scale-95 ${activeFilter === "Pending" ? "bg-yellow-50 border-yellow-400 shadow-md" : "bg-white border-gray-200 hover:bg-yellow-50 hover:border-yellow-400 hover:shadow-md"}`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${activeFilter === "Pending" ? "bg-yellow-500" : "bg-yellow-50"}`}>
            <ClockIcon className={`w-5 h-5 ${activeFilter === "Pending" ? "text-white" : "text-yellow-600"}`} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-yellow-700 font-semibold">{t("pages.jobs.pendingReview")}</p>
            <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </button>

        <button onClick={() => handleFilterChange("Accepted")}
          className={`cursor-pointer rounded-lg px-4 py-3 border-2 transition-all text-left flex items-center gap-3 hover:shadow-md hover:scale-105 active:scale-95 ${activeFilter === "Accepted" ? "bg-green-50 border-green-400 shadow-md" : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-400 hover:shadow-md"}`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${activeFilter === "Accepted" ? "bg-green-500" : "bg-green-50"}`}>
            <CheckCircleIcon className={`w-5 h-5 ${activeFilter === "Accepted" ? "text-white" : "text-green-600"}`} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-green-700 font-semibold">{t("pages.myApplications.accepted")}</p>
            <p className="text-xl font-bold text-gray-900">{acceptedCount}</p>
          </div>
        </button>

        <button onClick={() => handleFilterChange("Rejected")}
          className={`cursor-pointer rounded-lg px-4 py-3 border-2 transition-all text-left flex items-center gap-3 hover:shadow-md hover:scale-105 active:scale-95 ${activeFilter === "Rejected" ? "bg-red-50 border-red-400 shadow-md" : "bg-white border-gray-200 hover:bg-red-50 hover:border-red-400 hover:shadow-md"}`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${activeFilter === "Rejected" ? "bg-red-500" : "bg-red-50"}`}>
            <XCircleIcon className={`w-5 h-5 ${activeFilter === "Rejected" ? "text-white" : "text-red-600"}`} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-red-700 font-semibold">{t("pages.myApplications.rejected")}</p>
            <p className="text-xl font-bold text-gray-900">{rejectedCount}</p>
          </div>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            {activeFilter === "all" ? "All Applications" : `${activeFilter} Applications`} ({filteredApplications.length})
          </h2>
          {activeFilter !== "all" && (
            <button onClick={() => handleFilterChange("all")} className="cursor-pointer text-xs text-[#7f56d9] hover:text-[#5b3ba5] font-medium">
              Show all
            </button>
          )}
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#f5f3ff] rounded-full flex items-center justify-center mx-auto mb-4">
              {applications.length === 0 ? (
                <MagnifyingGlassIcon className="w-8 h-8 text-[#7f56d9]" />
              ) : (
                <BriefcaseIcon className="w-8 h-8 text-[#7f56d9]" />
              )}
            </div>
            <p className="text-gray-800 font-semibold text-base mb-1">
              {applications.length === 0 ? t("pages.myApplications.noApplicationsYet") : `No ${activeFilter.toLowerCase()} applications`}
            </p>
            <p className="text-gray-400 text-xs mb-4 max-w-sm mx-auto">
              {applications.length === 0
                ? "Start exploring available jobs and submit your first application to get started."
                : `You don't have any ${activeFilter.toLowerCase()} applications at the moment.`}
            </p>
            {applications.length === 0 && (
              <button
                onClick={() => navigate("/dashboard/jobs/all")}
                className="cursor-pointer inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#7f56d9] hover:bg-[#5b3ba5] text-white rounded-lg font-medium transition text-sm"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                {t("pages.myApplications.browseJobs")}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Applied</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application, index) => (
                  <tr key={application.application_id} className="border-b border-gray-50 hover:bg-[#f5f3ff]/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#f5f3ff] rounded-lg flex items-center justify-center flex-shrink-0">
                          <BriefcaseIcon className="w-4 h-4 text-[#7f56d9]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]">
                            {application.job?.job_title || "Unknown Job"}
                          </p>
                          {application.cover_letter && (
                            <p className="text-gray-400 text-[10px] truncate max-w-[200px]">
                              {application.cover_letter}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3 text-gray-400" />
                        {application.job?.location || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <span className="flex items-center gap-1">
                        <CurrencyDollarIcon className="w-3 h-3 text-gray-400" />
                        {application.job?.budget ? `$${application.job.budget.toLocaleString()}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(application.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" - "}
                      {new Date(application.applied_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(application.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/jobs/${application.job_id}`); }}
                        className="cursor-pointer px-3 py-1.5 bg-[#7f56d9] hover:bg-[#5b3ba5] text-white rounded-lg text-xs font-medium transition-all"
                      >
                        View Job
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
