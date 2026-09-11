import { useEffect, useState } from "react";
import { History as HistoryIcon, MapPin, CalendarDays, Scale, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

function History() {
  const [history, setHistory] = useState([]);
  const [centres, setCentres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      // Load all procurement records
      const { data: procData, error: procError } = await supabase
        .from("procurements")
        .select("*")
        .order("created_at", { ascending: false });

      if (procError) throw procError;

      // Load centres for names
      const { data: centreData, error: centreError } = await supabase
        .from("procurement_centres")
        .select("id, name, location");

      if (centreError) console.error("Centres fetch error in History:", centreError);

      const centreMap = {};
      (centreData || []).forEach((c) => {
        centreMap[c.id] = c;
      });

      setCentres(centreMap);
      setHistory(procData || []);
    } catch (err) {
      console.error("History fetch error:", err);
      setError("Unable to load procurement history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <span className="live-badge">Live app data (Supabase)</span>
          <h1>
            <HistoryIcon className="inline-page-icon" size={32} />
            Procurement History
          </h1>
          <p>Review past crop procurement records, verified quantities and status.</p>
        </div>
        <button className="refresh-btn" onClick={loadHistory} title="Refresh history">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="info-card">
          <div className="loading-state">
            <div className="loading-circle" />
            <div>
              <h3>Loading history...</h3>
              <p>Fetching your past procurement records.</p>
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="info-card error-card">
          <h3>Unable to load history</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="info-card">
          <h3>No procurement history</h3>
          <p>Your past procurement records will appear here once submitted and verified.</p>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item) => {
            const centre = centres[item.centre_id];
            const isCompleted = item.status === "Completed" || item.status === "Accepted";

            return (
              <div className="info-card history-record-card" key={item.id}>
                <div className="history-record-top">
                  <div>
                    <span className="record-id">ID: KF-{item.id}</span>
                    <h3>🌾 {item.crop}</h3>
                  </div>
                  <span className={`record-status-pill ${isCompleted ? "status-success" : "status-processing"}`}>
                    ● {item.status}
                  </span>
                </div>

                <div className="history-record-meta">
                  <div className="meta-item">
                    <Scale size={16} />
                    <div>
                      <small>Quantity</small>
                      <strong>{item.quantity} kg</strong>
                    </div>
                  </div>

                  <div className="meta-item">
                    <MapPin size={16} />
                    <div>
                      <small>Centre</small>
                      <strong>{centre?.name || `Centre #${item.centre_id}`}</strong>
                      <span>{centre?.location || "Procurement Centre"}</span>
                    </div>
                  </div>

                  <div className="meta-item">
                    <CalendarDays size={16} />
                    <div>
                      <small>Date</small>
                      <strong>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          : "Recent"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
