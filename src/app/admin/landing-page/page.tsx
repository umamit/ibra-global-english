"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useLandingPageCMS } from "./hooks/useLandingPageCMS";
import HeroSettings from "./components/HeroSettings";
import NavigationManager from "./components/NavigationManager";
import GalleryManager from "./components/GalleryManager";
import VideoGallery from "./components/VideoGallery";
import TestimonialManager from "./components/TestimonialManager";
import ProgramManager from "./components/ProgramManager";
import BenefitManager from "./components/BenefitManager";
import FAQManager from "./components/FAQManager";
import MaintenanceSettings from "./components/MaintenanceSettings";
import ToastNotification from "../components/ToastNotification";
import LandingTabs from "./components/LandingTabs";

export default function LandingPageCMS() {
  const {
    activeTab, setActiveTab, loading, toast, maintenanceMode, setMaintenanceMode,
    savingMaintenance,
    heroTitle, setHeroTitle, heroSubtitle, setHeroSubtitle, heroDesc, setHeroDesc, heroImage, setHeroImage,
    contactAddress, setContactAddress, contactPhone, setContactPhone, contactEmail, setContactEmail,
    paymentBankName, setPaymentBankName, paymentAccountNumber, setPaymentAccountNumber,
    paymentAccountName, setPaymentAccountName, paymentAccountSub, setPaymentAccountSub,
    paymentSppKids, setPaymentSppKids, paymentSppTeens, setPaymentSppTeens, paymentSppCalistung, setPaymentSppCalistung,
    marqueeText1, setMarqueeText1, marqueeText2, setMarqueeText2, marqueeText3, setMarqueeText3,
    ctaTag, setCtaTag, ctaTitle, setCtaTitle, ctaDesc, setCtaDesc,
    ctaBrochureImage, setCtaBrochureImage, uploadingHero, uploadingCtaBrochure,
    heroFileRef, ctaBrochureFileRef,
    galleryList, galleryLoading, galleryTitle, setGalleryTitle, galleryDesc, setGalleryDesc,
    galleryCaption, setGalleryCaption, galleryFiles, galleryPreviews, addingGallery, galleryFileRef,
    programsList, setProgramsList, benefitsList, setBenefitsList, faqsList, setFaqsList,
    videosList, setVideosList, savingVideos, navigationList, setNavigationList, savingNavigation,
    handleSaveHeroSettings, handleHeroImageChange, handleCtaBrochureImageChange,
    handleGalleryFileChange, handleAddGalleryItem, handleDeleteGalleryItem,
    handleSaveNavigation, handleSaveVideos, handleSavePrograms, handleSaveBenefits, handleSaveFaqs,
    handleSaveMaintenance, handleUploadToStorage, showToast, triggerRevalidation,
  } = useLandingPageCMS();

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      <ToastNotification toast={toast as any} />

      <div className="dashboard-topbar" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.25rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Landing Page</h1>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
          Sesuaikan seluruh isi tulisan, gambar pahlawan (hero), galeri kelas, dan review wali murid di landing page utama secara real-time.
        </p>
      </div>

      <LandingTabs activeTab={activeTab} setActiveTab={setActiveTab} maintenanceMode={maintenanceMode} />

      {activeTab === "hero" && (
        <HeroSettings
          heroTitle={heroTitle} setHeroTitle={setHeroTitle}
          heroSubtitle={heroSubtitle} setHeroSubtitle={setHeroSubtitle}
          heroDesc={heroDesc} setHeroDesc={setHeroDesc}
          heroImage={heroImage} setHeroImage={setHeroImage}
          contactAddress={contactAddress} setContactAddress={setContactAddress}
          contactPhone={contactPhone} setContactPhone={setContactPhone}
          contactEmail={contactEmail} setContactEmail={setContactEmail}
          paymentBankName={paymentBankName} setPaymentBankName={setPaymentBankName}
          paymentAccountNumber={paymentAccountNumber} setPaymentAccountNumber={setPaymentAccountNumber}
          paymentAccountName={paymentAccountName} setPaymentAccountName={setPaymentAccountName}
          paymentAccountSub={paymentAccountSub} setPaymentAccountSub={setPaymentAccountSub}
          paymentSppKids={paymentSppKids} setPaymentSppKids={setPaymentSppKids}
          paymentSppTeens={paymentSppTeens} setPaymentSppTeens={setPaymentSppTeens}
          paymentSppCalistung={paymentSppCalistung} setPaymentSppCalistung={setPaymentSppCalistung}
          marqueeText1={marqueeText1} setMarqueeText1={setMarqueeText1}
          marqueeText2={marqueeText2} setMarqueeText2={setMarqueeText2}
          marqueeText3={marqueeText3} setMarqueeText3={setMarqueeText3}
          ctaTag={ctaTag} setCtaTag={setCtaTag}
          ctaTitle={ctaTitle} setCtaTitle={setCtaTitle}
          ctaDesc={ctaDesc} setCtaDesc={setCtaDesc}
          ctaBrochureImage={ctaBrochureImage} setCtaBrochureImage={setCtaBrochureImage}
          uploadingHero={uploadingHero} setUploadingHero={() => {}}
          uploadingCtaBrochure={uploadingCtaBrochure} setUploadingCtaBrochure={() => {}}
          heroFileRef={heroFileRef} ctaBrochureFileRef={ctaBrochureFileRef}
          handleUploadToStorage={handleUploadToStorage}
          onSave={handleSaveHeroSettings}
        />
      )}

      {activeTab === "navigation" && (
        <NavigationManager navigationList={navigationList} setNavigationList={setNavigationList} handleSaveNavigation={handleSaveNavigation} />
      )}

      {activeTab === "gallery" && (
        <GalleryManager
          galleryTitle={galleryTitle} setGalleryTitle={setGalleryTitle}
          galleryDesc={galleryDesc} setGalleryDesc={setGalleryDesc}
          galleryCaption={galleryCaption} setGalleryCaption={setGalleryCaption}
          galleryPreviews={galleryPreviews} setGalleryPreviews={() => {}}
          galleryFiles={galleryFiles} setGalleryFiles={() => {}}
          galleryFileRef={galleryFileRef}
          addingGallery={addingGallery} setAddingGallery={() => {}}
          galleryList={galleryList} setGalleryList={() => {}}
          galleryLoading={galleryLoading}
          handleGalleryFileChange={handleGalleryFileChange}
          handleAddGalleryItem={handleAddGalleryItem}
          handleDeleteGalleryItem={handleDeleteGalleryItem}
        />
      )}

      {activeTab === "videos" && (
        <VideoGallery videosList={videosList} setVideosList={setVideosList} savingVideos={savingVideos} setSavingVideos={() => {}} handleSaveVideos={handleSaveVideos} />
      )}

      {activeTab === "testimonials" && (
        <TestimonialManager showToast={showToast} triggerRevalidation={triggerRevalidation} />
      )}

      {activeTab === "programs" && (
        <ProgramManager programsList={programsList} setProgramsList={setProgramsList} handleSavePrograms={handleSavePrograms} />
      )}

      {activeTab === "benefits" && (
        <BenefitManager benefitsList={benefitsList} setBenefitsList={setBenefitsList} handleSaveBenefits={handleSaveBenefits} />
      )}

      {activeTab === "faq" && (
        <FAQManager faqsList={faqsList} setFaqsList={setFaqsList} handleSaveFaqs={handleSaveFaqs} />
      )}

      {activeTab === "maintenance" && (
        <MaintenanceSettings
          maintenanceEnabled={maintenanceMode} setMaintenanceEnabled={setMaintenanceMode}
          maintenanceMessage={""} setMaintenanceMessage={() => {}}
          savingMaintenance={savingMaintenance} setSavingMaintenance={() => {}}
          handleSaveMaintenance={handleSaveMaintenance}
        />
      )}
    </div>
  );
}
