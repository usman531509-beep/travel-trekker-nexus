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
      <div className="min-h-screen bg-gradient-subtle">
        {/* Hero Section */}
        <div className="bg-gradient-hero text-white relative overflow-hidden">
          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-40 left-1/3 w-16 h-16 bg-white/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="text-center animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Your Gateway to Amazing 
                <span className="block text-yellow-200">Experiences</span>
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
                Discover and book the perfect hotels, unforgettable trips, and premium car rentals 
                all in one beautiful platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 py-4 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 bg-white text-primary hover:bg-white/90"
                >
                  Start Your Journey
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                >
                  Explore Listings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-gradient-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Everything You Need for Your Journey
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover and book the perfect accommodations, experiences, and transportation
                with our premium platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 bg-gradient-card border-0 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow shadow-elegant">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-4">Luxury Hotels & Stays</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    From boutique hotels to luxury resorts, find the perfect accommodation 
                    that matches your style and budget
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 bg-gradient-card border-0 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow shadow-elegant">
                    <Plane className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-4">Curated Experiences</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Discover unique trips and experiences curated by local experts and 
                    adventure specialists around the world
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 bg-gradient-card border-0 animate-fade-in" style={{animationDelay: '0.3s'}}>
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow shadow-elegant">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-4">Premium Car Rentals</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Rent premium vehicles for your adventures, from efficient city cars 
                    to luxury sports cars and off-road vehicles
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-primary text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Adventure?
            </h3>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of travelers who trust us with their journeys
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-4 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              Create Your Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-12 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Discover Your Next Adventure
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find and book amazing experiences from our curated collection
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                placeholder="Search destinations, hotels, trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pl-12 text-lg shadow-card border-0 bg-card/50 backdrop-blur-sm"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
              <TabsList className="grid w-full grid-cols-4 max-w-md shadow-card bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="all" className="text-sm font-medium">All</TabsTrigger>
                <TabsTrigger value="hotel" className="text-sm font-medium">Hotels</TabsTrigger>
                <TabsTrigger value="trip" className="text-sm font-medium">Trips</TabsTrigger>
                <TabsTrigger value="car" className="text-sm font-medium">Cars</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing, index) => (
              <Card 
                key={listing.id} 
                className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-gradient-card border-0 overflow-hidden animate-fade-in" 
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <div className="relative">
                  <div className="h-56 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                    {listing.image_url ? (
                      <img 
                        src={listing.image_url} 
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-primary/40 text-6xl group-hover:scale-110 transition-transform duration-500">
                        {getTypeIcon(listing.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-primary text-white shadow-elegant border-0">
                      <span className="flex items-center space-x-1">
                        {getTypeIcon(listing.type)}
                        <span className="capitalize font-medium">{listing.type}</span>
                      </span>
                    </Badge>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-elegant">
                      <span className="text-lg font-bold text-primary">
                        ${listing.price}
                        <span className="text-sm text-muted-foreground">
                          {listing.type === 'hotel' && '/night'}
                          {listing.type === 'car' && '/day'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors duration-300">
                    {listing.title}
                  </CardTitle>
                  
                  <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-3">
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
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>
                  
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                        <Badge key={amenityIndex} variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                          {amenity}
                        </Badge>
                      ))}
                      {listing.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-primary/10 text-primary">
                          +{listing.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl text-white">🔍</div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No listings found</h3>
            <p className="text-lg text-muted-foreground">Try adjusting your search criteria or browse all listings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;