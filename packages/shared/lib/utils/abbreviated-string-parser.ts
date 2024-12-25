type MultiplierMap = {
  [key: string]: number;
};

export const parseAbbrTwitterNumber = (value: string): number => {
  // Define multipliers for different suffixes
  const multipliers: MultiplierMap = {
    k: 1000,
    K: 1000,
    M: 1000000,
    B: 1000000000,
  };

  // If the input is just a number without suffix
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  // Extract the number and suffix parts
  const match = value.match(/^(\d+(\.\d+)?)([kKMB])$/);

  if (!match) {
    throw new Error('Invalid number format');
  }

  const [, numberPart, , suffix] = match;
  const number = parseFloat(numberPart);
  const multiplier = multipliers[suffix];

  return number * multiplier;
};

function testCases() {
  const testCases = ['999', '1k', '3.3M', '38K', '280K', '3.4K', '1.7B', '256', '380M', '7'];
  testCases.forEach(test => {
    try {
      console.log(`${test} => ${parseAbbrTwitterNumber(test)}`);
    } catch (error: any) {
      console.error(`Error parsing ${test}: ${error?.message}`);
    }
  });
}
