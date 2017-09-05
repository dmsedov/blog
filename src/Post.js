export default class Post {
  static id = 1;
  constructor(title, body) {
    this.id = Post.id++;
    this.title = title;
    this.body = body;
  }
}
