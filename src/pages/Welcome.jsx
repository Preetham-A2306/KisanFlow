import { useNavigate } from "react-router-dom";
import {
  Sprout,
  CalendarDays,
  Ticket,
  PackageCheck,
  Bell,
  ArrowRight
} from "lucide-react";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-page-content">
        <div className="welcome-logo">
          <Sprout size={38} />
          <div>
            <h1>KisanFlow</h1>
            <span>Know Before You Go</span>
          </div>
        </div>

        <h2 className="welcome-headline">
          Plan your procurement centre visit before you leave home.
        </h2>

        <p className="welcome-subtext">
          Check crop acceptance, live queue tokens, waiting time and the best
          time to arrive — all in one simple app built for farmers.
        </p>

        <button className="welcome-cta" onClick={() => navigate("/home")}>
          Get Started
          <ArrowRight size={20} />
        </button>

        <div className="welcome-feature-row">
          <div className="welcome-feature-pill">
            <CalendarDays size={18} />
            <span>Schedule</span>
          </div>
          <div className="welcome-feature-pill">
            <Ticket size={18} />
            <span>Queue</span>
          </div>
          <div className="welcome-feature-pill">
            <PackageCheck size={18} />
            <span>Track</span>
          </div>
          <div className="welcome-feature-pill">
            <Bell size={18} />
            <span>Updates</span>
          </div>
        </div>
      </div>

      <div className="welcome-footer">
        <span>B.Tech Hackathon Project &middot; Team Agri Agents</span>
      </div>
    </div>
  );
}

export default Welcome;
