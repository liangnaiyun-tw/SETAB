

import * as React from 'react';
import { useEffect, useState } from 'react';
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentWorkspace } from '../../../features/firebase/firestore/firestoreSlice';


export default function MenuList() {

    const { workspaces } = useSelector((store) => store.firestore);

    const [items, setItems] = useState({
        root: {
            index: 'root',
            canMove: true,
            isFolder: true,
            children: ['child1'],
            data: 'Root item',
            canRename: true,
            folderId: ""
        }
    });

    const dispatch = useDispatch();
    const onDrop = (items, target) => {
        console.log('dropEvent', items);
        console.log('dropevent target', target);
    };



    useEffect(() => {
        setItems((prev) => {
            prev.root.children = workspaces.map(workspace => workspace.name);
            
            for (let i = 0; i < workspaces.length; i++) {
                prev[workspaces[i].name] = {
                    index: workspaces[i].name,
                    canMove: true,
                    isFolder: true,
                    children: [],
                    data: workspaces[i].name,
                    canRename: true,
                    workspaceId: workspaces[i].id
                }
            }
            return { ...prev };
        })

    }, [workspaces])


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
                getItemTitle={item => item.index}
                viewState={{}}
                canDragAndDrop={true}
                canDropOnFolder={true}
                canReorderItems={true}
                onDrop={(items, target) => { onDrop(items, target) }}
                onFocusItem={(item, treeId) => {
                    dispatch(setCurrentWorkspace(item.workspaceId));
                }}  
            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>
        </>
    );
}