import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
  closestCenter,
} from "@dnd-kit/core";
import SortableContainer from "./components/SortableContainer";
import { arrayMove } from "@dnd-kit/sortable";
import { Groups, Person } from "./types";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api";
import { useHotkeys } from "react-hotkeys-hook";
import Container from "./components/Container";
import * as Dialog from "@radix-ui/react-dialog";
import { ShowDifficultyContext } from "./context/ShowDifficultyContext";
import { ActiveContext } from "./context/ActiveContext";

/* The implementation details of <Item> and <ScrollableList> are not
 * relevant for this example and are therefore omitted. */

const defaultItems: Groups = {};

function DragApp() {
  const [items, setItems] = useState<Groups>(defaultItems);
  const [newName, setNewName] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<Person | null>(null);
  const [showDifficulty, setShowDifficulty] = useState<boolean>(false);

  useHotkeys("ctrl+o", () => handleLoad());
  useHotkeys("ctrl+s", () => handleSave());
  useHotkeys("ctrl+t", () => setModalOpen(true));
  useHotkeys("d", () => setShowDifficulty((b) => !b));

  function handleSave() {
    invoke("save_file", { groups: items })
      // `invoke` returns a Promise
      .then((_) => {
        toast.success("Saved File Successfully");
      })
      .catch((e) => {
        toast.error(`File Save Error: ${e}`);
      });
  }

  function handleLoad() {
    invoke("load_file")
      .then((response) => setItems(response as Groups))
      .catch((e) => {
        toast.error(`File Load Error: ${e}`);
      });
  }

  return (
    <div>
      <div className="w-screen text-center mt-5">
        <h1 className="font-bold text-7xl">Crowdborne</h1>
        <h3 className="font-bold text-2xl">A Training Program MatchMaker</h3>
      </div>
      <div className="w-screen flex justify-center my-5 gap-8">
        <div>
          <button
            className="bg-blue-700 px-3 rounded-lg py-1"
            onClick={() => handleLoad()}
          >
            Open File
          </button>
        </div>
        <div>
          <button
            className="bg-slate-800 px-3 rounded-lg py-1"
            onClick={() => handleSave()}
          >
            Save File
          </button>
        </div>
      </div>
      <ActiveContext.Provider value={activeItem}>
        <ShowDifficultyContext.Provider value={showDifficulty}>
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex flex-wrap gap-4 mx-8">
              {Object.entries(items).map(([key, item]) => {
                return (
                  <SortableContainer id={key} items={item}></SortableContainer>
                );
              })}
              <Container>
                <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
                  <Dialog.Trigger asChild>
                    <div className="rounded-lg bg-gray-600 h-full border-dashed border-2">
                      <button className="flex w-full h-full items-center justify-center flex-col transition hover:bg-gray-500">
                        <div className="text-7xl">+</div>
                        <div className="text-xl">New Group</div>
                      </button>
                    </div>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/10" />
                    <Dialog.Content className="bg-white fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] p-4 rounded-lg text-black">
                      <Dialog.Title className="DialogTitle">
                        Add Team
                      </Dialog.Title>
                      <Dialog.Description>
                        Dialog for specifying the name for a new team
                      </Dialog.Description>
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (!(newName in items)) {
                            setItems((items) => ({ ...items, [newName]: [] }));
                          }
                          setModalOpen(false);
                          console.log(items);
                        }}
                      >
                        <input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          type="text"
                          name="team"
                          className="w-full bg-white border-2 border-black rounded-sm"
                        />
                      </form>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </Container>
            </div>
          </DndContext>
        </ShowDifficultyContext.Provider>
      </ActiveContext.Provider>
      <div className="fixed left-0 bottom-0 w-[250px] pl-2">
        {activeItem ? `Selected: ${activeItem.name}` : ""}
      </div>
      <div className="fixed right-0 bottom-0 w-[250px]">
        <ul>
          <li>
            [d] = Toggle Mode - {showDifficulty ? "Difficulty" : "Preferences"}
          </li>
          {showDifficulty ? (
            <li>Black = Difficulty - {activeItem?.difficulty}</li>
          ) : (
            <>
              <li>Green = Mutual</li>
              <li>Yellow = Selected Wants</li>
              <li>Blue = Wants Selected</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );

  function findContainer(uid: UniqueIdentifier): string | undefined {
    const id = uid.toString();
    if (id in items) {
      // If id corresponds to a container return
      return id;
    }
    return Object.keys(items).find((key) => {
      const names = items[key].map((p) => p.name);
      return names.includes(id);
    });
  }

  function getActiveItem(uid: UniqueIdentifier): Person | null {
    const id = uid.toString();
    for (const container of Object.values(items)) {
      for (const person of container) {
        if (person.name === id) {
          return person;
        }
      }
    }
    return null;
  }

  function onDragStart(event: DragStartEvent) {
    let { active } = event;
    setActiveItem(getActiveItem(active.id.toString()));
  }
  1;
  function onDragOver(event: DragOverEvent) {
    let { active, over } = event;
    const overId = over?.id;

    if (overId == null || active.id in items) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

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

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const { id } = active;
    if (over == undefined) {
      return;
    }
    const overId = over.id;

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
    //setActiveItem(null);
  }
}

export default DragApp;
