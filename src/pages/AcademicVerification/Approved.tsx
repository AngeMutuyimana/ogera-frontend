import React, { useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import { getAcademicVerificationsByStatus } from "../../services/api/academicVerificationApi";

const Approved: React.FC = () => {
  const [approved, setApproved] = useState<AcademicVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApproved = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAcademicVerificationsByStatus("accepted", {
          page: 1,
          limit: 50,
        });
        setApproved(res.data || []);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load approved verifications";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void loadApproved();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
          Approved Verifications
        </h1>
        <p className="text-gray-500 mt-2">
          Successfully verified academic credentials
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
        <p className="text-green-800 font-medium">
          ✓ {approved.length} verification{approved.length !== 1 ? "s" : ""}{" "}
          approved
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading approved verifications…</p>
      ) : approved.length === 0 ? (
        <p className="text-sm text-gray-500">No approved verifications yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Approved Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Reviewed By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {approved.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        {item.user?.full_name?.charAt(0)?.toUpperCase() ||
                          item.user_id.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {item.user?.full_name || `User ${item.user_id.slice(0, 8)}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.user?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.reviewed_at
                      ? new Date(item.reviewed_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.reviewer?.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Approved;
