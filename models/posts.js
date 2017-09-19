export default (sequelize, Sequelize) => {
  return sequelize.define('posts', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nickname: { type: Sequelize.STRING, unique: true, allowNull: false },
    post: { type: Sequelize.TEXT, allowNull: false },
  }, {
    timestamps: false,
  });
};
