import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import fastifySwagger from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import autoload from '@fastify/autoload'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = Fastify({ logger: true, trustProxy: true, bodyLimit: 34 * 1024 * 1024 })

await app.register(fastifyCors, {
  origin: [
    process.env.FRONTEND_URL ?? 'http://localhost:3000',
    process.env.STREAMING_URL ?? 'http://localhost:4321',
    'http://localhost:4322',
    process.env.DASHBOARD_URL ?? 'http://localhost:3005',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
})

await app.register(fastifyStatic, {
  root: join(__dirname, '..', 'public'),
  prefix: '/static/',
  decorateReply: false,
})

await app.register(fastifySwagger, {
  openapi: { info: { title: 'Full Time API', version: '1.0.0' } },
})

await app.register(ScalarApiReference, { routePrefix: '/docs' })

await app.register(autoload, { dir: join(__dirname, 'routes'), dirNameRoutePrefix: false })

const port = Number(process.env.PORT) || 3333
await app.listen({ port, host: '0.0.0.0' })
