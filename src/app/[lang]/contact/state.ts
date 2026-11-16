// Shared between the contact form (client) and its server action.

export type ContactValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  package: string;
};

export type ContactState = {
  status: "idle" | "success" | "error";
  // Goes up on every submit, so the form can remount its fields with the values sent back.
  attempt: number;
  fieldErrors?: Partial<Record<"name" | "email" | "message", true>>;
  formError?: "rateLimited" | "generic";
  values?: ContactValues;
};

export const initialContactState: ContactState = { status: "idle", attempt: 0 };
