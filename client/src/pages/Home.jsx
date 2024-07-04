import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

const Home = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [email, setEmail] = useState();
  const [roomId, setRoomId] = useState();

  const handleRoomJoined = useCallback(
    ({ roomId }) => {
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );
  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);
  }, [handleRoomJoined, socket]);

  const handleJoinRoom = () => {
    socket.emit("join-room", { emailId: email, roomId });
  };
  return (
    <>
      <div className="homepage-container">
        <div className="input-container">
          <input
            type="email"
            placeholder="Enter the email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room code"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
          />
          <button onClick={handleJoinRoom}>Enter Room</button>
        </div>
      </div>
    </>
  );
};
export default Home;
