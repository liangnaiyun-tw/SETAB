import React, { useEffect, useState } from "react";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { useSelector } from "react-redux";

export default function MenuList() {
  // To retrieve the workspaces of the current user.
  const { workspaces } = useSelector((store) => store.firestore);
  const [items, setItems] = useState({
    root: {
      index: "root",
      canMove: true,
      isFolder: true,
      children: [],
      data: "Root item",
      canRename: true,
    },
  });

  // To parse workspaces into a tree structure
  useEffect(() => {
    const rootChildren = [];
    const newItems = items;

    workspaces.forEach((workspace) => {
      rootChildren.push(workspace.id);
      newItems[workspace.id] = {
        index: workspace.id,
        canMove: true,
        isFolder: true,
        children: [],
        data: workspace.name,
        canRename: true,
      };
    });
    newItems.root.children = rootChildren;
    setItems(newItems);
  }, [workspaces]);

  const onDrop = (items, target) => {
    console.log("dropEvent", items);
    console.log("dropevent target", target);
  };
  const defaultInteractionMode = {
    mode: "custom",
    createInteractiveElementProps: (item, treeId, actions, renderFlags) => ({
      onClick: (e) => {
        console.log("custom onClick event", e, item, treeId, actions);
        // todo load node children
      },
      onFocus: (e) => {
        console.log("custom onFocus event", e);
      },
      tabIndex: !renderFlags.isRenaming
        ? renderFlags.isFocused
          ? 0
          : -1
        : undefined,
    }),
  };
  return (
    <>
      <style>{`
            .rct-tree-item-button{
                color: #e8eaed;
            }
        :root {
          --rct-color-tree-bg: #202020;
          --rct-color-tree-focus-outline: #ffffff;
          --rct-color-focustree-item-selected-bg: #333;
          --rct-color-focustree-item-focused-border: #fff;
          --rct-color-focustree-item-draggingover-bg: #333;
          --rct-color-focustree-item-draggingover-color: inherit;
          --rct-color-search-highlight-bg: #333;
          --rct-color-drag-between-line-bg: #333;
          --rct-color-arrow: #e8eaed;
          --rct-item-height: 30px;
          --rct-search-text: #e8eaed
          --rct-arrow-size: 10px;
          --rct-focus-outline: #e8eaed;
          --rct-color-focustree-item-selected-text: #e8eaed;
          --rct-color-focustree-item-hover-text: #333
        }
      `}</style>
      <UncontrolledTreeEnvironment
        dataProvider={
          new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))
        }
        getItemTitle={(item) => item.data}
        viewState={{}}
        canDragAndDrop={true}
        canDropOnFolder={true}
        canReorderItems={true}
        onDrop={(items, target) => {
          onDrop(items, target);
        }}
        defaultInteractionMode={defaultInteractionMode}
      >
        <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
      </UncontrolledTreeEnvironment>
    </>
  );
}
