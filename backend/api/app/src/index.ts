import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

if (process.env.NODE_ENV === 'development') {
  // 動的インポートにより、Lambda本番環境に余計なモジュールを巻き込まない
  import('@hono/node-server').then(({ serve }) => {
    const port = 3000
    console.log(`Local dev server is running on port ${port}`)
    serve({
      fetch: app.fetch,
      port
    })
  })
}

export const handler = handle(app)
