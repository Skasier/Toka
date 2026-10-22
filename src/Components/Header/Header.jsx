import { useState } from "react";
import { Link } from "react-router";
import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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

        <Link to="/join" className="join-button">
          JOIN
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
