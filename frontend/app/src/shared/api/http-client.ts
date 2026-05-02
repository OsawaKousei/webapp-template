import { z } from 'zod';

const wrappedSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
});

const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
  }),
});

export const createApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) => {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
};

type RequestArgs = {
  readonly path: string;
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
};

const parseJsonAsync = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
};

const resolvePayload = (responseJson: unknown): unknown => {
  const wrappedSuccess = wrappedSuccessSchema.safeParse(responseJson);

  if (wrappedSuccess.success) {
    return wrappedSuccess.data.data;
  }

  return responseJson;
};

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Unexpected API error');
};

const resolveHttpErrorMessage = (response: Response, responseJson: unknown) => {
  const errorResult = apiErrorSchema.safeParse(responseJson);

  if (errorResult.success) {
    return errorResult.data.error.message;
  }

  return `HTTP ${response.status}: ${response.statusText}`;
};

export const requestJsonAsync = async <T extends z.ZodType>(
  args: RequestArgs,
  responseSchema: T,
): Promise<z.infer<T>> => {
  try {
    const requestInit: RequestInit = {
      method: args.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(args.headers ?? {}),
      },
    };

    if (args.body !== undefined) {
      requestInit.body = JSON.stringify(args.body);
    }

    const response = await fetch(args.path, requestInit);
    const responseJson = await parseJsonAsync(response);

    if (!response.ok) {
      throw new Error(resolveHttpErrorMessage(response, responseJson));
    }

    const errorResult = apiErrorSchema.safeParse(responseJson);

    if (errorResult.success) {
      throw new Error(errorResult.data.error.message);
    }

    const payload = resolvePayload(responseJson);
    const successResult = responseSchema.safeParse(payload);

    if (!successResult.success) {
      throw new Error('API response schema mismatch');
    }

    return successResult.data;
  } catch (error: unknown) {
    throw toError(error);
  }
};

type UploadFileArgs<T extends z.ZodType> = {
  readonly path: string;
  readonly file: File;
  readonly responseSchema: T;
  readonly fileKey?: string;
  readonly formFields?: Record<string, string>;
};

export const uploadFileAsync = async <T extends z.ZodType>(
  args: UploadFileArgs<T>,
): Promise<z.infer<T>> => {
  const formData = new FormData();

  Object.entries(args.formFields ?? {}).forEach(([fieldName, fieldValue]) => {
    formData.append(fieldName, fieldValue);
  });

  formData.append(args.fileKey ?? 'file', args.file);

  const response = await fetch(args.path, {
    method: 'POST',
    body: formData,
  });

  const responseJson = await parseJsonAsync(response);

  if (!response.ok) {
    throw new Error(resolveHttpErrorMessage(response, responseJson));
  }

  const errorResult = apiErrorSchema.safeParse(responseJson);

  if (errorResult.success) {
    throw new Error(errorResult.data.error.message);
  }

  const payload = resolvePayload(responseJson);
  const successResult = args.responseSchema.safeParse(payload);

  if (!successResult.success) {
    throw new Error('API response schema mismatch');
  }

  return successResult.data;
};
