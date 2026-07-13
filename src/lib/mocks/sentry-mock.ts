export const init = (...args: any[]) => {};
export const captureException = (err: any) => {
  console.log("[Sentry Mock] captureException:", err?.message || err);
};
export const captureMessage = (msg: string, context?: any) => {
  console.log("[Sentry Mock] captureMessage:", msg, context);
};
export const captureRequestError = (err: any) => err;
export const captureRouterTransitionStart = () => {};
export const metrics = {
  count: (...args: any[]) => {},
};
export const setUser = (user: any) => {};
export const replayIntegration = (...args: any[]) => () => {};
export const feedbackIntegration = (...args: any[]) => () => {};
