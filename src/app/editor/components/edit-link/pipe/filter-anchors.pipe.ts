import {Pipe, type PipeTransform} from '@angular/core';

@Pipe({
    standalone: true,
    name: 'insFilterAnchors',
})
export class InsFilterAnchorsPipe implements PipeTransform {
    public transform(anchors: string[], prefix: string, currentUrl: string): string[] {
        return prefix === '#'
            ? anchors.filter((anchor) => anchor !== currentUrl)
            : anchors;
    }
}
