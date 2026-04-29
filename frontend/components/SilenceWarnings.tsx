"use client";

import { useEffect } from "react";

export function SilenceWarnings() {
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      if (typeof args[0] === "string" && args[0].includes("KnownError<ANALYTICS_NOT_ENABLED>")) {
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      if (typeof args[0] === "string" && args[0].includes("KnownError<ANALYTICS_NOT_ENABLED>")) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
