import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import {
  getMyAcademicVerification,
  getPendingAcademicVerifications,
  reviewAcademicVerification,
} from "../../services/api/academicVerificationApi";

interface RootState {
  auth: {
    role: string;
  };
}

const PendingReviews: React.FC = () => {
  const role = useSelector((state: RootState) => state.auth.role);

  // -------- student state --------
  const [myVerification, setMyVerification] = useState<
    AcademicVerification | null
  >(null);
  const [uploading, setUploading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentSuccess, setStudentSuccess] = useState<string | null>(null);

  // -------- admin state --------
  const [pending, setPending] = useState<AcademicVerification[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>(
    {}
  );

  // ---------- helpers ----------
  const loadMyVerification = async () => {
    try {
      setStudentError(null);
      const res = await getMyAcademicVerification();
      setMyVerification(res.data);
    } catch (err: any) {
      // If not found, keep null
      setMyVerification(null);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not fetch academic verification";
      setStudentError(msg);
    }
  };

  const loadPendingForAdmin = async () => {
    try {
      setLoadingAdmin(true);
      setAdminError(null);
      const res = await getPendingAcademicVerifications({ page: 1, limit: 20 });
      setPending(res.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load pending academic verifications";
      setAdminError(msg);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (role === "student") {
      void loadMyVerification();
    } else if (role === "admin" || role === "superadmin" || role === "verifyDocAdmin") {
      void loadPendingForAdmin();
    }
  }, [role]);

  // ---------- handlers (student) ----------
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setStudentError(null);
      setStudentSuccess(null);

      // Decide whether to upload new or re-upload based on status
      if (myVerification && myVerification.status === "rejected") {
        const { reuploadAcademicVerification } = await import(
          "../../services/api/academicVerificationApi"
        );
        await reuploadAcademicVerification(myVerification.id, file);
        setStudentSuccess(
          "Document re-uploaded successfully. It will be reviewed again."
        );
      } else {
        const { uploadAcademicVerification } = await import(
          "../../services/api/academicVerificationApi"
        );
        await uploadAcademicVerification(file);
        setStudentSuccess(
          "Document uploaded successfully. Status is now pending."
        );
      }

      await loadMyVerification();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload document";
      setStudentError(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ---------- handlers (admin) ----------
  const handleReview = async (
    id: string,
    status: "accepted" | "rejected"
  ): Promise<void> => {
    try {
      setReviewLoadingId(id);
      setAdminError(null);

      const rejection_reason =
        status === "rejected" ? rejectionNotes[id] || "" : undefined;

      await reviewAcademicVerification({ id, status, rejection_reason });
      await loadPendingForAdmin();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to review academic verification";
      setAdminError(msg);
    } finally {
      setReviewLoadingId(null);
    }
  };

  // ===================== STUDENT VIEW =====================
  if (role === "student") {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <DocumentCheckIcon className="h-10 w-10 text-orange-600" />
            Academic Verification
          </h1>
          <p className="text-gray-500 mt-2">
            Upload your academic proof and track its verification status.
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Status
          </h2>

          {myVerification ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={
                    myVerification.status === "accepted"
                      ? "text-green-600 font-semibold"
                      : myVerification.status === "rejected"
                      ? "text-red-600 font-semibold"
                      : "text-orange-600 font-semibold"
                  }
                >
                  {myVerification.status}
                </span>
              </p>
              {myVerification.rejection_reason && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Rejection reason:</span>{" "}
                  {myVerification.rejection_reason}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              You have not uploaded any academic document yet.
            </p>
          )}
        </div>

        {/* Upload / Re-upload */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {myVerification && myVerification.status === "rejected"
              ? "Re-upload Document"
              : "Upload Document"}
          </h2>
          <p className="text-sm text-gray-500">
            Accepted formats: PDF, JPG, PNG, DOC, DOCX. Max size 10MB.
          </p>

          {studentError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {studentError}
            </div>
          )}

          {studentSuccess && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {studentSuccess}
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold cursor-pointer transition shadow-md">
            <span>{uploading ? "Uploading..." : "Choose file"}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          {myVerification && myVerification.status === "pending" && (
            <p className="text-xs text-gray-500 mt-2">
              Your document is pending review by an administrator.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ===================== ADMIN/VERIFYDOCADMIN VIEW =====================
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <DocumentCheckIcon className="h-10 w-10 text-orange-600" />
          Pending Reviews
        </h1>
        <p className="text-gray-500 mt-2">
          Academic verifications waiting for review
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Pending Reviews</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">
            {pending.length}
          </p>
        </div>
      </div>

      {adminError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {adminError}
        </div>
      )}

      {loadingAdmin ? (
        <p className="text-sm text-gray-500">Loading pending verifications…</p>
      ) : pending.length === 0 ? (
        <p className="text-sm text-gray-500">No pending verifications.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                      {item.user_id.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Student ID: {item.user_id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted on{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">
                      Storage Type
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.storage_type.toUpperCase()}
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-gray-500 font-medium block mb-1">
                      Rejection reason (required when rejecting)
                    </label>
                    <textarea
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={2}
                      placeholder="Enter reason if you reject this verification"
                      value={rejectionNotes[item.id] || ""}
                      onChange={(e) =>
                        setRejectionNotes((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <button
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap disabled:opacity-60"
                    disabled={reviewLoadingId === item.id}
                    onClick={() => handleReview(item.id, "accepted")}
                  >
                    {reviewLoadingId === item.id ? "Saving…" : "Approve"}
                  </button>
                  <button
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap disabled:opacity-60"
                    disabled={reviewLoadingId === item.id}
                    onClick={() => handleReview(item.id, "rejected")}
                  >
                    {reviewLoadingId === item.id ? "Saving…" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingReviews;
