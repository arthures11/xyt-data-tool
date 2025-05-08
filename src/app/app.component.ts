import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Observable} from "rxjs";
import {OrderBookSnapshot} from "./models/order-book.model";
import {OrderBookService} from "./services/order-book.service";

@Component({
  selector: 'app-root',
  standalone:false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'xyt-data-tool';
  currentSnapshot$: Observable<OrderBookSnapshot | null>;

  constructor(private orderBookService: OrderBookService) {
    this.currentSnapshot$ = this.orderBookService.currentSnapshot$;
  }
}
