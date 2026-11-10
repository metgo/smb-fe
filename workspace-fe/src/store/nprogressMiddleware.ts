import type { Middleware } from "@reduxjs/toolkit";
import { progressDone, progressStart } from "@/lib/progress";

export const nprogressMiddleware: Middleware =
  () => (next) => (action: any) => {
    if (typeof action?.type === "string") {
      if (action.type.endsWith("/executeMutation/pending")) {
        progressStart();
      } else if (
        action.type.endsWith("/executeMutation/fulfilled") ||
        action.type.endsWith("/executeMutation/rejected")
      ) {
        progressDone();
      }
    }
    return next(action);
  };
