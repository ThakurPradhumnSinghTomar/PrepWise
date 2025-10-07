'use client'

import React from 'react'
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { signIn, signUp } from '@/lib/actions/auth.action';
import { FormType } from '@/types';

const authFormSchema = (type : FormType) => z.object({
  name : type === "sign-up" ? z.string().min(2).max(100) : z.string().optional(),
  email: z.string().min(2).max(100).email(),
  password: z.string().min(6).max(100),
})

const AuthForm = ({type } : {type : FormType}) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
   
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if(type === "sign-in"){
        const {email, password } = values;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const idToken = await userCredential.user.getIdToken();
        if(!idToken){
          toast.error("Failed to retrieve user token");
          return ;
        }

        const result = await signIn({
          email,
          idToken
        })

        if(!result?.success){
          toast.error(result?.message);
          return ;
        }
        toast.success("Signed in successfully!");
        console.log("Redirecting to home...");
        router.push("/");
        
      }
      else {
        const {name, email, password } = values;
        const userCredentials  = await createUserWithEmailAndPassword(auth,email,password);
        const result = await signUp({
          uid : userCredentials.user.uid,
          name : name!,
          email,
          password
        })

        if(!result?.success){
          toast.error(result?.message);
          return ;
        }
        toast.success("Account created successfully! Please Sign In");
        router.push("/sign-in");
      }

    } catch (error: any) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("This email is already registered. Please sign in instead.");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email address.");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password.");
          break;
        case "auth/user-not-found":
          toast.error("No account found with this email.");
          break;
        default:
          toast.error("Something went wrong. Please try again.");
      }
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <div className='w-full max-w-6xl px-4'>
        <div className='bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden'>
          <div className='p-8 py-6 flex flex-col gap-6'>
            {/* Logo and Brand */}
            <div className='flex flex-col items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg'>
                  <Image src="/logo.svg" alt="logo" height={28} width={28} />
                </div>
                <h2 className='text-3xl font-bold text-white'>PrepWise</h2>
              </div>
              <p className='text-slate-400 text-center'>Practice job interviews with AI</p>
            </div>

            {/* Divider */}
            <div className='w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent'></div>

            {/* Form Title */}
            <div className='text-center'>
              <h3 className='text-2xl font-bold text-white mb-2'>
                {isSignIn ? "Welcome Back" : "Create Account"}
              </h3>
              <p className='text-slate-400 text-sm'>
                {isSignIn ? "Sign in to continue your interview prep" : "Start your journey to interview success"}
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl mx-auto">
                <div className="flex flex-col gap-4">
                  {!isSignIn && 
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-slate-300 font-medium'>Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your name" 
                              {...field}
                              className='bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11'
                            />
                          </FormControl>
                          <FormMessage className='text-red-400' />
                        </FormItem>
                      )}
                    />
                  }
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-slate-300 font-medium'>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            {...field}
                            className='bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11'
                          />
                        </FormControl>
                        <FormMessage className='text-red-400' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-slate-300 font-medium'>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field}
                            className='bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11'
                          />
                        </FormControl>
                        <FormMessage className='text-red-400' />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className='w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6 rounded-lg shadow-lg transition-all duration-200 mt-6 cursor-pointer' 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <span className='flex items-center gap-2'>
                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                        {isSignIn ? "Signing In..." : "Creating Account..."}
                      </span>
                    ) : (
                      isSignIn ? "Sign In" : "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Footer Link */}
            <div className='text-center'>
              <p className='text-slate-400 text-sm'>
                {isSignIn ? "Don't have an account?" : "Already have an account?"}
                <Link 
                  href={isSignIn ? "/sign-up" : "/sign-in"} 
                  className='font-bold text-blue-400 ml-1 hover:text-blue-300 transition-all'
                >
                  {isSignIn ? "Sign Up" : "Sign In"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthForm;