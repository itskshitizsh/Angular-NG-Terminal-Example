import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FunctionsUsingCSI, NgTerminal } from 'ng-terminal';
import { Subject } from 'rxjs';
import { Terminal } from 'xterm';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit  {

  readonly prompt = '\n' + FunctionsUsingCSI.cursorColumn(1) + 'shell> ';

  _rows: number;
  _cols: number;

  writeSubject = new Subject<string>();

  rowsControl = new FormControl();
  colsControl = new FormControl();
  inputControl = new FormControl();

  public apiMode: boolean = false;

  @ViewChild('term', {static: false}) child: NgTerminal;

  underlying: Terminal;
  keyInput: string;

  terminalCmd: string = '';

  write() {
    this.writeSubject.next(eval(`'${this.inputControl.value}'`));
  }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.underlying = this.child.underlying;
    this.underlying.options.fontSize = 20;
    this.child.write(this.prompt);
    this.child.onData().subscribe((input) => {
      if (input === '\r') { // Carriage Return (When Enter is pressed)
        // API Response
        this.child.write(FunctionsUsingCSI.cursorNextLine(0) + this.tryRunningCommandOnTerminal(this.terminalCmd));
        this.child.write(this.prompt);
        this.terminalCmd = ''
      } else if (input === '\u007f') { // Delete (When Backspace is pressed)
        if (this.child.underlying.buffer.active.cursorX > 6) {
          this.child.write('\b \b');
          if (this.terminalCmd.length > 0)
            this.terminalCmd = this.terminalCmd.substring(0, this.terminalCmd.length - 1);
        }
      } else if (input === '\u0003') { // End of Text (When Ctrl and C are pressed)
          this.child.write('^C');
          this.child.write(this.prompt);
      } else {
        this.child.write(input);
        this.terminalCmd = this.terminalCmd+input;
      }
    })
    this.rowsControl.valueChanges.subscribe(() => { this.updateRows() });
    this.colsControl.valueChanges.subscribe(() => { this.updateCols() });
    console.log("Value Now::"+this.terminalCmd);
    }

  updateRows(){
    if(this.apiMode)
      this.child.setRows(this.rowsControl.value);
    else
      this._rows = this.rowsControl.value;
  }

  updateCols(){
    if(this.apiMode)
      this.child.setCols(this.colsControl.value);
    else
      this._cols = this.colsControl.value;
  }

  onKeyInput(event: string) {
    this.keyInput = event;
  }
  
  get displayOptionForLiveUpdate() {
    return {rows: this.rowsControl.value, cols: this.colsControl.value};
  }
  
  tryRunningCommandOnTerminal(command: string) : string {
    return "ERROR: '"+command+"' not supported.";
  }
}
