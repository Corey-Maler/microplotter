export const toClosest2 = (n: number) => {
  // 3 -> 2
  // 4 -> 2
  // 11 -> 20
  // 12 -> 20

  // 100 -> 200

  // get the most significant digit
  const str = n.toFixed(0);
  const mostSignificantDigit = parseInt(str[0], 10);

  if (mostSignificantDigit <= 3) {
    return parseInt(2 + '0'.repeat(str.length - 1));
  }

  if (mostSignificantDigit >= 7) {
    return parseInt(2 + '0'.repeat(str.length));
  }

  return parseInt(5 + '0'.repeat(str.length - 1));
};
