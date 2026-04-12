import React, { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExclamationTriangleIcon, XMarkIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { createDispute, type CreateDisputeRequest } from "../../services/api/disputesApi";
import { useGetAllJobsQuery } from "../../services/api/jobsApi";
import { useGetStudentApplicationsQuery, useGetJobApplicationsQuery } from "../../services/api/jobApplicationApi";
import { useGetUserProfileQuery } from "../../services/api/authApi";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import * as Yup from "yup";
import { useSelector } from "react-redux";

const CreateDispute: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const user = useSelector((state: any) => state.auth.user);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        job_id: Yup.string().required(t("disputes.validationJobRequired")),
        type: Yup.string()
          .oneOf(["Payment", "Contract Violation", "Quality Issue", "Timeline"], t("disputes.validationInvalidType"))
          .required(t("disputes.validationTypeRequired")),
        title: Yup.string()
          .min(5, t("disputes.validationTitleMin"))
          .max(255, t("disputes.validationTitleMax"))
          .required(t("disputes.validationTitleRequired")),
        description: Yup.string()
          .min(20, t("disputes.validationDescriptionMin"))
          .required(t("disputes.validationDescriptionRequired")),
        priority: Yup.string().oneOf(["High", "Medium", "Low"]).optional(),
      }),
    [t]
  );

  // Fetch user's jobs (for students: jobs they applied to, for employers: jobs they posted)
  const { data: jobsData, isLoading: isLoadingJobs } = useGetAllJobsQuery();
  const { data: profileData } = useGetUserProfileQuery(undefined);
  const { data: studentApplications } = useGetStudentApplicationsQuery(undefined, {
    skip: role !== "student",
  });

  const allJobs = jobsData?.data || [];
  const currentUserId = profileData?.data?.user_id || user?.user_id;

  const jobs = React.useMemo(() => {
    if (role === "student") {
      const appliedJobIds = new Set(
        (studentApplications?.data || []).map((app: any) => app.job_id)
      );
      return allJobs.filter((job: any) => appliedJobIds.has(job.job_id));
    } else if (role === "employer") {
      if (currentUserId) {
        return allJobs.filter((job: any) => job.employer_id === currentUserId);
      }
      return [];
    }
    return allJobs;
  }, [role, allJobs, currentUserId, studentApplications?.data]);

  const formik = useFormik<CreateDisputeRequest>({
    initialValues: {
      job_id: "",
      job_application_id: "",
      type: "Payment" as const,
      title: "",
      description: "",
      priority: undefined,
      evidence_files: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const disputeData: CreateDisputeRequest = {
          ...values,
          evidence_files: selectedFiles.length > 0 ? selectedFiles : undefined,
        };
        await createDispute(disputeData);
        toast.success(t("disputes.disputeCreatedSuccess"));
        navigate("/dashboard/disputes/my-disputes");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t("disputes.failedToCreateDispute"));
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { data: jobApplicationsData } = useGetJobApplicationsQuery(formik.values.job_id, {
    skip: role !== "employer" || !formik.values.job_id,
  });

  useEffect(() => {
    if (formik.values.type === "Payment" && !formik.values.priority) {
      formik.setFieldValue("priority", "High");
    } else if (!formik.values.priority) {
      formik.setFieldValue("priority", "Medium");
    }
  }, [formik.values.type]);

  if (isLoadingJobs || (role === "employer" && !profileData && !user)) {
    return <Loader />;
  }

  return (
    <div className="create-page max-w-4xl mx-auto space-y-3 animate-fadeIn p-1">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
          {t("disputes.createTitle")}
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">{t("disputes.createSubtitle")}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 create-page-form">
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
              {t("disputes.selectJob")} <span className="text-red-500">*</span>
            </label>
            <select
              name="job_id"
              value={formik.values.job_id}
              onChange={(e) => {
                formik.handleChange(e);
                if (role === "employer") {
                  formik.setFieldValue("job_application_id", "");
                }
              }}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all ${
                formik.touched.job_id && formik.errors.job_id
                  ? "border-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <option value="">{t("disputes.selectJobPlaceholder")}</option>
              {isLoadingJobs ? (
                <option value="" disabled>{t("disputes.loadingJobs")}</option>
              ) : jobs.length === 0 && role === "employer" ? (
                <option value="" disabled>
                  {currentUserId ? t("disputes.noJobsEmployer") : t("disputes.loadingUserInfo")}
                </option>
              ) : jobs.length === 0 && role === "student" ? (
                <option value="" disabled>{t("disputes.noJobsStudent")}</option>
              ) : (
                jobs.map((job: any) => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.job_title} - {job.location} (${job.budget})
                  </option>
                ))
              )}
            </select>
            {formik.touched.job_id && formik.errors.job_id && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.job_id}</p>
            )}
          </div>

          {role === "employer" && formik.values.job_id && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                {t("disputes.selectStudentApplication")}
              </label>
              <select
                name="job_application_id"
                value={formik.values.job_application_id || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2.5 border border-red-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all hover:border-red-300"
              >
                <option value="">{t("disputes.autoSelectFirst")}</option>
                {(jobApplicationsData?.data || [])
                  .filter((app: any) => app.status === "Accepted" || app.status === "Hired")
                  .map((app: any) => (
                    <option key={app.application_id} value={app.application_id}>
                      {app.student?.full_name || t("disputes.studentLabel")} - {app.status} ({t("disputes.applied")}: {new Date(app.applied_at).toLocaleDateString()})
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">{t("disputes.studentApplicationHint")}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
              {t("disputes.disputeType")} <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all ${
                formik.touched.type && formik.errors.type ? "border-red-500" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <option value="Payment">{t("disputes.typePayment")}</option>
              <option value="Contract Violation">{t("disputes.typeContractViolation")}</option>
              <option value="Quality Issue">{t("disputes.typeQualityIssue")}</option>
              <option value="Timeline">{t("disputes.typeTimeline")}</option>
            </select>
            {formik.touched.type && formik.errors.type && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.type}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formik.values.type === "Payment" && t("disputes.paymentAutoHighHint")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
              {t("disputes.priority")} <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={formik.values.priority || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all ${
                formik.touched.priority && formik.errors.priority ? "border-red-500" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <option value="">{t("disputes.selectPriority")}</option>
              <option value="High">{t("disputes.high")}</option>
              <option value="Medium">{t("disputes.medium")}</option>
              <option value="Low">{t("disputes.low")}</option>
            </select>
            {formik.touched.priority && formik.errors.priority && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.priority}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
              {t("disputes.disputeTitle")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t("disputes.titlePlaceholder")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                formik.touched.title && formik.errors.title ? "border-red-500" : "border-gray-300 hover:border-gray-400"
              }`}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
              {t("disputes.description")} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={6}
              placeholder={t("disputes.descriptionPlaceholder")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all ${
                formik.touched.description && formik.errors.description ? "border-red-500" : "border-gray-300 hover:border-gray-400"
              }`}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{t("disputes.descriptionMinHint")}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
              {t("disputes.uploadEvidence")}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-500 hover:bg-red-50/30 transition-all duration-200">
              <input
                type="file"
                id="evidence-upload"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                  <PaperClipIcon className="h-7 w-7 text-red-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{t("disputes.clickToUpload")}</span>
                <span className="text-xs text-gray-500 mt-1">{t("disputes.fileTypesHint")}</span>
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">{selectedFiles.length} {selectedFiles.length === 1 ? "file" : "files"} uploaded</p>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gradient-to-r from-red-50 to-white border border-red-100 p-3 rounded-lg hover:border-red-200 transition-all">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                        <PaperClipIcon className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all flex-shrink-0"
                      title="Remove file"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formik.values.priority && (
            <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-red-800 font-medium">
                <span className="font-semibold">{t("disputes.priority")}:</span> <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold ml-2">{formik.values.priority}</span>
                {formik.values.type === "Payment" && <span className="text-xs text-red-600 ml-2 italic">{t("disputes.priorityAutoSet")}</span>}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
            >
              {t("disputes.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("disputes.submitting") : t("disputes.submitDispute")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDispute;
