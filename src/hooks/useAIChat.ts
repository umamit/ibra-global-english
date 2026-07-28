"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function useAIChat(apiEndpoint: string, welcomeMessage: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [hasOpened, setHasOpened] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clean up streaming timer on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasOpened(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleResetChat = useCallback(() => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
    }
    setIsStreaming(false);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      }
    ]);
  }, [welcomeMessage]);

  /**
   * Fungsi untuk mensimulasikan efek pengetikan balasan AI huruf demi huruf (Typewriter Streaming)
   */
  const streamAssistantReply = useCallback((fullReply: string) => {
    const assistantId = (Date.now() + 1).toString();
    const timestamp = new Date();

    // Inisialisasi pesan awal kosong
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp,
        isStreaming: true,
      }
    ]);

    setIsStreaming(true);

    let currentIndex = 0;
    const chunkSize = 2; // Mengetik 2 karakter per tick untuk animasi yang halus namun responsif

    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
    }

    streamTimerRef.current = setInterval(() => {
      currentIndex += chunkSize;
      const currentContent = fullReply.slice(0, currentIndex);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: currentContent }
            : msg
        )
      );

      if (currentIndex >= fullReply.length) {
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: fullReply, isStreaming: false }
              : msg
          )
        );
      }
    }, 18);
  }, []);

  /**
   * Mutation untuk mengirim pesan chat ke AI backend.
   */
  const chatMutation = useMutation({
    mutationFn: async (text: string) => {
      const apiMessages = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...apiMessages, { role: "user", content: text }] }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Gagal mendapat respons AI.");
      }

      return data.reply;
    },
    onSuccess: (reply) => {
      streamAssistantReply(reply);
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: err.message,
          timestamp: new Date(),
          isStreaming: false,
        },
      ]);
    },
  });

  const sendMessage = useCallback((text: string) => {
    if (!text || chatMutation.isPending || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    chatMutation.mutate(text);
  }, [chatMutation, isStreaming]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    sendMessage(text);
  }, [input, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const formatTime = (date: Date | string | number) =>
    new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return {
    isOpen, setIsOpen,
    messages, setMessages,
    input, setInput,
    isLoading: chatMutation.isPending,
    isStreaming,
    hasOpened,
    messagesEndRef,
    inputRef,
    handleOpen,
    handleClose,
    handleResetChat,
    handleSend,
    handleKeyDown,
    formatTime,
    sendMessage,
  };
}