export const createFigureWithCaption = (
  target: {dom: HTMLElement, destroy?: () => void},
  caption: string,
) => {
  const figure = document.createElement("figure");
  const captionElement = document.createElement("figcaption");
  captionElement.textContent = caption;

  figure.appendChild(target.dom);
  figure.appendChild(captionElement);

  return { dom: figure, destroy: () => {target.destroy?.()} };
};
