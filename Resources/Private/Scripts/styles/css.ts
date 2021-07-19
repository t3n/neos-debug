import createEmotion from '@emotion/css/create-instance';

const styleContainer = document.createElement('div');

const { css } = createEmotion({ key: 'neos-debug', container: styleContainer });

export { css, styleContainer };
