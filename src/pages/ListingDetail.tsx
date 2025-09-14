import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Users, Calendar, Car, Building, Plane, Star } from 'lucide-react';

interface Listing {
  id: string;
  type: 'hotel' | 'trip' | 'car';
  title: string;
  description: string;
  price: number;
  location: string;
  image_url: string;
  amenities: string[];
  max_guests: number;
  available_from: string;
  available_to: string;
  owner_id: string;
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!listing || !checkIn || !checkOut) return 0;
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays * listing.price;
  };

  const handleBooking = async () => {
    if (!user || !listing) {
      toast({
        title: "Error",
        description: "Please sign in to make a booking",
        variant: "destructive",
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Error",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);

    try {
      const totalPrice = calculateTotalPrice();
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          listing_id: listing.id,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          total_price: totalPrice,
          special_requests: specialRequests || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking request submitted successfully! You'll receive a confirmation email soon.",
      });

      navigate('/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Building className="w-5 h-5" />;
      case 'trip':
        return <Plane className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Listing not found</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Listing Details */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-4"
              >
                ← Back to listings
              </Button>
              
              <div className="h-96 bg-muted rounded-lg mb-6 flex items-center justify-center">
                {listing.image_url ? (
                  <img 
                    src={listing.image_url} 
                    alt={listing.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-muted-foreground text-6xl">
                    {getTypeIcon(listing.type)}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  {getTypeIcon(listing.type)}
                  <span className="capitalize">{listing.type}</span>
                </Badge>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>
                {listing.max_guests && (
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Up to {listing.max_guests} guests</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4">{listing.title}</h1>
              
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-3xl font-bold text-primary">
                  ${listing.price}
                </span>
                <span className="text-muted-foreground">
                  {listing.type === 'hotel' && '/ night'}
                  {listing.type === 'car' && '/ day'}
                  {listing.type === 'trip' && '/ person'}
                </span>
              </div>

              <div className="prose max-w-none mb-8">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
              </div>

              {listing.amenities && listing.amenities.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book this {listing.type}</CardTitle>
                <CardDescription>
                  Fill in the details below to make your booking request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkin">
                      {listing.type === 'hotel' ? 'Check-in' : 'Start Date'}
                    </Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout">
                      {listing.type === 'hotel' ? 'Check-out' : 'End Date'}
                    </Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {listing.max_guests && (
                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={listing.max_guests}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="requests">Special Requests (Optional)</Label>
                  <Textarea
                    id="requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or requests?"
                    rows={3}
                  />
                </div>

                {checkIn && checkOut && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Total Price:</span>
                      <span className="text-2xl font-bold text-primary">
                        ${calculateTotalPrice()}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleBooking}
                  disabled={bookingLoading || !user || !checkIn || !checkOut}
                  className="w-full"
                  size="lg"
                >
                  {bookingLoading ? 'Submitting...' : 'Request Booking'}
                </Button>

                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    <Button variant="link" onClick={() => navigate('/auth')} className="p-0">
                      Sign in
                    </Button>
                    {' '}to make a booking
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;