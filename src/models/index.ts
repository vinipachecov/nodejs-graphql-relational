import * as fs from 'fs';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import { DbConnection } from '../interfaces/DbConnectionIterface';

const basename: string = path.basename(module.filename);
const env: string = process.env.NODE_ENV || 'development';
let config = require(path.resolve( `${__dirname}./../config/config.json`))[env];
let db = null;

//only one instance for the db
if (!db) {
  db = {};

  const operatorsAliases = {
    // the in operator will help us
    // by receiving a list of ids
    // and search for what has those ids
    $in: Sequelize.Op.in
  };

  config = Object.assign({ operatorsAliases }, config);

  //Load the configuration setup by sequelize to connect to MYSQL   
   const sequelize: Sequelize.Sequelize = new Sequelize(
     config.database,
     config.username,
     config.password,
     config
   );

   //read the files
   // filter each file but not index.js
   // load a model to it
   fs 
    .readdirSync(__dirname)
    .filter((file: string) => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach((file: string) => {
      //load a model to sequelize
      const model = sequelize.import(path.join(__dirname, file));           
      db[model['name']] = model;
    });


    //associate the model with the db
    Object.keys(db).forEach((modelName: string) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    db['sequelize'] = sequelize;
}

export default <DbConnection>db;