import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';

async function startServer() {
  const app = express();
  
  // Configuration CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Ici on peut ajouter l'authentification
      return {
        user: req.headers.authorization ? { id: 'current-user' } : null
      };
    },
    introspection: true
  });

  await server.start();
  server.applyMiddleware({ 
    app, 
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  });

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur GraphQL prêt sur http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📊 GraphQL Playground disponible sur http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Erreur lors du démarrage du serveur:', error);
});