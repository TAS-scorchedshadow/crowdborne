export type Person = {
  name: string;
  role: "trainee" | "lead";
};

export type TraineeGroup = {
  members: Person[];
};

export interface Groups {
  [key: string]: TraineeGroup;
}
