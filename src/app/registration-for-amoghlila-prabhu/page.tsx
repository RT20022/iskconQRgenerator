'use client'

import '@/app/registration-for-amoghlila-prabhu/registration.css'
import { useState } from 'react'

// 'use static'
// color to be used  =  bg-pink-600
const Register_for_Event = () => {
    interface userDataFormat {
        fullName: string,
        contact: string,
        email: string
    }
    const [isloading, setisLoading] = useState(false)
    const [userData, setUserData] = useState<userDataFormat>({
        fullName: '',
        contact: '',
        email: ''
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
            name: "Your App Name",
            description: "Test Transaction",
            order_id: data.id,
            handler: async function (response: any) {
                // 3. After success
                console.log("Payment success:", response);
                response.userData = userData
                // Send to your backend to verify
                await fetch("/api/payment-success", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(response),
                });

                alert("Payment Successful!");
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
        const resp = await fetch('/api/getformdata', {
            method: "POST",
            body: JSON.stringify({ userData })
        })

        if (resp.ok) {
            payNow()
            setisLoading(false)
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen" suppressHydrationWarning={true}>
            <form action="" onSubmit={handleSubmit} className='flex justify-center items-center flex-col py-6 w-[90vw]'>
                <h2 className="text-4xl">Register Now</h2>
                <p className='mb-5 mt-2'><strong>UDAAN</strong>- Rise Before Limits</p>
                <div>
                    {/* Register the name */}
                    <fieldset className='border border-amber-50 rounded-4xl'>
                        <legend>Full Name <span className='text-red-600'>*</span></legend>
                        <input type="text" className=' text-2xl ps-4 pb-2' name="fullName" value={userData.fullName} onChange={handleInput} required />
                    </fieldset>
                    {/* Register the Contact Number */}
                    <fieldset className='border border-amber-50 rounded-4xl my-3'>
                        <legend>Contact No <span className='text-red-600'>*</span></legend>
                        <input type="text" className=' text-2xl ps-4 pb-2' name="contact" value={userData.contact} onChange={handleInput} required />
                    </fieldset>
                    {/* Register the Email */}
                    <fieldset className='border border-amber-50 rounded-4xl'>
                        <legend>Email <span className='text-red-600'>*</span></legend>
                        <input type="email" className=' text-2xl ps-4 pb-2' name="email" value={userData.email} onChange={handleInput} required />
                    </fieldset>
                    {/* Submit Button */}
                    {isloading ? (
                        <button className="w-[100%] text-2xl ps-4 my-3 bg-amber-50 text-black rounded-4xl py-2">
                            Loading...
                        </button>
                    ) : (
                        <button className="w-[100%] text-2xl ps-4 my-3 bg-amber-50 text-black rounded-4xl py-2">
                            Register Now {isloading}
                        </button>
                    )}
                    <p>Note : 100 Rs will be charged for registration</p>
                </div>
            </form>
        </div>
    )
}

export default Register_for_Event