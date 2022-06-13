import xml from 'xml';
import { Bindings } from '../bindings';
import { ISCNRecord } from './interfaces';

const getMessages = async (env: Bindings, fromSequence?: string) => {
  const baseUrl = env.NODE_URL;
  let res;
  const url = new URL(`${baseUrl}iscn/records/fingerprint`);
  const searchParams = new URLSearchParams();

  searchParams.append('fingerprint', 'https://depub.blog');

  if (fromSequence) {
    searchParams.append('fromSequence', fromSequence);
  }

  try {
    res = await fetch(`${url}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (ex: any) {
    throw new Error(`cannot fetch data. error: ${ex.message}`);
  }

  try {
    const data = await res.json<{ records: ISCNRecord[]; next_sequence: string }>();

    return data;
  } catch {
    // do nothing
  }

  return {
    records: [] as ISCNRecord[],
    next_sequence: undefined,
  };
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

const updateSitemap = async (env: Bindings) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let { records, next_sequence } = await getMessages(env);
  let fileIndex = 1;
  const sitemapPageFiles = {
    [`sitemap${fileIndex}.xml`]: getLastMessageDate(records),
  };

  await env.SITEMAP_BUCKET.put(`sitemap${fileIndex}.xml`, recordsToXML(records));

  // eslint-disable-next-line no-unreachable-loop
  while (next_sequence) {
    const filename = `sitemap${fileIndex}.xml`;

    fileIndex += 1;

    sitemapPageFiles[filename] = getLastMessageDate(records);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-await-in-loop
    const messages = await getMessages(env, next_sequence);

    records = messages.records;
    next_sequence = messages.next_sequence;

    // eslint-disable-next-line no-await-in-loop
    await env.SITEMAP_BUCKET.put(filename, recordsToXML(records));
  }

  await env.SITEMAP_BUCKET.put('sitemap.xml', indexSitemap(sitemapPageFiles));
};

export default {
  fetch: async (request: Request, env: Bindings) => {
    const url = new URL(request.url);

    if (request.method === 'GET' && /^\/sitemap/.test(url.pathname)) {
      const sitemapFile = await env.SITEMAP_BUCKET.get(url.pathname.replace(/^\//, ''));

      if (!sitemapFile) {
        return new Response('Not found', {
          status: 404,
        });
      }

      return new Response(sitemapFile.body, {});
    }

    return new Response('Not found', {
      status: 404,
    });
  },

  scheduled: async (_event: ScheduledEvent, env: Bindings) => updateSitemap(env),
};
