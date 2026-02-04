import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { InsDataList, InsDropdownDirective, InsLanguageEditor, InsOptGroup, InsOption, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { INS_EDITOR_TABLE_COMMANDS } from '../../common/i18n';

export const InsTableCommands = {
    InsertColumnBefore: 0,
    InsertColumnAfter: 1,
    InsertRowBefore: 2,
    InsertRowAfter: 3,
    DeleteColumn: 4,
    DeleteRow: 5,
} as const;

@Component({
    standalone: true,
    selector: 'button[insAddRowTableTool]',
    imports: [AsyncPipe, InsDataList, InsOptGroup, InsOption, InsTextfield],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-data-list>
                @for (group of tableCommandTexts$ | async; let i=$index; track i) {
                <ins-opt-group>
                    @for(item of group; let j = $index; track item){
                    <!-- TODO: remove "magic" numbers i*2+@Directive({standalone: true, and make code more readable-->
                    <button
                        insOption
                        type="button"
                        (click)="onTableOption(i * 2 + j)"
                    >
                        {{ item }}
                    </button>
                    }

                </ins-opt-group>
                }
            </ins-data-list>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
})
export class InsAddRowTableButtonTool extends InsToolbarTool {
    protected readonly tableCommandTexts$ = inject(INS_EDITOR_TABLE_COMMANDS);
    private readonly dropdown = inject(InsDropdownDirective);

    protected tem = viewChild(InsTextfieldDropdownDirective, {read: TemplateRef})
    private e = effect(()=>{
          this.dropdown.insDropdown = this.tem();
    })

    protected override getDisableState(): boolean {
        return !(this.editor?.isActive('table') ?? false);
    }

    protected getIcon(icons: any): string {
        return icons.addRowTable;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.rowsColumnsManaging ?? '';
    }

    protected onTableOption(command: number): void {
        const registry: Record<number, () => void> | null = {
            [InsTableCommands.InsertColumnAfter]: () => this.editor?.addColumnAfter(),
            [InsTableCommands.InsertColumnBefore]: () => this.editor?.addColumnBefore(),
            [InsTableCommands.InsertRowAfter]: () => this.editor?.addRowAfter(),
            [InsTableCommands.InsertRowBefore]: () => this.editor?.addRowBefore(),
            [InsTableCommands.DeleteColumn]: () => this.editor?.deleteColumn(),
            [InsTableCommands.DeleteRow]: () => this.editor?.deleteRow(),
        };

        registry[command]?.();
    }
}
