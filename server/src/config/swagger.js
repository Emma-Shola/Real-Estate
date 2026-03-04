const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'AI Real Estate CRM API',
    version: '1.0.0',
    description: 'Production-ready API documentation for the AI-powered Real Estate CRM backend.',
  },
  servers: [{ url: SERVER_URL }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Properties' },
    { name: 'Leads' },
    { name: 'AI' },
    { name: 'Analytics' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
        },
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'agent'] },
          agencyName: { type: 'string' },
        },
      },
      Property: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          location: { type: 'string' },
          type: { type: 'string' },
          bedrooms: { type: 'number' },
          bathrooms: { type: 'number' },
          images: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['available', 'sold', 'rented'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Lead: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          budget: { type: 'number' },
          preferredLocation: { type: 'string' },
          message: { type: 'string' },
          status: { type: 'string', enum: ['new', 'contacted', 'inspection', 'closed'] },
          aiScore: { type: 'number' },
          classification: { type: 'string' },
          reasoning: { type: 'string' },
          aiResponseDraft: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service health payload',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role: { type: 'string', enum: ['admin', 'agent'] },
                  agencyName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registered successfully' },
          409: { description: 'Duplicate email' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current authenticated user' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/properties': {
      get: {
        tags: ['Properties'],
        summary: 'List properties',
        parameters: [
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['available', 'sold', 'rented'] } },
          { name: 'page', in: 'query', schema: { type: 'number' } },
          { name: 'limit', in: 'query', schema: { type: 'number' } },
        ],
        responses: {
          200: { description: 'Paginated property list' },
        },
      },
      post: {
        tags: ['Properties'],
        summary: 'Create property',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Property created' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/properties/{id}': {
      get: {
        tags: ['Properties'],
        summary: 'Get property by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Property details' },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Properties'],
        summary: 'Update property',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Updated successfully' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Properties'],
        summary: 'Delete property (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Deleted successfully' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/leads/public': {
      post: {
        tags: ['Leads'],
        summary: 'Create public lead (no auth)',
        responses: {
          201: { description: 'Lead captured and AI processing attempted' },
        },
      },
    },
    '/api/leads': {
      get: {
        tags: ['Leads'],
        summary: 'List leads (agents only see assigned leads)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Leads list' },
        },
      },
    },
    '/api/leads/{id}': {
      put: {
        tags: ['Leads'],
        summary: 'Update lead',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Lead updated' },
        },
      },
      delete: {
        tags: ['Leads'],
        summary: 'Delete lead (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Lead deleted' },
        },
      },
    },
    '/api/ai/generate-description': {
      post: {
        tags: ['AI'],
        summary: 'Generate AI property description',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Generated description' },
        },
      },
    },
    '/api/ai/chatbot-public': {
      post: {
        tags: ['AI'],
        summary: 'Public inquiry chatbot endpoint (no auth)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string' },
                  propertyContext: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Chatbot reply generated' },
        },
      },
    },
    '/api/analytics/overview': {
      get: {
        tags: ['Analytics'],
        summary: 'Get analytics overview',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Overview metrics' },
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.get('/api/docs.json', (req, res) => res.json(swaggerDocument));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = {
  setupSwagger,
};
