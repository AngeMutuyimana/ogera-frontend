import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useGetActiveJobsQuery } from "../../services/api/jobsApi";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import ApplyJobModal from "../../components/ApplyJobModal";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const ActiveJobs: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const { data, isLoading, error } = useGetActiveJobsQuery();
  const { data: studentApplications, refetch: refetchApplications } = useGetStudentApplicationsQuery(undefined, {
    skip: role !== "student",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  
  // Create a Set of job IDs the student has applied to
  const appliedJobIds = new Set(
    (studentApplications?.data || []).map((app: any) => app.job_id)
  );

  const activeJobs = data?.data || [];

  // Filter jobs based on search and location
  const filteredJobs = activeJobs.filter((job: any) => {
    const matchesSearch =
      !searchQuery ||
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.employer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation =
      !selectedLocation || job.location?.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter
  const locations = Array.from(
    new Set(activeJobs.map((job: any) => job.location).filter(Boolean))
  );

  const handleApply = (job: any) => {
    if (job.status === "Completed") return;
    if (role === "student") {
      setSelectedJob(job);
      setIsModalOpen(true);
    } else {
      navigate(`/dashboard/jobs/${job.job_id}`);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    // Refetch student applications to update applied status
    if (role === "student") {
      refetchApplications();
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            {t("pages.jobs.failedToLoadActive")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fadeIn p-1">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <CheckBadgeIcon className="h-5 w-5 text-green-600" />
          {t("pages.jobs.activeJobsTitle")}
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          {t("pages.jobs.jobsFound", { count: filteredJobs.length })}
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("pages.jobs.searchPlaceholderActive")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none hover:border-gray-300"
            />
          </div>

          {/* Location Filter */}
          <div className="relative sm:w-56">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 md:py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all outline-none hover:border-gray-300"
            >
              <option value="">{t("pages.jobs.allLocations")}</option>
              {locations.map((location: string) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckBadgeIcon className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || selectedLocation
              ? t("pages.jobs.noJobsMatching")
              : t("pages.jobs.noActiveJobsAvailable")}
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            {searchQuery || selectedLocation
              ? t("pages.jobs.tryAdjusting")
              : t("pages.jobs.noActiveCheckBack")}
          </p>
          {(searchQuery || selectedLocation) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLocation("");
              }}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job: any) => {
            const employerName = job.employer?.full_name || t("pages.jobs.unknownEmployer");
            const companyInitial = employerName.charAt(0).toUpperCase();
            const isSaved = savedJobs.has(job.job_id);
            const isCompletedJob = job.status === "Completed";
            const hasAlreadyApplied = appliedJobIds.has(job.job_id);
            const isApplyDisabled = hasAlreadyApplied || isCompletedJob;

            return (
              <div
                key={job.job_id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-200 transition-all duration-300 p-4 md:p-5 cursor-pointer group"
              >
                <div className="flex gap-3 md:gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-md group-hover:shadow-lg transition-all">
                      {companyInitial}
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                          className="text-base font-semibold text-gray-800 hover:text-green-600 cursor-pointer mb-1 transition-colors"
                        >
                          {job.job_title}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 font-medium mb-2 truncate">
                          {employerName}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSaveJob(job.job_id)}
                        className="flex-shrink-0 p-2 hover:bg-green-50 rounded-full transition-all"
                        title={isSaved ? t("pages.jobs.removeFromSaved") : t("pages.jobs.saveJob")}
                      >
                        {isSaved ? (
                          <BookmarkSolidIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-green-400" />
                        )}
                      </button>
                    </div>

                    {/* Job Info Row */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                      <span className="flex items-center gap-1.5">
                        <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate font-medium text-gray-700">${job.budget?.toLocaleString() || t("pages.jobs.notSpecified")}</span>
                      </span>
                      {job.duration && (
                        <span className="flex items-center gap-1.5">
                          <BriefcaseIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{job.duration}</span>
                        </span>
                      )}
                      {job.created_at && (
                        <span className="flex items-center gap-1.5">
                          <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{formatRelativeTime(job.created_at)}</span>
                        </span>
                      )}
                    </div>

                    {/* Job Description Preview */}
                    {job.description && (
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    {/* Skills/Tags */}
                    <div className="flex flex-wrap gap-2">
                      {job.category && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                          {job.category}
                        </span>
                      )}
                      {job.employment_type && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                          {job.employment_type}
                        </span>
                      )}
                      {job.experience_level && (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
                          {job.experience_level}
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                        {job.applications || 0} {t("pages.jobs.applicants")}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 md:ml-4 md:flex-shrink-0">
                    {role === "student" ? (
                      <div className="relative">
                        <button
                          onClick={() => !isApplyDisabled && handleApply(job)}
                          disabled={isApplyDisabled}
                          className={`w-full px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-semibold transition-all shadow-sm whitespace-nowrap text-sm cursor-pointer ${
                            isApplyDisabled
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60"
                              : "bg-green-600 hover:bg-green-700 hover:shadow-md text-white active:scale-95"
                          }`}
                        >
                          {hasAlreadyApplied
                            ? t("pages.jobs.applied")
                            : isCompletedJob
                            ? t("pages.jobs.completed", { defaultValue: "Completed" })
                            : t("pages.jobs.applyNow")}
                        </button>
                        {isCompletedJob && (
                          <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-center text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                            {t("pages.jobs.completedNoApplyMessage", {
                              defaultValue: "This job is already completed, so applications are closed.",
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                          className="px-4 md:px-5 py-2 md:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-sm whitespace-nowrap text-sm cursor-pointer hover:shadow-md active:scale-95"
                        >
                          {t("pages.jobs.viewDetails")}
                        </button>
                        {(role === "employer" || role === "superadmin") && (
                          <button
                            onClick={() =>
                              navigate(`/dashboard/jobs/${job.job_id}/applications`)
                            }
                            className="px-4 md:px-5 py-2 md:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all shadow-sm whitespace-nowrap text-sm cursor-pointer hover:shadow-md active:scale-95"
                          >
                            {t("pages.jobs.manage")} ({job.applications || 0})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Job Modal */}
      {selectedJob && (
        <ApplyJobModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
};

export default ActiveJobs;
