import { useEffect, useState } from "react";
import {
  PackageCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  AlertCircle,
  RefreshCw,
  MapPin,
  XCircle
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Track() {
  const [procurement, setProcurement] = useState(null);
  const [centres, setCentres] = useState([]);
  const [selectedCentreName, setSelectedCentreName] = useState(
    () => localStorage.getItem("kisanflow_centre") || ""
  );
  const [selectedCrop, setSelectedCrop] = useState(
    () => localStorage.getItem("kisanflow_crop") || ""
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCentresAndProcurement();

    // Supabase Realtime subscription for procurements
    const channel = supabase
      .channel("public:procurements_tracking")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "procurements"
        },
        () => {
          loadCentresAndProcurement();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCentreName, selectedCrop]);

  const loadCentresAndProcurement = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Fetch centres
      const { data: centreList, error: centreErr } = await supabase
        .from("procurement_centres")
        .select("*")
        .order("id", { ascending: true });

      if (centreErr) throw centreErr;
      setCentres(centreList || []);

      let centreObj = null;
      if (selectedCentreName && centreList) {
        centreObj = centreList.find(
          (c) => c.name.toLowerCase() === selectedCentreName.toLowerCase()
        );
      }
      if (!centreObj && centreList && centreList.length > 0) {
        centreObj = centreList[0];
        setSelectedCentreName(centreObj.name);
      }

      const activeCrop = selectedCrop || centreObj?.crop || "Paddy";

      // 2. Fetch procurement record matching this crop and centre
      let query = supabase.from("procurements").select("*");

      if (centreObj) {
        query = query.eq("centre_id", centreObj.id);
      }
      if (activeCrop) {
        query = query.ilike("crop", `%${activeCrop}%`);
      }

      const { data: procData, error: procErr } = await query
        .order("created_at", { ascending: false })
        .limit(1);

      if (procErr) throw procErr;

      if (procData && procData.length > 0) {
        setProcurement(procData[0]);
      } else {
        setProcurement(null);
      }
    } catch (err) {
      console.error("Tracking fetch error:", err);
      setError("Unable to load procurement information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentCentre = centres.find(
    (c) => c.name.toLowerCase() === selectedCentreName.toLowerCase()
  );

  // Status mapping for the visual timeline
  // Possible: Submitted, Quality Check, Processing, Accepted, Completed, Rejected
  const status = procurement?.status || "";

  const isRejected = status.toLowerCase() === "rejected";
  const isCompleted = status.toLowerCase() === "completed";
  const isAccepted = status.toLowerCase() === "accepted" || isCompleted;
  const isProcessing =
    status.toLowerCase() === "processing" || isAccepted;
  const isSubmitted = Boolean(procurement);

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <span className="live-badge">● Live app data (Supabase realtime)</span>
          <h1>
            <PackageCheck className="inline-page-icon" size={32} />
            Track Procurement
          </h1>
          <p>Check the verified stage and current progress of your crop consignment.</p>
        </div>
        <button
          className="refresh-btn"
          onClick={loadCentresAndProcurement}
          title="Refresh tracking status"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* CROP & CENTRE SELECTOR */}
      <div className="track-filter-bar">
        <div className="filter-group">
          <label htmlFor="track-centre-select">Procurement Centre:</label>
          <select
            id="track-centre-select"
            value={selectedCentreName}
            onChange={(e) => {
              setSelectedCentreName(e.target.value);
              localStorage.setItem("kisanflow_centre", e.target.value);
            }}
          >
            {centres.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.crop})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="track-crop-input">Selected Crop:</label>
          <input
            id="track-crop-input"
            type="text"
            value={selectedCrop || currentCentre?.crop || ""}
            onChange={(e) => {
              setSelectedCrop(e.target.value);
              localStorage.setItem("kisanflow_crop", e.target.value);
            }}
            placeholder="e.g. Paddy"
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="info-card">
          <div className="loading-state">
            <div className="loading-circle" />
            <div>
              <h3>Loading procurement status...</h3>
              <p>Fetching records from Supabase database.</p>
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="info-card error-card">
          <h3>Unable to load procurement status</h3>
          <p>{error}</p>
        </div>
      )}

      {/* EMPTY: NO RECORD FOUND FOR SELECTED CROP AND CENTRE */}
      {!loading && !error && !procurement && (
        <div className="info-card empty-record-card">
          <AlertCircle size={40} className="empty-alert-icon" />
          <h3>No procurement record found for this crop and centre.</h3>
          <p>
            We couldn't find an active procurement transaction for <strong>{selectedCrop || "this crop"}</strong> at{" "}
            <strong>{selectedCentreName || "this centre"}</strong>.
          </p>
          <span className="empty-tip">
            💡 Tip: Ensure your token has been verified at the centre counter, or select a different centre above.
          </span>
        </div>
      )}

      {/* RECORD FOUND: DISPLAY REALISTIC TRACKING CARD */}
      {!loading && !error && procurement && (
        <>
          <div className="track-summary">
            <div>
              <span>PROCUREMENT ID</span>
              <strong>KF-{procurement.id}</strong>
            </div>

            <div>
              <span>CROP</span>
              <strong>🌾 {procurement.crop}</strong>
            </div>

            <div>
              <span>QUANTITY</span>
              <strong>{procurement.quantity} kg</strong>
            </div>

            <div>
              <span>CENTRE</span>
              <strong>{currentCentre?.name || `Centre #${procurement.centre_id}`}</strong>
            </div>
          </div>

          <div className="info-card track-card">
            <div className="track-status-header">
              <div>
                <span className="schedule-label">CURRENT REALTIME STATUS</span>
                <h3 className={isRejected ? "status-text-rejected" : "status-text-active"}>
                  {status}
                </h3>
              </div>

              <div className="track-status-icon">
                {isRejected ? <XCircle size={28} /> : <PackageCheck size={28} />}
              </div>
            </div>

            {/* VISUAL TIMELINE PROGRESS */}
            <div className="tracking">
              {/* Step 1: Submitted */}
              <div className={`track-step ${isSubmitted ? "completed" : "pending"}`}>
                <CheckCircle2 size={20} />
                <div>
                  <strong>Submitted</strong>
                  <span>Crop procurement entry registered at centre portal</span>
                </div>
              </div>

              {/* Step 2: Quality Check */}
              <div
                className={`track-step ${
                  isProcessing || isAccepted
                    ? "completed"
                    : status.toLowerCase().includes("quality")
                    ? "current"
                    : "pending"
                }`}
              >
                <CheckCircle2 size={20} />
                <div>
                  <strong>Quality & Moisture Check</strong>
                  <span>Grain moisture & foreign matter verification</span>
                </div>
              </div>

              {/* Step 3: Weighment & Processing */}
              <div
                className={`track-step ${
                  isAccepted
                    ? "completed"
                    : isProcessing
                    ? "current"
                    : "pending"
                }`}
              >
                <Clock3 size={20} />
                <div>
                  <strong>Weighment & Processing</strong>
                  <span>Electronic weighing scale verification ({procurement.quantity} kg)</span>
                </div>
              </div>

              {/* Step 4: Final Settlement / Accepted */}
              <div
                className={`track-step ${
                  isCompleted || isAccepted
                    ? "completed"
                    : isRejected
                    ? "rejected-step"
                    : "pending"
                }`}
              >
                {isRejected ? <XCircle size={20} /> : <CreditCard size={20} />}
                <div>
                  <strong>
                    {isRejected ? "Rejected" : isCompleted ? "Procurement Completed" : "Payment & Settlement"}
                  </strong>
                  <span>
                    {isRejected
                      ? "Consignment did not meet specified moisture or quality threshold"
                      : isCompleted
                      ? "Procurement verified and bank credit order issued"
                      : "Direct Benefit Transfer (DBT) credit advice queued"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DATE & DETAILS FOOTNOTE */}
          <div className="track-info">
            <CheckCircle2 size={22} />
            <div>
              <strong>Live Prototype Procurement Record</strong>
              <p>
                Created on:{" "}
                {procurement.created_at
                  ? new Date(procurement.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "Today"}
                . Keep this record ID (KF-{procurement.id}) for any centre inquiry.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Track;