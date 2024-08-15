import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableCard";
import { Person } from "../types";
import Container from "./Container";

export default function SortableContainer(props: {
  id: string;
  items: Person[];
}) {
  const { setNodeRef } = useDroppable({ id: props.id });

  return (
    <Container>
      <div className="p-4 rounded-lg bg-[#1b1414] h-full flex flex-col">
        <h1 className="text-center pb-2">Team {props.id}</h1>
        <SortableContext
          id={props.id}
          items={props.items.map(({ name }) => name)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="flex flex-col h-full">
            <div className="flex flex-col gap-1 p-1 rounded-lg bg-orange-100">
              {props.items.slice(0, 2).map((p) => (
                <SortableItem key={p.name} person={p} />
              ))}
            </div>
            <div className="h-4"></div>
            <div className="flex flex-col gap-1 p-1 rounded-lg bg-orange-100 h-full">
              {props.items.slice(2).map((p) => (
                <SortableItem key={p.name} person={p} />
              ))}
            </div>
          </div>
        </SortableContext>
      </div>
    </Container>
  );
}
