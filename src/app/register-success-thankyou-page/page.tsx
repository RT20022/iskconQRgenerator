const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl px-6 py-10 sm:px-10 max-w-xl w-full text-center border border-yellow-300">
        
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-pink-600 mb-4 animate-pulse">
          🌸HARI BOL🌸
        </h1>

        {/* Message */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
          You have successfully registered for the <span className="font-semibold text-purple-600">UDAAN</span> event by <span className="text-amber-600 font-bold">Amogh Lila Das</span>.
        </p>

        {/* Email Note */}
        <p className="text-md sm:text-lg text-gray-600 mb-4">
          Kindly check your email for the <span className="text-green-700 font-medium">Entry Pass</span>.
        </p>

        {/* Contact Info */}
        <p className="text-sm sm:text-base text-gray-500">
          If you face any issue, feel free to reach out to us:
        </p>
        <a
          href="mailto:iskconsrigokulgaushalaevents@gmail.com"
          className="text-blue-700 underline font-medium mt-1 inline-block break-all"
        >
          iskconsrigokulgaushalaevents@gmail.com
        </a>
      </div>
    </div>
  );
};

export default ThankYouPage;
