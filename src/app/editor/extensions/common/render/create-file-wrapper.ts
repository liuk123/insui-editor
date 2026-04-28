import { createFileNameWithIcon } from "./create-filename-icon";

export const createFileBlockWrapper: (attrs: Record<string, unknown>) => {dom: HTMLElement; destroy?: () => void} = (
  attrs: Record<string, unknown>,
)=>{
  const wrapper = document.createElement("div");
  wrapper.className = "file-block-wrapper";

  const ret: { dom: HTMLElement; destroy?: () => void } = { dom: wrapper };
  const fileNameWithIcon = createFileNameWithIcon(attrs);
  wrapper.appendChild(fileNameWithIcon.dom);
  ret.destroy = ()=>{
    fileNameWithIcon.destroy?.();
  }
  return ret;
}
