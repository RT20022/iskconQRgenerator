'use client'

// import '@/app/registration-for-amoghlila-prabhu/registration.css'
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Image from 'next/image'
import { Poppins } from 'next/font/google'
const poppins = Poppins({
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
            <div className={poppins.className}>
                {/* Fixed Whatsapp icon */}
                <div className='box-border'>
                    {/* Bannner */}
                  
                    <div className="flex justify-center items-center min-h-screen" suppressHydrationWarning={true}>
                        <form action="" onSubmit={handleSubmit} className='flex justify-center items-center flex-col py-6 w-[90vw]'>
                            <h2 className="text-4xl">Register Now</h2>
                            <p className='mb-5 mt-2'><strong>UDAAN</strong>- Rise Before Limits</p>
                            <div>
                                {/* Register the name */}
                                <fieldset className='border border-amber-800 rounded-4xl'>
                                    <legend>Full Name <span className='text-red-600'>*</span></legend>
                                    <input type="text" className=' text-2xl ps-4 pb-2' name="fullName" value={userData.fullName} onChange={handleInput} required />
                                </fieldset>
                                {/* Register the Contact Number */}
                                <fieldset className='border border-amber-800 rounded-4xl my-3'>
                                    <legend>Contact No <span className='text-red-600'>*</span></legend>
                                    <input type="text" className=' text-2xl ps-4 pb-2' name="contact" value={userData.contact} onChange={handleInput} required />
                                </fieldset>
                                {/* Register the Email */}
                                <fieldset className='border border-amber-800 rounded-4xl'>
                                    <legend>Email <span className='text-red-600'>*</span></legend>
                                    <input type="email" className=' text-2xl ps-4 pb-2' name="email" value={userData.email} onChange={handleInput} required />
                                </fieldset>
                                {/* Register the Age */}
                                <fieldset className='border border-amber-800 rounded-4xl mt-3'>
                                    <legend>Age <span className='text-red-600'>*</span></legend>
                                    <input type="text" className=' text-2xl ps-4 pb-2' name="age" value={userData.age} onChange={handleInput} required />
                                </fieldset>
                                {/* Register the DOB */}
                                <fieldset className='border border-amber-800 rounded-4xl my-3 '>
                                    <legend>DOB <span className='text-red-600'>*</span></legend>
                                    <input type="date" className=' text-2xl ps-4 pb-2' name="DOB" value={userData.DOB} onChange={handleInput} required />
                                </fieldset>
                                <div className="mb-3 text-lg ">
                                    Gender<span className='text-red-600'>*</span> :
                                    <label className="ms-4 me-6">
                                        <input
                                            type="radio"
                                            name="Gender"
                                            value="Male"
                                            checked={userData.Gender === "Male"}
                                            onChange={handleInput}
                                            className="me-2"
                                            required
                                        />
                                        Male
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            name="Gender"
                                            value="Female"
                                            checked={userData.Gender === "Female"}
                                            onChange={handleInput}
                                            className="me-2"
                                            required
                                        />
                                        Female
                                    </label>
                                </div>

                                {/* Register the Address */}
                                <fieldset className='border border-amber-800 rounded-4xl'>
                                    <legend>Address <span className='text-red-600'>*</span></legend>
                                    <input type="text" className=' text-2xl ps-4 pb-2' name="Address" value={userData.Address} onChange={handleInput} required />
                                </fieldset>
                                {/* Register the School */}
                                <fieldset className='border border-amber-800 rounded-4xl my-3'>
                                    <legend>School/Collage Name <span className='text-red-600'>*</span></legend>
                                    <input type="text" className=' text-2xl ps-4 pb-2' name="School" value={userData.School} onChange={handleInput} required />
                                </fieldset>
                                {/* Register the class */}
                                <fieldset className='border border-amber-800 rounded-4xl'>
                                    <legend>Class <span className='text-red-600'>*</span></legend>
                                    <input type="text" className=' text-2xl ps-4 pb-2' name="Class" value={userData.Class} onChange={handleInput} required />
                                </fieldset>
                                {/* Submit Button */}
                                <button
                                    disabled={isLoading}
                                    className={`w-full text-2xl ps-4 my-3 rounded-4xl py-2 flex items-center justify-center gap-3 transition 
    ${isLoading
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-amber-700 text-white hover:bg-amber-950"
                                        }`}
                                >
                                    {isLoading && (
                                        <svg
                                            className="animate-spin h-6 w-6 text-black"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                    )}
                                    {isLoading ? "Processing..." : "Register Now"}
                                </button>

                                {/* <p>Note : 100 Rs will be charged for registration</p> */}
                            </div>
                        </form>
                    </div>
                </div>
                <Toaster />
            </div>
        </>
    )
}

export default Register_for_Event