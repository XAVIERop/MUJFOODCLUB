import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24 pb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Food Club ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p>
                  Food Club is a food delivery platform that connects students and residents of Manipal University Jaipur (MUJ) with local cafes and food vendors. We facilitate the ordering and delivery of food items from participating cafes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <h3 className="text-lg font-medium mb-2">3.1 Account Creation</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You must be at least 13 years old to create an account</li>
                  <li>You must provide accurate, current, and complete information</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You are responsible for all activities that occur under your account</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">3.2 Account Types</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>GHS Users:</strong> Users with @muj.manipal.edu or @mujfoodclub.in email addresses</li>
                  <li><strong>Outside Users:</strong> Users with other email addresses</li>
                  <li>Different user types may have access to different cafes and features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Orders and Payments</h2>
                <h3 className="text-lg font-medium mb-2">4.1 Order Placement</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>All orders are subject to acceptance by the cafe</li>
                  <li>Cafes reserve the right to refuse any order</li>
                  <li>Order prices are set by individual cafes and may change without notice</li>
                  <li>We are not responsible for menu errors or unavailability of items</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">4.2 Payment</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Payment is required at the time of order placement or upon delivery</li>
                  <li>Accepted payment methods may vary by cafe</li>
                  <li>All prices are in Indian Rupees (INR)</li>
                  <li>Additional charges (delivery fees, taxes) may apply</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">4.3 Cancellations and Refunds</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Order cancellations are subject to cafe policies</li>
                  <li>Refunds, if applicable, will be processed according to the payment method used</li>
                  <li>We are not responsible for refunds for orders accepted and prepared by cafes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Delivery</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Delivery times are estimates and not guaranteed</li>
                  <li>You must provide accurate delivery addresses</li>
                  <li>You are responsible for being available to receive your order</li>
                  <li>We are not responsible for delays caused by factors beyond our control</li>
                  <li>Delivery areas are limited to Manipal University Jaipur campus and nearby locations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. User Conduct</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Attempt to gain unauthorized access to any portion of the Service</li>
                  <li>Use automated systems to access the Service without permission</li>
                  <li>Impersonate any person or entity</li>
                  <li>Harass, abuse, or harm other users</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
                <p>
                  The Service and its original content, features, and functionality are owned by Food Club and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p>
                  Food Club acts as an intermediary between users and cafes. We are not responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The quality, safety, or legality of food items</li>
                  <li>The accuracy of menu descriptions or prices</li>
                  <li>Delivery delays or failures</li>
                  <li>Any disputes between users and cafes</li>
                  <li>Any injuries or health issues resulting from food consumption</li>
                </ul>
                <p className="mt-3">
                  To the maximum extent permitted by law, Food Club shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Indemnification</h2>
                <p>
                  You agree to defend, indemnify, and hold harmless Food Club and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your use of the Service or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will cease immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Dispute Resolution</h2>
                <p>
                  Any disputes arising out of or relating to these Terms or the Service shall be resolved through good faith negotiation. If a resolution cannot be reached, disputes shall be subject to the exclusive jurisdiction of the courts in Jaipur, Rajasthan, India.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="list-none pl-0 space-y-1 mt-2">
                  <li><strong>Email:</strong> <a href="mailto:support@mujfoodclub.in" className="text-primary hover:underline">support@mujfoodclub.in</a></li>
                  <li><strong>Website:</strong> <a href="https://mujfoodclub.in" className="text-primary hover:underline">https://mujfoodclub.in</a></li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;

