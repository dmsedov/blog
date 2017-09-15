import encrypt from '../encrypt';

export default class User {
  constructor(nickname, password) {
    this.nickname = nickname;
    this.passwordDigest = encrypt(password);
  }

  isGuest() {
    return false;
  }
}
