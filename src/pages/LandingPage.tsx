import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Zap, Phone, Mail, MapPin } from 'lucide-react';
import logo from '../assets/logo.png';
import footerLogo from '../assets/footer-logo.png';

export const LandingPage: React.FC = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-bg-cream to-bg-light min-h-[70vh] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h1 className="text-5xl md:text-6xl font-bold text-header mb-6">
            Convert Your Vehicle Into a<br />
            <span className="text-emergency">Life-Saving Vehicle</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            LifeLane empowers individuals to transport patients during medical emergencies when ambulances aren't available. With one-time siren access, and real-time approval — you save time when every second counts.
          </p>
          <Link
            to="/request"
            className="inline-flex items-center bg-emergency text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            <AlertCircle className="w-6 h-6 mr-2" />
            Request Emergency
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-header mb-16">
            How LifeLane Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-emergency bg-opacity-10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-emergency" />
              </div>
              <h3 className="text-2xl font-semibold text-header mb-4">1. Request</h3>
              <p className="text-gray-600 leading-relaxed">
                Submit an emergency request by entering basic patient details such as name, age, medical issue, and optional photo. Your request is forwarded to admins for  quick verification.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-success bg-opacity-10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-success" />
              </div>
              <h3 className="text-2xl font-semibold text-header mb-4">2. Approval</h3>
              <p className="text-gray-600 leading-relaxed">
                Once approved by the admin, you receive a unique, one-time siren activation code through the app or website. This code is securely linked to your request and cannot be reused.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary bg-opacity-10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-header mb-4">3. Activation</h3>
              <p className="text-gray-600 leading-relaxed">
                Enter the approved code into your LifeLane siren device installed in your vehicle. The device unlocks the siren, giving your car emergency status — helping you reach the hospital faster, with priority in traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-emergency">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join countless families turning their vehicles into emergency responders with LifeLane — trusted, verified, and built for urgent care.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center bg-white text-header px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* How LifeLane Can Save Millions of Lives */}
      <section className="w-full bg-gradient-to-br from-[#fffcf5] to-[#f4f5f7] py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1c3356] text-center mb-4">How LifeLane Can Save Millions of Lives</h2>
          <p className="text-lg text-[#1c3356]/80 text-center max-w-[700px] mb-12">
            In critical moments, delays can be deadly. LifeLane empowers you to use your own vehicle for emergency transport when ambulances aren't available.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-10">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center group">
              <span className="text-3xl mb-4 transition-transform group-hover:scale-110">🚗</span>
              <div className="font-semibold text-[#1c3356] mb-2 text-lg md:text-xl">Turns any private car into an emergency-ready vehicle</div>
            </div>
            {/* Feature 2 */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center group">
              <span className="text-3xl mb-4 transition-transform group-hover:scale-110">⚙️</span>
              <div className="font-semibold text-[#1c3356] mb-2 text-lg md:text-xl">Verified instantly by LifeLane admin team</div>
            </div>
            {/* Feature 3 */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center group">
              <span className="text-3xl mb-4 transition-transform group-hover:scale-110">🔐</span>
              <div className="font-semibold text-[#1c3356] mb-2 text-lg md:text-xl">Activates secure, one-time-use siren codes</div>
            </div>
            {/* Feature 4 */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center group">
              <span className="text-3xl mb-4 transition-transform group-hover:scale-110">⏱️</span>
              <div className="font-semibold text-[#1c3356] mb-2 text-lg md:text-xl">Cuts down delays in emergency response</div>
            </div>
            {/* Feature 5 */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center group">
              <span className="text-3xl mb-4 transition-transform group-hover:scale-110">📲</span>
              <div className="font-semibold text-[#1c3356] mb-2 text-lg md:text-xl">100% digital — no paperwork</div>
            </div>
            {/* Feature 6 */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center group">
              <span className="text-3xl mb-4 transition-transform group-hover:scale-110">🌍</span>
              <div className="font-semibold text-[#1c3356] mb-2 text-lg md:text-xl">Easy and accessible for everyone</div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-4 w-full">
            <div className="italic text-[#1c3356] text-base md:text-lg font-semibold text-center">Your vehicle could be someone's lifeline.</div>
            <Link
              to="/request"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#4e55b9] to-[#1c3356] text-white px-8 py-3 font-semibold text-base md:text-lg shadow-md hover:scale-105 transition-transform w-full sm:w-auto"
            >
              <span className="mr-2">🚨</span> Request Access
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-header text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img src={footerLogo} alt="LifeLane Footer Logo" className="h-16 w-auto" />
              <p className="text-gray-300 mt-4">
                Transforming emergency medical transport through technology and community.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/privacy-policy" className="hover:underline text-gray-300">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:underline text-gray-300">Terms of Service</Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-semibold mb-4 text-center">Contact</h4>
              <div className="space-y-2 flex flex-col items-center">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-gray-300">+91 73938 00862</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-gray-300">+91 83683 12681</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-gray-300">+91 96502 75609</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-gray-300">+91 79824 04800</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-gray-300">lifelanesupport@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-gray-300">unfazed.services@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-12 pt-8 text-center text-gray-300">
            <p>© 2025 LifeLane. Designed & Monitored by Unfazed Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};