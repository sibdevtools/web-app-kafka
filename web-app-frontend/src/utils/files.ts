/**
 * Download file by client
 * @param base64 body content
 * @param filename file name
 * @param contentType content type
 */
export const downloadBase64File = (base64: string,
                                   filename: string,
                                   contentType: string) => {
  const link = document.createElement('a');
  link.href = `data:${contentType};base64,${base64}`;
  link.download = filename;
  link.click();
};
