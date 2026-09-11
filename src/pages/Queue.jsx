import { useEffect, useState, useCallback } from "react";
import { Ticket, Clock3, Users, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
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

  // Farmer token state read from localStorage or DB tokens table
  const [farmerToken, setFarmerToken] = useState(() => {
    const saved = localStorage.getItem("kisanflow_token");
    return saved ? parseInt(saved, 10) : null;
  });

  const [tokenInput, setTokenInput] = useState("");
  const [tokenSuccess, setTokenSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCentresAndQueue = useCallback(async () => {
    setError("");
    try {
      // 1. Fetch all centres
      const { data: allCentres, error: centresErr } = await supabase
        .from("procurement_centres")
        .select("*")
        .order("id", { ascending: true });

      if (centresErr) throw centresErr;
      setCentres(allCentres || []);

      // 2. Select targeted centre
      let target = null;
      const currentStoredCentre = selectedCentreName || localStorage.getItem("kisanflow_centre") || "";

      if (currentStoredCentre && allCentres) {
        target = allCentres.find(
          (c) => c.name.toLowerCase() === currentStoredCentre.toLowerCase()
        );
      }

      // If no match yet or nothing was selected, default to first centre
      if (!target && (!currentStoredCentre || currentStoredCentre.trim() === "") && allCentres && allCentres.length > 0) {
        target = allCentres[0];
        setSelectedCentreName(target.name);
        localStorage.setItem("kisanflow_centre", target.name);
      }

      setCentre(target || null);

      if (target && target.crop && !selectedCrop) {
        setSelectedCrop(target.crop);
        localStorage.setItem("kisanflow_crop", target.crop);
      }

      // 3. Resolve farmer token from localStorage or tokens table
      const storedToken = localStorage.getItem("kisanflow_token");
      if (storedToken) {
        const parsed = parseInt(storedToken, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setFarmerToken(parsed);
          setTokenInput(parsed.toString());
        }
      } else if (target) {
        // Fallback: look for a matching record in tokens table for this centre
        const { data: tokenRows } = await supabase
          .from("tokens")
          .select("token_number")
          .eq("centre_id", target.id)
          .order("id", { ascending: true })
          .limit(1);

        if (tokenRows && tokenRows.length > 0 && tokenRows[0].token_number) {
          const num = tokenRows[0].token_number;
          setFarmerToken(num);
          setTokenInput(num.toString());
          localStorage.setItem("kisanflow_token", num.toString());
        } else {
          // Default demo token 158
          const defaultToken = 158;
          setFarmerToken(defaultToken);
          setTokenInput(defaultToken.toString());
          localStorage.setItem("kisanflow_token", defaultToken.toString());
        }
      }
    } catch (err) {
      console.error("Queue load error:", err);
      setError("Unable to load queue information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedCentreName, selectedCrop]);

  /* Load centres and current centre data on mount / centre change */
  useEffect(() => {
    async function init() {
      await loadCentresAndQueue();
    }
    init();
  }, [loadCentresAndQueue]);

  /* Realtime subscription for live token updates from procurement_centres table */
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
            setCentre((prev) => {
              if (prev && prev.id === payload.new.id) {
                return payload.new;
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    } else {
      setCentre(null);
    }
  };

  /* Farmer enters or updates their token number */
  const handleTokenSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(tokenInput, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid positive token number.");
      return;
    }

    setFarmerToken(parsed);
    localStorage.setItem("kisanflow_token", parsed.toString());
    setError("");
    setTokenSuccess(`Token #${parsed} saved successfully.`);

    setTimeout(() => {
      setTokenSuccess("");
    }, 4000);
  };

  const currentToken = centre?.current_token ?? 0;
  const hasToken = farmerToken !== null && !isNaN(farmerToken) && farmerToken > 0;

  // Formula as required:
  // farmersAhead = Math.max(farmerToken - currentToken - 1, 0)
  // estimatedWait = farmersAhead * 3
  const farmersAhead =
    hasToken && currentToken > 0 ? Math.max(farmerToken - currentToken - 1, 0) : 0;
  const estimatedWait = farmersAhead * 3;

  // Progress relative to approaching window
  const distance = hasToken ? Math.max(farmerToken - currentToken, 0) : 0;
  const progressPercent = !hasToken
    ? 0
    : currentToken >= farmerToken
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
        <button
          className="refresh-btn"
          onClick={() => {
            setLoading(true);
            loadCentresAndQueue();
          }}
          title="Refresh queue"
        >
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
          <h3>Notice</h3>
          <p>{error}</p>
        </div>
      )}

      {/* CENTRE DOES NOT EXIST EMPTY STATE */}
      {!loading && !centre && (
        <div className="info-card">
          <AlertCircle size={32} style={{ color: "#d97706", marginBottom: 8 }} />
          <h3>Please select a valid procurement centre.</h3>
          <p>Select a procurement centre from the dropdown above to view the live queue status.</p>
        </div>
      )}

      {/* NO TOKEN RECORD EMPTY STATE */}
      {!loading && centre && !hasToken && (
        <div className="info-card">
          <Ticket size={34} style={{ color: "var(--primary-green)", marginBottom: 8 }} />
          <h3>No token information available for this selection.</h3>
          <p>Please enter your token number below to track your live queue position.</p>

          <form onSubmit={handleTokenSubmit} className="token-form" style={{ marginTop: 16 }}>
            <div className="token-input-row">
              <input
                type="number"
                min="1"
                placeholder="Enter your token number (e.g. 158)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="token-input-field"
                required
              />
              <button type="submit" className="token-update-btn">
                Save Token
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MAIN QUEUE CARD */}
      {!loading && centre && hasToken && (
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
              <span>Current Serving Token</span>
            </div>

            <div>
              <Users />
              <strong>{farmersAhead}</strong>
              <span>Farmers Ahead</span>
            </div>

            <div>
              <Clock3 />
              <strong>~{estimatedWait} min</strong>
              <span>Estimated Waiting Time</span>
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
                    crop documentation and identity card ready for verification at the counter.
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

          {/* TOKEN UPDATE BOX */}
          <div className="token-update-box">
            <h4>Update Your Token Number</h4>
            <p>Have a different token issued or want to track another token?</p>
            <form onSubmit={handleTokenSubmit} className="token-form">
              <div className="token-input-row">
                <input
                  type="number"
                  min="1"
                  placeholder="Enter token number (e.g. 158)"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="token-input-field"
                  required
                />
                <button type="submit" className="token-update-btn">
                  Update Token
                </button>
              </div>
              {tokenSuccess && (
                <div className="token-success-msg">
                  <CheckCircle2 size={15} />
                  <span>{tokenSuccess}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Queue;