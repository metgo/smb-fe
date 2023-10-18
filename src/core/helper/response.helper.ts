import { Response } from 'express';

interface IResponse {
  statusCode: number,
  message: string | null,
  datas: object | Array<Object> | null,
  error: string | null,
  token: string | null,
}

export function responseHelper(
  res: Response,
  statusCode: number,
  message: string | null,
  datas: null | Array<object> | object,
  error: string | null,
  token: string | null,
) {
  const response: IResponse = {
    statusCode: null,
    message: null,
    datas: null,
    error: null,
    token: null,
  };

  if (statusCode !== null) response.statusCode = statusCode;
  if (message !== null) response.message = message;
  if (datas !== null) response.datas = datas;
  if (error !== null) response.error = error;
  if (token !== null) response.token = token;

  if (message === null) delete response.message;
  if (datas === null) delete response.datas;
  if (error === null) delete response.error;
  if (token === null) delete response.token;

  return res.status(statusCode).json(response);
}
