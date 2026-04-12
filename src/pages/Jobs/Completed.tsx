import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useGetCompletedJobsQuery } from "../../services/api/jobsApi";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const Completed: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCompletedJobsQuery();

  const completedJobs = data?.data || [];

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            {t("pages.jobs.failedToLoadCompleted")}
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
          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
          {t("pages.jobs.completedJobsTitle")}
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">{t("pages.jobs.completedSubtitle")}</p>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 shadow-sm rounded-xl p-4">
        <p className="text-blue-800 font-semibold text-sm">{t("pages.jobs.jobsCompletedCount", { count: completedJobs.length })}</p>
      </div>

      {completedJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("pages.jobs.noCompletedJobs")}
          </h3>
          <p className="text-gray-500 text-sm">
            {t("pages.jobs.noCompletedJobsMessage")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("pages.jobs.jobTitle")}</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("pages.jobs.employer")}</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("pages.jobs.location")}</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("pages.jobs.budget")}</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("pages.jobs.applicants")}</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("pages.jobs.completedDate")}</th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("pages.jobs.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {completedJobs.map((job: any) => {
                const employerName = job.employer?.full_name || t("pages.jobs.unknownEmployer");
                const completedDate = job.updated_at || job.created_at;

                return (
                  <tr key={job.job_id} className="hover:bg-blue-50/30 transition-colors duration-150">
                    <td className="px-4 md:px-6 py-3 font-semibold text-gray-900">{job.job_title}</td>
                    <td className="px-4 md:px-6 py-3 text-gray-600 text-xs md:text-sm">{employerName}</td>
                    <td className="px-4 md:px-6 py-3 text-gray-600 text-xs md:text-sm">{job.location}</td>
                    <td className="px-4 md:px-6 py-3 text-gray-600 text-xs md:text-sm font-medium">${job.budget?.toLocaleString() || t("common.na")}</td>
                    <td className="px-4 md:px-6 py-3 text-gray-600 text-xs md:text-sm">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                        {job.applications || 0}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 text-gray-600 text-xs md:text-sm whitespace-nowrap">
                      {completedDate ? formatRelativeTime(completedDate) : t("common.na")}
                    </td>
                    <td className="px-4 md:px-6 py-3 text-right">
                      <button
                        onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all text-xs md:text-sm cursor-pointer hover:shadow-md active:scale-95"
                      >
                        {t("pages.jobs.viewDetails")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Completed;

