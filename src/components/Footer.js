import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ]

  const quickLinks = [
    { name: "About Us", href: "#about" },
    { name: "Programs", href: "#programs" },
    { name: "Community", href: "#community" },
    { name: "Resources", href: "#resources" },
    { name: "Events", href: "#events" },
    { name: "Contact", href: "#contact" },
  ]

  const programs = [
    { name: "Mentorship Network", href: "#" },
    { name: "Cultural Education", href: "#" },
    { name: "Youth Development", href: "#" },
    { name: "Career Advancement", href: "#" },
    { name: "Innovation Hub", href: "#" },
    { name: "Global Community", href: "#" },
  ]

  return (
    <footer className="gradient-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="text-2xl font-poppins font-bold text-white">UMUIGBO</div>
              <div className="ml-2 text-sm font-poppins font-medium text-teal">Worldwide</div>
            </div>

            <p className="font-inter text-gray-300 leading-relaxed mb-6">
              Preserving Igbo culture while empowering communities worldwide through mentorship, education, and cultural
              exchange.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-teal" />
                <span className="font-inter text-gray-300">info@umuigbo.org</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-teal" />
                <span className="font-inter text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-teal" />
                <span className="font-inter text-gray-300">Global Headquarters</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-poppins font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="font-inter text-gray-300 hover:text-bright-orange transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-lg font-poppins font-semibold text-white mb-6">Our Programs</h3>
            <ul className="space-y-3">
              {programs.map((program) => (
                <li key={program.name}>
                  <a
                    href={program.href}
                    className="font-inter text-gray-300 hover:text-bright-orange transition-colors duration-300"
                  >
                    {program.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-lg font-poppins font-semibold text-white mb-6">Stay Connected</h3>

            <p className="font-inter text-gray-300 mb-6">
              Follow us on social media for the latest updates and community highlights.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mb-8">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="p-3 bg-white/10 rounded-full hover:bg-bright-orange hover:scale-110 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5 text-white" />
                  </a>
                )
              })}
            </div>

            {/* CTA Card */}
            <div className="bg-bright-orange/20 border border-bright-orange/30 rounded-xl p-6">
              <h4 className="font-poppins font-semibold text-white mb-2">Join Our Mission</h4>
              <p className="font-inter text-gray-300 text-sm mb-4">Become part of our global community today.</p>
              <a
                href="#"
                className="inline-flex items-center font-poppins font-semibold text-bright-orange hover:text-white transition-colors duration-300"
              >
                Get Started →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-inter text-gray-400 text-sm">© 2024 UMUIGBO Worldwide. All rights reserved.</p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="#"
              className="font-inter text-gray-400 hover:text-bright-orange text-sm transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="font-inter text-gray-400 hover:text-bright-orange text-sm transition-colors duration-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="font-inter text-gray-400 hover:text-bright-orange text-sm transition-colors duration-300"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;