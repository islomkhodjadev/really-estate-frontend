// UCode project configuration for the Really Estate app.
// Override any of these via Vite env vars (VITE_*) in a .env file.
export const CONFIG = {
  BASE: import.meta.env.VITE_UCODE_BASE ?? "https://api.admin.u-code.io",
  CDN: import.meta.env.VITE_CDN_BASE ?? "https://cdn.u-code.io/",
  PROJECT_ID: import.meta.env.VITE_PROJECT_ID ?? "ac686335-c396-4627-818d-1128e156001e",
  ENV_ID: import.meta.env.VITE_ENV_ID ?? "c57ca06c-6ec2-4eba-b101-4ada458e8877",
  APP_ID: import.meta.env.VITE_APP_ID ?? "P-mqoq8ZAsF26RKAnSuUuXO2atj4yDSBQy",
  FUNCTION: import.meta.env.VITE_FUNCTION ?? "really-estate-iam",
  // App-user roles (under the "User Base" client type)
  ROLES: {
    Client: "4ec61c0a-db6e-4bdc-9959-2dcfcd21b825",
    Agent: "b86024de-ccd4-407c-80a1-35b63a041b6e",
    Owner: "37594ae9-e5b5-4e4b-82bb-9f4e45a04d00",
  } as Record<string, string>,
};

// MULTISELECT field option values (sent/received as arrays).
export const ENUMS = {
  propertyType: ["apartment", "house", "commercial", "land"],
  dealType: ["sale", "rent"],
  currency: ["USD", "UZS", "EUR"],
  status: ["active", "reserved", "sold", "rented", "archived"],
  heating: ["central", "gas", "electric", "none"],
  viewingStatus: ["pending", "confirmed", "completed", "cancelled", "no_show"],
};
