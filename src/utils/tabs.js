import store from "../app/store";

function getGroupNameChain(groupId) {
  if (groupId === store.getState().firestore.workspaces[0].id) return ["Unsaved"];

  let currentGroupId = groupId;
  let state = store.getState().firestore;
  let fullGroupNameChain = [state.groups.find((group) => group.id === currentGroupId).name], parent;
  while (true) {
    parent = state.groups.find((group) => group.groups.includes(currentGroupId));
    if (!parent) {
      parent = state.workspaces.find((workspace) => workspace.groups.includes(currentGroupId));
      fullGroupNameChain.push(parent.name);
      break;
    } else {
      fullGroupNameChain.push(parent.name);
      currentGroupId = parent.id;
    }
  }
  return fullGroupNameChain.reverse();
}

function getGroupIdChain(groupId) {
  if (groupId === store.getState().firestore.workspaces[0].id) return [store.getState().firestore.workspaces[0].id];

  let currentGroupId = groupId;
  let state = store.getState().firestore;
  let fullGroupIdChain = [state.groups.find((group) => group.id === currentGroupId).id], parent;
  while (true) {
    parent = state.groups.find((group) => group.groups.includes(currentGroupId));
    if (!parent) {
      parent = state.workspaces.find((workspace) => workspace.groups.includes(currentGroupId));
      fullGroupIdChain.push(parent.id);
      break;
    } else {
      fullGroupIdChain.push(parent.id);
      currentGroupId = parent.id;
    }
  }
  return fullGroupIdChain.reverse();
}

function getFullGroupNameById(groupId) {
  if (groupId === "Unsaved") return groupId;
  return getGroupNameChain(groupId).join("/");
}

export { getGroupNameChain, getGroupIdChain, getFullGroupNameById };