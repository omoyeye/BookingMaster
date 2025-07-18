import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, Mail, Phone, MapPin, AlertTriangle, Check, X, Bell, Send, Plus, LogOut } from 'lucide-react';
import { format, parseISO, isSameDay, differenceInMinutes } from 'date-fns';

import type { Booking, CustomerReminder } from '@shared/schema';
import { useLocation } from 'wouter';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication
  const adminSession = localStorage.getItem('adminSession');
  if (!adminSession) {
    navigate('/admin/login');
    return null;
  }

  const admin = JSON.parse(adminSession);

  // Utility function to parse time to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Fetch reminders
  const { data: reminders = [] } = useQuery<CustomerReminder[]>({
    queryKey: ['/api/admin/reminders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reminders', {
        method: 'GET',
        headers: { 
          'X-Admin-Id': admin.id.toString(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return await res.json();
    },
    refetchInterval: 30000,
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: { bookingId: number; message: string }) => {
      const res = await fetch('/api/admin/reminders', {
        method: 'POST',
        headers: { 
          'X-Admin-Id': admin.id.toString(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData),
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Created",
        description: "Customer reminder has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reminders'] });
      setSelectedBooking(null);
      setReminderMessage('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-create reminders mutation
  const autoCreateRemindersMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/reminders/auto-create', {
        method: 'POST',
        headers: { 
          'X-Admin-Id': admin.id.toString(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Auto-Reminders Created",
        description: `Created ${data.createdCount} automatic reminders for future bookings.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reminders'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create automatic reminders.",
        variant: "destructive",
      });
    },
  });

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin/login');
  };

  // Handle reminder creation
  const handleCreateReminder = () => {
    if (selectedBooking && reminderMessage.trim()) {
      createReminderMutation.mutate({
        bookingId: selectedBooking.id,
        message: reminderMessage.trim(),
      });
    }
  };

  // Fetch all bookings
  const { data: bookings = [], isLoading, error } = useQuery<Booking[]>({
    queryKey: ['/api/admin/bookings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/bookings', {
        method: 'GET',
        headers: { 
          'X-Admin-Id': admin.id.toString(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return await res.json();
    },
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {admin.username}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => autoCreateRemindersMutation.mutate()}
              disabled={autoCreateRemindersMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {autoCreateRemindersMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              {autoCreateRemindersMutation.isPending ? 'Creating...' : 'Auto-Create Reminders'}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
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
                    {bookings.filter(b => {
                      try {
                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
                        // Handle both date formats: YYYY-MM-DD and full ISO string
                        const bookingDateStr = b.bookingDate.split('T')[0]; // Extract date part only
                        return bookingDateStr === todayStr;
                      } catch (error) {
                        console.error('Date comparison error:', error);
                        return false;
                      }
                    }).length}
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
                    £{bookings.reduce((sum, b) => {
                      const price = parseFloat(b.totalPrice || '0');
                      return sum + (isNaN(price) ? 0 : price);
                    }, 0).toFixed(2)}
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

        {/* Customer Reminders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              Customer Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Active Reminders: {reminders.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Sent Today: {reminders.filter(r => {
                      if (r.status !== 'sent' || !r.sentAt) return false;
                      const sentDate = new Date(r.sentAt);
                      const today = new Date();
                      return sentDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Manual Reminder
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Customer Reminder</DialogTitle>
                      <DialogDescription>
                        Send a custom reminder to a customer about their upcoming booking.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Select Booking</Label>
                        <Select onValueChange={(value) => {
                          const booking = bookings.find(b => b.id === parseInt(value));
                          setSelectedBooking(booking || null);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a booking" />
                          </SelectTrigger>
                          <SelectContent>
                            {bookings.filter(b => {
                              const bookingDate = new Date(b.bookingDate);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return bookingDate >= today;
                            }).map(booking => (
                              <SelectItem key={booking.id} value={booking.id.toString()}>
                                #{booking.id} - {booking.fullName} - {format(parseISO(booking.bookingDate), 'PPP')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Custom Message</Label>
                        <Textarea
                          placeholder="Enter a custom message for the reminder..."
                          value={reminderMessage}
                          onChange={(e) => setReminderMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={handleCreateReminder}
                          disabled={!selectedBooking || !reminderMessage.trim() || createReminderMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {createReminderMutation.isPending ? 'Creating...' : 'Create Reminder'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {reminders.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {reminders.slice(0, 5).map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Booking #{reminder.bookingId} - {reminder.message?.substring(0, 50)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            {reminder.status === 'pending' ? 'Scheduled' : 'Sent'} - {format(new Date(reminder.createdAt), 'PPp')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {reminder.status === 'pending' && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {reminder.status === 'sent' && (
                            <Badge className="bg-green-100 text-green-800">Sent</Badge>
                          )}
                          {reminder.status === 'failed' && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                        
                        <div className="mt-3 pt-3 border-t">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setReminderMessage(`Hi ${booking.fullName}, we wanted to remind you that your ${getServiceName(booking.serviceType)} service is scheduled for ${format(parseISO(booking.bookingDate), 'PPP')} at ${formatTime(booking.bookingTime)}. Please ensure someone is available to provide access to the property.`);
                                }}
                                className="w-full"
                              >
                                <Bell className="w-4 h-4 mr-2" />
                                Create Reminder
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Create Reminder for #{booking.id}</DialogTitle>
                                <DialogDescription>
                                  Send a reminder to {booking.fullName} about their upcoming booking.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Message</Label>
                                  <Textarea
                                    value={reminderMessage}
                                    onChange={(e) => setReminderMessage(e.target.value)}
                                    rows={4}
                                    placeholder="Enter reminder message..."
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    onClick={handleCreateReminder}
                                    disabled={!reminderMessage.trim() || createReminderMutation.isPending}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    {createReminderMutation.isPending ? 'Creating...' : 'Create Reminder'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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