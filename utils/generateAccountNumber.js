function generateAccountNumber() {
  const prefix = '3'; // Nigerian banks typically start with 3
  const number = Math.floor(100000000 + Math.random() * 900000000); // 9-digit random number
  return prefix + number.toString(); // 10-digit string
}

module.exports = generateAccountNumber;
