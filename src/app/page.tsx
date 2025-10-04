'use client'

// import '@/app/registration-for-amoghlila-prabhu/registration.css'
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Image from 'next/image'
import { Montserrat } from 'next/font/google'
const poppins = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Light → Bold
});
// 'use static'
// color to be used  =  bg-pink-600
const Register_for_Event = () => {
    interface userDataFormat {
        fullName: string,
        contact: string,
        email: string,
        age: string,
        Gender: string,
        DOB: string,
        Address: string,
        School: string,
        Class: string,
    }
    const [isLoading, setisLoading] = useState(false)
    const [userData, setUserData] = useState<userDataFormat>({
        fullName: '',
        contact: '',
        email: '',
        age: '',
        Gender: '',
        DOB: '',
        Address: '',
        School: '',
        Class: ''

    })
    const handleInput = (e: any) => {
        setUserData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const loadScript = async (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
    const payNow = async () => {
        setisLoading(true)
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        // 1. Create order from backend
        const result = await fetch("/api/razorpay", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userData }),
        });

        const data = await result.json();

        // 2. Open Razorpay checkout
        const options = {
            key: `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''}`,
            amount: data.amount,
            currency: data.currency,
            name: "Iskcon",
            description: "Register for UDAAN, Event by Amogh Lila Das",
            order_id: data.id,
            handler: async function (response: any) {
                // 3. After success
                console.log("Payment success:", response);
                response.userData = userData
                // Send to your backend to verify
                let resp = await fetch("/api/payment-success", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(response),
                });

                // alert("Payment Successful!");
                if (resp.ok) {
                    const data = await resp.json();
                    console.log(data, "data here ==")
                    // const blob = new Blob([Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0))], { type: "application/pdf" });
                    // const url = URL.createObjectURL(blob);
                    // const a = document.createElement("a");
                    // a.href = url;
                    // a.download = "ticket.pdf";
                    // a.click();
                    // URL.revokeObjectURL(url);
                    // console.log(resp, "Rghav")

                    const link = document.createElement("a");
                    link.href = `data:application/pdf;base64,${data.pdfBase64}`;
                    link.download = "receipt.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setisLoading(false)
                    window.location.href = "/register-success-thankyou-page";
                }
                else{
                    setisLoading(false)
                    toast.error("Please try after some time ⏳...");
                }
            },
            prefill: {
                name: userData.fullName,
                email: userData.email,
            },
            theme: {
                color: "#3399cc",
            },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
    };
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        console.log("final Data", userData)
        console.log(parseInt(userData.age))
        if (parseInt(userData.age) > 35) {
            toast.error("You must be younger than 35");
        }
        else {
            const resp = await fetch('/api/getformdata', {
                method: "POST",
                body: JSON.stringify({ userData })
            })

            if (resp.ok) {
                payNow()
            }
        }
    }
    return (
        <>
            <div>
                {/* Fixed Whatsapp icon */}
                <div className='box-border'>
                    {/* Bannner */}
                    <Image width={1000} src="/udaan.png" height={100} className='w-[100vw] rounded-4xl p-2' alt='' />
                    <div className={`flex justify-center items-center min-h-screen ${poppins.className}`} suppressHydrationWarning={true}>
                        <div><h1 className='text-xl'>We are no longer accepting online registrations.</h1></div>
                       
                    </div>
                </div>
                <Toaster />
            </div>
        </>
    )
}

export default Register_for_Event