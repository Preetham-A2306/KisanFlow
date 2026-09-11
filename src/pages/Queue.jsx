import { useEffect, useState } from "react";
import { Ticket, Clock3, Users, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

function Queue() {
  const [centre, setCentre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    const { data, error } = await supabase
      .from("procurement_centres")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    console.log("QUEUE CENTRE:", data);
    console.log("QUEUE ERROR:", error);

    if (error) {
      setError("Unable to load queue information.");
    } else {
      setCentre(data);
    }

    setLoading(false);
  };

  const currentToken = centre?.current_token ?? 145;

  const farmerToken = 158;

  const farmersAhead = Math.max(
    farmerToken - currentToken - 1,
    0
  );

  const estimatedWait = farmersAhead * 3;

  const progress = Math.min(
    ((farmerToken - currentToken) / 20) * 100,
    100
  );

  if (loading) {
    return (
      <div className="page">

        <Ticket size={35} />

        <h1>
          Token & Queue
        </h1>

        <p>
          Loading queue information...
        </p>

        <div className="info-card">
          <h3>
            Please wait...
          </h3>
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="page">

        <Ticket size={35} />

        <h1>
          Token & Queue
        </h1>

        <div className="info-card">

          <h3>
            Unable to load queue
          </h3>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="page">

      <Ticket size={35} />

      <h1>
        Token & Queue
      </h1>

      <p>
        Know your position before visiting the centre.
      </p>

      <div className="info-card queue-main-card">

        <div className="queue-title">

          <div>

            <span className="schedule-label">
              YOUR QUEUE STATUS
            </span>

            <h3>
              {centre?.name || "Procurement Centre"}
            </h3>

          </div>

          <span className="nearby-open">
            ● Open
          </span>

        </div>

        <div className="queue-info">

          <div>

            <Ticket />

            <strong>
              {farmerToken}
            </strong>

            <span>
              Your Token
            </span>

          </div>

          <div>

            <Users />

            <strong>
              {farmersAhead}
            </strong>

            <span>
              Farmers Ahead
            </span>

          </div>

          <div>

            <Clock3 />

            <strong>
              ~{estimatedWait} min
            </strong>

            <span>
              Estimated Wait
            </span>

          </div>

        </div>

        {/* QUEUE PROGRESS */}

        <div className="queue-progress-section">

          <div className="queue-progress-header">

            <span>
              Queue Progress
            </span>

            <strong>
              {currentToken} → {farmerToken}
            </strong>

          </div>

          <div className="queue-progress">

            <div
              className="queue-progress-fill"
              style={{
                width: `${progress}%`
              }}
            ></div>

          </div>

          <div className="queue-progress-labels">

            <span>
              Current: {currentToken}
            </span>

            <span>
              You: {farmerToken}
            </span>

          </div>

        </div>

        {/* VISIT ADVICE */}

        <div className="queue-advice">

          <Clock3 size={20} />

          <div>

            <strong>
              Smart Visit Advice
            </strong>

            <p>
              You have approximately{" "}
              <b>{farmersAhead}</b>{" "}
              farmers ahead. Estimated waiting
              time is around{" "}
              <b>{estimatedWait} minutes</b>.
            </p>

          </div>

        </div>

        {/* STATUS */}

        <div className="centre-open">

          <span>
            🟢 Centre is currently accepting farmers.
          </span>

          <ArrowRight size={17} />

        </div>

      </div>

    </div>
  );
}

export default Queue;