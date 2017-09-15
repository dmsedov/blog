import 'crypto' from 'crypto';

export default (str) => {
  const hash = crypto.createHash();
  hash.update(str);
  return hash.digest('hex');
};
