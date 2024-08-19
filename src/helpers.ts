import { Person } from "./types";

// Checks if person 2 is in the preference list for person 1
export function inPreferences(person1: Person | null, person2: Person | null) {
  if (person1 == null || person2 == null) {
    return false;
  }

  const p1_pref = [...person1.trainee_preferences, ...person1.lead_preferences];

  if (
    p1_pref.some((pref) => pref.toLowerCase() == person2.name.toLowerCase())
  ) {
    return true;
  }
  return false;
}
