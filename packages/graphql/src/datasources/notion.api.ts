import { DataSource } from 'apollo-datasource';
import { NotionResponse, SelectType, TitleType } from '../interfaces/notion-response.interface';

export class NotionAPI extends DataSource {
  constructor(private readonly baseURL: string, private readonly secret: string) {
    super();
  }

  public async getDatabases() {
    const response = await fetch(`${this.baseURL}/search`, {
      method: 'POST',
      headers: {
        'Notion-Version': '2022-02-22',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.secret}`,
      },
      body: JSON.stringify({
        filter: {
          property: 'object',
          value: 'database',
        },
      }),
    });

    const data = await response.json<NotionResponse<any>>();

    if (!data || !data.results) {
      return null;
    }

    const databases = Object.fromEntries(
      data.results.map(r => [r.title[0].text.content.toLowerCase(), r.id])
    );

    return databases;
  }

  public async getList(databaseId: string) {
    const response = await fetch(`${this.baseURL}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Notion-Version': '2022-02-22',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.secret}`,
      },
      body: JSON.stringify({
        page_size: 100,
        sorts: [
          {
            property: 'Order',
            direction: 'ascending',
          },
        ],
      }),
    });
    const data = await response.json<
      NotionResponse<{
        'List Name': SelectType;
        'Channel(#)': TitleType;
      }>
    >();

    if (!data || !data.results) {
      return [];
    }

    const list = data.results.map(r => {
      const listNameProperty = r.properties['List Name'];
      const channelProperty = r.properties['Channel(#)'];
      const listName = listNameProperty.select.name;
      const channelName = channelProperty.title[0].text.content;

      return {
        name: listName,
        hashTag: channelName,
      };
    });

    return list;
  }
}
