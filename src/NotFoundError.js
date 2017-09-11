export default class NotFoundError extends Error {
  constructor(...arg) {
    super(...arg);
    this.status = 404;
  }
}
