export function isNode(): boolean {
  return !!process?.versions?.node;
}

export default isNode;
