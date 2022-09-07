export const getValidCollaborators = (collaborators, emails = []) => {
  if (!Array.isArray(emails)) {
    return [];
  }
  return emails.filter(e => collaborators.findIndex(c => c.email === e) > -1);
};

export const getCollaboratorsDisplayString = (emails, emailCollaboratorMap) => {
  if (!Array.isArray(emails) || emails.length === 0) {
    return null;
  }
  return emails.map(email => {
    const collaborator = emailCollaboratorMap[email];
    return collaborator && collaborator.name;
  }).filter(Boolean).join(',');
};

export const getValidOptionIds = (options, optionIds = []) => {
  if (!Array.isArray(optionIds)) {
    return [];
  }
  return optionIds.filter(oId => options.findIndex(o => o.id === oId) > -1);
};
