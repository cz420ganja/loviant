export function AdminLoginForm({ error = "" }) {
  return (
    <form className="auth-form" action="/admin/session" method="post">
      <label>
        Admin password
        <input
          type="password"
          name="password"
          placeholder="Enter admin password"
          autoComplete="current-password"
          required
        />
      </label>
      <button className="generate-button" type="submit">
        Enter admin
      </button>
      {error && <p className="form-status is-error">{error}</p>}
    </form>
  );
}
