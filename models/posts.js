export default (sequelize, Sequelize) => {
  return sequelize.define('posts', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nickname: Sequelize.STRING,
    post: Sequelize.TEXT,
  });
};
