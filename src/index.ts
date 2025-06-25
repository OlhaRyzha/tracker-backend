import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import routes from './routes';
import { initializeDb } from './utils/db';
import config from './config';

async function start() {
  try {
    console.log(`Starting server in ${config.server.env} mode`);

    await initializeDb();

    const fastify = Fastify({
      logger: {
        level: config.logger.level,
        transport: config.isDevelopment
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
      },
    });

    await fastify.register(cors, {
      origin: [
        'http://localhost:3000',
        'https://olharyzha.github.io',
        'https://your-vercel-frontend.vercel.app',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: config.upload.maxFileSize,
      },
    });

    await fastify.register(fastifyStatic, {
      root: config.storage.uploadsDir,
      prefix: '/api/files/',
      decorateReply: false,
    });

    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Music Tracks API',
          description: 'API for managing music tracks',
          version: '1.0.0',
        },
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    });

    await fastify.register(routes);

    const port = Number(process.env.PORT) || config.server.port;

    await fastify.listen({
      port,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
    console.log(`📘 Swagger documentation available at http://0.0.0.0:${port}/documentation`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

start();
