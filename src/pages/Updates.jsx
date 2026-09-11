import { useEffect, useState } from "react";
import {
  Bell,
  MapPin,
  Clock3,
  AlertCircle,
  CheckCircle2,
  Radio,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Updates() {
  const [updates, setUpdates] = useState([]);
  const [centres, setCentres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newArrivalToast, setNewArrivalToast] = useState("");

  const loadUpdates = async () => {
    try {
      const { data: updateData, error: updateError } = await supabase
        .from("updates")
        .select("*")
        .order("created_at", { ascending: false });

      if (updateError) throw updateError;

      const { data: centreData, error: centreError } = await supabase
        .from("procurement_centres")
        .select("id, name, location");

      if (centreError) console.error("Centres fetch error in Updates:", centreError);

      const centreMap = {};
      (centreData || []).forEach((centre) => {
        centreMap[centre.id] = centre;
      });

      setUpdates(updateData || []);
      setCentres(centreMap);
    } catch (err) {
      console.error("Updates error:", err);
      setError("Unable to load latest updates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      await loadUpdates();
    }
    init();

    // Supabase Realtime channel for live announcements
    const channel = supabase
      .channel("public:updates_feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "updates"
        },
        (payload) => {
          if (payload.new) {
            setUpdates((prev) => [payload.new, ...prev]);
            setNewArrivalToast(`New update: "${payload.new.title}"`);
            setTimeout(() => setNewArrivalToast(""), 4000);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "updates"
        },
        (payload) => {
          if (payload.new) {
            setUpdates((prev) =>
              prev.map((u) => (u.id === payload.new.id ? payload.new : u))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUpdateType = (title) => {
    const text = title?.toLowerCase() || "";
    if (text.includes("queue") || text.includes("waiting")) return "Queue Alert";
    if (text.includes("status") || text.includes("centre")) return "Centre Status";
    if (text.includes("procurement") || text.includes("paddy") || text.includes("crop")) return "Procurement Notice";
    return "Official Update";
  };

  const getUpdateIcon = (type) => {
    if (type.includes("Queue")) return <Clock3 size={20} />;
    if (type.includes("Centre")) return <CheckCircle2 size={20} />;
    return <Bell size={20} />;
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <span className="live-badge pulse-dot">
            <Radio size={14} /> Live app data (Supabase realtime)
          </span>
          <h1>
            <Bell className="inline-page-icon" size={32} />
            Important Updates
          </h1>
          <p>Stay informed with live centre announcements, weather alerts, and operational bulletins.</p>
        </div>
        <button
          className="refresh-btn"
          onClick={() => {
            setLoading(true);
            loadUpdates();
          }}
          title="Refresh updates"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* NEW ARRIVAL TOAST */}
      {newArrivalToast && (
        <div className="live-toast">
          <Sparkles size={18} />
          <span>{newArrivalToast}</span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="info-card update-loading">
          <div className="loading-circle" />
          <div>
            <h3>Loading updates...</h3>
            <p>Connecting to Supabase realtime feed...</p>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="update-error">
          <AlertCircle size={24} />
          <div>
            <strong>Unable to load updates</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && updates.length === 0 && (
        <div className="info-card">
          <div className="empty-update-icon">
            <Bell size={28} />
          </div>
          <h3>No new updates</h3>
          <p>There are no procurement announcements published at this moment.</p>
        </div>
      )}

      {/* UPDATES LIST */}
      {!loading && !error && updates.length > 0 && (
        <div className="updates-list">
          {updates.map((update, index) => {
            const centre = centres[update.centre_id];
            const type = getUpdateType(update.title);

            return (
              <div
                className={index === 0 ? "update-card latest-update" : "update-card"}
                key={update.id}
              >
                <div className="update-top">
                  <div className="update-icon">{getUpdateIcon(type)}</div>

                  <div className="update-title-area">
                    <div className="update-badges">
                      <span className="update-type">{type}</span>
                      {index === 0 && <span className="latest-badge">● Latest</span>}
                    </div>
                    <h3>{update.title}</h3>
                  </div>
                </div>

                <p className="update-message">{update.message}</p>

                {centre && (
                  <div className="update-centre">
                    <MapPin size={16} />
                    <div>
                      <strong>{centre.name}</strong>
                      <span>{centre.location}</span>
                    </div>
                  </div>
                )}

                <div className="update-time">
                  <Clock3 size={14} />
                  <span>
                    {update.created_at
                      ? new Date(update.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })
                      : "Recently updated"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DATA HONESTY NOTICE */}
      <div className="data-honesty-box">
        <small>
          ℹ️ <strong>System Notice:</strong> KisanFlow displays prototype procurement data powered by
          Supabase PostgreSQL realtime. In a full-scale deployment, this data layer can be directly integrated with official state agricultural civil supplies procurement APIs.
        </small>
      </div>
    </div>
  );
}

export default Updates;