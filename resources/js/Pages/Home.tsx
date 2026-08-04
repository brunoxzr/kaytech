import React, { useState } from 'react';
import { TrustedCompany, Project, Service, SiteSetting, KaytechProduct } from '../Types';
import { SeoHead } from '../Components/UI/SeoHead';
import { ScrollControlledHero } from '../Components/Hero/ScrollControlledHero';
import { Navbar } from '../Components/Layout/Navbar';
import { TrustedCompaniesMarquee } from '../Components/UI/TrustedCompaniesMarquee';
import { DiagnosisSection } from '../Components/Sections/DiagnosisSection';
import { ActionPlanSection } from '../Components/Sections/ActionPlanSection';
import { FeaturedCases } from '../Components/Projects/FeaturedCases';
import { ProductsSection } from '../Components/Sections/ProductsSection';
import { WorkProcess } from '../Components/Sections/WorkProcess';
import { OperationsSection } from '../Components/Sections/OperationsSection';
import { ServicesSection } from '../Components/Sections/ServicesSection';
import { DifferentialsSection } from '../Components/Sections/DifferentialsSection';
import { FounderSection } from '../Components/Sections/FounderSection';
import { TechnologyStack } from '../Components/Sections/TechnologyStack';
import { ContactSection } from '../Components/Contact/ContactSection';
import { Footer } from '../Components/Layout/Footer';

interface HomeProps {
    trustedCompanies: TrustedCompany[];
    projects: Project[];
    services: Service[];
    products: KaytechProduct[];
    siteSettings: SiteSetting;
}

export default function Home({ trustedCompanies, projects, services, products, siteSettings }: HomeProps) {
    const [videoPassed, setVideoPassed] = useState<boolean>(false);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-600 selection:text-white font-sans antialiased">
            <SeoHead />

            {/* Scroll Controlled Hero Video (Sticky 100vh) — must NOT sit inside an overflow-x-hidden
                ancestor, since any overflow other than visible breaks position: sticky. */}
            <ScrollControlledHero onVideoEndChange={setVideoPassed} />

            {/* Navbar appears as main content begins */}
            <Navbar visible={videoPassed} />

            {/* Main Content Sections - Pure black transition */}
            <main id="inicio" className="relative z-10 bg-[#050505] overflow-x-hidden">
                <TrustedCompaniesMarquee companies={trustedCompanies} />
                <DiagnosisSection />
                <ActionPlanSection />
                <FeaturedCases projects={projects} />
                <ProductsSection products={products} />
                <WorkProcess />
                <OperationsSection />
                <ServicesSection services={services} />
                <DifferentialsSection />
                <FounderSection />
                <TechnologyStack />
                <ContactSection />
            </main>

            <Footer />
        </div>
    );
}
