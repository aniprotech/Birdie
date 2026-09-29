// Make the full field open the browser's date/time selector, not only its small icon.
export function activateDateTimePickers() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const input = target.closest('input[type="date"], input[type="time"], input[type="datetime-local"]');
    if (!(input instanceof HTMLInputElement) || input.disabled || input.readOnly) return;
    try {
      input.showPicker?.();
    } catch {
      // Browser-native picker remains available when showPicker is unsupported.
    }
  });
}
