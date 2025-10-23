import { Link } from "wouter";
import { Mail, Phone, MessageCircle, Instagram } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SOCIAL_LINKS } from "@/const";

function ContactInfo() {
  const { data: settings } = trpc.settings.list.useQuery();

  const supportEmail = settings?.find((s) => s.key === "support_email")?.value;
  const supportPhone = settings?.find((s) => s.key === "support_phone")?.value;
  const supportWhatsapp = settings?.find((s) => s.key === "support_whatsapp")?.value;

  return (
    <div className="space-y-2 text-gray-400">
      {supportEmail && (
        <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
          <Mail className="w-4 h-4" />
          <span>{supportEmail}</span>
        </a>
      )}
      {supportPhone && (
        <a href={`tel:${supportPhone}`} className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
          <Phone className="w-4 h-4" />
          <span>{supportPhone}</span>
        </a>
      )}
      {supportWhatsapp && (
        <a
          href={`https://wa.me/${supportWhatsapp.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-yellow-500 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
      )}
      {!supportEmail && !supportPhone && !supportWhatsapp && (
        <p>For inquiries, please reach out through our social media channels.</p>
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-yellow-500/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Lions Vogue" className="h-12 w-12 rounded-full" />
              <div>
                <h3 className="text-xl font-bold text-yellow-400">LIONS VOGUE</h3>
                <p className="text-xs text-gray-400">WEAR IT WITH STYLE</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Premium clothing and exclusive events for the modern trendsetter.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
            <div className="flex gap-4 mb-6">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-black border-2 border-white flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/shop">
                  <span className="hover:text-yellow-400 transition-colors cursor-pointer">Shop</span>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <span className="hover:text-yellow-400 transition-colors cursor-pointer">Events</span>
                </Link>
              </li>
              <li>
                <Link href="/cart">
                  <span className="hover:text-yellow-400 transition-colors cursor-pointer">Cart</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ContactInfo />
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Lions Vogue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

