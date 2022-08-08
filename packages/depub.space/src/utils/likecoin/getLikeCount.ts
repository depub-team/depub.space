import Axios from 'axios';

const LIKE_CO_API = process.env.NEXT_PUBLIC_LIKE_CO_API;

const axios = Axios.create({
  baseURL: LIKE_CO_API,
  timeout: 60000,
});

export interface LikeCount {
  total: number;
  totalLiker: number;
}

export async function getLikeCount(iscnId: string): Promise<LikeCount> {
  const res = await axios.post<LikeCount>(`/like/likebutton/iscn/total?iscn_id=${iscnId}`);
  const { data } = res;

  return data;
}
