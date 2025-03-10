"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Pencil, Share2, Rocket, Menu } from "lucide-react";
import {
    NavigationMenu,

    NavigationMenuItem,

    NavigationMenuList,

} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // ✅ Import styles
import axios from 'axios';


const Dashboard = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [joinRoomToggle, setJoinRoomToggle] = useState(false);
    const [joinroomName, setjoinRoomName] = useState("");



    async function createRoom() {
        const token = localStorage.getItem("token"); // Get token from localStorage

        if (!roomName.trim()) {
            toast.error("Please enter a valid room name");
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/room', {
                slug: roomName
            },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.data.message === "Room Created") {
                toast.success(`Room Created! Room ID: ${response.data.roomId}`);
                setIsOpen(false);
                setRoomName(""); // Clear input field after success
            } else {
                toast.warn("Unexpected response from server");
            }
        } catch (error) {
            console.error("Error creating room:", error);

            //@ts-ignore
            const errorMessage = error.response?.data?.message || "Server error occurred";
            toast.error(errorMessage);
        }

    }
    const joinRoom = () => {

        toast.success("Room Join successful"); // ✅ Ensure toast fires
        setInterval(() => {
            router.push(`/canvas/${joinroomName}`)
        }, 1000);

    }
    function LogOut() {
        localStorage.removeItem('token');
        toast.success("Logout successful"); // ✅ Ensure toast fires
        setInterval(() => {
            router.push('/');
        }, 1000);

    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-50">
            {/* Navigation */}
            <ToastContainer position="top-right" autoClose={3000} />
            <nav className="fixed w-full bg-gray-950/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3 z-50 animate-fade-in">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-2 hover:scale-105 transition-transform cursor-pointer">
                        <Pencil className="h-8 w-8 text-blue-400 animate-pulse" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                            DesignFlow
                        </span>
                    </div>

                    {/* Navigation Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <NavigationMenu>
                            <NavigationMenuList>

                                <NavigationMenuItem>
                                    <Button
                                        variant="ghost"
                                        className="text-gray-100 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                    >
                                        Pricing
                                    </Button>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <Button
                                        variant="ghost"
                                        className="text-gray-100 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                    >
                                        About
                                    </Button>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                        <Separator orientation="vertical" className="h-6 bg-gray-800" />
                        <Button
                            variant="ghost"
                            className="text-gray-100 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            onClick={() => LogOut()}
                        >
                            Log out
                        </Button>

                        <Button
                            variant="ghost"
                            className="text-gray-100 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            onClick={() => setJoinRoomToggle(true)}
                        >
                            Join Room
                        </Button>

                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        className="md:hidden text-gray-100 hover:text-blue-400 hover:bg-blue-500/10"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-violet-500/10 animate-pulse pointer-events-none" />
                <div className="max-w-7xl mx-auto text-center relative">
                    <div className="inline-block mb-4 px-4 py-1 bg-gray-900 rounded-full animate-bounce">
                        <span className="text-blue-400 text-sm">✨ Now with AI-powered features</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text animate-fade-in">
                        Design Together,<br />Create Better
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in">
                        Collaborate in real-time with your team on design projects.
                        Share ideas, get feedback, and create amazing designs together.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">

                        {!isOpen && (
                            <Button
                                className="bg-blue-600 hover:bg-blue-500 px-8 py-6 text-lg text-white hover:scale-105 transform transition-all animate-slide-up"
                                onClick={() => setIsOpen(true)}
                            >
                                Create Room
                            </Button>
                        )}

                        {/* Modal Form */}
                        {isOpen && (
                            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-96 text-white">
                                    <h2 className="text-2xl font-bold mb-4 text-center">Create a Room</h2>

                                    {/* Room Name Input */}
                                    <Input
                                        type="text"
                                        placeholder="Enter Room Name"
                                        className="w-full p-3 rounded-md bg-gray-800 text-white mb-4"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                    />

                                    {/* Buttons */}
                                    <div className="flex justify-between">
                                        <Button
                                            className="bg-red-600 hover:bg-red-500 px-6 py-3 text-lg text-white rounded-lg"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-500 px-6 py-3 text-lg text-white rounded-lg"
                                            onClick={createRoom}
                                        >
                                            Create
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Modal Form */}
                        {joinRoomToggle && (
                            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-96 text-white">
                                    <h2 className="text-2xl font-bold mb-4 text-center">Join a Room</h2>

                                    {/* Room Name Input */}
                                    <Input
                                        type="text"
                                        placeholder="Enter Room Name"
                                        className="w-full p-3 rounded-md bg-gray-800 text-white mb-4"
                                        value={joinroomName}
                                        onChange={(e) => setjoinRoomName(e.target.value)}
                                    />

                                    {/* Buttons */}
                                    <div className="flex justify-between">
                                        <Button
                                            className="bg-red-600 hover:bg-red-500 px-6 py-3 text-lg text-white rounded-lg"
                                            onClick={() => setJoinRoomToggle(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-500 px-6 py-3 text-lg text-white rounded-lg"
                                            onClick={joinRoom}
                                        >
                                            Join
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* <Button className="bg-blue-600 hover:bg-blue-500 px-8 py-6 text-lg text-white hover:scale-105 transform transition-all animate-slide-up">
                            Join Room
                        </Button> */}

                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                        Why Choose DesignFlow?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="h-12 w-12 text-blue-400 mb-4" />,
                                title: "Real-time Collaboration",
                                description: "Work together with your team in real-time. See changes instantly and collaborate seamlessly."
                            },
                            {
                                icon: <Share2 className="h-12 w-12 text-blue-400 mb-4" />,
                                title: "Easy Sharing",
                                description: "Share your designs with stakeholders in one click. Get feedback and iterate faster."
                            },
                            {
                                icon: <Rocket className="h-12 w-12 text-blue-400 mb-4" />,
                                title: "Powerful Tools",
                                description: "Access professional design tools built for teams. Create stunning designs efficiently."
                            }
                        ].map((feature, index) => (
                            <Card
                                key={index}
                                className="bg-gray-900 border-gray-800 hover:scale-105 transition-transform hover:border-gray-700 group"
                            >
                                <CardContent className="pt-6">
                                    {feature.icon}
                                    <h3 className="text-xl font-semibold mb-2 text-gray-100">{feature.title}</h3>
                                    <p className="text-gray-300">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text animate-pulse">
                        Ready to transform your design workflow?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Join thousands of teams already using DesignFlow to collaborate and create amazing designs.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-500 px-8 py-6 text-lg text-white hover:scale-105 transform transition-all">
                        Start Free Trial
                    </Button>
                </div>
            </div>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
        </div>
    );
};

export default Dashboard;