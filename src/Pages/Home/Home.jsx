import "./Home.css";

function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <p className="hero-small">WELCOME TO</p>

            <h1>TOKA FITNESS</h1>

            <p className="hero-text">TRAIN. MOVE. LIVE.</p>

            <a href="/join" className="hero-button">
              JOIN TOKA
            </a>
          </div>
        </div>
      </section>

      <section className="intro">
        <div className="intro-title">
          <p>THE TOKA EXPERIENCE</p>
          <h2>
            MORE THAN
            <br />A GYM.
          </h2>
        </div>

        <div className="intro-text">
          <p>
            Toka Fitness is built around movement, strength and wellbeing.
            Whether you're starting your fitness journey or looking to take your
            training further, we're here to help you become your strongest self.
          </p>

          <a href="/about">DISCOVER TOKA →</a>
        </div>
      </section>

      <section className="services">
        <div className="section-heading">
          <p>WHAT WE OFFER</p>
          <h2>TRAIN YOUR WAY.</h2>
        </div>

        <div className="service-grid">
          <article className="service-card">
            <div className="service-image gym-image"></div>

            <div className="service-content">
              <span>01</span>
              <h3>GYM</h3>
              <p>
                Train with modern equipment and dedicated spaces built for your
                goals.
              </p>
            </div>
          </article>

          <article className="service-card">
            <div className="service-image classes-image"></div>

            <div className="service-content">
              <span>02</span>
              <h3>CLASSES</h3>
              <p>
                Push yourself further with a range of energetic and challenging
                classes.
              </p>
            </div>
          </article>

          <article className="service-card">
            <div className="service-image personal-image"></div>

            <div className="service-content">
              <span>03</span>
              <h3>PERSONAL TRAINING</h3>
              <p>
                Get focused support and training designed around your goals.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="membership">
        <p>YOUR FITNESS. YOUR WAY.</p>

        <h2>
          READY TO
          <br />
          GET STARTED?
        </h2>

        <a href="/join">JOIN TOKA</a>
      </section>
    </main>
  );
}

export default Home;
