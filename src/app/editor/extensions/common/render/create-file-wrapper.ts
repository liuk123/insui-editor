import { createFileNameWithIcon } from "./create-filename-icon";

export const createFileBlockWrapper: (element: {dom: HTMLElement}, attrs: Record<string, unknown>) => {dom: HTMLElement; destroy?: () => void} = (
  element: {dom: HTMLElement},
  attrs: Record<string, unknown>,
)=>{
  const wrapper = document.createElement("div");
  wrapper.className = "file-block-wrapper";

  const ret: { dom: HTMLElement; destroy?: () => void } = { dom: wrapper };
  if(attrs['data-show-showPreview'] === 'false' || !element){
    const fileNameWithIcon = createFileNameWithIcon(attrs);
    wrapper.appendChild(fileNameWithIcon.dom);
    ret.destroy = ()=>{
      fileNameWithIcon.destroy?.();
    }
  } else {
    wrapper.appendChild(element.dom);
  }

  // if(attrs['data-caption']){
  //   const caption = document.createElement("p");
  //   caption.className = 'file-caption';
  //   caption.textContent = attrs['data-caption'] as string;
  //   wrapper.appendChild(caption);
  // }
  return ret;
}
