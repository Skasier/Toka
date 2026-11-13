import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import "./Dashboard.css";
import API_URL from "../../api.js";

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
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingBooking, setPendingBooking] = useState("");
  const [pendingMeal, setPendingMeal] = useState("");
  const [savingMeal, setSavingMeal] = useState(false);
  const [error, setError] = useState("");
  const [mealError, setMealError] = useState("");
  const [mealMessage, setMealMessage] = useState("");
  const [mealForm, setMealForm] = useState({
    day: "Monday",
    mealType: "Breakfast",
    name: "",
    details: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetch("${API_URL}/api/dashboard", { credentials: "include" })
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
        if (!result.user || !Array.isArray(result.bookings) || !Array.isArray(result.meals)) {
          throw new Error("The API is out of date. Restart it with npm run api, then refresh this page.");
        }

        setUser(result.user);
        setBookings(result.bookings);
        setMeals(result.meals);
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

  async function addMeal(event) {
    event.preventDefault();
    setSavingMeal(true);
    setMealError("");
    setMealMessage("");

    try {
      const response = await fetch(`${API_URL}/api/meals`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealForm),
      });
      const result = await readApiResponse(response);

      if (response.status === 401) {
        navigate("/join?next=%2Fdashboard", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(result.message || "Could not save this meal.");
      }
      if (!result.meal) {
        throw new Error("The API returned an unexpected meal response. Restart it with npm run api.");
      }

      setMeals((current) => [...current, result.meal]);
      setMealForm((current) => ({ ...current, name: "", details: "" }));
      setMealMessage("Meal added to your plan.");
    } catch (requestError) {
      console.error("Could not save meal plan entry:", requestError);
      setMealError(requestError.message || "Could not save this meal.");
    } finally {
      setSavingMeal(false);
    }
  }

  async function deleteMeal(meal) {
    setPendingMeal(meal.id);
    setMealError("");
    setMealMessage("");

    try {
      const response = await fetch(`${API_URL}/api/meals/${meal.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await readApiResponse(response);

      if (response.status === 401) {
        navigate("/join?next=%2Fdashboard", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(result.message || "Could not remove this meal.");
      }

      setMeals((current) => current.filter((item) => item.id !== meal.id));
      setMealMessage("Meal removed from your plan.");
    } catch (requestError) {
      console.error("Could not delete meal plan entry:", requestError);
      setMealError(requestError.message || "Could not remove this meal.");
    } finally {
      setPendingMeal("");
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

          <section className="tkd-card s12 tkd-meal-plan" aria-labelledby="meal-plan-heading">
            <div className="tkd-meal-heading">
              <div>
                <h2 id="meal-plan-heading">Your meal plan</h2>
                <p className="tkd-small">Build a weekly plan that works for you. Your entries are private to your account.</p>
              </div>
            </div>

            {mealError && <p className="tkd-error" role="alert">{mealError}</p>}
            {mealMessage && <p className="tkd-success" role="status">{mealMessage}</p>}

            <form className="tkd-meal-form" onSubmit={addMeal}>
              <div className="tkd-meal-form-row">
                <label>
                  Day
                  <select
                    value={mealForm.day}
                    onChange={(event) => setMealForm((current) => ({ ...current, day: event.target.value }))}
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Meal
                  <select
                    value={mealForm.mealType}
                    onChange={(event) => setMealForm((current) => ({ ...current, mealType: event.target.value }))}
                  >
                    {["Breakfast", "Lunch", "Dinner", "Snack"].map((mealType) => (
                      <option key={mealType} value={mealType}>{mealType}</option>
                    ))}
                  </select>
                </label>
                <label className="tkd-meal-name">
                  Meal name
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Overnight oats"
                    value={mealForm.name}
                    onChange={(event) => setMealForm((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </label>
              </div>
              <label>
                Ingredients or notes <span className="tkd-optional">(optional)</span>
                <textarea
                  maxLength={1000}
                  rows={3}
                  placeholder="Add ingredients, portions, or prep notes"
                  value={mealForm.details}
                  onChange={(event) => setMealForm((current) => ({ ...current, details: event.target.value }))}
                />
              </label>
              <button className="tkd-meal-submit" type="submit" disabled={savingMeal}>
                {savingMeal ? "Saving…" : "Add to meal plan"}
              </button>
            </form>

            {meals.length === 0 ? (
              <p className="tkd-empty tkd-meal-empty">No meals in your plan yet. Add your first meal above.</p>
            ) : (
              <ul className="tkd-list tkd-meal-list">
                {meals.map((meal) => (
                  <li key={meal.id}>
                    <div className="tkd-meal-info">
                      <span className="tkd-meal-tag">{meal.day} · {meal.mealType}</span>
                      <strong>{meal.name}</strong>
                      {meal.details && <p className="tkd-small">{meal.details}</p>}
                    </div>
                    <button
                      className="tkd-btn"
                      type="button"
                      disabled={pendingMeal === meal.id}
                      onClick={() => deleteMeal(meal)}
                      aria-label={`Remove ${meal.name} from meal plan`}
                    >
                      {pendingMeal === meal.id ? "Removing…" : "Remove"}
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
