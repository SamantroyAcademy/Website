import MotionProvider from "@/components/motion/MotionProvider";
import ModalProvider from "@/components/site/ModalProvider";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import Preloader from "@/components/site/Preloader";
import FloatingActions from "@/components/site/FloatingActions";
import SocialRail from "@/components/site/SocialRail";
import ChatBot from "@/components/site/ChatBot";
import PreviewBar from "@/components/site/PreviewBar";
import PageViewTracker from "@/components/site/PageViewTracker";
import { LogoDefs } from "@/components/Logo";
import LanguageProvider from "@/components/i18n/LanguageProvider";
import { mediaUrl } from "@/lib/supabase/media";
import { CONTACT_FORM, resolveContactForm } from "@/lib/form-defaults";
import { getPublished, getSettings, telHref, brochureHref, brochureOn, mapHref } from "@/lib/content";
import { ENQUIRY_POPUP, type EnquiryPopupDoc } from "@/lib/homepage-defaults";
import { BATCH_INFO } from "@/lib/data";
import { COUNTDOWN, type CountdownDoc, type CountdownItem } from "@/lib/countdown-defaults";
import { asArray } from "@/lib/shape";
import { ldJson, siteJsonLd } from "@/lib/structured-data";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [popup, formDoc, settings, preloader, i18n, countdown] = await Promise.all([
    getPublished<EnquiryPopupDoc>("enquiry_popup", ENQUIRY_POPUP),
    getPublished<unknown>("contact_form", CONTACT_FORM),
    getSettings(),
    getPublished<{ lottie: string }>("preloader", { lottie: "on" }),
    getPublished<{ version: string }>("i18n", { version: "" }),
    getPublished<CountdownDoc>("countdown", COUNTDOWN),
  ]);
  const form = resolveContactForm(formDoc);
  const phoneHref = telHref(settings.phone1);

  const jsonLd = siteJsonLd(settings, mapHref(settings));

  return (
    <MotionProvider>
      <LanguageProvider dictUrl={i18n.version ? mediaUrl(`i18n/or-${i18n.version}.json`) : null}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
      <LogoDefs />
      <PageViewTracker />
      <Preloader enabled={preloader.lottie !== "off"} />
      <ModalProvider popup={popup} form={form} phone={settings.phone1} batches={{ items: asArray<CountdownItem>(countdown.items), enabled: countdown.popup !== "off" }}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-surface">
          Skip to content
        </a>
        <Navbar phone={settings.phone1} phoneHref={phoneHref} whatsapp={settings.whatsapp} />
        <div id="main">{children}</div>
        <div className="bg-brand-950 pb-[4.5rem] md:pb-0">
          <Footer />
        </div>
        <FloatingActions phoneHref={phoneHref} whatsapp={settings.whatsapp} />
        <SocialRail settings={settings} />
        <ChatBot
          settings={{
            whatsapp: settings.whatsapp,
            phone: settings.phone1,
            contactName: settings.contactName,
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
      </LanguageProvider>
    </MotionProvider>
  );
}
