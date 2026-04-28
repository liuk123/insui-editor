export const createLinkWithCaption = (
  target: {dom: HTMLElement, destroy?: () => void},
  caption: string,
) => {
  const wrapper = document.createElement("div");
  const fileCaption = document.createElement("p");
  fileCaption.textContent = caption;

  wrapper.appendChild(target.dom);
  wrapper.appendChild(fileCaption);

  return {
    dom: wrapper,
    destroy: () => {target.destroy?.()}
  };
};
