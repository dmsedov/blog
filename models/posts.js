export default (sequelize, Sequelize) => {
  const Posts = sequelize.define('posts', {
    post_id: { type: Sequelize.INTEGER, primaryKey: true },
    nickname: { type: Sequelize.STRING, unique: true, allowNull: false },
    post: { type: Sequelize.TEXT, allowNull: false },
  }, {
    timestamps: false,
  });
  return Posts;
};
