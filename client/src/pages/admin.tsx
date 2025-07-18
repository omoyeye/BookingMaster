import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail, Phone, MapPin, AlertTriangle, Check, X } from 'lucide-react';
import { format, parseISO, isSameDay, differenceInMinutes } from 'date-fns';
import type { Booking } from '@shared/schema';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Utility function to parse time to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Fetch all bookings
  const { data: bookings = [], isLoading, error } = useQuery<Booking[]>({
    queryKey: ['/api/admin/bookings'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Detect calendar conflicts
  const conflicts = useMemo(() => {
    const conflictList: { booking1: Booking; booking2: Booking; overlapMinutes: number }[] = [];
    
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const booking1 = bookings[i];
        const booking2 = bookings[j];
        
        // Only check bookings on the same date
        if (booking1.bookingDate === booking2.bookingDate) {
          const time1 = parseTimeToMinutes(booking1.bookingTime);
          const time2 = parseTimeToMinutes(booking2.bookingTime);
          const duration1 = booking1.duration * 60; // Convert hours to minutes
          const duration2 = booking2.duration * 60;
          
          // Check for overlap
          const end1 = time1 + duration1;
          const end2 = time2 + duration2;
          
          const overlapStart = Math.max(time1, time2);
          const overlapEnd = Math.min(end1, end2);
          
          if (overlapStart < overlapEnd) {
            conflictList.push({
              booking1,
              booking2,
              overlapMinutes: overlapEnd - overlapStart
            });
          }
        }
      }
    }
    
    return conflictList;
  }, [bookings]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = searchTerm === '' || 
        booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm);
      
      const matchesDate = filterDate === '' || booking.bookingDate === filterDate;
      
      const matchesService = filterService === '' || filterService === 'all' || booking.serviceType === filterService;
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'conflicts' && conflicts.some(c => c.booking1.id === booking.id || c.booking2.id === booking.id));
      
      return matchesSearch && matchesDate && matchesService && matchesStatus;
    });
  }, [bookings, searchTerm, filterDate, filterService, filterStatus, conflicts]);

  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getServiceBadgeColor = (serviceType: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      deep: 'bg-purple-100 text-purple-800',
      tenancy: 'bg-green-100 text-green-800',
      airbnb: 'bg-orange-100 text-orange-800',
      commercial: 'bg-gray-100 text-gray-800',
      jet: 'bg-cyan-100 text-cyan-800'
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-800';
  };

  const getServiceName = (serviceType: string) => {
    const names = {
      general: 'General Cleaning',
      deep: 'Deep Cleaning',
      tenancy: 'End of Tenancy',
      airbnb: 'AirBnB Cleaning',
      commercial: 'Commercial',
      jet: 'Jet Washing'
    };
    return names[serviceType] || serviceType;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading bookings...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error loading bookings</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="text-sm text-gray-600">
            Last updated: {format(new Date(), 'PPp')}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(b => b.bookingDate === format(new Date(), 'yyyy-MM-dd')).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conflicts</p>
                  <p className="text-2xl font-bold text-red-600">{conflicts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">
                    £{bookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0).toFixed(2)}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Conflicts Alert */}
        {conflicts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Calendar Conflicts Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-red-800">
                          Booking #{conflict.booking1.id} conflicts with Booking #{conflict.booking2.id}
                        </p>
                        <p className="text-sm text-red-600">
                          Date: {format(parseISO(conflict.booking1.bookingDate), 'PPP')} | 
                          Overlap: {conflict.overlapMinutes} minutes
                        </p>
                        <div className="mt-2 space-y-1">
                          <div className="text-sm">
                            <strong>Booking #{conflict.booking1.id}:</strong> {conflict.booking1.fullName} - 
                            {formatTime(conflict.booking1.bookingTime)} ({conflict.booking1.duration}h)
                          </div>
                          <div className="text-sm">
                            <strong>Booking #{conflict.booking2.id}:</strong> {conflict.booking2.fullName} - 
                            {formatTime(conflict.booking2.bookingTime)} ({conflict.booking2.duration}h)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="service">Service Type</Label>
                <Select value={filterService} onValueChange={setFilterService}>
                  <SelectTrigger>
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="general">General Cleaning</SelectItem>
                    <SelectItem value="deep">Deep Cleaning</SelectItem>
                    <SelectItem value="tenancy">End of Tenancy</SelectItem>
                    <SelectItem value="airbnb">AirBnB Cleaning</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="jet">Jet Washing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All bookings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="conflicts">Conflicts Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const isConflicted = conflicts.some(c => 
                  c.booking1.id === booking.id || c.booking2.id === booking.id
                );
                
                return (
                  <div
                    key={booking.id}
                    className={`p-4 rounded-lg border ${
                      isConflicted ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">#{booking.id}</h3>
                          <Badge className={getServiceBadgeColor(booking.serviceType)}>
                            {getServiceName(booking.serviceType)}
                          </Badge>
                          {isConflicted && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Conflict
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{booking.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{booking.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{booking.phone}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {format(parseISO(booking.bookingDate), 'PPP')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {formatTime(booking.bookingTime)} ({booking.duration}h)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {booking.city}, {booking.postcode}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Total: £{booking.totalPrice}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Base: £{booking.basePrice} | Extras: £{booking.extrasTotal}
                            </div>
                            {booking.tipAmount !== '0' && (
                              <div className="text-sm text-gray-600">
                                Tip: £{booking.tipAmount}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {booking.specialInstructions && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <strong>Special Instructions:</strong> {booking.specialInstructions}
                          </div>
                        )}
                        
                        {booking.quoteRequest && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                            <strong>Quote Request:</strong> {booking.quoteRequest}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bookings found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;