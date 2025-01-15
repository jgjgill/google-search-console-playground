import { google } from "googleapis";
import { JWT } from "google-auth-library";
import dayjs from "dayjs";
import dotenv from "dotenv";

dotenv.config();

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey =
  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8PFfZ+dK/Dnuy\nNLkw1IXJOfcg8Y+0KbN/1RODT82lO1XnAws8kCMT30YKO6uGyhKCoUJkG/ZYyThh\naF5wpImzElx/nE7ZLsbk8qiGhAf4TPeTUGAsWR9A0833Cf7LpeuITQDq8Pd5AA2U\ngwxIN6eJ4+dPu8fW0MPWA0NVmI75f4i3tLhi6Ttis6QHoyC/KP8+Nl1OURMoXhqO\nuovjpuBry9U4aGf+nzhWfAeBXDOrXAqar8q/hhqh/zrgcZkDlQPWaZO/MAlU0Olx\niqNhRGQtV3nQCSqZCXJ0uIpEmxVjXiiJE5t6FKmTf+keCl8pRiHUr77+MSANzayq\nuvB103mLAgMBAAECggEAJLuN1T6YLqpv3w3E2c+PL/58yFP7XAgLPDXjcet/0O+s\nSsFgTvg9sCIQ8+xDA7GpPQ6k+w4t25Ogyflo/IhPSr+Zh1mEVYN4UrM7ycw4Fe9H\nHNtBeUYHAEqU1dGAhFMjjFyigjZ1xIoLHGEaY3lg21q7B+c4DyZ8IOZQHIMB25P+\nxP9OzXitpaUyhSzfszQn7xWRZfToDjogEyVIXtwecgiCG6V7lQDfl6R5+BGLs8R6\njDiPwl3+Rw4MjGceQ9XxcUBj07ZG0hDmxtj4RnvDUHR5s0Ri05q8+cES3w3H6K9n\nICV8BdJcmEsRqt6pLh9pAYbXIXw/0rqw3+/jeS6s6QKBgQDrA1M5SSd19vW+S3IC\nWkNvu0EqEjqXhuy77KDMQu38oBszKJVJqwkixEwaFMlBkXF5tm9bjgVBeLBUWIrb\n2ugAec6VeGgMbBlZBveqfv3OY83wU6rC5pzsRM7dPUP7taLesIEwzl5lIQ8bzJuO\nHYstms/aigN42w89KXMRfp/x1wKBgQDNC6JgUY4k+fy1RBnNGkulQ/QhKy/sr2Qm\n+t6lviNBUB/tBeyixUZdJGlYNHm6hvdkBOCnBdSq3FDFIhSa3s7ljV7mafgonqix\nyj3L6orEiwcaE0G38jUa3XYBBK9WPcoGYIQ9udtANdXUYqk+7LEaXC/oc2PagLNa\nnU8/xHRnbQKBgCZNN24ZrxW5txlZgG5DucPm99rcd7IkakbCbP59Vf4bNfOjhJkq\nB+YjqeeCRb6q7pyQkBuSzOZ7vfkxKQhl5/PT5khUBFkp8QOicBDYe5L8jx7A9A6p\nuR+Eo1ZJWuAWHUI/7/49VAMVXToBocSKqhk3pvKOFbzHrvcf30IVqgmnAoGBAI91\nAFobNTQxoti/mL2jFCHAdWFvccxKuet7waJ8cPYVNQEEEBehpiUsgHex3yjdnOBh\neTviHHSeR/Rkb74a/O4mBqt2oKTqvGQHd0zf/86a5pEbv/MOhpEROKpluLbB7EKh\n7GOzUO6Pu9coX/kiaJZkwTAE62vId7OCNBwNOtPRAoGBAMIY8A+7FkwcowIBtYc2\n2wSh1K8uXILqUhgGwZSAA8IwrTaeLA2jXxAsKYeMdkKz/saeUviFQV2UbEkQGPdN\nIBCg3Jllt07v7Exeo5+WVSpdYqASdJF3Jh2NIOscAUcw3joZPaTvIvApy9xwN9gk\nPlcJ4fmhoS+GmOoLlAT4BAos\n-----END PRIVATE KEY-----\n";
const siteUrl = "https://jgjgill-blog.netlify.app";
const searchConolseUrl =
  "https://search.google.com/search-console?resource_id=https%3A%2F%2Fjgjgill-blog.netlify.app%2F";
const projectName = "jgjgill";

async function fetchSearchData(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) {
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });

  const searchAnalytics = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      dimensions: ["date"],
      type: "web",
    },
  });

  return searchAnalytics.data.rows || [];
}

export async function testSearchConsole() {
  // 이번 주 데이터 (3일 전부터 9일 전까지)
  const currentEndDate = dayjs().subtract(3, "day");
  const currentStartDate = currentEndDate.subtract(6, "day");

  // 지난 주 데이터 (10일 전부터 16일 전까지)
  const previousEndDate = currentStartDate.subtract(1, "day");
  const previousStartDate = previousEndDate.subtract(6, "day");

  const [currentWeekData, previousWeekData] = await Promise.all([
    fetchSearchData(currentStartDate, currentEndDate),
    fetchSearchData(previousStartDate, previousEndDate),
  ]);

  // 주간 합계 계산
  const currentWeekSummary = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const previousWeekSummary = {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  };

  currentWeekData.forEach((row) => {
    currentWeekSummary.clicks += row.clicks || 0;
    currentWeekSummary.impressions += row.impressions || 0;
    currentWeekSummary.ctr += row.ctr || 0;
    currentWeekSummary.position += row.position || 0;
  });

  previousWeekData.forEach((row) => {
    previousWeekSummary.clicks += row.clicks || 0;
    previousWeekSummary.impressions += row.impressions || 0;
    previousWeekSummary.ctr += row.ctr || 0;
    previousWeekSummary.position += row.position || 0;
  });

  // 평균값 계산
  currentWeekSummary.ctr = currentWeekSummary.ctr / currentWeekData.length;
  currentWeekSummary.position =
    (currentWeekSummary.position ?? 0) / currentWeekData.length;
  previousWeekSummary.ctr = previousWeekSummary.ctr / previousWeekData.length;
  previousWeekSummary.position =
    previousWeekSummary.position / previousWeekData.length;

  // 증감률 계산
  const changes = {
    clicks: (
      ((currentWeekSummary.clicks - previousWeekSummary.clicks) /
        previousWeekSummary.clicks) *
      100
    ).toFixed(1),
    impressions: (
      ((currentWeekSummary.impressions - previousWeekSummary.impressions) /
        previousWeekSummary.impressions) *
      100
    ).toFixed(1),
    ctr: (
      ((currentWeekSummary.ctr - previousWeekSummary.ctr) /
        previousWeekSummary.ctr) *
      100
    ).toFixed(1),
    position: (
      ((previousWeekSummary.position - currentWeekSummary.position) /
        previousWeekSummary.position) *
      100
    ).toFixed(1),
  };

  return {
    currentStartDate,
    currentEndDate,
    previousEndDate,
    previousStartDate,
    currentWeekSummary,
    previousWeekSummary,
    changes,
    searchConolseUrl,
    projectName,
  };
}

testSearchConsole();
