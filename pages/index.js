import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import LoginPage from "./login.js"
import SignupPage from "./signup.js"
import Dashboard from "./dashboard"
import Homepage from "./homepage"
import Homemain from "./Main.jsx"
import UploadButton from "./components/UploadButton.jsx";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {

  return (
    
<Homemain/>
  );
}
