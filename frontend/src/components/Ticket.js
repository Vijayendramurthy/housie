const Ticket = ({ ticket }) => {
  if (!ticket || !Array.isArray(ticket)) {
    return <div>Loading ticket...</div>;
  }

  return (
    <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
      <tbody>
        {ticket.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, colIndex) => (
              <td
                key={colIndex}
                style={{
                  width: "40px",
                  height: "40px",
                  border: "1px solid black",
                  textAlign: "center",
                  backgroundColor: cell ? "#f0f0f0" : "#fff",
                }}
              >
                {cell || ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Ticket;
