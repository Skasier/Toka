import { useState, useMemo } from "react";
import "./Dashboard.css";

/* ---------- Sample data: replace with your API / database calls ---------- */
const MEMBER = {
  name: "Alex Morgan",
  plan: "Premium",
  since: "March 2025",
  renews: "12 Dec 2026",
  weekGoal: 4,
  week: [true, false, true, true, false, false, false], // Mon–Sun
};

const INITIAL_BOOKINGS = [
  { id: 1, name: "Spin 45", day: "Fri", time: "18:00", room: "Studio 2" },
  { id: 2, name: "HIIT Circuit", day: "Sat", time: "10:30", room: "Main floor" },
  { id: 3, name: "Yoga Flow", day: "Sun", time: "09:00", room: "Studio 1" },
];

const WORKOUTS = [
  { id: 1, date: "Wed", what: "Upper body", mins: 55 },
  { id: 2, date: "Tue", what: "Treadmill intervals", mins: 30 },
  { id: 3, date: "Mon", what: "Legs and core", mins: 60 },
];

const MEMBERS = [
  { id: 101, name: "Priya Shah", plan: "Premium", status: "Active", joined: "02 Nov 2026" },
  { id: 102, name: "Jordan Lee", plan: "Standard", status: "Active", joined: "01 Nov 2026" },
  { id: 103, name: "Sam Okafor", plan: "Standard", status: "Frozen", joined: "14 Aug 2026" },
  { id: 104, name: "Emma Clarke", plan: "Premium", status: "Active", joined: "30 Oct 2026" },
  { id: 105, name: "Liam Walker", plan: "Student", status: "Overdue", joined: "09 Jun 2026" },
  { id: 106, name: "Aisha Khan", plan: "Student", status: "Active", joined: "04 Nov 2026" },
];

const TODAY_CLASSES = [
  { id: 1, name: "Early Strength", time: "06:30", booked: 12, cap: 12 },
  { id: 2, name: "Spin 45", time: "12:15", booked: 9, cap: 20 },
  { id: 3, name: "Boxing Basics", time: "17:30", booked: 17, cap: 18 },
  { id: 4, name: "Yoga Flow", time: "19:00", booked: 6, cap: 15 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ---------- Member view ---------- */
function MemberView() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const visits = MEMBER.week.filter(Boolean).length;
  const left = Math.max(MEMBER.weekGoal - visits, 0);

  return (
    <div className="tkd-grid">
      <section className="tkd-card s8" aria-labelledby="wk">
        <h2 id="wk">Your week</h2>
        <div className="tkd-week">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={"tkd-day" + (MEMBER.week[i] ? " on" : "")}
              aria-label={`${d}: ${MEMBER.week[i] ? "visited" : "no visit"}`}
            >
              {d}
            </div>
          ))}
        </div>
        <p className="tkd-note">
          {visits} of {MEMBER.weekGoal} visits.{" "}
          {left > 0 ? `${left} more to reach your goal.` : "Goal reached. Nice work."}
        </p>
      </section>

      <section className="tkd-card s4" aria-labelledby="mem">
        <h2 id="mem">Membership</h2>
        <div className="tkd-big tkd-plan">{MEMBER.plan}</div>
        <p className="tkd-note">Member since {MEMBER.since}</p>
        <p className="tkd-small">Renews {MEMBER.renews}</p>
      </section>

      <section className="tkd-card s7" aria-labelledby="bk">
        <h2 id="bk">Booked classes</h2>
        {bookings.length === 0 ? (
          <p className="tkd-empty">No classes booked. Browse the timetable to reserve a spot.</p>
        ) : (
          <ul className="tkd-list">
            {bookings.map((b) => (
              <li key={b.id}>
                <div>
                  <strong>{b.name}</strong>
                  <div className="tkd-small">
                    {b.day} at {b.time}, {b.room}
                  </div>
                </div>
                <button
                  className="tkd-btn"
                  onClick={() => setBookings(bookings.filter((x) => x.id !== b.id))}
                  aria-label={`Cancel ${b.name} on ${b.day}`}
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="tkd-card s5" aria-labelledby="lg">
        <h2 id="lg">Recent workouts</h2>
        <ul className="tkd-list">
          {WORKOUTS.map((w) => (
            <li key={w.id}>
              <div>
                <strong>{w.what}</strong>
                <div className="tkd-small">{w.date}</div>
              </div>
              <span>{w.mins} min</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------- Staff view ---------- */
function StaffView() {
  const [query, setQuery] = useState("");
  const shown = useMemo(
    () => MEMBERS.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );
  const active = MEMBERS.filter((m) => m.status === "Active").length;
  const overdue = MEMBERS.filter((m) => m.status === "Overdue").length;

  return (
    <div className="tkd-grid">
      <div className="tkd-card tkd-stat s4">
        <div className="tkd-big">{active}</div>
        <p className="tkd-small">Active members</p>
      </div>
      <div className="tkd-card tkd-stat s4">
        <div className="tkd-big">2</div>
        <p className="tkd-small">New sign-ups this week</p>
      </div>
      <div className="tkd-card tkd-stat alert s4">
        <div className="tkd-big">{overdue}</div>
        <p className="tkd-small">Overdue payments</p>
      </div>

      <section className="tkd-card s7" aria-labelledby="mm">
        <h2 id="mm">Members</h2>
        <input
          className="tkd-search"
          type="search"
          placeholder="Search by name"
          aria-label="Search members by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="tkd-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.plan}</td>
                  <td>
                    <span className={"tkd-tag " + m.status}>{m.status}</span>
                  </td>
                  <td>{m.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shown.length === 0 && (
          <p className="tkd-empty">No members match “{query}”. Check the spelling or clear the search.</p>
        )}
      </section>

      <section className="tkd-card s5" aria-labelledby="tc">
        <h2 id="tc">Today’s classes</h2>
        <ul className="tkd-list">
          {TODAY_CLASSES.map((c) => {
            const full = c.booked >= c.cap;
            return (
              <li key={c.id} className="tkd-classrow">
                <div className="tkd-classtop">
                  <strong>
                    {c.time} {c.name}
                  </strong>
                  <span className="tkd-small">
                    {c.booked}/{c.cap}
                    {full ? " full" : ""}
                  </span>
                </div>
                <div className="tkd-bar-track" role="img" aria-label={`${c.booked} of ${c.cap} places booked`}>
                  <i className={full ? "full" : ""} style={{ width: `${(c.booked / c.cap) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ---------- Page ---------- */
function Dashboard() {
  const [view, setView] = useState("member");

  return (
    <main className="tkd-root">
      <div className="tkd-main">
        <div className="tkd-head">
          <div>
            <h1 className="tkd-title">
              {view === "member" ? `Welcome back, ${MEMBER.name.split(" ")[0]}` : "Staff overview"}
            </h1>
            <p className="tkd-lede">
              {view === "member"
                ? "Your visits, bookings and membership in one place."
                : "Members, sign-ups and today’s class numbers."}
            </p>
          </div>
          <div className="tkd-toggle" role="group" aria-label="Dashboard view">
            <button aria-pressed={view === "member"} onClick={() => setView("member")}>
              Member
            </button>
            <button aria-pressed={view === "staff"} onClick={() => setView("staff")}>
              Staff
            </button>
          </div>
        </div>

        {view === "member" ? <MemberView /> : <StaffView />}
      </div>
    </main>
  );
}

export default Dashboard;