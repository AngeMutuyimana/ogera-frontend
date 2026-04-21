import React from "react";
import { useSelector } from "react-redux";
import { CloudArrowUpIcon, DocumentIcon, EyeIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
  useAddAcademicRecordMutation,
  useDeleteAcademicRecordMutation,
  useGetAllAcademicRecordsQuery,
  useGetMyAcademicRecordsQuery,
} from "../services/api/academicRecordsApi";

const AcademicRecords: React.FC = () => {
  const roleRaw = useSelector((state: any) => state.auth.role);
  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : "";
  const isSuperAdmin = role === "superadmin";

  const { data: myData, isLoading: myLoading } = useGetMyAcademicRecordsQuery(undefined, {
    skip: isSuperAdmin,
  });
  const { data: allData, isLoading: allLoading } = useGetAllAcademicRecordsQuery(undefined, {
    skip: !isSuperAdmin,
  });
  const [addAcademicRecord, { isLoading: submitting }] = useAddAcademicRecordMutation();
  const [deleteAcademicRecord, { isLoading: deleting }] = useDeleteAcademicRecordMutation();

  const [form, setForm] = React.useState({
    academic_profile: "schooling" as "schooling" | "college",
    class_name: "",
    board: "",
    degree: "",
    university: "",
    percentage: "",
    grade: "",
  });
  const [certificateFile, setCertificateFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [previewType, setPreviewType] = React.useState<"pdf" | "image" | "doc" | "other">("other");

  const records = (isSuperAdmin ? allData?.data : myData?.data) || [];

  const averagePercentage =
    records.length > 0
      ? records.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / records.length
      : 0;
  const intelligenceBoost = averagePercentage * 0.3;

  const getDisplayProfile = (record: any): "schooling" | "college" => {
    if (record.academic_profile === "schooling" || record.academic_profile === "college") {
      return record.academic_profile;
    }
    if (record.academic_profile === "10" || record.academic_profile === "12") return "schooling";
    if (record.academic_profile === "graduation") return "college";
    return "schooling";
  };

  const getDisplayDetails = (record: any): string => {
    const profile = getDisplayProfile(record);
    if (profile === "schooling") {
      const className = record.class_name || (record.academic_profile === "10" || record.academic_profile === "12" ? record.academic_profile : "-");
      const board = record.board || "-";
      return `${className} / ${board}`;
    }
    const degree = record.degree || (record.academic_profile === "graduation" ? "Graduation" : "-");
    const university = record.university || "-";
    return `${degree} / ${university}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!form.academic_profile) {
      setError("Academic profile is required.");
      return;
    }
    if (!form.percentage) {
      setError("Percentage is required.");
      return;
    }
    if (form.academic_profile === "schooling") {
      if (!form.class_name.trim()) {
        setError("Class is required for schooling.");
        return;
      }
      if (!form.board.trim()) {
        setError("Board is required for schooling.");
        return;
      }
    }
    if (form.academic_profile === "college") {
      if (!form.degree.trim()) {
        setError("Degree is required for college.");
        return;
      }
      if (!form.university.trim()) {
        setError("University is required for college.");
        return;
      }
    }
    if (!certificateFile) {
      setError("Certificate upload is required.");
      return;
    }
    try {
      const payload = new FormData();
      payload.append("academic_profile", form.academic_profile);
      payload.append("percentage", form.percentage);
      if (form.grade) payload.append("grade", form.grade);
      if (form.academic_profile === "schooling") {
        payload.append("class_name", form.class_name);
        payload.append("board", form.board);
      } else {
        payload.append("degree", form.degree);
        payload.append("university", form.university);
      }
      if (certificateFile) {
        payload.append("certificate", certificateFile);
      }

      await addAcademicRecord(payload).unwrap();
      setMessage("Academic record added successfully.");
      setForm({
        academic_profile: "schooling",
        class_name: "",
        board: "",
        degree: "",
        university: "",
        percentage: "",
        grade: "",
      });
      setCertificateFile(null);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to add academic record.");
    }
  };

  const handleDelete = async (recordId: string) => {
    setMessage("");
    setError("");
    const confirmed = window.confirm("Are you sure you want to delete this academic record?");
    if (!confirmed) return;

    try {
      await deleteAcademicRecord(recordId).unwrap();
      setMessage("Academic record deleted successfully.");
    } catch (err: any) {
      setError(err?.data?.message || "Failed to delete academic record.");
    }
  };

  const handleViewCertificate = async (recordId: string) => {
    setMessage("");
    setError("");
    try {
      const baseUrl = (import.meta as any).env?.VITE_API_URL || "/api";
      const response = await fetch(`${baseUrl}/academic-records/${recordId}/certificate`, {
        method: "GET",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        let errMessage = "Failed to load certificate.";
        try {
          const errJson = await response.json();
          errMessage = errJson?.message || errMessage;
        } catch {
          // ignore parse failures
        }
        throw new Error(errMessage);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = await response.json();
        if (payload?.url) {
          setPreviewUrl(payload.url);
          if (payload.url.endsWith(".pdf")) {
            setPreviewType("pdf");
          } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(payload.url)) {
            setPreviewType("image");
          } else if (/\.(doc|docx)$/i.test(payload.url)) {
            setPreviewType("doc");
          } else {
            setPreviewType("other");
          }
          setPreviewOpen(true);
          return;
        }
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      if (contentType.includes("pdf")) {
        setPreviewType("pdf");
      } else if (contentType.startsWith("image/")) {
        setPreviewType("image");
      } else if (
        contentType.includes("word") ||
        contentType.includes("officedocument")
      ) {
        setPreviewType("doc");
      } else {
        setPreviewType("other");
      }
      setPreviewUrl(blobUrl);
      setPreviewOpen(true);
    } catch (err: any) {
      const viewError = err?.message || "Failed to view certificate.";
      setError(viewError);
      toast.error(viewError);
    }
  };

  const closePreview = () => {
    if (previewUrl.startsWith("blob:")) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewOpen(false);
    setPreviewUrl("");
    setPreviewType("other");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Records</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isSuperAdmin
            ? "Superadmin can view records only."
            : "Choose schooling or college, then fill related details."}
        </p>
      </div>

      {!isSuperAdmin && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Profile</label>
            <select
              value={form.academic_profile}
              onChange={(e) =>
                setForm((s) => ({ ...s, academic_profile: e.target.value as "schooling" | "college" }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="schooling">Schooling</option>
              <option value="college">College</option>
            </select>
          </div>
          {form.academic_profile === "schooling" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  value={form.class_name}
                  onChange={(e) => setForm((s) => ({ ...s, class_name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="10 or 12"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                <input
                  type="text"
                  value={form.board}
                  onChange={(e) => setForm((s) => ({ ...s, board: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="CBSE, ICSE, State Board, etc."
                  required
                />
              </div>
            </>
          )}
          {form.academic_profile === "college" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={form.degree}
                  onChange={(e) => setForm((s) => ({ ...s, degree: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="B.Tech, BSc, MBA, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input
                  type="text"
                  value={form.university}
                  onChange={(e) => setForm((s) => ({ ...s, university: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="University name"
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.percentage}
              onChange={(e) => setForm((s) => ({ ...s, percentage: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <input
              type="text"
              value={form.grade}
              onChange={(e) => setForm((s) => ({ ...s, grade: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="A+, Distinction, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Certificate</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border border-dashed border-[#7F56D9]/50 px-3 py-2.5 text-left hover:bg-[#7F56D9]/5 transition flex items-center gap-2"
            >
              <CloudArrowUpIcon className="h-5 w-5 text-[#7F56D9]" />
              <span className="text-sm text-gray-700">
                {certificateFile ? certificateFile.name : "Upload certificate"}
              </span>
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg bg-[#7F56D9] text-white disabled:opacity-60 hover:bg-[#6941c6] transition font-medium"
            >
              {submitting ? "Saving..." : "Add Record"}
            </button>
          </div>
          {message && <p className="md:col-span-2 text-sm text-green-600">{message}</p>}
          {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Records</h2>
          <div className="text-sm text-gray-600 font-medium">
            Avg %: <span className="font-semibold">{averagePercentage.toFixed(2)}</span> | I +30%:{" "}
            <span className="font-semibold">{intelligenceBoost.toFixed(2)}</span>
          </div>
        </div>
        {(myLoading || allLoading) ? (
          <p className="text-sm text-gray-500">Loading records...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-500">No academic records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50/80">
                  {isSuperAdmin && <th className="py-2 pr-4">Student</th>}
                  <th className="py-2 pr-4">Profile</th>
                  <th className="py-2 pr-4">Details</th>
                  <th className="py-2 pr-4">Percentage</th>
                  <th className="py-2 pr-4">Grade</th>
                  <th className="py-2 pr-4">Certificate</th>
                  <th className="py-2 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.record_id} className="border-b last:border-b-0 hover:bg-gray-50/60 transition">
                    {isSuperAdmin && (
                      <td className="py-2 pr-4">
                        {record.user?.full_name || "N/A"} ({record.user?.email || "N/A"})
                      </td>
                    )}
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center rounded-full bg-[#7F56D9]/10 text-[#7F56D9] px-2.5 py-1 text-xs font-semibold capitalize">
                        {getDisplayProfile(record)}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-medium text-gray-700">
                      {getDisplayDetails(record)}
                    </td>
                    <td className="py-2 pr-4">{record.percentage}</td>
                    <td className="py-2 pr-4">{record.grade || "-"}</td>
                    <td className="py-2 pr-4">
                      {record.certificate_path ? (
                        <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                          <DocumentIcon className="h-4 w-4" />
                          Uploaded
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewCertificate(record.record_id)}
                          disabled={!record.certificate_path}
                          className="inline-flex items-center justify-center rounded-lg border border-[#7F56D9]/30 p-2 text-[#7F56D9] hover:bg-[#7F56D9]/10 disabled:opacity-40"
                          title="View certificate"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record.record_id)}
                          disabled={deleting}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                          title="Delete record"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">Certificate Preview</h3>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-md p-1.5 hover:bg-gray-200 text-gray-700"
                title="Close preview"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              {previewType === "image" && (
                <div className="h-full w-full flex items-center justify-center p-3">
                  <img src={previewUrl} alt="Certificate preview" className="max-h-full max-w-full object-contain rounded" />
                </div>
              )}
              {previewType === "pdf" && (
                <iframe title="Certificate PDF Preview" src={previewUrl} className="w-full h-full border-0" />
              )}
              {(previewType === "doc" || previewType === "other") && (
                <iframe
                  title="Certificate Document Preview"
                  src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(previewUrl)}`}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicRecords;
