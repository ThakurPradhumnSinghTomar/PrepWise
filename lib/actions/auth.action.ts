'use server';

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { success } from "zod";
import { id } from "zod/v4/locales";

const ONE_WEEK = 60*60*24*7;

export async function signUp(params : SignUpParams){
    const {uid, name, email } = params;
    try{

        const userRecord = await db.collection('users').doc(uid).get();
        if(userRecord.exists){
            return {
                success : false,
                message : 'User already exist, Signin instead'
            }
        }

        await db.collection('users').doc(uid).set({
            name, email
        });

        return {
            success : true,
            message : 'User created successfully'
        }


    }
    catch(e : any){
        console.error('Error creating a user',e);

        if(e.code === 'auth/email-already-exists'){
            return {
                success : false,
                message : 'This email is already in use'
            }
        }

        return {
            success : false,
            message : 'Failed to create an account'
        }

    }
}

export async function signIn(params : SignInParams){
    const {email, idToken} = params;

    try{
        const userRecord = await auth.getUserByEmail(email);
        if(!userRecord){
            return {
                success : false,
                message : 'User does not exist, Signup instead'
            }
        }
        await setSessionCookie(idToken);
        return {
            success : true,
            message : 'Signed in successfully'
        }

    }
    catch(e : any){
        console.error('Error signing in',e);
        return {
            success : false,
            message : 'Failed to sign in'
        }
    }
}

export async function setSessionCookie(idToken : string){
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn : ONE_WEEK*1000,
    })

    cookieStore.set('session',sessionCookie, {
        maxAge : ONE_WEEK,
        httpOnly : true,
        secure : process.env.NODE_ENV==='production',
        path : '/',
        sameSite : 'lax'

    })


}

export async function getCurrentUser(){
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if(!session){
        return null;
    }
    try{
        const decodedClaims = await auth.verifySessionCookie(session, true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
        if(!userRecord.exists){
            return null;
        }
        return {
             ...userRecord.data(),
             id : userRecord.id
    } as User;
        }
    catch(e : any){
        console.error('Error getting current user',e);
        return null;
    }
}

export async function isAuthenticated(){
    const user = await getCurrentUser();
    return !!user;
}