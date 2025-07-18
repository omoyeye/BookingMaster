import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: credentials,
      });
      return response;
    },
    onSuccess: (data) => {
      // Store admin session
      localStorage.setItem('adminSession', JSON.stringify({
        id: data.admin.id,
        username: data.admin.username,
        email: data.admin.email,
        role: data.admin.role,
        loginTime: new Date().toISOString(),
      }));
      
      // Navigate to admin dashboard
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      loginMutation.mutate({ username, password });
    }
  };

  const handleCreateAdmin = () => {
    navigate('/admin/create');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
            <LockIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
          <CardDescription className="text-gray-600">
            Access the URINAKCLEANING admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {loginMutation.isError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {loginMutation.error?.message || 'Login failed. Please check your credentials.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                Don't have an admin account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateAdmin}
                className="text-blue-600 hover:bg-blue-50"
              >
                Create Admin Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;