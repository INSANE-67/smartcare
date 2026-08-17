import Link from "next/link";
import { Shield, Clock, Heart, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-4xl mx-auto mb-6">
            Healthcare made <span className="text-blue-600">smarter</span> and more personal.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            SmartCare connects you with top medical professionals, manages your health records, and uses AI to streamline your healthcare experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium text-lg transition-colors">
              Get Started for Free
            </Link>
            <Link href="/doctors" className="px-8 py-4 bg-white border border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 rounded-lg font-medium text-lg transition-colors">
              Find a Doctor
            </Link>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose SmartCare?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">We provide the tools you need to take control of your health.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Secure Records", desc: "Your medical history safely stored and easily accessible." },
              { icon: Clock, title: "Easy Scheduling", desc: "Book appointments instantly with your preferred doctors." },
              { icon: Heart, title: "Personalized Care", desc: "AI-assisted tools help doctors provide better care." },
              { icon: Users, title: "Direct Connection", desc: "Message your doctors and build lasting relationships." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-gray-100 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your healthcare experience?</h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
            Join thousands of patients and doctors who are already using SmartCare to build a better future for healthcare.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 rounded-lg font-medium text-lg transition-colors">
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
