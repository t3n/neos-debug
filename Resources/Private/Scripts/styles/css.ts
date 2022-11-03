import createEmotion from '@emotion/css/create-instance';

const styleContainer = document.createElement('div');

const emotionInstance = createEmotion({ key: 'neos-debug', container: styleContainer });
const css = emotionInstance.css;

export { css, styleContainer };
