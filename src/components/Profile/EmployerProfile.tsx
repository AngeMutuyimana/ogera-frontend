import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  LinkIcon,
  DevicePhoneMobileIcon,
  PhotoIcon,
  BriefcaseIcon,
  TagIcon,
  MapPinIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import type { FullProfile } from '../../services/api/extendedProfileApi';
import type { UserProfile } from '../../services/api/profileApi';

interface EmployerProfileProps {
  profileData: UserProfile | null;
  fullProfileData: FullProfile | null;
}

type EmployerSection =
  | 'company-info'
  | 'company-description'
  | 'online-presence'
  | 'branding'
  | 'contact'
  | 'hiring-preferences';

const EmployerProfile: React.FC<EmployerProfileProps> = ({ profileData, fullProfileData }) => {
  const { t } = useTranslation();
  const extendedProfile = fullProfileData?.extendedProfile;
  const [activeSection, setActiveSection] = useState<EmployerSection>('company-info');
  const [successMessage, setSuccessMessage] = useState('');

  const [formState, setFormState] = useState({
    companyName: profileData?.full_name || '',
    industry: '',
    companySize: '',
    location: profileData?.preferred_location || '',
    description: extendedProfile?.profile_summary || '',
    websiteUrl: extendedProfile?.social_profiles?.portfolio || '',
    linkedInUrl: extendedProfile?.social_profiles?.linkedin || '',
    businessEmail: profileData?.email || '',
    phoneNumber: profileData?.mobile_number || '',
    preferredJobCategories: '',
    workType: 'hybrid',
  });

  const logoPreview = useMemo(() => profileData?.profile_image_url || '', [profileData?.profile_image_url]);

  const sections: Array<{
    key: EmployerSection;
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: 'company-info', label: t('profile.companyInformation', { defaultValue: 'Company Information' }), icon: <BuildingOfficeIcon className="w-4 h-4" /> },
    { key: 'company-description', label: t('profile.companyDescription', { defaultValue: 'Company Description' }), icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
    { key: 'online-presence', label: t('profile.onlinePresence', { defaultValue: 'Online Presence' }), icon: <GlobeAltIcon className="w-4 h-4" /> },
    { key: 'branding', label: t('profile.branding', { defaultValue: 'Branding' }), icon: <PhotoIcon className="w-4 h-4" /> },
    { key: 'contact', label: t('profile.contactInformation', { defaultValue: 'Contact Information' }), icon: <DevicePhoneMobileIcon className="w-4 h-4" /> },
    { key: 'hiring-preferences', label: t('profile.hiringPreferences', { defaultValue: 'Hiring Preferences' }), icon: <TagIcon className="w-4 h-4" /> },
  ];

  const handleSave = (section: string) => {
    setSuccessMessage(`${section} saved successfully.`);
    toast.success(`${section} updated`);
    window.setTimeout(() => setSuccessMessage(''), 2500);
  };

  const renderSectionCard = (
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode,
    action?: React.ReactNode,
  ) => (
    <Card className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="bg-[#7f56d9] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {icon}
            {title}
          </h2>
          {action}
        </div>
      </div>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );

  const resolveLogo = logoPreview || profileData?.profile_image_url || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-r from-white via-white to-[#f3edff] px-6 py-5 shadow-[0_18px_50px_rgba(127,86,217,0.10)] backdrop-blur-lg sm:px-8 sm:py-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-[#e4dcff] bg-[#f5f0ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f56d9]">
            {t('profile.companyProfile', { defaultValue: 'Company Profile' })}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('profile.companyProfileTitle', { defaultValue: 'Company Profile' })}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            {t('profile.companyProfileDescription', { defaultValue: 'Manage company information, branding, contacts, and hiring preferences with the same sidebar structure used across settings.' })}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6">
          <Alert severity="success">{successMessage}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 items-start">
        <div className="lg:sticky lg:top-4">
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-[0_20px_70px_rgba(127,86,217,0.12)] backdrop-blur-xl">
            <div className="bg-[#5b3ba5] px-4 py-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {t('profile.quickLinks', { defaultValue: 'Quick Links' })}
              </h3>
            </div>
            <nav className="p-3 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${
                    activeSection === section.key
                      ? 'bg-[#7f56d9] text-white shadow-lg shadow-[#7f56d9]/30'
                      : 'text-gray-700 hover:bg-[#f5f3ff] hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`rounded-lg p-2 ${activeSection === section.key ? 'bg-white/20' : 'bg-[#f5f3ff] text-[#5b3ba5]'}`}>
                      {section.icon}
                    </span>
                    <span>{section.label}</span>
                  </span>
                  <span className={`w-2 h-2 rounded-full ${activeSection === section.key ? 'bg-white' : 'bg-transparent'}`} />
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="space-y-6">
          {activeSection === 'company-info' && renderSectionCard(
            t('profile.companyInformation', { defaultValue: 'Company Information' }),
            <BuildingOfficeIcon className="w-6 h-6" />,
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField
                fullWidth
                label={t('profile.companyName', { defaultValue: 'Company Name' })}
                value={formState.companyName}
                onChange={(e) => setFormState((prev) => ({ ...prev, companyName: e.target.value }))}
              />
              <TextField
                fullWidth
                label={t('profile.industry', { defaultValue: 'Industry / Category' })}
                value={formState.industry}
                onChange={(e) => setFormState((prev) => ({ ...prev, industry: e.target.value }))}
              />
              <TextField
                fullWidth
                select
                label={t('profile.companySize', { defaultValue: 'Company Size' })}
                value={formState.companySize}
                onChange={(e) => setFormState((prev) => ({ ...prev, companySize: e.target.value }))}
              >
                <MenuItem value="1-10">1 - 10</MenuItem>
                <MenuItem value="11-50">11 - 50</MenuItem>
                <MenuItem value="51-200">51 - 200</MenuItem>
                <MenuItem value="201-500">201 - 500</MenuItem>
                <MenuItem value="500+">500+</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label={t('profile.location', { defaultValue: 'Location' })}
                value={formState.location}
                onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />
              <div className="md:col-span-2 flex justify-end pt-2">
                <Button variant="contained" style={{ backgroundColor: '#7f56d9' }} onClick={() => handleSave('Company information')}>
                  {t('profile.save', { defaultValue: 'Save Changes' })}
                </Button>
              </div>
            </div>,
          )}

          {activeSection === 'company-description' && renderSectionCard(
            t('profile.companyDescription', { defaultValue: 'Company Description' }),
            <ClipboardDocumentListIcon className="w-6 h-6" />,
            <TextField
              multiline
              minRows={7}
              fullWidth
              label={t('profile.description', { defaultValue: 'Description' })}
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t('profile.companyDescriptionPlaceholder', { defaultValue: 'Describe your company, mission, team, and what makes you distinct.' })}
            />,
            <Button variant="contained" style={{ backgroundColor: '#7f56d9' }} onClick={() => handleSave('Company description')}>
              {t('profile.save', { defaultValue: 'Save Changes' })}
            </Button>,
          )}

          {activeSection === 'online-presence' && renderSectionCard(
            t('profile.onlinePresence', { defaultValue: 'Online Presence' }),
            <GlobeAltIcon className="w-6 h-6" />,
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField
                fullWidth
                label={t('profile.websiteUrl', { defaultValue: 'Website URL' })}
                value={formState.websiteUrl}
                onChange={(e) => setFormState((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label={t('profile.linkedinUrl', { defaultValue: 'LinkedIn URL' })}
                value={formState.linkedInUrl}
                onChange={(e) => setFormState((prev) => ({ ...prev, linkedInUrl: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />
              <div className="md:col-span-2 flex justify-end pt-2">
                <Button variant="contained" style={{ backgroundColor: '#7f56d9' }} onClick={() => handleSave('Online presence')}>
                  {t('profile.save', { defaultValue: 'Save Changes' })}
                </Button>
              </div>
            </div>,
          )}

          {activeSection === 'branding' && renderSectionCard(
            t('profile.branding', { defaultValue: 'Branding' }),
            <PhotoIcon className="w-6 h-6" />,
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-[#f5f3ff] border border-[#e0d8f0] flex items-center justify-center shadow-md">
                {resolveLogo ? (
                  <img src={resolveLogo} alt={formState.companyName || 'Company logo'} className="w-full h-full object-cover" />
                ) : (
                  <BriefcaseIcon className="w-10 h-10 text-[#7f56d9]" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-gray-600 leading-6">
                  {t('profile.companyLogoHint', { defaultValue: 'Upload a logo to personalize your company profile and keep the branding consistent.' })}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="contained" style={{ backgroundColor: '#7f56d9' }} onClick={() => handleSave('Branding')}>
                    {t('profile.uploadLogo', { defaultValue: 'Upload Logo' })}
                  </Button>
                  <Button variant="outlined" onClick={() => handleSave('Branding preview')}>
                    {t('profile.preview', { defaultValue: 'Preview' })}
                  </Button>
                </div>
              </div>
            </div>,
          )}

          {activeSection === 'contact' && renderSectionCard(
            t('profile.contactInformation', { defaultValue: 'Contact Information' }),
            <DevicePhoneMobileIcon className="w-6 h-6" />,
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField
                fullWidth
                label={t('profile.businessEmail', { defaultValue: 'Business Email' })}
                value={formState.businessEmail}
                onChange={(e) => setFormState((prev) => ({ ...prev, businessEmail: e.target.value }))}
              />
              <TextField
                fullWidth
                label={t('profile.phoneNumber', { defaultValue: 'Phone Number' })}
                value={formState.phoneNumber}
                onChange={(e) => setFormState((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />
              <div className="md:col-span-2 flex justify-end pt-2">
                <Button variant="contained" style={{ backgroundColor: '#7f56d9' }} onClick={() => handleSave('Contact information')}>
                  {t('profile.save', { defaultValue: 'Save Changes' })}
                </Button>
              </div>
            </div>,
          )}

          {activeSection === 'hiring-preferences' && renderSectionCard(
            t('profile.hiringPreferences', { defaultValue: 'Hiring Preferences' }),
            <TagIcon className="w-6 h-6" />,
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField
                fullWidth
                label={t('profile.preferredJobCategories', { defaultValue: 'Preferred Job Categories' })}
                value={formState.preferredJobCategories}
                onChange={(e) => setFormState((prev) => ({ ...prev, preferredJobCategories: e.target.value }))}
              />
              <TextField
                select
                fullWidth
                label={t('profile.workType', { defaultValue: 'Work Type' })}
                value={formState.workType}
                onChange={(e) => setFormState((prev) => ({ ...prev, workType: e.target.value }))}
              >
                <MenuItem value="remote">{t('profile.remote', { defaultValue: 'Remote' })}</MenuItem>
                <MenuItem value="on-site">{t('profile.onSite', { defaultValue: 'On-site' })}</MenuItem>
                <MenuItem value="hybrid">{t('profile.hybrid', { defaultValue: 'Hybrid' })}</MenuItem>
              </TextField>
              <div className="md:col-span-2 flex justify-end pt-2">
                <Button variant="contained" style={{ backgroundColor: '#7f56d9' }} onClick={() => handleSave('Hiring preferences')}>
                  {t('profile.save', { defaultValue: 'Save Changes' })}
                </Button>
              </div>
            </div>,
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
