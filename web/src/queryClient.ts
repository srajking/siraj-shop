// queryClient.ts — the ONE cache for server data (chapter 14), made once for the whole app
import { QueryClient } from '@tanstack/react-query'
import { HttpError, DataError } from './api.ts'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,                                       // an answer is fresh for a minute
      retry: (failures, error) =>                              // a 500 or a wrong shape will not fix itself
        !(error instanceof HttpError || error instanceof DataError) && failures < 2,
    },
  },
})
