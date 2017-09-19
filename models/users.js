export default (sequelize, Sequelize) => {
  return sequelize.define('users', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nickname: { type: Sequelize.STRING, unique: true, allowNull: false },
    password: { type: Sequelize.STRING, unique: true, allowNull: false },
  }, {
    timestamps: false,
  });
};
