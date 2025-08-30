import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '../api/supabase';
import { useNavigate } from 'react-router-dom';
import { generateOTP,login,googleLogin } from '../api/api';

interface FormData {
  email: string;
  otp: string;
}

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "jonas.kahnwald@gmail.com",
    otp: "",
  });
  const [errors, setErrors] = useState<Record<keyof FormData, string>>({
    email: "",
    otp: "",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isOtpSent,SetIsOtpSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    const validation = formSchema.shape[id as keyof FormSchemaType].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [id]: validation.success ? "" : validation.error.issues[0].message,
    }));
  };

  const handleResendOTP = async () => {
      console.log("Requesting OTP for email:", formData.email);
      if (!formData.email) {
        setErrors((prev) => ({ ...prev, email: "Please enter your email first" }));
        return;
      }
      const emailValidation = formSchema.shape.email.safeParse(formData.email);
      if (!emailValidation.success) {
        setErrors((prev) => ({ ...prev, email: emailValidation.error.issues[0].message }));
        return;
      }
  
      const response = await generateOTP(formData.email);
  
      SetIsOtpSent(true);
      console.log(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = formSchema.safeParse(formData);
    if (validation.success) {
      try {
        const response = await login(formData.email, formData.otp);
        console.log(response.data);
        if (response.data && response.data.data && response.data.data.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
          alert("Login Successful");
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          alert("Login failed: Invalid response from server.");
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error instanceof Error) {
          alert(`Login failed: ${error.message}`);
        } else {
          alert("Login failed: An unknown error occurred.");
        }
      }
    } else {
      const newErrors: Record<keyof FormData, string> = {
        email: "",
        otp: "",
      };
      validation.error.issues.forEach((error) => {
        newErrors[error.path[0] as keyof FormData] = error.message;
      });
      setErrors(newErrors);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (data && data.url) {
        window.location.href = data.url;
      } else if (error) {
        alert('Failed to initiate Google OAuth login.');
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (accessToken) {
          await googleLogin(accessToken);
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isMobile ? 'bg-white' : ''}`}>
      <div className={`relative z-10 ${isMobile ? 'w-full p-4' : 'w-full max-w-4xl flex'}`}>
        <div className={`${isMobile ? 'bg-white p-4 rounded-lg shadow-lg w-full' : 'w-1/2 bg-white p-8 rounded-l-lg shadow-lg'}`}>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600 flex items-center justify-center">
              <span className="mr-2">HD</span>
              <span className="text-xl">🌐</span>
            </h1>
            <p className="text-gray-500">Sign in to continue to your account.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? "border-red-500" : ""}`}
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                OTP
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.otp ? "border-red-500" : ""}`}
                id="otp"
                type="text"
                value={formData.otp}
                onChange={handleChange}
              />
              {errors.otp && <p className="text-red-500 text-xs italic">{errors.otp}</p>}
              {isOtpSent && <p className="text-green-500 text-xs italic">OTP sent!</p>}
            </div>
            <div>
              <button
                type="button"
                className="text-blue-500 text-sm hover:underline"
                onClick={handleResendOTP}
              >
                Resend OTP
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="keepLoggedIn"
                className="mr-2 leading-tight"
              />
              <label className="text-gray-700 text-sm" htmlFor="keepLoggedIn">
                Keep me logged in
              </label>
            </div>
            <div>
              <button
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Sign in
              </button>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs">Or sign in with</p>
              <button
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                onClick={handleGoogleLogin}
              >
                Sign in with Google
              </button>
            </div>
            <p className="text-center text-gray-500 text-xs">
              Need an account? <a href="/signup" className="text-blue-500">Create one</a>
            </p>
          </form>
        </div>
        {!isMobile && (
          <div
            className="w-1/2 h-screen bg-cover bg-center rounded-r-lg"
            style={{ backgroundImage: "url('./background.png')" }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;