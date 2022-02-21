export const waitAsync = async (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(undefined);
    }, ms);
  });
