const chain = (_, actions) => actions.reduce((lastVal, currentVal, index) => actions[index](lastVal), _);

const replaceSpaces = _ => _.replace(/\s/g, '-');
const toLower = _ => _.toLowerCase();
const encodeUri = _ => encodeURIComponent(_);

class _Utils {
    makeUrlFriendly(str) {
        try {
            return chain(str, [
                replaceSpaces,
                toLower,
                encodeUri
            ]);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
}

export const StringUtils = new _Utils();