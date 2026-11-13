import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  MessageSquareHeart,
  Package,
  Plus,
  Sparkles,
  Store,
  Tags,
  Trash2,
  X,
} from "lucide-react";

import { MarkerMap } from "@/components/maps";
import { useAppSelector } from "@/hooks/hooks";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { ParsedAddressParts } from "@/helpers";
import {
  emptyDraft,
  type AnswerKey,
  type OnboardingDraft,
  type OnboardingProduct,
} from "./types";
import { Button, Field, TextArea, TextInput } from "./ui";
import { CategoryGroupsStep, SubcategoriesStep } from "./CategorySteps";
import { DoneView, type DoneAction } from "./DoneView";
import { ProgressTracker, type Milestone } from "./ProgressTracker";
import {
  readSelection,
  selectedKeys,
  type CategorySelection,
} from "./categorySelection";
import {
  useCreateFromOnboarding,
  type CreateResult,
} from "./useCreateFromOnboarding";

interface VendorOnboardingProps {
  onClose: () => void;
  /** Leave onboarding and open the regular Add business wizard. */
  onManual: () => void;
  /** The page is built and the vendor chose what to do next. */
  onComplete: (
    result: CreateResult & { businessName: string },
    action: DoneAction,
  ) => void;
}

const STEP = {
  WELCOME: 0,
  DETAILS: 1,
  CATEGORIES: 2,
  SUBCATEGORIES: 3,
  LOCATION: 4,
  PHOTOS: 5,
  Q_OFFER: 6,
  Q_EDGE: 7,
  Q_FIT: 8,
  Q_RECO: 9,
  PRODUCTS: 10,
  CREATE: 11,
} as const;

/**
 * Bumped when steps are added or removed, so saved drafts land on the same
 * step. 2: the "when to come / what to know" question (old step 9) removed.
 */
const FLOW_VERSION = 2;

const QUESTIONS: {
  step: number;
  key: AnswerKey;
  probe?: boolean;
}[] = [
  { step: STEP.Q_OFFER, key: "offer", probe: true },
  { step: STEP.Q_EDGE, key: "edge", probe: true },
  { step: STEP.Q_FIT, key: "fit", probe: true },
  { step: STEP.Q_RECO, key: "reco" },
];

const LAST_INPUT_STEP = STEP.PRODUCTS;

/** The wizard's sections, shown as badges on the progress tracker. */
const MILESTONES: Milestone[] = [
  { key: "details", from: STEP.DETAILS, to: STEP.DETAILS, icon: Store },
  { key: "type", from: STEP.CATEGORIES, to: STEP.SUBCATEGORIES, icon: Tags },
  { key: "location", from: STEP.LOCATION, to: STEP.LOCATION, icon: MapPin },
  { key: "photos", from: STEP.PHOTOS, to: STEP.PHOTOS, icon: ImagePlus },
  {
    key: "story",
    from: STEP.Q_OFFER,
    to: STEP.Q_RECO,
    icon: MessageSquareHeart,
  },
  { key: "products", from: STEP.PRODUCTS, to: STEP.PRODUCTS, icon: Package },
];
const MAX_PRODUCTS = 4;
const MAX_IMAGES = 8;
const PHONE_RE = /^(\+972[-\s]?|0)(5\d|[23489]|7\d)[-\s]?\d{3}[-\s]?\d{4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const emptyProduct = (): OnboardingProduct => ({
  name: "",
  description: "",
  price: "",
  duration: "",
  bookingRequired: false,
});

export default function VendorOnboarding({
  onClose,
  onManual,
  onComplete,
}: VendorOnboardingProps) {
  const { t } = useTranslation("onboarding");
  const { isDark, isRTL, textPrimary, textTertiary, bgSecondary, borderColor } =
    useThemeClasses();
  const reduceMotion = useReducedMotion();
  const user = useAppSelector((s) => s.auth.user);

  const storageKey = `vendor-onboarding:${user?.id ?? "anon"}`;
  const [draft, setDraft] = usePersistentState<OnboardingDraft>(
    storageKey,
    emptyDraft({
      contactName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      email: user?.email ?? "",
      phone: user?.phoneDetails?.phoneNumber ?? "",
    }),
  );
  const update = (patch: Partial<OnboardingDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const step = draft.step;
  const goTo = (s: number) => update({ step: s });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (k: string) =>
    setErrors((e) => {
      if (!e[k]) return e;
      const { [k]: _, ...rest } = e;
      return rest;
    });

  const { run, stage, error: createError } = useCreateFromOnboarding();
  const [created, setCreated] = useState<CreateResult | null>(null);
  const finish = (action: DoneAction) =>
    created &&
    onComplete({ ...created, businessName: draft.businessName }, action);

  // The vendor's category choice (drafts saved before these steps have none).
  const selection = readSelection(draft);
  const setSelection = (next: CategorySelection) => {
    clearError("categories");
    update(next);
  };

  // A reload mid-creation restores the draft; send the vendor back to the last input step.
  useEffect(() => {
    if (draft.flowVersion !== FLOW_VERSION) {
      let s = draft.step;
      // Saved before the two category steps were added after the details step.
      if (!Array.isArray(draft.categoryGroups) && s >= STEP.CATEGORIES) s += 2;
      // Saved while the practical question was still step 9.
      if ((draft.flowVersion ?? 1) < 2 && s > STEP.Q_RECO) s -= 1;
      update({
        ...readSelection(draft),
        flowVersion: FLOW_VERSION,
        step: Math.min(s, LAST_INPUT_STEP),
      });
      return;
    }
    if (draft.step === STEP.CREATE) update({ step: LAST_INPUT_STEP });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move focus to the step heading so keyboard and screen-reader users follow along.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    document.getElementById("onboarding-scroll")?.scrollTo({ top: 0 });
  }, [step, created]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage !== "saving" && stage !== "products")
        onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, stage]);

  /* ----------------------------------------------------------- photos --- */
  const {
    images: uploads,
    handleImageUpload,
    handleDeleteImage,
  } = useFilesUpload({
    initialImages: draft.images,
    onChange: (imgs) => update({ images: imgs }),
    onImagesChange: (imgs) => update({ images: imgs }),
    skipRemoteDelete: true,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const uploading = uploads.some(
    (u) => u.status === "uploading" || u.status === "pending",
  );

  /* ------------------------------------------------------- validation --- */
  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === STEP.DETAILS) {
      if (draft.businessName.trim().length < 2)
        e.businessName = t("err_business_name");
      if (draft.contactName.trim().length < 2)
        e.contactName = t("err_contact_name");
      if (!PHONE_RE.test(draft.phone.trim())) e.phone = t("err_phone");
      if (!EMAIL_RE.test(draft.email.trim())) e.email = t("err_email");
    }
    if (s === STEP.CATEGORIES && !selection.categoryGroups.length) {
      e.categories = t("err_categories");
    }
    if (s === STEP.SUBCATEGORIES && !selectedKeys(selection).length) {
      e.categories = t("err_subcategories");
    }
    if (s === STEP.LOCATION) {
      if (!draft.address.trim() || !draft.geo.lat) e.address = t("err_address");
      const w = draft.website.trim();
      if (w && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(w))
        e.website = t("err_website");
    }
    const q = QUESTIONS.find((x) => x.step === s);
    if (q && draft.answers[q.key].trim().length < 3) {
      e[q.key] = t("err_answer");
    }
    if (s === STEP.PRODUCTS) {
      draft.products.forEach((p, i) => {
        const touched = p.name || p.price || p.description || p.duration;
        if (touched && !p.name.trim())
          e[`product_${i}_name`] = t("err_product_name");
        if (p.price && Number.isNaN(Number(p.price.replace(/[^\d.]/g, "")))) {
          e[`product_${i}_price`] = t("err_product_price");
        }
      });
    }
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>(
          "[aria-invalid='true']",
        );
        first?.focus();
      });
    }
    return !Object.keys(e).length;
  };

  const next = () => {
    if (!validate(step)) return;
    // One gentle follow-up when an answer is very short (spec: max one probe).
    const q = QUESTIONS.find((x) => x.step === step);
    if (
      q?.probe &&
      wordCount(draft.answers[q.key]) < 10 &&
      !draft.probed[q.key]
    ) {
      update({ probed: { ...draft.probed, [q.key]: true } });
      return;
    }
    if (step === LAST_INPUT_STEP) {
      void submit();
      return;
    }
    goTo(step + 1);
  };
  const back = () => step > 0 && goTo(step - 1);

  const submit = async () => {
    goTo(STEP.CREATE);
    const cleaned = {
      ...draft,
      images: uploads
        .filter((u) => u.status === "success" && u.gcsURL)
        .map((u, i) => ({ image: u.gcsURL!, isPrimary: i === 0 })),
      products: draft.products.filter((p) => p.name.trim()),
    };
    const result = await run(cleaned);
    if (result) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* storage unavailable */
      }
      setCreated(result);
    }
  };

  /* ------------------------------------------------------------ chrome --- */
  const questionIndex = QUESTIONS.findIndex((q) => q.step === step);
  const stepLabel = useMemo(() => {
    if (created) return t("label_done");
    if (questionIndex >= 0) {
      return t("question_n_of", {
        n: questionIndex + 1,
        total: QUESTIONS.length,
      });
    }
    return t(
      [
        "label_welcome",
        "label_details",
        "label_categories",
        "label_categories",
        "label_location",
        "label_photos",
      ][step] ?? (step === STEP.PRODUCTS ? "label_products" : "label_creating"),
    );
  }, [step, questionIndex, created, t]);

  const busy = step === STEP.CREATE && stage !== "error" && !created;

  const motionProps = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: isRTL ? -16 : 16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: isRTL ? 16 : -16 },
      };

  const heading = (text: string, sub?: string) => (
    <div className="mb-6 space-y-2">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className={clsx(
          "text-xl md:text-2xl font-semibold leading-snug outline-none",
          textPrimary,
        )}
      >
        {text}
      </h2>
      {sub && <p className={clsx("text-sm leading-6", textTertiary)}>{sub}</p>}
    </div>
  );

  /** A question's prompts as a short list, each with a highlighted lead. */
  const renderPoints = (key: AnswerKey) => {
    const points = t(`q_${key}_points`, {
      returnObjects: true,
      defaultValue: [],
    }) as unknown;
    if (!Array.isArray(points) || !points.length) return null;
    return (
      <ul
        className={clsx(
          "-mt-2 mb-6 space-y-2 rounded-xl border p-4",
          isDark
            ? "border-gray-800 bg-gray-950/40"
            : "border-gray-100 bg-gray-50",
        )}
      >
        {(points as { b: string; t: string }[]).map((p) => (
          <li key={p.b} className="flex items-start gap-2.5 text-sm leading-6">
            <span
              aria-hidden
              className={clsx(
                "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                isDark ? "bg-teal-400" : "bg-teal-600",
              )}
            />
            <span className={textTertiary}>
              <mark
                className={clsx(
                  "me-1.5 rounded px-1.5 py-0.5 font-semibold",
                  isDark
                    ? "bg-teal-900/50 text-teal-200"
                    : "bg-teal-100 text-teal-800",
                )}
              >
                {p.b}
              </mark>
              <span className={textPrimary}>{p.t}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  };

  /* ------------------------------------------------------------- steps --- */
  const renderQuestion = (q: (typeof QUESTIONS)[number]) => {
    const showProbe =
      q.probe && draft.probed[q.key] && wordCount(draft.answers[q.key]) < 10;
    return (
      <>
        {q.step === STEP.Q_OFFER && (
          <div
            className={clsx(
              "mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-6",
              isDark
                ? "bg-teal-900/30 text-teal-200"
                : "bg-teal-50 text-teal-800",
            )}
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {t("magic_note")}
          </div>
        )}
        {heading(t(`q_${q.key}_title`), t(`q_${q.key}_sub`))}
        {renderPoints(q.key)}
        <Field
          id={`q-${q.key}`}
          label={t("your_answer")}
          hint={t("answer_hint")}
          error={errors[q.key]}
        >
          <TextArea
            id={`q-${q.key}`}
            value={draft.answers[q.key]}
            invalid={!!errors[q.key]}
            rows={q.key === "reco" ? 3 : 6}
            onChange={(e) => {
              clearError(q.key);
              update({
                answers: { ...draft.answers, [q.key]: e.target.value },
              });
            }}
          />
        </Field>
        {showProbe && (
          <div
            role="status"
            className={clsx(
              "mt-4 rounded-xl border px-4 py-3 text-sm leading-6",
              isDark
                ? "border-amber-700/50 bg-amber-900/20 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-900",
            )}
          >
            {t(`q_${q.key}_probe`)}
          </div>
        )}
      </>
    );
  };

  const renderStep = () => {
    const q = QUESTIONS.find((x) => x.step === step);
    if (q) return renderQuestion(q);

    switch (step) {
      case STEP.WELCOME:
        return (
          <>
            {heading(t("welcome_title"), t("welcome_sub"))}
            <ul className="mb-6 space-y-3">
              {(
                [
                  "welcome_point_1",
                  "welcome_point_2",
                  "welcome_point_3",
                ] as const
              ).map((k) => (
                <li
                  key={k}
                  className={clsx(
                    "flex items-start gap-3 text-sm leading-6",
                    textPrimary,
                  )}
                >
                  <span
                    className={clsx(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      isDark
                        ? "bg-teal-900/50 text-teal-300"
                        : "bg-teal-100 text-teal-700",
                    )}
                  >
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  {t(k)}
                </li>
              ))}
            </ul>
            <p className={clsx("text-sm leading-6", textTertiary)}>
              {t("welcome_tip")}
            </p>
          </>
        );

      case STEP.DETAILS:
        return (
          <>
            {heading(t("details_title"))}
            <div className="space-y-4">
              <Field
                id="ob-name"
                label={t("business_name")}
                hint={t("business_name_hint")}
                error={errors.businessName}
              >
                <TextInput
                  id="ob-name"
                  autoComplete="organization"
                  value={draft.businessName}
                  invalid={!!errors.businessName}
                  onChange={(e) => {
                    clearError("businessName");
                    update({ businessName: e.target.value });
                  }}
                />
              </Field>
              <Field
                id="ob-contact"
                label={t("contact_name")}
                error={errors.contactName}
              >
                <TextInput
                  id="ob-contact"
                  autoComplete="name"
                  value={draft.contactName}
                  invalid={!!errors.contactName}
                  onChange={(e) => {
                    clearError("contactName");
                    update({ contactName: e.target.value });
                  }}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="ob-phone"
                  label={t("phone")}
                  hint={t("phone_hint")}
                  error={errors.phone}
                >
                  <TextInput
                    id="ob-phone"
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    autoComplete="tel"
                    value={draft.phone}
                    invalid={!!errors.phone}
                    onChange={(e) => {
                      clearError("phone");
                      update({ phone: e.target.value });
                    }}
                  />
                </Field>
                <Field id="ob-email" label={t("email")} error={errors.email}>
                  <TextInput
                    id="ob-email"
                    type="email"
                    inputMode="email"
                    dir="ltr"
                    autoComplete="email"
                    value={draft.email}
                    invalid={!!errors.email}
                    onChange={(e) => {
                      clearError("email");
                      update({ email: e.target.value });
                    }}
                  />
                </Field>
              </div>
            </div>
          </>
        );

      case STEP.CATEGORIES:
        return (
          <>
            {heading(t("cat_groups_title"), t("cat_groups_sub"))}
            <CategoryGroupsStep
              selection={selection}
              onChange={setSelection}
              error={errors.categories}
            />
          </>
        );

      case STEP.SUBCATEGORIES:
        return (
          <>
            {heading(t("cat_subs_title"), t("cat_subs_sub"))}
            <SubcategoriesStep
              selection={selection}
              onChange={setSelection}
              error={errors.categories}
            />
          </>
        );

      case STEP.LOCATION:
        return (
          <>
            {heading(t("location_title"), t("location_sub"))}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <span
                  className={clsx("block text-sm font-medium", textPrimary)}
                >
                  {t("address")}
                </span>
                <div
                  aria-invalid={errors.address ? true : undefined}
                  tabIndex={errors.address ? -1 : undefined}
                >
                  <MarkerMap
                    geo={draft.geo}
                    setGeo={(geo) => {
                      clearError("address");
                      update({ geo });
                    }}
                    address={draft.address}
                    setAddress={(address) => update({ address })}
                    onAddressParts={(parts: ParsedAddressParts) =>
                      update({ addressParts: parts })
                    }
                  />
                </div>
                {errors.address && (
                  <p role="alert" className="text-sm text-red-500">
                    {errors.address}
                  </p>
                )}
              </div>
              <Field
                id="ob-website"
                label={t("website")}
                optionalLabel={t("optional")}
                hint={t("website_hint")}
                error={errors.website}
              >
                <TextInput
                  id="ob-website"
                  type="url"
                  inputMode="url"
                  dir="ltr"
                  placeholder="https://"
                  value={draft.website}
                  invalid={!!errors.website}
                  onChange={(e) => {
                    clearError("website");
                    update({ website: e.target.value });
                  }}
                />
              </Field>
            </div>
          </>
        );

      case STEP.PHOTOS:
        return (
          <>
            {heading(t("photos_title"), t("photos_sub"))}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-label={t("add_photos")}
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) {
                  const room = MAX_IMAGES - uploads.length;
                  const dt = new DataTransfer();
                  Array.from(files)
                    .slice(0, Math.max(0, room))
                    .forEach((f) => dt.items.add(f));
                  if (dt.files.length) handleImageUpload(dt.files);
                }
                e.target.value = "";
              }}
            />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {uploads.map((img, i) => (
                <div
                  key={img.id ?? i}
                  className={clsx(
                    "relative aspect-square overflow-hidden rounded-xl border",
                    borderColor,
                  )}
                >
                  <img
                    src={img.previewUrl || img.gcsURL}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {img.status !== "success" && img.status !== "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
                      {Math.round(img.progress ?? 0)}%
                    </div>
                  )}
                  {img.status === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-600/60 text-xs font-medium text-white">
                      {t("upload_failed")}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img, i)}
                    aria-label={t("remove_photo")}
                    className="absolute top-1.5 end-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/70 text-white hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                  {i === 0 && img.status === "success" && (
                    <span className="absolute bottom-1.5 start-1.5 rounded-md bg-teal-600 px-1.5 py-0.5 text-[11px] font-medium text-white">
                      {t("cover_photo")}
                    </span>
                  )}
                </div>
              ))}
              {uploads.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={clsx(
                    "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    isDark
                      ? "border-gray-700 text-teal-300 hover:border-teal-500 hover:bg-teal-900/20"
                      : "border-gray-300 text-teal-700 hover:border-teal-500 hover:bg-teal-50",
                  )}
                >
                  <ImagePlus className="h-6 w-6" aria-hidden />
                  {t("add_photos")}
                </button>
              )}
            </div>
            <p className={clsx("mt-4 text-xs leading-5", textTertiary)}>
              {t("photos_hint")}
            </p>
          </>
        );

      case STEP.PRODUCTS:
        return (
          <>
            {heading(t("products_title"), t("products_sub"))}
            <div className="space-y-4">
              {draft.products.map((p, i) => {
                const set = (patch: Partial<OnboardingProduct>) =>
                  update({
                    products: draft.products.map((x, j) =>
                      j === i ? { ...x, ...patch } : x,
                    ),
                  });
                return (
                  <fieldset
                    key={i}
                    className={clsx(
                      "space-y-4 rounded-xl border p-4",
                      borderColor,
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <legend
                        className={clsx("text-sm font-semibold", textPrimary)}
                      >
                        {t("product_n", { n: i + 1 })}
                      </legend>
                      <button
                        type="button"
                        onClick={() =>
                          update({
                            products: draft.products.filter((_, j) => j !== i),
                          })
                        }
                        aria-label={t("remove_product", { n: i + 1 })}
                        className={clsx(
                          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-red-600",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                          textTertiary,
                        )}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <Field
                      id={`p${i}-name`}
                      label={t("product_name")}
                      error={errors[`product_${i}_name`]}
                    >
                      <TextInput
                        id={`p${i}-name`}
                        value={p.name}
                        maxLength={150}
                        invalid={!!errors[`product_${i}_name`]}
                        onChange={(e) => {
                          clearError(`product_${i}_name`);
                          set({ name: e.target.value });
                        }}
                      />
                    </Field>
                    <Field
                      id={`p${i}-desc`}
                      label={t("product_desc")}
                      optionalLabel={t("optional")}
                    >
                      <TextInput
                        id={`p${i}-desc`}
                        value={p.description}
                        onChange={(e) => set({ description: e.target.value })}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        id={`p${i}-price`}
                        label={t("product_price")}
                        error={errors[`product_${i}_price`]}
                      >
                        <TextInput
                          id={`p${i}-price`}
                          inputMode="decimal"
                          dir="ltr"
                          value={p.price}
                          invalid={!!errors[`product_${i}_price`]}
                          onChange={(e) => {
                            clearError(`product_${i}_price`);
                            set({ price: e.target.value });
                          }}
                        />
                      </Field>
                      <Field
                        id={`p${i}-dur`}
                        label={t("product_duration")}
                        optionalLabel={t("optional")}
                      >
                        <TextInput
                          id={`p${i}-dur`}
                          placeholder={t("product_duration_placeholder")}
                          value={p.duration}
                          onChange={(e) => set({ duration: e.target.value })}
                        />
                      </Field>
                    </div>
                    <label
                      className={clsx(
                        "flex items-center gap-2.5 text-sm",
                        textPrimary,
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-teal-600"
                        checked={p.bookingRequired}
                        onChange={(e) =>
                          set({ bookingRequired: e.target.checked })
                        }
                      />
                      {t("product_booking")}
                    </label>
                  </fieldset>
                );
              })}
              {draft.products.length < MAX_PRODUCTS && (
                <button
                  type="button"
                  onClick={() =>
                    update({ products: [...draft.products, emptyProduct()] })
                  }
                  className={clsx(
                    "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    isDark
                      ? "border-gray-700 text-teal-300 hover:border-teal-500"
                      : "border-gray-300 text-teal-700 hover:border-teal-500",
                  )}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  {draft.products.length
                    ? t("add_another_product")
                    : t("add_product")}
                </button>
              )}
            </div>
          </>
        );

      case STEP.CREATE:
        if (created) {
          return (
            <DoneView
              ref={headingRef}
              businessId={created.businessId}
              businessName={draft.businessName}
              productsAdded={
                draft.products.filter((p) => p.name.trim()).length -
                created.productsFailed
              }
              productsFailed={created.productsFailed}
              onAction={finish}
            />
          );
        }
        return (
          <CreatingView
            stage={stage}
            error={createError}
            onRetry={submit}
            onBack={() => goTo(STEP.PRODUCTS)}
            onManual={onManual}
          />
        );
      default:
        return null;
    }
  };

  const primaryLabel =
    step === STEP.WELCOME
      ? t("start")
      : step === LAST_INPUT_STEP
        ? t("create_my_page")
        : step === STEP.PHOTOS && !uploads.length
          ? t("skip_for_now")
          : t("continue");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className={clsx("fixed inset-0 z-[60] flex flex-col", bgSecondary)}
    >
      {/* Top bar */}
      <header
        className={clsx(
          "shrink-0 border-b",
          borderColor,
          isDark ? "bg-gray-950" : "bg-white",
        )}
      >
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <p
              id="onboarding-title"
              className={clsx("truncate text-sm font-semibold", textPrimary)}
            >
              {t("title")}
            </p>
            <p
              className={clsx("truncate text-xs", textTertiary)}
              aria-live="polite"
            >
              {stepLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!busy && step !== STEP.CREATE && (
              <Button variant="ghost" className="px-3" onClick={onManual}>
                {t("fill_manually")}
              </Button>
            )}
            {!busy && (
              <button
                type="button"
                onClick={() => (created ? finish("close") : onClose())}
                aria-label={t("close")}
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                  isDark
                    ? "text-gray-400 hover:bg-gray-800"
                    : "text-gray-500 hover:bg-gray-100",
                )}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>
        </div>
        {step >= STEP.DETAILS && step <= LAST_INPUT_STEP && (
          <ProgressTracker
            step={step}
            lastStep={LAST_INPUT_STEP}
            milestones={MILESTONES}
          />
        )}
      </header>

      {/* Content */}
      <main id="onboarding-scroll" className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
          <div
            className={clsx(
              "rounded-2xl border p-5 md:p-8",
              isDark
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-white shadow-sm",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                transition={{ duration: 0.18, ease: "easeOut" }}
                {...motionProps}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      {step !== STEP.CREATE && (
        <footer
          className={clsx(
            "shrink-0 border-t",
            borderColor,
            isDark ? "bg-gray-950" : "bg-white",
          )}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            {step > STEP.WELCOME ? (
              <Button variant="ghost" onClick={back}>
                {t("back")}
              </Button>
            ) : (
              <span />
            )}
            <Button
              onClick={next}
              disabled={step === STEP.PHOTOS && uploading}
              className="min-w-36"
            >
              {step === STEP.PHOTOS && uploading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden
                  />
                  {t("uploading")}
                </>
              ) : (
                primaryLabel
              )}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function CreatingView({
  stage,
  error,
  onRetry,
  onBack,
  onManual,
}: {
  stage: string;
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
  onManual: () => void;
}) {
  const { t } = useTranslation("onboarding");
  const { textPrimary, textTertiary, isDark } = useThemeClasses();
  const order = ["reading", "writing", "saving", "products", "done"];
  const current = order.indexOf(stage);
  const rows = [
    { key: "reading", label: t("stage_reading") },
    { key: "writing", label: t("stage_writing") },
    { key: "saving", label: t("stage_saving") },
    { key: "products", label: t("stage_products") },
  ];

  if (stage === "error") {
    return (
      <div className="space-y-5" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            aria-hidden
          />
          <div className="space-y-1">
            <h2 className={clsx("text-lg font-semibold", textPrimary)}>
              {t("error_title")}
            </h2>
            <p className={clsx("text-sm leading-6", textTertiary)}>
              {t("error_body")}
            </p>
            {error && <p className={clsx("text-xs", textTertiary)}>{error}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onRetry}>{t("try_again")}</Button>
          <Button variant="outline" onClick={onBack}>
            {t("back_to_answers")}
          </Button>
          <Button variant="ghost" onClick={onManual}>
            {t("fill_manually")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className={clsx("text-xl font-semibold", textPrimary)}>
          {t("creating_title")}
        </h2>
        <p className={clsx("text-sm leading-6", textTertiary)}>
          {t("creating_sub")}
        </p>
      </div>
      <ol className="space-y-3" aria-live="polite">
        {rows.map((r) => {
          const idx = order.indexOf(r.key);
          const done = current > idx;
          const active = current === idx;
          return (
            <li key={r.key} className="flex items-center gap-3 text-sm">
              <span
                className={clsx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  done
                    ? "bg-teal-600 text-white"
                    : active
                      ? isDark
                        ? "bg-teal-900/50 text-teal-300"
                        : "bg-teal-100 text-teal-700"
                      : isDark
                        ? "bg-gray-800 text-gray-500"
                        : "bg-gray-100 text-gray-400",
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : active ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                    aria-hidden
                  />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span
                className={clsx(
                  done || active ? textPrimary : textTertiary,
                  active && "font-medium",
                )}
              >
                {r.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
