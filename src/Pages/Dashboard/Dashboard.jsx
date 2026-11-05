import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import "./Dashboard.css";

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (response.status === 404) {
      throw new Error("Dashboard API not found. Restart the API server with npm run api.");
    }
    throw new Error("The API returned an unexpected response. Check that the API server is running.");
  }
  return response.json();
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingBooking, setPendingBooking] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetch("/api/dashboard", { credentials: "include" })
      .then(async (response) => ({
        response,
        result: await readApiResponse(response),
      }))
      .then(({ response, result }) => {
        if (!active) return;
        if (response.status === 401) {
          navigate("/join?next=%2Fdashboard", { replace: true });
          return;
        }
        if (!response.ok) {
          throw new Error(result.message || "Could not load your dashboard.");
        }
        if (!result.user || !Array.isArray(result.bookings)) {
          throw new Error("The API is out of date. Restart it with npm run api, then refresh this page.");
        }

        setUser(result.user);
        setBookings(result.bookings);
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Could not load the member dashboard:", requestError);
        setError(requestError.message || "Could not load your dashboard.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate, refreshKey]);

  async function cancelBooking(booking) {
    setPendingBooking(booking.id);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await readApiResponse(response);

      if (response.status === 401) {
        navigate("/join?next=%2Fdashboard", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(result.message || "Could not cancel this booking.");
      }

      setBookings((current) => current.filter((item) => item.id !== booking.id));
    } catch (requestError) {
      console.error("Could not cancel class booking:", requestError);
      setError(requestError.message || "Could not cancel this booking.");
    } finally {
      setPendingBooking("");
    }
  }

  if (loading) {
    return (
      <main className="tkd-root">
        <div className="tkd-main tkd-state" role="status">Loading your dashboard…</div>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="tkd-root">
        <div className="tkd-main tkd-state">
          <p className="tkd-error" role="alert">{error}</p>
          <button
            className="tkd-btn"
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              setRefreshKey((current) => current + 1);
            }}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <main className="tkd-root">
      <div className="tkd-main">
        <header className="tkd-head">
          <div>
            <p className="tkd-eyebrow">YOUR TOKA ACCOUNT</p>
            <h1 className="tkd-title">Welcome, {user.fullName.split(" ")[0]}.</h1>
            <p className="tkd-lede">Your membership and class bookings, all in one place.</p>
          </div>
          <Link className="tkd-action-link" to="/classes">Browse classes</Link>
        </header>

        {error && <p className="tkd-error" role="alert">{error}</p>}

        <div className="tkd-grid">
          <section className="tkd-card s5" aria-labelledby="account-heading">
            <h2 id="account-heading">Your account</h2>
            <dl className="tkd-account-details">
              <div>
                <dt>Full name</dt>
                <dd>{user.fullName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Membership</dt>
                <dd className="tkd-plan">{user.membership}</dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{joined}</dd>
              </div>
            </dl>
          </section>

          <section className="tkd-card s7" aria-labelledby="bookings-heading">
            <h2 id="bookings-heading">Your class bookings</h2>
            {bookings.length === 0 ? (
              <p className="tkd-empty">
                You haven&apos;t booked a class yet.{" "}
                <Link to="/classes">Explore the timetable</Link> to reserve your spot.
              </p>
            ) : (
              <ul className="tkd-list">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <div>
                      <strong>{booking.name}</strong>
                      <div className="tkd-small">
                        {booking.day} at {booking.time} · {booking.duration} · Coach {booking.coach}
                      </div>
                    </div>
                    <button
                      className="tkd-btn"
                      type="button"
                      disabled={pendingBooking === booking.id}
                      onClick={() => cancelBooking(booking)}
                      aria-label={`Cancel ${booking.name} booking`}
                    >
                      {pendingBooking === booking.id ? "Cancelling…" : "Cancel"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
