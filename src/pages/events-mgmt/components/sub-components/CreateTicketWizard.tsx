import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCreateSignedUrlMutation, useCreateTicketMutation, useUpdateTicketMutation } from "@/store/api/eventMutationApi";

import clsx from "clsx";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


interface CreateTicketWizardProps {
  setShowTicketModal: (v: boolean) => void;
  setEditingTicket: (v: any) => void;
  theme: Theme;
  editingTicket: TicketPayload;
  tickets: any;
  eventId: string | null;
  refetch: () => void;
}

const CreateTicketWizard = ({
  setShowTicketModal,
  setEditingTicket,
  theme,
  editingTicket,
  tickets,
  eventId,
  refetch,
}: CreateTicketWizardProps) => {
  const { t } = useTranslation('events');
  const { cardClasses, textPrimary, textSecondary, inputClasses, textTertiary } = useThemeClasses();

  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [createTicket, { isLoading: isSaving }] = useCreateTicketMutation()
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation()

  const [file, setFile] = useState<File | null>(null)
  const [mediaURL, setMediaURL] = useState<GcsFileUpload>({ signedUrl: "", gcsURL: "" })

  const saveTicket = async (ticket: TicketPayload) => {
    if (eventId) {
      const payload: TicketPayload = {
        name: ticket.name,
        description: ticket.description,
        eventId: eventId,
        price: {
          markedPrice: ticket.price.markedPrice,
          sellingPrice: ticket.price.sellingPrice,
          discountPercent: 0,
          discountAmount: 0,
        },
        quantity: {
          initial: ticket.quantity.initial,
          sold: 0,
          remaining: ticket.quantity.remaining,
          isUnlimited: ticket.quantity.isUnlimited,
          perUserLimit: ticket.quantity.perUserLimit,
        },
        images: [{
          image: mediaURL.gcsURL
        }],
        status: "active",
        type: ticket.type.toUpperCase(),
      }

      // if (file && mediaURL.signedUrl) {
      //   const uploadImageRes = await fetch(mediaURL.signedUrl, {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": file.type, // important!
      //     },
      //     body: file,
      //   });

      //   if (!uploadImageRes.ok) {
      //     toast.error("Upload failed");
      //   } else {
      //     toast.success("Upload successful!");
      //   }
      // }

      const res = ticket._id ? await updateTicket({body: payload, ticketId: ticket?._id}).unwrap() : await createTicket(payload).unwrap()
      if (res?.message) {
        toast.success(res?.message || "Ticket created successfully")
        refetch()
      }

      setShowTicketModal(false);
      setEditingTicket(null);
    }
  };

  useEffect(() => {
    if (file) {
      async function generateSignedUrlForImage() {
        const payload = ([{
          originalName: file ? file.name : "",
          mimeType: file ? file.type : "",
        }]);

        const res = await createSignedUrl(payload);

        if (res?.data?.length > 0) {
          setMediaURL({
            signedUrl: res.data[0]?.signedUrl,
            gcsURL: res.data[0]?.gcsURL,
          })
        }
      }
      generateSignedUrlForImage();
    }
  }, [file]);




  return (
    <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-xl ${cardClasses} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl ${textPrimary}`}>
            {editingTicket?._id && tickets?.find((t: any) => t._id === editingTicket._id)
              ? t('edit_ticket')
              : t('create_ticket')}
          </h3>
          <button
            onClick={() => {
              setShowTicketModal(false);
              setEditingTicket(null);
            }}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
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
              className={`border-2 border-dashed rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'
                }`}
            >
              {editingTicket?.images ? (
                <div className="relative">
                  <img
                    src={editingTicket?.images[0].image}
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
                        setFile(file);
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
                  className={`px-4 py-2 rounded-lg border capitalize transition-colors ${editingTicket?.type.toLowerCase() === type
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

          {editingTicket?.type.toLowerCase() !== 'free' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>{t('marked_price')} (₪)</label>
                <input
                  type="number"
                  value={editingTicket?.price?.markedPrice || ''}
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      price: { ...editingTicket.price, markedPrice: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>{t('selling_price')} (₪)</label>
                <input
                  type="number"
                  value={editingTicket?.price?.sellingPrice || ''}
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      price: { ...editingTicket.price, sellingPrice: parseFloat(e.target.value) || 0 },
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
                value={editingTicket?.quantity.initial || ''}
                onChange={(e) =>
                  setEditingTicket({
                    ...editingTicket,
                    quantity: { ...editingTicket.quantity, initial: parseInt(e.target.value) || 0, }
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>{t('per_user_limit')}</label>
              <input
                type="number"
                value={editingTicket?.quantity?.perUserLimit || ''}
                onChange={(e) =>
                  setEditingTicket({
                    ...editingTicket,
                    quantity: { ...editingTicket.quantity, perUserLimit: parseInt(e.target.value) || 0, }
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
              className={`px-4 py-2 cursor-pointer rounded-lg border transition-colors ${theme === 'dark'
                ? 'border-gray-700 hover:bg-gray-800'
                : 'border-gray-300 hover:bg-gray-100'
                }`}
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => saveTicket(editingTicket)}
              className={clsx(
                "px-6 py-2 rounded-lg transition-colors",
                (isSaving || isUpdating) ? "cursor-not-allowed bg-gray-400 text-black" : " bg-teal-600 hover:bg-teal-700 text-white cursor-pointer "
              )}
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