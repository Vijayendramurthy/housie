"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import io from "socket.io-client"

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'
const socket = io(API_BASE)

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "30px",
    marginBottom: "20px",
    position: "relative",
    overflow: "hidden",
  },
  headerBefore: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    borderRadius: "16px 16px 0 0",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "16px",
    marginTop: "8px",
  },
  roomInfo: {
    display: "flex",
    gap: "30px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2d3748",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  button: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)",
  },
  endButton: {
    background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
  },
  endButtonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(229, 62, 62, 0.3)",
  },
  errorMessage: {
    color: "#e53e3e",
    fontSize: "14px",
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#fed7d7",
    borderRadius: "8px",
    border: "1px solid #feb2b2",
  },
  numbersCard: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "30px",
    marginBottom: "20px",
    position: "relative",
    overflow: "hidden",
  },
  numbersTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "20px",
    marginTop: "8px",
  },
  numbersGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  numberBadge: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    minWidth: "40px",
    textAlign: "center",
  },
  playersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
  },
  playerCard: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "25px",
    position: "relative",
    overflow: "hidden",
  },
  playerName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "16px",
    marginTop: "8px",
  },
  ticketTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "16px",
  },
  tableCell: {
    width: "33.33%",
    height: "40px",
    textAlign: "center",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    fontWeight: "500",
    position: "relative",
  },
  emptyCell: {
    backgroundColor: "#f7fafc",
    color: "#a0aec0",
  },
  filledCell: {
    backgroundColor: "#edf2f7",
    color: "#2d3748",
  },
  crossedCell: {
    backgroundColor: "#c6f6d5",
    color: "#22543d",
    fontWeight: "700",
  },
  statusMessages: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statusMessage: {
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "center",
  },
  winnerStatus: {
    backgroundColor: "#c6f6d5",
    color: "#22543d",
    border: "1px solid #9ae6b4",
  },
  pendingStatus: {
    backgroundColor: "#fed7d7",
    color: "#742a2a",
    border: "1px solid #feb2b2",
  },
  loadingMessage: {
    textAlign: "center",
    fontSize: "18px",
    color: "#718096",
    padding: "40px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
}

function AdminPage() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const [players, setPlayers] = useState([])
  const [generatedNumbers, setGeneratedNumbers] = useState([])
  const [roomDetails, setRoomDetails] = useState(null)
  const [currentUser, setCurrentUser] = useState({ name: "", isAdmin: false })
  const [hoveredButton, setHoveredButton] = useState("")

  const fetchRoomDetails = useCallback(async () => {
    try {
  const response = await axios.get(`${API_BASE}/api/rooms/${roomCode}`)
      setRoomDetails(response.data)
    } catch (error) {
      console.error("Error fetching room details:", error)
    }
  }, [roomCode])

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
  const response = await axios.get(`${API_BASE}/api/rooms/${roomCode}/players`)
        setPlayers(response.data.players)
      } catch (err) {
        console.error("Error fetching players:", err)
      }
    }

    const fetchGeneratedNumbers = async () => {
      try {
  const response = await axios.get(`${API_BASE}/api/rooms/${roomCode}/generated-numbers`)
        setGeneratedNumbers(response.data.generatedNumbers)
      } catch (err) {
        console.error("Error fetching generated numbers:", err)
      }
    }

    fetchPlayers()
    fetchGeneratedNumbers()
    fetchRoomDetails()

    socket.emit("joinRoom", roomCode)

    socket.on("numberGenerated", (number) => {
      setGeneratedNumbers((prevNumbers) => [...prevNumbers, number])
    })

    return () => {
      socket.off("numberGenerated")
    }
  }, [roomCode, fetchRoomDetails])

  useEffect(() => {
    if (roomDetails?.gameStatus === "end") {
      navigate("/createroom")
    }
  }, [roomDetails, navigate])

  const handleGenerateNumber = async () => {
    if (roomDetails?.gameStatus === "end") {
      alert("Room has ended. No more numbers can be generated.")
      return
    }

    try {
  await axios.post(`${API_BASE}/api/rooms/${roomCode}/generate-number`)
    } catch (err) {
      console.error("Error generating number:", err)
    }
  }

  const handleEndGame = async () => {
    try {
  await axios.post(`${API_BASE}/api/rooms/${roomCode}/end`)
      alert("Game ended!")
    } catch (err) {
      alert("Failed to end game")
    }
  }

  const isNumberGenerated = (number) => generatedNumbers.includes(number)

  const checkJaldiFive = (ticket) => {
    if (!ticket) return false
    let count = 0
    ticket.forEach((row) => {
      row.forEach((cell) => {
        if (cell && isNumberGenerated(cell)) count++
      })
    })
    return count >= 5
  }

  const checkRowWinner = (ticket) => {
    if (!ticket) return false
    return ticket.some((row) => row.filter((cell) => cell && isNumberGenerated(cell)).length === 5)
  }

  const checkFullHousie = (ticket) => {
    if (!ticket) return false
    return ticket.every((row) => row.every((cell) => !cell || isNumberGenerated(cell)))
  }

  const getButtonStyle = (buttonType) => {
    const baseStyle = buttonType === "end" ? styles.endButton : styles.button
    const hoverStyle = buttonType === "end" ? styles.endButtonHover : styles.buttonHover

    return {
      ...baseStyle,
      ...(hoveredButton === buttonType ? hoverStyle : {}),
    }
  }

  const getCellStyle = (cell) => {
    if (!cell) {
      return { ...styles.tableCell, ...styles.emptyCell }
    } else if (isNumberGenerated(cell)) {
      return { ...styles.tableCell, ...styles.crossedCell }
    } else {
      return { ...styles.tableCell, ...styles.filledCell }
    }
  }

  const getStatusStyle = (isWinner) => ({
    ...styles.statusMessage,
    ...(isWinner ? styles.winnerStatus : styles.pendingStatus),
  })

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerBefore}></div>
        <h2 style={styles.title}>Admin Dashboard</h2>

        <div style={styles.roomInfo}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Room Code</span>
            <span style={styles.infoValue}>{roomCode}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Game Status</span>
            <span style={styles.infoValue}>
              {roomDetails?.gameStatus === "end" ? "Game Ended" : roomDetails?.gameStatus || "Active"}
            </span>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={getButtonStyle("generate")}
            onMouseEnter={() => setHoveredButton("generate")}
            onMouseLeave={() => setHoveredButton("")}
            onClick={handleGenerateNumber}
          >
            Generate Number
          </button>
          <button
            style={getButtonStyle("end")}
            onMouseEnter={() => setHoveredButton("end")}
            onMouseLeave={() => setHoveredButton("")}
            onClick={handleEndGame}
          >
            End Game
          </button>
        </div>

        {roomDetails?.gameStatus === "end" && (
          <div style={styles.errorMessage}>Room has ended. No further actions are allowed.</div>
        )}
      </div>

      <div style={styles.numbersCard}>
        <div style={styles.headerBefore}></div>
        <h3 style={styles.numbersTitle}>Generated Numbers ({generatedNumbers.length})</h3>
        <div style={styles.numbersGrid}>
          {generatedNumbers.length > 0 ? (
            generatedNumbers.map((number, index) => (
              <span key={index} style={styles.numberBadge}>
                {number}
              </span>
            ))
          ) : (
            <p style={{ color: "#718096", fontStyle: "italic" }}>No numbers generated yet</p>
          )}
        </div>
      </div>

      <div className="tickets-container">
        {players.length > 0 ? (
          players.map((player, index) => (
            <div key={index} className="ticket-container">
              <h3>{player.name}</h3>
              <table className="ticket-table">
                <tbody>
                  {player.ticket.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={
                            cell
                              ? isNumberGenerated(cell)
                                ? 'crossed-cell'
                                : 'filled-cell'
                              : 'empty-cell'
                          }
                        >
                          {cell ? (isNumberGenerated(cell) ? 'X' : cell) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="status-messages">
                <p>{checkJaldiFive(player.ticket) ? "Jaldi Five Winner!" : "Not yet Jaldi Five"}</p>
                <p>{checkRowWinner(player.ticket) ? "Row Winner!" : "No row completed yet"}</p>
                <p>{checkFullHousie(player.ticket) ? "Full Housie Winner!" : "Not yet Full Housie"}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="loading-message">Loading players...</div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
