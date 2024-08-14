import React, { useState } from "react";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import Container from "./components/Container";
import { arrayMove } from "@dnd-kit/sortable";
import { Groups } from "./types";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api";
import { useHotkeys } from "react-hotkeys-hook";

/* The implementation details of <Item> and <ScrollableList> are not
 * relevant for this example and are therefore omitted. */

const defaultItems: Groups = {};
function FileButton(props: { setterFn: any }) {
  function handleClick() {
    invoke("load_file")
      // `invoke` returns a Promise
      .then((response) => {
        props.setterFn(response);
      });
  }
  return (
    <div>
      <button onClick={() => handleClick()}>Click Me!</button>
    </div>
  );
}

function DragApp() {
  const [items, setItems] = useState<Groups>(defaultItems);
  const [newName, setNewName] = useState<string>("");
  useHotkeys("ctrl+s", () => handleSave());
  function handleSave() {
    invoke("save_file", { groups: items })
      // `invoke` returns a Promise
      .then((response) => {
        toast.success("Saved File Successfully");
        console.log(response);
      });
  }
  return (
    <div>
      <FileButton setterFn={setItems} />
      <div>
        <button onClick={() => handleSave()}>Save Button</button>
      </div>
      <div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        ></input>
        <button
          onClick={() => setItems((items) => ({ ...items, [newName]: [] }))}
        >
          New Team
        </button>
      </div>
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
      const names = items[key].map((p) => p.name);
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
      if (items[overContainer].length >= 6 && overContainer != "0") {
        console.log("Too many elements");
        toast.warning("Max team size is 6");
        return;
      }
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.findIndex((e) => e.name == overId);
        const activeIndex = activeItems.findIndex((e) => e.name == active.id);

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        return {
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (item) => item.name !== active.id
          ),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(
              newIndex,
              items[overContainer].length
            ),
          ],
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

    const overIndex = items[overContainer].findIndex((e) => e.name == overId);
    const activeIndex = items[overContainer].findIndex(
      (e) => e.name == active.id
    );

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }
  }
}

export default DragApp;
