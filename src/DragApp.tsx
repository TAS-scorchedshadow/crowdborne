import React, { useState } from "react";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import Container from "./components/Container";
import { arrayMove } from "@dnd-kit/sortable";
import { Groups, TraineeGroup } from "./types";
import { toast } from "sonner";

/* The implementation details of <Item> and <ScrollableList> are not
 * relevant for this example and are therefore omitted. */

const defaultItems: Groups = {
  unassigned: {
    members: [],
  },
  "Group 1": {
    members: [
      { name: "Dylan Huynh", role: "lead" },
      { name: "Nicole Chun", role: "lead" },
      { name: "Henry Guo", role: "trainee" },
      { name: "Kevin Shen", role: "trainee" },
      { name: "Eric Wu", role: "trainee" },
    ],
  },
  "Group 2": {
    members: [
      { name: "Lachlan Shoesmith", role: "lead" },
      { name: "Winnie Zhang", role: "trainee" },
      { name: "Micheal Tanto", role: "lead" },
      { name: "Hannah Ahn", role: "trainee" },
      { name: "John Smith", role: "trainee" },
    ],
  },
};

function DragApp() {
  const [items, setItems] = useState<Groups>(defaultItems);
  return (
    <div>
      <DndContext
        collisionDetection={closestCorners}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex w-screen flex-wrap gap-2">
          {Object.entries(items).map(([key, item]) => {
            return <Container id={key} items={item}></Container>;
          })}
        </div>
      </DndContext>
    </div>
  );
  function findContainer(id): string | undefined {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => {
      const names = items[key].members.map((p) => p.name);
      return names.includes(id);
    });
  }
  function onDragOver({ active, over }) {
    const overId = over?.id;

    if (overId == null || active.id in items) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    console.log(overContainer, activeContainer);
    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      if (
        items[overContainer].members.length >= 6 &&
        overContainer != "unassigned"
      ) {
        console.log("Too many elements");
        toast.warning("Max team size is 6");
        return;
      }
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.members.findIndex((e) => e.name == overId);
        const activeIndex = activeItems.members.findIndex(
          (e) => e.name == active.id
        );

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.members.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0
              ? overIndex + modifier
              : overItems.members.length + 1;
        }

        return {
          ...items,
          [activeContainer]: {
            members: items[activeContainer].members.filter(
              (item) => item.name !== active.id
            ),
          },
          [overContainer]: {
            members: [
              ...items[overContainer].members.slice(0, newIndex),
              items[activeContainer].members[activeIndex],
              ...items[overContainer].members.slice(
                newIndex,
                items[overContainer].members.length
              ),
            ],
          },
        };
      });
    }
  }

  function onDragEnd(event: { active: any; over: any }) {
    const { active, over } = event;
    const { id } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const overIndex = items[overContainer].members.findIndex(
      (e) => e.name == overId
    );
    const activeIndex = items[overContainer].members.findIndex(
      (e) => e.name == active.id
    );

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: {
          members: arrayMove(
            items[overContainer].members,
            activeIndex,
            overIndex
          ),
        },
      }));
    }
  }
}

export default DragApp;
