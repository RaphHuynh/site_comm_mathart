"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Calendar } from "lucide-react";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: "", description: "", date: "", location: "" });
      fetchEvents();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur inconnue");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Gestion des événements</h1>
      <Card>
        <CardHeader>
          <CardTitle>Créer un événement</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Titre" value={form.title} onChange={handleChange} required />
            <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
            <Input name="date" type="datetime-local" value={form.date} onChange={handleChange} required />
            <Input name="location" placeholder="Lieu" value={form.location} onChange={handleChange} />
            <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Créer"}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Liste des événements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin h-8 w-8" /></div>
          ) : !Array.isArray(events) ? (
            <div className="text-center text-red-500">Erreur de chargement des événements</div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-500">Aucun événement</div>
          ) : (
            <ul className="divide-y">
              {events.map(event => (
                <li key={event.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-sm text-gray-600">{event.description}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(event.date).toLocaleString("fr-FR")}
                      {event.location && <> — {event.location}</>}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 