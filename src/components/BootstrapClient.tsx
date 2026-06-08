"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // Dynamically load Bootstrap JS on the client side only
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
