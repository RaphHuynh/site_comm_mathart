"use client";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Users, Loader2 } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string | null;
  author?: {
    name: string;
  };
}

function Footer() {
  return (
    <footer className="mt-12 py-6 text-center text-gray-500 text-sm border-t bg-white">
      © {new Date().getFullYear()} MathArt. Tous droits réservés.
    </footer>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Événements <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MathArt</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Découvrez nos événements passionnants et rencontrez la communauté
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                  <p className="text-sm text-gray-600">Événements au total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {events.filter(e => new Date(e.date) >= new Date()).length}
                  </p>
                  <p className="text-sm text-gray-600">À venir</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des événements */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des événements...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement à venir</h3>
                <p className="text-gray-500 mb-6">
                  Restez connecté, de nouveaux événements seront bientôt annoncés !
                </p>
                <Badge className="bg-blue-100 text-blue-800">
                  Événements à venir
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Card 
                key={event.id}
                className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  {/* En-tête avec date */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {new Date(event.date).toLocaleDateString("fr-FR", { 
                          weekday: 'long', 
                          day: '2-digit', 
                          month: 'long' 
                        })}
                      </Badge>
                      <div className="text-sm opacity-90">
                        {new Date(event.date).toLocaleTimeString("fr-FR", { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold mb-2 line-clamp-2">
                      {event.title}
                    </h2>
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                      {event.description}
                    </p>
                    
                    {/* Informations supplémentaires */}
                    <div className="space-y-3">
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2 text-indigo-600" />
                        <span>Organisé par {event.author?.name || 'MathArt'}</span>
                      </div>
                    </div>
                    
                    {/* Badge statut */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {new Date(event.date) >= new Date() ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Clock className="h-3 w-3 mr-1" />
                          À venir
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                          Terminé
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Restez informé des événements
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Rejoignez notre communauté pour ne manquer aucun événement passionnant 
                et rencontrer d&apos;autres passionnés.
              </p>
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-6 py-2 text-base">
                <Calendar className="mr-2 h-4 w-4" />
                Événements à venir
              </Badge>
            </div>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 