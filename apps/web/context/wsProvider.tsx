"use client";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface wsContextProviderProps {
  children?: React.ReactNode; // make this optional
}

// I stands for interface
interface IwsContext {
  sendMessage: (msg: string) => any;
  messages: any[];
}

const wsContext = React.createContext<IwsContext | null>(null);

export const useWebsocket = () => {
  const state = useContext(wsContext);
  if (!state) throw new Error(`state is undefined`);
  return state;
};

export const WsProvider: React.FC<wsContextProviderProps> = ({ children }) => {
  const [wSocket, setWsocket] = useState<WebSocket | null>(null);
  const [messages, setMessage] = useState<any[]>([null]);

  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage: IwsContext["sendMessage"] = useCallback((msg) => {
    // if (wSocket && wSocket.readyState === WebSocket.OPEN) {
    //   wSocket?.send(msg);
    // }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
      console.log("Message sent successfully");
    } else {
      console.log("Websocket is not open, Unable to send message.");
    }
  }, []);

  const onMessageReceived = useCallback((message: any) => {
    console.log("From server Msg Rec", message);
    // const messaged = JSON.parse(message);
    console.log(message);
    console.log(typeof message);
    // setMessage((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    const _wss = new WebSocket("ws://localhost:8000");
    // if (!_wss) {
    //   console.log("failed to initialise the connection");
    //   return;
    // }
    _wss.onopen = () => {
      console.log("WebSocket Connected", { _wss });
      wsRef.current = _wss;
      setWsocket(_wss);
    };

    _wss.onmessage = (event) => {
      // onMessageReceived(message);
      const data = JSON.parse(event.data);

      setMessage((msg) => [...msg, data.message]);

      console.log({ data });
    };

    _wss.onclose = () => {
      console.log("Websocket disconnected");
      wsRef.current = null;
      setWsocket(null);
    };

    // return () => {
    //   _wss.close();
    // };
  }, []);

  return (
    <wsContext.Provider value={{ sendMessage, messages }}>
      {children}
    </wsContext.Provider>
  );
};
