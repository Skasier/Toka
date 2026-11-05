import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { credentials: "include" })
      .then(async (response) => {
        if (response.status === 401) return null;
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not check your account.");
        }
        return result.user;
      })
      .then((user) => {
        if (active) setSignedIn(Boolean(user));
      })
      .catch((error) => {
        if (active) {
          console.error("Could not check signed-in account:", error);
          setSignedIn(false);
        }
      });

    function handleAuthChange(event) {
      setSignedIn(Boolean(event.detail?.user));
    }

    window.addEventListener("toka-auth-change", handleAuthChange);
    return () => {
      active = false;
      window.removeEventListener("toka-auth-change", handleAuthChange);
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="header">
        <button className="menu-button" onClick={() => setMenuOpen(true)}>
          MENU
        </button>

        <Link to="/" className="logo">
          TOKA FITNESS
        </Link>

        <Link to={signedIn ? "/dashboard" : "/join"} className="join-button">
          {signedIn ? "DASHBOARD" : "JOIN"}
        </Link>
      </header>

      <div className={`fullscreen-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-header">
          <span>TOKA FITNESS</span>

          <button className="close-button" onClick={closeMenu}>
            CLOSE
          </button>
        </div>

        <nav className="menu-links">
          <Link to="/" onClick={closeMenu}>
            HOME
          </Link>
          <br />
          <Link to="/about" onClick={closeMenu}>
            ABOUT TOKA
          </Link>
          <br />
          <Link to="/membership" onClick={closeMenu}>
            MEMBERSHIP
          </Link>
          <br />
          <Link to="/dashboard" onClick={closeMenu}>
            MEMBER DASHBOARD
          </Link>
          <br />
          <Link to="/classes" onClick={closeMenu}>
            CLASSES
          </Link>
          <br />
          <Link to="/personal-training" onClick={closeMenu}>
            PERSONAL TRAINING
          </Link>
          <br />
          {/* <Link to="/facilities" onClick={closeMenu}>
            FACILITIES
          </Link>
          <br />
          <Link to="/contact" onClick={closeMenu}>
            CONTACT
          </Link> */}
        </nav>
      </div>
    </>
  );
}

export default Header;
