// Shared between the login forms (client) and their server actions.

export type LoginState = {
  // Goes up on every submit, so the form can remount its fields with the email sent back.
  attempt: number;
  error?: "invalid" | "email" | "rateLimited" | "generic";
  notice?: "linkSent";
  email?: string;
};
export const initialLoginState: LoginState = { attempt: 0 };

export type PasswordState = { error?: "short" | "generic" };
export const initialPasswordState: PasswordState = {};
