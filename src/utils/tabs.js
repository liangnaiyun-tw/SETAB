import store from "../app/store";

function getGroupNameChain(groupId) {
  if (groupId === "Unsaved") return ["Unsaved"];

  let state = store.getState().firestore;
  let fullGroupNameChain = [state.groups.find((group) => group.id === groupId).name], parent;
  while (true) {
    parent = state.groups.find((group) => group.groups.includes(groupId));
    if (!parent) {
      parent = state.workspaces.find((workspace) => workspace.groups.includes(groupId));
      fullGroupNameChain.push(parent.name);
      break;
    } else {
      fullGroupNameChain.push(parent.name);
      groupId = parent.id;
    }
  }
  return fullGroupNameChain.reverse();
}

function getGroupIdChain(groupId) {
  if (groupId === "Unsaved") return [store.getState().firestore.workspaces[0].id];

  let state = store.getState().firestore;
  let fullGroupIdChain = [state.groups.find((group) => group.id === groupId).id], parent;
  while (true) {
    parent = state.groups.find((group) => group.groups.includes(groupId));
    if (!parent) {
      parent = state.workspaces.find((workspace) => workspace.groups.includes(groupId));
      fullGroupIdChain.push(parent.id);
      break;
    } else {
      fullGroupIdChain.push(parent.id);
      groupId = parent.id;
    }
  }
  return fullGroupIdChain.reverse();
}

function getFullGroupNameById(groupId) {
  if (groupId === "Unsaved") return groupId;
  return getGroupNameChain(groupId).join("/");
}

export { getGroupNameChain, getGroupIdChain, getFullGroupNameById };