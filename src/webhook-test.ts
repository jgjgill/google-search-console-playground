import { schema, testSearchConsole } from "./test";
import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { WebClient } from "@slack/web-api";

dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const SEO_ISSUE_CHANNEL_ID = "C073VSQQNF8";

const web = new WebClient(process.env.SLACK_USER_OAUTH_TOKEN!);

async function sendWebhook() {
  try {
    // schema에서 각 서비스별로 처리
    for (const service of schema) {
      // 서비스 이름으로 메인 메시지 생성
      const result = await web.chat.postMessage({
        channel: SEO_ISSUE_CHANNEL_ID,
        text: `주간 지표 - ${service.serviecName}`,
      });

      // 해당 서비스의 모든 프로젝트 데이터를 병렬로 처리
      for (const project of service.projects) {
        const searchConsoleData = await testSearchConsole({
          clientEmail: service.clientEmail,
          privateKey: service.privateKey,
          siteUrl: project.siteUrl,
          searchConsoleUrl: project.searchConsoleUrl,
          projectName: project.projectName,
          serviceName: service.serviecName,
        });

        // 각 프로젝트의 데이터를 스레드 답글로 전송
        await web.chat.postMessage({
          channel: SEO_ISSUE_CHANNEL_ID,
          thread_ts: result.ts,
          text: "프로젝트 지표",
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `📊 Search Console 주간 리포트 - ${searchConsoleData.projectName}`,
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🔍 <${searchConsoleData.searchConsoleUrl}|Search Console에서 보기>`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*측정 기간*\n이번 주: ${searchConsoleData.currentStartDate.format(
                  "YYYY-MM-DD"
                )} ~ ${searchConsoleData.currentEndDate.format(
                  "YYYY-MM-DD"
                )}\n지난 주: ${searchConsoleData.previousStartDate.format(
                  "YYYY-MM-DD"
                )} ~ ${searchConsoleData.previousEndDate.format("YYYY-MM-DD")}`,
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*총 클릭수*\n이번 주: ${
                    searchConsoleData.currentWeekSummary.clicks
                  }회\n지난 주: ${
                    searchConsoleData.previousWeekSummary.clicks
                  }회\n변화량: ${searchConsoleData.changes.clicks}% ${
                    Number(searchConsoleData.changes.clicks) > 0 ? "📈" : "📉"
                  }`,
                },
              ],
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*총 노출수*\n이번 주: ${
                    searchConsoleData.currentWeekSummary.impressions
                  }회\n지난 주: ${
                    searchConsoleData.previousWeekSummary.impressions
                  }회\n변화량: ${searchConsoleData.changes.impressions}% ${
                    Number(searchConsoleData.changes.impressions) > 0
                      ? "📈"
                      : "📉"
                  }`,
                },
              ],
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*평균 CTR*\n이번 주: ${(
                    searchConsoleData.currentWeekSummary.ctr * 100
                  ).toFixed(2)}%\n지난 주: ${(
                    searchConsoleData.previousWeekSummary.ctr * 100
                  ).toFixed(2)}%\n변화량: ${searchConsoleData.changes.ctr}% ${
                    Number(searchConsoleData.changes.ctr) > 0 ? "📈" : "📉"
                  }`,
                },
              ],
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*평균 검색순위*\n이번 주: ${searchConsoleData.currentWeekSummary.position.toFixed(
                    1
                  )}위\n지난 주: ${searchConsoleData.previousWeekSummary.position.toFixed(
                    1
                  )}위\n변화량: ${searchConsoleData.changes.position}% ${
                    Number(searchConsoleData.changes.position) > 0 ? "⬆️" : "⬇️"
                  }`,
                },
              ],
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `🕒 생성: ${dayjs()
                    .tz()
                    .format("YYYY-MM-DD HH:mm:ss")}`,
                },
              ],
            },
          ],
        });
      }
    }

    console.log("Search Console 리포트가 성공적으로 전송되었습니다.");
  } catch (error) {
    console.error("메시지 전송 중 오류 발생:", error);
    throw error;
  }
}

sendWebhook();
