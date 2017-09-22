import User from '../src/entities/User';
import Post from '../src/Post';
import encrypt from '../src/encrypt';

export default () => {
  const listOfPosts = [new Post('first title', 'content1'),
    new Post('second title', 'content2'), new Post('third title', 'content3'),
    new Post('fourth title', 'content4'), new Post('fifth title', 'content5')];
  const listOfUsers = [new User('John', encrypt('fgreuy')), new User('Nick', encrypt('jgtypo'))];

  const usersData = listOfUsers.map((user) => {
    const row = {};
    row.password = user.passwordDigest;
    row.nickname = user.nickname;
    return row;
  });
  const postsData = listOfPosts.map((post, index) => {
    if (index % 2 === 0) {
      const desiredUser = listOfUsers.find((user, ind) => ind % 2 === 0);
      return { post_id: post.id, title: post.title, body: post.body, user: desiredUser.nickname };
    }
    const desiredUser = listOfUsers.find((user, ind) => ind % 2 !== 0);
    return { post_id: post.id, title: post.title, body: post.body, user: desiredUser.nickname };
  });
  return { usersData, postsData };
};
