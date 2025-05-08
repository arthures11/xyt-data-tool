import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, of, timer, concat, interval } from 'rxjs';
import { map, shareReplay, tap, take, filter } from 'rxjs/operators';
import { OrderBookSnapshot, RawOrderBookEntry, OrderBookLevel } from '../models/order-book.model';

@Injectable({
    providedIn: 'root'
})
export class OrderBookService {
    private orderBookData$ = new BehaviorSubject<OrderBookSnapshot[]>([]);
    private currentSnapshotIndex$ = new BehaviorSubject<number>(0);
    private replaySubscription: Subscription | undefined;
    private isReplaying$ = new BehaviorSubject<boolean>(false);

    public readonly snapshots$: Observable<OrderBookSnapshot[]> = this.orderBookData$.asObservable();
    public readonly currentIndex$: Observable<number> = this.currentSnapshotIndex$.asObservable();
    public readonly replayState$: Observable<boolean> = this.isReplaying$.asObservable();


    public currentSnapshot$: Observable<OrderBookSnapshot | null> = this.currentIndex$.pipe(
        map(index => {
            const data = this.orderBookData$.getValue();
            return (data && data.length > index && index >= 0) ? data[index] : null;
        })
    );

    public totalSnapshots$: Observable<number> = this.orderBookData$.pipe(
        map(data => data.length)
    );

    public availableTimestamps$: Observable<string[]> = this.orderBookData$.pipe(
        map(data => data.map(snapshot => snapshot.Time))
    );

    constructor(private http: HttpClient) {
        this.loadOrderBookData().subscribe(data => {
            this.orderBookData$.next(data);
            if (data.length > 0) {
                this.currentSnapshotIndex$.next(0);
            }
        });
    }

    private loadOrderBookData(): Observable<OrderBookSnapshot[]> {
        return this.http.get<RawOrderBookEntry[]>('assets/data.json').pipe(
            map(rawData => {
                return rawData.map(rawEntry => {
                    const bids: OrderBookLevel[] = [];
                    const asks: OrderBookLevel[] = [];

                    for (let i = 1; i <= 10; i++) {
                        const bidPriceKey = `Bid${i}` as keyof RawOrderBookEntry;
                        const bidSizeKey = `Bid${i}Size` as keyof RawOrderBookEntry;
                        const askPriceKey = `Ask${i}` as keyof RawOrderBookEntry;
                        const askSizeKey = `Ask${i}Size` as keyof RawOrderBookEntry;

                        const bidPrice = rawEntry[bidPriceKey] as number;
                        const bidSize = rawEntry[bidSizeKey] as number;
                        if (bidPrice && bidSize) {
                            bids.push({ price: bidPrice, size: bidSize });
                        }

                        const askPrice = rawEntry[askPriceKey] as number;
                        const askSize = rawEntry[askSizeKey] as number;
                        if (askPrice && askSize) {
                            asks.push({ price: askPrice, size: askSize });
                        }
                    }
                    const parts = rawEntry.Time.split(/[:.]/); // time parsing, possibly needs some more handling in the fguture
                    const date = new Date();
                    date.setHours(parseInt(parts[0],10), parseInt(parts[1],10), parseInt(parts[2],10), parseInt(parts[3].substring(0,3),10)); // Using first 3 digits of microseconds for ms

                    return {
                        ...rawEntry,
                        Bids: bids,
                        Asks: asks,
                        timestampDate: date
                    };
                });
            }),
            shareReplay(1)
        );
    }

    selectSnapshotByIndex(index: number): void {
        const total = this.orderBookData$.getValue().length;
        if (index >= 0 && index < total) {
            this.currentSnapshotIndex$.next(index);
        }
    }

    selectSnapshotByTime(time: string): void {
        const index = this.orderBookData$.getValue().findIndex(s => s.Time === time);
        if (index !== -1) {
            this.currentSnapshotIndex$.next(index);
        }
    }

    nextSnapshot(): void {
        const currentIndex = this.currentSnapshotIndex$.getValue();
        const total = this.orderBookData$.getValue().length;
        if (currentIndex < total - 1) {
            this.currentSnapshotIndex$.next(currentIndex + 1);
        }
    }

    previousSnapshot(): void {
        const currentIndex = this.currentSnapshotIndex$.getValue();
        if (currentIndex > 0) {
            this.currentSnapshotIndex$.next(currentIndex - 1);
        }
    }

    startReplay(totalReplayDurationSeconds: number): void {
        this.stopReplay();
        this.isReplaying$.next(true);

        const snapshots = this.orderBookData$.getValue();
        if (snapshots.length < 2) {
            if (snapshots.length === 1) this.currentSnapshotIndex$.next(0);
            this.isReplaying$.next(false);
            return;
        }

        const firstTimestamp = snapshots[0].timestampDate.getTime();
        const lastTimestamp = snapshots[snapshots.length - 1].timestampDate.getTime();
        const originalTotalDurationMs = lastTimestamp - firstTimestamp;

        if (originalTotalDurationMs <= 0) {
            let idx = 0;
            this.currentSnapshotIndex$.next(idx);
            this.replaySubscription = interval(100).pipe(
                take(snapshots.length -1),
                tap(() => this.currentSnapshotIndex$.next(++idx))
            ).subscribe({
                complete: () => this.isReplaying$.next(false)
            });
            return;
        }

        const replayObservables: Observable<number>[] = [];
        replayObservables.push(of(0).pipe(tap(index => this.currentSnapshotIndex$.next(index))));

        for (let i = 0; i < snapshots.length - 1; i++) {
            const originalIntervalMs = snapshots[i + 1].timestampDate.getTime() - snapshots[i].timestampDate.getTime();
            const replayIntervalMs = Math.max(10, (originalIntervalMs / originalTotalDurationMs) * (totalReplayDurationSeconds * 1000)); // Min 10ms delay

            replayObservables.push(
                timer(replayIntervalMs).pipe(
                    map(() => i + 1),
                    tap(index => this.currentSnapshotIndex$.next(index))
                )
            );
        }

        this.replaySubscription = concat(...replayObservables).subscribe({
            complete: () => {
                this.isReplaying$.next(false);
                console.log('Replay finished');
            }
        });
    }

    stopReplay(): void {
        if (this.replaySubscription) {
            this.replaySubscription.unsubscribe();
            this.replaySubscription = undefined;
        }
        this.isReplaying$.next(false);
    }
}
