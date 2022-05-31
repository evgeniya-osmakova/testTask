import { api, doFetch } from './helpers'
import { Item } from '../models/models';

export const getItems = async () =>
  doFetch<Item>(`${api}/gists/e1702c1ef26cddd006da989aa47d4f62`)

