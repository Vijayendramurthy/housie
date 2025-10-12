// utils/TicketGenerator.js
const generateHousieTicket = () => {
  const ticket = Array(3)
    .fill(null)
    .map(() => Array(9).fill(null));
  
  const columnRanges = [
    [1, 10],
    [11, 20],
    [21, 30],
    [31, 40],
    [41, 50],
    [51, 60],
    [61, 70],
    [71, 80],
    [81, 90],
  ];

  const numbersPerColumn = columnRanges.map(([min, max]) =>
    Array.from({ length: max - min + 1 }, (_, i) => min + i)
  );

  for (let row = 0; row < 3; row++) {
    const columns = [...Array(9).keys()];
    const selectedColumns = columns
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    selectedColumns.sort((a, b) => a - b);

    selectedColumns.forEach((col) => {
      const availableNumbers = numbersPerColumn[col];
      if (availableNumbers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const number = availableNumbers.splice(randomIndex, 1)[0];
        ticket[row][col] = number;
      }
    });
  }

  return ticket;
};

module.exports = { generateHousieTicket };
