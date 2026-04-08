// utils/passwordGenerator.js
const generateLetterPassword = (length = 12) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const allLetters = lowercase + uppercase;
  
  let password = '';
  
  // Ensure at least 2 lowercase, 2 uppercase
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  
  // Fill remaining with random letters
  for (let i = 4; i < length; i++) {
    password += allLetters[Math.floor(Math.random() * allLetters.length)];
  }
  
  // Shuffle for randomness
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

module.exports = { generateLetterPassword };