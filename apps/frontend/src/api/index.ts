import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import type { paths } from './types'

export const ApiClient = createFetchClient<paths>({
  baseUrl: import.meta.env.FRONTEND_API_BASE_URL,
})

ApiClient.use({
  onResponse: async ({ response }) => {
    if (import.meta.env.FRONTEND_SLOWDOWN_API_TIME) {
      await new Promise((resolve) => setTimeout(resolve, Number(import.meta.env.FRONTEND_SLOWDOWN_API_TIME)))
    }
    return response
  },
})

const API = createClient(ApiClient)

export default API
