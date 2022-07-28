import { Bindings } from '../bindings';

const getMessages = async () => {
  const url = 'https://graphql.depub.space/';
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      operationName: null,
      variables: {},
      query: `{\n  messages {\n    id\n    message\n    from\n    date\n  }\n}\n`,
    }),
  });

  console.log(await res.json());
};

const getChannels = async () => {
  const url = 'https://graphql.depub.space/';
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      operationName: null,
      variables: {},
      query: `{\n  messages {\n    id\n    message\n    from\n    date\n  }\n  getChannels {\n    list {\n      name\n      hashTag\n    }\n    hashTags {\n      name\n      count\n    }\n  }\n}\n`,
    }),
  });

  console.log(await res.json());
};

const updateSitemap = async () => {
  await getMessages();
  await getChannels();
};

export default {
  async fetch() {
    await updateSitemap();

    return new Response('Hello World!');
  },
  async scheduled(_event: ScheduledEvent, _env: Bindings) {
    await updateSitemap();
  },
};
