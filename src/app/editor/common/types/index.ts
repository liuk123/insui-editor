

import { InsEditorAttachedFile } from '../attached';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: { setIframe(options: { src: string }): ReturnType };
  }
  interface Commands<ReturnType> {
    figure: {
      /**
       * Add a figure element
       */
      setFigure: (options: {
        src: string;
        alt?: string;
        title?: string;
        caption?: string;
      }) => ReturnType;

      /**
       * Converts an image to a figure
       */
      imageToFigure: () => ReturnType;

      /**
       * Converts a figure to an image
       */
      figureToImage: () => ReturnType;
    };
  }
  // interface Commands<ReturnType> {
  //     imageEditor: {
  //         setEditableImage(imageConfigs: InsEditableImage): ReturnType;
  //         setImageLink(): ReturnType;
  //     };
  // }

  interface Commands<ReturnType> {
    fontColor: {
      /**
       * Set the font color
       */
      setFontColor(fontColor: string): ReturnType;
      /**
       * Unset the font color
       */
      unsetFontColor(): ReturnType;
    };
  }

  interface Commands<ReturnType> {
    details: {
      setDetails(): ReturnType;
      unsetDetails(): ReturnType;
    };
  }

  interface Commands<ReturnType> {
    group: {
      removeGroup(): ReturnType;
      setGroup(): ReturnType;
      setGroupHilite(color: string): ReturnType;
    };
  }

  interface Commands<ReturnType> {
    anchor: {
      removeAnchor(): ReturnType;
      setAnchor(id: string): ReturnType;
    };
  }

  interface Commands<ReturnType> {
    cellBackground: {
      setCellBackground(background: string): ReturnType;
      unsetCellBackground(): ReturnType;
    };
  }

  interface Commands<ReturnType> {
    cellAlign: {
      setCellAlign(align: 'left' | 'center' | 'right'): ReturnType;
      unsetCellAlign(): ReturnType;
      setCellVerticalAlign(align: 'top' | 'middle' | 'bottom'): ReturnType;
      unsetCellVerticalAlign(): ReturnType;
    };
  }

  interface Commands<ReturnType> {
    fileBlock: {
      setFileBlock(options: InsEditorAttachedFile): ReturnType;
    };
  }

  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize(fontSize: string): ReturnType;
      /**
       * Unset the font size
       */
      unsetFontSize(): ReturnType;
    };
    // textStyle: {
    //   /**
    //    * Remove spans without inline style attributes.
    //    * @example editor.commands.removeEmptyTextStyle()
    //    */
    //   removeEmptyTextStyle(): ReturnType;
    //   toggleTextStyle: (attributes?: TextStyleAttributes | undefined) => ReturnType;
    // };
  }

  // interface Commands<ReturnType> {
  //   backgroundColor: {
  //     /**
  //      * Set the background color
  //      */
  //     setBackgroundColor(backgroundColor: string): ReturnType;
  //     /**
  //      * Unset the background color
  //      */
  //     unsetBackgroundColor(): ReturnType;
  //   };
  // }

  interface Commands<ReturnType> {
    columnList: {
      /**
       * Add a column list
       */
      setColumns: (n: number) => ReturnType;
      /**
       * Remove the column list
       */
      unsetColumns: () => ReturnType;
    };
  }
}
