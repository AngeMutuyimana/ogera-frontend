import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  UserGroupIcon,
  PhoneIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

import ProfileHeaderCard from '../components/Profile/ProfileHeaderCard';
import { getUserProfile, type UserProfile } from '../services/api/profileApi';
import { useGetFullProfileQuery } from '../services/api/extendedProfileApi';
import { useGetProfileCompletionQuery } from '../services/api/profileCompletionApi';

interface AccountFormData {
  fullName: string;
  email: string;
  phone: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
}

type AccountSection = 'overview' | 'business' | 'preferences' | 'team';

const EmployerSettingsAccount: React.FC = () => {
  const { t, i18n } = useTranslation();
  const user = useSelector((state: any) => state.auth.user);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<AccountSection>('overview');

  // State management
  const [accountData, setAccountData] = useState<AccountFormData>({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNotifications: true,
    inAppNotifications: true,
  });

  const [teamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: fullProfileData, refetch: refetchFullProfile } = useGetFullProfileQuery();
  const { data: profileCompletionData, refetch: refetchProfileCompletion } = useGetProfileCompletionQuery();

  useEffect(() => {
    // Load account data
    setLoading(true);
    // TODO: Fetch account data from backend
    // For now, immediately set loading to false
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await getUserProfile();
        if (active) {
          setProfileData(response.data);
        }
      } catch (error) {
        if (active) {
          setProfileData(null);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleProfileDataRefresh = async () => {
    await Promise.all([
      refetchFullProfile(),
      refetchProfileCompletion(),
    ]);

    try {
      const response = await getUserProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to refresh profile data:', error);
    }
  };

  // Handle account form changes
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle notification preference changes
  const handleNotificationChange = (field: keyof NotificationPreferences) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save account information
  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      // TODO: Call API to save account data
      setSuccessMessage(t('common.saved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  // Save notification preferences
  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // TODO: Call API to save notification preferences
      setSuccessMessage(t('common.saved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const accountSidebarItems: Array<{
    key: AccountSection;
    label: string;
    icon: React.ReactNode;
    action?: string;
  }> = [
    { key: 'overview', label: t('settings.accountOverview'), icon: <UserIcon className="w-4 h-4" /> },
    { key: 'business', label: t('settings.businessOperations'), icon: <BuildingOfficeIcon className="w-4 h-4" /> },
    { key: 'preferences', label: t('settings.preferences'), icon: <BellIcon className="w-4 h-4" /> },
    { key: 'team', label: t('settings.teamManagement'), icon: <UserGroupIcon className="w-4 h-4" /> },
  ];

  const renderOverviewSection = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#7f56d9] px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserIcon className="w-6 h-6" />
            {t('settings.accountOverview')}
          </h2>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.fullName')}
            </label>
            <TextField
              fullWidth
              size="small"
              name="fullName"
              value={accountData.fullName}
              onChange={handleAccountChange}
              placeholder={t('settings.enterFullName')}
              variant="outlined"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.email')}
            </label>
            <TextField
              fullWidth
              size="small"
              name="email"
              type="email"
              value={accountData.email}
              onChange={handleAccountChange}
              disabled
              variant="outlined"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('settings.emailCannotChange')}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.phoneNumber')}
          </label>
          <TextField
            fullWidth
            size="small"
            name="phone"
            value={accountData.phone}
            onChange={handleAccountChange}
            placeholder={t('settings.enterPhoneNumber')}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="contained"
            style={{ backgroundColor: '#7f56d9' }}
            disabled={saving}
            onClick={handleSaveAccount}
          >
            {saving ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBusinessSection = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#7f56d9] px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BuildingOfficeIcon className="w-6 h-6" />
            {t('settings.businessOperations')}
          </h2>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {t('settings.companyName')}
            </h3>
            <p className="text-gray-900">{user?.company_name || 'N/A'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {t('settings.subscriptionPlan')}
            </h3>
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {t('settings.subscriptionPro')}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            {t('settings.accountStats')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-medium text-blue-600 uppercase">
                {t('settings.activeJobs')}
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">5/10</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase">
                {t('settings.billingStatus')}
              </p>
              <p className="text-lg font-bold text-green-900 mt-1">
                {t('settings.active')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase">
                {t('settings.paymentMethod')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <CreditCardIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  {t('settings.creditCard')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#7f56d9] px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BellIcon className="w-6 h-6" />
            {t('settings.preferences')}
          </h2>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="pb-5 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {t('settings.language')}
          </h3>
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="sw">Kiswahili</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            {t('settings.notificationSettings')}
          </h3>

          <FormControlLabel
            control={
              <Switch
                checked={notifications.emailNotifications}
                onChange={() => handleNotificationChange('emailNotifications')}
              />
            }
            label={
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t('settings.emailNotifications')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('settings.emailNotificationsDesc')}
                </p>
              </div>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={notifications.inAppNotifications}
                onChange={() => handleNotificationChange('inAppNotifications')}
              />
            }
            label={
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t('settings.inAppNotifications')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('settings.inAppNotificationsDesc')}
                </p>
              </div>
            }
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="contained"
            style={{ backgroundColor: '#7f56d9' }}
            disabled={saving}
            onClick={handleSaveNotifications}
          >
            {saving ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTeamSection = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#7f56d9] px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6" />
            {t('settings.teamManagement')}
          </h2>
          <Button
            variant="contained"
            style={{ backgroundColor: '#fff' }}
            sx={{ color: '#7f56d9' }}
          >
            + {t('settings.addTeamMember')}
          </Button>
        </div>
      </div>
      <div className="p-6">
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('settings.noTeamMembers')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t('settings.name')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t('settings.email')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t('settings.role')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t('settings.joinDate')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t('settings.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{member.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-block px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.joinDate}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-red-600 hover:text-red-700 font-medium">
                        {t('common.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f4ff]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#7f56d9]/15 blur-3xl" />
        <div className="absolute right-[-5rem] top-40 h-80 w-80 rounded-full bg-[#5b3ba5]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(127,86,217,0.08),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(91,59,165,0.08),_transparent_30%),linear-gradient(to_bottom,_rgba(255,255,255,0.7),_rgba(255,255,255,0.88))]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(127,86,217,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(127,86,217,0.16)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>
      <div className="overflow-y-auto p-4 md:p-8">
        <ProfileHeaderCard
          profileData={profileData || user}
          fullProfileData={fullProfileData?.data || null}
          profileCompletion={profileCompletionData?.data?.profile_completion_percentage || 0}
          wrapperClassName="mb-8"
          contentClassName="w-full px-0 py-6"
          onProfileDataRefresh={handleProfileDataRefresh}
        />

        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-5xl overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-r from-white/90 via-white/75 to-[#f3edff]/90 px-6 py-5 shadow-[0_18px_50px_rgba(127,86,217,0.10)] backdrop-blur-lg sm:px-8 sm:py-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-[#e4dcff] bg-[#f5f0ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f56d9]">
                {t('settings.account')}
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('settings.account')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                {t('settings.accountDescription')}
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {(successMessage || errorMessage) && (
            <div className="mb-6 space-y-4">
              {successMessage && (
                <Alert severity="success">
                  {successMessage}
                </Alert>
              )}
              {errorMessage && (
                <Alert severity="error">
                  {errorMessage}
                </Alert>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
            <div className="lg:sticky lg:top-4">
              <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/80 shadow-[0_20px_70px_rgba(127,86,217,0.12)] backdrop-blur-xl">
                <div className="bg-[#5b3ba5] px-4 py-3">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {t('profile.quickLinks', { defaultValue: 'Quick Links' })}
                  </h3>
                </div>
                <nav className="p-3 space-y-1">
                  {accountSidebarItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${
                        activeSection === item.key
                          ? 'bg-[#7f56d9] text-white shadow-lg'
                          : 'text-gray-700 hover:bg-[#f5f3ff] hover:shadow-md'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className={`w-2 h-2 rounded-full ${activeSection === item.key ? 'bg-white' : 'bg-transparent'}`} />
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/75 shadow-[0_20px_70px_rgba(127,86,217,0.10)] backdrop-blur-xl">
                <div className="p-3 sm:p-4 md:p-6">
                  {activeSection === 'overview' && renderOverviewSection()}
                  {activeSection === 'business' && renderBusinessSection()}
                  {activeSection === 'preferences' && renderPreferencesSection()}
                  {activeSection === 'team' && renderTeamSection()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerSettingsAccount;
