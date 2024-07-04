import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";

const RoomPage = () => {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState();

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log("new user joined room", emailId);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming Call from", from, offer);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("call got accepted", ans);
      await setRemoteAnswer(ans);
    },
    [setRemoteAnswer]
  );

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    } catch (error) {
      console.error("Error getting user media:", error);
    }
  }, [peer]);

  const handleNegotiationNeeded = useCallback(async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("call-user", { emailId: remoteEmailId, offer });
    } catch (error) {
      console.error("Error during negotiation:", error);
    }
  }, [peer, remoteEmailId, socket]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncommingCall, handleCallAccepted]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    peer.addEventListener("track", (event) => {
      const [remoteStream] = event.streams;
      // Update your state or UI to show the remote stream
    });

    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [peer, handleNegotiationNeeded]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  const handleSendStream = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        peer.addTrack(track, myStream);
      });
    }
  };

  return (
    <>
      <div className="room-page-container">
        <h1>Roompage</h1>
        <h4>You are connected to {remoteEmailId}</h4>
        <button onClick={handleSendStream}>Send Stream</button>
        <ReactPlayer url={myStream} playing muted />
        <ReactPlayer url={remoteStream} playing />
      </div>
    </>
  );
};

export default RoomPage;
