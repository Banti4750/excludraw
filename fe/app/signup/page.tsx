"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // ✅ Import styles
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


export default function SignUpForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [name, setName] = React.useState("")
    const [errors, setErrors] = React.useState({
        name: "",
        email: "",
        password: ""
    })

    const validateForm = () => {
        let isValid = true
        const newErrors = {
            name: "",
            email: "",
            password: ""
        }

        // Name validation
        if (!name.trim()) {
            newErrors.name = "Name is required"
            isValid = false
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

    //@ts-ignore
    async function handleSignUp(e) {
        e.preventDefault() // Prevent form submission

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            const response = await axios.post('http://localhost:3001/signup', {
                email,
                password,
                name
            })

            if (response.data.message === "Signup successful") {
                toast.success("Signup successful")
                setTimeout(() => {
                    router.push('/signin')
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
                    <CardTitle className="text-gray-100">Sign Up</CardTitle>
                    <CardDescription className="text-gray-400">
                        Create your account to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name" className="text-gray-200">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="bg-gray-900 border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-blue-600"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email" className="text-gray-200">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="bg-gray-900 border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-blue-600"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password" className="text-gray-200">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-gray-900 border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-blue-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                {errors.password ? (
                                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Must be at least 8 characters
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        onClick={handleSignUp}
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                    <div className="text-sm text-gray-400">
                        Already have an account?{" "}
                        <Button
                            variant="link"
                            className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal"
                            onClick={() => router.push('/signin')}
                            disabled={isLoading}
                        >
                            Sign in
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}