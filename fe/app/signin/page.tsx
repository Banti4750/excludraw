"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // ✅ Import styles


export default function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false)
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [errors, setErrors] = React.useState({
        email: "",
        password: ""
    })

    const validateForm = () => {
        let isValid = true
        const newErrors = {
            email: "",
            password: ""
        }


        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email.trim()) {
            newErrors.email = "Email is required"
            isValid = false
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email format"
            isValid = false
        }

        // Password validation
        if (!password) {
            newErrors.password = "Password is required"
            isValid = false
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    async function handleSignIn(e) {
        e.preventDefault() // Prevent form submission

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            const response = await axios.post('http://localhost:3001/signin', {
                email,
                password,
            })

            //save token in localstorage
            localStorage.setItem('token', response.data.token);

            if (response.data.message === "Login successful") {
                toast.success("Login successful")
                setTimeout(() => {
                    router.push('/dashboard')
                }, 1000);

            }
        } catch (error) {
            //@ts-ignore
            const errorMessage = error.response?.data?.message || "Server error occurred"
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-black h-screen flex justify-center items-center">
            <ToastContainer position="top-right" autoClose={3000} />
            <Card className="w-[350px] bg-gray-950 border-gray-800">

                <CardHeader>
                    <CardTitle className="text-gray-100">Welcome back</CardTitle>
                    <CardDescription className="text-gray-400">
                        Login to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignIn}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email" className="text-gray-200">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="bg-gray-900 border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-blue-600"
                                    required
                                    onChange={(e) => setEmail(e.target.value)}

                                />

                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <div className="flex justify-between">
                                    <Label htmlFor="password" className="text-gray-200">
                                        Password
                                    </Label>
                                    <Button
                                        variant="link"
                                        className="text-sm text-blue-400 hover:text-blue-300 p-0 h-auto font-normal"
                                    >
                                        Forgot password?
                                    </Button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-gray-900 border-gray-800 text-gray-100  placeholder:text-gray-500 focus:border-blue-600"
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        onClick={handleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                    <div className="text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Button
                            variant="link"
                            className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal"
                            onClick={() => { router.push('/signup') }}
                        >
                            Sign up
                        </Button>
                    </div>


                </CardFooter>
            </Card>
        </div >
    );
}