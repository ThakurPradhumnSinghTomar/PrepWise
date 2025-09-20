import { getApps } from "firebase-admin/app"
import { initializeApp } from "firebase-admin/app";
import { cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { init } from "next/dist/compiled/webpack/webpack";
import { get } from "http";

const initFirebaseAdmin = () => {
    const apps = getApps();

    if(!apps.length) {
        // Initialize the Firebase admin SDK here
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            })
        })
    }

    return {
        auth : getAuth(),
        db : getFirestore()
    }
}

export const { auth, db } = initFirebaseAdmin();