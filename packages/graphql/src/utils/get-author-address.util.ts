import type { ISCNRecord } from '../interfaces';

export const getAuthorAddress = ({ data }: ISCNRecord): string | null => {
  const author = data.stakeholders.find(
    stakeholder => stakeholder.contributionType === 'http://schema.org/author'
  );

  if (!author) {
    return null;
  }

  return author.entity['@id'];
};
