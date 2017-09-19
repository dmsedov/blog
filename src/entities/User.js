// import encrypt from '../encrypt';

export default class User {
  constructor(nickname, password) {
    this.nickname = nickname;
    this.passwordDigest = password;
  }

  isGuest() {
    return false;
  }
}
