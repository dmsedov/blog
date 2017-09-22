import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.load();

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);
fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== 'index.js')
    .forEach((file) => {
      const model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    });


db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
