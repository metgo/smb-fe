import { Locale } from 'src/common/enum';

export function getLocalizedValue(
  obj: any,
  baseKey: string,
  locale: Locale,
): any {
  if (!obj) return null;

  const map = {
    [Locale.HEBREW]: [`${baseKey}He`, baseKey, `${baseKey}Ar`],
    [Locale.ARABIC]: [`${baseKey}Ar`, baseKey, `${baseKey}He`],
    [Locale.ENGLISH]: [baseKey, `${baseKey}He`, `${baseKey}Ar`],
  };

  const keys = map[locale] || [`${baseKey}He`, baseKey, `${baseKey}Ar`];

  const foundKey = keys.find(
    key => obj[key] !== undefined && obj[key] !== null && obj[key] !== '',
  );

  return foundKey ? obj[foundKey] : null;
}

export function localizeFields(obj: any, locale: Locale) {
  if (!obj) return obj;

  const {
    nameHe,
    nameAr,
    name,
    description,
    descriptionHe,
    descriptionAr,
    shortDescription,
    shortDescriptionAr,
    shortDescriptionHe,
    ...rest
  } = obj;

  return {
    ...rest,
    name: getLocalizedValue(obj, 'name', locale),
    description: getLocalizedValue(obj, 'description', locale),
    shortDescription: getLocalizedValue(obj, 'shortDescription', locale),
  };
}
