import { Locale } from './enum';

export async function localizeItem(item: any, locale: Locale): Promise<string> {
  const {
    nameAr,
    descriptionAr,
    shortDescriptionAr,
    name,
    description,
    shortDescription,
    nameHe,
    descriptionHe,
    shortDescriptionHe,
    ...rest
  } = item;

  switch (locale) {
    case Locale.ARABIC:
      return {
        ...rest,
        name: nameAr || name || nameHe,
        description: descriptionAr || description || descriptionHe,
        shortDescription:
          shortDescriptionAr || shortDescription || shortDescriptionHe,
      };
    case Locale.HEBREW:
      return {
        ...rest,
        name: nameHe || name || nameAr,
        description: descriptionHe || description || descriptionAr,
        shortDescription:
          shortDescriptionHe || shortDescription || shortDescriptionAr,
      };

    case Locale.ENGLISH:
      return {
        ...rest,
        name: name || nameHe || nameAr,
        description: description || descriptionHe || descriptionAr,
        shortDescription:
          shortDescription || shortDescriptionHe || shortDescriptionAr,
      };
    default:
      return item;
  }
}
