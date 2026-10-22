import { useState } from "react";
import './Membership.css'

const memberships = [
  {
    id: "core",
    name: "CORE",
    price: "21.99",
    description: "Your home gym, whenever you want it.",
    features: [
      "Unlimited access to your home gym",
      "No contract",
      "Access to gym equipment",
    ],
  },
  {
    id: "plus",
    name: "PLUS",
    price: "28.99",
    description: "Train at any Toka Fitness gym.",
    features: [
      "Everything in Core",
      "Access to every Toka gym",
      "More freedom to train",
    ],
    popular: true,
  },
];

export default function Memberships() {
  const [selected, setSelected] = useState(null);

  return (
    <main className="tk-memberships">
      <section className="tk-memberships-header">
        <p className="tk-memberships-eyebrow">YOUR TRAINING. YOUR CHOICE.</p>

        <h1>
          CHOOSE YOUR <span>MEMBERSHIP</span>
        </h1>

        <p className="tk-memberships-subtitle">
          Find the membership that fits your lifestyle.
        </p>
      </section>

      <section className="tk-membership-grid">
        {memberships.map((plan) => (
          <article
            className={`tk-membership-card ${
              plan.popular ? "popular" : ""
            } ${selected === plan.id ? "selected" : ""}`}
            key={plan.id}
          >
            {plan.popular && (
              <span className="tk-membership-badge">MOST FLEXIBLE</span>
            )}

            <h2>{plan.name}</h2>

            <p className="tk-membership-description">{plan.description}</p>

            <div className="tk-membership-price">
              <span>£</span>
              {plan.price}
              <small> / month</small>
            </div>

            <div className="tk-membership-divider" />

            <ul className="tk-membership-features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span className="tk-feature-tick">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className="tk-membership-button"
              onClick={() => setSelected(plan.id)}
            >
              {selected === plan.id ? "SELECTED ✓" : `CHOOSE ${plan.name}`}
            </button>
          </article>
        ))}
      </section>

      {selected && (
        <p className="tk-membership-confirmation" role="status">
          You've selected the{" "}
          {memberships.find((plan) => plan.id === selected).name} membership.
          Registration can be added next.
        </p>
      )}

      {/* <p className="tk-membership-footer">
        YOUR FITNESS. YOUR RULES. TOKA FITNESS.
      </p> */}
    </main>
  );
}
