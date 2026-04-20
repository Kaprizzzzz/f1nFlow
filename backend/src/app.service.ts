import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  getReadiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString()
    };
  }

  getMetrics(): string {
    const mem = process.memoryUsage();
    return [
      '# HELP process_resident_memory_bytes Resident memory size in bytes',
      '# TYPE process_resident_memory_bytes gauge',
      `process_resident_memory_bytes ${mem.rss}`,
      '# HELP process_heap_used_bytes Heap used in bytes',
      '# TYPE process_heap_used_bytes gauge',
      `process_heap_used_bytes ${mem.heapUsed}`
    ].join('\n');
  }

  getOpenApiDocument() {
    return {
      openapi: '3.0.3',
      info: {
        title: 'f1nFlow API',
        version: '1.0.0',
        description: 'Core API for auth, user state and transactions.'
      },
      paths: {
        '/health': {
          get: {
            summary: 'Liveness check',
            responses: {
              '200': { description: 'Service is alive' }
            }
          }
        },
        '/health/readiness': {
          get: {
            summary: 'Readiness check',
            responses: {
              '200': { description: 'Service is ready' }
            }
          }
        },
        '/metrics': {
          get: {
            summary: 'Prometheus-like process metrics',
            responses: {
              '200': { description: 'Plain text metrics' }
            }
          }
        }
      }
    };
  }
}
