export const getValidCollaborators = (collaborators, emails = []) => {
  if (!Array.isArray(emails)) {
    return [];
  }
  return emails.filter(e => collaborators.findIndex(c => c.email === e) > -1);
};

export const getValidOptionIds = (options, optionIds = []) => {
  if (!Array.isArray(optionIds)) {
    return [];
  }
  return optionIds.filter(oId => options.findIndex(o => o.id === oId) > -1);
};
