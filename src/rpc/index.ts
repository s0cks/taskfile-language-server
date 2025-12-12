import * as z from 'zod';

export function encodeMessage(msg: unknown): string {
  let content: string;

  try {
    content = JSON.stringify(msg);
  } catch (error) {
    throw new Error('Failed to encode message: ' + error);
  }

  const contentLength = Buffer.byteLength(content, 'utf8');
  return `Content-Length: ${contentLength}\r\n\r\n${content}`;
}

const baseMessageSchema = z.object({
  id: z.number().optional(),
  jsonrpc: z.string(),
  method: z.string(),
});
export type baseMessageT = z.infer<typeof baseMessageSchema>;
export function decodeMessage(msg: Buffer) {
  const [header, body] = msg.toString().split('\r\n\r\n');

  if (!header || !body) {
    return {
      ok: false,
      error: 'Couldnt find the separator',
    };
  }

  const contentLengthBytes = header.substring('Content-Length: '.length);
  const contentLength = Number(contentLengthBytes);

  // validate the json structure to baseMessageSchema
  const contentJson = JSON.parse(body.substring(0, contentLength));
  const baseMessage = baseMessageSchema.safeParse(contentJson);

  if (!baseMessage.success) {
    return {
      ok: false,
      error: "Couldn't decode the json",
    };
  }

  return {
    ok: true,
    value: {
      request: baseMessage.data,
      content: body.substring(0, contentLength),
    },
  };
}

export function checkValidStdMessage(data: Buffer) {
  // check the string obtained in the std console has content-length and it confirms to the standard.

  const [header, body] = data.toString().split('\r\n\r\n');

  if (!header || !body) {
    return {
      ok: false,
      length: 0,
    };
  }

  const contentLengthBytes = header.substring('Content-Length: '.length);
  const contentLength = Number(contentLengthBytes);

  if (data.length < contentLength) {
    return {
      ok: false,
      length: 0,
    };
  }

  const totalDataLength = header.length + 4 + contentLength;

  return {
    ok: true,
    length: totalDataLength,
  };
}

