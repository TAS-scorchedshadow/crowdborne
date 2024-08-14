export type Person = {
  name: string;
  role: "trainee" | "lead";
  trainee_preferences: string[];
  lead_preferences: string[];
  github: String;
  discord: String;
};

export interface Groups {
  [key: string]: Person[];
}
