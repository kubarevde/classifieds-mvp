"use client";

import { useEffect } from "react";

import { captureError, captureMessage } from "@/lib/observability";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    void navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        captureMessage("service-worker-registered");
      })
      .catch((error) => {
        captureError(error, { area: "service-worker-register" });
      });
  }, []);

  return null;
}

