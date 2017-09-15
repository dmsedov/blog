import crypto from 'crypto';

export default (str) => {
  const hash = crypto.createHash('sha512');
  hash.update(str);
  return hash.digest('hex');
};
