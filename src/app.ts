import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import db from './models';
import { extractJwtMiddleware } from './middlewares/extract.jwt.middleware';
import schema from './graphql/schema';
class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.middleware();
  }

  private middleware(): void {
    
    this.express.use('/graphql', 

      extractJwtMiddleware(),
      
      (req, res, next) => {        
        req['context'].db = db;        
        next();
      },

      // req é utilizado para quando
      // for adicionada a autenticação
      // seja possível pegar o token
      graphqlHTTP((req) => ({
        schema: schema,
        graphiql: process.env.NODE_ENV === 'development',
        context: req['context']
      }))
  );
    
  }
}

export default new App().express;