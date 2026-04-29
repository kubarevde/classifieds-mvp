"use client";

import { useEffect } from "react";

import { captureEvent, captureException } from "@/lib/monitoring";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    void navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        captureEvent("service_worker.registered", { path: "/sw.js" });
      })
      .catch((error) => {
        captureException(error, { area: "service-worker-register" });
      });
  }, []);

  return null;
}

