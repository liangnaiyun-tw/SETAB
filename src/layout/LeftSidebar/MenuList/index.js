

import * as React from 'react';
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';

export default function MenuList() {

    const items = {
        root: {
            index: 'root',
            canMove: true,
            isFolder: true,
            children: ['child1', 'child2', 'child3'],
            data: 'Root item',
            canRename: true,
        },
        child1: {
            index: 'child1',
            canMove: true,
            isFolder: true,
            children: [],
            data: 'Child item 1',
            canRename: true,
        },
        child2: {
            index: 'child2',
            canMove: true,
            isFolder: true,
            children: [
                'child2_1'
            ],
            data: 'Child item 2',
            canRename: true,
        },
        child2_1: {
            index: 'child2_1',
            canMove: true,
            isFolder: false,
            children: [],
            data: 'Child item 2_1',
            canRename: true,
        },
        child3: {
            index: 'child3',
            canMove: true,
            isFolder: true,
            children: [],
            data: 'Child item 3',
            canRename: true,
        },
    };
    const onDrop = (items, target) => {
        console.log('dropEvent', items);
        console.log('dropevent target', target);
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
                dataProvider={new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))}
                getItemTitle={item => item.data}
                viewState={{}}
                canDragAndDrop={true}
                canDropOnFolder={true}
                canReorderItems={true}
                onDrop={(items, target) => { onDrop(items, target) }}
            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>
        </>
    );
}