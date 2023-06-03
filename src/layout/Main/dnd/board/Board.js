// @flow
import React, { useEffect, useState } from "react";
import styled from "@xstyled/styled-components";
import { colors } from "@atlaskit/theme";
import PropTypes from "prop-types";
import Column from "./Column";
import reorder, { reorderQuoteMap } from "../reorder";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";


const InitSturctureList = {
  id: 'first-level',
  title: 'top level',
  children: [
    {
      id: '1',
      content: "Haven't slept for a solid 83 hours, but, yeah, I'm good.",
      author: "Shang",
    },
    {
      id: 'second-level',
      title: 'second level',
      children: [
        {
          id: '4',
          content: "Haven't slept for a solid 83 hours, but, yeah, I'm good.",
          author: "Shang",
        },{
          id: '5',
          content: "Haven't slept for a solid 83 hours, but, yeah, I'm good.",
          author: "Shang",
        },
      ],
    },
    {
      id: '2',
      content: "Haven't slept for a solid 83 hours, but, yeah, I'm good.",
      author: "Shang",
    },{
      id: '3',
      content: "Haven't slept for a solid 83 hours, but, yeah, I'm good.",
      author: "Shang",
    },
  ],
};


const Container = styled.div`
  // background-color: ${colors.B100};
  // min-height: 100vh;
  /* like display:flex but will allow bleeding over the window width */
  // min-width: 100vw;
  display: inline-flex;
  // overflow-x: scroll;
`;

// const NestedContainer = styled(Container)`
//   padding: 0;
//   margin-bottom: ${grid}px;
// `;


const Board = ({
  isCombineEnabled,
  initial,
  useClone,
  containerHeight,
  withScrollableColumns
}) => {
  const { currentWorkspace, currentGroup, workspaces, groups, tabs } = useSelector((store) => store.firestore)
  
  const [structureList, setStructureList] = useState(InitSturctureList);

  const [columns, setColumns] = useState(initial);
  
  
  console.log('columns', columns)

  const [ordered, setOrdered] = useState(Object.keys(initial));
  console.log(ordered)


  // rebuild structure list
  // useEffect(() => {

  // }, [currentWorkspace, currentGroup, workspaces, groups, tabs])


  const onDragEnd = (result) => {
    if (result.combine) {
      if (result.type === "COLUMN") {
        const shallow = [...ordered];
        shallow.splice(result.source.index, 1);
        setOrdered(shallow);
        return;
      }

      const column = columns[result.source.droppableId];
      const withQuoteRemoved = [...column];

      withQuoteRemoved.splice(result.source.index, 1);

      const orderedColumns = {
        ...columns,
        [result.source.droppableId]: withQuoteRemoved
      };
      setColumns(orderedColumns);
      return;
    }

    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // reordering column
    if (result.type === "COLUMN") {
      const reorderedorder = reorder(ordered, source.index, destination.index);

      setOrdered(reorderedorder);

      return;
    }

    const data = reorderQuoteMap({
      quoteMap: columns,
      source,
      destination
    });

    setColumns(data.quoteMap);
  };

  useEffect(() => {
    const newColumns = {};
    if(currentWorkspace){
      let workspaceGroups = groups.filter(group => group.workspace === currentWorkspace);
      workspaceGroups.forEach(g => {
        newColumns[g.name] = [{id: g.id, content: '123'}];
      });
      console.log('newColumns', newColumns)
      setColumns(newColumns);
      setOrdered(Object.keys(newColumns))
    }
  }, [workspaces, currentWorkspace])

  return (
    <>



























      {/* <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="board"
          type="COLUMN"
          direction="horizontal"
          ignoreContainerClipping={Boolean(containerHeight)}
          isCombineEnabled={isCombineEnabled}
        >
          {(provided) => (
            <Container ref={provided.innerRef} {...provided.droppableProps}>
              {ordered.map((key, index) => (
                <Column
                  key={key}
                  index={index}
                  title={key}
                  quotes={columns[key]}
                  isScrollable={withScrollableColumns}
                  isCombineEnabled={isCombineEnabled}
                  useClone={useClone}
                />
              ))}
              {provided.placeholder}
              
            </Container>
          )}
        </Droppable>
      </DragDropContext> */}
    </>
  );
};

Board.defaultProps = {
  isCombineEnabled: false
};

Board.propTypes = {
  isCombineEnabled: PropTypes.bool
};

export default Board;
