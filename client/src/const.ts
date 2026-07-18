export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL now points to the local email/password login page
export const getLoginUrl = (returnPath?: string) => {
  const base = "/login";
  if (returnPath) {
    return `${base}?returnTo=${encodeURIComponent(returnPath)}`;
  }
  return base;
};
