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

/* ================= CROP LIST ================= */

const CROPS = [
  "Paddy",
  "Wheat",
  "Maize",
  "Jowar",
  "Bajra",
  "Ragi",
  "Groundnut",
  "Red Gram",
  "Green Gram",
  "Black Gram",
  "Bengal Gram",
  "Soybean",
  "Sunflower",
  "Cotton",
  "Chilli",
  "Turmeric",
  "Sugarcane",
  "Tobacco",
  "Sesame",
  "Mustard"
];

function Home() {
  const navigate = useNavigate();

  /* ================= STATE ================= */

  const [centre, setCentre] = useState(null);

  const [nearbyCentres, setNearbyCentres] = useState([]);

  const [loading, setLoading] = useState(false);

  const [centresLoading, setCentresLoading] = useState(true);

  const [error, setError] = useState("");

  const [crop, setCrop] = useState("");

  const [selectedCentre, setSelectedCentre] = useState("");

  /*
    IMPORTANT:
    Status is hidden when page first opens.
  */
  const [hasSearched, setHasSearched] = useState(false);

  /* ================= LOAD CENTRES ================= */

  useEffect(() => {
    loadCentres();
  }, []);

  const loadCentres = async () => {
    setCentresLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("procurement_centres")
      .select("*")
      .order("id", { ascending: true });

    console.log("CENTRES:", data);
    console.log("CENTRES ERROR:", error);

    if (error) {
      console.error(error);

      setError(
        "Unable to load procurement centres."
      );

      setNearbyCentres([]);
    } else {
      setNearbyCentres(data || []);
    }

    setCentresLoading(false);
  };

  /* ================= SEARCH CENTRE ================= */

  const checkCentreStatus = async () => {
    if (!crop || !selectedCentre) {
      setError(
        "Please select a crop and procurement centre."
      );

      setCentre(null);
      setHasSearched(false);

      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("procurement_centres")
      .select("*")
      .eq("name", selectedCentre)
      .maybeSingle();

    console.log("SELECTED CENTRE:", data);
    console.log("CENTRE ERROR:", error);

    if (error) {
      setError(
        "Unable to load centre information."
      );

      setCentre(null);
      setHasSearched(false);
    } else if (!data) {
      setError(
        "No information available for this centre."
      );

      setCentre(null);
      setHasSearched(false);
    } else {
      setCentre(data);

      /*
        Only after successful search
        show the status card.
      */
      setHasSearched(true);
    }

    setLoading(false);
  };

  /* ================= CROP CHANGE ================= */

  const handleCropChange = (e) => {
    const value = e.target.value;

    setCrop(value);

    /*
      Hide old result when farmer changes crop.
    */
    setCentre(null);
    setHasSearched(false);
    setError("");
  };

  /* ================= CENTRE CHANGE ================= */

  const handleCentreChange = (e) => {
    const value = e.target.value;

    setSelectedCentre(value);

    /*
      Hide old result when farmer changes centre.
    */
    setCentre(null);
    setHasSearched(false);
    setError("");
  };

  /* ================= NEARBY CENTRE ================= */

  const selectNearbyCentre = (item) => {
    setSelectedCentre(item.name);

    /*
      Do NOT immediately show status.
      Farmer must click Check Centre Status.
    */
    setCentre(null);

    setHasSearched(false);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  /* ================= QUEUE ================= */

  const currentToken =
    centre?.current_token ?? 0;

  /*
    Demo farmer token.
    We will connect this to uploaded token
    in the next update.
  */
  const farmerToken = 158;

  const farmersAhead =
    currentToken > 0
      ? Math.max(
          farmerToken - currentToken - 1,
          0
        )
      : 0;

  const estimatedWait =
    farmersAhead * 3;

  /* ================= SMART VISIT ================= */

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
      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "numeric",
          minute: "2-digit"
        }
      );
    };

    return `${formatTime(now)} – ${formatTime(end)}`;
  };

  /* ================= UI ================= */

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="logo">

          <Sprout size={30} />

          <div>

            <h1>
              KisanFlow
            </h1>

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
            Select your crop and procurement
            centre to check the latest information.
          </span>

        </section>

        {/* ================= SEARCH ================= */}

        <section className="search-card">

          <h3>
            Check Procurement
          </h3>

          <div className="select-row">

            {/* ================= CROP ================= */}

            <select
              value={crop}
              onChange={handleCropChange}
            >

              <option value="">
                Select Crop
              </option>

              {CROPS.map((item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              ))}

            </select>

            {/* ================= CENTRE ================= */}

            <select
              value={selectedCentre}
              onChange={handleCentreChange}
              disabled={centresLoading}
            >

              <option value="">
                {centresLoading
                  ? "Loading Centres..."
                  : "Select Centre"}
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

          {/* ================= SEARCH BUTTON ================= */}

          <button
            className="primary-btn"
            onClick={checkCentreStatus}
            disabled={
              loading ||
              !crop ||
              !selectedCentre
            }
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

        {/* ================================================= */}
        {/* STATUS CARD                                      */}
        {/* ONLY APPEARS AFTER SEARCH                       */}
        {/* ================================================= */}

        {hasSearched && centre && (

          <section className="status-card">

            {/* ================= STATUS TITLE ================= */}

            <div className="status-title">

              <div>

                <span className="label">
                  CURRENT CENTRE STATUS
                </span>

                <h3>
                  {centre.name}
                </h3>

              </div>

              <span
                className={
                  centre.status === "Open"
                    ? "open"
                    : "nearby-closed"
                }
              >

                ● {centre.status}

              </span>

            </div>

            {/* ================= STATUS GRID ================= */}

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

            {/* ================= SMART VISIT ================= */}

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
                  Based on the current queue,
                  this time may help reduce
                  your waiting period.
                </p>

              </div>

            </div>

            {/* ================= LOCATION ================= */}

            <div className="centre-location">

              <MapPin size={18} />

              <span>
                {centre.location}
              </span>

            </div>

            {/* ================= OPEN/CLOSED MESSAGE ================= */}

            <div className="centre-open">

              <CheckCircle2 size={18} />

              <span>

                {centre.status === "Open"
                  ? "Centre is currently accepting farmers."
                  : "Centre is currently closed."}

              </span>

            </div>

          </section>

        )}

        {/* ================================================= */}
        {/* BEFORE SEARCH                                    */}
        {/* ================================================= */}

        {!hasSearched && (

          <div className="info-card">

            <h3>
              🔎 Search a procurement centre
            </h3>

            <p>
              Select your crop and centre above
              to view token, queue, waiting time
              and procurement information.
            </p>

          </div>

        )}

        {/* ================================================= */}
        {/* NEARBY CENTRES                                   */}
        {/* ================================================= */}

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

          {/* ================= LOADING ================= */}

          {centresLoading && (

            <div className="info-card">

              <h3>
                Loading centres...
              </h3>

              <p>
                Please wait while we load
                procurement centre information.
              </p>

            </div>

          )}

          {/* ================= EMPTY ================= */}

          {!centresLoading &&
            nearbyCentres.length === 0 && (

              <div className="info-card">

                <h3>
                  No centres available
                </h3>

                <p>
                  Procurement centre information
                  is currently unavailable.
                </p>

              </div>

            )}

          {/* ================= CENTRES ================= */}

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
                      onClick={() =>
                        selectNearbyCentre(item)
                      }
                    >

                      Check Centre

                      <ArrowRight size={16} />

                    </button>

                  </div>

                ))}

              </div>

            )}

        </section>

        {/* ================================================= */}
        {/* FEATURES                                         */}
        {/* ================================================= */}

        <section className="features">

          <h2>
            What do you want to check?
          </h2>

          <div className="feature-grid">

            {/* ================= SCHEDULE ================= */}

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
                View crop procurement dates
                and timings.
              </p>

              <ArrowRight />

            </div>

            {/* ================= QUEUE ================= */}

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
                Check your token and estimated
                waiting time.
              </p>

              <ArrowRight />

            </div>

            {/* ================= TRACK ================= */}

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
                Check the current status
                of your procurement.
              </p>

              <ArrowRight />

            </div>

            {/* ================= UPDATES ================= */}

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
                Get important centre and
                procurement updates.
              </p>

              <ArrowRight />

            </div>

          </div>

        </section>[]

      </main>

    </div>
  );
}

export default Home;