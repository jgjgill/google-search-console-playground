import { google } from "googleapis";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;
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
  const currentEndDate = dayjs().tz().subtract(3, "day");
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
