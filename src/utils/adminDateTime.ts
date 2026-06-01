const ADMIN_TIME_ZONE = "Asia/Ho_Chi_Minh";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeZone: ADMIN_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: ADMIN_TIME_ZONE,
});

export const formatAdminDate = (value: string | null | undefined) => {
  if (!value) return "-";

  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(value);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
};

export const formatAdminDateShort = (value: string | null | undefined) => {
  if (!value) return "-";

  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(value);
  if (dateOnlyMatch) {
    const [, , month, day] = dateOnlyMatch;
    return `${day}/${month}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: ADMIN_TIME_ZONE,
  }).format(date);
};

export const formatAdminDateTime = (value: string | null | undefined) => {
  if (!value) return "-";

  if (DATE_ONLY_PATTERN.test(value)) {
    return formatAdminDate(value);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
};
