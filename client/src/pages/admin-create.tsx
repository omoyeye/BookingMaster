import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon, MailIcon, CheckCircleIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const AdminCreate = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, navigate] = useLocation();

  const createMutation = useMutation({
    mutationFn: async (adminData: { username: string; password: string; email: string }) => {
      const response = await apiRequest('/api/admin/create', {
        method: 'POST',
        body: adminData,
      });
      return response;
    },
    onSuccess: (data) => {
      // Navigate to login page with success message
      navigate('/admin/login');
    },
    onError: (error) => {
      console.error('Admin creation failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    if (username && password && email) {
      createMutation.mutate({ username, password, email });
    }
  };

  const handleBackToLogin = () => {
    navigate('/admin/login');
  };

  const passwordsMatch = password === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Create Admin Account</CardTitle>
          <CardDescription className="text-gray-600">
            Set up your URINAKCLEANING admin account
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
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Create a strong password"
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 ${
                    confirmPassword && !passwordsMatch 
                      ? 'border-red-300 focus:border-red-500' 
                      : confirmPassword && passwordsMatch 
                      ? 'border-green-300 focus:border-green-500' 
                      : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
                {confirmPassword && passwordsMatch && (
                  <CheckCircleIcon className="absolute right-10 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {createMutation.isError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {createMutation.error?.message || 'Failed to create admin account. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {createMutation.isSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  Admin account created successfully! You can now log in.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={createMutation.isPending || !passwordsMatch}
            >
              {createMutation.isPending ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
            
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                Already have an admin account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToLogin}
                className="text-blue-600 hover:bg-blue-50"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreate;