'use client';
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { z } from 'zod'
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { getCurrentUser } from '@/lib/actions/auth.action';
import { FormType } from '@/types';


const authFormSchema = (type : FormType) => z.object({
    role : z.string().min(2).max(100),
    type : z.string().min(2).max(100),
    level : z.string().min(2).max(100),
    techStack : z.string().min(2).max(100),
    amount : z.number().min(1).max(20),
    userid : z.string().min(2).max(100),
    company : z.string().min(2).max(100),
  });

const page = ({type } : {type : FormType}) => {
  useEffect(()=>{
    //get current user and set userid field
    async function fetchUser(){
      const user = await getCurrentUser();
      if(user){
        form.setValue('userid', user.id);
      }
      else {
        toast.error('User not logged in');
      }
    }
    fetchUser();

  },[]);
  

  const formSchema = authFormSchema(type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      type: "",
      level: "",
      techStack: "",
      amount: 0,
      userid: "",
      company: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    try {
      console.log('Submitting form with values:', values);
      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (data.success) {
        toast.message('Interview questions generated successfully!');
        //redirect to home page
        window.location.href = '/';
      }
      else {
        toast.message('Failed to generate interview questions.');
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden'>
          <div className='p-8'>
            {/* Header */}
            <div className='mb-8'>
              <h2 className='text-3xl font-bold text-white mb-2'>Interview Generation Page</h2>
              <p className='text-slate-400'>Configure your AI-powered interview session</p>
            </div>

            {/* Divider */}
            <div className='w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8'></div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-slate-300 font-medium'>Role</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="Enter your role" 
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-slate-300 font-medium'>Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className='w-full bg-slate-900/50 border-slate-700/50 text-white h-11 focus:border-blue-500 focus:ring-blue-500/20'>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className='bg-slate-900 border-slate-700'>
                            <SelectItem value="technical" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Technical</SelectItem>
                            <SelectItem value="behavioural" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Behavioural</SelectItem>
                            <SelectItem value="mixed" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className='text-red-400' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-slate-300 font-medium'>Level</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className='w-full bg-slate-900/50 border-slate-700/50 text-white h-11 focus:border-blue-500 focus:ring-blue-500/20'>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent className='bg-slate-900 border-slate-700'>
                            <SelectItem value="junior" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Junior</SelectItem>
                            <SelectItem value="mid" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Mid</SelectItem>
                            <SelectItem value="senior" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className='text-red-400' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="techStack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-slate-300 font-medium'>Tech Stack</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="Enter the tech stack" 
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
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-slate-300 font-medium'>Company</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className='w-full bg-slate-900/50 border-slate-700/50 text-white h-11 focus:border-blue-500 focus:ring-blue-500/20'>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent className='bg-slate-900 border-slate-700'>
                            <SelectItem value="telegram" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Telegram</SelectItem>
                            <SelectItem value="yahoo" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Yahoo</SelectItem>
                            <SelectItem value="amazon" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Amazon</SelectItem>
                            <SelectItem value="spotify" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Spotify</SelectItem>
                            <SelectItem value="skype" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Skype</SelectItem>
                            <SelectItem value="facebook" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Facebook</SelectItem>
                            <SelectItem value="quora" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Quora</SelectItem>
                            <SelectItem value="pinterest" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Pinterest</SelectItem>
                            <SelectItem value="hostinger" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Hostinger</SelectItem>
                            <SelectItem value="adobe" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Adobe</SelectItem>
                            <SelectItem value="reddit" className='text-white hover:bg-slate-800 focus:bg-slate-800'>reddit</SelectItem>
                            <SelectItem value="tiktok" className='text-white hover:bg-slate-800 focus:bg-slate-800'>TikTok</SelectItem>
                            <SelectItem value="other" className='text-white hover:bg-slate-800 focus:bg-slate-800'>Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className='text-red-400' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-slate-300 font-medium'>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter the amount"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          className='bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11'
                        />
                      </FormControl>
                      <FormMessage className='text-red-400' />
                    </FormItem>
                  )}
                />



                <Button 
                  type="submit" 
                  className='w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6 rounded-lg shadow-lg transition-all duration-200 mt-8' 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <span className='flex items-center gap-2'>
                      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                      Generating...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page