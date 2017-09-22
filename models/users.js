export default (sequelize, Sequelize) => {
  const Users = sequelize.define('users', {
    user_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nickname: { type: Sequelize.STRING, unique: true, allowNull: false },
    password: { type: Sequelize.STRING, unique: true, allowNull: false },
  }, {
    timestamps: false,
  });
  return Users;
};
