// Centralized affiliate link registry.
// Fill in your affiliate URLs — all matching vendor links on every page update automatically.
// No HTML edits needed: the script matches by vendor domain pattern.

const AFFILIATE_MAP = [
  { match: "reglyze.com",  affiliate: "" },  // Same program as PL
  { match: "secfix.com",  affiliate: "" },  // Same program as PL
  { match: "isms.online",  affiliate: "" },  // Same program as PL
  { match: "sprinto.com",  affiliate: "" },  // Same program as PL
  { match: "vanta.com",  affiliate: "" },  // Same program as PL
  { match: "complycloud.eu",  affiliate: "" },  // Same program as PL
  { match: "drata.com",  affiliate: "" },  // Same program as PL
  { match: "nordlayer.com",  affiliate: "" },  // Same program as PL
  { match: "1password.com",  affiliate: "" },  // Same program as PL
  { match: "bitwarden.com",  affiliate: "" },  // Same program as PL
  { match: "bitdefender.com",  affiliate: "" },  // Same program as PL
  { match: "acronis.com",  affiliate: "" },  // Same program as PL
];

document.addEventListener("DOMContentLoaded", function () {
  AFFILIATE_MAP.forEach(function (entry) {
    if (!entry.affiliate) return; // skip until affiliate URL is set
    document.querySelectorAll('a[href*="' + entry.match + '"]').forEach(function (el) {
      el.href = entry.affiliate;
    });
  });
});
