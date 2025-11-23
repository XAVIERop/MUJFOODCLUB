import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24 pb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p>
                  Welcome to Food Club ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our food delivery service at Manipal University Jaipur (MUJ).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mb-2">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account</li>
                  <li><strong>Profile Information:</strong> Delivery address, block/hostel information, residency scope</li>
                  <li><strong>Order Information:</strong> Food orders, delivery preferences, payment information</li>
                  <li><strong>Communication:</strong> Messages, feedback, and support requests</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">2.2 Information Automatically Collected</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
                  <li><strong>Location Data:</strong> Delivery location (with your permission)</li>
                  <li><strong>Cookies and Tracking:</strong> We use cookies to enhance your experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Process and fulfill your food orders</li>
                  <li>Manage your account and provide customer support</li>
                  <li>Send order confirmations, updates, and delivery notifications</li>
                  <li>Improve our services and develop new features</li>
                  <li>Send promotional offers and updates (you can opt-out anytime)</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
                <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>With Cafes:</strong> We share order details with cafes to fulfill your orders</li>
                  <li><strong>Service Providers:</strong> We may share data with payment processors, delivery services, and analytics providers</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Request a copy of your data</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at <a href="mailto:plattrtechnologies@gmail.com" className="text-primary hover:underline">plattrtechnologies@gmail.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Third-Party Services</h2>
                <p>
                  Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
                <p>
                  Our service is intended for users who are at least 13 years old. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-none pl-0 space-y-1 mt-2">
                  <li><strong>Email:</strong> <a href="mailto:plattrtechnologies@gmail.com" className="text-primary hover:underline">plattrtechnologies@gmail.com</a></li>
                  <li><strong>Website:</strong> <a href="https://mujfoodclub.in" className="text-primary hover:underline">https://mujfoodclub.in</a></li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

