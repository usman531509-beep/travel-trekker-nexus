import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Calendar, Car, Building, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'hotel' | 'trip' | 'car'>('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || listing.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Building className="w-4 h-4" />;
      case 'trip':
        return <Plane className="w-4 h-4" />;
      case 'car':
        return <Car className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-100 text-blue-800';
      case 'trip':
        return 'bg-green-100 text-green-800';
      case 'car':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Your Gateway to Amazing Experiences
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
                Book hotels, trips, and cars all in one place
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-3"
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Everything You Need for Your Journey
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover and book the perfect accommodations, experiences, and transportation
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Hotels & Stays</CardTitle>
                  <CardDescription>
                    Find the perfect accommodation for your trip, from luxury hotels to cozy apartments
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Plane className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Travel Experiences</CardTitle>
                  <CardDescription>
                    Discover unique trips and experiences curated by local experts
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Car Rentals</CardTitle>
                  <CardDescription>
                    Rent a car for your adventures, from economy to luxury vehicles
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Discover Your Next Adventure
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search destinations, hotels, trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="hotel">Hotels</TabsTrigger>
              <TabsTrigger value="trip">Trips</TabsTrigger>
              <TabsTrigger value="car">Cars</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div 
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  className="h-full"
                >
                  <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                    {listing.image_url ? (
                      <img 
                        src={listing.image_url} 
                        alt={listing.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="text-muted-foreground text-4xl">
                        {getTypeIcon(listing.type)}
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className={getTypeColor(listing.type)}>
                        <span className="flex items-center space-x-1">
                          {getTypeIcon(listing.type)}
                          <span className="capitalize">{listing.type}</span>
                        </span>
                      </Badge>
                      <span className="text-lg font-bold text-primary">
                        ${listing.price}
                        {listing.type === 'hotel' && '/night'}
                        {listing.type === 'car' && '/day'}
                      </span>
                    </div>
                    
                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                    
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>
                      {listing.max_guests && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{listing.max_guests} guests</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                    
                    {listing.amenities && listing.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {listing.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {listing.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{listing.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No listings found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;