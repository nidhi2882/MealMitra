import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-ink font-sans">
            {/* Hero Section */}
            <section className="relative flex-1 flex items-center pt-20 pb-16 overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-verified/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center gap-12 w-full z-10">
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
                            Join the movement against food waste
                        </div>
                        <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-ink mb-6 leading-tight">
                            Share a meal, <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/70">
                                change a life.
                            </span>
                        </h1>
                        <p className="text-lg lg:text-xl text-ink/70 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            MealMitra connects restaurants with surplus food to NGOs and communities that need it most. 
                            Let's build a future where no food goes to waste.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent text-white font-semibold text-lg hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/30"
                            >
                                Get Started Today
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 rounded-full border border-line bg-white/50 backdrop-blur-sm text-ink font-semibold text-lg hover:bg-white hover:border-ink/20 hover:scale-105 transition-all shadow-sm"
                            >
                                Log In
                            </Link>
                        </div>
                    </div>

                    {/* Image/Illustration */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none relative group perspective">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-verified/20 rounded-[2rem] transform rotate-3 group-hover:rotate-6 transition-transform duration-500 blur-xl" />
                        <img
                            src="/hero.jpg"
                            alt="People sharing food"
                            className="relative w-full h-auto object-cover rounded-[2rem] shadow-2xl border border-white/20 transform transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink mb-6">About MealMitra</h2>
                        <p className="text-lg text-ink/70 leading-relaxed">
                            MealMitra was born out of a simple, powerful idea: no one should go hungry while good food goes to waste. 
                            We bridge the gap between food surplus and food scarcity by providing a seamless, real-time platform where restaurants, event organizers, and caterers can connect directly with verified NGOs.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-background border border-line hover:border-accent/30 transition-colors group">
                            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {/* SVG Icon */}
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-ink mb-3">Community First</h3>
                            <p className="text-ink/60 leading-relaxed">We focus on building strong local networks where neighbors help neighbors, ensuring food reaches the vulnerable quickly.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-background border border-line hover:border-verified/30 transition-colors group">
                            <div className="w-12 h-12 bg-verified/10 text-verified rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-ink mb-3">Verified Network</h3>
                            <p className="text-ink/60 leading-relaxed">Safety and hygiene are our top priorities. Every NGO and donor on our platform goes through a strict verification process.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-background border border-line hover:border-pending/30 transition-colors group">
                            <div className="w-12 h-12 bg-pending/10 text-pending rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-ink mb-3">Real-Time Coordination</h3>
                            <p className="text-ink/60 leading-relaxed">Our system matches donations to requests instantly, ensuring that perishable food is picked up before it spoils.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-background border-t border-line">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink mb-4">How It Works</h2>
                        <p className="text-lg text-ink/70">A simple 3-step process to make a huge difference.</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-line z-0"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-accent text-accent flex items-center justify-center text-3xl font-bold font-display shadow-lg mb-6">1</div>
                                <h3 className="text-2xl font-bold text-ink mb-3">Post a Donation</h3>
                                <p className="text-ink/70">Restaurants or individuals with surplus food list the details on our platform securely.</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-verified text-verified flex items-center justify-center text-3xl font-bold font-display shadow-lg mb-6">2</div>
                                <h3 className="text-2xl font-bold text-ink mb-3">Instant Matching</h3>
                                <p className="text-ink/70">Verified NGOs in the vicinity receive an alert and can claim the donation immediately.</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-pending text-pending flex items-center justify-center text-3xl font-bold font-display shadow-lg mb-6">3</div>
                                <h3 className="text-2xl font-bold text-ink mb-3">Pickup & Distribute</h3>
                                <p className="text-ink/70">The NGO collects the food and distributes it to the vulnerable, closing the loop on hunger.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
