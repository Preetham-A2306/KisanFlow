import { useEffect, useState } from "react";
import {
  PackageCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  History
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Track() {
  const [procurement, setProcurement] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProcurement();
  }, []);

  const loadProcurement = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("procurements")
      .select("*")
      .eq("farmer_id", 1)
      .order("created_at", { ascending: false });

    console.log("PROCUREMENT HISTORY:", data);
    console.log("PROCUREMENT ERROR:", error);

    if (error) {
      setError("Unable to load procurement information.");
      setLoading(false);
      return;
    }

    setHistory(data || []);
    setProcurement(data?.[0] || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="page">
        <PackageCheck size={35} />
        <h1>Track Procurement</h1>
        <p>Loading procurement status...</p>

        <div className="info-card">
          <h3>Please wait...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PackageCheck size={35} />
        <h1>Track Procurement</h1>

        <div className="info-card">
          <h3>Unable to load</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const status = procurement?.status || "Processing";

  return (
    <div className="page">
      <PackageCheck size={35} />

      <h1>Track Procurement</h1>

      <p>Check the current status of your procurement.</p>

      {/* CURRENT PROCUREMENT */}

      <div className="track-summary">
        <div>
          <span>PROCUREMENT ID</span>
          <strong>KF{procurement?.id || "1024"}</strong>
        </div>

        <div>
          <span>CROP</span>
          <strong>🌾 {procurement?.crop || "Paddy"}</strong>
        </div>

        <div>
          <span>QUANTITY</span>
          <strong>{procurement?.quantity || 250} kg</strong>
        </div>
      </div>

      <div className="info-card track-card">
        <div className="track-status-header">
          <div>
            <span className="schedule-label">
              CURRENT STATUS
            </span>

            <h3>{status}</h3>
          </div>

          <div className="track-status-icon">
            <PackageCheck size={25} />
          </div>
        </div>

        <div className="tracking">

          <div className="completed track-step">
            <CheckCircle2 size={19} />

            <div>
              <strong>Submitted</strong>

              <span>
                Procurement request submitted
              </span>
            </div>
          </div>

          <div className="completed track-step">
            <CheckCircle2 size={19} />

            <div>
              <strong>Quality Check</strong>

              <span>
                Crop quality verification completed
              </span>
            </div>
          </div>

          <div className="current track-step">
            <Clock3 size={19} />

            <div>
              <strong>Procurement Processing</strong>

              <span>
                Your procurement is currently being processed
              </span>
            </div>
          </div>

          <div className="track-step pending">
            <CreditCard size={19} />

            <div>
              <strong>Payment Pending</strong>

              <span>
                Payment will be processed after completion
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* INFORMATION */}

      <div className="track-info">
        <CheckCircle2 size={20} />

        <div>
          <strong>
            Your procurement is being processed.
          </strong>

          <p>
            You can check this page again for the latest
            procurement status.
          </p>
        </div>
      </div>

      {/* PROCUREMENT HISTORY */}

      <section className="history-section">

        <div className="history-heading">
          <div>
            <span className="schedule-label">
              PREVIOUS RECORDS
            </span>

            <h2>
              Procurement History
            </h2>
          </div>

          <History size={25} />
        </div>

        {history.length === 0 && (
          <div className="info-card">
            <h3>No procurement history</h3>

            <p>
              Your previous procurement records will appear here.
            </p>
          </div>
        )}

        {history.map((item) => (
          <div className="history-card" key={item.id}>

            <div className="history-top">

              <div>
                <span className="history-id">
                  KF{item.id}
                </span>

                <h3>
                  🌾 {item.crop}
                </h3>
              </div>

              <span
                className={
                  item.status === "Completed"
                    ? "history-status completed-status"
                    : "history-status processing-status"
                }
              >
                ● {item.status}
              </span>

            </div>

            <div className="history-details">

              <div>
                <span>QUANTITY</span>
                <strong>
                  {item.quantity} kg
                </strong>
              </div>

              <div>
                <span>DATE</span>
                <strong>
                  {item.created_at
                    ? new Date(
                        item.created_at
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                    : "Recent"}
                </strong>
              </div>

            </div>

          </div>
        ))}

      </section>
    </div>
  );
}

export default Track;