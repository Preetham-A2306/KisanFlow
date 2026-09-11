import { useEffect, useState } from "react";
import { Ticket, Clock3, Users, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

function Queue() {
  const [centre, setCentre] = useState(null);
  const [centres, setCentres] = useState([]);
  const [selectedCentreName, setSelectedCentreName] = useState(
    () => localStorage.getItem("kisanflow_centre") || ""
  );
  const [selectedCrop, setSelectedCrop] = useState(
    () => localStorage.getItem("kisanflow_crop") || ""
  );
  const [farmerTokenInput, setFarmerTokenInput] = useState(
    () => localStorage.getItem("kisanflow_token") || "158"
  );
  const [farmerToken, setFarmerToken] = useState(
    () => parseInt(localStorage.getItem("kisanflow_token") || "158", 10) || 158
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tokenUpdatedNotice, setTokenUpdatedNotice] = useState(false);

  /* Load centres and current centre data */
  useEffect(() => {
    loadCentresAndQueue();
  }, [selectedCentreName]);

  /* Set up Supabase Realtime subscription for live token increments */
  useEffect(() => {
    const channel = supabase
      .channel("public:procurement_centres_queue")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "procurement_centres"
        },
        (payload) => {
          if (payload.new) {
            setCentres((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            );
            if (centre && centre.id === payload.new.id) {
              setCentre(payload.new);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [centre]);

  const loadCentresAndQueue = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Fetch all centres so farmer can switch if desired
      const { data: allCentres, error: centresErr } = await supabase
        .from("procurement_centres")
        .select("*")
        .order("id", { ascending: true });

      if (centresErr) throw centresErr;
      setCentres(allCentres || []);

      // 2. Select targeted centre
      let target = null;
      if (selectedCentreName && allCentres) {
        target = allCentres.find(
          (c) => c.name.toLowerCase() === selectedCentreName.toLowerCase()
        );
      }

      // If no match yet or nothing selected, default to first centre
      if (!target && allCentres && allCentres.length > 0) {
        target = allCentres[0];
        setSelectedCentreName(target.name);
        localStorage.setItem("kisanflow_centre", target.name);
      }

      setCentre(target);

      // 3. Try to check if there is an official token record in the tokens table
      if (target) {
        const { data: tokenData } = await supabase
          .from("tokens")
          .select("*")
          .eq("centre_id", target.id)
          .limit(1);

        if (tokenData && tokenData.length > 0 && !localStorage.getItem("kisanflow_token")) {
          setFarmerToken(tokenData[0].token_number);
          setFarmerTokenInput(tokenData[0].token_number.toString());
          localStorage.setItem("kisanflow_token", tokenData[0].token_number.toString());
        }
      }
    } catch (err) {
      console.error("Queue load error:", err);
      setError("Unable to load queue information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCentreChange = (e) => {
    const name = e.target.value;
    setSelectedCentreName(name);
    localStorage.setItem("kisanflow_centre", name);
    const matched = centres.find((c) => c.name === name);
    if (matched) {
      setCentre(matched);
      if (matched.crop) {
        setSelectedCrop(matched.crop);
        localStorage.setItem("kisanflow_crop", matched.crop);
      }
    }
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(farmerTokenInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setFarmerToken(parsed);
      localStorage.setItem("kisanflow_token", parsed.toString());
      setTokenUpdatedNotice(true);
      setTimeout(() => setTokenUpdatedNotice(false), 2500);
    }
  };

  const currentToken = centre?.current_token ?? 0;
  const farmersAhead = currentToken > 0 ? Math.max(farmerToken - currentToken - 1, 0) : 0;
  const estimatedWait = farmersAhead * 3;

  // Calculate progress relative to a reasonable window
  const distance = Math.max(farmerToken - currentToken, 0);
  const progressPercent =
    currentToken >= farmerToken
      ? 100
      : Math.max(10, Math.min(100, Math.round(((20 - distance) / 20) * 100)));

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <span className="live-badge">● Live app data (Supabase realtime)</span>
          <h1>
            <Ticket className="inline-page-icon" size={32} />
            Token & Queue
          </h1>
          <p>Know your real-time queue position before leaving home to avoid long waits.</p>
        </div>
        <button className="refresh-btn" onClick={loadCentresAndQueue} title="Refresh queue">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* CENTRE & CROP SELECTOR BAR */}
      <div className="queue-selector-bar">
        <div className="selector-group">
          <label htmlFor="queue-centre-select">Selected Centre:</label>
          <select
            id="queue-centre-select"
            value={selectedCentreName}
            onChange={handleCentreChange}
            disabled={loading}
          >
            {centres.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.crop})
              </option>
            ))}
          </select>
        </div>

        {selectedCrop && (
          <div className="crop-tag">
            🌾 Crop: <strong>{selectedCrop}</strong>
          </div>
        )}
      </div>

      {loading && (
        <div className="info-card">
          <div className="loading-state">
            <div className="loading-circle" />
            <div>
              <h3>Loading queue information...</h3>
              <p>Fetching current token and waiting times from Supabase.</p>
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="info-card error-card">
          <h3>Unable to load queue</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !centre && (
        <div className="info-card">
          <h3>No token information available for this selection.</h3>
          <p>Please select a procurement centre to check live queue numbers.</p>
        </div>
      )}

      {!loading && !error && centre && (
        <div className="info-card queue-main-card">
          <div className="queue-title">
            <div>
              <span className="schedule-label">LIVE QUEUE METRICS</span>
              <h3>{centre.name}</h3>
              <small className="centre-location-text">📍 {centre.location}</small>
            </div>

            <span className={centre.status === "Open" ? "nearby-open" : "nearby-closed"}>
              ● {centre.status}
            </span>
          </div>

          <div className="queue-info">
            <div>
              <Ticket />
              <strong>{farmerToken}</strong>
              <span>Your Token</span>
            </div>

            <div>
              <Users />
              <strong>{currentToken}</strong>
              <span>Current Serving</span>
            </div>

            <div>
              <Users />
              <strong>{farmersAhead}</strong>
              <span>Farmers Ahead</span>
            </div>

            <div>
              <Clock3 />
              <strong>~{estimatedWait} min</strong>
              <span>Estimated Wait</span>
            </div>
          </div>

          {/* QUEUE PROGRESS BAR */}
          <div className="queue-progress-section">
            <div className="queue-progress-header">
              <span>Live Queue Progress</span>
              <strong>
                Serving #{currentToken} → Your #{farmerToken}
              </strong>
            </div>

            <div className="queue-progress">
              <div
                className="queue-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="queue-progress-labels">
              <span>Current: #{currentToken}</span>
              <span>
                {farmersAhead === 0 && currentToken >= farmerToken
                  ? "It is your turn!"
                  : `${farmersAhead} farmers ahead`}
              </span>
              <span>Your: #{farmerToken}</span>
            </div>
          </div>

          {/* TOKEN EDIT FORM */}
          <div className="token-update-box">
            <form onSubmit={handleTokenSubmit} className="token-form">
              <label htmlFor="farmer-token-input">Have a different token number?</label>
              <div className="token-input-row">
                <input
                  id="farmer-token-input"
                  type="number"
                  min="1"
                  max="9999"
                  value={farmerTokenInput}
                  onChange={(e) => setFarmerTokenInput(e.target.value)}
                  placeholder="Enter your token #"
                />
                <button type="submit" className="token-update-btn">
                  Update Token
                </button>
              </div>
              {tokenUpdatedNotice && (
                <span className="token-success-msg">
                  <CheckCircle2 size={14} /> Token updated successfully!
                </span>
              )}
            </form>
          </div>

          {/* SMART VISIT ADVICE */}
          <div className="queue-advice">
            <Clock3 size={24} />
            <div>
              <strong>Smart Visit Advice</strong>
              <p>
                {farmersAhead > 0 ? (
                  <>
                    You have approximately <b>{farmersAhead}</b> farmers ahead of you.
                    Estimated waiting duration is around <b>{estimatedWait} minutes</b>. Arriving shortly
                    before your turn prevents crowded waiting areas.
                  </>
                ) : (
                  <>
                    Your token number is currently ready or approaching! Please keep your
                    crop documentation and identity card ready for verification at counter.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* OPERATIONAL STATUS */}
          <div className="centre-open">
            <CheckCircle2 size={18} />
            <span>
              {centre.status === "Open"
                ? "🟢 Counter is active and actively processing farmers."
                : "🔴 Centre is currently closed."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Queue;