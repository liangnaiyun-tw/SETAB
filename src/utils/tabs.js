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

function getFullGroupNameById(groupId) {
  if (groupId === "Unsaved") return groupId;
  return getGroupNameChain(groupId).join("/");
}

export { getGroupNameChain, getFullGroupNameById };