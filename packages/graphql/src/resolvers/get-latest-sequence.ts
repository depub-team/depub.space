export const ISCN_TXN_DURABLE_OBJECT = 'http://iscn-txn';

export const getLatestSequence = async (stub: DurableObjectStub) => {
  // get latest sequence
  const latestSequenceRequest = new Request(`${ISCN_TXN_DURABLE_OBJECT}/sequence`);
  const latestSequenceResponse = await stub.fetch(latestSequenceRequest);
  const latestSequenceResponseBody = await latestSequenceResponse.json<{ nextSequence: number }>();

  return latestSequenceResponseBody.nextSequence ? latestSequenceResponseBody.nextSequence : 0;
};
