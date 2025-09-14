import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'rejected';
  special_requests: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    type: string;
    location: string;
    image_url: string;
  };
}

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings (
            id,
            title,
            type,
            location,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please sign in</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your booking requests
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and book your first experience!
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Listings
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Listing Image */}
                    <div className="lg:w-48 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {booking.listing.image_url ? (
                        <img 
                          src={booking.listing.image_url} 
                          alt={booking.listing.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-muted-foreground text-2xl">📷</div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            {booking.listing.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.listing.location}</span>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {booking.listing.type}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Check-in</p>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(booking.check_in)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Check-out</p>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(booking.check_out)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Guests</p>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{booking.guests}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <span className="font-bold text-primary text-lg">
                            ${booking.total_price}
                          </span>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                          <p className="text-sm bg-muted p-2 rounded">
                            {booking.special_requests}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Booked on {formatDate(booking.created_at)}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/listing/${booking.listing.id}`)}
                        >
                          View Listing
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;