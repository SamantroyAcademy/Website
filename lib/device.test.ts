import test from "node:test";
import assert from "node:assert/strict";
import { isMobileOrTabletUA } from "./device.ts";

const UA = {
  androidPhone:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  androidTablet:
    "Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  ipadLegacy:
    "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
  // iPadOS 13+ claims to be a Mac; only touch support gives it away.
  ipadModern:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  windowsTouch:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Touch) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  mac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  linux:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

test("phones and tablets running Android or iOS get the call button", () => {
  assert.ok(isMobileOrTabletUA(UA.androidPhone, 5));
  assert.ok(isMobileOrTabletUA(UA.androidTablet, 5), "Android tablets count too");
  assert.ok(isMobileOrTabletUA(UA.iphone, 5));
  assert.ok(isMobileOrTabletUA(UA.ipadLegacy, 5));
});

test("an iPad pretending to be a Mac is caught by its touch support", () => {
  assert.ok(isMobileOrTabletUA(UA.ipadModern, 5), "iPadOS 13+ reports as Macintosh");
  assert.ok(!isMobileOrTabletUA(UA.mac, 0), "a real Mac reports no touch points");
});

test("desktops never get it — Windows touch laptops included", () => {
  assert.ok(!isMobileOrTabletUA(UA.windows, 0));
  assert.ok(!isMobileOrTabletUA(UA.windowsTouch, 10), "a Surface is still a desktop OS");
  assert.ok(!isMobileOrTabletUA(UA.mac, 0));
  assert.ok(!isMobileOrTabletUA(UA.linux, 0));
});

test("an unknown or empty user agent errs towards hiding the button", () => {
  assert.ok(!isMobileOrTabletUA(""));
  assert.ok(!isMobileOrTabletUA("something-unrecognised", 10));
});
