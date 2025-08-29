import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '../api/supabase';
import { generateOTP,register } from '../api/api';
import { useNavigate } from 'react-router-dom';

interface FormData {
  name: string;
  dob: string; 
  email: string;
  otp: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  email: z.string().email({ message: "Invalid email address" }),
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "Jonas Khanwald",
    dob: "1997-12-11",
    email: "jonas.kahnwald@gmail.com",
    otp: "",
  });
  const [errors, setErrors] = useState<Record<keyof FormData, string>>({
    name: "",
    dob: "",
    email: "",
    otp: "",
  });
  const [isOtpSent,SetIsOtpSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  const handleGetOTP = async () => {
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
      try{
        const response = await register(formData.email,formData.name,new Date(formData.dob),formData.otp);

        console.log(response.data);

        setTimeout(()=>{
          navigate('/login');
        },1500);
        
      }catch(error){

      }
    } else {
      const newErrors: Record<keyof FormData, string> = { name: "", dob: "", email: "", otp: "" };
      validation.error.issues.forEach((error) => {
        newErrors[error.path[0] as keyof FormData] = error.message;
      });
      setErrors(newErrors);
    }
  };

  const handleGoogleSignUp = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      alert(`Error: ${error.message}`);
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
            <p className="text-gray-500">Sign up to enjoy the feature of HD</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Your Name
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? "border-red-500" : ""}`}
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dob">
                Date of Birth
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.dob ? "border-red-500" : ""}`}
                id="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
              {errors.dob && <p className="text-red-500 text-xs italic">{errors.dob}</p>}
            </div>
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
              <div className="flex items-center">
                <input
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.otp ? "border-red-500" : ""}`}
                  id="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                />
                <button
                  className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={handleGetOTP}
                >
                  Get OTP
                </button>
              </div>
              {isOtpSent && <p className="text-green-500 text-xs italic">OTP sent to your email!</p>}
              {errors.otp && <p className="text-red-500 text-xs italic">{errors.otp}</p>}
            </div>
            <div>
              <button
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Sign up
              </button>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs">Or sign up with</p>
              <button
                type="button"
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                onClick={handleGoogleSignUp}
              >
                Sign up with Google
              </button>
            </div>
            <p className="text-center text-gray-500 text-xs">
              Already have an account? <a href="/login" className="text-blue-500">Sign in</a>
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

export default SignUpForm;


/*

1. User submit the email 
2. Send OTP to the email
3. User enter the OTP
4. Verify the OTP
5. If OTP is correct, create a new user in Supabase Auth
6. On successful sign-up, save user details to MongoDB via backend API
7. Handle errors and display appropriate messages to the user






*/