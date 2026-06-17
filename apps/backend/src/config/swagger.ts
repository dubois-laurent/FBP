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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, '../../routes/*.ts')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
