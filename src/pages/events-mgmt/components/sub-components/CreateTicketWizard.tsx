
import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Upload, X } from "lucide-react";

import { uploadWithProgress } from "@/helpers";
import { Spinner } from "@/components/shared";
import { formatDate } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCreateSignedUrlMutation, useCreateTicketMutation, useUpdateTicketMutation } from "@/store/api/eventMutationApi";


interface CreateTicketWizardProps {
  opMode: TTicketOpMode;
  setShowTicketModal: (v: boolean) => void;
  setEditingTicket: (v: any) => void;
  theme: Theme;
  editingTicket: ITicketPayload;
  eventId: string | null;
  refetch: () => void;
  setCurrentStep: (v: number) => void;
  eventDays: EventDay[];
}

const modelTitle = (mode: TTicketOpMode, t: (key: string) => string) => {
  switch (mode) {
    case "CREATE":
      return t('create_ticket');
    case "UPDATE":
      return t('edit_ticket')
    case "DUPLICATE":
      return t('duplicate_ticket');
    default: return
  }
}


const CreateTicketWizard = ({
  setShowTicketModal,
  setEditingTicket,
  theme,
  editingTicket,
  eventId,
  refetch,
  opMode,
  setCurrentStep,
  eventDays,
}: CreateTicketWizardProps) => {
  const { t } = useTranslation('events');
  const { cardClasses, textPrimary, textSecondary, inputClasses, textTertiary } = useThemeClasses();

  const [createSignedUrl] = useCreateSignedUrlMutation();

  const [progress, setProgress] = useState(0);
  const [createTicket, { isLoading: isSaving }] = useCreateTicketMutation()
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation()
  const [ticketDateTime, setTicketDateTime] = useState<ITicketDateTime[]>([
    { id: 1, date: eventDays?.[0].date, startTime: eventDays[0].startTime, endTime: eventDays[0].endTime }
  ]);
  const [file, setFile] = useState<File | null>(null)
  const [mediaURL, setMediaURL] = useState<GcsFileUpload>({ signedUrl: "", gcsURL: "" })

  const saveTicket = async (ticket: ITicketPayload) => {
    if (!eventId) {
      toast.error("Event ID is missing");
      setCurrentStep(1)
      return;
    }
    const payload: ITicketPayload = {
      eventId,
      name: ticket.name,
      description: ticket.description,
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
      dayDescription: ticketDateTime?.map(item => ({
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime
      })),
      images: [{
        image: mediaURL.gcsURL
      }],
      status: "active",
      type: ticket.type.toUpperCase(),
    }

    if (file && mediaURL.signedUrl) {
      try {
        setProgress(0);
        await uploadWithProgress(file, mediaURL?.signedUrl, setProgress);
        setFile(null)
        toast.success("Image has been uploaded successfully!");
      } catch {
        toast.error("Image upload failed! Please try again...");
      }
    }

    const res = ticket._id ? await updateTicket({ body: payload, ticketId: ticket?._id }).unwrap() : await createTicket(payload).unwrap()
    if (res?.message) {
      toast.success(res?.message || "Ticket created successfully")
      refetch()
    }

    setShowTicketModal(false);
    setEditingTicket(null);
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

  useEffect(() => setProgress(0), [])



  const addEventDay = () => {
    setTicketDateTime((prev) => [
      ...prev,
      {
        id: ticketDateTime.length + 1,
        date: '',
        startTime: '09:00',
        endTime: '17:00'
      }
    ]);
  };

  const removeEventDay = (id: number) => {
    setTicketDateTime(prev => prev.filter(day => day.id !== id));
  };

  const updateEventDay = (
    index: number,
    field: keyof Omit<EventDay, 'id'>,
    value: string
  ) => {
    setTicketDateTime(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
      <Spinner isLoading={isSaving || isUpdating} />
      <div className={`w-full max-w-2xl rounded-xl ${cardClasses} p-6`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-xl ${textPrimary}`}>{modelTitle(opMode, t)}</h3>
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

        <div className="space-y-3">
          <section className={`px-3 py-4 space-y-3 max-h-[70vh] overflow-y-auto rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
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
              <div className="flex items-center gap-2">
                <label className={`block text-sm mb-2 ${textSecondary}`}>{t('ticket_image')}</label>
                {progress > 0 && (
                  <div className="w-120 bg-gray-200 rounded h-2 mt-2 flex items-center gap-2">
                    <div
                      className="bg-green-500 h-2 rounded transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    <div>{progress}%</div>
                  </div>
                )}
              </div>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'
                  }`}
              >
                {editingTicket?.imageUrl ? (
                  <div className="relative">
                    <img
                      src={editingTicket?.imageUrl}
                      alt="Ticket preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => { setFile(null); setEditingTicket({ ...editingTicket, imageUrl: '' }) }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
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
                            setEditingTicket({ ...editingTicket, imageUrl: reader.result as string });
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

            <section>
              <label htmlFor="">Ticket Days</label>
              <div className="w-full space-y-2 mt-2">
                {ticketDateTime.map((day, index) => (
                  <div
                    key={day.id}
                  >

                    {/* Fields */}
                    <div className="grid grid-cols-12 gap-2 w-full">
                      {/* Date Select */}
                      <select
                        value={day.date}
                        onChange={(e) =>
                          updateEventDay(index, 'date', e.target.value)
                        }
                        className={`px-3 py-2 col-span-5 rounded-lg border ${inputClasses}`}
                      >
                        <option value="">{t('select_date')}</option>

                        {eventDays?.map(date => (
                          <option key={date.id} value={date.date}>
                            {formatDate(date.date, "en")}
                          </option>
                        ))}
                      </select>

                      {/* Start Time */}
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          updateEventDay(index, 'startTime', e.target.value)
                        }
                        className={`px-3 py-2 col-span-3 rounded-lg border ${inputClasses}`}
                      />

                      {/* End Time */}
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          updateEventDay(index, 'endTime', e.target.value)
                        }
                        className={`px-3 py-2 col-span-3 rounded-lg border ${inputClasses}`}
                      />

                      {/* Remove row */}
                      <button
                        onClick={() => removeEventDay(day.id)}
                        className="text-red-500 hover:text-red-600 p-1 col-span-1"
                      >
                        <Trash2 className=" w-full h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addEventDay}
                  className="border border-green-600 text-green-500 rounded-md px-3 py-2 flex items-center gap-2"
                >
                  <Plus />
                  <span>Add More</span>
                </button>
              </div>

            </section>


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
                    min={0}
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
                    min={0}
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
                  min={1}
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
                  min={1}
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
          </section>

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