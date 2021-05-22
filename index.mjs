import Apify from "apify";
import { parseHTML } from "linkedom";
import fetch from "node-fetch";
import postmark from "postmark";

Apify.main(async () => {
  const { postmarkToken, toEmail } = (await Apify.getInput()) ?? {};

  const requestList = await Apify.openRequestList(null, [
    { url: "https://www.dji.com/cz/downloads/djiapp/dji-fly" },
  ]);

  const kvStore = await Apify.openKeyValueStore("dji-fly-version");
  const prevVersion = await kvStore.getValue("current");

  const crawler = new Apify.BasicCrawler({
    requestList,
    async handleRequestFunction({ request, session, crawler }) {
      const resp = await fetch(request.url);
      const { document } = parseHTML(await resp.text());
      const currentVersion = document.querySelector(
        "[data-ga-label=android]+.method-title"
      ).textContent;

      if (currentVersion === prevVersion) return;
      Apify.utils.log.info("New version found", { currentVersion });

      const promises = [];
      promises.push(kvStore.setValue("current", currentVersion));

      const downloadURL = document
        .querySelector("a[data-ga-label=android]")
        .getAttribute("href");
      const betaURL = Array.from(document.querySelectorAll("a[href]"))
        .filter((x) => x.textContent === "Android 12 Beta")
        .map((x) => x.getAttribute("href"))
        .pop();

      const client = new postmark.ServerClient(postmarkToken);
      promises.push(
        client.sendEmail({
          From: "noreply@rarous.net",
          To: toEmail,
          Subject: "New version of DJI Fly app",
          TextBody: `New version ${currentVersion} available at ${request.url}`,
          HtmlBody: `Hello,

        <p>There is a new version of DJI Fly app ${currentVersion}. You can check it on ${
            request.url
          } or directly 
        <a href="${downloadURL}">download APK</a>.
        
        ${
          betaURL
            ? `<p>If you are looking for an Android 12 Beta build <a href="${betaURL}">download APK</a>`
            : ""
        }
        
        <p>Have a nice day
        `,
          MessageStream: "outbound",
        })
      );

      await Promise.allSettled(promises);
    },
  });

  await crawler.run();
});
