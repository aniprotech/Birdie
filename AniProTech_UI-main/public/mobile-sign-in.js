(() => {
  const status = document.getElementById("status");
  const open = document.getElementById("open-app");
  const copy = document.getElementById("copy-link");
  const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
  if (!token || !/^[A-Za-z0-9_-]{40,512}$/.test(token)) {
    status.textContent = "This sign-in link is incomplete. Please request a new link in the app.";
    return;
  }

  const appLink = `aniprotech://login?token=${encodeURIComponent(token)}`;
  open.href = appLink;
  open.hidden = false;
  copy.hidden = false;
  status.textContent = "Your link is ready. Open it in the Caremonitor app.";
  // Keep the one-time token out of the browser's visible URL and history.
  try { window.history.replaceState(null, "", window.location.pathname); } catch { /* In-app browsers may deny history changes. */ }

  copy.addEventListener("click", async () => {
    try {
      const legacyCopy = () => {
        const field = document.createElement("textarea");
        field.value = appLink;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Copy unavailable");
      };
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(appLink); }
        catch { legacyCopy(); }
      } else legacyCopy();
      status.textContent = "Copied. Open Caremonitor and paste the link into its sign-in screen.";
    } catch {
      status.textContent = "Copy is unavailable in this mail browser. Open this page in Safari or Chrome, then try again.";
    }
  });
})();
