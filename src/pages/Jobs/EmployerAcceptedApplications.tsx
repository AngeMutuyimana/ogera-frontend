import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetEmployerApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import api from "../../services/api/axiosInstance";
import toast from "react-hot-toast";

const EmployerAcceptedApplications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetEmployerApplicationsQuery(
    { status: "Accepted" },
    { refetchOnMountOrArgChange: true }
  );

  const applications = data?.data || [];
  const acceptedApplications = applications;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "en" ? "en-US" : i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewResume = async (resumeUrl: string) => {
    try {
      let filePath = resumeUrl;

      if (resumeUrl.includes("/api/resumes/download")) {
        const url = new URL(resumeUrl, window.location.origin);
        filePath = url.searchParams.get("path") || resumeUrl;
      } else if (resumeUrl.startsWith("http://") || resumeUrl.startsWith("https://")) {
        window.open(resumeUrl, "_blank");
        return;
      }

      const response = await api.get(`/resumes/download?path=${encodeURIComponent(filePath)}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data as BlobPart], {
        type: (response.data as any)?.type || "application/pdf",
      });
      const blobUrl = window.URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error: any) {
      console.error("Error viewing resume:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("pages.jobs.failedToViewResume")
      );
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            {t("pages.jobs.failedToLoadApplications")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                  <CheckCircleIcon className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {t("pages.jobs.acceptedApplicationsTitle")}
                </h1>
              </div>
              <p className="text-gray-600 text-sm md:text-base">
                {t("pages.jobs.acceptedApplicationsSubtitle")}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/jobs/applications")}
              className="inline-flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              {t("pages.jobs.viewAllApplications")}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      {acceptedApplications.length > 0 && (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Accepted */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("pages.jobs.totalAccepted")}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {acceptedApplications.length}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors">
                  <CheckCircleIcon className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </div>

            {/* Acceptance Rate */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Successful
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    100%
                  </p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
                  <BriefcaseIcon className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Status
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    Approved
                  </p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors">
                  <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {acceptedApplications.length === 0 ? (
        <div className="px-6 py-16">
          <div className="max-w-md mx-auto bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("pages.jobs.noAcceptedYet")}
            </h3>
            <p className="text-gray-600 text-sm">
              {t("pages.jobs.noAcceptedMessage")}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Result Count */}
          <div className="mb-6 text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{acceptedApplications.length}</span> accepted application{acceptedApplications.length !== 1 ? "s" : ""}
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {acceptedApplications.map((application) => (
              <div
                key={application.application_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all overflow-hidden group"
              >
                {/* Status Bar */}
                <div className="h-1.5 bg-green-500"></div>

                <div className="p-4">
                  {/* Student Info Section */}
                  <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="h-11 w-11 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:shadow-md transition-shadow">
                      {application.student?.full_name?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {application.student?.full_name ||
                          t("pages.jobs.unknownStudent")}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                        <EnvelopeIcon className="h-3 w-3 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {application.student?.email ||
                            t("pages.jobs.noEmail")}
                        </span>
                      </div>
                      {application.student?.mobile_number && (
                        <p className="text-xs text-gray-600">
                          📞 {application.student.mobile_number}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Job Details Section */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BriefcaseIcon className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="text-gray-700 font-semibold text-sm">
                          {application.job?.job_title ||
                            t("pages.jobs.unknownJob")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-600 truncate">
                          {application.job?.location || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-600">
                          ${application.job?.budget?.toLocaleString() || "N/A"}
                        </span>
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                          {t("pages.jobs.coverLetter")}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}

                    {application.resume_url && (
                      <button
                        onClick={() =>
                          handleViewResume(application.resume_url!)
                        }
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors text-xs border border-blue-200"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        {t("pages.jobs.viewResume")}
                      </button>
                    )}
                  </div>

                  {/* Footer Section */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {t("pages.jobs.acceptedLabel")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3" />
                      <span>
                        Applied: {formatDate(application.applied_at)}
                      </span>
                    </div>
                    {application.reviewed_at && (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircleIcon className="h-3 w-3" />
                        <span>
                          Accepted: {formatDate(application.reviewed_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerAcceptedApplications;
