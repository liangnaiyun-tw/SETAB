function getTabsInGroups(group, groupIds, groupIdx) {

  if (groupIdx + 1 === groupIds.length) {
    return group[groupIds[groupIdx]]?.tabs;
  } else {
    return getTabsInGroups(group[groupIds[groupIdx]].groups, groupIds, groupIdx + 1);
  }
}

export { getTabsInGroups };
