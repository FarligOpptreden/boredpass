const chain = (_, actions) =>
  actions.reduce((lastVal, _, index) => actions[index](lastVal), _);

const replaceSpaces = _ => _.replace(/\s/g, "-");
const replacePluses = _ => _.replace(/\+/g, "and");
const replaceAmpersands = _ => _.replace(/\&/g, "and");
const replacePercentages = _ => _.replace(/\%/g, "");
const replaceEqualses = _ => _.replace(/\=/g, "");
const replacePeriods = _ => _.replace(/\./g, "");
const toLower = _ => _.toLowerCase();
const encodeUri = _ => encodeURIComponent(_);

class _Utils {
  makeUrlFriendly(str) {
    try {
      return chain(str, [
        replaceSpaces,
        replacePluses,
        replaceAmpersands,
        replacePercentages,
        replaceEqualses,
        replacePeriods,
        toLower,
        encodeUri
      ]);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  generateColour(str) {
    let hash = 0;
    let saturation = 50;
    let lightness = 70;

    for (var i = 0; i < str.length; i++)
      hash = str.charCodeAt(i) + ((hash << 5) - hash);

    return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
  }
}

export const StringUtils = new _Utils();
