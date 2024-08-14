import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableCard";
import { Person } from "../types";

export default function Container(props: { id: string; items: Person[] }) {
  const { setNodeRef } = useDroppable({ id: props.id });

  return (
    <div className="bg-[#1b1414] px-4 pt-4 pb-6 rounded-lg w-[250px] min-h-[30px]">
      <h1 className="">Team {props.id}</h1>
      <SortableContext
        id={props.id}
        items={props.items.map(({ name }) => name)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex flex-col">
          <div className="flex flex-col gap-1">
            {props.items.slice(0, 2).map((p) => (
              <SortableItem key={p.name} person={p} />
            ))}
          </div>
          <div className="h-4"></div>
          <div className="flex flex-col gap-1">
            {props.items.slice(2).map((p) => (
              <SortableItem key={p.name} person={p} />
            ))}
          </div>
        </div>
      </SortableContext>
    </div>
  );
}
