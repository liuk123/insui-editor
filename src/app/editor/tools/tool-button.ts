import {Directive, signal} from '@angular/core';
import { InsButton, insButtonOptionsProvider } from '@liuk123/insui';

@Directive({
    standalone: true,
    providers: [
        insButtonOptionsProvider({
            size: 'm',
            appearance: 'icon',
        }),
    ],
    hostDirectives: [
        {
            directive: InsButton,
            inputs: ['size'],
        },
    ],
    host: {
        insItem: '',
        insToolbarTool: '',
        insIconButton: '',
        type: 'button',
        '[attr.disabled]': 'disabled() ? "disabled" : null',
    },
})
export class InsToolbarButtonTool {
    public readonly disabled = signal<boolean>(false);
}
