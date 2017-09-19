export default (sequelize, Sequelize) => {
  return sequelize.define('users', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nickname: Sequelize.STRING,
    password: Sequelize.STRING,
  });
};
