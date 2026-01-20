import {AsyncPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { InsDataList, InsDropdownDirective, InsOptGroup, InsOption, InsTextfield, InsWithDropdownOpen } from '@liuk123/insui';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool, ToolbarTools } from '../tool';
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
        {{ getHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-data-list>
                <ins-opt-group
                    *ngFor="let group of tableCommandTexts$ | async; let i = index"
                >
                    <!-- TODO: remove "magic" numbers i*2+@Directive({standalone: true, and make code more readable-->
                    <button
                        *ngFor="let item of group; let j = index"
                        insOption
                        type="button"
                        (click)="onTableOption(i * 2 + j)"
                    >
                        {{ item }}
                    </button>
                </ins-opt-group>
            </ins-data-list>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
})
export class InsAddRowTableButtonTool extends InsToolbarTool {
    protected readonly tableCommandTexts$ = inject(INS_EDITOR_TABLE_COMMANDS);

    protected override getDisableState(): boolean {
        return !(this.editor?.isActive('table') ?? false);
    }

    protected getIcon(icons: any): string {
        return icons.addRowTable;
    }

    protected getHint(texts?: ToolbarTools): string {
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
