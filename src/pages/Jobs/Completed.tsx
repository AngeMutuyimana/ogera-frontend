import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircleIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  SparklesIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useGetCompletedJobsQuery } from "../../services/api/jobsApi";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const Completed: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCompletedJobsQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const completedJobs = data?.data || [];

  // Filter jobs based on search and location
  const filteredJobs = completedJobs.filter((job: any) => {
    const matchesSearch =
      !searchQuery ||
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.employer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      !selectedLocation || job.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter
  const locations = Array.from(
    new Set(completedJobs.map((job: any) => job.location).filter(Boolean))
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 animate-fadeIn">
        <div className="px-6 py-16 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 font-medium">
              {t("pages.jobs.failedToLoadCompleted")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <CheckBadgeIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("pages.jobs.completedJobsTitle")}
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            {t("pages.jobs.jobsCompletedCount", { count: filteredJobs.length })} completed successfully
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("pages.jobs.searchPlaceholder") || "Search by job title or employer..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Location Filter */}
            <div className="relative md:w-72">
              <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white transition"
              >
                <option value="">{t("pages.jobs.allLocations")}</option>
                {locations.map((location: string) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Jobs Stats Banner */}
      {filteredJobs.length > 0 && (
        <div className="px-6 max-w-7xl mx-auto">
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-900 font-semibold text-base">
                  ✓ {filteredJobs.length} Completed Job{filteredJobs.length !== 1 ? "s" : ""}
                </p>
                <p className="text-emerald-700 text-sm mt-1">
                  Great work! These jobs have been successfully completed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="px-6 py-16 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedLocation
                ? t("pages.jobs.noJobsMatching")
                : t("pages.jobs.noCompletedJobs")}
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedLocation
                ? "Try adjusting your search or location filters"
                : t("pages.jobs.noCompletedJobsMessage")}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job: any) => {
              const employerName = job.employer?.full_name || t("pages.jobs.unknownEmployer");
              const companyInitial = employerName.charAt(0).toUpperCase();
              const completedDate = job.updated_at || job.created_at;

              return (
                <div
                  key={job.job_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-300 transition-all duration-200 overflow-hidden group"
                >
                  {/* Top colored bar - Green for completed */}
                  <div className="h-1.5 bg-linear-to-r from-emerald-500 to-teal-500"></div>

                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                          {companyInitial}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                                className="text-base font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                              >
                                {job.job_title}
                              </h3>
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <CheckBadgeIcon className="h-3 w-3" />
                                Completed
                              </span>
                            </div>
                            <p className="text-gray-700 font-medium text-sm mb-2">
                              {employerName}
                            </p>
                          </div>
                        </div>

                        {/* Job Info Row */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="h-3.5 w-3.5" />
                            ${job.budget?.toLocaleString() || t("pages.jobs.notSpecified")}
                          </span>
                          {job.duration && (
                            <span className="flex items-center gap-1">
                              <BriefcaseIcon className="h-3.5 w-3.5" />
                              {job.duration}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {t("pages.jobs.completed")} {completedDate ? formatRelativeTime(completedDate) : "N/A"}
                          </span>
                        </div>

                        {/* Job Description Preview */}
                        {job.description && (
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        )}

                        {/* Skills/Tags and Stats */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.category && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {job.category}
                            </span>
                          )}
                          {job.employment_type && (
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                              {job.employment_type}
                            </span>
                          )}
                          {job.experience_level && (
                            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                              {job.experience_level}
                            </span>
                          )}
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1">
                            <SparklesIcon className="h-3 w-3" />
                            {job.applications || 0} {t("pages.jobs.applicants")}
                          </span>
                        </div>

                        {/* Action Button */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-sm text-xs flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <ArrowRightIcon className="h-4 w-4" />
                            {t("pages.jobs.viewDetails")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Completed;

