import { createContext } from "react";
import { Person } from "../types";

export const ActiveContext = createContext<Person | null>(null);
