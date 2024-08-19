import { useContext, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Person } from "../types";
import { inPreferences } from "../helpers";
import { ActiveContext } from "../context/ActiveContext";
import { ShowDifficultyContext } from "../context/ShowDifficultyContext";

export function Card(props: { person: Person }) {
  const active = useContext(ActiveContext);
  const showDifficulty = useContext(ShowDifficultyContext);

  const border_colour = useMemo(() => {
    if (!active) {
      return "";
    }

    if (active.name == props.person.name) {
      return "border-4 border-black";
    }

    if (showDifficulty && active.difficulty == props.person.difficulty) {
      return "border-4 border-black border-dashed";
    }

    const wanted = inPreferences(active, props.person);
    const wants = inPreferences(props.person, active);
    if (wanted && wants) {
      return "border-4 border-green-700";
    } else if (wanted) {
      return "border-4 border-yellow-300";
    } else if (wants) {
      return "border-4 border-dashed border-sky-700";
    } else {
      return "";
    }
  }, [active, showDifficulty]);
  return (
    <div
      className={`${
        props.person.role == "trainee" ? "bg-[#2894A7]" : "bg-red-600"
      } ${border_colour} w-full p-1 rounded-md drop-shadow`}
    >
      <div>{props.person.name}</div>
    </div>
  );
}

export default function SortableCard(props: { person: Person }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.person.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card person={props.person} />
    </div>
  );
}
