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





const authFormSchema = (type : FormType) => z.object({
  name : type === "sign-up" ? z.string().min(2).max(100) : z.string().optional(),
  email: z.string().min(2).max(100).email(),
  password: z.string().min(6).max(100),
})
const AuthForm = ({type } : {type : FormType}) => {

   const router = useRouter();


  const formSchema = authFormSchema(type);
   
        // 1. Define your form.
        const form = useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            name: "",
            email: "",
            password: "",
          },
        })
      
        // 2. Define a submit handler.
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

              const result = await signIn(
                {
                  email,
                  idToken
                }
              )

              if(!result?.success){
                toast.error(result?.message);
                return ;
              }
              toast.success("Signed in successfully!");
              router.push("/");
            }
            else {
              const {name, email, password } = values;
              const userCredentials  = await createUserWithEmailAndPassword(auth,email,password);
              const result = await signUp(
                {
                  uid : userCredentials.user.uid,
                  name : name!,
                  email,
                  password
                }
              )

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
    <div className='card-border lg:min-w-[566px]'>
      <div className='flex flex-col gap-6 card py-14 px-10'>
        <div className='flex flex-row gap-2 justify-center'>
          <Image src="/logo.svg" alt = "logo" height={32} width={38} />

          <h2 className='test-primary-100'>PrepWise</h2>

        </div>

        <h3>Practice job interviews with AI</h3>

      
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full mt-4 form">

              {!isSignIn && 
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              }
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className='btn'>{isSignIn ? "Sign In" : "Create an account"}</Button>
            </form>
          </Form>

          <p>{isSignIn ? "Don't have an account?" : "Already have an account?"}
            <Link href={isSignIn ? "/sign-up" : "/sign-in"} className='font-bold text-user-primary ml-1'>{isSignIn ? "Sign Up" : "Sign In"}</Link>
          </p>

    </div>
    </div>
  )
}

export default AuthForm;