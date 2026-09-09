// directives/resizable.js
export default {
  mounted(el) {
    const resizer = document.createElement('div');
    resizer.style.width = '5px';
    resizer.style.height = '100%';
    resizer.style.position = 'absolute';
    resizer.style.right = '0';
    resizer.style.top = '0';
    resizer.style.cursor = 'col-resize';
    resizer.style.userSelect = 'none';
    resizer.style.zIndex = '1';

    el.style.position = 'relative';
    el.appendChild(resizer);

    let startX, startWidth;

    resizer.addEventListener('mousedown', (e) => {
      startX = e.pageX;
      startWidth = el.offsetWidth;

      const onMouseMove = (e) => {
        const newWidth = startWidth + (e.pageX - startX);
        el.style.width = newWidth + 'px';
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  },
};
