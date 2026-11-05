
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import "./Join.css";

async function authRequest(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || "The request failed.");
    error.status = response.status;
    throw error;
  }

  return result;
}

export default function Join() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("next");
  const [mode, setMode] = useState("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [membership, setMembership] = useState("Core");

  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  function continueAfterAuth() {
    const destination = ["/dashboard", "/classes"].includes(returnTo)
      ? returnTo
      : "/dashboard";
    navigate(destination, { replace: true });
  }

  useEffect(() => {
    async function loadAccount() {
      try {
        const result = await authRequest("/api/auth/me");
        setUser(result.user);
        setMember(result.user);
        if (["/dashboard", "/classes"].includes(returnTo)) {
          navigate(returnTo, { replace: true });
        }
      } catch (err) {
        if (err.status !== 401) {
          console.error("Could not load member profile:", err);
          setError(err.message);
        }
      } finally {
        setChecking(false);
      }
    }

    loadAccount();
  }, [navigate, returnTo]);

  async function handleSignup(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanFullName = fullName.trim();
      if (!cleanFullName) {
        throw new Error("Please enter your full name.");
      }

      if (password.length < 8) {
        throw new Error("Your password must be at least 8 characters.");
      }

      const result = await authRequest("/api/auth/signup", {
        method: "POST",
        body: {
          fullName: cleanFullName,
          email: email.trim().toLowerCase(),
          password,
          membership,
        },
      });

      setUser(result.user);
      setMember(result.user);
      continueAfterAuth();
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authRequest("/api/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });

      setUser(result.user);
      setMember(result.user);
      continueAfterAuth();
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setError("");

    try {
      await authRequest("/api/auth/logout", { method: "POST" });
      setUser(null);
      setMember(null);
      setEmail("");
      setPassword("");
      setFullName("");
      setMode("login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError(err.message || "Logout failed. Please try again.");
    }
  }

  return (
    <main className="tk-root">
      <aside className="tk-brand">
        <a className="tk-logo" href="/" aria-label="Toka Fitness">
          <span className="tk-logo-mark">T</span>
          <p>TOKA FITNESS</p>
        </a>

        <div className="tk-brand-content">
          <p className="tk-eyebrow">YOUR TIME. YOUR STRENGTH.</p>

          <h1 className="tk-headline">
            BUILT
            <br />
            BY YOU.
          </h1>

          <p className="tk-lede">
            A better version of yourself starts with one decision.
            Make it today.
          </p>
        </div>

        <ul className="tk-benefits">
          <li>Train on your terms</li>
          <li>Memberships that fit your goals</li>
          <li>Your fitness journey starts here</li>
        </ul>

        <p className="tk-brand-footer">
          TOKA FITNESS <span>© {new Date().getFullYear()}</span>
        </p>
      </aside>

      <section className="tk-panel">
        <div className="tk-card">
          {checking ? (
            <div className="tk-loading">
              <span className="tk-spinner" />
              <h2>Checking your account</h2>
              <p className="tk-sub">
                Just a moment while we load your details.
              </p>
            </div>
          ) : user ? (
            <div className="tk-signed-in">
              <div className="tk-account-mark">
                <span>✓</span>
              </div>

              <p className="tk-eyebrow">MEMBER AREA</p>
              <h2>WELCOME BACK.</h2>

              <p className="tk-sub">
                You're signed in to your Toka Fitness account.
              </p>

              <div className="tk-field">
                <label>Full name</label>
                <p>
                  {member?.fullName || user.fullName || "Member"}
                </p>
              </div>

              <div className="tk-field">
                <label>Email address</label>
                <p>{member?.email || user.email}</p>
              </div>

              <div className="tk-field">
                <label>Membership plan</label>
                <p>{member?.membership || "No membership saved"}</p>
              </div>

              <Link className="tk-button" to="/dashboard">
                View dashboard <span aria-hidden="true">→</span>
              </Link>
              <Link className="tk-terms" to="/classes">
                Browse classes
              </Link>

              {error && (
                <p className="tk-form-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="tk-button"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <p className="tk-eyebrow">
                {mode === "signup" ? "START YOUR JOURNEY" : "GOOD TO SEE YOU"}
              </p>

              <h2>
                {mode === "signup" ? "JOIN TOKA." : "WELCOME BACK."}
              </h2>

              <p className="tk-sub">
                {mode === "signup"
                  ? "Create your account and choose your membership."
                  : "Log in to access your member account."}
              </p>

              <div className="tk-auth-switch">
                <button
                  type="button"
                  className={mode === "signup" ? "active" : ""}
                  aria-pressed={mode === "signup"}
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                >
                  Sign up
                </button>

                <button
                  type="button"
                  className={mode === "login" ? "active" : ""}
                  aria-pressed={mode === "login"}
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Log in
                </button>
              </div>

              <form
                onSubmit={mode === "signup" ? handleSignup : handleLogin}
              >
                {mode === "signup" && (
                  <>
                    <div className="tk-field">
                      <label htmlFor="fullName">Full name</label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        value={fullName}
                        onChange={(event) =>
                          setFullName(event.target.value)
                        }
                        required
                      />
                    </div>

                    <fieldset className="tk-plans">
                      <legend>Choose your membership</legend>

                      <div className="tk-plan-grid">
                        <label className="tk-plan">
                          <input
                            type="radio"
                            name="membership"
                            value="Core"
                            checked={membership === "Core"}
                            onChange={(event) =>
                              setMembership(event.target.value)
                            }
                          />

                          <span className="tk-plan-card">
                            <span className="tk-plan-name">Core</span>
                            <span className="tk-plan-price">
                              £21.99
                              <small> / month</small>
                            </span>
                            <span className="tk-plan-summary">
                              Your home gym.
                            </span>
                            <span className="tk-plan-description">
                              Unlimited access to your home gym.
                            </span>
                          </span>
                        </label>

                        <label className="tk-plan">
                          <input
                            type="radio"
                            name="membership"
                            value="Plus"
                            checked={membership === "Plus"}
                            onChange={(event) =>
                              setMembership(event.target.value)
                            }
                          />

                          <span className="tk-plan-card">
                            <span className="tk-plan-name">Plus</span>
                            <span className="tk-plan-price">
                              £28.99
                              <small> / month</small>
                            </span>
                            <span className="tk-plan-summary">
                              Every Toka gym.
                            </span>
                            <span className="tk-plan-description">
                              Access to every Toka Fitness gym.
                            </span>
                          </span>
                        </label>
                      </div>
                    </fieldset>
                  </>
                )}

                <div className="tk-field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="tk-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder={
                      mode === "signup"
                        ? "At least 8 characters"
                        : "Enter your password"
                    }
                    autoComplete={
                      mode === "signup"
                        ? "new-password"
                        : "current-password"
                    }
                    minLength={mode === "signup" ? 8 : undefined}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />
                </div>

                {error && (
                  <p className="tk-form-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  className="tk-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : mode === "signup"
                      ? "Create account"
                      : "Log in"}
                  {!loading && <span aria-hidden="true"> →</span>}
                </button>

                <p className="tk-terms">
                  {mode === "signup"
                    ? "By creating an account, you agree to use Toka Fitness responsibly."
                    : "Your fitness journey is waiting."}
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
