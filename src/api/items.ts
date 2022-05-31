import { api, doFetch } from './helpers'
import { LoadedData } from '../models/models';

export const getItems = async () =>
  doFetch<LoadedData>(`${api}/gists/e1702c1ef26cddd006da989aa47d4f62`)

