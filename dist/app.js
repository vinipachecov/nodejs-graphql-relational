"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const graphqlHTTP = require("express-graphql");
const models_1 = require("./models");
const extract_jwt_middleware_1 = require("./middlewares/extract.jwt.middleware");
const schema_1 = require("./graphql/schema");
class App {
    constructor() {
        this.express = express();
        this.middleware();
    }
    middleware() {
        this.express.use('/graphql', extract_jwt_middleware_1.extractJwtMiddleware(), (req, res, next) => {
            req['context'].db = models_1.default;
            next();
        }, 
        // req é utilizado para quando
        // for adicionada a autenticação
        // seja possível pegar o token
        graphqlHTTP((req) => ({
            schema: schema_1.default,
            graphiql: process.env.NODE_ENV === 'development',
            context: req['context']
        })));
    }
}
exports.default = new App().express;
