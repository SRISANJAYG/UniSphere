import { useState } from "react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
export default function PublishPanel({
  basePath,
  onUpdate,
  resources = false,
}) {
  const [kind, setKind] = useState("announcement");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const { addToast } = useToast();
  const publish = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await API.post(basePath + "/" + kind, {
        title,
        ...(kind === "resource"
          ? { url: value, type: "Document" }
          : { content: value }),
      });
      onUpdate(data);
      setTitle("");
      setValue("");
      addToast(data.message, "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Could not publish.", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      onSubmit={publish}
      className="p-4 border border-white/10 rounded-xl flex flex-col gap-3 my-5"
    >
      <h4 className="text-sm font-semibold">Publish to this community</h4>
      {resources && (
        <select
          aria-label="Publication type"
          className="input-field text-xs"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="announcement">Announcement</option>
          <option value="resource">Learning resource</option>
        </select>
      )}
      <input
        aria-label="Title"
        placeholder="Title"
        className="input-field text-xs"
        required
        maxLength={150}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {kind === "resource" ? (
        <input
          aria-label="Resource URL"
          placeholder="https://…"
          type="url"
          required
          className="input-field text-xs"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <textarea
          aria-label="Announcement"
          placeholder="What should members know?"
          required
          className="input-field text-xs"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
      <button disabled={busy} className="btn-primary self-end text-xs">
        {busy ? "Publishing…" : "Publish"}
      </button>
    </form>
  );
}
