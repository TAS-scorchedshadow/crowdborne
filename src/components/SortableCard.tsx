import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Person } from "../types";

export function Card(props: { person: Person }) {
  return (
    <div
      className={`${
        props.person.role == "trainee" ? "bg-[#2894A7]" : "bg-red-600"
      } w-full p-1 rounded-md`}
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
