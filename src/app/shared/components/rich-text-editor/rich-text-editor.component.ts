import { Component, forwardRef, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
      <!-- Toolbar -->
      <div class="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
        <button type="button" (mousedown)="$event.preventDefault()" (click)="execCommand('bold')" [class.bg-gray-200]="isActive('bold')" class="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Bold">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="execCommand('italic')" [class.bg-gray-200]="isActive('italic')" class="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Italic">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="execCommand('underline')" [class.bg-gray-200]="isActive('underline')" class="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Underline">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
        </button>
        <div class="w-px h-6 bg-gray-300 mx-1"></div>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="execCommand('insertUnorderedList')" [class.bg-gray-200]="isActive('insertUnorderedList')" class="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Bullet List">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="execCommand('insertOrderedList')" [class.bg-gray-200]="isActive('insertOrderedList')" class="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Numbered List">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </button>
      </div>
      
      <!-- Editor Area -->
      <div 
        #editor
        contenteditable="true" 
        class="rich-text-content p-3 min-h-[150px] outline-none max-h-[300px] overflow-y-auto max-w-none text-gray-900"
        (input)="onInput()"
        (blur)="onTouched()">
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    [contenteditable]:empty:before {
      content: attr(placeholder);
      color: #9ca3af;
      pointer-events: none;
      display: block; /* For Firefox */
    }
  `]
})
export class RichTextEditorComponent implements ControlValueAccessor {
  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

  onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };

  disabled = false;

  execCommand(command: string, value: string = '') {
    document.execCommand(command, false, value);
    this.onInput();
    this.editor.nativeElement.focus();
  }

  isActive(command: string): boolean {
    return document.queryCommandState(command);
  }

  onInput() {
    const html = this.editor.nativeElement.innerHTML;
    this.onChange(html === '<br>' ? '' : html);
  }

  writeValue(value: string): void {
    if (this.editor) {
      this.editor.nativeElement.innerHTML = value || '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.editor) {
      this.editor.nativeElement.contentEditable = isDisabled ? 'false' : 'true';
    }
  }
}
