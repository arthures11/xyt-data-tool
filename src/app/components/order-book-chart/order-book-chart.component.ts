import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { OrderBookSnapshot } from '../../models/order-book.model';

@Component({
  selector: 'app-order-book-chart',
  imports: [],
  templateUrl: './order-book-chart.component.html',
  styleUrl: './order-book-chart.component.css'
})
export class OrderBookChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() snapshot: OrderBookSnapshot | null = null;
  @Input() title: string = 'Limit Order Book';

  @ViewChild('orderBookCanvas') canvas: any;
  public chart: Chart | undefined;

  private readonly bidColor = 'rgba(0, 123, 255, 0.7)'; // Blue
  private readonly askColor = 'rgba(255, 159, 64, 0.7)'; // Orange
  private readonly gridColor = 'rgba(200, 200, 200, 0.2)';
  private readonly tickColor = 'rgba(100, 100, 100, 1)';


  constructor() { }

  ngAfterViewInit(): void {
    this.initializeChart();
    if (this.snapshot) {
      this.updateChartData(this.snapshot);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['snapshot'] && this.snapshot && this.chart) {
      this.updateChartData(this.snapshot);
    } else if (changes['snapshot'] && !this.snapshot && this.chart) {
      this.clearChartData();
    }
  }

  private getPriceDecimalPlaces(snapshot: OrderBookSnapshot): number {
    let maxDecimals = 2;
    if (!snapshot) return maxDecimals;

    const prices = [...snapshot.Bids.map(b => b.price), ...snapshot.Asks.map(a => a.price)];
    prices.forEach(price => {
      const decimalPart = (price.toString().split('.')[1] || '');
      if (decimalPart.length > maxDecimals) {
        maxDecimals = decimalPart.length;
      }
    });
    return Math.min(maxDecimals, 4);
  }


  private initializeChart(): void {
    if (!this.canvas) return;
    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Bids',
            data: [],
            backgroundColor: this.bidColor,
            borderColor: 'blue',
            borderWidth: 1,
            barPercentage: 1.0,
            categoryPercentage: 0.95,
          },
          {
            label: 'Asks',
            data: [], // Positive values
            backgroundColor: this.askColor,
            borderColor: 'orange',
            borderWidth: 1,
            barPercentage: 1.0,
            categoryPercentage: 0.95,
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            stacked: false,
            grid: {
              color: this.gridColor,
              //borderColor: this.tickColor,
              tickColor: this.tickColor,
              //drawBorder: true,
            },
            border:{
              display: true,
              color: this.tickColor,
            },
            ticks: {
              color: this.tickColor,
              font: { size: 10 }
            },
            title: {
              display: true,
              text: 'Price',
              color: this.tickColor,
              font: { weight: 'bold' }
            }
          },
          x: {
            stacked: false,
            grid: {
              color: this.gridColor,
              //borderColor: this.tickColor,
              tickColor: this.tickColor,
              //drawBorder: true,
            },
            border:{
              display: true,
              color: this.tickColor,
            },
            ticks: {
              callback: (value) => Math.abs(Number(value)),
              color: this.tickColor,
              font: { size: 10 }
            },
            title: {
              display: true,
              text: 'Size',
              color: this.tickColor,
              font: { weight: 'bold' }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: this.tickColor }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.x !== null) {
                  label += Math.abs(context.parsed.x).toLocaleString();
                }
                return label;
              }
            }
          },
          title: {
            display: true,
            text: this.title,
            font: { size: 16, weight: 'bold'},
            color: this.tickColor,
            padding: { top: 10, bottom: 20 }
          }
        }
      }
    };
    this.chart = new Chart(context, config);
  }

  private updateChartData(snapshot: OrderBookSnapshot): void {
    if (!this.chart || !snapshot) return;

    const priceLevels = new Set<number>();
    snapshot.Bids.forEach(b => priceLevels.add(b.price));
    snapshot.Asks.forEach(a => priceLevels.add(a.price));

    const sortedPriceLabelsNum = Array.from(priceLevels).sort((a, b) => b - a);
    const decimalPlaces = this.getPriceDecimalPlaces(snapshot);
    const yLabels = sortedPriceLabelsNum.map(p => p.toFixed(decimalPlaces));


    const bidData = sortedPriceLabelsNum.map(price => {
      const bid = snapshot.Bids.find(b => b.price === price);
      return bid ? -bid.size : null;
    });

    const askData = sortedPriceLabelsNum.map(price => {
      const ask = snapshot.Asks.find(a => a.price === price);
      return ask ? ask.size : null;
    });

    this.chart.data.labels = yLabels;
    this.chart.data.datasets[0].data = bidData;
    this.chart.data.datasets[1].data = askData;

    const maxAbsSize = Math.max(
        ...snapshot.Bids.map(b => b.size),
        ...snapshot.Asks.map(a => a.size),
        1 // non zero value for empty data must be handled
    );
    const xRange = maxAbsSize * 1.1;

    if (this.chart.options?.scales?.['x']) {
      this.chart.options.scales['x'].min = -xRange;
      this.chart.options.scales['x'].max = xRange;
    }
    if(this.chart.options?.plugins?.title) {
      this.chart.options.plugins.title.text = `${this.title} - ${snapshot.Time}`;
    }


    this.chart.update('none');
  }

  private clearChartData(): void {
    if (!this.chart) return;
    this.chart.data.labels = [];
    this.chart.data.datasets.forEach(dataset => dataset.data = []);
    if(this.chart.options?.plugins?.title) {
      this.chart.options.plugins.title.text = this.title;
    }
    this.chart.update('none');
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
