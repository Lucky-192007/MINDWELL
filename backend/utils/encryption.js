const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

// ENCRYPTION_KEY must be a 64-character hex string (32 bytes) in .env
// Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate one with crypto.randomBytes(32).toString("hex")'
    );
  }
  return Buffer.from(key, 'hex');
};

/**
 * Encrypts plaintext before it is ever saved to MongoDB.
 * A new random IV is generated per entry so identical text never
 * produces identical ciphertext.
 * Returns a single string: "iv:ciphertext" (both hex-encoded)
 */
const encrypt = (plainText) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts data pulled from MongoDB. Only ever called when the
 * authenticated owner of the entry requests to read it.
 */
const decrypt = (encryptedText) => {
  const [ivHex, encryptedHex] = encryptedText.split(':');
  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted payload format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = { encrypt, decrypt };
