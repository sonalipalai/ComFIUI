/**
 * Global fetch safeguard.
 * Ensures `window.fetch` has a defined setter to avoid `TypeError: Cannot set property fetch of #<Window> which has only a getter`
 * if any library or extension script assigns to `window.fetch` or `globalThis.fetch`.
 */
if (typeof window !== 'undefined') {
  try {
    let activeFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get() {
        return activeFetch;
      },
      set(newFetch) {
        activeFetch = newFetch;
      },
      configurable: true,
      enumerable: true,
    });
  } catch (_e) {
    // If window.fetch cannot be redefined directly, attempt prototype level
    try {
      const proto = Object.getPrototypeOf(window);
      if (proto && Object.getOwnPropertyDescriptor(proto, 'fetch')) {
        let protoFetch = proto.fetch;
        Object.defineProperty(proto, 'fetch', {
          get() {
            return protoFetch;
          },
          set(newFetch) {
            protoFetch = newFetch;
          },
          configurable: true,
          enumerable: true,
        });
      }
    } catch (_e2) {}
  }
}

export {};
