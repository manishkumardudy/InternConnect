function generateRandomPassword(length = 10) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const allChars = upper + lower;

  // Guarantee at least 1 uppercase and 1 lowercase letter
  let passwordArr = [
    upper.charAt(Math.floor(Math.random() * upper.length)),
    lower.charAt(Math.floor(Math.random() * lower.length))
  ];

  // Fill remaining slots with random letters (uppercase/lowercase only)
  for (let i = passwordArr.length; i < length; i++) {
    passwordArr.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
  }

  // Fisher-Yates Shuffle
  for (let i = passwordArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
  }

  return passwordArr.join('');
}

module.exports = { generateRandomPassword };
