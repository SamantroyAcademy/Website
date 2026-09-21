import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeed, pickVideos } from "./youtube-feed.ts";

const entry = (id: string, title: string, shorts: boolean, date: string) => `
  <entry>
    <id>yt:video:${id}</id>
    <yt:videoId>${id}</yt:videoId>
    <title>${title}</title>
    <link rel="alternate" href="https://www.youtube.com/${shorts ? `shorts/${id}` : `watch?v=${id}`}"/>
    <published>${date}</published>
  </entry>`;

const XML = `<?xml version="1.0"?><feed><title>Channel</title>
  ${entry("bFuMsOgzOBc", "Indian Airforce Final Result 2026 || A normal Boy Join &amp; Touch the Sky #airforce", false, "2026-09-20T10:00:00+00:00")}
  ${entry("cwzUqh6wAwo", "NDA VERY SIMILAR TEST", true, "2026-09-19T10:00:00+00:00")}
  ${entry("bad", "No valid id", false, "2026-09-18T10:00:00+00:00")}
  ${entry("LBftQPC6gYU", "", true, "2026-09-17T10:00:00+00:00")}
</feed>`;

test("parses ids, cleans titles, tells Shorts from videos", () => {
  const v = parseFeed(XML);
  assert.deepEqual(v.map((x) => x.id), ["bFuMsOgzOBc", "cwzUqh6wAwo", "LBftQPC6gYU"]);
  assert.equal(v[0].title, "Indian Airforce Final Result 2026: A normal Boy Join & Touch the Sky");
  assert.equal(v[0].short, false);
  assert.equal(v[1].short, true);
  assert.equal(v[2].title, "Samantroy Academy video", "an empty title gets a fallback");
  assert.equal(v[0].published, "2026-09-20T10:00:00+00:00");
});

test("pickVideos hides, filters by kind and caps", () => {
  const v = parseFeed(XML);
  assert.deepEqual(pickVideos(v, ["cwzUqh6wAwo"]).map((x) => x.id), ["bFuMsOgzOBc", "LBftQPC6gYU"]);
  assert.deepEqual(pickVideos(v, [], 12, "short").map((x) => x.id), ["cwzUqh6wAwo", "LBftQPC6gYU"]);
  assert.deepEqual(pickVideos(v, [], 12, "video").map((x) => x.id), ["bFuMsOgzOBc"]);
  assert.equal(pickVideos(v, [], 1).length, 1);
});

test("garbage in, nothing out", () => {
  assert.deepEqual(parseFeed("<html>not a feed</html>"), []);
});
