import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  MapPin,
  Ticket,
  Clock3,
  PackageCheck,
  Bell,
  ArrowRight,
  Sprout,
  Navigation,
  CheckCircle2,
  Navigation2
} from "lucide-react";

import { supabase } from "../lib/supabase";

function Home() {
  const navigate = useNavigate();

  const [centre, setCentre] = useState(null);
  const [nearbyCentres, setNearbyCentres] = useState([]);

  const [loading, setLoading] = useState(false);
  const [centresLoading, setCentresLoading] = useState(true);

  const [error, setError] = useState("");

  const [crop, setCrop] = useState("");
  const [selectedCentre, setSelectedCentre] = useState("");

  /* ================= CHECK CENTRE ================= */

  const checkCentreStatus = async () => {
    if (!crop || !selectedCentre) {
      setError("Please select a crop and procurement centre.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("procurement_centres")
      .select("*")
      .eq("name", selectedCentre)
      .maybeSingle();

    console.log("CENTRE DATA:", data);
    console.log("CENTRE ERROR:", error);

    if (error) {
      setError("Unable to load centre information.");
      setCentre(null);
    } else if (!data) {
      setError("No information available for this centre.");
      setCentre(null);
    } else {
      setCentre(data);
    }

    setLoading(false);
  };

  /* ================= LOAD NEARBY CENTRES ================= */

  useEffect(() => {
    loadNearbyCentres();
  }, []);

  const loadNearbyCentres = async () => {
    const { data, error } = await supabase
      .from("procurement_centres")
      .select("*")
      .order("id", { ascending: true });

    console.log("NEARBY CENTRES:", data);
    console.log("CENTRES ERROR:", error);

    if (error) {
      console.error(error);
    } else {
      setNearbyCentres(data || []);
    }

    setCentresLoading(false);
  };

  /* ================= QUEUE CALCULATION ================= */

  const currentToken = centre?.current_token ?? 145;

  const farmerToken = 158;

  const farmersAhead = Math.max(
    farmerToken - currentToken - 1,
    0
  );

  const estimatedWait = farmersAhead * 3;

  /* ================= SMART VISIT TIME ================= */

  const getRecommendedTime = () => {
    const now = new Date();

    now.setMinutes(
      now.getMinutes() + estimatedWait
    );

    const end = new Date(now);

    end.setMinutes(
      end.getMinutes() + 30
    );

    const formatTime = (date) => {
      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit"
      });
    };

    return `${formatTime(now)} – ${formatTime(end)}`;
  };

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="logo">

          <Sprout size={30} />

          <div>

            <h1>KisanFlow</h1>

            <span>
              Know Before You Go
            </span>

          </div>

        </div>

        <button className="location-btn">

          <MapPin size={18} />

          Vijayawada

        </button>

      </header>

      <main>

        {/* ================= WELCOME ================= */}

        <section className="welcome">

          <p>
            Welcome, Farmer 👋
          </p>

          <h2>
            Plan your procurement visit easily.
          </h2>

          <span>
            Check centre status, queue and procurement
            updates before you go.
          </span>

        </section>

        {/* ================= CHECK PROCUREMENT ================= */}

        <section className="search-card">

          <h3>
            Check Procurement
          </h3>

          <div className="select-row">

            <select
              value={crop}
              onChange={(e) =>
                setCrop(e.target.value)
              }
            >

              <option value="">
                Select Crop
              </option>

              <option value="Paddy">
                Paddy
              </option>

              <option value="Wheat">
                Wheat
              </option>

              <option value="Maize">
                Maize
              </option>

            </select>

            <select
              value={selectedCentre}
              onChange={(e) =>
                setSelectedCentre(e.target.value)
              }
            >

              <option value="">
                Select Centre
              </option>

              {nearbyCentres.map((item) => (
                <option
                  key={item.id}
                  value={item.name}
                >
                  {item.name}
                </option>
              ))}

            </select>

          </div>

          <button
            className="primary-btn"
            onClick={checkCentreStatus}
            disabled={loading}
          >

            {loading
              ? "Checking..."
              : "Check Centre Status"}

            <ArrowRight size={18} />

          </button>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

        </section>

        {/* ================= STATUS CARD ================= */}

        <section className="status-card">

          <div className="status-title">

            <div>

              <span className="label">
                CURRENT CENTRE STATUS
              </span>

              <h3>
                {centre?.name ||
                  "Vijayawada Procurement Centre"}
              </h3>

            </div>

            <span className="open">
              ● {centre?.status || "Open"}
            </span>

          </div>

          <div className="status-grid">

            <div>

              <Ticket />

              <strong>
                {currentToken}
              </strong>

              <span>
                Current Token
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

            <div>

              <PackageCheck />

              <strong>
                {farmersAhead}
              </strong>

              <span>
                Farmers Ahead
              </span>

            </div>

          </div>

          {/* ================= SMART VISIT PLANNER ================= */}

          <div className="visit-planner">

            <div className="visit-icon">

              <Navigation size={22} />

            </div>

            <div className="visit-content">

              <span className="label">
                SMART VISIT PLANNER
              </span>

              <h4>
                Recommended Visit Time
              </h4>

              <strong>
                🕐 {getRecommendedTime()}
              </strong>

              <p>
                Based on the current queue, this time
                may help reduce your waiting period.
              </p>

            </div>

          </div>

          {/* ================= LOCATION ================= */}

          <div className="centre-location">

            <MapPin size={18} />

            <span>
              {centre?.location ||
                "Vijayawada, NTR District"}
            </span>

          </div>

          {/* ================= OPEN MESSAGE ================= */}

          <div className="centre-open">

            <CheckCircle2 size={18} />

            <span>
              Centre is currently accepting farmers.
            </span>

          </div>

        </section>

        {/* ================= NEARBY CENTRES ================= */}

        <section className="nearby-section">

          <div className="section-heading">

            <div>

              <span className="label">
                PROCUREMENT CENTRES
              </span>

              <h2>
                Nearby Centres
              </h2>

            </div>

            <Navigation2
              size={24}
              className="nearby-icon"
            />

          </div>

          {centresLoading && (
            <div className="info-card">

              <h3>
                Loading centres...
              </h3>

              <p>
                Please wait while we load procurement
                centre information.
              </p>

            </div>
          )}

          {!centresLoading &&
            nearbyCentres.length === 0 && (

              <div className="info-card">

                <h3>
                  No centres available
                </h3>

                <p>
                  Procurement centre information is
                  currently unavailable.
                </p>

              </div>

            )}

          {!centresLoading &&
            nearbyCentres.length > 0 && (

              <div className="nearby-grid">

                {nearbyCentres.map((item) => (

                  <div
                    className="nearby-card"
                    key={item.id}
                  >

                    <div className="nearby-card-top">

                      <div className="nearby-map-icon">

                        <MapPin size={20} />

                      </div>

                      <span
                        className={
                          item.status === "Open"
                            ? "nearby-open"
                            : "nearby-closed"
                        }
                      >
                        ● {item.status}
                      </span>

                    </div>

                    <h3>
                      {item.name}
                    </h3>

                    <p className="nearby-location">

                      <MapPin size={15} />

                      {item.location}

                    </p>

                    <div className="nearby-details">

                      <span>
                        🌾 {item.crop}
                      </span>

                      <span>
                        🎟️ Token {item.current_token}
                      </span>

                    </div>

                    <button
                      className="nearby-btn"
                      onClick={() => {

                        setSelectedCentre(item.name);

                        setCentre(item);

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth"
                        });

                      }}
                    >

                      Check Centre

                      <ArrowRight size={16} />

                    </button>

                  </div>

                ))}

              </div>

            )}

        </section>

        {/* ================= FEATURES ================= */}

        <section className="features">

          <h2>
            What do you want to check?
          </h2>

          <div className="feature-grid">

            <div
              className="feature-card"
              onClick={() =>
                navigate("/schedule")
              }
            >

              <CalendarDays />

              <h3>
                Procurement Schedule
              </h3>

              <p>
                View crop procurement dates and timings.
              </p>

              <ArrowRight />

            </div>

            <div
              className="feature-card"
              onClick={() =>
                navigate("/queue")
              }
            >

              <Ticket />

              <h3>
                Token & Queue
              </h3>

              <p>
                Check your token and estimated waiting time.
              </p>

              <ArrowRight />

            </div>

            <div
              className="feature-card"
              onClick={() =>
                navigate("/track")
              }
            >

              <PackageCheck />

              <h3>
                Track Procurement
              </h3>

              <p>
                Check the current status of your procurement.
              </p>

              <ArrowRight />

            </div>

            <div
              className="feature-card"
              onClick={() =>
                navigate("/updates")
              }
            >

              <Bell />

              <h3>
                Important Updates
              </h3>

              <p>
                Get important centre and procurement updates.
              </p>

              <ArrowRight />

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Home;