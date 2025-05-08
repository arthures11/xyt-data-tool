import { Component, OnDestroy } from '@angular/core';
import { OrderBookService } from '../../services/order-book.service';
import { Observable, Subscription } from 'rxjs';
import { OrderBookSnapshot } from '../../models/order-book.model';
import { map } from 'rxjs/operators';
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-time-navigation',
  standalone: false,
  templateUrl: './time-navigation.component.html',
  styleUrl: './time-navigation.component.css'
})
export class TimeNavigationComponent implements OnDestroy {
  currentSnapshot$: Observable<OrderBookSnapshot | null>;
  currentIndex$: Observable<number>;
  totalSnapshots$: Observable<number>;
  availableTimestamps$: Observable<string[]>;
  isReplaying$: Observable<boolean>;

  isAtStart$: Observable<boolean>;
  isAtEnd$: Observable<boolean>;

  private subscriptions: Subscription = new Subscription();
  replayDurationSeconds: number = 30;


  constructor(public orderBookService: OrderBookService) {
    this.currentSnapshot$ = this.orderBookService.currentSnapshot$;
    this.currentIndex$ = this.orderBookService.currentIndex$;
    this.totalSnapshots$ = this.orderBookService.totalSnapshots$;
    this.availableTimestamps$ = this.orderBookService.availableTimestamps$;
    this.isReplaying$ = this.orderBookService.replayState$;

    this.isAtStart$ = this.currentIndex$.pipe(map(index => index === 0));
    this.isAtEnd$ = this.currentIndex$.pipe(
        map(index => index >= (this.orderBookService.snapshots$.source as any).value.length - 1)
    );
  }

  previous(): void {
    this.orderBookService.previousSnapshot();
  }

  next(): void {
    this.orderBookService.nextSnapshot();
  }

  selectTime(event: Event): void {
    const selectedTime = (event.target as HTMLSelectElement).value;
    this.orderBookService.selectSnapshotByTime(selectedTime);
  }

  toggleReplay(): void {
    if ((this.isReplaying$.source as any).value) {
      this.orderBookService.stopReplay();
    } else {
      this.orderBookService.startReplay(this.replayDurationSeconds);
    }
  }

  stopReplay(): void {
    this.orderBookService.stopReplay();
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.orderBookService.stopReplay();
  }
}
