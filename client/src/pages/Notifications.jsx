import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import API from "../api/axios";
export default function Notifications() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    API.get("/api/notifications")
      .then(({ data }) => {
        setItems(data.notifications);
        setError("");
      })
      .catch(() => setError("Could not load notifications."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const mark = async (id) => {
    try {
      await API.put("/api/notifications/" + (id ? id + "/read" : "read-all"));
      setItems((prev) =>
        prev.map((item) =>
          !id || item._id === id ? { ...item, isRead: true } : item,
        ),
      );
    } catch {
      setError("Could not update notifications.");
    }
  };
  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-2">YOUR CAMPUS CONNECTIONS</p>
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
        <button
          onClick={() => mark()}
          disabled={!items.some((item) => !item.isRead)}
          className="btn-secondary text-xs"
        >
          <CheckCheck size={16} />
          Mark all read
        </button>
      </div>
      {error && (
        <div role="alert" className="glass-card p-5">
          {error}
          <button onClick={load} className="btn-secondary ml-4">
            Retry
          </button>
        </div>
      )}
      {loading ? (
        <p className="p-8 text-slate-400">Loading notifications…</p>
      ) : items.length ? (
        items.map((item) => (
          <article
            key={item._id}
            className={
              "glass-card p-5 flex gap-4 " + (item.isRead ? "opacity-60" : "")
            }
          >
            <Bell size={20} className="shrink-0 text-sky-300" />
            <div className="flex-1">
              <p className="text-sm">{item.message}</p>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            {!item.isRead && (
              <button
                className="text-xs text-sky-200"
                onClick={() => mark(item._id)}
              >
                Mark read
              </button>
            )}
          </article>
        ))
      ) : (
        <div className="glass-card p-12 text-center text-slate-400">
          You're all caught up. New campus activity will appear here.
        </div>
      )}
    </div>
  );
}
