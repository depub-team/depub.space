import { NotionAPI } from './notion.api';
import mockSearchResponse from '../../test/__mocks__/fixtures/notion-search-response.mock';
import mockDatabaseQueryResponse from '../../test/__mocks__/fixtures/notion-database-query-response.mock';

/* eslint-disable @typescript-eslint/ban-ts-comment */
function mockFetch(status: number, data?: Record<string, any>) {
  const xhrMockObj = {
    json: jest.fn().mockResolvedValue(data),
  };

  const xhrMockClass = () => xhrMockObj;

  // @ts-ignore
  global.fetch = jest.fn().mockImplementation(xhrMockClass);
}

/* eslint-enable @typescript-eslint/ban-ts-comment */

describe('Notion API client', () => {
  describe('getDatabases()', () => {
    it('should call notion api and return a list objects', async () => {
      mockFetch(200, mockSearchResponse);

      const notionApi = new NotionAPI('foo', 'bar');
      const response = {
        data: {
          'Table: HK': '51650c66-938a-4916-935f-ce888d2ae692',
          'Table: Universal': '85c0eaa3-e23f-46b8-b695-bf86fb30da7f',
        },
      };

      const databases = await notionApi.getDatabases();

      return expect(databases).toEqual(response.data);
    });
  });

  describe('getList()', () => {
    it('should get a list by a database id', async () => {
      mockFetch(200, mockDatabaseQueryResponse);

      const notionApi = new NotionAPI('foo', 'bar');
      const list = await notionApi.getList('85c0eaa3-e23f-46b8-b695-bf86fb30da7f');

      expect(Array.isArray(list)).toBeTruthy();
      expect(list[0]).toHaveProperty('countryCodes');
      expect(list[0]).toHaveProperty('hashTag');
      expect(list[0]).toHaveProperty('name');
    });
  });
});
