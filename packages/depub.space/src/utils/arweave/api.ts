import Axios from 'axios';
import { EstimateArweaveResponse, UploadArweaveResponse } from './types';
import { isNode } from './util';

const LIKE_CO_API = process.env.NEXT_PUBLIC_LIKE_CO_API;

const axios = Axios.create({
  baseURL: LIKE_CO_API,
  timeout: 60000,
});

export async function estimateArweavePrice(
  files: string | File[] | FileList
): Promise<EstimateArweaveResponse> {
  let form: any;

  if (typeof files === 'string') {
    if (!isNode()) throw new Error('file path is only supported in node.js');
    form = new FormData();
  } else {
    const fileArray = Array.from(files);

    form = new FormData();

    fileArray.forEach(f => {
      form.append(f.name, f, f.name);
    });
  }

  const res = await axios.post('/arweave/estimate', form, {
    headers: isNode() ? { ...form.getHeaders() } : {},
    params: {
      deduplicate: 1,
    },
  });
  const { data } = res;

  return data as EstimateArweaveResponse;
}

export async function uploadToArweave(
  files: string | File[] | FileList,
  txHash: string
): Promise<UploadArweaveResponse> {
  let form: any;

  if (typeof files === 'string') {
    if (!isNode()) throw new Error('file path is only supported in node.js');
    form = new FormData();
  } else {
    const fileArray = Array.from(files);

    form = new FormData();

    fileArray.forEach(f => {
      form.append(f.name, f, f.name);
    });
  }

  const res = await axios.post(`/arweave/upload?txHash=${txHash}`, form, {
    headers: isNode() ? { ...form.getHeaders() } : {},
    params: {
      deduplicate: 1,
    },
  });
  const { data } = res;

  return data as UploadArweaveResponse;
}
