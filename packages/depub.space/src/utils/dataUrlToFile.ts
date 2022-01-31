export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  const base64ContentArray = dataUrl.split(',');
  const mimeType = (base64ContentArray[0]?.match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/) || [])[0];

  return new File([blob], fileName, { type: mimeType || 'image/jpg' });
}
