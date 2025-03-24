import { IS_YA_BROWSER, } from "@/lib/core";

const ErrorCause = {
  UNSUPPORTED_BROWSER: "Unsupported browser",
  UNSUPPORTED_VERSION: "Unsupported browser version"
};

const MIN_VERSIONS = {
  chrome: 80,
  firefox: 70,
  safari: 13,
  edge: 80,
  opera: 67
};

function checkBrowserVersion() {
  // // Retrieve the browser information
  // const { name, version } = getBrowserInfo();
  // const browserName = name.toLowerCase();

  // // Verify if the browser is part of our supported list and check its version
  // if (MIN_VERSIONS[browserName] !== undefined) {
  //   if (parseInt(version, 10) < MIN_VERSIONS[browserName]) {
  //     throw new Error(
  //       `${ErrorCause.UNSUPPORTED_VERSION} for ${name}: minimum version is ${MIN_VERSIONS[browserName]}`,
  //       {
  //         cause: `Your ${name} version ${version} does not meet the minimum required version ${MIN_VERSIONS[browserName]}.`
  //       }
  //     );
  //   }
  // } else {
  //   // Optionally handle cases for browsers not explicitly listed
  //   console.warn(`Browser ${name} is not explicitly supported. Proceed with caution.`);
  // }
}

export default function () {
  if (IS_YA_BROWSER) {
    throw new Error(`${ErrorCause.UNSUPPORTED_BROWSER}: Yandex`, {
      cause: "Yandex Browser is limited and unavailable due to regional restrictions."
    });
  }

  checkBrowserVersion();
}
