import { useEffect, useState } from "react";
import {
  Bell,
  MapPin,
  Clock3,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

import { supabase } from "../lib/supabase";

function Updates() {
  const [updates, setUpdates] = useState([]);
  const [centres, setCentres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    setLoading(true);
    setError("");

    const { data: updateData, error: updateError } =
      await supabase
        .from("updates")
        .select("*")
        .order("created_at", { ascending: false });

    if (updateError) {
      console.error(updateError);
      setError("Unable to load latest updates.");
      setLoading(false);
      return;
    }

    const { data: centreData, error: centreError } =
      await supabase
        .from("procurement_centres")
        .select("id, name, location");

    if (centreError) {
      console.error(centreError);
    }

    const centreMap = {};

    (centreData || []).forEach((centre) => {
      centreMap[centre.id] = centre;
    });

    setUpdates(updateData || []);
    setCentres(centreMap);
    setLoading(false);
  };

  const getUpdateType = (title) => {
    const text = title?.toLowerCase() || "";

    if (
      text.includes("queue") ||
      text.includes("waiting")
    ) {
      return "Queue";
    }

    if (
      text.includes("status") ||
      text.includes("centre")
    ) {
      return "Centre";
    }

    return "Procurement";
  };

  const getUpdateIcon = (type) => {
    if (type === "Queue") {
      return <Clock3 size={20} />;
    }

    if (type === "Centre") {
      return <CheckCircle2 size={20} />;
    }

    return <Bell size={20} />;
  };

  if (loading) {
    return (
      <div className="page">
        <Bell size={35} />

        <h1>Important Updates</h1>

        <p>
          Loading the latest procurement information...
        </p>

        <div className="info-card update-loading">
          <div className="loading-circle"></div>

          <div>
            <h3>Loading updates...</h3>
            <p>
              Please wait while we get the latest information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Bell size={35} />

        <h1>Important Updates</h1>

        <div className="update-error">
          <AlertCircle size={22} />

          <div>
            <strong>Unable to load updates</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Bell size={35} />

      <h1>Important Updates</h1>

      <p>
        Stay informed about procurement centres,
        queues and crop procurement.
      </p>

      {updates.length === 0 && (
        <div className="info-card">
          <div className="empty-update-icon">
            <Bell size={25} />
          </div>

          <h3>No new updates</h3>

          <p>
            There are no new procurement updates at the moment.
          </p>
        </div>
      )}

      <div className="updates-list">
        {updates.map((update, index) => {
          const centre = centres[update.centre_id];
          const type = getUpdateType(update.title);

          return (
            <div
              className={
                index === 0
                  ? "update-card latest-update"
                  : "update-card"
              }
              key={update.id}
            >
              <div className="update-top">
                <div className="update-icon">
                  {getUpdateIcon(type)}
                </div>

                <div className="update-title-area">
                  <div className="update-badges">
                    <span className="update-type">
                      {type}
                    </span>

                    {index === 0 && (
                      <span className="latest-badge">
                        Latest
                      </span>
                    )}
                  </div>

                  <h3>{update.title}</h3>
                </div>
              </div>

              <p className="update-message">
                {update.message}
              </p>

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
                    ? new Date(
                        update.created_at
                      ).toLocaleString("en-IN", {
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
    </div>
  );
}

export default Updates;