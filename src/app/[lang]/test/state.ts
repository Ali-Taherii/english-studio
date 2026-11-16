// Shared between the level test forms (client) and their server actions.

export type StartState = { error?: "rateLimited" | "generic" };
export const initialStartState: StartState = {};

export type FinishState = {
  // Goes up on every submit, so the form can remount its fields with the values sent back.
  attempt: number;
  fieldErrors?: Partial<Record<"name" | "email", true>>;
  formError?: "rateLimited" | "generic";
  values?: { name: string; email: string };
};
export const initialFinishState: FinishState = { attempt: 0 };
