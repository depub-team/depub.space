import { DataSource } from 'apollo-datasource';
import {
  MultiSelectType,
  NotionResponse,
  SelectType,
  TitleType,
} from '../interfaces/notion-response.interface';

export class NotionAPI extends DataSource {
  constructor(
    private readonly baseURL: string,
    private readonly secret: string,
    private readonly databaseId: string
  ) {
    super();
  }

  public async getList() {
    const response = await fetch(`${this.baseURL}/databases/${this.databaseId}/query`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
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
        'Country Code': MultiSelectType;
      }>
    >();

    if (!data || !data.results) {
      return [];
    }

    const list = data.results.map(r => {
      const listNameProperty = r.properties['List Name'];
      const channelProperty = r.properties['Channel(#)'];
      const countryProperty = r.properties['Country Code'];
      const listName = listNameProperty.select.name;
      const channelName = channelProperty.title[0].text.content;
      const countryCodes = countryProperty.multi_select.map(select => select.name);

      return {
        name: listName,
        hashTag: channelName,
        countryCodes,
      };
    });

    return list;
  }
}
