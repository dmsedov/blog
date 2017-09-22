export default (sequelize, Sequelize) => {
  const Posts = sequelize.define('posts', {
    post_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false },
    title: { type: Sequelize.STRING, allowNull: false },
    body: { type: Sequelize.TEXT, allowNull: false },
    user: { type: Sequelize.STRING, allowNull: false },
  }, {
    timestamps: false,
  });
  return Posts;
};
