import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      setIsSubmitted(true);
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Contact error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12" data-testid="contact-page">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="contact-title">
              Get in Touch
            </h1>
            <p className="text-[#A1A1AA] max-w-lg mx-auto">
              Have questions about our product? We're here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isSubmitted ? (
                <div className="card-surface p-8 text-center" data-testid="contact-success">
                  <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-[#A1A1AA] mb-6">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="border-[#262626] hover:border-[#FF4500]"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card-surface p-8" data-testid="contact-form">
                  <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-[#A1A1AA] mb-2 block">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        required
                        className="bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500]"
                        data-testid="contact-input-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-[#A1A1AA] mb-2 block">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                        className="bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500]"
                        data-testid="contact-input-email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-[#A1A1AA] mb-2 block">
                        Phone (optional)
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                        className="bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500]"
                        data-testid="contact-input-phone"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-[#A1A1AA] mb-2 block">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="How can we help you?"
                        required
                        rows={5}
                        className="bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500] resize-none"
                        data-testid="contact-input-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full btn-primary py-4 rounded-full font-semibold flex items-center justify-center gap-2"
                      data-testid="contact-submit-btn"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="card-surface p-6" data-testid="contact-info-card">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FF4500]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-[#FF4500]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-[#A1A1AA]">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FF4500]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#FF4500]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-[#A1A1AA]">support@mookistore.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FF4500]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#FF4500]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Store Location</h3>
                      <p className="text-[#A1A1AA]">
                        123 Vape Street<br />
                        Los Angeles, CA 90001
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Hours */}
              <div className="card-surface p-6" data-testid="store-hours-card">
                <h2 className="text-xl font-bold mb-4">Store Hours</h2>
                <div className="space-y-2 text-[#A1A1AA]">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-white">10:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-white">11:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-white">Closed</span>
                  </div>
                </div>
              </div>

              {/* Age Notice */}
              <div className="bg-[#FF4500]/10 border border-[#FF4500]/30 rounded-xl p-4 text-center">
                <p className="text-sm text-[#A1A1AA]">
                  <span className="text-[#FF4500] font-semibold">18+ Only</span> — 
                  Our products are intended for adults. Valid ID required for purchase.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Contact;
