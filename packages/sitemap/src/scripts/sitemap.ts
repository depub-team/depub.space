// $(npm bin)/ts-node -P ./packages/sitemap/tsconfig.json  ./packages/sitemap/src/scripts/sitemap.ts

import xml from 'xml';
import fs from 'node:fs';
import axios from 'axios';
import path from 'node:path';
import { ISCNRecord } from '../interfaces';

const getMessages = async (fromSequence?: string) => {
  const baseUrl = 'https://mainnet-node.like.co/';
  let res;
  const url = new URL(`${baseUrl}iscn/records/fingerprint`);
  const searchParams = new URLSearchParams();

  searchParams.append('fingerprint', 'https://depub.blog');

  if (fromSequence) {
    searchParams.append('fromSequence', fromSequence);
  }

  try {
    res = await axios.get<{ records: ISCNRecord[]; next_sequence: string }>(
      `${url}?${searchParams.toString()}`
    );

    return res.data;
  } catch (ex: any) {
    throw new Error(`cannot fetch data. error: ${ex.message}`);
  }
};

const getLastMessageDate = (records: ISCNRecord[]) => {
  const lastMessage = records.sort(
    (a, b) =>
      new Date(b.data.recordTimestamp).getTime() - new Date(a.data.recordTimestamp).getTime()
  )[0];

  return lastMessage ? new Date(lastMessage.data.recordTimestamp).toISOString().split('T')[0] : '';
};

const recordsToXML = (records: ISCNRecord[]) => {
  const sitemapItems = records.map(record => ({
    url: [
      {
        loc: `https://depub.space/${record.data['@id'].split('iscn://likecoin-chain/')[1]}`,
      },
      {
        lastmod: new Date(record.data.recordTimestamp).toISOString().split('T')[0],
      },
    ],
  }));
  const sitemapObject = {
    urlset: [
      {
        _attr: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        },
      },
      ...sitemapItems,
    ],
  };

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>${xml(sitemapObject)}`;

  return sitemap;
};

const createHomePageSitemap = () => {
  fs.writeFileSync(
    path.join(__dirname, '../../.out/sitemap_home.xml'),
    `<?xml version='1.0' encoding='UTF-8'?>${xml({
      urlset: [
        {
          _attr: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
          },
        },
        {
          url: [
            {
              loc: `https://depub.space`,
            },
            {
              lastmod: new Date().toISOString().split('T')[0],
            },
          ],
        },
      ],
    })}`
  );
};

const indexSitemap = (filenameAndLastModDates: Record<string, string>) => {
  const sitemapItems = Object.keys(filenameAndLastModDates).map(filename => ({
    sitemap: [
      { loc: `https://depub.space/${filename}` },
      { lastmod: filenameAndLastModDates[filename] },
    ],
  }));
  const sitemapObject = {
    sitemapindex: [
      {
        _attr: {
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation':
            'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd',
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        },
      },
      ...sitemapItems,
    ],
  };
  const sitemap = `<?xml version='1.0' encoding='UTF-8'?>${xml(sitemapObject)}`;

  return sitemap;
};

const updateSitemap = async () => {
  let nextSequence = '0';
  const sitemapPageFiles = {} as Record<string, string>;

  // eslint-disable-next-line prefer-destructuring
  sitemapPageFiles['sitemap_home.xml'] = new Date().toISOString().split('T')[0];

  createHomePageSitemap();

  // eslint-disable-next-line no-unreachable-loop, no-constant-condition
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-await-in-loop
    const messages = await getMessages(nextSequence);
    const filename = `sitemap${nextSequence}.xml`;
    const filepath = path.join(__dirname, `../../.out/${filename}`);

    if (nextSequence === messages.next_sequence) {
      break;
    }

    nextSequence = messages.next_sequence;

    if (nextSequence === '0') {
      break;
    }

    const latestDate = getLastMessageDate(messages.records);

    sitemapPageFiles[filename] = latestDate;

    // eslint-disable-next-line no-await-in-loop
    fs.writeFileSync(filepath, recordsToXML(messages.records));
  }

  fs.writeFileSync(path.join(__dirname, '../../.out/sitemap.xml'), indexSitemap(sitemapPageFiles));
};

async function main() {
  await updateSitemap();
}

void main();
