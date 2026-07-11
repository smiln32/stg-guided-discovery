// Reusable progressive enhancement for simple POST forms (preferences,
// unsubscribe, journey enroll). Falls back to a native POST when JS is absent.
export function enhanceForm(selector: string, okFallback: string): void {
  document.querySelectorAll<HTMLFormElement>(selector).forEach((form) => {
    const status = form.querySelector<HTMLElement>('.form-status');
    form.addEventListener('submit', async (e) => {
      const email = form.querySelector<HTMLInputElement>('[name="email"]');
      if (!status) return;
      if (email && (!email.value || !/.+@.+\..+/.test(email.value))) return; // let native validation run
      e.preventDefault();
      status.hidden = false;
      status.className = 'form-status';
      status.textContent = 'One moment…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form) as any).toString(),
        });
        const data = await res.json().catch(() => ({}));
        status.className = `form-status ${res.ok ? 'form-status--ok' : 'form-status--error'}`;
        status.textContent =
          data.message ||
          (res.ok
            ? okFallback
            : 'We could not complete that just now. Your information was not lost. Please try again in a moment.');
        if (res.ok) form.reset();
      } catch {
        status.className = 'form-status form-status--error';
        status.textContent =
          'We could not reach the server just now. Your information was not lost. Please try again in a moment.';
      }
    });
  });
}
