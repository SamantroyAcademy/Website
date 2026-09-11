import MotionProvider from "@/components/motion/MotionProvider";
import ModalProvider from "@/components/site/ModalProvider";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import Preloader from "@/components/site/Preloader";
import FloatingActions from "@/components/site/FloatingActions";
import ChatBot from "@/components/site/ChatBot";
import PreviewBar from "@/components/site/PreviewBar";
import PageViewTracker from "@/components/site/PageViewTracker";
import { CONTACT_FORM, resolveContactForm } from "@/lib/form-defaults";
import { getPublished, getSettings, telHref, brochureHref, brochureOn, mapHref } from "@/lib/content";
import { ENQUIRY_POPUP, type EnquiryPopupDoc } from "@/lib/homepage-defaults";
import { BATCH_INFO } from "@/lib/data";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [popup, formDoc, settings, preloader] = await Promise.all([
    getPublished<EnquiryPopupDoc>("enquiry_popup", ENQUIRY_POPUP),
    getPublished<unknown>("contact_form", CONTACT_FORM),
    getSettings(),
    getPublished<{ lottie: string }>("preloader", { lottie: "on" }),
  ]);
  const form = resolveContactForm(formDoc);
  const phoneHref = telHref(settings.phone1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "@id": `${settings.url}/#organization`,
        name: settings.name,
        url: settings.url,
        logo: `${settings.url}/icon.svg`,
        slogan: settings.tagline,
        description:
          "Coaching in Odisha for Army Agniveer, Navy SSR and MR, Air Force X and Y, SSC GD, Odisha Police, Railways and SSC exams: written exam, physical test and medical, trained together.",
        telephone: settings.phone1,
        email: settings.email,
        address: { "@type": "PostalAddress", streetAddress: settings.address, addressRegion: "Odisha", addressCountry: "IN" },
        hasMap: mapHref(settings),
        areaServed: "Odisha",
        sameAs: [settings.instagram, settings.youtube, settings.telegram, settings.facebook].filter((u) => /^https?:\/\/[^/]+\/.+/.test(u ?? "")),
      },
    ],
  };

  return (
    <MotionProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageViewTracker />
      <Preloader enabled={preloader.lottie !== "off"} />
      <ModalProvider popup={popup} form={form} phone={settings.phone1}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-surface">
          Skip to content
        </a>
        <Navbar phone={settings.phone1} phoneHref={phoneHref} whatsapp={settings.whatsapp} />
        <div id="main">{children}</div>
        <div className="bg-brand-950 pb-[4.5rem] md:pb-0">
          <Footer />
        </div>
        <FloatingActions phoneHref={phoneHref} whatsapp={settings.whatsapp} />
        <ChatBot
          settings={{
            whatsapp: settings.whatsapp,
            phone: settings.phone1,
            address: settings.address,
            email: settings.email,
            brochure: brochureHref(settings),
            brochureOn: brochureOn(settings) && Boolean(settings.brochure),
            batchOffline: BATCH_INFO.offline,
            batchOnline: BATCH_INFO.online,
          }}
        />
        <PreviewBar />
      </ModalProvider>
    </MotionProvider>
  );
}
