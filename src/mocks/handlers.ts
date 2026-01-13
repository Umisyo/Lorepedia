import type { RequestHandler } from "msw"

// MSWハンドラーを定義する
// 例:
// import { http, HttpResponse } from 'msw'
// export const handlers: RequestHandler[] = [
//   http.get('/api/example', () => {
//     return HttpResponse.json({ message: 'Hello, world!' })
//   }),
// ]
export const handlers: RequestHandler[] = []
