"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const createRequest = useMutation(api.requests.createRequest);
  const requests = useQuery(api.requests.getAllRequests);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRequest({ text, customer_email: email });
    setText("");
    setEmail("");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SupportFlow - Dashboard</h1>
      
      {/* Formulaire d'envoi */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <h2 className="text-xl mb-4">Nouvelle demande client</h2>
        <input
          type="email"
          placeholder="Email du client"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <textarea
          placeholder="Message du client"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          rows={4}
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Envoyer la demande
        </button>
      </form>

      {/* Liste des demandes */}
      <div>
        <h2 className="text-xl mb-4">Demandes reçues</h2>
        {requests?.length === 0 && <p>Aucune demande pour le moment</p>}
        <div className="space-y-4">
          {requests?.map((request) => (
            <div key={request._id} className="p-4 border rounded">
              <div className="flex justify-between mb-2">
                <span className="font-bold">{request.customer_email}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  request.status === "received" ? "bg-yellow-200" :
                  request.status === "analyzed" ? "bg-blue-200" :
                  request.status === "replied" ? "bg-green-200" : "bg-gray-200"
                }`}>
                  {request.status}
                </span>
              </div>
              <p className="mb-2">{request.text}</p>
              <div className="text-sm text-gray-500">
                Urgence: {request.urgency} | Sujet: {request.category} | Sentiment: {request.sentiment}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}