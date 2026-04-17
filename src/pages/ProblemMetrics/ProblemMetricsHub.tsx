import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PuzzlePieceIcon, PlusIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import {
  useListProblemMetricsAdminQuery,
  useCreateProblemMetricMutation,
  type ProblemMetricCategory,
} from "../../services/api/problemMetricApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const ProblemMetricsHub: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useListProblemMetricsAdminQuery();
  const [createMetric, { isLoading: creating }] = useCreateProblemMetricMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProblemMetricCategory>("visual_puzzle");

  const metrics = data?.data ?? [];

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      const res = await createMetric({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
      }).unwrap();
      toast.success(res.message || "Problem metric created");
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setCategory("visual_puzzle");
      refetch();
      const id = res.data?.problem_metric_id;
      if (id) navigate(`/dashboard/problem-metrics/edit/${id}`);
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Could not create problem metric");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#7F56D9]/15 text-[#7F56D9]">
            <PuzzlePieceIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Problem metrics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create puzzle questions, publish them, and let students build intelligence through attempts.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7F56D9] text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-[#7F56D9]/25 hover:bg-[#6941c6] transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New puzzle set
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Create problem metric</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</span>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Visual puzzles - Set A"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Description (optional)
              </span>
              <textarea
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Puzzle type</span>
              <select
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProblemMetricCategory)}
              >
                <option value="visual_puzzle">Visual puzzle</option>
                <option value="situational_puzzle">Situational puzzle</option>
                <option value="riddle">Riddle</option>
                <option value="other">Other puzzle</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={handleCreate}
              className="px-4 py-2 text-sm rounded-xl bg-[#7F56D9] text-white font-medium disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create puzzle set"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 overflow-hidden shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-gray-500">Loading puzzle sets...</p>
        ) : metrics.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No problem metrics yet. Create a visual puzzle, situational puzzle, riddle, or another puzzle set to get started.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {metrics.map((metric) => (
              <li
                key={metric.problem_metric_id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{metric.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {metric.category.replaceAll("_", " ")} · {metric.question_count} question
                    {metric.question_count === 1 ? "" : "s"} ·{" "}
                    {metric.published ? (
                      <span className="text-emerald-600 font-medium">Published</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Draft</span>
                    )}
                  </p>
                </div>
                <Link
                  to={`/dashboard/problem-metrics/edit/${metric.problem_metric_id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#7F56D9] hover:text-[#5b3ba5]"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit & questions
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProblemMetricsHub;
