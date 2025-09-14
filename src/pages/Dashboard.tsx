import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, Car, Plane, Users, Calendar, DollarSign } from 'lucide-react';

interface DashboardStats {
  totalListings: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

interface Listing {
  id: string;
  type: string;
  title: string;
  location: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  listings: {
    title: string;
    type: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole === 'admin';
  const isSubAdmin = userRole === 'subadmin';

  useEffect(() => {
    if (user && (isAdmin || isSubAdmin)) {
      fetchDashboardData();
    }
  }, [user, userRole]);

  const fetchDashboardData = async () => {
    try {
      // Fetch listings
      let listingsQuery = supabase.from('listings').select('*');
      if (isSubAdmin) {
        listingsQuery = listingsQuery.eq('owner_id', user?.id);
      }
      const { data: listingsData } = await listingsQuery;

      // Fetch bookings with related data
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          *,
          listings!inner (title, type),
          profiles!bookings_user_id_fkey (full_name, email)
        `);
      
      if (isSubAdmin) {
        // For subadmins, only show bookings for their listings
        const listingIds = listingsData?.map(l => l.id) || [];
        bookingsQuery = bookingsQuery.in('listing_id', listingIds);
      }
      
      const { data: bookingsData } = await bookingsQuery;

      setListings(listingsData || []);
      setBookings((bookingsData as any) || []);

      // Calculate stats
      const totalListings = listingsData?.length || 0;
      const totalBookings = bookingsData?.length || 0;
      const pendingBookings = bookingsData?.filter(b => b.status === 'pending').length || 0;
      const totalRevenue = bookingsData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

      setStats({
        totalListings,
        totalBookings,
        pendingBookings,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking:', error);
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

  if (!user || (!isAdmin && !isSubAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Manage your listings and bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalListings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Booking Requests</h2>
            </div>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No booking requests</h3>
                  <p className="text-muted-foreground">
                    Booking requests will appear here when customers make reservations.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{booking.listings.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.profiles.full_name} ({booking.profiles.email})
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Check-in</p>
                          <p className="font-medium">{new Date(booking.check_in).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Check-out</p>
                          <p className="font-medium">{new Date(booking.check_out).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Guests</p>
                          <p className="font-medium">{booking.guests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-bold text-primary">${booking.total_price}</p>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleBookingAction(booking.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleBookingAction(booking.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Listings</h2>
              <Button onClick={() => navigate('/create-listing')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </Button>
            </div>

            {listings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first listing to start receiving bookings.
                  </p>
                  <Button onClick={() => navigate('/create-listing')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card key={listing.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          {getTypeIcon(listing.type)}
                          <span className="capitalize">{listing.type}</span>
                        </Badge>
                        <Badge variant={listing.is_active ? "default" : "secondary"}>
                          {listing.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <CardDescription>{listing.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          ${listing.price}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/listing/${listing.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;