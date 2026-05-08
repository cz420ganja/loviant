"use client";

import { useState } from "react";

function cryptoPrice(price) {
  return (Number(price) * 0.9).toFixed(2);
}

export function PricingCheckout({ packs }) {
  const [active, setActive] = useState(null);
  const [method, setMethod] = useState("card");

  return (
    <>
      <section className="price-grid pricing-page-grid">
        {packs.map((pack) => (
          <article className={`price-card ${pack.featured ? "featured" : ""}`} key={pack.name}>
            <span>{pack.name}</span>
            <strong>${pack.price}</strong>
            <p className="crypto-discount-line">Crypto: ${cryptoPrice(pack.price)}</p>
            <p>{pack.credits} credits</p>
            <small>{pack.note}</small>
            <button className="generate-button" type="button" onClick={() => setActive(pack)}>Choose {pack.name}</button>
          </article>
        ))}
      </section>
      <section className={`checkout-overlay ${active ? "is-visible" : ""}`} aria-hidden={!active}>
        {active && (
          <div className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle">
            <div className="checkout-header">
              <div><p className="eyebrow">Checkout</p><h2 id="checkoutTitle">Buy Credits</h2></div>
              <button className="modal-close" type="button" onClick={() => setActive(null)}>Close</button>
            </div>
            <div className="checkout-summary">
              <span>{active.name}</span>
              {method === "crypto" ? (
                <strong><s>${active.price}</s> ${cryptoPrice(active.price)}</strong>
              ) : (
                <strong>${active.price}</strong>
              )}
              <p><span>{active.credits}</span> credits{method === "crypto" ? " - 10% crypto discount applied" : ""}</p>
            </div>
            <div className="payment-tabs" role="tablist" aria-label="Payment method">
              <button className={`payment-tab ${method === "card" ? "is-active" : ""}`} type="button" onClick={() => setMethod("card")}>Card</button>
              <button className={`payment-tab ${method === "crypto" ? "is-active" : ""}`} type="button" onClick={() => setMethod("crypto")}>Crypto</button>
            </div>
            <section className={`payment-panel ${method === "card" ? "is-active" : ""}`}>
              <label className="prompt-label">Card number <input type="text" placeholder="4242 4242 4242 4242" /></label>
              <div className="control-grid"><label className="prompt-label">Expiry <input type="text" placeholder="MM / YY" /></label><label className="prompt-label">CVC <input type="text" placeholder="123" /></label></div>
              <button className="generate-button" type="button">Continue with Card</button>
              <p className="payment-note">Card processing will connect to Stripe later.</p>
            </section>
            <section className={`payment-panel ${method === "crypto" ? "is-active" : ""}`}>
              <div className="crypto-box"><span>Network</span><strong>Base</strong></div>
              <div className="crypto-box"><span>Token</span><strong>USDC</strong></div>
              <div className="crypto-box"><span>Original price</span><strong><s>{active.price} USDC</s></strong></div>
              <div className="crypto-box"><span>Crypto discount</span><strong>10% off</strong></div>
              <div className="crypto-box"><span>Blockchain price</span><strong>{cryptoPrice(active.price)} USDC</strong></div>
              <label className="prompt-label">Deposit address <input readOnly value="0xYourWalletAddressHere" /></label>
              <button className="generate-button" type="button">I Sent Payment</button>
              <p className="payment-note">Backend verification will check Base USDC transfers before adding credits.</p>
            </section>
          </div>
        )}
      </section>
    </>
  );
}
