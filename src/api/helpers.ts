export const api = 'https://api.github.com';

const getResponse = async (url: string | URL, init?: RequestInit) => {
  const response = await fetch(url.toString(), init)
  const text = await response.text()
  const data = (text && JSON.parse(text)) ?? null
  return { response, text, data }
}

export const doFetch = async <T>(url: string | URL, init?: RequestInit) => {
  const { response, text, data } = await getResponse(url, init)
  if (!response.ok) {
    const err = data?.message || text || response.statusText
    return Promise.reject(err)
  }
  return data as T
}

