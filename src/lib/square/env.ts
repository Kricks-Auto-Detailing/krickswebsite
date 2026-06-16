export type SquareEnv = {
  accessToken: string;
  locationId: string;
  environment: "production" | "sandbox";
  apiBaseUrl: string;
  version: string;
  bookingTokenSecret: string;
  webhookSignatureKey?: string;
  webhookUrl?: string;
};

export function getSquareEnv(): SquareEnv {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!accessToken || !locationId) {
    throw new Error("Square is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID on the server.");
  }

  const environment = process.env.SQUARE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";

  return {
    accessToken,
    locationId,
    environment,
    apiBaseUrl: environment === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com",
    version: process.env.SQUARE_VERSION || "2026-05-20",
    bookingTokenSecret: process.env.BOOKING_TOKEN_SECRET || accessToken,
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
    webhookUrl: process.env.SQUARE_WEBHOOK_URL,
  };
}

export function getOptionalSquareEnv() {
  try {
    return getSquareEnv();
  } catch {
    return null;
  }
}
