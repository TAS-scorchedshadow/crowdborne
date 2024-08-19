export type Person = {
  name: string;
  role: "trainee" | "lead";
  trainee_preferences: string[];
  lead_preferences: string[];
  difficulty: String;
  github: String;
  discord: String;
  other: String;
};

export interface Groups {
  [key: string]: Person[];
}
