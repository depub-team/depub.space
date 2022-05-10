import type { ISCNRecord } from '../interfaces';

export const getAuthorAddress = ({ data }: ISCNRecord): string => {
  const author = data.stakeholders.find(
    stakeholder => stakeholder.contributionType === 'http://schema.org/author'
  );

  return author.entity['@id'];
};
