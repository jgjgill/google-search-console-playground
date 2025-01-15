import { IncomingWebhook } from "@slack/webhook";
import { testSearchConsole } from "./test";
import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL!);

async function sendWebhook() {
  try {
    const {
      currentEndDate,
      currentStartDate,
      previousEndDate,
      previousStartDate,
      currentWeekSummary,
      previousWeekSummary,
      changes,
      searchConolseUrl,
      projectName,
    } = await testSearchConsole();

    await webhook.send({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `📊 Search Console 주간 리포트 - ${projectName}`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🔍 <${searchConolseUrl}|Search Console에서 보기>`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*측정 기간*\n이번 주: ${currentStartDate.format(
              "YYYY-MM-DD"
            )} ~ ${currentEndDate.format(
              "YYYY-MM-DD"
            )}\n지난 주: ${previousStartDate.format(
              "YYYY-MM-DD"
            )} ~ ${previousEndDate.format("YYYY-MM-DD")}`,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*총 클릭수*\n이번 주: ${
                currentWeekSummary.clicks
              }회\n지난 주: ${previousWeekSummary.clicks}회\n변화량: ${
                changes.clicks
              }% ${Number(changes.clicks) > 0 ? "📈" : "📉"}`,
            },
            {
              type: "mrkdwn",
              text: `*총 노출수*\n이번 주: ${
                currentWeekSummary.impressions
              }회\n지난 주: ${previousWeekSummary.impressions}회\n변화량: ${
                changes.impressions
              }% ${Number(changes.impressions) > 0 ? "📈" : "📉"}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*평균 CTR*\n이번 주: ${(
                currentWeekSummary.ctr * 100
              ).toFixed(2)}%\n지난 주: ${(
                previousWeekSummary.ctr * 100
              ).toFixed(2)}%\n변화량: ${changes.ctr}% ${
                Number(changes.ctr) > 0 ? "📈" : "📉"
              }`,
            },
            {
              type: "mrkdwn",
              text: `*평균 검색순위*\n이번 주: ${currentWeekSummary.position.toFixed(
                1
              )}위\n지난 주: ${previousWeekSummary.position.toFixed(
                1
              )}위\n변화량: ${changes.position}% ${
                Number(changes.position) > 0 ? "⬆️" : "⬇️"
              }`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*평균 CTR*\n${(currentWeekSummary.ctr * 100).toFixed(
                2
              )}% (${changes.ctr}% ${Number(changes.ctr) > 0 ? "📈" : "📉"})`,
            },
            {
              type: "mrkdwn",
              text: `*평균 검색순위*\n${currentWeekSummary.position.toFixed(
                1
              )}위 (${changes.position}% ${
                Number(changes.position) > 0 ? "⬆️" : "⬇️"
              })`,
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🕒 생성: ${dayjs().tz().format("YYYY-MM-DD HH:mm:ss")}`,
            },
          ],
        },
      ],
    });

    console.log("Search Console 리포트가 성공적으로 전송되었습니다.");
  } catch (error) {
    console.error("메시지 전송 중 오류 발생:", error);
    throw error;
  }
}

sendWebhook();
