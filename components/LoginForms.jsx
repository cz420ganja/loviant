"use client";

import { useState } from "react";

export function LoginForms({ initialMode = null, error = "" }) {
  const [message, setMessage] = useState(error);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitForm(event, endpoint) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Account request failed. Please try again.");
      }

      window.location.assign("/");
    } catch (submitError) {
      setMessage(submitError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="auth-choice-grid" aria-label="Choose account action">
        <a href="/login?mode=signin" className={`auth-choice-card ${initialMode === "signin" ? "is-active" : ""}`}>
          <span>01</span>
          <strong>Sign in</strong>
          <small>Access your account and credits.</small>
        </a>
        <a href="/login?mode=signup" className={`auth-choice-card ${initialMode === "signup" ? "is-active" : ""}`}>
          <span>02</span>
          <strong>Sign up</strong>
          <small>Create a new account.</small>
        </a>
      </div>

      {!initialMode && <p className="muted-note">Choose sign in or sign up to continue.</p>}

      {initialMode === "signin" && (
        <section className="auth-section">
          <h2>Sign in</h2>
          <form className="auth-form" onSubmit={(event) => submitForm(event, "/api/auth/signin")}>
            <label>
              Username or email
              <input type="text" name="login" placeholder="you@example.com" autoComplete="username" required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="Password" autoComplete="current-password" required />
            </label>
            <button className="generate-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      )}

      {initialMode === "signup" && (
        <section className="auth-section">
          <h2>Create account</h2>
          <form className="auth-form" onSubmit={(event) => submitForm(event, "/api/auth/signup")}>
            <label>
              Username
              <input type="text" name="username" placeholder="Choose a username" autoComplete="username" required />
            </label>
            <label>
              Email
              <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="Create a password" autoComplete="new-password" minLength={8} required />
            </label>
            <button className="generate-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </section>
      )}

      {message && <p className="form-status is-error">{message}</p>}
    </>
  );
}

