import { useAppSelector } from '@/hooks/hooks';
import {
  ArrowLeft,
  ArrowRight,
  Loader,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type WizardFooterProps = {
  currentStep: number;
  totalSteps: number;

  isSaving: boolean;
  isPublishing: boolean;

  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export default function WizardFooter({
  currentStep,
  totalSteps,
  isSaving,
  isPublishing,
  onPrevious,
  onNext,
  onSaveDraft,
  onPublish,
}: WizardFooterProps) {
  const { t } = useTranslation('common')
  const { theme, isRTL } = useAppSelector((state) => state.settings)
  return (
    <div
      className={`flex items-center justify-between p-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {currentStep > 1 && (
          <button
            onClick={onPrevious}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${theme === 'dark'
                ? 'border-gray-700 hover:bg-gray-800'
                : 'border-gray-300 hover:bg-gray-100'
              }`}
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            {t('previous')}
          </button>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
              ? 'border-gray-700 hover:bg-gray-800'
              : 'border-gray-300 hover:bg-gray-100'
            }`}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              {t('saving')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {t('save_draft')}
            </span>
          )}
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={onNext}
            className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-2"
          >
            {isRTL ? (
              <>
                {t('next')}
                <ArrowLeft className="w-4 h-4" />
              </>
            ) : (
              <>
                {t('next')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {t('publishing')}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {t('publish')}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
