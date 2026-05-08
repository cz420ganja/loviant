export function AccountPanel() {
  return (
    <form action="/account/signout" method="post">
      <button className="secondary-action page-back-button" type="submit">
        Sign out
      </button>
    </form>
  );
}
