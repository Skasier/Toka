
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../../firebase";
import "./Join.css";

export default function Join() {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setMember(null);
      setError("");

      try {
        if (currentUser) {
          const memberRef = doc(db, "members", currentUser.uid);
          const memberSnapshot = await getDoc(memberRef);

          if (memberSnapshot.exists()) {
            setMember(memberSnapshot.data());
          }
        }
      } catch (err) {
        console.error("Could not load member profile:", err);
        setError(
          "Your account is signed in, but your member profile could not be loaded."
        );
      } finally {
        setChecking(false);
      }
    });

    return unsubscribe;
  }, []);

  async function handleSignup(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!fullName.trim()) {
        throw new Error("Please enter your full name.");
      }

      if (password.length < 8) {
        throw new Error("Your password must be at least 8 characters.");
      }

      const cleanEmail = email.trim().toLowerCase();

      const credential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await updateProfile(credential.user, {
        displayName: fullName.trim(),
      });

      const memberData = {
        uid: credential.user.uid,
        fullName: fullName.trim(),
        email: cleanEmail,
        membership,
        createdAt: serverTimestamp(),
      };

      await setDoc(
        doc(db, "members", credential.user.uid),
        memberData
      );

      setMember({
        ...memberData,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Signup failed:", err);
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const memberRef = doc(db, "members", credential.user.uid);
      const memberSnapshot = await getDoc(memberRef);

      if (memberSnapshot.exists()) {
        setMember(memberSnapshot.data());
      } else {
        setMember({
          fullName: credential.user.displayName || "Member",
          email: credential.user.email,
          membership: "No membership saved",
        });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setError("");

    try {
      await signOut(auth);
      setMember(null);
      setEmail("");
      setPassword("");
      setFullName("");
      setMode("login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError(getFriendlyError(err));
    }
  }

  function getFriendlyError(err) {
    const messages = {
      "auth/email-already-in-use":
        "This email already has an account.",
      "auth/invalid-email":
        "Please enter a valid email address.",
      "auth/invalid-credential":
        "Incorrect email or password.",
      "auth/weak-password":
        "Choose a stronger password.",
      "auth/network-request-failed":
        "Check your internet connection.",
      "auth/too-many-requests":
        "Too many attempts. Please try again later.",
      "permission-denied":
        "Database access denied. Check your Firestore security rules.",
    };

    return messages[err.code] || err.message || "Something went wrong.";
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
                  {member?.fullName || user.displayName || "Member"}
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
