import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <h2>TOKA FITNESS</h2>
          <p>Move better. Train stronger. Live better.</p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h3>EXPLORE</h3>
            <a href="/">Home</a>
            <a href="/about">About Toka</a>
            <a href="/classes">Classes</a>
            <a href="/facilities">Facilities</a>
          </div>

          <div className="footer-column">
            <h3>MEMBERSHIP</h3>
            <a href="/membership">Membership</a>
            <a href="/personal-training">Personal Training</a>
            <a href="/contact">Contact</a>
          </div>

          {/* <div className="footer-column">
            <h3>FOLLOW</h3>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">TikTok</a>
          </div> */}
        </div>
      </div>

      {/* <div className="footer-cta">
        <div>
          <span>READY TO START?</span>
          <h2>JOIN TOKA FITNESS</h2>
        </div>

        <a href="/join" className="footer-join">
          JOIN NOW
        </a>
      </div> */}

      {/* <div className="footer-bottom">
        <p>© 2026 Toka Fitness. All rights reserved.</p>

        <div>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
        </div>
      </div> */}
    </footer>
  );
}

export default Footer;
