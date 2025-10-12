import React from "react";

const HousieTicket = ({ ticket }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Your Housie Ticket</h2>
      <table
        style={{
          margin: "0 auto",
          borderCollapse: "collapse",
          fontSize: "20px",
          textAlign: "center",
        }}
      >
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
    </div>
  );
};

export default HousieTicket;
