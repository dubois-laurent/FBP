import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.4',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation de l\'API FPB (routes authentification, événements, réservations et messages)',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Serveur local',
      },
    ],
    tags: [
      {
        name: 'auth',
        description: 'Authentification JWT et OAuth2 (Google)',
      },
      {
        name: 'events',
        description: 'Gestion des événements',
      },
      {
        name: 'bookings',
        description: 'Gestion des réservations',
      },
      {
        name: 'messages',
        description: 'Gestion des messages',
      },
      {
        name: 'users',
        description: 'Gestion des utilisateurs',
      },
      {
        name: 'health',
        description: 'Vérification de l\'état du serveur',
      }
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
            error: { type: 'string', example: "Message d'erreur" },
            code: { type: 'string', example: 'BAD_REQUEST' },
            details: { type: 'object', nullable: true },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Jean Dupont' },
            email: { type: 'string', format: 'email', example: 'jean@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Exposition Photo' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            venue: { type: 'string', example: 'Paris' },
            totalSeats: { type: 'integer', example: 100 },
            availableSeats: { type: 'integer', example: 80 },
            imageUrl: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['exposition', 'conference', 'atelier', 'rencontre'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            eventId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['confirmed', 'cancelled'] },
            bookedAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            senderId: { type: 'string', format: 'uuid' },
            receiverId: { type: 'string', format: 'uuid' },
            content: { type: 'string', example: 'Bonjour !' },
            sentAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/**/*.ts')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
