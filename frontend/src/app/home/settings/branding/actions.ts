'use server'

import { httpPut, httpPost, httpDelete } from "@/_lib/server/query-api";
import { pushToast } from "@/_lib/server/pushToast";
import { redirect } from "next/navigation";
import { IBrandingOptions, IServiceItem, IStatItem, ITipItem, IAboutFeature, ISectionVisibilityOptions, IGallerySectionOptions, IGalleryPhotoItem, ISocialLinkItem } from "./model";

export async function updateBranding(formData: FormData) {
    // Handle logo file upload
    const logoFile = formData.get('logo') as File | null;
    let logoBase64: string | null = null;
    let logoMimeType: string | null = null;

    if (logoFile && logoFile.size > 0) {
        const buffer = await logoFile.arrayBuffer();
        logoBase64 = Buffer.from(buffer).toString('base64');
        logoMimeType = logoFile.type;
    }

    const body: IBrandingOptions = {
        logoBase64,
        logoMimeType,
        portalColors: {
            sidebarBg: formData.get('portalSidebarBg')?.toString() || '#111827',
            sidebarText: formData.get('portalSidebarText')?.toString() || '#9ca3af',
            sidebarActiveBg: formData.get('portalSidebarActiveBg')?.toString() || '#1f2937',
            sidebarActiveText: formData.get('portalSidebarActiveText')?.toString() || '#ffffff',
            accentColor: formData.get('portalAccentColor')?.toString() || '#4f46e5',
            contentBg: formData.get('portalContentBg')?.toString() || '#f9fafb',
        },
        landingColors: {
            primaryColor: formData.get('landingPrimaryColor')?.toString() || '#7c3aed',
            secondaryColor: formData.get('landingSecondaryColor')?.toString() || '#22c55e',
            accentColor: formData.get('landingAccentColor')?.toString() || '#5b21b6',
            headerBg: formData.get('landingHeaderBg')?.toString() || '#0f172a',
            footerBg: formData.get('landingFooterBg')?.toString() || '#0f172a',
        }
    };

    await httpPut({ url: 'branding', body });

    pushToast('Ustawienia marki zostały zaktualizowane.');
    redirect('/home/settings/branding');
}

export async function updateHero(formData: FormData) {
    // Handle background image upload
    const bgFile = formData.get('backgroundImage') as File | null;
    let backgroundImageBase64: string | null = null;
    let backgroundImageMimeType: string | null = null;

    if (bgFile && bgFile.size > 0) {
        const buffer = await bgFile.arrayBuffer();
        backgroundImageBase64 = Buffer.from(buffer).toString('base64');
        backgroundImageMimeType = bgFile.type;
    }

    const body = {
        companyName: formData.get('companyName')?.toString() || '',
        tagline: formData.get('tagline')?.toString() || null,
        subtitle: formData.get('subtitle')?.toString() || null,
        specialtyText: formData.get('specialtyText')?.toString() || null,
        ctaPrimaryText: formData.get('ctaPrimaryText')?.toString() || 'Nasze usługi',
        ctaPrimaryLink: formData.get('ctaPrimaryLink')?.toString() || '#services',
        ctaSecondaryText: formData.get('ctaSecondaryText')?.toString() || 'Skontaktuj się',
        ctaSecondaryLink: formData.get('ctaSecondaryLink')?.toString() || '#contact',
        backgroundImageBase64,
        backgroundImageMimeType,
    };

    await httpPut({ url: 'branding/hero', body });

    pushToast('Sekcja główna została zaktualizowana.');
    redirect('/home/settings/landing');
}

export async function updateAbout(formData: FormData) {
    const body = {
        sectionLabel: formData.get('sectionLabel')?.toString() || 'O nas',
        headline: formData.get('headline')?.toString() || '',
        description: formData.get('description')?.toString() || null,
        secondaryDescription: formData.get('secondaryDescription')?.toString() || null,
    };

    await httpPut({ url: 'branding/about', body });

    pushToast('Sekcja „O nas” została zaktualizowana.');
    redirect('/home/settings/landing');
}

export async function updateTipsSection(formData: FormData) {
    const body = {
        isVisible: formData.get('isVisible') === 'on',
        sectionLabel: formData.get('sectionLabel')?.toString() || 'Porady ekspertów',
        headline: formData.get('headline')?.toString() || 'Porady motoryzacyjne',
        description: formData.get('description')?.toString() || null,
    };

    await httpPut({ url: 'branding/tips-section', body });

    pushToast('Sekcja porad została zaktualizowana.');
    redirect('/home/settings/landing');
}

export async function updateFooter(formData: FormData) {
    const body = {
        companyDescription: formData.get('companyDescription')?.toString() || null,
        showQuickLinks: formData.get('showQuickLinks') === 'on',
        showContactInfo: formData.get('showContactInfo') === 'on',
        copyrightText: formData.get('copyrightText')?.toString() || null,
    };

    await httpPut({ url: 'branding/footer', body });

    pushToast('Stopka została zaktualizowana.');
    redirect('/home/settings/landing');
}

export async function updateContact(formData: FormData) {
    // Parse business hours from form
    const businessHours = [];
    const days = [
        { key: 'Monday', label: 'Poniedziałek' },
        { key: 'Tuesday', label: 'Wtorek' },
        { key: 'Wednesday', label: 'Środa' },
        { key: 'Thursday', label: 'Czwartek' },
        { key: 'Friday', label: 'Piątek' },
        { key: 'Saturday', label: 'Sobota' },
        { key: 'Sunday', label: 'Niedziela' },
    ];

    for (const { key, label } of days) {
        const open = formData.get(`hours_${key}_open`)?.toString() || 'Zamknięte';
        const close = formData.get(`hours_${key}_close`)?.toString() || 'Zamknięte';
        businessHours.push({ day: label, open, close });
    }

    const body = {
        sectionLabel: formData.get('sectionLabel')?.toString() || 'Skontaktuj się z nami',
        headline: formData.get('headline')?.toString() || 'Kontakt',
        description: formData.get('description')?.toString() || null,
        showTowing: formData.get('showTowing') === 'on',
        towingText: formData.get('towingText')?.toString() || 'Dostępna pomoc drogowa — zadzwoń do nas!',
        businessHours,
    };

    await httpPut({ url: 'branding/contact', body });

    pushToast('Sekcja kontaktowa została zaktualizowana.');
    redirect('/home/settings/landing');
}

// Services CRUD
export async function createService(formData: FormData) {
    const body: Partial<IServiceItem> = {
        iconName: formData.get('iconName')?.toString() || 'WrenchIcon',
        title: formData.get('title')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        usePrimaryColor: formData.get('usePrimaryColor') === 'on',
        isActive: formData.get('isActive') === 'on',
    };

    await httpPost({ url: 'branding/services', body });

    pushToast('Usługa została utworzona.');
    redirect('/home/settings/landing/services');
}

export async function updateService(formData: FormData) {
    const id = formData.get('id')?.toString();
    const body: Partial<IServiceItem> = {
        iconName: formData.get('iconName')?.toString() || 'WrenchIcon',
        title: formData.get('title')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        usePrimaryColor: formData.get('usePrimaryColor') === 'on',
        isActive: formData.get('isActive') === 'on',
    };

    await httpPut({ url: `branding/services/${id}`, body });

    pushToast('Usługa została zaktualizowana.');
    redirect('/home/settings/landing/services');
}

export async function deleteService(formData: FormData) {
    const id = formData.get('id')?.toString();

    await httpDelete({ url: `branding/services/${id}`, body: {} });

    pushToast('Usługa została usunięta.');
    redirect('/home/settings/landing/services');
}

export async function reorderServices(formData: FormData) {
    const orderJson = formData.get('order')?.toString();
    if (orderJson) {
        const order = JSON.parse(orderJson);
        await httpPut({ url: 'branding/services/reorder', body: { order } });
    }
    redirect('/home/settings/landing/services');
}

// Stats CRUD
export async function createStat(formData: FormData) {
    const body: Partial<IStatItem> = {
        value: formData.get('value')?.toString() || '',
        label: formData.get('label')?.toString() || '',
    };

    await httpPost({ url: 'branding/stats', body });

    pushToast('Statystyka została utworzona.');
    redirect('/home/settings/landing/stats');
}

export async function updateStat(formData: FormData) {
    const id = formData.get('id')?.toString();
    const body: Partial<IStatItem> = {
        value: formData.get('value')?.toString() || '',
        label: formData.get('label')?.toString() || '',
    };

    await httpPut({ url: `branding/stats/${id}`, body });

    pushToast('Statystyka została zaktualizowana.');
    redirect('/home/settings/landing/stats');
}

export async function deleteStat(formData: FormData) {
    const id = formData.get('id')?.toString();

    await httpDelete({ url: `branding/stats/${id}`, body: {} });

    pushToast('Statystyka została usunięta.');
    redirect('/home/settings/landing/stats');
}

export async function reorderStats(formData: FormData) {
    const orderJson = formData.get('order')?.toString();
    if (orderJson) {
        const order = JSON.parse(orderJson);
        await httpPut({ url: 'branding/stats/reorder', body: { order } });
    }
    redirect('/home/settings/landing/stats');
}

// Tips CRUD
export async function createTip(formData: FormData) {
    const body: Partial<ITipItem> = {
        title: formData.get('title')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        isActive: formData.get('isActive') === 'on',
    };

    await httpPost({ url: 'branding/tips', body });

    pushToast('Porada została utworzona.');
    redirect('/home/settings/landing/tips');
}

export async function updateTip(formData: FormData) {
    const id = formData.get('id')?.toString();
    const body: Partial<ITipItem> = {
        title: formData.get('title')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        isActive: formData.get('isActive') === 'on',
    };

    await httpPut({ url: `branding/tips/${id}`, body });

    pushToast('Porada została zaktualizowana.');
    redirect('/home/settings/landing/tips');
}

export async function deleteTip(formData: FormData) {
    const id = formData.get('id')?.toString();

    await httpDelete({ url: `branding/tips/${id}`, body: {} });

    pushToast('Porada została usunięta.');
    redirect('/home/settings/landing/tips');
}

export async function reorderTips(formData: FormData) {
    const orderJson = formData.get('order')?.toString();
    if (orderJson) {
        const order = JSON.parse(orderJson);
        await httpPut({ url: 'branding/tips/reorder', body: { order } });
    }
    redirect('/home/settings/landing/tips');
}

// About Features CRUD
export async function createAboutFeature(formData: FormData) {
    const body: Partial<IAboutFeature> = {
        text: formData.get('text')?.toString() || '',
    };

    await httpPost({ url: 'branding/about/features', body });

    pushToast('Wyróżnik został utworzony.');
    redirect('/home/settings/landing/about');
}

export async function updateAboutFeature(formData: FormData) {
    const id = formData.get('id')?.toString();
    const body: Partial<IAboutFeature> = {
        text: formData.get('text')?.toString() || '',
    };

    await httpPut({ url: `branding/about/features/${id}`, body });

    pushToast('Wyróżnik został zaktualizowany.');
    redirect('/home/settings/landing/about');
}

export async function deleteAboutFeature(formData: FormData) {
    const id = formData.get('id')?.toString();

    await httpDelete({ url: `branding/about/features/${id}`, body: {} });

    pushToast('Wyróżnik został usunięty.');
    redirect('/home/settings/landing/about');
}

export async function reorderAboutFeatures(formData: FormData) {
    const orderJson = formData.get('order')?.toString();
    if (orderJson) {
        const order = JSON.parse(orderJson);
        await httpPut({ url: 'branding/about/features/reorder', body: { order } });
    }
    redirect('/home/settings/landing/about');
}

// Section Visibility
export async function updateSectionVisibility(formData: FormData) {
    const body: ISectionVisibilityOptions = {
        heroVisible: formData.get('heroVisible') === 'on',
        servicesVisible: formData.get('servicesVisible') === 'on',
        aboutVisible: formData.get('aboutVisible') === 'on',
        statsVisible: formData.get('statsVisible') === 'on',
        tipsVisible: formData.get('tipsVisible') === 'on',
        galleryVisible: formData.get('galleryVisible') === 'on',
        contactVisible: formData.get('contactVisible') === 'on',
    };

    await httpPut({ url: 'branding/section-visibility', body });

    pushToast('Widoczność sekcji została zaktualizowana.');
    redirect('/home/settings/landing/visibility');
}

// Gallery Section
export async function updateGallerySection(formData: FormData) {
    const body: IGallerySectionOptions = {
        sectionLabel: formData.get('sectionLabel')?.toString() || 'Nasze realizacje',
        headline: formData.get('headline')?.toString() || 'Galeria zdjęć',
        description: formData.get('description')?.toString() || null,
    };

    await httpPut({ url: 'branding/gallery-section', body });

    pushToast('Sekcja galerii została zaktualizowana.');
    redirect('/home/settings/landing/gallery');
}

// Gallery Photos CRUD
export async function createGalleryPhoto(formData: FormData) {
    const imageFile = formData.get('image') as File | null;
    let imageBase64: string | null = null;
    let imageMimeType: string | null = null;

    if (imageFile && imageFile.size > 0) {
        const buffer = await imageFile.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
        imageMimeType = imageFile.type;
    }

    const body: Partial<IGalleryPhotoItem> = {
        imageBase64,
        imageMimeType,
        caption: formData.get('caption')?.toString() || null,
        isActive: formData.get('isActive') === 'on',
    };

    await httpPost({ url: 'branding/gallery-photos', body });

    pushToast('Zdjęcie zostało dodane.');
    redirect('/home/settings/landing/gallery');
}

export async function updateGalleryPhoto(formData: FormData) {
    const id = formData.get('id')?.toString();
    const imageFile = formData.get('image') as File | null;
    let imageBase64: string | null = null;
    let imageMimeType: string | null = null;

    if (imageFile && imageFile.size > 0) {
        const buffer = await imageFile.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
        imageMimeType = imageFile.type;
    }

    const body: Partial<IGalleryPhotoItem> = {
        imageBase64,
        imageMimeType,
        caption: formData.get('caption')?.toString() || null,
        isActive: formData.get('isActive') === 'on',
    };

    await httpPut({ url: `branding/gallery-photos/${id}`, body });

    pushToast('Zdjęcie zostało zaktualizowane.');
    redirect('/home/settings/landing/gallery');
}

export async function deleteGalleryPhoto(formData: FormData) {
    const id = formData.get('id')?.toString();

    await httpDelete({ url: `branding/gallery-photos/${id}`, body: {} });

    pushToast('Zdjęcie zostało usunięte.');
    redirect('/home/settings/landing/gallery');
}

export async function reorderGalleryPhotos(formData: FormData) {
    const orderJson = formData.get('order')?.toString();
    if (orderJson) {
        const order = JSON.parse(orderJson);
        await httpPut({ url: 'branding/gallery-photos/reorder', body: order });
    }
    redirect('/home/settings/landing/gallery');
}

// Social Links CRUD
export async function createSocialLink(formData: FormData) {
    const body: Partial<ISocialLinkItem> = {
        platform: formData.get('platform')?.toString() || 'custom',
        url: formData.get('url')?.toString() || '',
        displayName: formData.get('displayName')?.toString() || null,
        iconName: formData.get('iconName')?.toString() || null,
        isActive: formData.get('isActive') === 'on',
        showInHeader: formData.get('showInHeader') === 'on',
        showInFooter: formData.get('showInFooter') === 'on',
    };

    await httpPost({ url: 'branding/social-links', body });

    pushToast('Link społecznościowy został utworzony.');
    redirect('/home/settings/landing/social');
}

export async function updateSocialLink(formData: FormData) {
    const id = formData.get('id')?.toString();
    const body: Partial<ISocialLinkItem> = {
        platform: formData.get('platform')?.toString() || 'custom',
        url: formData.get('url')?.toString() || '',
        displayName: formData.get('displayName')?.toString() || null,
        iconName: formData.get('iconName')?.toString() || null,
        isActive: formData.get('isActive') === 'on',
        showInHeader: formData.get('showInHeader') === 'on',
        showInFooter: formData.get('showInFooter') === 'on',
    };

    await httpPut({ url: `branding/social-links/${id}`, body });

    pushToast('Link społecznościowy został zaktualizowany.');
    redirect('/home/settings/landing/social');
}

export async function deleteSocialLink(formData: FormData) {
    const id = formData.get('id')?.toString();

    await httpDelete({ url: `branding/social-links/${id}`, body: {} });

    pushToast('Link społecznościowy został usunięty.');
    redirect('/home/settings/landing/social');
}

export async function reorderSocialLinks(formData: FormData) {
    const orderJson = formData.get('order')?.toString();
    if (orderJson) {
        const order = JSON.parse(orderJson);
        await httpPut({ url: 'branding/social-links/reorder', body: order });
    }
    redirect('/home/settings/landing/social');
}
