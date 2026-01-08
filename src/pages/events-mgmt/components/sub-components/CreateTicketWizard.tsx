import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreateTicketWizardProps {
  setShowTicketModal: (v: boolean) => void;
  setEditingTicket: (v: any) => void;
  theme: Theme;
  editingTicket: any;
  tickets: any;
  setTickets: any;
}

const CreateTicketWizard = ({
  setShowTicketModal,
  setEditingTicket,
  theme,
  editingTicket,
  tickets,
  setTickets,
}: CreateTicketWizardProps) => {
  const { t } = useTranslation('events');
  const { cardClasses, textPrimary, textSecondary, inputClasses, textTertiary } = useThemeClasses();

  const saveTicket = (ticket: TicketData) => {
    if (tickets.find((t: any) => t.id === ticket.id)) {
      setTickets(tickets.map((t: any) => (t.id === ticket.id ? ticket : t)));
    } else {
      setTickets([...tickets, ticket]);
    }
    setShowTicketModal(false);
    setEditingTicket(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-xl ${cardClasses} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl ${textPrimary}`}>
            {editingTicket?.id && tickets.find((t: any) => t.id === editingTicket.id)
              ? t('edit_ticket')
              : t('create_ticket')}
          </h3>
          <button
            onClick={() => {
              setShowTicketModal(false);
              setEditingTicket(null);
            }}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>{t('ticket_name')}</label>
            <input
              type="text"
              value={editingTicket?.name || ''}
              onChange={(e) => setEditingTicket({ ...editingTicket, name: e.target.value })}
              placeholder={t('general_admission')}
              className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
            />
          </div>

          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>{t('description')}</label>
            <textarea
              value={editingTicket?.description || ''}
              onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
              placeholder={t('enter_ticket_description') || 'Enter ticket description...'}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
            />
          </div>

          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>{t('ticket_image')}</label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'
              }`}
            >
              {editingTicket?.image ? (
                <div className="relative">
                  <img
                    src={editingTicket.image}
                    alt="Ticket preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setEditingTicket({ ...editingTicket, image: undefined })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className={`w-10 h-10 mx-auto mb-2 ${textTertiary}`} />
                  <p className={`text-sm ${textSecondary} mb-2`}>{t('click_to_upload_or_drag')}</p>
                  <p className={`text-xs ${textTertiary} mb-3`}>{t('supported_formats')}</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingTicket({ ...editingTicket, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="ticket-image-upload"
                  />
                  <label
                    htmlFor="ticket-image-upload"
                    className="inline-block px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg cursor-pointer transition-colors"
                  >
                    {t('browse_files')}
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>{t('ticket_type')}</label>
            <div className="grid grid-cols-3 gap-3">
              {(['free', 'paid', 'vip'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setEditingTicket({ ...editingTicket, type })}
                  className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                    editingTicket?.type === type
                      ? 'border-teal-500 bg-teal-500/10 text-teal-500'
                      : theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-800'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t(type)}
                </button>
              ))}
            </div>
          </div>

          {editingTicket?.type !== 'free' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>{t('marked_price')} (₪)</label>
                <input
                  type="number"
                  value={editingTicket?.markedPrice || ''}
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      markedPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>{t('selling_price')} (₪)</label>
                <input
                  type="number"
                  value={editingTicket?.sellingPrice || ''}
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      sellingPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>{t('quantity')}</label>
              <input
                type="number"
                value={editingTicket?.quantity || ''}
                onChange={(e) =>
                  setEditingTicket({
                    ...editingTicket,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>{t('per_user_limit')}</label>
              <input
                type="number"
                value={editingTicket?.perUserLimit || ''}
                onChange={(e) =>
                  setEditingTicket({
                    ...editingTicket,
                    perUserLimit: parseInt(e.target.value) || 0,
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowTicketModal(false);
                setEditingTicket(null);
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'border-gray-700 hover:bg-gray-800'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => saveTicket(editingTicket)}
              className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              {t('save_ticket')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketWizard;