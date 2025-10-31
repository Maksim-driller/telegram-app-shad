// Lightweight, resilient TMA init that won't crash outside Telegram
export async function initTMA() {
  try {
    // Try to expand viewport/fullscreen first (works without SDK)
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const wa = (window as any).Telegram.WebApp;
      wa.ready();
      try { wa.expand(); } catch {}

      // Apply theme params to CSS variables
      const tp = wa.themeParams;
      if (tp) {
        const root = document.documentElement;
        if (tp.bg_color) root.style.setProperty('--bg', tp.bg_color);
        if (tp.secondary_bg_color) root.style.setProperty('--bg-soft', tp.secondary_bg_color);
        if (tp.text_color) root.style.setProperty('--text', tp.text_color);
        if (tp.hint_color) root.style.setProperty('--muted', tp.hint_color);
        if (tp.button_color) {
          root.style.setProperty('--primary', tp.button_color);
          root.style.setProperty('--primary-weak', tp.button_color);
        }
      }

      // Main Button example (we won't force it visible):
      try { 
        if (wa.MainButton) {
          wa.MainButton.setParams({ text: 'Открыть план' }); 
        }
      } catch {}
    }
    
    // Try to initialize SDK if available (optional)
    try {
      const mod = await import('@tma.js/sdk');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyMod: any = mod as any;
      if (anyMod?.init) {
        anyMod.init();
      }
    } catch {
      // SDK not available, continue without it
    }
  } catch (err) {
    // ignore if not in Telegram environment
    console.warn('TMA initialization failed (this is OK if not in Telegram):', err);
  }
}


