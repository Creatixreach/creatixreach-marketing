import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/branding/logo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern use of CreatixReach, CreatixApp and the hosted dialer service.",
};

const EFFECTIVE_DATE = "July 28, 2026";

type Section = {
  heading: string;
  body?: string[];
  bulletsHeading?: string;
  bullets?: string[];
  bulletsAfter?: string[];
};

const SECTIONS: Section[] = [
  {
    heading: "1. About these terms",
    body: [
      "CreatixReach is a registered company in the United States. These Terms of Service are a binding agreement between CreatixReach (we, us, our) and the person or company that opens an account or uses our services (you, Customer).",
      "They cover this website at creatixreach.io, CreatixApp (our customer portal at app.creatixreach.io), and the hosted dialer environments, phone numbers, agent seats, calling minutes and support that we provide, together the Service.",
      "By creating an account, paying an invoice or using the Service, you accept these terms. If you are accepting on behalf of a company, you confirm that you have authority to bind it. If you do not accept these terms, do not use the Service.",
      "Where we sign a separate written agreement, order form or statement of work with you, that document controls to the extent it conflicts with these terms.",
    ],
  },
  {
    heading: "2. Eligibility and accounts",
    bullets: [
      "You must be at least 18 years old and legally able to enter into contracts, and you must use the Service for business purposes only.",
      "Account information must be accurate and kept up to date. We may refuse, verify, suspend or close any account at our discretion.",
      "Before an account is activated we require identity or business verification. This is a fraud and abuse control on telecommunications infrastructure, not an optional step, and we may re-verify at any time.",
      "You are responsible for everything done under your account, including by your agents and staff. Keep credentials confidential, do not share logins between people, and tell us at info@creatixreach.io immediately if you suspect unauthorized access.",
      "Portal access links and dialer credentials are sensitive. Treat them like passwords and do not forward them outside your organization.",
    ],
  },
  {
    heading: "3. Subscriptions, plans and seats",
    body: [
      "The Service is sold as a monthly subscription. Each plan includes a defined number of agent seats and a dedicated dialer environment provisioned for your account. Plan features, seat counts and prices are shown in the portal and may change. Changes apply from your next billing cycle, and we will give reasonable notice of price increases.",
      "You may not exceed the seat count of your plan, share seats between simultaneous users, or resell access in a way that circumvents seat limits. Upgrades take effect when the new plan is paid and provisioned.",
      "Provisioning a dialer environment is automated but is not instantaneous, and depends on third-party infrastructure and number availability. We do not guarantee a specific provisioning time.",
    ],
  },
  {
    heading: "4. Calling credit, per-minute charges and phone numbers",
    bullets: [
      "Calling is billed per minute against a prepaid calling credit balance at the rate shown in your account. Rates vary by destination and may be adjusted with notice.",
      "Calling credit is prepaid, is consumed as calls are made, and is not a deposit or a stored monetary instrument. Unused credit has no cash value and is not redeemable for currency.",
      "When your balance reaches zero, outbound calling is suspended automatically until you top up. We are not liable for campaigns interrupted by an exhausted balance.",
      "Phone numbers are leased to you from carriers for the term of your subscription. You do not own them. Numbers carry a recurring monthly charge billed to your account, and may be reclaimed if fees go unpaid, if an account is closed, or if a carrier or regulator requires it.",
      "Number porting, where available, follows carrier rules and timelines that we do not control.",
    ],
  },
  {
    heading: "5. Payment",
    bullets: [
      "Payments are made in cryptocurrency through a third-party payment processor. You are responsible for network fees, exchange-rate movement between quote and confirmation, and sending the exact requested amount to the correct address. Funds sent to a wrong address or on a wrong network cannot be recovered by us.",
      "Payments are considered received when confirmed on-chain and reported by the processor. Because these transactions are irreversible, all payments are final and, except where required by law, non-refundable. Unused calling credit is not refundable on cancellation.",
      "If a payment fails, is underpaid, or is not confirmed, the related subscription, provisioning or credit is not applied until the shortfall is settled.",
      "Prices are exclusive of taxes. You are responsible for any taxes, duties or levies applicable to you, other than taxes on our income.",
      "We may suspend the Service for non-payment after notice, and may terminate for continued non-payment.",
    ],
  },
  {
    heading: "6. Acceptable use",
    body: [
      "You are solely responsible for the legality of every call, message and campaign you run through the Service, and for the content of your contact lists.",
    ],
    bulletsHeading: "You must not use the Service to:",
    bullets: [
      "Place calls that violate applicable telemarketing and telecommunications law, including the US Telephone Consumer Protection Act and the Telemarketing Sales Rule, state telemarketing statutes, and equivalent laws in any country you call.",
      "Contact people without the consent required by law, or ignore internal do-not-call requests, national and state do-not-call registries, revocation of consent, or lawful calling-hour restrictions.",
      "Transmit false, misleading or unregistered caller identification, spoof numbers you are not authorized to use, or take any step to evade call authentication, analytics or blocking systems.",
      "Run fraud, impersonation, phishing, government or bank impersonation, fake debt collection, investment or cryptocurrency schemes, illegal lead generation, or any other deceptive or unlawful campaign.",
      "Send or store content that is unlawful, harassing, threatening, defamatory, obscene, infringing of intellectual property, or that constitutes unlawful discrimination.",
      "Generate artificial traffic, engage in traffic pumping or toll fraud, place calls with no intent to communicate, or use the Service in a way that draws carrier or regulator complaints.",
      "Probe, scan, overload, reverse engineer, copy or interfere with the Service or its underlying infrastructure, attempt to reach other customer environments, remove or bypass usage or billing controls, or run software on the environment for unrelated purposes such as mining.",
      "Resell or provide access to third parties in breach of these terms. Where you legitimately resell to end clients, you remain fully responsible to us for their conduct and must bind them to terms at least as protective as these.",
    ],
    bulletsAfter: [
      "We may monitor traffic patterns for security, fraud and compliance purposes. We may suspend an account or a campaign immediately and without notice where we reasonably believe there is illegal calling activity, fraud, security risk, or a credible carrier or regulator complaint. Where suspension is not urgent, we will give notice and a chance to fix the problem.",
    ],
  },
  {
    heading: "7. Call recording and consent",
    body: [
      "Where you enable call recording or monitoring, you are responsible for complying with the recording, wiretapping and consent laws that apply to you and to every person on the call, including jurisdictions that require all-party consent. You must give any required announcements or notices. We provide the technical capability only. We do not review your recordings and we do not advise on whether your practice is lawful.",
    ],
  },
  {
    heading: "8. Your data and our data",
    bullets: [
      "You own your content: contact lists, campaign configuration, scripts, recordings and the records your use of the Service generates. You grant us a limited license to host, process and transmit that content solely to provide, secure and support the Service.",
      "You confirm that you have the rights and lawful basis to load and use that content, and that it was not obtained in breach of privacy or telemarketing law.",
      "We own the Service, our software, portal, documentation, branding and all improvements to them. Nothing here transfers those rights to you. Feedback you send us may be used freely without obligation.",
      "Our handling of personal information is described in our Privacy Policy, which forms part of these terms. Where we process personal information on your behalf, we do so as your processor under your instructions.",
    ],
  },
  {
    heading: "9. Confidentiality",
    body: [
      "Each party may receive non-public information from the other. The receiving party will use it only to perform under these terms, protect it with at least reasonable care, and not disclose it except to staff and advisors bound by similar obligations, or where legally compelled. Anything you discuss with us about your business before signing up is treated as confidential.",
    ],
  },
  {
    heading: "10. Availability, support and maintenance",
    body: [
      "We work to keep the Service available and to resolve problems quickly, and support is provided through the ticketing system in the portal and at info@creatixreach.io. Unless we have signed a separate written service level agreement with you, the Service is provided without an uptime guarantee.",
      "We may perform maintenance, apply security updates, migrate infrastructure, or change, add or remove features. We will try to schedule disruptive maintenance sensibly and give notice where practical. Parts of the Service depend on third-party carriers, cloud providers, payment processors and networks, and outages or changes at those providers are outside our control.",
    ],
  },
  {
    heading: "11. No emergency calling",
    body: [
      "The Service is an outbound business calling platform. It does not support emergency calling of any kind, including 911, 112 and equivalent emergency numbers, and must never be relied on to reach emergency services. You must make sure everyone using the Service has an alternative means of contacting emergency services, and you are responsible for informing your agents of this limitation.",
    ],
  },
  {
    heading: "12. Suspension and termination",
    bullets: [
      "You may cancel at any time from the portal or by emailing info@creatixreach.io. Cancellation takes effect at the end of the current paid period, and fees already paid are not refunded.",
      "We may suspend or terminate for breach of these terms, non-payment, unlawful or abusive calling activity, security risk, or a legal requirement.",
      "On termination your access ends, dialer environments and phone numbers are decommissioned and released, and remaining calling credit is forfeited. Export anything you need before you cancel. We retain records only as described in our Privacy Policy and as required by law.",
    ],
  },
  {
    heading: "13. Disclaimers",
    body: [
      "The Service is provided as is and as available. To the maximum extent permitted by law we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, and any warranty that the Service will be uninterrupted, error free, secure, or that calls will connect, complete or produce any particular result. We do not warrant delivery quality, answer rates, call completion, number reputation, or the accuracy of third-party carrier data. We do not provide legal, regulatory or compliance advice.",
    ],
  },
  {
    heading: "14. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, neither party is liable for indirect, incidental, special, consequential, exemplary or punitive damages, or for lost profits, lost revenue, lost business, lost data or goodwill, even if advised of the possibility.",
      "Our total aggregate liability arising out of or relating to the Service is limited to the amounts you paid us for the Service in the three months immediately before the event giving rise to the claim. These limits do not apply to your payment obligations, your indemnity obligations, or to liability that cannot be limited by law.",
    ],
  },
  {
    heading: "15. Indemnification",
    body: [
      "You will defend, indemnify and hold harmless CreatixReach and its officers, employees and suppliers against claims, damages, penalties, fines and reasonable costs, including legal fees, arising from your use of the Service, your content and contact data, your calling and recording practices, your breach of these terms or of any law, and claims brought by people you called or by your own end clients.",
    ],
  },
  {
    heading: "16. Force majeure",
    body: [
      "Neither party is liable for delay or failure caused by events beyond its reasonable control, including carrier or cloud provider failure, network attack, internet or power outage, regulatory action, natural disaster, war, or labor disruption. Payment obligations for services already delivered are not excused.",
    ],
  },
  {
    heading: "17. Governing law and disputes",
    body: [
      "These terms are governed by the laws of the United States and of the state in which CreatixReach is registered, without regard to conflict of law rules, and the courts located in that state have exclusive jurisdiction. Each party waives any objection to that venue. The parties will first try in good faith to resolve any dispute informally by contacting info@creatixreach.io. The United Nations Convention on Contracts for the International Sale of Goods does not apply.",
    ],
  },
  {
    heading: "18. Changes to these terms",
    body: [
      "We may update these terms as the Service and the law evolve. The effective date at the top of this page reflects the current version, and material changes will be notified by email or in the portal before they take effect. Continuing to use the Service after that means you accept the updated terms.",
    ],
  },
  {
    heading: "19. General",
    body: [
      "If any provision is found unenforceable, the rest remains in force. Failure to enforce a right is not a waiver of it. You may not assign these terms without our written consent. We may assign them to an affiliate or in connection with a merger, acquisition or sale of assets. Nothing here creates a partnership, joint venture, employment or agency relationship. Notices to you may be sent to the email address on your account. Notices to us go to info@creatixreach.io. These terms, together with the Privacy Policy and any signed agreement or order form, are the entire agreement between us on this subject.",
    ],
  },
  {
    heading: "20. Contact",
    body: ["Questions about these terms: info@creatixreach.io."],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-navy text-brand-text-dark">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-brand-navy/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="sm" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-brand-muted-dark transition-colors hover:text-brand-text-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </header>
      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.25em] text-brand-muted-dark">
            Effective {EFFECTIVE_DATE}
          </p>
          <p className="mt-8 text-base leading-relaxed text-brand-muted-dark">
            CreatixReach is a registered company in the United States providing
            hosted call center and outbound calling software, including
            CreatixApp, our customer portal at app.creatixreach.io. Please read
            these terms carefully. They set out what we provide, how billing
            works, and the calling rules you are responsible for following.
          </p>

          <div className="mt-14 space-y-12">
            {SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold text-brand-text-dark">
                  {section.heading}
                </h2>

                {section.body ? (
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-base leading-relaxed text-brand-muted-dark"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}

                {section.bulletsHeading ? (
                  <p className="mt-4 text-base font-medium leading-relaxed text-brand-text-dark">
                    {section.bulletsHeading}
                  </p>
                ) : null}

                {section.bullets ? (
                  <ul className="mt-4 space-y-3">
                    {section.bullets.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-base leading-relaxed text-brand-muted-dark"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-brand-indigo"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.bulletsAfter ? (
                  <div className="mt-4 space-y-4">
                    {section.bulletsAfter.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-base leading-relaxed text-brand-muted-dark"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-white/10 pt-8 text-sm text-brand-muted-dark">
            <p>
              Questions about these terms? Email{" "}
              <a
                href="mailto:info@creatixreach.io"
                className="text-brand-indigo hover:underline"
              >
                info@creatixreach.io
              </a>
              .
            </p>
            <p className="mt-3">
              See also our{" "}
              <Link href="/privacy" className="text-brand-indigo hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
