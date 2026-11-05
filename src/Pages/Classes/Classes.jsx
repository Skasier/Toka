import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "./Classes.css";
import { CLASS_SCHEDULE } from "../../../shared/classes.js";

const filters = ["All", "Strength", "Cardio", "Combat", "Recovery"];

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (response.status === 404) {
      throw new Error("Class booking API not found. Restart the API server with npm run api.");
    }
    throw new Error("The API returned an unexpected response. Check that the API server is running.");
  }
  return response.json();
}

function Classes() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [bookedClasses, setBookedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingClass, setPendingClass] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetch("/api/bookings", { credentials: "include" });
        const result = await readApiResponse(response);

        if (response.status === 401) {
          setBookedClasses([]);
          return;
        }
        if (!response.ok) {
          throw new Error(result.message || "Could not load your class bookings.");
        }

        if (!Array.isArray(result.bookings)) {
          throw new Error("The API is out of date. Restart it with npm run api, then refresh this page.");
        }
        setBookedClasses(result.bookings.map((booking) => booking.id));
      } catch (requestError) {
        console.error("Could not load class bookings:", requestError);
        setError(requestError.message || "Could not load your class bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  const visibleClasses = useMemo(() => {
    if (activeFilter === "All") return CLASS_SCHEDULE;
    return CLASS_SCHEDULE.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  async function toggleBooking(item) {
    setError("");
    setMessage("");
    setPendingClass(item.id);

    try {
      if (bookedClasses.includes(item.id)) {
        const response = await fetch(`/api/bookings/${item.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const result = await readApiResponse(response);

        if (response.status === 401) {
          navigate("/join?next=%2Fclasses");
          return;
        }
        if (!response.ok) {
          throw new Error(result.message || "Could not cancel this booking.");
        }

        setBookedClasses((current) => current.filter((id) => id !== item.id));
        setMessage(`Your ${item.name} booking has been cancelled.`);
      } else {
        const response = await fetch("/api/bookings", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId: item.id }),
        });
        const result = await readApiResponse(response);

        if (response.status === 401) {
          navigate("/join?next=%2Fclasses");
          return;
        }
        if (!response.ok) {
          throw new Error(result.message || "Could not book this class.");
        }

        setBookedClasses((current) => [...current, item.id]);
        setMessage(`You are booked into ${item.name}.`);
      }
    } catch (requestError) {
      console.error("Could not update class booking:", requestError);
      setError(requestError.message || "Could not update this booking.");
    } finally {
      setPendingClass("");
    }
  }

  return (
    <main className="classes-page">
      <section className="classes-hero">
        <div className="classes-hero-copy">
          <p className="classes-eyebrow">Train with purpose</p>

          <h1>Classes that move you.</h1>

          <p>
            Discover energising sessions built to improve strength, confidence and
            everyday performance. Whether you want to challenge yourself, recover,
            or build consistency, there&apos;s a class for every goal.
          </p>

          <div className="classes-cta-row">
            <a href="#schedule" className="classes-primary-btn">
              View timetable
            </a>
            <a href="/join" className="classes-secondary-btn">
              Join now
            </a>
          </div>
        </div>

        <div className="classes-hero-panel">
          <div className="classes-stat-card">
            <span className="classes-stat-value">18+</span>
            <p>Weekly sessions across strength, cardio, mobility and recovery.</p>
          </div>

          <div className="classes-day-card">
            <p>
              <strong>Today&apos;s focus:</strong> Sweat, momentum and form. Try our
              early strength session for a focused start to the day.
            </p>
          </div>
        </div>
      </section>

      <section className="classes-content" id="schedule">
        <div className="classes-toolbar">
          <div>
            <p className="classes-filters-label">Browse by type</p>
          </div>

          <div className="classes-filter-group" role="group" aria-label="Class filters">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`classes-filter ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="classes-feedback error" role="alert">{error}</p>}
        {message && <p className="classes-feedback" role="status">{message}</p>}
        {loading && <p className="classes-feedback" role="status">Loading your bookings…</p>}

        <div className="classes-grid">
          {visibleClasses.map((item) => {
            const booked = bookedClasses.includes(item.id);
            const spacesLeft = item.capacity - item.booked;

            return (
              <article className="class-card" key={item.id}>
                <div className="class-card-visual">
                  <span className="class-card-badge">{item.category}</span>
                </div>

                <div className="class-card-body">
                  <div className="class-card-header">
                    <h3>{item.name}</h3>
                    <span className="class-level">{item.level}</span>
                  </div>

                  <div className="class-meta">
                    <div>
                      <strong>Day</strong>
                      {item.day}
                    </div>
                    <div>
                      <strong>Time</strong>
                      {item.time}
                    </div>
                    <div>
                      <strong>Duration</strong>
                      {item.duration}
                    </div>
                    <div>
                      <strong>Coach</strong>
                      {item.coach}
                    </div>
                  </div>

                  <div className="class-card-footer">
                    <span className="class-availability">
                      <strong>{spacesLeft}</strong> spots left
                    </span>

                    <button
                      type="button"
                      className={`class-book-btn ${booked ? "booked" : ""}`}
                      onClick={() => toggleBooking(item)}
                      disabled={pendingClass === item.id || loading}
                    >
                      {pendingClass === item.id
                        ? "Please wait…"
                        : booked
                          ? "Cancel booking"
                          : "Book now"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Classes;
