import { ApiPath, URL_API, URL_AUTH_LOGIN } from 'app/apiConfig';
import { IError } from 'app/models/types';
import { getLocation, redirect } from 'app/utils/browserUtils';
import { String } from 'typescript-string-operations';
import ResponseError from '../models/types/ResponseError';

const Headers = require('fetch-headers');

export const apiUrl = (path: ApiPath, parameters?: any) =>
  URL_API + (!!parameters ? String.Format(path, parameters) : path);

export async function get(
  path: ApiPath,
  parameters?: any,
  headers?: HeadersInit,
  callbackIfAuth?: (response: Response) => Promise<Response>
): Promise<Response> {
  const response = await fetch(apiUrl(path, parameters), {
    credentials: 'include',
    headers: new Headers(headers),
  });
  if (response.status === 401) {
    login();
  } else if (!!callbackIfAuth) {
    await callbackIfAuth(response);
  }
  return response;
}

export async function post<BodyType>(
  path: ApiPath,
  parameters?: any,
  headers?: HeadersInit,
  body?: BodyType,
  callbackIfAuth?: (
    response: Response,
    responseData?: ResponseError
  ) => Promise<Response>,
  callbackIfError?: (error: any) => any
): Promise<Response> {
  try {
    const response = await fetch(apiUrl(path, parameters), {
      method: 'post',
      credentials: 'include',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...headers },
    });

    const data = await response.json();

    if (response.status === 401) {
      login();
    } else if (!!callbackIfAuth) {
      await callbackIfAuth(response, data);
    }
    return response;
  } catch (error) {
    if (!!callbackIfError) {
      return callbackIfError(error);
    }
    return error;
  }
}

export async function put(
  path: ApiPath,
  parameters?: any,
  body?: any,
  callbackIfAuth?: (response: Response) => Promise<Response>
): Promise<Response> {
  const response = await fetch(apiUrl(path, parameters), {
    method: 'put',
    credentials: 'include',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status === 401) {
    login();
  } else if (!!callbackIfAuth) {
    await callbackIfAuth(response);
  }
  return response;
}

export const loginUrl = () =>
  String.Format(URL_AUTH_LOGIN, { uri: encodeURIComponent(getLocation()) });

export function login() {
  redirect(loginUrl());
}

export function convertResponseToError(response: Partial<Response>): IError {
  const { status, statusText, url } = response;
  return { status, statusText, url };
}
