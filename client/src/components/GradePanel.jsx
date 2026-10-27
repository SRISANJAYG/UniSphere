import { useState } from "react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
export default function GradePanel({ assignment, onUpdate }) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);
  const grade = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const { data } = await API.post(
        "/api/assignments/" + assignment._id + "/grade",
        {
          studentId: form.get("studentId"),
          grade: Number(form.get("grade")),
          feedback: form.get("feedback"),
        },
      );
      addToast(data.message, "success");
      onUpdate();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Could not save grade",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="my-5 flex flex-col gap-4">
      <h4 className="font-bold text-sm">Review submissions</h4>
      {!assignment.submissions?.length && (
        <p className="text-xs text-slate-400">No submissions yet.</p>
      )}
      {assignment.submissions?.map((sub) => (
        <form
          key={sub._id}
          onSubmit={grade}
          className="border border-white/10 p-4 rounded-xl flex flex-col gap-3"
        >
          <p className="text-sm font-semibold">{sub.student?.name}</p>
          <p className="text-xs whitespace-pre-wrap">{sub.submissionText}</p>
          {sub.attachmentUrl && (
            <a
              href={sub.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sky-200"
            >
              Open submission link ↗
            </a>
          )}
          <input type="hidden" name="studentId" value={sub.student?._id} />
          <input
            aria-label="Grade"
            name="grade"
            type="number"
            min="0"
            max={assignment.maxPoints}
            required
            defaultValue={sub.grade ?? ""}
            placeholder={"Grade out of " + assignment.maxPoints}
            className="input-field text-xs"
          />
          <textarea
            aria-label="Feedback"
            name="feedback"
            defaultValue={sub.feedback || ""}
            placeholder="Feedback"
            className="input-field text-xs"
          />
          <button disabled={busy} className="btn-primary self-end text-xs">
            Save grade
          </button>
        </form>
      ))}
    </section>
  );
}
