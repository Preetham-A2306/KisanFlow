import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Clock3 } from "lucide-react";
import { supabase } from "../lib/supabase";

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [centres, setCentres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    setError("");

    const { data: scheduleData, error: scheduleError } =
      await supabase
        .from("schedules")
        .select("*")
        .order("date", { ascending: true });

    if (scheduleError) {
      console.error(scheduleError);
      setError("Unable to load procurement schedule.");
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

    setCentres(centreMap);
    setSchedules(scheduleData || []);
    setLoading(false);
  };

  return (
    <div className="page">

      <CalendarDays size={35} />

      <h1>Procurement Schedule</h1>

      <p>
        Check procurement dates and timings for your crop.
      </p>

      {/* LOADING */}

      {loading && (
        <div className="info-card">

          <h3>
            Loading schedule...
          </h3>

          <p>
            Please wait while we load the latest
            procurement schedule.
          </p>

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="info-card">

          <h3>
            Unable to load schedule
          </h3>

          <p>
            {error}
          </p>

        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        schedules.length === 0 && (

          <div className="info-card">

            <h3>
              No schedules available
            </h3>

            <p>
              There are no procurement schedules
              available at the moment.
            </p>

          </div>
        )}

      {/* SCHEDULE LIST */}

      {!loading &&
        !error &&
        schedules.map((schedule) => {

          const centre =
            centres[schedule.centre_id];

          return (
            <div
              className="info-card schedule-card"
              key={schedule.id}
            >

              <div className="schedule-header">

                <div>

                  <span className="schedule-label">
                    CROP PROCUREMENT
                  </span>

                  <h3>
                    🌾 {schedule.crop}
                  </h3>

                </div>

                <span className="status">
                  {schedule.status}
                </span>

              </div>

              {/* CENTRE */}

              <div className="schedule-detail">

                <MapPin size={18} />

                <div>

                  <small>
                    Procurement Centre
                  </small>

                  <strong>
                    {centre?.name ||
                      "Procurement Centre"}
                  </strong>

                  <span>
                    {centre?.location ||
                      "Location unavailable"}
                  </span>

                </div>

              </div>

              {/* DATE */}

              <div className="schedule-detail">

                <CalendarDays size={18} />

                <div>

                  <small>
                    Procurement Date
                  </small>

                  <strong>
                    {new Date(
                      schedule.date
                    ).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })}
                  </strong>

                </div>

              </div>

              {/* TIME */}

              <div className="schedule-detail">

                <Clock3 size={18} />

                <div>

                  <small>
                    Procurement Hours
                  </small>

                  <strong>
                    {schedule.start_time?.slice(0, 5)}
                    {" – "}
                    {schedule.end_time?.slice(0, 5)}
                  </strong>

                </div>

              </div>

            </div>
          );
        })}

    </div>
  );
}

export default Schedule;