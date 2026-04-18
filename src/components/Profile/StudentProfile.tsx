import React from 'react';
import { useTranslation } from 'react-i18next';
import { BriefcaseIcon, AcademicCapIcon, StarIcon, RocketLaunchIcon, UserIcon, TrophyIcon, DocumentTextIcon, PencilSquareIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface StudentProfileProps {
  activeSection: string;
  setActiveSection: (section: any) => void;
  profileData: any;
  currentProfileData: any;
  resumeHeadline: string;
  setResumeHeadline: (value: string) => void;
  profileSummary: string;
  setProfileSummary: (value: string) => void;
  skillsInput: string;
  setSkillsInput: (value: string) => void;
  itSkillsInput: string;
  setItSkillsInput: (value: string) => void;
  isEditingHeadline: boolean;
  setIsEditingHeadline: (value: boolean) => void;
  isEditingSkills: boolean;
  setIsEditingSkills: (value: boolean) => void;
  isEditingItSkills: boolean;
  setIsEditingItSkills: (value: boolean) => void;
  isEditingSummary: boolean;
  setIsEditingSummary: (value: boolean) => void;
  handleSaveHeadline: () => void | Promise<void>;
  handleSaveSkills: () => void | Promise<void>;
  handleSaveItSkills: () => void | Promise<void>;
  handleSaveSummary: () => void | Promise<void>;
  handleResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleResumeDownload: () => void;
  isUploadingResume: boolean;
  employments: any[];
  educations: any[];
  projects: any[];
  accomplishments: any[];
  keySkills: any[];
  itSkills: any[];
  formatDuration: (startDate: string, endDate?: string | null, isCurrent?: boolean) => string;
  setEditingItem: (item: any) => void;
  setIsEmploymentModalOpen: (value: boolean) => void;
  setIsEducationModalOpen: (value: boolean) => void;
  setIsProjectModalOpen: (value: boolean) => void;
  setIsAccomplishmentModalOpen: (value: boolean) => void;
  deleteEmployment: (id: string) => Promise<any>;
  deleteEducation: (id: string) => Promise<any>;
  deleteProject: (id: string) => Promise<any>;
  deleteAccomplishment: (id: string) => Promise<any>;
  refetchFullProfile: () => void;
  t: any;
}

const StudentProfile: React.FC<StudentProfileProps> = (props) => {
  const { t: translation } = useTranslation();
  const t = props.t || translation;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden sticky top-4 h-fit backdrop-blur-sm">
            <div className="bg-gradient-to-br from-[#7f56d9] via-[#6d46ba] to-[#5b3ba5] px-6 py-6">
              <h3 className="font-bold text-white text-lg">{t('profile.quickLinks', { defaultValue: 'Quick Links' })}</h3>
            </div>
            <nav className="p-3 space-y-1">
              {[
                { key: 'resume', label: t('profile.resume') },
                { key: 'resume-headline', label: t('profile.resumeHeadline') },
                { key: 'key-skills', label: t('profile.keySkills') },
                { key: 'employment', label: t('profile.employment') },
                { key: 'education', label: t('profile.education') },
                { key: 'it-skills', label: t('profile.itSkills') },
                { key: 'projects', label: t('profile.projects') },
                { key: 'profile-summary', label: t('profile.profileSummary') },
                { key: 'accomplishments', label: t('profile.accomplishments') },
              ].map((item) => (
                <button key={item.key} onClick={() => props.setActiveSection(item.key)} className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${props.activeSection === item.key ? 'bg-[#7f56d9] text-white shadow-lg' : 'text-gray-700 hover:bg-[#f5f3ff] hover:shadow-md'}`}>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="lg:col-span-3 space-y-6">
          {props.activeSection === 'resume' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><DocumentTextIcon className="w-6 h-6" />{t('profile.resume')}</h2></div>
              <div className="p-6">
                <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx,.rtf" onChange={props.handleResumeUpload} disabled={props.isUploadingResume} />
                <div className="border-2 border-dashed border-[#e0d8f0] rounded-xl p-10 text-center bg-[#f5f3ff]">
                  <button type="button" onClick={() => document.getElementById('resume-upload')?.click()} className="bg-[#7f56d9] text-white px-8 py-3 rounded-xl font-semibold">{props.isUploadingResume ? t('profile.uploading') : t('profile.updateResume')}</button>
                </div>
              </div>
            </div>
          )}

          {props.activeSection === 'resume-headline' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4 flex items-center justify-between"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><PencilSquareIcon className="w-6 h-6" />{t('profile.resumeHeadline')}</h2></div>
              <div className="p-6"><textarea value={props.resumeHeadline} onChange={(e) => props.setResumeHeadline(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none" rows={4} /></div>
            </div>
          )}

          {props.activeSection === 'key-skills' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4 flex items-center justify-between"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><StarIcon className="w-6 h-6" />{t('profile.keySkills')}</h2></div>
              <div className="p-6"><textarea value={props.skillsInput} onChange={(e) => props.setSkillsInput(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none" rows={4} /></div>
            </div>
          )}

          {props.activeSection === 'employment' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><BriefcaseIcon className="w-6 h-6" />{t('profile.employmentHistory')}</h2></div>
              <div className="p-6 space-y-4">{props.employments.map((job) => <div key={job.employment_id} className="bg-[#f5f3ff] rounded-xl p-6 border-2 border-[#e0d8f0]">{job.job_title}</div>)}</div>
            </div>
          )}

          {props.activeSection === 'education' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><AcademicCapIcon className="w-6 h-6" />{t('profile.education')}</h2></div>
              <div className="p-6 space-y-4">{props.educations.map((edu) => <div key={edu.education_id} className="bg-[#f5f3ff] rounded-xl p-6 border-2 border-[#e0d8f0]">{edu.degree}</div>)}</div>
            </div>
          )}

          {props.activeSection === 'it-skills' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><ComputerDesktopIcon className="w-6 h-6" />{t('profile.itSkills')}</h2></div>
              <div className="p-6"><textarea value={props.itSkillsInput} onChange={(e) => props.setItSkillsInput(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none" rows={4} /></div>
            </div>
          )}

          {props.activeSection === 'projects' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><RocketLaunchIcon className="w-6 h-6" />{t('profile.projects')}</h2></div>
              <div className="p-6 space-y-4">{props.projects.map((project) => <div key={project.project_id} className="bg-[#f5f3ff] rounded-xl p-6 border-2 border-[#e0d8f0]">{project.project_title}</div>)}</div>
            </div>
          )}

          {props.activeSection === 'profile-summary' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><UserIcon className="w-6 h-6" />{t('profile.profileSummary')}</h2></div>
              <div className="p-6"><textarea value={props.profileSummary} onChange={(e) => props.setProfileSummary(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none" rows={6} /></div>
            </div>
          )}

          {props.activeSection === 'accomplishments' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#7f56d9] px-6 py-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><TrophyIcon className="w-6 h-6" />{t('profile.accomplishments')}</h2></div>
              <div className="p-6 space-y-4">{props.accomplishments.map((acc) => <div key={acc.accomplishment_id} className="bg-[#f5f3ff] rounded-xl p-6 border-2 border-[#e0d8f0]">{acc.title}</div>)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
