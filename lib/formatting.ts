export function converDate(dateString: string, locale?: string): string {
  if (!locale) {
    locale = "en-US";
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  let formattedDate;
  const parsedDate = new Date(dateString);

  if (!isNaN(parsedDate.getTime())) {
    formattedDate = formatter.format(parsedDate);
  } else {
    formattedDate = dateString;
  }

  return formattedDate;
}
