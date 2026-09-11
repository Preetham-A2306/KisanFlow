import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Clock3, Filter, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [centres, setCentres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter option: farmer's selected crop from localStorage or 'All'
  const [selectedCropFilter, setSelectedCropFilter] = useState(
    () => localStorage.getItem("kisanflow_crop") || "All"
  );

  useEffect(() => {
    loadSchedules();

    // Supabase Realtime subscription for schedules
    const channel = supabase
      .channel("public:schedules_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedules"
        },
        () => {
          loadSchedules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("schedules")
        .select("*")
        .order("date", { ascending: true });

      if (scheduleError) throw scheduleError;

      const { data: centreData, error: centreError } = await supabase
        .from("procurement_centres")
        .select("id, name, location");

      if (centreError) console.error("Error loading centres in Schedule:", centreError);

      const centreMap = {};
      (centreData || []).forEach((centre) => {
        centreMap[centre.id] = centre;
      });

      setCentres(centreMap);
      setSchedules(scheduleData || []);
    } catch (err) {
      console.error("Schedule fetch error:", err);
      setError("Unable to load procurement schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Available unique crops for filter
  const uniqueCrops = [
    "All",
    ...new Set(schedules.map((s) => s.crop).filter(Boolean))
  ];

  const filteredSchedules =
    selectedCropFilter === "All" || !selectedCropFilter
      ? schedules
      : schedules.filter(
          (s) => s.crop?.toLowerCase() === selectedCropFilter.toLowerCase()
        );

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <span className="live-badge">● Live app data (Supabase realtime)</span>
          <h1>
            <CalendarDays className="inline-page-icon" size={32} />
            Procurement Schedule
          </h1>
          <p>Check procurement operational dates and timings for your crop.</p>
        </div>
        <button className="refresh-btn" onClick={loadSchedules} title="Refresh schedules">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="schedule-filter-bar">
        <div className="filter-item">
          <Filter size={18} />
          <span>Filter by Crop:</span>
          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
          >
            {uniqueCrops.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Crops" : `🌾 ${c}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="info-card">
          <div className="loading-state">
            <div className="loading-circle" />
            <div>
              <h3>Loading schedule...</h3>
              <p>Please wait while we load the latest procurement schedules.</p>
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="info-card error-card">
          <h3>Unable to load schedule</h3>
          <p>{error}</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && filteredSchedules.length === 0 && (
        <div className="info-card">
          <h3>No procurement schedule available</h3>
          <p>
            {selectedCropFilter !== "All"
              ? `There are no scheduled procurement slots for "${selectedCropFilter}". Try switching to "All Crops".`
              : "There are currently no active procurement schedules listed in the system."}
          </p>
        </div>
      )}

      {/* SCHEDULE LIST */}
      {!loading && !error && filteredSchedules.length > 0 && (
        <div className="schedules-grid">
          {filteredSchedules.map((schedule) => {
            const centre = centres[schedule.centre_id];

            return (
              <div className="info-card schedule-card" key={schedule.id}>
                <div className="schedule-header">
                  <div>
                    <span className="schedule-label">CROP PROCUREMENT</span>
                    <h3>🌾 {schedule.crop}</h3>
                  </div>

                  <span className="status">● {schedule.status}</span>
                </div>

                {/* CENTRE */}
                <div className="schedule-detail">
                  <MapPin size={20} />
                  <div>
                    <small>Procurement Centre</small>
                    <strong>{centre?.name || "Procurement Centre"}</strong>
                    <span>{centre?.location || "Location unavailable"}</span>
                  </div>
                </div>

                {/* DATE */}
                <div className="schedule-detail">
                  <CalendarDays size={20} />
                  <div>
                    <small>Procurement Date</small>
                    <strong>
                      {schedule.date
                        ? new Date(schedule.date).toLocaleDateString("en-IN", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          })
                        : "Date to be announced"}
                    </strong>
                  </div>
                </div>

                {/* TIME */}
                <div className="schedule-detail">
                  <Clock3 size={20} />
                  <div>
                    <small>Procurement Hours</small>
                    <strong>
                      {schedule.start_time?.slice(0, 5)} – {schedule.end_time?.slice(0, 5)}
                    </strong>
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

export default Schedule;