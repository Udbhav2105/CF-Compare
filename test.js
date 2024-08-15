function createRatingFrequencyArray(arr) {
  const freqDict = {};
  for (const num of arr) {
    freqDict[num] = (freqDict[num] || 0) + 1;
  }

  // Convert the object to an array of objects
  const ratingFrequencyArray = Object.entries(freqDict).map(([rating, count]) => ({
    rating: parseInt(rating), // Convert the key back to an integer
    count
  }));

  return ratingFrequencyArray;
}

const myArray = [4, 5, 4, 3, 5, 4, 5, 3, 4];
const ratingFrequencyArray = createRatingFrequencyArray(myArray);
console.log(ratingFrequencyArray);
// Output: [
//   { rating: 4, count: 4 },
//   { rating: 5, count: 3 },
//   { rating: 3, count: 2 }
// ]
