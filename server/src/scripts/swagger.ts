import '../utils/loadModules'

import swaggerAutogen from 'swagger-autogen'

const doc = {
  info: {
    version: '1.0.0',
    title: 'mChat',
    description: 'Realtime messenger powered by socket.io',
  },
  host: 'localhost:3000',
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
  schemes: ['http', 'https'],
}

const outputFile = '../swagger-output.json'
const routes = ['./../routes.ts']

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc)
