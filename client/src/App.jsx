import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RoomPage from "./pages/Room";
import "./app.css";
import { SocketProvider } from "./providers/Socket";
import { PeerProvider } from "./providers/Peer";

function App() {
  return (
    <>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </>
  );
}

export default App;
